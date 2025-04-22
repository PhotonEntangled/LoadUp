import { logger } from '@/utils/logger';
import { ExcelParseOptions } from '@/types/parser.types';
import { DocumentType, RawRowData, ShipmentData, ShipmentItem, LocationDetail } from '@/types/shipment';
import { convertExcelDateToJSDate } from '@/lib/excel-helper'; // Corrected path
import type { HeaderMappingResultType } from './ExcelParserService'; // Import the type
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'; // Import plugin
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
dayjs.extend(customParseFormat); // Extend dayjs with the plugin
dayjs.extend(utc); // Extend dayjs with UTC plugin

interface HeaderDetectionResult {
    headers: string[];
    headerRowIndex: number; // Original index in the full sheet data (caller must determine)
    filteredHeaderIndex: number; // Index within the non-empty rows array passed to function
    dataStartIndex: number; // Index within the non-empty rows array where data begins
    potentialOrigin: string | null;
}

/**
 * Helper function to check if a row is empty.
 * A row is considered empty if all its cells are null, undefined, or empty strings after trimming.
 */
export function isEmptyRow(rowArray: any[]): boolean {
    if (!rowArray || rowArray.length === 0) {
        return true;
    }
    return rowArray.every(cell =>
        cell === null ||
        cell === undefined ||
        (typeof cell === 'string' && cell.trim() === '')
    );
}

/**
 * Represents the structure needed for field mapping functions.
 * This avoids importing the entire ExcelParserService or FieldMapperService here.
 */
interface FieldMappingFunctions {
    getFieldMapping: (docType: DocumentType) => Record<string, string>;
    getStandardFieldName: (header: string | null, config: Record<string, string>, opts: Pick<ExcelParseOptions, 'aiFieldMappingEnabled' | 'aiMappingConfidenceThreshold'>) => Promise<{ fieldName: string; aiMapped: boolean; confidence: number }>;
}

/**
 * Detects the header row, data start index, and potential origin address
 * by analyzing the initial rows of the sheet data (provided as array of arrays).
 * Requires field mapping logic to be passed in.
 */
