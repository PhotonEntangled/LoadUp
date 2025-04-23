/**
 * Service for parsing Excel files using xlsx library with AI-enhanced field mapping
 */

import * as XLSX from 'xlsx';
import { ShipmentData, ShipmentItem, ShipmentConfidenceResult, AIMappedField, LocationDetail, FieldMappingResult, RawRowData, SourceInfo } from '../../types/shipment';
import { openAIService } from '../ai/OpenAIService';
import { getPotentialMatches, getStandardFieldOptions } from '../ai/schema-reference';
import { logger } from '../../utils/logger';
import { DocumentType } from '../../apps/admin-dashboard/lib/document-processing';
import ExcelJS from 'exceljs';
// Import the newly created location functions
import { 
  resolveAmbiguousLocation, 
  createLocationDetailFromAddressFields, 
  preScanForOrigin 
} from './locationResolver';
// Import the shipment builder function
import { 
  createShipmentFromRowData, 
  buildShipmentItem 
} from './shipmentBuilder';

/**
 * Interface for Excel parsing options
 */
export interface ExcelParseOptions {
  hasHeaderRow?: boolean;
  headerRow?: number;
  useAIMapping?: boolean;
  aiMappingConfidenceThreshold?: number;
  sheetIndex?: number;
  headerRowIndex?: number;
  fieldMapping?: Record<string, string>;
  isOcrData?: boolean;
  ocrSource?: string;
  ocrConfidence?: number;
}

// --- Refactored Field Mappings ---

