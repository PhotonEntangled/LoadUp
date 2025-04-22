/**
 * Service for parsing Excel files using xlsx library with AI-enhanced field mapping
 */

import * as XLSX from 'xlsx';
import { DocumentType, RawRowData, FieldMappingResult, SourceInfo, ShipmentConfidenceScore, LocationDetail } from 'types/shipment';
import { ExcelParseOptions, ParsedShipmentBundle, ProcessingError } from 'types/parser.types';
import { logger } from 'utils/logger';
import { openAIService } from 'services/ai/OpenAIService';
import { getStandardFieldOptions } from 'services/ai/schema-reference';
import { createShipmentFromRowData, buildShipmentItem } from 'services/excel/shipmentBuilder';
import { resolveAmbiguousLocation, createLocationDetailFromAddressFields } from 'services/excel/locationResolver';
import {
    preScanForOrigin,
    findHeaderRowIndex,
    normalizeHeaders,
    isEmptyRow,
    findNextNonEmptyRowIndex,
    isLikelyDataRow,
    extractStringField,
    extractNumericField,
    findActualKeyForStandardField
} from 'services/excel/parserUtils';
import { BASE_MAPPINGS, PICKUP_MAPPINGS, AREA_MAPPINGS } from './fieldMappings';
import { Worksheet } from 'exceljs'; // Keep if needed
import { detectAndCorrectSwappedFields } from './dataValidationUtils'; // IMPORT swap detection

// --- Interfaces defined locally within this service ---

// Restore DocumentTypeParserConfig interface definition
interface DocumentTypeParserConfig {
  mappings: Record<string, string>;
  options: {
    headerRowIndex: number;
    // Add other type-specific options here later if needed
  };
}

export interface InternalMappingDetail {
    originalHeader: string;
    mappedField: string; // standardField is stored here
    confidence: number;
    isAIMapped: boolean;
    needsReview: boolean;
    columnIndex: number;
}

// Restore HeaderMappingResultType interface definition
export interface HeaderMappingResultType {
    fieldMap: Record<string, { originalHeader: string; isAIMapped: boolean; confidence: number }>;
    detailedMapping: InternalMappingDetail[];
    fileName?: string;
    debugId?: string;
}

// --- Field Mappings ---
// Mappings are now imported from the dedicated file

// Combine mappings and options for specific document types
// Renamed from FIELD_MAPPINGS to PARSER_CONFIG
export const PARSER_CONFIG: Record<string, DocumentTypeParserConfig> = {
  [DocumentType.ETD_REPORT]: {
    mappings: {
      ...BASE_MAPPINGS,
      ...PICKUP_MAPPINGS,
      ...AREA_MAPPINGS,
      'TRANSPORTER': 'pickupWarehouseRaw',
    },
    options: {
      headerRowIndex: 2, // Header is on the 3rd row (0-based index)
    }
  },
  [DocumentType.OUTSTATION_RATES]: { // Using existing OUTSTATION_RATES type
    mappings: {
      ...BASE_MAPPINGS,
      ...PICKUP_MAPPINGS,
      ...AREA_MAPPINGS,
       // Explicitly map header variations seen in NIRO files
       'Pick up warehouse': 'pickupWarehouseRaw', // Map to intermediate field
       'Address Line 1 and 2': 'shipToAddress', // Map destination lines
       'State/ Province': 'shipToState',
       'Ship To Area': 'shipToCity', // Assuming area maps to city
       'status': 'status', // <-- CORRECTED MAPPING KEY TO LOWERCASE
       // Add other needed mappings...
    },
    options: {
      // Header row is complex in NIRO, often starts effectively around row 3
      // Let's use findHeaderRowIndex utility instead of hardcoding here.
      // Set a reasonable default, but findHeaderRowIndex should override.
      headerRowIndex: 2,
    }
  },
  [DocumentType.MOCK_STATUS_TEST]: { // <<< ADDED NEW CONFIG BLOCK
    mappings: {
      // Start with base mappings
      ...BASE_MAPPINGS,
      ...PICKUP_MAPPINGS,
      ...AREA_MAPPINGS,
      // Explicit mappings for ALL columns in the mock file header
      // (Copy keys from the mock file header, map to standard fields)
      'Pick up warehouse': 'pickupWarehouseRaw',
      'Load no': 'loadNumber',
      'Promised Ship Date': 'promisedShipDate',
      'Request Date': 'requestDate',
      'STATUS': 'status', // Explicit status mapping
      'Actual Delivery Date': 'actualDeliveryDate',
      'Order Number': 'orderNumber',
      'Order type': 'orderType',
      '2nd Item Number': 'secondaryItemNumber',
      'Description 1': 'description',
      'Lot Serial Number': 'lotSerialNumber',
      'Quantity Ordered': 'quantity',
      'UOM': 'uom',
      'Bin': 'bin',
      'Weight (KG)': 'weight',
      'Ship To Area': 'shipToCity',
      'Address Line 1 and 2': 'shipToAddress',
      'State/ Province': 'shipToState',
      'Contact Number': 'contactNumber',
      'PO NUMBER': 'poNumber',
      'Remark': 'remarks',
      'TRUCK DETAILS': 'truckDetails'
    },
    options: {
      headerRowIndex: 0, // Header is the very first row (0-based index)
    }
  },
  [DocumentType.UNKNOWN]: {
    mappings: {
     ...BASE_MAPPINGS, // Start with base for unknown
    },
    options: {
       headerRowIndex: 0, // Default for unknown types
    }
  }
};
// --- End Parser Config ---

// Default options for the parser service
const DEFAULT_PARSE_OPTIONS: ExcelParseOptions = {
    hasHeaderRow: true,
    headerRowIndex: 0,
    aiFieldMappingEnabled: false,
    aiMappingConfidenceThreshold: 0.7,
    documentType: DocumentType.UNKNOWN,
};

// --- Consts ---
const CONSECUTIVE_EMPTY_THRESHOLD = 5; // Stop parsing after this many consecutive empty rows
const MAX_HEADER_SCAN_ROWS = 15; // Max rows to scan for header block start
const MAX_HEADER_BLOCK_SIZE = 5; // Max consecutive rows allowed in a header block
const MANDATORY_HEADER_KEYWORDS = ['load no', 'order #', 'po number', 'ship date', 'transporter']; // Keywords to identify potential header start (lowercase)
const LOOKAHEAD_DISTANCE = 3; // How many rows to look ahead for data start
// ... other constants ...

// Define core keywords to identify potential header rows
const CORE_HEADER_KEYWORDS = [
    'load', 'order', 'shipment', 'date', 'weight', 'quantity', 'address',
    'customer', 'status', 'description', 'item', 'warehouse', 'number',
    'area', 'province', 'contact', 'remark', 'rate', 'total'
];
const MIN_HEADER_KEYWORDS = 5; // Minimum number of keywords to consider a line a header

/**
 * Service for parsing Excel files with AI-enhanced field mapping
 */
export class ExcelParserService {
  private logger = logger;

  constructor(private openAiService = openAIService) {}

