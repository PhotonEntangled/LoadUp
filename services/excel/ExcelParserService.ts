/**
 * Service for parsing Excel files using xlsx library with AI-enhanced field mapping
 */

import * as XLSX from 'xlsx';
import { ShipmentData, ShipmentItem, ShipmentConfidenceResult, AIMappedField } from '../../types/shipment';
import { openAIService } from '../ai/OpenAIService';
import { getPotentialMatches, getStandardFieldOptions } from '../ai/schema-reference';
import { logger } from '../../utils/logger';
import { DocumentType } from '../../apps/admin-dashboard/lib/document-processing';
import ExcelJS from 'exceljs';

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

/**
 * Interface for field mapping results with confidence scores
 */
export interface FieldMappingResult {
  fieldName: string;
  confidence: number;
  aiMapped: boolean;
  originalField?: string;
  isMiscellaneous?: boolean;
  needsReview?: boolean;
}

// Information about AI mapped fields for a row
interface RowAIMappingInfo {
  mappings: AIMappedField[];
}

/**
 * Field mapping configuration for different document types
 * Includes multiple variations of field names for better matching
 */
export const FIELD_MAPPINGS = {
  ETD_REPORT: {
    // Source field name -> Standardized field name
    'LOAD NO': 'loadNumber',
    'Load No': 'loadNumber',
    'LOAD NUMBER': 'loadNumber',
    'Load Number': 'loadNumber',
    'load no': 'loadNumber',
    'load number': 'loadNumber',
    
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
    
    'Order Number': 'orderNumber',
    'ORDER NUMBER': 'orderNumber',
    'Order No': 'orderNumber',
    'ORDER NO': 'orderNumber',
    
    'Ship To Area': 'shipToArea',
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
    
    'State/ Province': 'shipToState',
    'STATE/ PROVINCE': 'shipToState',
    'State': 'shipToState',
    'STATE': 'shipToState',
    'Province': 'shipToState',
    'PROVINCE': 'shipToState',
    
    'CONTACT NO': 'contactNumber',
    'Contact No': 'contactNumber',
    'Contact Number': 'contactNumber',
    'CONTACT NUMBER': 'contactNumber',
    'Phone': 'contactNumber',
    'PHONE': 'contactNumber',
    
    'Customer PO Number': 'poNumber',
    'CUSTOMER PO NUMBER': 'poNumber',
    'PO Number': 'poNumber',
    'PO NUMBER': 'poNumber',
    'PO No': 'poNumber',
    'PO NO': 'poNumber',
    
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
    'WEIGHT (kg)': 'weight'
  },
  
  OUTSTATION_RATES: {
    // Use the same expanded field mappings for consistency
    // Source field name -> Standardized field name
    'Load no': 'loadNumber',
    'LOAD NO': 'loadNumber',
    'Load No': 'loadNumber',
    'LOAD NUMBER': 'loadNumber',
    'Load Number': 'loadNumber',
    'load no': 'loadNumber',
    'load number': 'loadNumber',
    
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
    
    'Order Number': 'orderNumber',
    'ORDER NUMBER': 'orderNumber',
    'Order No': 'orderNumber',
    'ORDER NO': 'orderNumber',
    
    'Ship To Area': 'shipToArea',
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
    
    'State/ Province': 'shipToState',
    'STATE/ PROVINCE': 'shipToState',
    'State': 'shipToState',
    'STATE': 'shipToState',
    'Province': 'shipToState',
    'PROVINCE': 'shipToState',
    
    'Contact Number': 'contactNumber',
    'CONTACT NUMBER': 'contactNumber',
    'CONTACT NO': 'contactNumber',
    'Contact No': 'contactNumber',
    'Phone': 'contactNumber',
    'PHONE': 'contactNumber',
    
    'PO NUMBER': 'poNumber',
    'Customer PO Number': 'poNumber',
    'CUSTOMER PO NUMBER': 'poNumber',
    'PO Number': 'poNumber',
    'PO No': 'poNumber',
    'PO NO': 'poNumber',
    
    'Remark': 'remarks',
    'REMARK': 'remarks',
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
    'WEIGHT (kg)': 'weight'
  }
};

/**
 * Service for parsing Excel files with AI-enhanced field mapping
 */
export class ExcelParserService {
  private options: ExcelParseOptions = {
    hasHeaderRow: true,
    headerRow: 1,
    useAIMapping: true, // Enable AI mapping by default
    aiMappingConfidenceThreshold: 0.7, // Default confidence threshold
    sheetIndex: undefined, // Process all sheets by default
    headerRowIndex: undefined,
    fieldMapping: undefined
  };
  
  private logger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  constructor(private openAiService = openAIService) {}