// Base mappings shared across document types
const BASE_MAPPINGS = {
  // Essential IDs
  'LOAD NO': 'loadNumber',
  'Load No': 'loadNumber',
  'LOAD NUMBER': 'loadNumber',
  'Load Number': 'loadNumber',
  'load no': 'loadNumber',
  'load number': 'loadNumber',
  'Order Number': 'orderNumber',
  'ORDER NUMBER': 'orderNumber',
  'Order No': 'orderNumber',
  'ORDER NO': 'orderNumber',
  'Customer PO Number': 'poNumber',
  'CUSTOMER PO NUMBER': 'poNumber',
  'PO Number': 'poNumber',
  'PO NUMBER': 'poNumber',
  'PO No': 'poNumber',
  'PO NO': 'poNumber',
  // Dates
  'Promised Ship Date': 'promisedShipDate',
  'PROMISED SHIP DATE': 'promisedShipDate',
  'Promise Date': 'promisedShipDate',
  'PROMISE DATE': 'promisedShipDate',
  'Ship Date': 'promisedShipDate',
  'SHIP DATE': 'promisedShipDate',
  'Request Date': 'requestDate',
  'REQUEST DATE': 'requestDate',
  'Requested Date': 'requestDate',
  'REQUESTED DATE': 'requestDate',
  // Ship To Info
  'Ship To Area': 'shipToArea', // Note: shipToArea might not be in ShipmentData, map to Address/City or miscellaneous?
  'SHIP TO AREA': 'shipToArea',
  'Area': 'shipToArea',
  'AREA': 'shipToArea',
  'Ship To Customer Name': 'shipToCustomer',
  'SHIP TO CUSTOMER NAME': 'shipToCustomer',
  'Ship To Customer': 'shipToCustomer',
  'SHIP TO CUSTOMER': 'shipToCustomer',
  'Customer Name': 'shipToCustomer',
  'CUSTOMER NAME': 'shipToCustomer',
  'Customer': 'shipToCustomer',
  'CUSTOMER': 'shipToCustomer',
  'Address Line 1 and 2': 'shipToAddress',
  'ADDRESS LINE 1 AND 2': 'shipToAddress',
  'Address': 'shipToAddress',
  'ADDRESS': 'shipToAddress',
  'Ship To Address': 'shipToAddress',
  'SHIP TO ADDRESS': 'shipToAddress',
  'DELIVERY ADDRESS': 'shipToAddress',
  'Delivery Address': 'shipToAddress',
  'State/ Province': 'shipToState',
  'STATE/ PROVINCE': 'shipToState',
  'State': 'shipToState',
  'STATE': 'shipToState',
  'Province': 'shipToState',
  'PROVINCE': 'shipToState',
  // Contact
  'CONTACT NO': 'contactNumber',
  'Contact No': 'contactNumber',
  'Contact Number': 'contactNumber',
  'CONTACT NUMBER': 'contactNumber',
  'Phone': 'contactNumber',
  'PHONE': 'contactNumber',
  // Remarks
  'REMARK': 'remarks',
  'Remark': 'remarks',
  'Remarks': 'remarks',
  'REMARKS': 'remarks',
  'Notes': 'remarks',
  'NOTES': 'remarks',
  'Note': 'remarks',
  'NOTE': 'remarks',
  'Comment': 'remarks',
  'COMMENT': 'remarks',
  'Comments': 'remarks',
  'COMMENTS': 'remarks',
  // Item fields
  '2nd Item Number': 'itemNumber',
  'Item Number': 'itemNumber',
  'ITEM NUMBER': 'itemNumber',
  'Item No': 'itemNumber',
  'ITEM NO': 'itemNumber',
  'Item': 'itemNumber',
  'ITEM': 'itemNumber',
  'Description 1': 'description',
  'DESCRIPTION 1': 'description',
  'Description': 'description',
  'DESCRIPTION': 'description',
  'Item Description': 'description',
  'ITEM DESCRIPTION': 'description',
  'Lot Serial Number': 'lotSerialNumber',
  'LOT SERIAL NUMBER': 'lotSerialNumber',
  'Lot Number': 'lotSerialNumber',
  'LOT NUMBER': 'lotSerialNumber',
  'Serial Number': 'lotSerialNumber',
  'SERIAL NUMBER': 'lotSerialNumber',
  'Serial No': 'lotSerialNumber',
  'SERIAL NO': 'lotSerialNumber',
  'Lot No': 'lotSerialNumber',
  'LOT NO': 'lotSerialNumber',
  'Quantity Ordered': 'quantity',
  'QUANTITY ORDERED': 'quantity',
  'Quantity': 'quantity',
  'QUANTITY': 'quantity',
  'Qty': 'quantity',
  'QTY': 'quantity',
  'UOM': 'uom',
  'Unit of Measure': 'uom',
  'UNIT OF MEASURE': 'uom',
  'Unit': 'uom',
  'UNIT': 'uom',
  'Weight (KG)': 'weight',
  'WEIGHT (KG)': 'weight',
  'Weight': 'weight',
  'WEIGHT': 'weight',
  'Weight (kg)': 'weight',
  'WEIGHT (kg)': 'weight',
  // NEWLY ADDED FIELDS
  'Actual Delivery Date': 'actualDeliveryDate',
  'ACTUAL DELIVERY DATE': 'actualDeliveryDate',
  'Delivered Date': 'actualDeliveryDate',
  'DELIVERED DATE': 'actualDeliveryDate',
  'Order type': 'orderType',
  'ORDER TYPE': 'orderType',
  'Type': 'orderType',
  'TYPE': 'orderType',
  'Bin': 'bin',
  'BIN': 'bin',
  // Financial/Rate Fields (Map to miscellaneous)
  'Trip Rates': 'miscellaneous', 
  'TRIP RATES': 'miscellaneous', 
  'Drop': 'miscellaneous',
  'DROP': 'miscellaneous',
  'Manpower': 'miscellaneous',
  'MANPOWER': 'miscellaneous',
  'Total': 'miscellaneous', // Be careful with generic 'Total'
  'TOTAL': 'miscellaneous',
};

// Specific mappings for pickup/origin location
const PICKUP_MAPPINGS = {
  'Pick up warehouse': 'pickupWarehouse',
  'Pickup Warehouse': 'pickupWarehouse',
  'PICKUP WAREHOUSE': 'pickupWarehouse',
  'Pickup Location': 'pickupWarehouse',
  'PICKUP LOCATION': 'pickupWarehouse',
  'Origin Warehouse': 'pickupWarehouse',
  'ORIGIN WAREHOUSE': 'pickupWarehouse',
  'Origin Location': 'pickupWarehouse',
  'ORIGIN LOCATION': 'pickupWarehouse',
  'Transporter': 'pickupWarehouse', // Misleading term handled
  'TRANSPORTER': 'pickupWarehouse',
  // 'Pickup Addr': 'pickupAddress', // Commenting out direct address mapping for now
  // 'PICKUP ADDR': 'pickupAddress',
  // 'Origin Addr': 'pickupAddress',
  // 'ORIGIN ADDR': 'pickupAddress'
};

// Mapping for ship-to area, separated for clarity
const AREA_MAPPINGS = {
  'Ship To Area': 'shipToArea',
  'SHIP TO AREA': 'shipToArea',
  'Area': 'shipToArea',
  'AREA': 'shipToArea',
}

// --- Final Mappings Object ---

/**
 * Field mapping configuration for different document types
 * Includes multiple variations of field names for better matching
 */