export async function findHeadersAndDataStart(
    sheetDataAoA: any[][], // Expects only the non-empty rows
    sheetName: string | undefined,
    options: Pick<ExcelParseOptions, 'documentType' | 'aiFieldMappingEnabled' | 'aiMappingConfidenceThreshold'>,
    mappingFuncs: FieldMappingFunctions, // Pass the mapping functions
    maxRowsToCheck: number = 20
): Promise<HeaderDetectionResult | null> {
    logger.debug(`[ExcelParserUtils][Sheet: ${sheetName}] Starting header detection...`);
    let bestHeaderIndex = -1;
    let maxRecognizedFields = -1;
    let potentialOrigin = null;
    const docType = options.documentType || DocumentType.UNKNOWN;
    const fieldMappingConfig = mappingFuncs.getFieldMapping(docType as DocumentType);

    const checkRows = Math.min(sheetDataAoA.length, maxRowsToCheck);

    for (let i = 0; i < checkRows; i++) {
        const row = sheetDataAoA[i];
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Checking row: ${JSON.stringify(row)}`); // Log row content
        if (!row || row.length === 0 || isEmptyRow(row)) {
            logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Skipping empty row.`);
            continue;
        }

        if (i < 5 && !potentialOrigin) {
            const rowText = row.map(cell => cell ? String(cell).trim() : '').join(' ');
            if (/(?:address|location|city|state|zip|pincode)/i.test(rowText) && row.filter(c => c).length < 5) {
                potentialOrigin = rowText;
                logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i + 1}] Found potential origin candidate: "${potentialOrigin}"`);
            }
        }

        let recognizedFields = 0;
        let containsNumberLikelyData = false;
        const potentialHeaders = row.map(cell => cell ? String(cell).trim() : '');
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Potential headers: ${JSON.stringify(potentialHeaders)}`);

        const mappingPromises = potentialHeaders.map(header => mappingFuncs.getStandardFieldName(header, fieldMappingConfig, options));
        const mappings = await Promise.all(mappingPromises);
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Standard field mappings attempted: ${JSON.stringify(mappings)}`); // Log mapping results

        mappings.forEach(mapping => {
            if (mapping.fieldName && mapping.fieldName !== 'miscellaneous') {
                recognizedFields++;
            }
        });
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Recognized fields count: ${recognizedFields}`); // Log recognized count

        if (i + 1 < sheetDataAoA.length) {
            const nextRow = sheetDataAoA[i+1];
            if (nextRow && nextRow.some(cell =>
                typeof cell === 'number' ||
                (typeof cell === 'string' && /^[\d.,$€£¥\s()-]+$/.test(cell.trim()) && cell.trim() !== '')
            )) {
                containsNumberLikelyData = true;
            }
        }
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Does next row contain numeric-like data? ${containsNumberLikelyData}`); // Log next row check

        const isBetterHeader = (containsNumberLikelyData && recognizedFields > maxRecognizedFields) ||
                               (recognizedFields > 2 && recognizedFields > maxRecognizedFields + 1);
        logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Is this row a better header candidate? ${isBetterHeader} (Current Max Recognized: ${maxRecognizedFields})`);

        if (isBetterHeader) {
            const looksLikeDataRow = potentialHeaders.every(h => h === '' || !isNaN(parseFloat(h.replace(/[^\d.-]/g, ''))));
            logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] Does this potential header row look like a data row itself? ${looksLikeDataRow}`);
            if (!looksLikeDataRow || potentialHeaders.filter(h => h !== '').length < 3) {
                maxRecognizedFields = recognizedFields;
                bestHeaderIndex = i;
                logger.debug(`[HeaderDetect][Sheet: ${sheetName}][Row ${i+1}] **** New best header candidate found at filtered index ${i}. Recognized fields: ${recognizedFields}. ****`);
            }
        }
    }

    if (bestHeaderIndex !== -1) {
        const headers = sheetDataAoA[bestHeaderIndex].map(cell => cell ? String(cell).trim() : '');
        logger.info(`[HeaderDetect][Sheet: ${sheetName}] Final best header index (filtered): ${bestHeaderIndex}. Final Headers: ${JSON.stringify(headers)}`); // Log final decision
        return {
            headers: headers,
            headerRowIndex: -1, // Caller must calculate original index
            filteredHeaderIndex: bestHeaderIndex,
            dataStartIndex: bestHeaderIndex + 1,
            potentialOrigin: potentialOrigin
        };
    } else {
        logger.warn(`[HeaderDetect][Sheet: ${sheetName}] Header detection failed. No suitable header row found within the first ${checkRows} non-empty rows.`);
        return null;
    }
}

/**
 * Pre-scans the first few rows of a sheet for potential origin location strings.
 * Looks for keywords and address-like patterns.
 * @param jsonData The raw sheet data (array of arrays).
 * @param rowsToScan Number of rows from the top to scan.
 * @returns The most likely origin string found, or null.
 */
export function preScanForOrigin(jsonData: any[][], rowsToScan: number): string | null {
    logger.debug(`[preScanForOrigin] Scanning first ${rowsToScan} rows for potential origin.`);
    let bestCandidate: string | null = null;
    const maxRows = Math.min(rowsToScan, jsonData.length);
    // ... rest of preScanForOrigin ...
    return bestCandidate;
}

/**
 * Simple header row finder based on keywords (less robust than findHeadersAndDataStart).
 * Returns the 0-based index or -1 if not found.
 */
export function findHeaderRowIndex(sheetDataAoA: any[][], docType?: DocumentType | string, maxRowsToCheck: number = 20): number {
    const keywords = ['load', 'order', 'shipment', 'date', 'weight', 'quantity', 'address', 'customer', 'status', 'description']; // Common keywords
    let bestMatchIndex = -1;
    let maxKeywordMatches = 2; // Require at least 3 keyword matches

    for (let i = 0; i < Math.min(sheetDataAoA.length, maxRowsToCheck); i++) {
        const row = sheetDataAoA[i];
        if (!row || isEmptyRow(row)) continue;

        let currentMatches = 0;
        row.forEach(cell => {
            const cellStr = String(cell || '').toLowerCase();
            if (keywords.some(kw => cellStr.includes(kw))) {
                currentMatches++;
            }
        });

        if (currentMatches > maxKeywordMatches) {
            maxKeywordMatches = currentMatches;
            bestMatchIndex = i;
        }
    }
    logger.debug(`[findHeaderRowIndex - Simple] Found best header index: ${bestMatchIndex} with ${maxKeywordMatches} keyword matches.`);
    return bestMatchIndex;
}

/**
 * Normalizes an array of header strings (trim, lowercase).
 */
export function normalizeHeaders(headers: any[]): string[] {
    return headers.map(header => String(header || '').trim().toLowerCase());
}

// ---> START: detectDocumentType Implementation <---
// /**
//  * Detects the document type based on the presence and combination of header fields.
//  * @param headers - An array of normalized (lowercase, trimmed) header strings.
//  * @returns The detected DocumentType or null if unknown.
//  */
// export function detectDocumentType(headers: string[]): DocumentType | null {
//    ...
// }
// ---> END: detectDocumentType Implementation <---

// Example of how detectHeaderRow might be refactored if needed, but findHeadersAndDataStart is more comprehensive
/*
export function detectHeaderRowSimple(rows: any[][], maxRowsToCheck: number): number {
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

      // Simple heuristic: more matches is better
      if (currentMatches > 3 && currentMatches > maxMatches) {
        maxMatches = currentMatches;
        bestMatchIndex = i;
      }
    }
    logger.debug(`[ExcelParserUtils] Simple header detection result: index ${bestMatchIndex} with ${maxMatches} matches.`);
    return bestMatchIndex; // Returns index in the provided rows array, or -1
}
*/

/**
 * Finds the index of the next row that is not empty.
 * @param data The array of arrays representing sheet data.
 * @param startIndex The index *after* which to start searching.
 * @param maxLookahead The maximum number of rows to look ahead.
 * @returns The index of the next non-empty row, or -1 if none found within the lookahead range.
 */
export function findNextNonEmptyRowIndex(data: any[][], startIndex: number, maxLookahead: number): number {
    for (let i = 1; i <= maxLookahead; i++) {
        const nextIndex = startIndex + i;
        if (nextIndex >= data.length) {
            break; // Reached end of data
        }
        if (!isEmptyRow(data[nextIndex])) {
            return nextIndex;
        }
    }
    return -1; // No non-empty row found in range
}

// --- ADDED HELPER TO FIND ACTUAL KEY FOR A STANDARD FIELD --- 
/**
 * Finds the actual key used in RawRowData for a given standard field name,
 * based on the detailed mapping result.
 * 
 * @param standardFieldName The standard field name (e.g., 'quantity', 'itemNumber').
 * @param headerMappingResult The result object from mapHeadersToStandardFields.
 * @returns The actual key (which might be the standard field name or a 'misc_' prefixed name),
 *          or undefined if no mapping detail corresponds to the standard field.
 */
export function findActualKeyForStandardField(
    standardFieldName: string,
    headerMappingResult: HeaderMappingResultType
): string | undefined {
    if (!headerMappingResult || !headerMappingResult.detailedMapping) {
        logger.warn(`[findActualKeyForStandardField] Invalid headerMappingResult provided for standard field '${standardFieldName}'.`);
        return undefined;
    }
    // Find the mapping detail where the *standardized output* field matches
    const detail = headerMappingResult.detailedMapping.find(
        (mapping) => mapping.mappedField === standardFieldName
    );

    // The 'mappedField' property *is* the key used in the RawRowData object
    if (detail) {
        // logger.debug(`[findActualKeyForStandardField] Found key '${detail.mappedField}' for standard field '${standardFieldName}'`);
        return detail.mappedField; 
    } else {
        // Optionally, search for misc_ fields if direct standard match fails?
        // We could search for the first mapping whose originalHeader contains standardFieldName?
        const miscDetail = headerMappingResult.detailedMapping.find(
            (mapping) => mapping.mappedField.startsWith('misc_') && 
                         mapping.originalHeader.toLowerCase().includes(standardFieldName.toLowerCase())
        );
        if(miscDetail) {
            logger.debug(`[findActualKeyForStandardField] No direct map for '${standardFieldName}', found potential misc key '${miscDetail.mappedField}' based on original header '${miscDetail.originalHeader}'`);
            return miscDetail.mappedField;
        }
        logger.debug(`[findActualKeyForStandardField] No mapping found for standard field '${standardFieldName}'`);
        return undefined;
    }
}
// --- END ADDED HELPER --- 

// Helper function to safely extract string fields
export function extractStringField(rowData: RawRowData, fieldName: string): string | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  // Convert to string, replace newlines with spaces, then trim
  const trimmed = String(value).replace(/\r?\n/g, ' ').trim();
  return trimmed === '' ? undefined : trimmed;
}

// Helper function to safely extract numeric fields
export function extractNumericField(rowData: RawRowData, fieldName: string): number | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

// Helper function to safely extract boolean fields
export function extractBooleanField(rowData: RawRowData, fieldName: string): boolean | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const lowerCaseValue = String(value).toLowerCase().trim();
  if (lowerCaseValue === 'true' || lowerCaseValue === 'yes' || lowerCaseValue === '1') {
    return true;
  }
  if (lowerCaseValue === 'false' || lowerCaseValue === 'no' || lowerCaseValue === '0') {
    return false;
  }
  return undefined;
}

// List of possible date formats to try parsing
const DATE_FORMATS = [
  'YYYY-MM-DD HH:mm:ss',
  'YYYY-MM-DDTHH:mm:ssZ', // ISO 8601 with Z
  'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO 8601 with Z and milliseconds
  'M/D/YY HH:mm',
  'M/D/YYYY HH:mm',
  'MM/DD/YYYY HH:mm',
  'YYYY-MM-DD',
  'M/D/YY', // ADDED THIS FORMAT
  'M/D/YYYY',
  'MM/DD/YYYY',
  'MM/DD/YY',
  'D-MMM-YY',
  'D-MMM-YYYY', 
  'DD-MMM-YYYY HH:mm:ss' // Example: 01-APR-2024 14:30:00
];

/**
 * Extracts and validates a date field from raw row data.
 * Handles both Excel date numbers and various string formats.
 * @param rowData The raw data object for the row.
 * @param fieldName The standard field name to extract (e.g., 'requestDate').
 * @returns A valid Date object or undefined if extraction/validation fails.
 */
export function extractDateField(rowData: RawRowData, fieldName: string): Date | undefined {
    const functionId = `parserUtils:extractDateField`;
    const value = rowData[fieldName];
    logger.warn(`[${functionId}:ENTRY] Field: '${fieldName}', Type: ${typeof value}, Value: "${value}"`); // Log entry with type/value

    if (value === null || value === undefined || String(value).trim() === '') {
        logger.debug(`[${functionId}] Field '${fieldName}' is null, undefined, or empty. Returning undefined.`);
        return undefined;
    }

    // 1. Handle Excel Date Numbers
    if (typeof value === 'number') {
        if (value > 0 && value < 60000) { // Plausible range for Excel dates
            try {
                const jsDate = convertExcelDateToJSDate(value);
                // Additional validation: check if the resulting date is reasonable
                if (jsDate && jsDate.getFullYear() > 1950 && jsDate.getFullYear() < 2100) { 
                    logger.debug(`[${functionId}] Successfully converted Excel date number ${value} for field '${fieldName}' to JS Date: ${jsDate.toISOString()}`);
                    return jsDate;
                } else {
                    logger.warn(`[${functionId}] Excel date number ${value} for field '${fieldName}' resulted in an unreasonable date: ${jsDate}. Skipping.`);
                    return undefined;
                }
            } catch (e: any) { 
                logger.warn(`[${functionId}] Error converting Excel date number ${value} for field '${fieldName}': ${e.message}`);
                return undefined;
            }
        } else {
            logger.warn(`[${functionId}] Numeric value ${value} for field '${fieldName}' is outside the plausible range for an Excel date. Skipping.`);
            return undefined;
        }
    }

    // 2. Handle Date Strings using dayjs with multiple formats
    if (typeof value === 'string') {
        const dateString = value.trim();
        logger.debug(`[${functionId}] Attempting dayjs parse for field '${fieldName}'. Input value: "${dateString}" (Length: ${dateString.length})`);
        
        let parsedDate: dayjs.Dayjs | null = null; // Initialize as null

        // Loop through formats and attempt parsing with dayjs.utc
        for (const format of DATE_FORMATS) {
            const attempt = dayjs.utc(dateString, format, true); // Use current format, strict
            if (attempt.isValid()) {
                parsedDate = attempt; // Assign if valid
                logger.debug(`[${functionId}] Parsed "${dateString}" using dayjs.utc with format ${format}.`);
                break; // Exit loop on first success
            }
        }

        // Check if dayjsDate is still null (meaning no format worked)
        if (parsedDate) { // Check if we have a valid dayjsDate object
            const jsDate = parsedDate.toDate();
            // Optional: Add reasonableness check for parsed string dates too
            if (jsDate.getFullYear() > 1950 && jsDate.getFullYear() < 2100) {
                logger.debug(`[${functionId}] Successfully parsed date string "${dateString}" for field '${fieldName}' to JS Date: ${jsDate.toISOString()}`);
                return jsDate;
            } else {
                 logger.warn(`[${functionId}] Parsed date string "${dateString}" for field '${fieldName}' resulted in an unreasonable date: ${jsDate}. Skipping.`);
                 return undefined;
            }
        } else {
            // This block is reached if dayjs failed to parse with any format
            logger.warn(`[${functionId}] Could not parse date string "${dateString}" into a valid JS Date object using dayjs with any known format.`);
            return undefined;
        }
    }

    // 3. Handle potential pre-parsed Date objects (less common from raw parsing)
    if (value instanceof Date) {
        if (!isNaN(value.getTime())) { // Check if it's a valid date object
            logger.debug(`[${functionId}] Field '${fieldName}' was already a valid Date object: ${value.toISOString()}`);
            return value;
        } else {
             logger.warn(`[${functionId}] Field '${fieldName}' was a Date object, but it was invalid.`);
             return undefined;
        }
    }

    logger.warn(`[${functionId}] Field '${fieldName}' has an unhandled type (${typeof value}) or format. Value: "${value}". Returning undefined.`);
    return undefined;
}

// --- ADDED HELPER ---
/**
 * Analyzes a row to determine if it's likely the first row of actual data,
 * rather than a header or metadata row.
 * Uses heuristics based on common data patterns.
 * @param row The row data array to analyze.
 * @param potentialHeaders The combined headers detected so far (used for context).
 * @returns True if the row looks like a data row, false otherwise.
 */
export function isLikelyDataRow(row: any[], potentialHeaders: string[]): boolean {
    if (isEmptyRow(row)) {
        return false; // Empty rows aren't data rows
    }

    const populatedCells = row.filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (populatedCells.length < 3) {
        // Very sparse rows are unlikely to be the start of the main data block, unless it's a very narrow sheet
        if (potentialHeaders.length >= 3) return false;
    }

    // Heuristic 1: Check if the first non-empty cell looks like a typical ID or date/time
    const firstPopulatedCell = String(populatedCells[0] || '').trim();
    const startsWithNumberLikelyId = /^[\\d,.-]+$/.test(firstPopulatedCell) && firstPopulatedCell.length > 2; // Starts with digits (allowing separators), length > 2
    const looksLikeDateOrTime = /(\d{1,2}[\\/\\-]\d{1,2}[\\/\\-]\d{2,4})|(\d{1,2}:\d{2})/.test(firstPopulatedCell);

    if (startsWithNumberLikelyId || looksLikeDateOrTime) {
        logger.debug(`[isLikelyDataRow] Row likely data based on first cell pattern: "${firstPopulatedCell}"`);
        return true;
    }

    // Heuristic 2: Check for actual dates in columns with "date" in the potential header
    let dateColumnsCount = 0;
    let actualDatesCount = 0;
    for (let i = 0; i < potentialHeaders.length; i++) {
        if (potentialHeaders[i].toLowerCase().includes('date')) {
            dateColumnsCount++;
            const cellValue = row[i];
            // Check if cellValue is not essentially empty before processing
            if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') {
                let potentialDate: Date | undefined = undefined; // Use undefined consistently
                try {
                    if (typeof cellValue === 'number' && cellValue > 0) {
                         const d = convertExcelDateToJSDate(cellValue);
                         // Validate the converted date - check for validity using robust runtime check
                         if (typeof d === 'object' && d !== null && Object.prototype.toString.call(d) === '[object Date]') {
                              // Use 'as any' to bypass incorrect 'never' inference for getTime within isNaN check
                              if (!isNaN((d as any).getTime())) {
                                 potentialDate = d as Date; // Assert type after runtime check
                              } else {
                                 // Don't log noise if isNaN fails
                              }
                         } else {
                             // Don't log noise if type check fails
                         }
                    } else if (typeof cellValue === 'string') {
                         const trimmedValue = cellValue.trim();
                         if(trimmedValue){
                            let potentialDateInternal: Date | null = null; // Use null initially
                            // Attempt 1: Regex replace
                            try {
                                // Ensure the constructor is only called if the replace potentially happens or it's ISO-like
                                const dateString1 = trimmedValue.includes('T') ? trimmedValue : trimmedValue.replace(/(\\d{1,2})[\\/\\-](\\d{1,2})[\\/\\-](\\d{2,4})/, '$3-$1-$2');
                                const dateAttempt1 = new Date(dateString1);
                                if (!isNaN(dateAttempt1.getTime())) {
                                    potentialDateInternal = dateAttempt1;
                                }
                            } catch {} // Ignore errors on first attempt

                            // Attempt 2: Direct parse (if first failed)
                            if (!potentialDateInternal) {
                                try {
                                     const dateAttempt2 = new Date(trimmedValue);
                                     if (!isNaN(dateAttempt2.getTime())) {
                                         potentialDateInternal = dateAttempt2;
                                     }
                                } catch {} // Ignore errors on second attempt
                            }

                            // Assign to outer variable if a valid date was found
                            if (typeof potentialDateInternal === 'object' && potentialDateInternal !== null && Object.prototype.toString.call(potentialDateInternal) === '[object Date]') {
                                 if (!isNaN(potentialDateInternal.getTime())) {
                                    potentialDate = potentialDateInternal as Date; // Assert type after runtime check
                                 } else {
                                    // Don't log noise if isNaN fails
                                 }
                            } else {
                                // Don't log noise if type check fails
                            }
                         }
                    }

                    // Check year range only if we found a valid date
                    if (typeof potentialDate === 'object' && potentialDate !== null && Object.prototype.toString.call(potentialDate) === '[object Date]') {
                         if (!isNaN(potentialDate.getTime())) {
                            const date = potentialDate as Date; // Assert type after runtime check
                            if (date.getFullYear() > 1980 && date.getFullYear() < 2050) {
                                actualDatesCount++;
                            } else {
                                // Log if date is valid but outside range, but don't count it for the heuristic
                                logger.debug(`[isLikelyDataRow] Date ${date.toISOString()} found in row index ${i} is outside expected year range (1980-2050).`);
                            }
                         } else {
                             // Don't log noise if isNaN fails
                         }
                    } else {
                        // Don't log noise if type check fails
                    }
                } catch (e) {
                     logger.debug(`[isLikelyDataRow] Error processing potential date value "${cellValue}" in row index ${i}. Error: ${e}`);
                }
            }
        }
    }

    // If multiple date columns exist, and at least one contains a valid date, lean towards it being data
    if (dateColumnsCount >= 1 && actualDatesCount > 0) { // Changed from > 1 to >= 1
        logger.debug(`[isLikelyDataRow] Row likely data based on date consistency (${actualDatesCount}/${dateColumnsCount})`);
        return true;
    }

    // Heuristic 3: Check for numeric values in typical numeric columns (e.g., qty, weight)
    let numericColumnsCount = 0;
    let actualNumericCount = 0;
    const numericKeywords = ['qty', 'quantity', 'weight', 'amount', 'total', 'pcs', 'pieces', 'pallets', 'charge', 'rate', 'cube', 'volume', 'cost', 'price'];
    for (let i = 0; i < potentialHeaders.length; i++) {
        const lowerHeader = potentialHeaders[i].toLowerCase();
        if (numericKeywords.some(kw => lowerHeader.includes(kw))) {
            numericColumnsCount++;
            const cellValue = row[i];
            if (typeof cellValue === 'number') {
                actualNumericCount++;
            } else if (typeof cellValue === 'string') {
                 const trimmedStr = cellValue.trim();
                 // Allow strings that look numeric (potentially with currency/parens/commas)
                 // Remove common currency symbols and commas before checking if it's a valid number
                 const cleanedStr = trimmedStr.replace(/[$,€£¥()]/g, '').replace(/,/g, '');
                 if (cleanedStr !== '' && !isNaN(parseFloat(cleanedStr))) {
                    actualNumericCount++;
                 }
            }
        }
    }

    // More lenient check for numeric consistency
    if (numericColumnsCount > 0 && actualNumericCount >= Math.max(1, numericColumnsCount / 2)) {
        logger.debug(`[isLikelyDataRow] Row likely data based on numeric consistency (${actualNumericCount}/${numericColumnsCount})`);
        return true;
    }

    // Heuristic 4: Check for typical text patterns in address/name columns
    let addressNameColumns = 0;
    let addressNameMatches = 0;
    const addressKeywords = ['address', 'street', 'city', 'state', 'zip', 'postal', 'name', 'company', 'location'];
     for (let i = 0; i < potentialHeaders.length; i++) {
        const lowerHeader = potentialHeaders[i].toLowerCase();
         if (addressKeywords.some(kw => lowerHeader.includes(kw))) {
             addressNameColumns++;
             const cellValue = row[i];
             if (typeof cellValue === 'string' && cellValue.trim().length > 3 && /\\s/.test(cellValue.trim())) { // Contains space, likely multi-word text
                 addressNameMatches++;
             }
         }
     }
     if (addressNameColumns > 1 && addressNameMatches >= addressNameColumns / 2) {
         logger.debug(`[isLikelyDataRow] Row likely data based on address/name consistency (${addressNameMatches}/${addressNameColumns})`);
         return true;
     }


    // If none of the above strong indicators triggered, assume it's not conclusively a data row
    logger.debug(`[isLikelyDataRow] Row did not meet strong data row heuristics.`);
    return false;
}
// --- END isLikelyDataRow function ---

// Remove any trailing braces or characters below this line.