  /**
   * Parse an Excel file directly from binary data
   * @param excelData Binary Excel data
   * @param options Parsing options
   * @returns Array of ShipmentData objects
   */
  async parseExcelFile(excelData: ArrayBuffer, options?: Partial<ExcelParseOptions>): Promise<ShipmentData[]> {
    const opts = { ...this.options, ...options };
    
    try {
      logger.info("Starting Excel file parsing...");
      
      // Parse Excel file using xlsx library
      const workbook = XLSX.read(new Uint8Array(excelData), { type: 'array' });
      
      // Get sheet names
      const sheetNames = workbook.SheetNames;
      logger.info(`Found ${sheetNames.length} sheets in workbook:`, sheetNames);
      
      // Ensure the workbook contains sheets
      if (!sheetNames.length) {
        throw new Error('Excel file contains no sheets');
      }
      
      let allShipments: ShipmentData[] = [];
      
      // Process either all sheets or specified sheet
      const sheetsToProcess = opts.sheetIndex !== undefined 
        ? [sheetNames[opts.sheetIndex]]
        : sheetNames;
      
      if (opts.sheetIndex !== undefined && !sheetsToProcess[0]) {
        throw new Error(`Sheet at index ${opts.sheetIndex} does not exist`);
      }
      
      logger.info(`Processing ${sheetsToProcess.length} sheets: ${sheetsToProcess.join(', ')}`);
      
      // Keep track of shipments per sheet for summary
      const shipmentsBySheet: Record<string, number> = {};
      
      // Process each sheet
      for (const sheetName of sheetsToProcess) {
        logger.info(`Processing sheet: ${sheetName}`);
        
        // Get the worksheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        logger.info(`Extracted ${jsonData.length} rows from worksheet: ${sheetName}`);
        
        // Find header row (if applicable)
        let headerRow: string[] = [];
        let dataStartIndex = 0;
        
        if (opts.hasHeaderRow) {
          // Look for a row that might be the header (scan more rows to be sure)
          for (let i = 0; i < Math.min(30, jsonData.length); i++) {
            const row = jsonData[i] as string[];
            if (!row || row.length === 0) continue;
            
            logger.info(`Examining potential header row ${i}:`, row);
            
            // Check if this row contains common header terms
            const possibleHeaderTerms = [
              'LOAD NO', 'Load No', 'Order Number', 'Ship Date', 'Customer', 
              'Address', 'PO', 'Remarks', 'Notes', 'Description', 'Weight'
            ];
            
            const headerTermsFound = possibleHeaderTerms.filter(term => 
              row.some(cell => typeof cell === 'string' && 
                      cell.toString().toLowerCase().includes(term.toLowerCase()))
            ).length;
            
            logger.info(`Row ${i} header terms found: ${headerTermsFound}`);
            
            // If we find at least 3 common header terms, use this as the header row
            if (headerTermsFound >= 3) {
              headerRow = row.map(cell => cell?.toString().trim() || '');
              dataStartIndex = i + 1;
              logger.info(`Using row ${i} as header:`, headerRow);
              break;
            }
          }
          
          // If no header row found, use the first row as header
          if (headerRow.length === 0 && jsonData.length > 0) {
            headerRow = (jsonData[0] as string[]).map(cell => cell?.toString().trim() || '');
            dataStartIndex = 1;
            logger.info(`No clear header found, using first row as header:`, headerRow);
          }
        }
        
        // Map header rows to standardized field names for better debugging
        const mappedHeaders = headerRow.map(header => {
          const mappedField = opts.fieldMapping?.[header];
          return { original: header, mapped: mappedField };
        });
        logger.info("Mapped headers:", mappedHeaders);
        
        // Process data rows with sheet name information
        const sheetShipments = await this.processSheetRows(jsonData, headerRow, dataStartIndex, opts, sheetName);
        
        // Add shipments from this sheet to the total
        allShipments = [...allShipments, ...sheetShipments];
        
        // Track shipments per sheet
        shipmentsBySheet[sheetName] = sheetShipments.length;
        
        logger.info(`Extracted ${sheetShipments.length} shipments from sheet: ${sheetName}`);
      }
      
      // Log summary of processing results
      const sheetSummary = Object.entries(shipmentsBySheet)
        .map(([sheet, count]) => `${sheet}: ${count} shipments`)
        .join(', ');
      
      logger.info(`Excel processing complete. Total: ${allShipments.length} shipments across ${sheetsToProcess.length} sheets (${sheetSummary})`);
      
      // Log the first shipment for debugging
      if (allShipments.length > 0) {
        logger.info("Sample shipment data:", {
          loadNumber: allShipments[0].loadNumber,
          orderNumber: allShipments[0].orderNumber,
          shipToCustomer: allShipments[0].shipToCustomer,
          remarks: allShipments[0].remarks,
          itemCount: allShipments[0].items.length,
          sheetName: allShipments[0].miscellaneousFields?.sheetName || 'Not available'
        });
      }
      
      return allShipments;
    } catch (error) {
      logger.error('Error parsing Excel file:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Process rows from a sheet to extract shipments
   * @param jsonData The sheet data as JSON
   * @param headerRow The header row
   * @param dataStartIndex The index where data starts
   * @param opts Parsing options
   * @param sheetName The name of the sheet being processed
   * @returns Array of ShipmentData objects
   */
  private async processSheetRows(
    jsonData: any[],
    headerRow: string[],
    dataStartIndex: number,
    opts: ExcelParseOptions,
    sheetName?: string
  ): Promise<ShipmentData[]> {
    const shipments: ShipmentData[] = [];
    let currentShipment: ShipmentData | null = null;
    
    for (let i = dataStartIndex; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || row.length === 0 || row.every(cell => !cell)) {
        continue;
      }
      
      // Map values using header or positional mapping
      const rowData = await this.mapRowToFields(row, headerRow, opts.fieldMapping);
      
      // Add sheet name to rowData for tracking
      if (sheetName) {
        // Add to miscellaneous fields which already exists in our system
        if (!rowData.miscellaneousFields) {
          rowData.miscellaneousFields = {};
        }
        rowData.miscellaneousFields.sheetName = sheetName;
      }
      
      // For debugging - show the first few mapped rows
      if (i < dataStartIndex + 3) {
        logger.info(`Mapped row ${i}:`, rowData);
      }
      
      // Determine if this is a new shipment or an additional item
      if (rowData.loadNumber && rowData.loadNumber !== '') {
        // This is a new shipment
        if (currentShipment) {
          shipments.push(currentShipment);
        }
        
        currentShipment = this.createShipmentFromRowData(rowData);
      } else if (currentShipment) {
        // This is an additional item for the current shipment
        const item = this.createItemFromRowData(rowData);
        if (item) {
          currentShipment.items.push(item);
          if (item.weight) {
            currentShipment.totalWeight += item.weight;
          }
        }
        
        // Check if this row has any additional data for the current shipment
        // Sometimes remarks or other fields are in separate rows
        if (rowData.remarks && !currentShipment.remarks) {
          currentShipment.remarks = rowData.remarks;
        }
        
        // Look for other important fields that might be in separate rows
        for (const field of ['poNumber', 'shipToCustomer', 'shipToAddress', 'contactNumber']) {
          if (rowData[field] && !currentShipment[field as keyof ShipmentData]) {
            (currentShipment as any)[field] = rowData[field];
          }
        }
      }
    }
    
    // Add the last shipment
    if (currentShipment) {
      shipments.push(currentShipment);
    }
    
    return shipments;
  }

  /**
   * Parse a TXT version of an Excel file
   * @param content The content of the TXT file
   * @param options Parsing options
   * @returns Array of ShipmentData objects
   */
  async parseExcelTxt(content: string, options?: Partial<ExcelParseOptions>): Promise<ShipmentData[]> {
    const opts = { ...this.options, ...options };
    
    try {
      logger.info("Starting Excel TXT file parsing...");
      
      // Split the content into lines
      const lines = content.split('\n').filter(line => line.trim() !== '');
      logger.info(`Found ${lines.length} lines in TXT file`);
      
      // Find the header row (if applicable)
      let headerRow: string[] = [];
      let dataStartIndex = 0;
      
      if (opts.hasHeaderRow) {
        // Look for a row that contains column headers (scan more rows to be sure)
        for (let i = 0; i < Math.min(30, lines.length); i++) {
          const row = this.parseTxtRow(lines[i]);
          
          // Check if this row contains common header terms
          const possibleHeaderTerms = [
            'LOAD NO', 'Load No', 'Order Number', 'Ship Date', 'Customer', 
            'Address', 'PO', 'Remarks', 'Notes', 'Description', 'Weight'
          ];
          
          const headerTermsFound = possibleHeaderTerms.filter(term => 
            row.some(cell => cell.toLowerCase().includes(term.toLowerCase()))
          ).length;
          
          if (headerTermsFound >= 3) {
            headerRow = row;
            dataStartIndex = i + 1;
            logger.info(`Using line ${i} as header:`, headerRow);
            break;
          }
        }
        
        // If no header row found, use the first row as header
        if (headerRow.length === 0 && lines.length > 0) {
          headerRow = this.parseTxtRow(lines[0]);
          dataStartIndex = 1;
          logger.info(`No clear header found, using first line as header:`, headerRow);
        }
      }
      
      // Process data rows
      const shipments: ShipmentData[] = [];
      let currentShipment: ShipmentData | null = null;
      
      for (let i = dataStartIndex; i < lines.length; i++) {
        const row = this.parseTxtRow(lines[i]);
        
        // Skip empty rows or rows with insufficient data
        if (row.length < 3) continue;
        
        // Map values using header or positional mapping
        const rowData = await this.mapRowToFields(row, headerRow, opts.fieldMapping);
        
        // Determine if this is a new shipment or an additional item
        if (rowData.loadNumber && rowData.loadNumber !== '') {
          // This is a new shipment
          if (currentShipment) {
            shipments.push(currentShipment);
          }
          
          currentShipment = this.createShipmentFromRowData(rowData);
        } else if (currentShipment && rowData.itemNumber) {
          // This is an additional item for the current shipment
          const item = this.createItemFromRowData(rowData);
          if (item) {
            currentShipment.items.push(item);
            if (item.weight) {
              currentShipment.totalWeight += item.weight;
            }
          }
        } else if (currentShipment) {
          // Check if this row has any additional data for the current shipment
          if (rowData.remarks && !currentShipment.remarks) {
            currentShipment.remarks = rowData.remarks;
          }
          
          // Look for other important fields that might be in separate rows
          for (const field of ['poNumber', 'shipToCustomer', 'shipToAddress', 'contactNumber']) {
            if (rowData[field] && !currentShipment[field as keyof ShipmentData]) {
              (currentShipment as any)[field] = rowData[field];
            }
          }
        }
      }
      
      // Add the last shipment
      if (currentShipment) {
        shipments.push(currentShipment);
      }
      
      logger.info(`Extracted ${shipments.length} shipments from the TXT file`);
      
      return shipments;
    } catch (error) {
      logger.error('Error parsing Excel TXT file:', error);
      throw new Error(`Failed to parse Excel TXT file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Parse a row from the TXT file into an array of cells
   * @param line The line from the TXT file
   * @returns Array of cell values
   */
  private parseTxtRow(line: string): string[] {
    // Split by tabs or multiple spaces
    return line.split(/\t|\s{2,}/).map(cell => cell.trim()).filter(cell => cell !== '');
  }
  
  /**
   * Map row data to fields using AI when needed
   * @param row Row data as array of values
   * @param headers Array of header names
   * @param fieldMapping Custom field mapping
   * @returns Record with mapped fields and values
   */
  private async mapRowToFields(
    row: any[],
    headers: string[],
    fieldMapping?: Record<string, string>
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const miscellaneousFields: Record<string, any> = {};
    const aiMappedFields: AIMappedField[] = [];
    
    // Use headers if available, otherwise use positional mapping
    if (headers.length > 0) {
      // Map row values using header names
      for (let i = 0; i < Math.min(headers.length, row.length); i++) {
        if (!headers[i] || headers[i] === '') continue;
        
        const value = row[i];
        if (value === undefined || value === null || value === '') continue;
        
        // Get standard field name based on header
        const { fieldName, confidence, isAIMapped } = await this.getStandardFieldName(
          headers[i],
          fieldMapping
        );
        
        // If we have a field name, add it to the result object
        if (fieldName && fieldName !== 'unknown') {
          result[fieldName] = value;
          
          // Keep track of AI mapped fields for review
          if (isAIMapped) {
            aiMappedFields.push({
              field: fieldName,
              originalField: headers[i],
              confidence: confidence
            });
            
            // If AI confidence is low, also store in miscellaneous fields
            if (confidence < 0.7) {
              miscellaneousFields[headers[i]] = value;
            }
          }
        } else {
          // Unknown field - store in miscellaneous fields
          miscellaneousFields[headers[i]] = value;
        }
      }
    } else {
      // Positional mapping for files without headers
      // Basic positional mapping based on common Excel formats
      const positionMap: Record<number, string> = {
        0: 'loadNumber',
        1: 'orderNumber',
        2: 'promisedShipDate',
        3: 'shipToCustomer',
        4: 'shipToAddress',
        5: 'shipToState',
        6: 'contactNumber',
        7: 'poNumber',
        8: 'remarks'
      };
      
      for (let i = 0; i < row.length; i++) {
        const value = row[i];
        if (value === undefined || value === null || value === '') continue;
        
        const fieldName = positionMap[i];
        if (fieldName) {
          result[fieldName] = value;
        } else if (i > 0) {
          // For unknown positions, try to guess based on value format and context
          // Store unknown fields in miscellaneous fields
          miscellaneousFields[`column_${i + 1}`] = value;
        }
      }
    }
    
    // Add miscellaneous fields to the result if any were found
    if (Object.keys(miscellaneousFields).length > 0) {
      result.miscellaneousFields = miscellaneousFields;
    }
    
    // Add AI mapped fields to the result if any were found
    if (aiMappedFields.length > 0) {
      result.aiMappedFields = aiMappedFields;
    }
    
    return result;
  }
  
  /**
   * Get standardized field name for a header using a tiered approach
   * @param header The header name from the Excel file
   * @param fieldMapping Custom field mapping
   * @returns The standard field name and mapping confidence
   */
  private async getStandardFieldName(
    header: string, 
    fieldMapping?: Record<string, string>
  ): Promise<{ fieldName: string; confidence: number; isAIMapped: boolean }> {
    const normalizedHeader = header.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Tier 1: Direct match in field mapping
    if (fieldMapping && fieldMapping[header]) {
      return { fieldName: fieldMapping[header], confidence: 1.0, isAIMapped: false };
    }
    
    // Tier 2: Case-insensitive match in field mapping
    if (fieldMapping) {
      const caseInsensitiveMatch = Object.keys(fieldMapping).find(
        key => key.toLowerCase() === normalizedHeader
      );
      
      if (caseInsensitiveMatch) {
        return { fieldName: fieldMapping[caseInsensitiveMatch], confidence: 0.9, isAIMapped: false };
      }
    }
    
    // Tier 3: Fuzzy matching for common field variations
    const fuzzyMatches: Record<string, string> = {
      // Load Number variations
      'load #': 'loadNumber',
      'load no': 'loadNumber',
      'load no.': 'loadNumber',
      'load': 'loadNumber',
      'ld.no': 'loadNumber',
      
      // Order Number variations
      'order #': 'orderNumber',
      'order no': 'orderNumber',
      'order no.': 'orderNumber',
      'order': 'orderNumber',
      'ord.no': 'orderNumber',
      
      // Ship Date variations
      'ship date': 'promisedShipDate',
      'shipping date': 'promisedShipDate',
      'shipment date': 'promisedShipDate',
      'etd': 'promisedShipDate',
      'date': 'promisedShipDate',
      
      // Request Date variations
      'request date': 'requestDate',
      'requested date': 'requestDate',
      'req. date': 'requestDate',
      
      // Ship To variations
      'ship to': 'shipToCustomer',
      'shipto': 'shipToCustomer',
      'customer': 'shipToCustomer',
      'client': 'shipToCustomer',
      'dealer': 'shipToCustomer',
      'consignee': 'shipToCustomer',
      
      // Address variations
      'address': 'shipToAddress',
      'shipping address': 'shipToAddress',
      'delivery address': 'shipToAddress',
      'ship to address': 'shipToAddress',
      
      // State variations
      'state': 'shipToState',
      'province': 'shipToState',
      'region': 'shipToState',
      
      // Contact variations
      'contact': 'contactNumber',
      'tel': 'contactNumber',
      'telephone': 'contactNumber',
      'phone': 'contactNumber',
      'contact #': 'contactNumber',
      'contact no': 'contactNumber',
      
      // PO variations
      'po': 'poNumber',
      'po #': 'poNumber',
      'po no': 'poNumber',
      'po no.': 'poNumber',
      'purchase order': 'poNumber',
      
      // Remarks variations
      'remarks': 'remarks',
      'notes': 'remarks',
      'comments': 'remarks',
      'special instructions': 'remarks',
    };
    
    if (fuzzyMatches[normalizedHeader]) {
      return { fieldName: fuzzyMatches[normalizedHeader], confidence: 0.8, isAIMapped: false };
    }
    
    // Tier 4: AI mapping as a last resort (only if not already found by previous methods)
    try {
      if (openAIService) {
        logger.info(`Using AI to map field: ${header}`);
        
        // Get potential matches for the current field type
        const potentialMatches = getPotentialMatches(header)
          .map(match => match.fieldName);
        
        // Call AI service to map the field
        const aiResult = await openAIService.mapField(header, potentialMatches);
        
        if (aiResult.mappedField && aiResult.mappedField !== 'unknown') {
          logger.info(`AI mapped "${header}" → "${aiResult.mappedField}" (${aiResult.confidence})`);
          return { 
            fieldName: aiResult.mappedField, 
            confidence: aiResult.confidence,
            isAIMapped: true
          };
        }
      }
    } catch (error) {
      logger.error(`Error using AI to map field "${header}":`, error);
    }
    
    // Tier 5: Fallback - return unknown if all else fails
    logger.warn(`Unable to map field: ${header}`);
    return { fieldName: 'unknown', confidence: 0, isAIMapped: false };
  }

  /**
   * Create a shipment object from row data with proper handling of AIMappedFields
   */
  private createShipmentFromRowData(rowData: Record<string, any>): ShipmentData {
    this.logger.debug('Creating shipment from row data:', rowData);
    
    // Extract fields with appropriate defaults
    const loadNumber = rowData.loadNumber || '';
    const orderNumber = rowData.orderNumber || '';
    const promisedShipDate = this.extractDateField(rowData, 'promisedShipDate') || '';
    const requestDate = this.extractDateField(rowData, 'requestDate') || '';
    const actualShipDate = this.extractDateField(rowData, 'actualShipDate') || '';
    const expectedDeliveryDate = this.extractDateField(rowData, 'expectedDeliveryDate') || '';
    const shipToCustomer = rowData.shipToCustomer || rowData.shipToArea || '';
    const shipToAddress = rowData.shipToAddress || '';
    const shipToState = rowData.shipToState || '';
    const contactNumber = rowData.contactNumber || '';
    const poNumber = rowData.poNumber || '';
    const remarks = rowData.remarks || '';
    
    // Extract item from row data if available
    const items = [];
    const item = this.createItemFromRowData(rowData);
    if (item) {
      items.push(item);
    }
    
    // Calculate total weight
    let totalWeight = 0;
    if (item && item.weight) {
      totalWeight = item.weight;
    }
    
    // Handle AI-mapped fields
    let aiMappedFields: AIMappedField[] = [];
    if (rowData.aiMappedFields && Array.isArray(rowData.aiMappedFields)) {
      aiMappedFields = rowData.aiMappedFields;
    }
    
    // Handle miscellaneous fields
    let miscellaneousFields: Record<string, any> = {};
    if (rowData.miscellaneousFields && typeof rowData.miscellaneousFields === 'object') {
      miscellaneousFields = { ...rowData.miscellaneousFields };
    }
    
    // Handle additional fields
    const additionalFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(rowData)) {
      // Skip standard fields, arrays, and known special fields
      if (
        [
          'loadNumber', 'orderNumber', 'promisedShipDate', 'requestDate', 'actualShipDate',
          'expectedDeliveryDate', 'shipToCustomer', 'shipToAddress', 'shipToState',
          'contactNumber', 'poNumber', 'remarks', 'items', 'totalWeight',
          'aiMappedFields', 'miscellaneousFields', 'additionalFields'
        ].includes(key) || 
        Array.isArray(value) ||
        key.startsWith('_')
      ) {
        continue;
      }
      
      // Add to additional fields with formatting if needed
      additionalFields[key] = value;
    }
    
    // Log AI-mapped fields for debugging
    if (aiMappedFields.length > 0) {
      this.logger.debug('AI-mapped fields:', aiMappedFields);
    }
    
    // Create the shipment object
    return {
      loadNumber,
      orderNumber,
      promisedShipDate,
      requestDate,
      actualShipDate,
      expectedDeliveryDate,
      shipToCustomer,
      shipToAddress,
      shipToState,
      contactNumber,
      poNumber,
      remarks,
      items,
      totalWeight,
      aiMappedFields,
      miscellaneousFields: Object.keys(miscellaneousFields).length > 0 ? miscellaneousFields : undefined,
      additionalFields: Object.keys(additionalFields).length > 0 ? additionalFields : undefined
    };
  }
  
  /**
   * Extract a date field from row data, handling Excel date serials
   */
  private extractDateField(rowData: { [key: string]: any }, fieldName: string): string {
    const value = rowData[fieldName];
    if (value === undefined || value === null) return '';
    
    // If it's a date object, format it
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // If it's a number, it might be an Excel date serial
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
      const numValue = typeof value === 'string' ? Number(value) : value;
      // Check if it's a reasonable Excel date serial (Excel dates typically start from 1 = Jan 1, 1900)
      if (numValue > 1 && numValue < 100000) {
        try {
          // Excel's epoch starts on January 1, 1900
          const date = new Date(Date.UTC(1899, 11, 30));
          // Add days (accounting for Excel's leap year bug)
          date.setUTCDate(date.getUTCDate() + Math.floor(numValue));
          return date.toISOString().split('T')[0];
        } catch (error) {
          logger.error(`Error converting Excel date: ${error}`);
          return String(value);
        }
      }
    }
    
    // Return as string for any other case
    return String(value);
  }
  
  /**
   * Extract a string field from row data
   */
  private extractStringField(rowData: { [key: string]: any }, fieldName: string): string {
    const value = rowData[fieldName];
    if (value === undefined || value === null) return '';
    return String(value);
  }
  
  /**
   * Extract a number field from row data
   */
  private extractNumberField(rowData: { [key: string]: any }, fieldName: string): number | undefined {
    const value = rowData[fieldName];
    if (value === undefined || value === null) return undefined;
    
    const numValue = Number(value);
    return isNaN(numValue) ? undefined : numValue;
  }
  
  /**
   * Create a ShipmentItem from row data
   * @param rowData The mapped row data
   * @returns ShipmentItem object or null if invalid
   */
  private createItemFromRowData(rowData: Record<string, any>): ShipmentItem | null {
    if (!rowData.itemNumber && !rowData.description) {
      return null; // Skip items without number or description
    }
    
    const item: ShipmentItem = {
      itemNumber: rowData.itemNumber || '',
      description: rowData.description || '',
      quantity: typeof rowData.quantity === 'number' ? 
        rowData.quantity : 
        (typeof rowData.quantity === 'string' ? parseInt(rowData.quantity, 10) || 0 : 0),
    };
    
    // Add optional fields if present
    if (rowData.weight) {
      item.weight = typeof rowData.weight === 'number' ? 
        rowData.weight : 
        (typeof rowData.weight === 'string' ? parseFloat(rowData.weight) || 0 : undefined);
    }
    
    return item;
  }
  
  /**
   * Normalize a field name by converting it to camelCase
   * @param fieldName The original field name
   * @returns Normalized field name
   */
  private normalizeFieldName(fieldName: string): string {
    // Remove special characters and convert to camelCase
    const words = fieldName
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ');
    
    return words
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }
  
  /**
   * Calculate the confidence score for a shipment
   * @param shipment Shipment data to analyze
   * @returns Confidence result with score and review flag
   */
  calculateConfidence(shipment: ShipmentData): ShipmentConfidenceResult {
    // Critical fields that should have high confidence if AI-mapped
    const CRITICAL_FIELDS = [
      'loadNumber',
      'orderNumber',
      'promisedShipDate',
      'shipToCustomer',
      'shipToAddress'
    ];
    
    // Initialize result
    const result: ShipmentConfidenceResult = {
      confidence: 1.0,
      needsReview: false,
      message: 'Shipment processed successfully'
    };
    
    // If shipment doesn't exist, return low confidence
    if (!shipment) {
      return {
        confidence: 0.1,
        needsReview: true,
        message: 'Invalid or empty shipment data'
      };
    }
    
    // Check for existence of required fields
    const missingFields = CRITICAL_FIELDS.filter(field => !shipment[field as keyof ShipmentData]);
    
    if (missingFields.length > 0) {
      result.confidence = Math.max(0.1, 1 - (missingFields.length / CRITICAL_FIELDS.length));
      result.needsReview = true;
      result.message = `Missing critical fields: ${missingFields.join(', ')}`;
      return result;
    }
    
    // Check if there are AI-mapped fields
    if (shipment.aiMappedFields && shipment.aiMappedFields.length > 0) {
      // Calculate average confidence of AI-mapped fields
      const totalConfidence = shipment.aiMappedFields.reduce(
        (sum, mapping) => sum + mapping.confidence, 
        0
      );
      const avgConfidence = totalConfidence / shipment.aiMappedFields.length;
      
      // Find lowest confidence critical field
      const criticalFieldMappings = shipment.aiMappedFields.filter(
        mapping => CRITICAL_FIELDS.includes(mapping.field)
      );
      
      if (criticalFieldMappings.length > 0) {
        const lowestCriticalConfidence = Math.min(
          ...criticalFieldMappings.map(mapping => mapping.confidence)
        );
        
        // Weighted confidence calculation (prioritize critical fields)
        result.confidence = (lowestCriticalConfidence * 0.7) + (avgConfidence * 0.3);
        
        // Flag for review if any critical field has low confidence
        const lowConfidenceCriticalFields = criticalFieldMappings.filter(
          mapping => mapping.confidence < 0.7
        );
        
        if (lowConfidenceCriticalFields.length > 0) {
          result.needsReview = true;
          result.message = 'Low confidence in critical field mappings, manual review recommended';
        } else {
          result.message = 'Shipment processed with AI field mapping';
        }
      } else {
        // No critical fields were AI-mapped
        result.confidence = avgConfidence;
        result.message = 'Shipment processed with AI field mapping';
      }
    }
    
    // Calculate completeness score based on number of fields populated
    const totalFields = Object.keys(shipment).length;
    const populatedFields = Object.entries(shipment).filter(
      ([key, value]) => value !== undefined && value !== null && key !== 'aiMappedFields'
    ).length;
    const completenessScore = populatedFields / totalFields;
    
    // Adjust confidence by completeness (weighted less than precision)
    result.confidence = (result.confidence * 0.8) + (completenessScore * 0.2);
    
    // Final normalization between 0 and 1
    result.confidence = Math.max(0.1, Math.min(1.0, result.confidence));
    
    // Set review flag based on final confidence
    if (result.confidence < 0.7 && !result.needsReview) {
      result.needsReview = true;
      result.message = 'Low overall confidence in data quality, manual review recommended';
    }
    
    return result;
  }

  /**
   * Get field mapping configuration for a specific document type
   * @param docType Document type
   * @returns Field mapping configuration
   */
  getFieldMapping(docType: DocumentType): Record<string, string> {
    // Since the document type might not be a valid key, we need to handle it safely
    if (docType === DocumentType.ETD_REPORT) {
      return FIELD_MAPPINGS.ETD_REPORT;
    } else if (docType === DocumentType.OUTSTATION_RATES) {
      return FIELD_MAPPINGS.OUTSTATION_RATES;
    } else {
      // Return empty object for unknown document types
      return {};
    }
  }

  /**
   * Parse Excel data to shipment data array
   * @param data Excel data as ArrayBuffer
   * @param options Parsing options
   * @returns Promise with array of ShipmentData
   */
  async parseExcelToShipmentData(
    data: ArrayBuffer,
    options: ExcelParseOptions = {}
  ): Promise<ShipmentData[]> {
    const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    
    // Get all sheets
    const sheetNames = workbook.SheetNames;
    logger.info(`Found ${sheetNames.length} sheets in workbook:`, sheetNames);
    
    // Determine which sheets to process
    const sheetsToProcess = options.sheetIndex !== undefined 
      ? [sheetNames[options.sheetIndex]]
      : sheetNames;
    
    if (options.sheetIndex !== undefined && !sheetsToProcess[0]) {
      throw new Error(`Sheet at index ${options.sheetIndex} does not exist`);
    }
    
    logger.info(`Processing ${sheetsToProcess.length} sheets: ${sheetsToProcess.join(', ')}`);
    
    // Track shipments per sheet
    const shipmentsBySheet: Record<string, number> = {};
    let allShipments: ShipmentData[] = [];
    
    // Process each sheet
    for (const sheetName of sheetsToProcess) {
      logger.info(`Processing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Parse worksheet to JSON with all rows
      const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];
      
      // Determine header row - default to row 3 for ETD files, or use provided index
      let headerRowIndex = options.headerRowIndex;
      
      // If no header row index specified, try to detect it (up to first 5 rows)
      if (headerRowIndex === undefined) {
        if (this.isETDFormat(allRows)) {
          headerRowIndex = 2; // Row 3 in 0-indexed (for ETD format)
          logger.info("Detected ETD format - using row 3 as header row");
        } else {
          // Dynamically detect the first non-empty row that might be headers
          headerRowIndex = this.detectHeaderRow(allRows, 5);
          logger.info(`Dynamically detected header row at index ${headerRowIndex + 1}`);
        }
      }
      
      // Extract headers from determined row
      const headers = allRows[headerRowIndex]?.map(h => h?.toString() || '') || [];
      logger.info(`Using headers: ${headers.join(', ')}`);
      
      // Use rows after header row as data
      const dataRows = allRows.slice(headerRowIndex + 1).filter(row => row.some(cell => cell !== null));
      
      // Map field names using direct mapping or AI
      const fieldMapping = options.fieldMapping || this.getFieldMapping(DocumentType.ETD_REPORT);
      const useAIMapping = options.useAIMapping !== undefined ? options.useAIMapping : true;
      
      // Group rows by load number to combine related shipments
      const shipmentGroups: Record<string, any[]> = {};
      
      for (const row of dataRows) {
        const rowData = await this.mapRowToFields(row, headers, fieldMapping);
        
        // Add sheet name to miscellaneous fields for tracking
        if (!rowData.miscellaneousFields) {
          rowData.miscellaneousFields = {};
        }
        rowData.miscellaneousFields.sheetName = sheetName;
        
        // Skip completely empty rows or rows without key identifiers
        if (!rowData || Object.keys(rowData).length === 0 || (!rowData.loadNumber && !rowData.orderNumber)) {
          continue;
        }
        
        // Use load number as the grouping key, fall back to order number if unavailable
        const key = rowData.loadNumber || rowData.orderNumber || 'unknown';
        
        if (!shipmentGroups[key]) {
          shipmentGroups[key] = [];
        }
        
        shipmentGroups[key].push({ rowData, originalRow: row });
      }
      
      // Process each shipment group to create ShipmentData objects
      const sheetShipments: ShipmentData[] = [];
      
      for (const key in shipmentGroups) {
        const group = shipmentGroups[key];
        
        // Use the first row as the base for shipment data
        const baseRowData = group[0].rowData;
        const shipment = this.createShipmentFromRowData(baseRowData);
        
        // Process each row in the group to extract items
        const items: ShipmentItem[] = [];
        let totalShipmentWeight = 0;
        
        for (const { rowData } of group) {
          const item = this.createItemFromRowData(rowData);
          if (item) {
            items.push(item);
            
            // Add item weight to total if available
            if (item.weight) {
              totalShipmentWeight += item.weight;
            }
          }
          
          // Check for individual row weight (might be the total weight for this group)
          if (rowData.weight && shipment.totalWeight === 0) {
            const weightValue = typeof rowData.weight === 'number' ? 
              rowData.weight : parseFloat(rowData.weight) || 0;
              
            // Only use this as total weight if we haven't calculated one from items
            if (weightValue > 0 && totalShipmentWeight === 0) {
              shipment.totalWeight = weightValue;
            }
          }
          
          // If there are miscellaneous fields, add them to the shipment
          if (rowData.miscellaneousFields) {
            if (!shipment.miscellaneousFields) {
              shipment.miscellaneousFields = {};
            }
            // Merge miscellaneous fields
            Object.assign(shipment.miscellaneousFields, rowData.miscellaneousFields);
          }
        }
        
        // Assign items to shipment
        shipment.items = items;
        
        // Update total weight if we calculated one from items
        if (totalShipmentWeight > 0 && shipment.totalWeight === 0) {
          shipment.totalWeight = totalShipmentWeight;
        }
        
        // Calculate confidence
        const confidenceResult = this.calculateConfidence(shipment);
        
        // Add confidence data as additional fields
        (shipment as any).confidence = confidenceResult.confidence;
        (shipment as any).needsReview = confidenceResult.needsReview;
        
        sheetShipments.push(shipment);
      }
      
      // Add shipments from this sheet to the total
      allShipments = [...allShipments, ...sheetShipments];
      
      // Track shipments per sheet
      shipmentsBySheet[sheetName] = sheetShipments.length;
      
      logger.info(`Extracted ${sheetShipments.length} shipments from sheet: ${sheetName}`);
    }
    
    // Log summary of processing results
    const sheetSummary = Object.entries(shipmentsBySheet)
      .map(([sheet, count]) => `${sheet}: ${count} shipments`)
      .join(', ');
    
    logger.info(`Excel processing complete. Total: ${allShipments.length} shipments across ${sheetsToProcess.length} sheets (${sheetSummary})`);
    
    return allShipments;
  }

  /**
   * Helper method to detect if the Excel file is in ETD format
   * @param rows Excel rows
   * @returns True if the file appears to be in ETD format
   */
  private isETDFormat(rows: any[][]): boolean {
    // Look for "OUTSTATION ORDERS - ETD" in first few rows
    for (let i = 0; i < Math.min(rows.length, 3); i++) {
      const rowStr = rows[i]?.join(' ') || '';
      if (rowStr.includes('OUTSTATION ORDERS') && rowStr.includes('ETD')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Helper method to detect the header row index
   * @param rows Excel rows
   * @param maxRowsToCheck Maximum number of rows to check
   * @returns Index of the likely header row
   */
  private detectHeaderRow(rows: any[][], maxRowsToCheck: number): number {
    const rowsToCheck = Math.min(rows.length, maxRowsToCheck);
    
    // Look for rows with column names like LOAD NO, Order Number, etc.
    for (let i = 0; i < rowsToCheck; i++) {
      const row = rows[i] || [];
      const rowStr = row.join(' ');
      
      // Check for common header terms in this row
      if (row.length > 5 && 
          (rowStr.includes('LOAD NO') || 
           rowStr.includes('Order Number') ||
           rowStr.includes('Ship To Customer') ||
           rowStr.includes('TRANSPORTER'))) {
        return i;
      }
    }
    
    // Default to first row if no header row detected
    return 0;
  }

  /**
   * Parse text content extracted from an image or text file
   * and convert it to shipment data
   * @param textContent The text content to parse
   * @param options Parsing options
   * @returns Array of shipment data objects
   */
  async parseText(textContent: string, options: ExcelParseOptions = {}): Promise<ShipmentData[]> {
    logger.info('Parsing text content through Excel parser');
    
    // Set default options
    const parseOptions = {
      ...this.options,
      ...options
    };
    
    try {
      // Convert text to a structured format
      // This is where we would parse the text into rows and columns
      // For now, we'll use a simple line and delimiter-based approach
      
      // Split by lines and then by common delimiters
      const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const rows: string[][] = [];
      
      // Detect the delimiter - try pipe, then comma, then tab
      const sampleLine = lines.length > 1 ? lines[1] : lines[0];
      let delimiter = '|';
      if (sampleLine.includes('|')) delimiter = '|';
      else if (sampleLine.includes(',')) delimiter = ',';
      else if (sampleLine.includes('\t')) delimiter = '\t';
      
      logger.info(`Detected delimiter: "${delimiter}" for text parsing`);
      
      // Parse each line into columns
      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Split by the detected delimiter and trim each cell
        const cells = line.split(delimiter).map(cell => cell.trim());
        rows.push(cells);
      }
      
      // Try to identify a header row
      let headerRow: string[] = [];
      let dataRows: string[][] = [];
      
      if (parseOptions.hasHeaderRow && rows.length > 0) {
        // Use the first row as headers
        headerRow = rows[0];
        dataRows = rows.slice(1);
      } else {
        // Try to detect headers based on common field names
        const potentialHeaderIdx = this.detectHeaderRow(rows, 3);
        if (potentialHeaderIdx >= 0) {
          headerRow = rows[potentialHeaderIdx];
          dataRows = rows.slice(potentialHeaderIdx + 1);
        } else {
          // No header row detected, use all rows as data
          dataRows = rows;
        }
      }
      
      logger.info(`Parsed ${dataRows.length} data rows from text content`);
      
      // Now convert rows to shipment data objects
      const shipmentData: ShipmentData[] = [];
      const fieldMapping = parseOptions.fieldMapping || {};
      
      // Check if we need AI mapping
      const useAIMapping = parseOptions.useAIMapping !== undefined ? parseOptions.useAIMapping : false;
      
      if (headerRow.length > 0) {
        // We have headers, so map fields based on header names
        for (const dataRow of dataRows) {
          // Skip rows that are too short
          if (dataRow.length < 3) continue;
          
          const shipment: Partial<ShipmentData> = {
            items: [],
            totalWeight: 0,
            miscellaneousFields: {}
          };
          
          // Map fields based on header names
          for (let i = 0; i < headerRow.length && i < dataRow.length; i++) {
            const header = headerRow[i];
            const value = dataRow[i];
            
            // Skip empty values
            if (!value) continue;
            
            // Use direct field mapping if available
            const mappedField = fieldMapping[header];
            if (mappedField) {
              (shipment as any)[mappedField] = value;
            } else if (useAIMapping) {
              // Use AI mapping if enabled
              const aiMapping = await this.getFieldMappingWithAI(header, value);
              if (aiMapping && aiMapping.field) {
                (shipment as any)[aiMapping.field] = value;
                
                // Track AI-mapped fields
                if (!shipment.miscellaneousFields) shipment.miscellaneousFields = {};
                if (!shipment.miscellaneousFields.aiMappedFields) {
                  shipment.miscellaneousFields.aiMappedFields = [];
                }
                
                (shipment.miscellaneousFields.aiMappedFields as any).push({
                  originalField: header,
                  field: aiMapping.field,
                  confidence: aiMapping.confidence
                });
              } else {
                // Store unmapped fields in miscellaneous
                if (!shipment.miscellaneousFields) shipment.miscellaneousFields = {};
                shipment.miscellaneousFields[this.normalizeFieldName(header)] = value;
              }
            } else {
              // Fall back to basic field normalization
              const normalizedField = this.normalizeFieldName(header);
              if (this.isStandardField(normalizedField)) {
                (shipment as any)[normalizedField] = value;
              } else {
                // Store non-standard fields in miscellaneous
                if (!shipment.miscellaneousFields) shipment.miscellaneousFields = {};
                shipment.miscellaneousFields[normalizedField] = value;
              }
            }
          }
          
          // Only add shipments with at least a load number or order number
          if (shipment.loadNumber || shipment.orderNumber) {
            shipmentData.push(shipment as ShipmentData);
          }
        }
      } else {
        // No headers, try to extract fields based on patterns in the data
        // This is a more complex heuristic approach
        
        // For now, we'll use a simplified approach for common ETD formats
        for (const dataRow of dataRows) {
          // Skip rows that are too short
          if (dataRow.length < 3) continue;
          
          const shipment: Partial<ShipmentData> = {
            items: [],
            totalWeight: 0,
            miscellaneousFields: {}
          };
          
          // Try to identify fields based on position or patterns
          // This is very format-specific and would need to be customized
          
          // Assume a typical ETD format with load number, order, ship to, etc.
          if (dataRow.length >= 6) {
            shipment.loadNumber = dataRow[0]; // First column usually load number
            shipment.orderNumber = dataRow[dataRow.length - 4]; // Common position for order
            shipment.shipToCustomer = dataRow[dataRow.length - 3]; // Common position
            shipment.shipToCity = dataRow[dataRow.length - 2]; // Common position
            shipment.remarks = dataRow[dataRow.length - 1]; // Last column often remarks
            
            // Store other fields in miscellaneous
            for (let i = 1; i < dataRow.length - 4; i++) {
              if (dataRow[i]) {
                shipment.miscellaneousFields![`field_${i}`] = dataRow[i];
              }
            }
          }
          
          // Only add shipments with at least a load number or order number
          if (shipment.loadNumber || shipment.orderNumber) {
            shipmentData.push(shipment as ShipmentData);
          }
        }
      }
      
      // Add OCR source information if this came from OCR
      if (parseOptions.isOcrData) {
        shipmentData.forEach(shipment => {
          if (!shipment.miscellaneousFields) shipment.miscellaneousFields = {};
          shipment.miscellaneousFields.ocrProcessed = true;
          shipment.miscellaneousFields.ocrSource = parseOptions.ocrSource || 'unknown';
          shipment.miscellaneousFields.ocrConfidence = parseOptions.ocrConfidence || 0.8;
        });
      }
      
      logger.info(`Successfully parsed ${shipmentData.length} shipments from text content`);
      return shipmentData;
    } catch (error) {
      logger.error('Error parsing text content:', error);
      throw new Error(`Failed to parse text content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get standardized field name for a header using AI
   * @param header The header name from the file
   * @param value The sample value for context
   * @returns Object with field name, confidence score, and AI mapping flag
   */
  private async getFieldMappingWithAI(
    header: string,
    value: any
  ): Promise<{ field: string; confidence: number }> {
    logger.info(`Using AI to map field: ${header}`);
    
    try {
      // Get potential matches for the current field type
      const potentialMatches = getPotentialMatches(header)
        .map(match => match.fieldName);
      
      // Call AI service to map the field
      const aiResult = await this.openAiService.mapField(header, potentialMatches);
      
      if (aiResult.mappedField && aiResult.mappedField !== 'unknown') {
        logger.info(`AI mapped "${header}" → "${aiResult.mappedField}" (${aiResult.confidence})`);
        return { 
          field: aiResult.mappedField, 
          confidence: aiResult.confidence
        };
      }
    } catch (error) {
      logger.error(`Error using AI to map field "${header}":`, error);
    }
    
    // Return unknown if AI mapping fails
    return { field: 'unknown', confidence: 0 };
  }

  /**
   * Check if a field name is a standard field in our schema
   * @param fieldName Field name to check
   * @returns True if it's a standard field
   */
  private isStandardField(fieldName: string): boolean {
    // List of standard fields in the ShipmentData type
    const standardFields = [
      'loadNumber',
      'orderNumber',
      'promisedShipDate',
      'requestDate',
      'actualShipDate',
      'expectedDeliveryDate',
      'shipToCustomer',
      'shipToAddress',
      'shipToCity',
      'shipToState',
      'shipToZip',
      'shipToCountry',
      'contactNumber',
      'poNumber',
      'remarks',
      'itemNumber',
      'description',
      'lotSerialNumber',
      'quantity',
      'uom',
      'weight',
      'totalWeight'
    ];
    
    return standardFields.includes(fieldName);
  }
} 