export const FIELD_MAPPINGS = {
  ETD_REPORT: {
    ...BASE_MAPPINGS,
    ...PICKUP_MAPPINGS,
    ...AREA_MAPPINGS,
    // Add any ETD_REPORT specific overrides or additions here
  },
  
  OUTSTATION_RATES: {
    ...BASE_MAPPINGS,
    ...PICKUP_MAPPINGS,
    ...AREA_MAPPINGS,
    // Add any OUTSTATION_RATES specific overrides or additions here
  },

  // Define other document types and their combined mappings
  // EXAMPLE_TYPE: {
  //   ...BASE_MAPPINGS,
  //   'Specific Field': 'specificFieldName',
  // }
}

/**
 * Service for parsing Excel files with AI-enhanced field mapping
 */
export class ExcelParserService {
  private options: ExcelParseOptions = {
    hasHeaderRow: true,
    headerRowIndex: 0, // Default to the first row
    useAIMapping: true,
    aiMappingConfidenceThreshold: 0.7, // Default confidence threshold
    sheetIndex: 0, // Default to the first sheet
  };
  
  private logger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  constructor(private openAiService = openAIService) {}

  /**
   * Parses an Excel file (ArrayBuffer) into an array of ShipmentData objects.
   * Handles both .xlsx and .xls formats.
   */
  async parseExcelFile(excelData: ArrayBuffer, options?: Partial<ExcelParseOptions>): Promise<ShipmentData[]> {
    this.options = { ...this.options, ...options };
    this.logger.info(`[ExcelParser] Starting Excel file parsing with options: ${JSON.stringify(this.options)}`);
    
    const allShipments: ShipmentData[] = []; // To store results from all sheets

    try {
      const workbook = XLSX.read(excelData, { type: 'array', cellDates: true }); // Use cellDates: true
      
      this.logger.info(`[ExcelParser] Found sheets: ${workbook.SheetNames.join(', ')}`);

      // --- Loop through all sheets ---
      for (const sheetName of workbook.SheetNames) {
        this.logger.info(`[ExcelParser] Processing sheet: "${sheetName}"`);
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
            this.logger.warn(`[ExcelParser] Could not find sheet named "${sheetName}", skipping.`);
            continue; // Skip if sheet doesn't exist (shouldn't happen with SheetNames loop)
        }

        // Using sheet_to_json with header: 1 to get array-of-arrays
        let sheetDataAoA: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, blankrows: true }); // Keep blank rows initially for indexing
        
        // --- Filter out empty rows BEFORE header detection ---
        const originalRowCount = sheetDataAoA.length;
        sheetDataAoA = sheetDataAoA.filter((row, index) => {
            const isEmpty = this.isEmptyRow(row);
            // If you want to log skipped rows:
            // if (isEmpty) {
            //     this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Skipping empty row at original index ${index + 1}`);
            // }
            return !isEmpty;
        });
        this.logger.info(`[ExcelParser][Sheet: ${sheetName}] Filtered ${originalRowCount - sheetDataAoA.length} empty rows. Processing ${sheetDataAoA.length} non-empty rows.`);

        if (sheetDataAoA.length === 0) {
            this.logger.warn(`[ExcelParser][Sheet: ${sheetName}] Sheet is empty after filtering. Skipping.`);
            continue;
        }
        
        // Attempt to find the header row dynamically within the non-empty data
        let headerRowIndex = this.options.headerRowIndex ?? 0;
        let actualHeaders: string[] = [];
        let dataStartIndex = headerRowIndex + 1; // Default start index relative to the *filtered* data