  /**
   * Parses an Excel file buffer into an array of ParsedShipmentBundle objects.
   */
  async parseExcelFile(excelData: ArrayBuffer, options?: Partial<ExcelParseOptions>): Promise<ParsedShipmentBundle[]> {
    const mergedOptions: ExcelParseOptions = { ...DEFAULT_PARSE_OPTIONS, ...options };
    this.logger.info(`[ExcelParserService] Starting parseExcelFile. Buffer size: ${excelData.byteLength} bytes. Options: ${JSON.stringify(mergedOptions)}`);
    const bundles: ParsedShipmentBundle[] = [];

    try {
      const workbook = XLSX.read(excelData, { type: 'buffer', cellDates: true });
      // ---> INSTRUMENTATION: Log sheet names <----
      const sheetNames = workbook.SheetNames;
      this.logger.info(`[ExcelParser] Workbook loaded. Sheet names found: [${sheetNames.join(', ')}]`);

      // --- START: Multi-sheet processing loop ---
      for (const sheetName of sheetNames) { // Use logged sheetNames array
        // ---> INSTRUMENTATION: Log start of loop iteration <----
        this.logger.info(`[ExcelParser][Loop] Processing sheet: ${sheetName}`);

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          this.logger.warn(`[ExcelParser][Loop] Could not find sheet data for sheet name: ${sheetName}. Skipping.`);
          continue; // Skip to the next sheet
        }

        // ---> INSTRUMENTATION: Log before entering try block <----
        this.logger.debug(`[ExcelParser][Loop] Entering TRY block for sheet: ${sheetName}`);
        try {
          // Pass merged options to processSheet
          const sheetData: ParsedShipmentBundle[] = await this.processSheet(worksheet, sheetName, mergedOptions);
          bundles.push(...sheetData);
          // ---> INSTRUMENTATION: Log successful completion of try block body <----
          this.logger.debug(`[ExcelParser][Loop] Completed TRY block body for sheet: ${sheetName}. Pushed ${sheetData.length} bundles.`);
          this.logger.info(`[ExcelParser] Finished processing sheet ${sheetName}. Found ${sheetData.length} bundles. Total bundles so far: ${bundles.length}`);
        } catch (sheetError: any) {
          // ---> INSTRUMENTATION: Log entering catch block <----
          this.logger.error(`[ExcelParser][Loop] Entering CATCH block for sheet "${sheetName}"`);
          this.logger.error(`[ExcelParser] Error processing sheet "${sheetName}": ${sheetError.message}`, { stack: sheetError.stack });
          // Explicitly continue to the next sheet on error to ensure loop progresses
          this.logger.warn(`[ExcelParser][Loop] Continuing to next sheet after error in ${sheetName}.`);
          continue;
        }
        // ---> INSTRUMENTATION: Log successful iteration completion <----
        this.logger.debug(`[ExcelParser][Loop] Successfully completed iteration for sheet: ${sheetName}`);
      } // End loop through sheets
      // ---> INSTRUMENTATION: Log after loop completion <----
      this.logger.info(`[ExcelParser][Loop] Exited sheet processing loop.`);
      // --- END: Multi-sheet processing loop ---

      this.logger.info(`[ExcelParser] Finished processing all sheets. Total bundles parsed: ${bundles.length}`);
      return bundles;

    } catch (error: any) {
      // ---> INSTRUMENTATION: Log error in outer try/catch <----
      this.logger.error(`[ExcelParser] CRITICAL Error in parseExcelFile (outer catch): ${error.message}`, { stack: error.stack });
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // --- ADDED MISSING METHOD: getParserConfigForType ---
  private getParserConfigForType(docType: DocumentType | string): DocumentTypeParserConfig {
    return PARSER_CONFIG[docType] || PARSER_CONFIG[DocumentType.UNKNOWN];
  }
  // --- END ADDED METHOD ---

  // --- REPLACING STUBBED mapHeadersToStandardFields ---
  /**
   * Maps headers to standard fields using the provided type-specific mappings.
   * Adapted from reference implementation, focusing on direct mapping first.
   */
  private async mapHeadersToStandardFields(
      headers: string[],
      sampleDataRows: any[][], // Kept for potential future AI context
      options: ExcelParseOptions,
      typeSpecificMappings: Record<string, string> // Mappings for the specific document type
  ): Promise<HeaderMappingResultType> {
      const debugId = `mapping-${Date.now()}`;
      this.logger.info(`[ExcelParser.mapHeadersToStandardFields] Running mapping logic for debugId: ${debugId}`);

      const fieldMap: HeaderMappingResultType['fieldMap'] = {};
      const detailedMapping: InternalMappingDetail[] = [];
      const normalizedHeaders = normalizeHeaders(headers); // Use the utility

      // ---> START DEBUG LOGGING <---
      this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Input Headers: ${JSON.stringify(headers)}`);
      this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Normalized Headers: ${JSON.stringify(normalizedHeaders)}`);
      this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Type Specific Mappings Provided: ${JSON.stringify(typeSpecificMappings)}`);
      // ---> END DEBUG LOGGING <---

      normalizedHeaders.forEach((normHeader: string, index: number) => {
          if (!normHeader) {
              this.logger.debug(`[mapHeadersToStandardFields] Skipping empty normalized header at index ${index}`);
              return; // Skip empty normalized headers
          }

          const originalHeader = headers[index] || ''; // Get original header for reference

          // --- Start: Logic adapted from reference getStandardFieldName ---
          let mappedField: string | null = null;
          let confidence = 0.0;
          let isAIMapped = false;
          let needsReview = true;

          // 1. Direct Lookup (Case-insensitive on the mapping keys for flexibility)
          const lowerNormHeader = normHeader.toLowerCase();
          const mappingKeys = Object.keys(typeSpecificMappings);
          let directMatchKey = mappingKeys.find(key => key.toLowerCase() === lowerNormHeader);

          // ---> START DEBUG LOGGING <---
          this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Processing Index ${index}: Original="${originalHeader}", Normalized="${normHeader}", LowerNorm="${lowerNormHeader}"`);
          this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Attempting direct match for LowerNorm "${lowerNormHeader}". Mapping Keys: ${JSON.stringify(mappingKeys)}`);
          // ---> END DEBUG LOGGING <---

          // Try original header if normalized didn't match
          if (!directMatchKey && originalHeader) {
            const lowerOriginalHeader = originalHeader.toLowerCase();
            // ---> START DEBUG LOGGING <---
            this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] Normalized mismatch. Trying LowerOriginal="${lowerOriginalHeader}"`);
            // ---> END DEBUG LOGGING <---
             directMatchKey = mappingKeys.find(key => key.toLowerCase() === lowerOriginalHeader);
          }

          if (directMatchKey) {
              mappedField = typeSpecificMappings[directMatchKey];
              confidence = 1.0; // High confidence for direct map
              needsReview = false;
              isAIMapped = false;
              // ---> START DEBUG LOGGING <---
              this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] DIRECT MATCH FOUND: Key="${directMatchKey}", MappedField="${mappedField}"`);
              // ---> END DEBUG LOGGING <---
              // this.logger.debug(`[mapHeadersToStandardFields] Direct map found: "${originalHeader}" (Normalized: "${normHeader}") -> "${mappedField}"`); // Original log
          } else {
              // 2. No Direct Match - Placeholder for potential AI or fuzzy matching later
              // For now, map it based on the original header to capture the data, but flag for review.
              // Prepending 'misc_' to avoid potential clashes with standard fields.
              mappedField = `misc_${normHeader.replace(/[^a-zA-Z0-9_]/g, '_')}`; // Create a safe key
              confidence = 0.2; // Low confidence
              needsReview = true;
              isAIMapped = false; // Not AI mapped yet
              // ---> START DEBUG LOGGING <---
              this.logger.debug(`[mapHeadersToStandardFields Debug ${debugId}] NO DIRECT MATCH for Original="${originalHeader}"/Normalized="${normHeader}". Creating placeholder: "${mappedField}"`);
              // ---> END DEBUG LOGGING <---
              // this.logger.debug(`[mapHeadersToStandardFields] No direct map for: "${originalHeader}" (Normalized: "${normHeader}"). Mapping to placeholder "${mappedField}".`); // Original log
          }

          // --- End: Logic adapted from reference getStandardFieldName ---

          if (mappedField) { // Only add if we have some mapping (even placeholder)
             // Ensure mappedField doesn't overwrite an existing standard field mapped with higher confidence
             if (fieldMap[mappedField] && fieldMap[mappedField].confidence >= confidence) {
                this.logger.warn(`[mapHeadersToStandardFields] Skipping lower confidence mapping for "${mappedField}" from header "${originalHeader}". Existing confidence: ${fieldMap[mappedField].confidence}, New confidence: ${confidence}`);
             } else {
                fieldMap[mappedField] = { originalHeader, isAIMapped, confidence };
                detailedMapping.push({
                    originalHeader,
                    mappedField,
                    confidence,
                    isAIMapped,
                    needsReview,
                    columnIndex: index
                });
             }
          } else {
             this.logger.debug(`[mapHeadersToStandardFields] Header "${originalHeader}" at index ${index} resulted in no mapping.`);
          }
      });

      // AI Mapping section (kept structure, but logic remains disabled/stubbed for now)
      if (options.aiFieldMappingEnabled) {
          this.logger.warn("[mapHeadersToStandardFields] AI mapping requested but core logic not implemented in this version.");
          // TODO: Integrate AI logic here if needed in the future, potentially iterating
          // through detailedMapping where needsReview is true and confidence is low.
      }

      // Log the final mapping result for debugging
      this.logger.debug(`[mapHeadersToStandardFields] Final detailedMapping for debugId ${debugId}: ${JSON.stringify(detailedMapping)}`);


      return { fieldMap, detailedMapping, debugId };
  }
  // --- END REPLACED METHOD ---

  // --- ADDED MISSING METHOD: parseTxtRow ---
  /**
   * Parses a single line of text, assuming CSV-like structure.
   * Handles simple comma separation, basic quoting.
   * NOTE: This is a basic implementation and may not handle complex CSV cases.
   */
  private parseTxtRow(line: string): string[] {
      // Basic regex for CSV parsing (handles quoted fields)
      // Matches: fields separated by commas, allowing for fields enclosed in double quotes (which can contain commas)
      const regex = /("([^"]|"")*"|[^,]*)(,|$)/g;
      const fields: string[] = [];
      line.replace(regex, (match, field, quotedContent, separator) => {
          let value = field;
          if (value.startsWith('"') && value.endsWith('"')) {
              // Remove surrounding quotes and unescape double quotes inside
              value = value.slice(1, -1).replace(/""/g, '"');
          }
          fields.push(value.trim());
          return ''; // Necessary for replace to work correctly
      });
      // Handle trailing comma case where last field might be empty
      if (line.endsWith(',')) {
          fields.push('');
      }
      return fields;
  }
  // --- END ADDED METHOD ---

  // --- ADDED MISSING METHOD: convertRowToRawData ---
  /**
   * Converts a row array into a RawRowData object based on the header mapping.
   */
  private convertRowToRawData(rowArray: any[], headerMappingResult: HeaderMappingResultType): RawRowData {
    const rawData: RawRowData = {};
    headerMappingResult.detailedMapping.forEach((mapping: InternalMappingDetail) => {
        const { mappedField, columnIndex } = mapping;
        const rawValue = rowArray[columnIndex];
        // Convert null/undefined to empty string, ensure string type, trim whitespace
        rawData[mappedField] = rawValue !== null && rawValue !== undefined ? String(rawValue).trim() : '';
    });
    return rawData;
  }
  // --- END ADDED METHOD ---

  /**
   * Processes a single worksheet.
   */
  private async processSheet(
      worksheet: XLSX.WorkSheet,
      sheetName: string,
      options: ExcelParseOptions // Pass the full options object
  ): Promise<ParsedShipmentBundle[]> {
      this.logger.info(`[ExcelParser.processSheet] Processing sheet: ${sheetName} with options: ${JSON.stringify(options)}`);
      const bundles: ParsedShipmentBundle[] = [];
      const processingErrors: ProcessingError[] = [];

      const sheetDataAoA_raw: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false });
      // Filter out completely empty rows first
      const sheetDataAoA_filtered = sheetDataAoA_raw.filter(row => !isEmptyRow(row));

      if (sheetDataAoA_filtered.length === 0) {
          this.logger.warn(`[ExcelParser.processSheet] Sheet "${sheetName}" contains no data after filtering empty rows.`);
          return [];
      }

      // ---> START: New Multi-Line Header Detection Logic (incorporating helpers) <----
      let headerRows: any[][] = [];
      let combinedHeaders: string[] = []; // Keep track of combined headers *during* block detection for context
      let dataStartIndex: number = 0;
      let potentialHeaderStartIndex = -1;

      try {
          const jsonData = sheetDataAoA_filtered; // Use filtered data
          
          // Find the effective header row index (using utility)
          // REMOVED extra arguments from findHeaderRowIndex call
          let headerRowStartIndex = findHeaderRowIndex(
              jsonData, 
              options.documentType, // Pass document type if available
              MAX_HEADER_SCAN_ROWS
          );
          if (headerRowStartIndex === -1) {
               this.logger.warn(`[ExcelParser.processSheet] Could not find a suitable header row via keyword scan. Falling back to index ${options.headerRowIndex}.`);
               headerRowStartIndex = options.headerRowIndex || 0;
          }

          // 2. If potential start found, identify the block using refined heuristic
          if (headerRowStartIndex !== -1) {
              headerRows.push(sheetDataAoA_filtered[headerRowStartIndex]); // Add the starting row
              let lastHeaderRowIndex = headerRowStartIndex;

              // --- Helper to update combinedHeaders based on current headerRows ---
              const updateCombinedHeaders = () => {
                  combinedHeaders = []; // Reset
                  if (headerRows.length === 0) return;
                  const maxCols = Math.max(...headerRows.map(r => r.length));
                  for (let col = 0; col < maxCols; col++) {
                      let columnValues: string[] = [];
                      for (let rowIndex = 0; rowIndex < headerRows.length; rowIndex++) {
                          const cellValue = String(headerRows[rowIndex][col] || '').trim();
                          if (cellValue) columnValues.push(cellValue);
                      }
                      combinedHeaders.push(columnValues.join(' ').trim());
                  }
                  while (combinedHeaders.length > 0 && combinedHeaders[combinedHeaders.length - 1] === '') combinedHeaders.pop();
              };
              // --- End Helper ---

              updateCombinedHeaders(); // Initial combined headers from the first row

              // --- START REPLACEMENT LOOP ---
              // Loop to check subsequent rows for inclusion in the header block
              for (let i = headerRowStartIndex + 1; i < Math.min(headerRowStartIndex + MAX_HEADER_BLOCK_SIZE, jsonData.length); i++) {
                  const rowArray = jsonData[i] || [];
                  const rowStr = rowArray.map(cell => String(cell || '').trim()).filter(Boolean);
                  this.logger.debug(`[ExcelParser.processSheet] Checking row ${i}. Keyword count: ${rowStr.filter(s => CORE_HEADER_KEYWORDS.some(k => s.toLowerCase().includes(k))).length} (Threshold: ${MIN_HEADER_KEYWORDS})`);
                  
                  // --- CORRECTED CALL to isLikelyDataRow --- 
                  // Stop if the row looks more like data OR if it doesn't meet keyword threshold
                  if (isLikelyDataRow(rowArray, combinedHeaders) || // Pass current row and combined headers 
                      rowStr.filter(s => CORE_HEADER_KEYWORDS.some(k => s.toLowerCase().includes(k))).length < MIN_HEADER_KEYWORDS) 
                  { 
                      this.logger.debug(`[ExcelParser.processSheet] Row ${i} looks like data or fails keyword check. Header block ends here.`);
                      break; // Stop adding header rows
                  } else {
                       this.logger.debug(`[ExcelParser.processSheet] Row ${i} added to header block based on keyword count.`);
                       headerRows.push(rowArray);
                       lastHeaderRowIndex = i;
                       updateCombinedHeaders(); // Update combined headers for context if needed
                  }
                  // --- END CORRECTED LOGIC ---
              }
              // --- END REPLACEMENT LOOP ---

              dataStartIndex = lastHeaderRowIndex + 1;
              this.logger.info(`[ExcelParser.processSheet] Identified header block from index ${headerRowStartIndex} to ${lastHeaderRowIndex}. Data starting at index ${dataStartIndex}.`);
              this.logger.info(`[ExcelParser.processSheet] Final Combined headers (${combinedHeaders.length}): ${JSON.stringify(combinedHeaders)}`);

              // Final check: Ensure combinedHeaders isn't empty if headerRows were found
              if(headerRows.length > 0 && combinedHeaders.length === 0) {
                  this.logger.warn("[ExcelParser.processSheet] Header rows were identified, but combined headers ended up empty. Re-running combination.");
                  updateCombinedHeaders(); // Run one last time
              }

          } else {
              // No header keywords found (Fallback logic - same as before)
              this.logger.warn(`[ExcelParser.processSheet] No mandatory keywords found in first ${MAX_HEADER_SCAN_ROWS} rows. Assuming header is row 0.`);
              if (sheetDataAoA_filtered.length > 0) {
                 headerRows.push(sheetDataAoA_filtered[0]);
                 combinedHeaders = sheetDataAoA_filtered[0].map(h => h ? String(h).trim() : '');
                 dataStartIndex = 1;
              } else {
                 this.logger.error("[ExcelParser.processSheet] Sheet data is empty after filtering, cannot determine headers.");
                 return [];
              }
          }

      } catch (headerError: any) {
          this.logger.error(`[ExcelParser.processSheet] Error during multi-line header detection for sheet "${sheetName}": ${headerError.message}`, { stack: headerError.stack });
          processingErrors.push({ message: `Header detection failed: ${headerError.message}`, severity: 'critical' });
          return []; // Cannot proceed without headers
      }

      // Ensure dataStartIndex is valid
      if (dataStartIndex >= sheetDataAoA_filtered.length) {
         this.logger.warn(`[ExcelParser.processSheet] Calculated dataStartIndex ${dataStartIndex} is beyond the number of rows (${sheetDataAoA_filtered.length}). No data rows to process.`);
         // We might have headers but no data, which is valid. Proceed but expect 0 bundles.
         dataStartIndex = sheetDataAoA_filtered.length; // Adjust to avoid slice errors
      }
      // ---> END: Updated Multi-Line Header Detection Logic <----


      // 4. Extract Effective Headers (Uses final combinedHeaders - logic unchanged)
      const effectiveHeaders = combinedHeaders;
      this.logger.debug(`[ExcelParser.processSheet] Effective headers used for mapping: ${JSON.stringify(effectiveHeaders)}`);

      // 5. Determine Data Rows (Now uses calculated dataStartIndex)
      const dataRows = sheetDataAoA_filtered.slice(dataStartIndex); // NEW (Uses calculated startIndex)

      this.logger.debug(`[ExcelParser] Sheet "${sheetName}" - Headers identified: ${effectiveHeaders.join(', ')}`);
      this.logger.debug(`[ExcelParser] Sheet "${sheetName}" - Number of data rows: ${dataRows.length}`);

      // 6. Map Headers to Standard Fields (Uses effectiveHeaders which are now combined)
      let headerMappingResult: HeaderMappingResultType;
      try {
          const docType = options.documentType || DocumentType.UNKNOWN; // Determine doc type once
          const typeConfig = this.getParserConfigForType(docType);
          const typeSpecificMappings = typeConfig.mappings;

          this.logger.debug(`[PROCESS_SHEET_PRE_AWAIT] Calling mapHeadersToStandardFields for sheet ${sheetName} with ${effectiveHeaders.length} headers. DocType used for config: ${docType}`);
          headerMappingResult = await this.mapHeadersToStandardFields(
              effectiveHeaders, // Pass the combined headers
              dataRows.slice(0, 5),
              options,
              typeSpecificMappings
          );
          this.logger.debug(`[PROCESS_SHEET_POST_AWAIT] Received headerMappingResult. detailedMapping length: ${headerMappingResult.detailedMapping?.length || 0}. debugId: ${headerMappingResult.debugId}`);
      } catch (mappingError: any) {
          this.logger.error(`[ExcelParser.processSheet] Error during header mapping for sheet "${sheetName}": ${mappingError.message}`, { stack: mappingError.stack });
          // Decide whether to continue with potentially bad mapping or stop
          // For now, let's create a dummy result to allow processing to continue with misc fields
          headerMappingResult = {
              fieldMap: {},
              detailedMapping: effectiveHeaders.map((h, i) => ({
                  originalHeader: h,
                  mappedField: `misc_${normalizeHeaders([h])[0]}`,
                  confidence: 0,
                  isAIMapped: false,
                  needsReview: true,
                  columnIndex: i
              }))
          };
      }
      this.logger.info(`[ExcelParser] Header mapping completed for sheet "${sheetName}". debugId: ${headerMappingResult.debugId}. Mapped fields count: ${Object.keys(headerMappingResult.fieldMap || {}).length}`);
      this.logger.debug(`[ExcelParser.processSheet] Header Mapping Detailed Result for ${sheetName} (Before Passing): ${JSON.stringify(headerMappingResult.detailedMapping)}`);

      // Add fileName to headerMappingResult if available in options
      if(options.fileName) {
        headerMappingResult.fileName = options.fileName;
      }

      // 7. Process Data Rows using the mapping
      const potentialSheetOrigin = await preScanForOrigin(sheetDataAoA_filtered, 10); // Scan top rows
      const sheetBundles = await this._processDataRows(
        dataRows,
        effectiveHeaders, // Pass the headers used for mapping
        headerMappingResult, // Pass the result of the mapping
        sheetName,
        dataStartIndex, // Pass the original index where data started
        options,
        potentialSheetOrigin
      );
      bundles.push(...sheetBundles);

      // Add any sheet-level processing errors to the first bundle if needed
      // ... (logic depends on how critical errors should be surfaced)
      if(processingErrors.length > 0 && bundles.length > 0) {
          // ---> FIX Error assignment (Map ProcessingError {message} to string message) <---
          const existingErrors: string[] = bundles[0].metadata.processingErrors || [];
          // Extract only the message string from the collected processingErrors
          const newErrorMessages: string[] = processingErrors.map(err => err.message || String(err));
          bundles[0].metadata.processingErrors = [...existingErrors, ...newErrorMessages];
      }

      return bundles;
  }

  // --- ADD HELPER: _isLikelyHeaderRow ---
  private _isLikelyHeaderRow(rowArray: string[]): boolean {
      if (isEmptyRow(rowArray)) {
          return false;
      }
      let keywordMatches = 0;
      // Use a Set for efficient lookup
      const keywordSet = new Set(CORE_HEADER_KEYWORDS);

      rowArray.forEach(cell => {
          const cellStr = String(cell || '').toLowerCase().trim();
          // Check if any part of the cell string matches a keyword
          // This is intentionally broad to catch variations
          if (cellStr && keywordSet.has(cellStr)) { // Check for exact keyword match first
              keywordMatches++;
          } else if (cellStr) {
              // Check if any keyword is a substring of the cell content
              for (const keyword of keywordSet) {
                  if (cellStr.includes(keyword)) {
                      keywordMatches++;
                      break; // Count first match per cell
                  }
              }
          }
      });

      const isHeader = keywordMatches >= MIN_HEADER_KEYWORDS;
      if (isHeader) {
        this.logger.debug(`[_isLikelyHeaderRow] Row identified as potential header (Matches: ${keywordMatches}): ${JSON.stringify(rowArray)}`);
      }
      return isHeader;
  }
  // --- END HELPER ---

  async parseTextFile(content: string, options?: Partial<ExcelParseOptions>): Promise<ParsedShipmentBundle[]> {
    const mergedOptions: ExcelParseOptions = { ...DEFAULT_PARSE_OPTIONS, ...options, documentType: options?.documentType || DocumentType.UNKNOWN }; // Ensure doc type is set
    const allBundles: ParsedShipmentBundle[] = [];
    const processingErrors: ProcessingError[] = []; // Collect errors across sections
    const fileName = options?.fileName || 'textfile.txt'; // Use provided filename or default
    this.logger.info(`[ExcelParserService] Starting parseTextFile. Content length: ${content.length}. Options: ${JSON.stringify(mergedOptions)}`);

    try {
        const lines = content.split(/\r?\n/);
    if (lines.length === 0) {
            this.logger.warn('[parseTextFile] Text file content is empty or contains no lines.');
        return [];
    }

        // --- Initial Header Detection ---
        const linesAsArrays = lines.map(line => this.parseTxtRow(line));
        // Use findHeaderRowIndex utility for initial detection
        const initialHeaderConfig = this.getParserConfigForType(mergedOptions.documentType || DocumentType.UNKNOWN);
        let firstHeaderRowIndex = findHeaderRowIndex(
            linesAsArrays, 
            mergedOptions.documentType, // Pass document type if available 
            MAX_HEADER_SCAN_ROWS
        );

        if (firstHeaderRowIndex === -1) {
            this.logger.warn(`[parseTextFile] Could not find a suitable initial header row using keywords in ${fileName}. Attempting index 0.`);
            firstHeaderRowIndex = 0; // Fallback, might be incorrect
            // Add processing error
             processingErrors.push({
                severity: 'warning',
                message: `Could not automatically detect initial header row in ${fileName}. Using row 1 as fallback.`,
                rowIndex: 1
            });
        } else {
             this.logger.info(`[parseTextFile] Initial header row detected at index ${firstHeaderRowIndex} (1-based row ${firstHeaderRowIndex + 1}) in ${fileName}.`);
        }

        if (firstHeaderRowIndex >= linesAsArrays.length) {
             this.logger.error(`[parseTextFile] Detected header row index ${firstHeaderRowIndex} is out of bounds for file ${fileName} with ${linesAsArrays.length} lines.`);
             processingErrors.push({
                severity: 'critical',
                message: `Detected header row index ${firstHeaderRowIndex + 1} is beyond the end of the file ${fileName}. Cannot parse.`,
                rowIndex: firstHeaderRowIndex + 1
            });
             // Consider throwing an error or returning empty with errors
             return []; // Cannot proceed
        }

        let currentHeaders = linesAsArrays[firstHeaderRowIndex];
        let currentHeaderMapping = await this.mapHeadersToStandardFields(
            currentHeaders,
            linesAsArrays.slice(firstHeaderRowIndex + 1, firstHeaderRowIndex + 6), // Provide sample data rows for potential AI context
            mergedOptions,
            initialHeaderConfig.mappings // Use initial config mappings
        );

        // --- Iterative Section Processing ---
        let currentDataStartIndex = firstHeaderRowIndex + 1;
        let currentDataRows: string[][] = [];
        this.logger.debug(`[parseTextFile] Starting iterative section processing. First data index: ${currentDataStartIndex}`); // Added Log

        for (let i = currentDataStartIndex; i < linesAsArrays.length; i++) {
            const currentRowArray = linesAsArrays[i];
            // Pass the current row array to the helper
            const isPotentialNewHeader = this._isLikelyHeaderRow(currentRowArray);

            if (isPotentialNewHeader && i > firstHeaderRowIndex) { // Found a potential new header after the first one
                 this.logger.info(`[parseTextFile] Potential new header DETECTED at line index ${i} (1-based row ${i + 1}) in ${fileName}. Processing previous section.`); // Added DETECTED

                 // 1. Process the collected data rows for the *previous* section
                 if (currentDataRows.length > 0) {
                     this.logger.debug(`[parseTextFile] >> Processing ${currentDataRows.length} data rows from previous section (lines ${currentDataStartIndex + 1} to ${i}).`); // Added Log
                     // ---> Log Before Call <---
                     this.logger.debug(`[parseTextFile] Calling _processDataRows for previous section. Header Count: ${currentHeaders.length}, Mapping Details Count: ${currentHeaderMapping.detailedMapping?.length}`);
                     const sectionBundles = await this._processDataRows(
                         currentDataRows,
                         currentHeaders, // Use the headers from the *previous* section
                         currentHeaderMapping, // Use the mapping from the *previous* section
                         fileName, // Source name
                         currentDataStartIndex, // Pass 0-based index, _processDataRows calculates 1-based
                         mergedOptions,
                         null // Potential origin is harder to track per section, handle in builder
                     );
                      // ---> Log After Call <---
                     this.logger.debug(`[parseTextFile] _processDataRows returned ${sectionBundles.length} bundles for previous section.`);
                     allBundles.push(...sectionBundles);
                     this.logger.info(`[parseTextFile] Added ${sectionBundles.length} bundles from section ending before line ${i + 1}. Total bundles now: ${allBundles.length}`); // Added Log
                 } else {
                     this.logger.debug(`[parseTextFile] No data rows collected for section ending before line ${i + 1}.`);
                 }

                 // 2. Prepare for the new section
                 this.logger.debug(`[parseTextFile] Preparing for new section starting at line ${i + 1}.`); // Added Log
                 currentHeaders = currentRowArray; // Update headers
                 const newSectionConfig = this.getParserConfigForType(mergedOptions.documentType || DocumentType.UNKNOWN); // Re-get config (could be same)
                 // Ensure we don't pass an empty array for sample data
                 const sampleDataForNewSection = linesAsArrays.slice(i + 1, i + 6);
                 currentHeaderMapping = await this.mapHeadersToStandardFields(
                     currentHeaders,
                     sampleDataForNewSection, // Sample data for new section
                     mergedOptions,
                     newSectionConfig.mappings
                 );
                 this.logger.info(`[parseTextFile] Generated new header mapping for section starting at line ${i + 1}. Mapping Details Count: ${currentHeaderMapping.detailedMapping?.length}`); // Added Log

                 currentDataRows = []; // Reset data row buffer
                 currentDataStartIndex = i + 1; // Set start index for the new section's data

                 // Skip processing this header line as data - loop continues to next line
                 continue;
            }

            // If it's not a new header, and not an empty row, add it to the current data block
            if (!isEmptyRow(currentRowArray)) {
                currentDataRows.push(currentRowArray);
            } else {
                 this.logger.debug(`[parseTextFile] Skipping empty line at index ${i}`);
                 // Could add logic here to stop if too many consecutive empty lines occur *within* a section
            }
        } // End loop through lines
        this.logger.debug(`[parseTextFile] Exited main processing loop. i = ${linesAsArrays.length}`); // Added Log

        // --- Process Final Section ---
        if (currentDataRows.length > 0) {
            this.logger.info(`[parseTextFile] >> Processing final section with ${currentDataRows.length} data rows (starting index ${currentDataStartIndex}, lines ${currentDataStartIndex + 1} to ${linesAsArrays.length}).`); // Added Log
             // ---> Log Before Call <---
             this.logger.debug(`[parseTextFile] Calling _processDataRows for final section. Header Count: ${currentHeaders.length}, Mapping Details Count: ${currentHeaderMapping.detailedMapping?.length}`);
            const finalSectionBundles = await this._processDataRows(
                currentDataRows,
                currentHeaders, // Use the last active headers
                currentHeaderMapping, // Use the last active mapping
                fileName,
                currentDataStartIndex, // Pass 0-based index
        mergedOptions,
                null
            );
            // ---> Log After Call <---
            this.logger.debug(`[parseTextFile] _processDataRows returned ${finalSectionBundles.length} bundles for final section.`);
            allBundles.push(...finalSectionBundles);
            this.logger.info(`[parseTextFile] Added ${finalSectionBundles.length} bundles from final section. Total bundles now: ${allBundles.length}`); // Added Log
        } else {
             this.logger.info(`[parseTextFile] No data rows found in the final section of ${fileName}.`);
        }

        // Add collected errors to the first bundle's metadata if possible, or log them
        if (processingErrors.length > 0 && allBundles.length > 0) {
            // Ensure metadata and processingErrors array exist
             if (!allBundles[0].metadata) {
                 // This case should ideally not happen if createShipmentFromRowData initializes metadata
                 this.logger.warn(`[parseTextFile] Metadata object missing on first bundle for ${fileName}. Initializing.`);
                 allBundles[0].metadata = { originalRowData: {}, originalRowIndex: -1 }; // Basic init
             }
             if (!allBundles[0].metadata.processingErrors) {
                allBundles[0].metadata.processingErrors = [];
            }
            // Convert ProcessingError[] to string[] for the metadata field
            const errorMessages = processingErrors.map(e => `[${e.severity}|Row ${e.rowIndex ?? 'N/A'}|Field ${e.field ?? 'N/A'}]: ${e.message}`);
            // Avoid duplicates if errors were already added somehow (though unlikely with current flow)
            errorMessages.forEach(msg => {
                 if (!allBundles[0].metadata.processingErrors?.includes(msg)) {
                     allBundles[0].metadata.processingErrors?.push(msg);
                 }
            });
            this.logger.warn(`[parseTextFile] Added ${processingErrors.length} processing errors to the first bundle's metadata for ${fileName}.`);
        } else if (processingErrors.length > 0) {
             this.logger.error(`[parseTextFile] ${processingErrors.length} processing errors occurred but no bundles were generated for ${fileName}. Errors: ${JSON.stringify(processingErrors)}`);
        }


        this.logger.info(`[ExcelParserService] Finished parseTextFile for ${fileName}. Total bundles parsed: ${allBundles.length}`);
        // ---> START DEBUG LOGGING <---
        this.logger.info(`[DEBUG PARSER OUTPUT] parseTextFile returning ${allBundles.length} bundles.`);
        if (allBundles.length > 0) {
            const identifiers = allBundles.map((bundle, index) => {
                // Attempt to get a consistent identifier from customDetailsData, fallback to index
                const loadNum = bundle.customDetailsData?.customerShipmentNumber;
                const orderNum = bundle.customDetailsData?.customerDocumentNumber;
                return `Bundle ${index}: ${loadNum ? `Load#${loadNum}` : ''}${loadNum && orderNum ? '/' : ''}${orderNum ? `Order#${orderNum}` : ''}${!loadNum && !orderNum ? `(No ID)` : ''}`;
            });
            this.logger.info(`[DEBUG PARSER OUTPUT] Bundle Identifiers: [${identifiers.join(', ')}]`);
        }
        // ---> END DEBUG LOGGING <---
        return allBundles;

    } catch (error: any) {
      this.logger.error(`[ExcelParserService] CRITICAL Error in parseTextFile: ${error.message}`, { stack: error.stack, fileName });
      // Optionally add a critical error to processingErrors if needed downstream
      throw new Error(`Failed to parse text file ${fileName}: ${error.message}`);
    }
  }

  /**
   * Core logic to process data rows into shipment bundles.
   * Extracted to be reusable by both Excel and Text parsers.
   * REVISED: Groups first, then handles splits during group processing.
   */
  private async _processDataRows(
      dataRows: any[][],
      headers: string[],
      headerMappingResult: HeaderMappingResultType,
      sourceName: string,
      firstDataRowFileIndex: number, // 0-based index of the first data row in the *original file/sheet*
      options: ExcelParseOptions,
      potentialSheetOrigin: string | null
  ): Promise<ParsedShipmentBundle[]> {
      const bundles: ParsedShipmentBundle[] = [];
      const functionDebugId = `_processDataRows_${Date.now()}`;
      this.logger.info(`[${functionDebugId}] Starting processing. Data rows received: ${dataRows.length}`);

      // --- Step 1: Group rows based on Load Number presence (with swap check integrated) ---
      const groupedRows: { data: RawRowData; note?: string; needsReview?: boolean }[][] = [];
      let currentGroup: { data: RawRowData; note?: string; needsReview?: boolean }[] = [];
      // ***** ADDED: Track the load number of the current group *****
      let currentGroupLoadNo: string | undefined = undefined;

      for (let i = 0; i < dataRows.length; i++) {
          const rowIndexForLog = firstDataRowFileIndex + i; // Original file row index
          const rowArray = dataRows[i];
          if (isEmptyRow(rowArray)) {
              this.logger.debug(`[${functionDebugId}][Row ${rowIndexForLog}] Skipping empty row.`);
              continue;
          }

          const initialRowData = this.convertRowToRawData(rowArray, headerMappingResult);
          this.logger.debug(`[${functionDebugId}][Row ${rowIndexForLog}] Initial RowData: ${JSON.stringify(initialRowData)}`);

          // Call swap detection/correction
          const {
              correctedRowData,
              note: swapNote,
              needsReview: swapNeedsReview
          } = detectAndCorrectSwappedFields(initialRowData, headerMappingResult);
          this.logger.debug(`[${functionDebugId}][Row ${rowIndexForLog}] After Swap Check - Corrected RowData: ${JSON.stringify(correctedRowData)}`);
          this.logger.debug(`[${functionDebugId}][Row ${rowIndexForLog}] After Swap Check - Swap Note: ${swapNote ?? 'N/A'}, Needs Review: ${swapNeedsReview ?? false}`);

          // Use correctedRowData for grouping logic
          const loadNo = extractStringField(correctedRowData, 'loadNumber');
          this.logger.debug(`[${functionDebugId}][Row ${rowIndexForLog}] Extracted LoadNo for grouping: '${loadNo ?? 'NULL'}'`);

          // ***** REVISED GROUPING LOGIC *****
          if (currentGroup.length === 0) {
             // Starting the very first group or a new group after pushing
             currentGroup.push({ data: correctedRowData, note: swapNote, needsReview: swapNeedsReview });
             currentGroupLoadNo = loadNo; // Set the load number for this new group
             this.logger.debug(`[${functionDebugId}][Grouping] Starting new group with LoadNo: '${currentGroupLoadNo ?? 'NULL'}' at row ${rowIndexForLog}.`);
          } else {
              // We are continuing an existing group
              // Check if the current row signals the END of the current group
              // A group ends if the current row HAS a load number AND it's DIFFERENT from the current group's load number.
              if (loadNo && loadNo !== currentGroupLoadNo) {
                  // Finalize the PREVIOUS group
                  this.logger.debug(`[${functionDebugId}][Grouping] New load '${loadNo}' found at row ${rowIndexForLog}. Finalizing previous group (LoadNo: '${currentGroupLoadNo ?? 'NULL'}') of size ${currentGroup.length}.`);
                  groupedRows.push([...currentGroup]);
                  // Start the NEW group with the current row
                  currentGroup = [{ data: correctedRowData, note: swapNote, needsReview: swapNeedsReview }];
                  currentGroupLoadNo = loadNo; // Set the load number for the new group
              } else {
                  // Current row belongs to the existing group (either has no load number OR has the same load number)
                  currentGroup.push({ data: correctedRowData, note: swapNote, needsReview: swapNeedsReview });
              }
          }
          // ***** END REVISED GROUPING LOGIC *****
      }
      // Push the last group after the loop finishes
      if (currentGroup.length > 0) {
          this.logger.debug(`[${functionDebugId}][Grouping] Pushing final group (LoadNo: '${currentGroupLoadNo ?? 'NULL'}') of size ${currentGroup.length}.`);
          groupedRows.push([...currentGroup]);
      }
      this.logger.info(`[${functionDebugId}] Grouped ${dataRows.length} data rows into ${groupedRows.length} logical shipment groups.`);

      // --- Step 2: Process each group, handling splits ---
      let currentGroupStartIndex = firstDataRowFileIndex; // Keep track of the original starting index for metadata

      for (const groupWithObjects of groupedRows) { // Iterate through groups of objects
          if (!groupWithObjects || groupWithObjects.length === 0) continue;

          // Extract just the RawRowData for splitting logic, but keep track of metadata from the first row
          const group = groupWithObjects.map(item => item.data);
          const firstRowMetadata = { note: groupWithObjects[0].note, needsReview: groupWithObjects[0].needsReview };

          // ***** ADDED: Extract the definitive origin string for the group *****
          const groupOriginRawInput = extractStringField(group[0], 'pickupWarehouse') || null;
          this.logger.debug(`[${functionDebugId}] Group starting at index ${currentGroupStartIndex} has groupOriginRawInput: '${groupOriginRawInput}'`);
          // ***** END ADDED *****

          // <<< Log group content >>>
          this.logger.debug(`${functionDebugId} Processing Group Content (Data Only): ${JSON.stringify(group)}`);

          const firstRowData = group[0];
          const rawLoadNumberValue = firstRowData['loadNumber'];
          const groupLoadNumberStr_raw = rawLoadNumberValue !== null && rawLoadNumberValue !== undefined ? String(rawLoadNumberValue) : '';
          const groupLoadNumberStr_cleaned = extractStringField(firstRowData, 'loadNumber');
          const groupOrderNumberStr = extractStringField(firstRowData, 'orderNumber');
          const groupLogPrefix = `[${functionDebugId}][GroupProcess][StartIdx:${currentGroupStartIndex}]`;
          this.logger.debug(`${groupLogPrefix} Processing group. Size: ${group.length}. RawLoad: '${groupLoadNumberStr_raw.replace(/\r\n|\n/g, "<NL>")}', CleanedLoad: '${groupLoadNumberStr_cleaned}', FirstOrder: '${groupOrderNumberStr}'`);

          let bundlesForThisGroup: ParsedShipmentBundle[] = [];

          const splitRegex = /\s*(\/|\r?\n)\s*/;
          if (groupLoadNumberStr_raw && splitRegex.test(groupLoadNumberStr_raw)) {
              // ... (split logic remains the same, should receive correct group now)
              const splitLoadNumbers = groupLoadNumberStr_raw.split(splitRegex).map(s => s.trim()).filter(s => s && s !== '/' && s !== '\n' && s !== '\r\n');
              this.logger.info(`${groupLogPrefix} Split load detected: '${groupLoadNumberStr_raw}' -> ${JSON.stringify(splitLoadNumbers)}`);

              if (splitLoadNumbers.length === 0) {
                  // Log error if split results in no valid load numbers
                  this.logger.error(`${groupLogPrefix} Invalid split scenario resulted in zero valid load numbers. Original: '${groupLoadNumberStr_raw}'. Skipping group.`);
              } else {
                   for (let i = 0; i < splitLoadNumbers.length; i++) {
                       const specificLoadNumber = splitLoadNumbers[i];
                       // Logic for split item handling:
                       // Base data comes from group[0]
                       // Item data comes from group[i] (or last item if split has more parts than rows)
                       const itemRowIndex = Math.min(i, group.length - 1);
                       const itemRowData = group[itemRowIndex];
                       // Create a representative group for buildAggregatedBundle containing only the header row and the specific item row
                       const bundleGroupForSplit = [group[0], itemRowData];
                       this.logger.debug(`${groupLogPrefix} Building bundle for split load #${i + 1}: '${specificLoadNumber}' using header row ${currentGroupStartIndex} and item row ${currentGroupStartIndex + itemRowIndex}`);
                       try {
                            // <<< SIMPLIFIED LOGGING temporarily >>>
                            this.logger.debug(`${groupLogPrefix} Calling buildAggregatedBundle for SPLIT load '${specificLoadNumber}'.`); 
                            const resultBundle = await this.buildAggregatedBundle(
                              bundleGroupForSplit, // Pass the 2-row group representing header + specific item
                              currentGroupStartIndex, // Start index of the original group
                              headerMappingResult,
                              potentialSheetOrigin,
                              options,
                              sourceName,
                              specificLoadNumber,
                              firstRowMetadata.note,
                              firstRowMetadata.needsReview,
                              groupOriginRawInput // Pass group origin
                            );
                            if (resultBundle) {
                                // Add a note indicating this bundle was from a split
                                if (!resultBundle.metadata.processingNotes) resultBundle.metadata.processingNotes = [];
                                resultBundle.metadata.processingNotes.push(`Derived from split load number part ${i+1} ('${specificLoadNumber}') of original '${groupLoadNumberStr_raw}'. Item data primarily from original row ${currentGroupStartIndex + itemRowIndex}.`);
                                bundlesForThisGroup.push(resultBundle);
                            } else {
                                this.logger.error(`${groupLogPrefix} buildAggregatedBundle returned null for split load '${specificLoadNumber}'.`);
                            }
                       } catch (error: any) {
                            this.logger.error(`${groupLogPrefix} UNEXPECTED ERROR during bundle creation for split load '${specificLoadNumber}': ${error.message}`, { stack: error.stack });
                       }
                   }
                   this.logger.info(`${groupLogPrefix} Processed ${splitLoadNumbers.length} split loads, generated ${bundlesForThisGroup.length} bundles.`);
              }
          } else { // Original non-split logic
             this.logger.debug(`${groupLogPrefix} No split detected. Calling buildAggregatedBundle normally.`);
             try {
                  this.logger.debug(`${groupLogPrefix} Calling buildAggregatedBundle for NORMAL load with swapNote: '${firstRowMetadata.note ?? 'N/A'}', swapNeedsReview: ${firstRowMetadata.needsReview ?? false}, groupOrigin: '${groupOriginRawInput}'`);
                  const bundle = await this.buildAggregatedBundle(
                    group, // Pass the full group for non-split
                    currentGroupStartIndex,
                    headerMappingResult,
                    potentialSheetOrigin,
                    options,
                    sourceName,
                    undefined, // No overrideLoadNumber
                    firstRowMetadata.note, // Pass swap note
                    firstRowMetadata.needsReview, // Pass swap flag
                    groupOriginRawInput // Pass group origin
                );
                 if (bundle) {
                     bundlesForThisGroup.push(bundle);
                 } else {
                      this.logger.error(`${groupLogPrefix} buildAggregatedBundle returned null for normal group.`);
                 }
             } catch (error: any) {
                  this.logger.error(`${groupLogPrefix} UNEXPECTED ERROR during bundle creation for non-split group: ${error.message}`, { stack: error.stack });
             }
          }
          bundles.push(...bundlesForThisGroup);
          currentGroupStartIndex += groupWithObjects.length; // Increment start index by the size of the original group

      } // End loop through groups

      this.logger.info(`[${functionDebugId}] Finished processing all groups. Final total bundles generated: ${bundles.length}.`); // Updated log message
      return bundles;
  }

  // --- Method to build a single bundle from a group of rows ---
  private async buildAggregatedBundle(
      group: RawRowData[],
      originalGroupStartIndex: number,
      headerMappingResult: HeaderMappingResultType,
      potentialSheetOrigin: string | null,
      options: ExcelParseOptions,
      sourceName: string,
      overrideLoadNumber?: string,
      // ADDED Parameters for swap metadata
      swapCorrectionNote?: string,
      swapCorrectionNeedsReview?: boolean,
      // ***** ADDED: Group Origin Input *****
      groupOriginRawInput?: string | null
  ): Promise<ParsedShipmentBundle | null> {
      this.logger.debug(`[buildAggregatedBundle] Building bundle for group starting at index ${originalGroupStartIndex}, size: ${group.length}${overrideLoadNumber ? `, OverrideLoad#: '${overrideLoadNumber}'` : ''}, GroupOrigin: '${groupOriginRawInput}'`);
      if (!group || group.length === 0) {
          this.logger.warn(`[buildAggregatedBundle] Attempted to build bundle from empty group at index ${originalGroupStartIndex}`);
          return null;
      }

      const firstRowData = group[0];
      // Use override if provided, otherwise find the actual key for 'loadNumber'
      const loadNumberKey = findActualKeyForStandardField('loadNumber', headerMappingResult);
      // Extract the value only if the key was found
      const loadNumberFromData = loadNumberKey ? extractStringField(firstRowData, loadNumberKey) : undefined;
      // Determine the effective load number
      const effectiveLoadNumber = overrideLoadNumber ?? loadNumberFromData;

      this.logger.info(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Building bundle for group size: ${group.length}`);

      // Create the base shipment structure from the first row's data
      const baseBundle = await createShipmentFromRowData(
          firstRowData,
          originalGroupStartIndex, // Use the original index for metadata
          potentialSheetOrigin,
          null, // Passing null for document ID, will be set later if needed
          headerMappingResult,
          {
              fileName: options.fileName,
              sheetName: sourceName,
              // ***** PASS groupOriginRawInput to createShipmentFromRowData *****
              groupOriginRawInput: groupOriginRawInput
            }
      );

      if (!baseBundle) {
          this.logger.error(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Failed to create base bundle from first row data.`);
          return null;
      }

      // --- Merge swap correction metadata START ---
      if (swapCorrectionNote) {
          if (!baseBundle.metadata.processingNotes) {
              baseBundle.metadata.processingNotes = [];
          }
          // Avoid adding duplicate notes
          if (!baseBundle.metadata.processingNotes.includes(swapCorrectionNote)) {
             baseBundle.metadata.processingNotes.push(swapCorrectionNote);
          }
      }
      // If the swap check flagged it, set needsReview to true.
      // This allows the initial needsReview from createShipmentFromRowData (based on confidence) to persist
      // but ensures the swap flag overrides it if true.
      if (swapCorrectionNeedsReview === true) {
          baseBundle.metadata.needsReview = true;
      }
      // --- Merge swap correction metadata END ---

      // --- Ensure customDetailsData exists and set the correct load number ---
      if (!baseBundle.customDetailsData) {
          baseBundle.metadata.processingErrors = (baseBundle.metadata.processingErrors ?? []).concat([`Error: customDetailsData was unexpectedly null for load ${effectiveLoadNumber}`]);
          this.logger.error(`[buildAggregatedBundle] customDetailsData was null for Load ${effectiveLoadNumber} after base bundle creation.`);
          // Decide whether to return null or continue with potentially incomplete data
          // Let's try initializing it to allow item processing
          baseBundle.customDetailsData = {};
          // return null; // Alternative: Stop processing if custom details are missing
      }
      baseBundle.customDetailsData.customerShipmentNumber = effectiveLoadNumber;
      // If createShipmentFromRowData ALSO sets customerShipmentNumber based on input rowData,
      // ensure this line correctly overwrites it when overrideLoadNumber is present.
      // --- End Load Number Assignment ---

      // Initialize itemsData array
      baseBundle.itemsData = [];

      // Aggregate items from all rows in the group
      this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Starting item aggregation loop for group size ${group.length}`);

      const isSplitBundle = !!overrideLoadNumber;

      for (let i = 0; i < group.length; i++) {
          const rowData = group[i];

          // --- MODIFIED LOGIC FOR SPLIT BUNDLE ITEM HANDLING ---
          let item = null; // Initialize item as null for this iteration

          if (isSplitBundle && i === 1) { // Specifically target the second row of the split
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}][Split: ${overrideLoadNumber}] Preparing composite item data for row index ${i}.`);
              const headerRowData = group[0]; // The first row of the original group (contains header info)
              const specificItemRowData = group[1]; // The second row of the original group (contains specific item info)

              // --- Use findActualKeyForStandardField to get the correct keys ---
              // It's crucial to search within the *headerMappingResult* which defines the keys
              const itemNumKey = findActualKeyForStandardField('itemNumber', headerMappingResult);
              const descriptionKey = findActualKeyForStandardField('description', headerMappingResult);
              const lotSerialKey = findActualKeyForStandardField('lotSerialNumber', headerMappingResult);
              const quantityKey = findActualKeyForStandardField('quantity', headerMappingResult);
              const weightKey = findActualKeyForStandardField('weight', headerMappingResult);
              const uomKey = findActualKeyForStandardField('uom', headerMappingResult);
              const binKey = findActualKeyForStandardField('bin', headerMappingResult);

              // Log the keys found (or not found)
              this.logger.debug(`[buildAggregatedBundle][Split: ${overrideLoadNumber}] Dynamic Keys Found: itemNumKey=${itemNumKey}, quantityKey=${quantityKey}, descriptionKey=${descriptionKey}, lotSerialKey=${lotSerialKey}, weightKey=${weightKey}, uomKey=${uomKey}, binKey=${binKey}`);

              // Build composite data using dynamically found keys, prioritizing specific row, falling back to header row
              // Use conditional property spreading to avoid adding undefined keys
              const compositeDataForRow: RawRowData = {
                  // Start with specific item row data as base
                  ...specificItemRowData,
                  // Override/add using fallbacks only if the key was actually found
                  ...(itemNumKey && { [itemNumKey]: extractStringField(specificItemRowData, itemNumKey) ?? extractStringField(headerRowData, itemNumKey) }),
                  ...(descriptionKey && { [descriptionKey]: extractStringField(specificItemRowData, descriptionKey) ?? extractStringField(headerRowData, descriptionKey) }),
                  ...(lotSerialKey && { [lotSerialKey]: extractStringField(specificItemRowData, lotSerialKey) ?? extractStringField(headerRowData, lotSerialKey) }),
                  ...(quantityKey && { [quantityKey]: extractNumericField(specificItemRowData, quantityKey) }), // No fallback for quantity
                  ...(weightKey && { [weightKey]: extractNumericField(specificItemRowData, weightKey) }),       // No fallback for weight
                  ...(uomKey && { [uomKey]: extractStringField(specificItemRowData, uomKey) ?? extractStringField(headerRowData, uomKey) }),
                  ...(binKey && { [binKey]: extractStringField(specificItemRowData, binKey) ?? extractStringField(headerRowData, binKey) }),
              };
              this.logger.debug(`[buildAggregatedBundle][Split: ${overrideLoadNumber}] Composite data built: ${JSON.stringify(compositeDataForRow)}`);

              // Now call buildShipmentItem with the composite data
              item = buildShipmentItem(compositeDataForRow);
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Loop iteration ${i}. Result of buildShipmentItem (using composite data): ${JSON.stringify(item)}`);

          } else if (isSplitBundle && i === 0) {
              // Skip header row as before
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}][Split: ${overrideLoadNumber}] INTENTIONALLY SKIPPING item creation for row index ${i} (Header row of split bundle).`);
              item = null;
          } else {
              // Normal processing for non-split bundles
              // IMPORTANT: Use findActualKeyForStandardField here too for consistency if needed,
              // but buildShipmentItem expects standard keys. We rely on the `convertRowToRawData`
              // having already used the mapping result to create the rowData object correctly.
              // So, direct use of rowData should be fine here.
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Processing row index ${i} for item data (non-split or other rows). IsSplit: ${isSplitBundle}`);
              item = buildShipmentItem(rowData); // Process rowData as is (keys should be correct from convertRowToRawData)
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Loop iteration ${i}. Result of buildShipmentItem: ${JSON.stringify(item)}`);
          }
          // --- END MODIFIED LOGIC ---

          if (item) { // Check if item is truthy (i.e., not null)
              baseBundle.itemsData.push(item);
              this.logger.debug(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Added item from group row index ${i}. Total items: ${baseBundle.itemsData.length}`);
          } else {
              // Log warning if item is null, *unless* it was the intentionally skipped header row of a split
              if (!(isSplitBundle && i === 0)) {
                   // Add more context to warning log
                   // --- Check keys before accessing in log ---
                   const qtyKeyForLog = findActualKeyForStandardField('quantity', headerMappingResult);
                   const itemNumKeyForLog = findActualKeyForStandardField('itemNumber', headerMappingResult);
                   const keyInfo = isSplitBundle && i === 1 ? `(Dynamic Keys: qty=${qtyKeyForLog ?? 'NF'}, item#=${itemNumKeyForLog ?? 'NF'})` : ''; // NF = Not Found
                   this.logger.warn(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Could not build valid item (item was null) from group row index ${i}. ${keyInfo} Row Data (or Composite): ${JSON.stringify(rowData)}`);
               }
          }
      }

      this.logger.info(`[buildAggregatedBundle][StartIdx:${originalGroupStartIndex}] Successfully built aggregated bundle. Items: ${baseBundle.itemsData.length}`);
      return baseBundle;
  }
} // End Class