        if (this.options.hasHeaderRow) {
          // Adjust detection to work with the filtered data
          const detectedHeaderIndex = this.detectHeaderRow(sheetDataAoA, 15); // Check first 15 non-empty rows
          if (detectedHeaderIndex !== -1) {
            headerRowIndex = detectedHeaderIndex; // Index within the filtered sheetDataAoA
            dataStartIndex = headerRowIndex + 1;
            this.logger.info(`[ExcelParser][Sheet: ${sheetName}] Detected header row at filtered index: ${headerRowIndex}`);
          } else {
            this.logger.warn(`[ExcelParser][Sheet: ${sheetName}] Could not reliably detect header row, using provided/default index: ${this.options.headerRowIndex ?? 0}`);
            // If detection fails, use the option's index, assuming it applies to the *start* of the non-empty data.
            headerRowIndex = this.options.headerRowIndex ?? 0;
            dataStartIndex = headerRowIndex + 1; 
          }
          
          if (sheetDataAoA.length > headerRowIndex) {
            actualHeaders = sheetDataAoA[headerRowIndex].map(header => header ? String(header).trim() : '');
            this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Extracted headers: ${actualHeaders.join(', ')}`);
          } else {
            this.logger.error(`[ExcelParser][Sheet: ${sheetName}] Header row index ${headerRowIndex} is out of bounds after filtering empty rows. Skipping sheet.`);
            continue; 
          }
        } else {
          // No header row - treat all rows as data
          actualHeaders = []; // No headers
          dataStartIndex = 0; // Start processing from the first non-empty row
          this.logger.info(`[ExcelParser][Sheet: ${sheetName}] Processing file with no header row specified.`);
        }
        
        if (sheetDataAoA.length <= dataStartIndex) {
          this.logger.warn(`[ExcelParser][Sheet: ${sheetName}] No data rows found after header row index ${headerRowIndex}.`);
          continue; 
        }
        
        // Pre-scan for potential origin address if needed (consider if origin might differ per sheet)
        // For now, assuming a single origin scan is sufficient or not strictly needed per sheet
        const potentialOrigin = await preScanForOrigin(sheetDataAoA, 5); // Pass the filtered array-of-arrays
        if (potentialOrigin) {
          this.logger.info(`[ExcelParser][Sheet: ${sheetName}] Pre-scanned potential origin: ${potentialOrigin}`);
        }
        
        // Process rows using the identified headers and start index
        try {
            const sheetShipments = await this.processSheetRows(sheetDataAoA, actualHeaders, dataStartIndex, this.options, sheetName, potentialOrigin);
            this.logger.info(`[ExcelParser][Sheet: "${sheetName}"] Successfully parsed ${sheetShipments.length} shipments.`);
            allShipments.push(...sheetShipments); // Add results from this sheet to the main array
        } catch (sheetError: any) {
             this.logger.error(`[ExcelParser] *** ERROR processing sheet "${sheetName}" ***`);
             this.logger.error(`[ExcelParser] Error Message: ${sheetError.message}`);
             if (sheetError instanceof Error && sheetError.stack) {
                 this.logger.error(`[ExcelParser] Error Stack: ${sheetError.stack}`);
             } else {
                 this.logger.error(`[ExcelParser] Full Error Object: ${JSON.stringify(sheetError)}`);
             }
             // Decide whether to continue with other sheets or stop entirely. Let's continue for now.
             // throw new Error(`Failed to process sheet "${sheetName}". Details logged.`); // Option to stop
        }
      } // --- End of sheet loop ---

      this.logger.info(`[ExcelParser] Finished processing all sheets. Total shipments parsed: ${allShipments.length}`);
      return allShipments;

    } catch (error: any) {
      // Enhanced Logging for workbook-level errors:
      this.logger.error(`[ExcelParser] *** ERROR during parseExcelFile ***`);
      this.logger.error(`[ExcelParser] Error Message: ${error.message}`);
      // Log the full error object if it exists
      if (error instanceof Error && error.stack) {
        this.logger.error(`[ExcelParser] Error Stack: ${error.stack}`);
      } else {
        this.logger.error(`[ExcelParser] Full Error Object: ${JSON.stringify(error)}`);
      }
      // Re-throw a user-friendly error
      throw new Error(`Failed to parse Excel file. Please check the file format and content. Details logged.`);
    }
  }
  
  /**
   * Processes rows from the sheet data (as array of arrays).
   */
  private async processSheetRows(
    sheetDataAoA: any[][], // Array of arrays representing rows
    headers: string[],
    dataStartIndex: number,
    opts: ExcelParseOptions,
    sheetName?: string,
    potentialSheetOrigin?: string | null
  ): Promise<ShipmentData[]> {
    const finalShipments: ShipmentData[] = [];
    let currentShipment: ShipmentData | null = null;

    // Determine the field mapping configuration (using default for now)
    const docType: DocumentType = DocumentType.OUTSTATION_RATES; 
    const fieldMappingConfig = this.getFieldMapping(docType);

    // Map headers once
    const headerMappingPromises = headers.map(header => 
      this.getStandardFieldName(header, fieldMappingConfig)
    );
    const headerMappings = await Promise.all(headerMappingPromises);
    const standardHeaders = headerMappings.map(m => m.fieldName);
    const headerMappingResults: FieldMappingResult[] = headerMappings.map((mapping, index) => ({
      ...mapping,
      originalField: headers[index],
      isMiscellaneous: mapping.fieldName === 'miscellaneous',
      needsReview: (!mapping.aiMapped && mapping.fieldName === 'miscellaneous') || 
                   (mapping.aiMapped && mapping.confidence < (opts.aiMappingConfidenceThreshold ?? 0.7))
    }));

    this.logger.info(`[ExcelParser][Sheet: ${sheetName}] Standard headers derived: ${standardHeaders.join(', ')}`);

    // --- Multi-Row Processing Logic ---
    for (let i = dataStartIndex; i < sheetDataAoA.length; i++) {
      const rowArray = sheetDataAoA[i];
      const rowIndex = i + 1; // 1-based index for reporting in the *filtered* data

      // Convert row array to object using standard headers
      const rowData: RawRowData = {};
      const mappingMetadata: Record<string, { originalHeader: string; isAIMapped: boolean; confidence: number }> = {};

      for (let j = 0; j < standardHeaders.length; j++) {
        const header = standardHeaders[j];
        const originalHeader = headers[j];
        const mappingInfo = headerMappingResults[j];
        const value = rowArray[j] !== undefined ? rowArray[j] : null;

        if (header && value !== null) { 
          rowData[header] = value; 
          mappingMetadata[header] = { 
            originalHeader: originalHeader, 
            isAIMapped: mappingInfo.aiMapped, 
            confidence: mappingInfo.confidence 
          };
        }
      }

      // Determine if this row represents a new shipment or just additional items
      // Heuristic: Check for presence of key identifiers (e.g., loadNumber, orderNumber)
      const isNewShipmentRow = rowData.loadNumber || rowData.orderNumber; // Add more identifiers if needed

      if (isNewShipmentRow) {
        // 1. Finalize the previous shipment (if exists)
        if (currentShipment) {
          // Recalculate total weight based on all collected items
          currentShipment.totalWeight = currentShipment.items.reduce((sum, item) => {
            return sum + (item.weight || 0); // Safely add weights
          }, 0);
          finalShipments.push(currentShipment);
          // Add null check before logging
          const loadNum = currentShipment.loadNumber ?? 'N/A';
          const orderNum = currentShipment.orderNumber ?? 'N/A';
          const sourceRow = currentShipment.sourceInfo?.rowIndex ?? 'N/A'; // Optional chaining
          this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Finalized shipment ${loadNum} / ${orderNum} from row ${sourceRow}`);
        }

        // 2. Start a new shipment from this row
        const sourceInfo: SourceInfo = { 
          fileName: opts.ocrSource || 'UnknownExcelFile', 
          sheetName: sheetName || 'UnknownSheet',
          rowIndex: rowIndex, // Use the index within the filtered sheet data
          fileType: 'excel', // Assuming excel, could refine if needed
          detectedDocType: docType, // Use the determined docType for the sheet
        };
        currentShipment = await createShipmentFromRowData(
          rowData,
          headers,
          sourceInfo,
          headerMappingResults, // Pass the unified header mapping results
          mappingMetadata,
          potentialSheetOrigin
        );

        if (!currentShipment) {
             this.logger.warn(`[ExcelParser][Sheet: ${sheetName}] Failed to create base shipment from row ${rowIndex}. Skipping row.`);
             // Reset currentShipment to avoid adding items to a failed base
             currentShipment = null; 
        }

      } else {
        // This row likely contains only additional items for the current shipment
        if (currentShipment) {
          const additionalItem = buildShipmentItem(rowData);
          if (additionalItem) {
            currentShipment.items.push(additionalItem);
            this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Added additional item (${additionalItem.itemNumber || additionalItem.description}) from row ${rowIndex} to shipment ${currentShipment.loadNumber} / ${currentShipment.orderNumber}`);
          } else {
            this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Row ${rowIndex} identified as item-only, but failed to build a valid item.`);
          }
        } else {
          // This row is item-only but there's no active shipment - likely an orphan row
          this.logger.warn(`[ExcelParser][Sheet: ${sheetName}] Skipping orphan item row at index ${rowIndex} as no current shipment is active.`);
        }
      }
    } // End of row loop

    // Finalize the very last shipment after the loop ends
    if (currentShipment) {
        // Recalculate total weight for the last shipment
        currentShipment.totalWeight = currentShipment.items.reduce((sum, item) => {
            return sum + (item.weight || 0); // Safely add weights
        }, 0);
        finalShipments.push(currentShipment);
        // Add null check before logging
        const loadNum = currentShipment.loadNumber ?? 'N/A';
        const orderNum = currentShipment.orderNumber ?? 'N/A';
        const sourceRow = currentShipment.sourceInfo?.rowIndex ?? 'N/A'; // Optional chaining
        this.logger.debug(`[ExcelParser][Sheet: ${sheetName}] Finalized last shipment ${loadNum} / ${orderNum} from row ${sourceRow}`);
    }

    return finalShipments;
  }

  /**
   * Parses a TXT file assumed to be tab-separated or comma-separated.
   */
  async parseExcelTxt(content: string, options?: Partial<ExcelParseOptions>): Promise<ShipmentData[]> {
    this.options = { ...this.options, ...options };
    this.logger.info(`[ExcelParser] Starting TXT file parsing...`);
    
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== ''); // Split lines and remove empty ones
    if (lines.length === 0) {
      this.logger.warn("[ExcelParser] TXT file is empty or contains no processable lines.");
      return [];
    }
    
    let headerRowIndex = this.options.headerRowIndex ?? 0;
    let actualHeaders: string[] = [];
    let dataStartIndex = headerRowIndex + 1;
    const sheetDataAoA: string[][] = lines.map(line => this.parseTxtRow(line)); // Parse each line into an array of strings
    
    if (this.options.hasHeaderRow) {
      // Simplified header detection for TXT
      if (sheetDataAoA.length > headerRowIndex) {
        actualHeaders = sheetDataAoA[headerRowIndex];
        this.logger.info(`[ExcelParser] Using headers from TXT line ${headerRowIndex + 1}: ${actualHeaders.join(', ')}`);
      } else {
        throw new Error(`Header row index ${headerRowIndex} is out of bounds for TXT file.`);
      }
    } else {
      actualHeaders = []; // No headers
      dataStartIndex = 0;
      this.logger.info(`[ExcelParser] Processing TXT file with no header row specified.`);
    }
    
    if (sheetDataAoA.length <= dataStartIndex) {
      this.logger.warn(`[ExcelParser] No data rows found after header row ${headerRowIndex} in TXT.`);
      return [];
    }
    
    // TXT files typically don't have inherent sheet names or complex structures for pre-scanning origin easily
    const potentialOrigin = null; 
    const sheetName = undefined; // No sheet name for TXT
    
    // Process rows
    const shipments = await this.processSheetRows(sheetDataAoA, actualHeaders, dataStartIndex, this.options, sheetName, potentialOrigin);
    this.logger.info(`[ExcelParser] Successfully parsed ${shipments.length} shipments from TXT file`);
      return shipments;
  }
  
  /**
   * Parses a single line of text, attempting common delimiters.
   */
  private parseTxtRow(line: string): string[] {
    // Simple logic: Try tab first, then comma. Needs refinement for quoted fields etc.
    if (line.includes('\t')) {
      return line.split('\t').map(s => s.trim());
    }
    return line.split(',').map(s => s.trim());
  }
  
  /**
   * Attempts to find the standard field name for a given header.
   * Uses direct mapping first, then optionally AI mapping.
   */
  private async getStandardFieldName(
    header: string, 
    fieldMapping?: Record<string, string>
  ): Promise<{ fieldName: string; confidence: number; aiMapped: boolean }> {
    const normalizedHeader = header ? header.trim() : '';
    if (!normalizedHeader) {
      return { fieldName: '', confidence: 1, aiMapped: false }; // Empty header
    }
    
    const directMap = fieldMapping || {};
    
    // 1. Check Direct Mapping (Case-insensitive)
    for (const key in directMap) {
      if (key.toLowerCase() === normalizedHeader.toLowerCase()) {
        const mappedName = directMap[key];
        // If directly mapped to 'miscellaneous', treat it as such
        if (mappedName === 'miscellaneous') {
          return { fieldName: 'miscellaneous', confidence: 1, aiMapped: false };
        }
        return { fieldName: mappedName, confidence: 1, aiMapped: false };
      }
    }
    
    // 2. Optional: AI Mapping (if enabled and not found in direct map)
    if (this.options.useAIMapping) {
      try {
        const aiResult = await this.openAiService.mapField(normalizedHeader, getStandardFieldOptions());
        if (aiResult && aiResult.mappedField && aiResult.confidence >= (this.options.aiMappingConfidenceThreshold ?? 0.7)) {
          this.logger.debug(`[ExcelParser] AI mapped '${normalizedHeader}' to '${aiResult.mappedField}' with confidence ${aiResult.confidence}`);
          // If AI maps to 'miscellaneous', respect that
          if (aiResult.mappedField === 'miscellaneous') {
            return { fieldName: 'miscellaneous', confidence: aiResult.confidence, aiMapped: true };
          }
          return { fieldName: aiResult.mappedField, confidence: aiResult.confidence, aiMapped: true };
        } else if (aiResult) {
          this.logger.warn(`[ExcelParser] AI mapping confidence for '${normalizedHeader}' (${aiResult.confidence}) below threshold or no field name. Marking as miscellaneous.`);
        }
      } catch (error: any) {
        this.logger.error(`[ExcelParser] AI mapping failed for header '${normalizedHeader}': ${error.message}`);
      }
    }
    
    // 3. Fallback: Mark as miscellaneous if no mapping found
    this.logger.debug(`[ExcelParser] Header '${normalizedHeader}' not found in direct mappings and AI mapping disabled/failed/below threshold. Marking as miscellaneous.`);
    return { fieldName: 'miscellaneous', confidence: 0, aiMapped: false }; // Treat unmapped as miscellaneous
  }
  
  /**
   * Normalizes a field name (e.g., converts to camelCase).
   * Deprecated: Logic now handled within getStandardFieldName or mappings.
   */
  private normalizeFieldName(fieldName: string): string {
    // Simple example: lowercase and remove spaces
    // Replace with more robust logic if needed (camelCase, etc.)
    // return fieldName.toLowerCase().replace(/\s+/g, '');
    return fieldName; // Keep original for now, standardization happens via mapping
  }
  
  /**
   * Calculates a confidence score for a parsed shipment.
   * Placeholder: Needs actual implementation based on mapping quality, etc.
   */
  calculateConfidence(shipment: ShipmentData): ShipmentConfidenceResult {
    // Placeholder implementation
    let score = 1.0;
    let fieldsReviewed = 0;
    let lowConfidenceFields: string[] = [];
    
    // Check confidence of mapped fields in parsingMetadata
    if (shipment.parsingMetadata && shipment.parsingMetadata.fieldMappingsUsed) {
      const mappings = shipment.parsingMetadata.fieldMappingsUsed;
      mappings.forEach(mapping => {
        if (!mapping.isMiscellaneous) { // Only score non-miscellaneous fields
          fieldsReviewed++;
          if (mapping.needsReview || mapping.confidence < 0.8) { // Example threshold
            score -= 0.1; // Penalize low confidence or review needed
            lowConfidenceFields.push(mapping.originalField || mapping.fieldName);
          }
        }
      });
      // Normalize score based on number of fields?
      // Example: score = Math.max(0, score); 
    }
    
    // Check location resolution confidence
    if (shipment.pickupLocationDetails && (shipment.pickupLocationDetails.resolutionConfidence ?? 1) < 0.7) {
      score -= 0.1;
      lowConfidenceFields.push('pickupLocation');
    }
    if (shipment.destinationLocation && (shipment.destinationLocation.resolutionConfidence ?? 1) < 0.7) {
      score -= 0.1;
      lowConfidenceFields.push('destinationLocation');
    }
    
    // Check for processing errors
    if (shipment.processingErrors && shipment.processingErrors.length > 0) {
      score -= 0.2 * shipment.processingErrors.length; // Penalize errors
    }
    
    score = Math.max(0, Math.min(1, score)); // Clamp score between 0 and 1
    
    const needsReview = score < 0.8 || shipment.needsReview;
    let message = needsReview ? `Review recommended. Confidence: ${score.toFixed(2)}.` : `High confidence: ${score.toFixed(2)}.`;
    if (lowConfidenceFields.length > 0) {
      message += ` Low confidence fields: ${lowConfidenceFields.join(', ')}.`;
    }
    if (shipment.processingErrors && shipment.processingErrors.length > 0) {
      message += ` Processing errors found: ${shipment.processingErrors.join('; ')}.`;
    }
    
    // Update the needsReview flag on the shipment itself
    shipment.needsReview = needsReview; 
    
    // Return structure matching ShipmentConfidenceResult type
      return {
      confidence: score,
      needsReview: needsReview,
      message: message,
    };
  }
  
  /**
   * Retrieves the specific field mapping configuration for a document type.
   */
  getFieldMapping(docType: DocumentType): Record<string, string> {
    // Basic implementation: return mapping based on type
    // TODO: Add more sophisticated logic, maybe merging base and specific?
    switch (docType) {
      case DocumentType.ETD_REPORT:
      return FIELD_MAPPINGS.ETD_REPORT;
      case DocumentType.OUTSTATION_RATES:
      return FIELD_MAPPINGS.OUTSTATION_RATES;
      default:
        this.logger.warn(`[ExcelParser] Unknown document type '${docType}'. Using default mappings.`);
        // Fallback to a default or potentially combine all known mappings?
        // For now, let's use OUTSTATION_RATES as a default if type unknown
        return FIELD_MAPPINGS.OUTSTATION_RATES; 
    }
  }

  /**
   * Higher-level function to orchestrate parsing, potentially detecting type.
   * Deprecated or needs rework - Use parseExcelFile or parseExcelTxt directly.
   */
  async parseExcelToShipmentData(
    data: ArrayBuffer,
    options: ExcelParseOptions = {}
  ): Promise<ShipmentData[]> {
    this.logger.warn('[ExcelParser] parseExcelToShipmentData is deprecated. Use parseExcelFile directly.');
    // Simple pass-through for now
    return this.parseExcelFile(data, options); 
  }
  
  // --- Helper Functions ---
  
  /**
   * Checks if the sheet data matches the ETD report format (heuristic).
   * Deprecated - Format detection should be more robust.
   */
  private isETDFormat(rows: any[][]): boolean {
    // Placeholder heuristic: Check for specific headers
    if (!rows || rows.length === 0) return false;
    const headerRow = rows[0].map(h => String(h).toUpperCase());
    return headerRow.includes('LOAD NO') && headerRow.includes('SHIP TO CUSTOMER NAME');
  }
  
  /**
   * Tries to detect the header row index by looking for common header keywords.
   */
  private detectHeaderRow(rows: any[][], maxRowsToCheck: number): number {
    const commonHeaders = [
      'LOAD NO', 'ORDER NUMBER', 'SHIP DATE', 'PROMISED SHIP DATE',
      'SHIP TO ADDRESS', 'PO NUMBER', 'WEIGHT', 'QUANTITY', 'DESCRIPTION'
    ];
    let bestMatchIndex = -1;
    let maxMatches = 0;
    
    for (let i = 0; i < Math.min(rows.length, maxRowsToCheck); i++) {
      const row = rows[i];
      if (!row || !Array.isArray(row)) continue;
      
      let currentMatches = 0;
      const rowHeaders = row.map(cell => cell ? String(cell).toUpperCase().trim() : '');
      
      for (const commonHeader of commonHeaders) {
        if (rowHeaders.includes(commonHeader)) {
          currentMatches++;
        }
      }
      
      // Consider it a potential header row if it has a significant number of matches
      // Adjust threshold as needed (e.g., > 3 matches)
      if (currentMatches > 3 && currentMatches > maxMatches) {
        maxMatches = currentMatches;
        bestMatchIndex = i;
      }
    }
    this.logger.debug(`[ExcelParser] Header detection: Best match index ${bestMatchIndex} with ${maxMatches} matches.`);
    return bestMatchIndex; // Return the index of the row with the most matches
  }
  
  /**
   * Parses text content, assuming CSV or TSV format.
   * Deprecated - Use parseExcelTxt directly.
   */
  async parseText(textContent: string, options: ExcelParseOptions = {}): Promise<ShipmentData[]> {
    this.logger.warn('[ExcelParser] parseText is deprecated. Use parseExcelTxt directly.');
    return this.parseExcelTxt(textContent, options);
  }
  
  /**
   * Uses OpenAI to map a field name based on its value context.
   * Deprecated - AI mapping is now integrated into getStandardFieldName.
   */
  private async getFieldMappingWithAI(
    header: string,
    value: any
  ): Promise<{ field: string; confidence: number }> {
    this.logger.warn('[ExcelParser] getFieldMappingWithAI is deprecated.');
    // Fallback or throw error
    return { field: 'miscellaneous', confidence: 0 }; 
  }
  
  /**
   * Checks if a field name is part of the standard ShipmentData schema.
   * Deprecated - Standardization is handled by the mapping logic.
   */
  private isStandardField(fieldName: string): boolean {
    this.logger.warn('[ExcelParser] isStandardField is deprecated.');
    // This check is implicitly handled by the FIELD_MAPPINGS now
    const standardFields = Object.values(FIELD_MAPPINGS.OUTSTATION_RATES); // Example
    return standardFields.includes(fieldName);
  }

  // Helper function to check if a row is empty
  private isEmptyRow(rowArray: any[]): boolean {
    if (!rowArray || rowArray.length === 0) {
      return true;
    }
    return rowArray.every(cell => 
      cell === null || 
      cell === undefined || 
      (typeof cell === 'string' && cell.trim() === '')
    );
  }
} 

// Export a singleton instance
export const excelParserService = new ExcelParserService(); 