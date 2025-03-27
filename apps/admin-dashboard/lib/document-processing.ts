/**
 * Document Processing Utilities for LoadUp Logistics
 * 
 * This file contains utilities for processing shipping documents,
 * standardizing data formats, and extracting structured information.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

import { ExcelParserService, FIELD_MAPPINGS } from '../../../services/excel/ExcelParserService';
import { ExcelParseOptions } from '../../../services/excel/ExcelParserService';
import { convertExcelDateToJSDate } from '../../../utils/excel-helper';

/**
 * Interface for a shipping item
 */
export interface ShipmentItem {
  itemNumber?: string;
  description?: string;
  lotSerialNumber?: string;
  quantity?: number;
  uom?: string;
  weight?: number;
  dimensions?: string;
  hazardous?: boolean;
  specialHandling?: string;
  [key: string]: any; // Allow for additional item fields
}

/**
 * Interface for AI-mapped field information
 */
export interface AIMappedField {
  field: string;
  originalField?: string;
  confidence: number;
}

/**
 * Interface for shipment confidence result
 */
export interface ShipmentConfidenceResult {
  confidence: number;
  needsReview: boolean;
  message?: string;
}

/**
 * Interface for shipment data
 */
export interface ShipmentData {
  // Essential shipment identifiers
  loadNumber?: string;
  orderNumber?: string;
  poNumber?: string;
  
  // Dates and timing
  promisedShipDate?: string;
  requestDate?: string;
  actualShipDate?: string;
  expectedDeliveryDate?: string;
  
  // Shipping information
  shipToArea?: string;
  shipToCustomer?: string;
  shipToAddress?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZip?: string;
  shipToCountry?: string;
  
  // Contact information
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;
  
  // Shipment details
  items: ShipmentItem[];
  totalWeight: number;
  totalValue?: number;
  dimensions?: string;
  
  // Logistics information
  carrier?: string;
  trackingNumber?: string;
  routeNumber?: string;
  vehicleType?: string;
  
  // Additional information
  remarks?: string;
  
  // Custom fields
  additionalFields?: Record<string, any>;
  
  // AI mapping information
  confidence?: number;
  needsReview?: boolean;
  fieldConfidence?: Record<string, number>;
  aiMappedFields?: AIMappedField[];
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  
  // New miscellaneous fields
  miscellaneousFields?: Record<string, string>;
}

/**
 * Enum for document types supported by the application
 */
export enum DocumentType {
  ETD_REPORT = 'ETD_REPORT',
  OUTSTATION_RATES = 'OUTSTATION_RATES',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface for document processing options
 */
export interface ProcessDocumentOptions {
  documentType?: DocumentType;
  hasHeaderRow?: boolean;
  sheetIndex?: number;
  useAIMapping?: boolean;
  aiMappingConfidenceThreshold?: number;
}

/**
 * Format a date string to a standard d/m/y format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format in d/m/y format
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Detect document type based on content
 */
export function detectDocumentType(content: string): DocumentType {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('etd') && contentLower.includes('load no')) {
    return DocumentType.ETD_REPORT;
  } else if (contentLower.includes('outstation') && contentLower.includes('rates')) {
    return DocumentType.OUTSTATION_RATES;
  }
  
  return DocumentType.UNKNOWN;
}

/**
 * Process ETD format document
 */
function processETDFormat(content: string): ShipmentData[] {
  // Basic implementation for processing ETD format
  // Will be replaced by the ExcelParserService
  const lines = content.split('\n');
  const shipment: Partial<ShipmentData> = {
    items: [],
    totalWeight: 0
  };
  
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    
    if (line.includes('LOAD NO')) {
      shipment.loadNumber = parts[1]?.trim();
    } else if (line.includes('Order Number')) {
      shipment.orderNumber = parts[1]?.trim();
    } else if (line.includes('Ship To')) {
      shipment.shipToCustomer = parts[1]?.trim();
    }
  }
  
  return [shipment as ShipmentData];
}

/**
 * Process Outstation Rates format document
 */
function processOutstationRatesFormat(content: string): ShipmentData[] {
  // Basic implementation for processing Outstation Rates format
  // Will be replaced by the ExcelParserService
  const lines = content.split('\n');
  const shipment: Partial<ShipmentData> = {
    items: [],
    totalWeight: 0
  };
      
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    
    if (line.includes('Load no')) {
      shipment.loadNumber = parts[1]?.trim();
    } else if (line.includes('PO NUMBER')) {
      shipment.poNumber = parts[1]?.trim();
    } else if (line.includes('Remark')) {
      shipment.remarks = parts[1]?.trim();
    }
  }
  
  return [shipment as ShipmentData];
}

/**
 * Convert server format to client format for shipment data
 * This handles any data transformation needed between backend and frontend
 */
function convertServerToClientFormat(serverData: any): ShipmentData {
  const clientData: ShipmentData = {
    ...serverData,
    items: serverData.items || [],
    totalWeight: serverData.totalWeight || 0,
    miscellaneousFields: serverData.miscellaneousFields || {}
  };
  
  // Handle Excel date serials
  const dateFields = [
    'promisedShipDate', 
    'requestDate', 
    'actualShipDate', 
    'expectedDeliveryDate'
  ];
  
  // Convert Excel date serials to standard dates
  for (const field of dateFields) {
    if (typeof clientData[field as keyof ShipmentData] === 'number') {
      const dateValue = clientData[field as keyof ShipmentData] as number;
      const convertedDate = convertExcelDateToJSDate(dateValue);
      (clientData as any)[field] = convertedDate;
    }
  }
  
  return clientData;
}

/**
 * Helper function to convert Uint8Array to ArrayBuffer
 */
function bufferToArrayBuffer(buffer: Uint8Array): ArrayBuffer {
  // Create a new copy to guarantee we get an ArrayBuffer and not a SharedArrayBuffer
  const copy = new Uint8Array(buffer);
  return copy.buffer.slice(
    copy.byteOffset,
    copy.byteOffset + copy.byteLength
  ) as ArrayBuffer;
}

/**
 * Process a shipment document to extract structured data
 * 
 * @param file The document file buffer or string content
 * @param fileName The name of the file
 * @param options Processing options
 * @returns Extracted shipment data
 */
export async function processShipmentDocument(
  file: Buffer | string,
  fileName: string,
  options: ProcessDocumentOptions = {}
): Promise<ShipmentData[]> {
  try {
    console.log(`Processing document: ${fileName}`);
    
    const excelParserService = new ExcelParserService();
    let clientShipmentData: ShipmentData[] = [];
    
    // Determine if file is Excel or text format
    const isExcelFile = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
    
    console.log(`File type: ${isExcelFile ? 'Excel' : 'Text'}, Size: ${file instanceof Buffer ? `${file.length} bytes` : `${file.length} chars`}`);
    
    // Process Excel file (binary)
    if (isExcelFile && file instanceof Buffer) {
      console.log('Processing Excel file in binary format');
      
      const documentType = options.documentType || DocumentType.ETD_REPORT;
      console.log(`Document type: ${documentType}`);
      
      try {
        // Convert Buffer to ArrayBuffer properly
        const arrayBuffer = bufferToArrayBuffer(new Uint8Array(file));
        
        // Parse Excel file with AI mapping options if specified
        const parseOptions: Partial<ExcelParseOptions> = {
          hasHeaderRow: options.hasHeaderRow !== false,
          useAIMapping: options.useAIMapping || false,
          aiMappingConfidenceThreshold: options.aiMappingConfidenceThreshold || 0.7
        };
        
        // Add sheet index if provided
        if (options.sheetIndex !== undefined) {
          (parseOptions as any).sheetIndex = options.sheetIndex;
        }
        
        // Add field mapping based on document type
        if (documentType === DocumentType.ETD_REPORT) {
          (parseOptions as any).fieldMapping = FIELD_MAPPINGS.ETD_REPORT;
        } else {
          (parseOptions as any).fieldMapping = FIELD_MAPPINGS.OUTSTATION_RATES;
        }
        
        const serverShipmentData = await excelParserService.parseExcelFile(arrayBuffer, parseOptions);
        
        // Convert server data format to admin dashboard format
        clientShipmentData = serverShipmentData.map(shipment => convertServerToClientFormat(shipment));
        
        console.log(`Excel parsing complete. Extracted ${clientShipmentData.length} shipments.`);
        
        // If no shipments found, try with the opposite document type
        if (clientShipmentData.length === 0) {
          console.log('No shipments found. Trying with alternative document type...');
          
          const alternativeDocType = documentType === DocumentType.ETD_REPORT 
            ? DocumentType.OUTSTATION_RATES 
            : DocumentType.ETD_REPORT;
            
          // Update field mapping for alternative document type
          if (alternativeDocType === DocumentType.ETD_REPORT) {
            (parseOptions as any).fieldMapping = FIELD_MAPPINGS.ETD_REPORT;
          } else {
            (parseOptions as any).fieldMapping = FIELD_MAPPINGS.OUTSTATION_RATES;
          }
          
          const altServerShipmentData = await excelParserService.parseExcelFile(arrayBuffer, parseOptions);
          
          clientShipmentData = altServerShipmentData.map(shipment => convertServerToClientFormat(shipment));
          
          console.log(`Alternative parsing complete. Extracted ${clientShipmentData.length} shipments.`);
        }
      } catch (excelError) {
        console.error('Error during Excel parsing:', excelError);
        
        // If Excel parsing fails, try reading the file as text
        console.log('Falling back to text-based processing...');
        const content = file.toString('utf-8');
        
        // Auto-detect document type
        const documentType = detectDocumentType(content);
        console.log(`Detected document type from content: ${documentType}`);
        
        if (documentType === DocumentType.ETD_REPORT) {
          const parseOptions: any = {
            fieldMapping: FIELD_MAPPINGS.ETD_REPORT
          };
          clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
        } else if (documentType === DocumentType.OUTSTATION_RATES) {
          const parseOptions: any = {
            fieldMapping: FIELD_MAPPINGS.OUTSTATION_RATES
          };
          clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
        } else {
          clientShipmentData = processETDFormat(content);
        }
      }
    } 
    // Process text-based file (TXT version of Excel or CSV)
    else {
      console.log('Processing text-based file');
      
      const content = typeof file === 'string' ? file : file.toString('utf-8');
      
      // Detect document type if not provided
      const documentType = options.documentType || detectDocumentType(content);
      console.log(`Detected document type: ${documentType}`);
      
      if (documentType === DocumentType.ETD_REPORT) {
        // Parse ETD format using ExcelParserService for TXT
        const parseOptions: any = {
          fieldMapping: FIELD_MAPPINGS.ETD_REPORT
        };
        clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
      } else if (documentType === DocumentType.OUTSTATION_RATES) {
        // Parse Outstation Rates format using ExcelParserService for TXT
        const parseOptions: any = {
          fieldMapping: FIELD_MAPPINGS.OUTSTATION_RATES
        };
        clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
      } else {
        // Fall back to basic processing if type can't be determined
        clientShipmentData = processETDFormat(content);
      }
      
      console.log(`Text parsing complete. Extracted ${clientShipmentData.length} shipments.`);
      
      // If no shipments found, try with the opposite document type
      if (clientShipmentData.length === 0) {
        console.log('No shipments found. Trying with alternative document type...');
        
        const alternativeDocType = documentType === DocumentType.ETD_REPORT 
          ? DocumentType.OUTSTATION_RATES 
          : DocumentType.ETD_REPORT;
        
        if (alternativeDocType === DocumentType.ETD_REPORT) {
          const parseOptions: any = {
            fieldMapping: FIELD_MAPPINGS.ETD_REPORT
          };
          clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
        } else {
          const parseOptions: any = {
            fieldMapping: FIELD_MAPPINGS.OUTSTATION_RATES
          };
          clientShipmentData = await excelParserService.parseExcelTxt(content, parseOptions);
        }
        
        console.log(`Alternative parsing complete. Extracted ${clientShipmentData.length} shipments.`);
      }
    }
    
    // Calculate confidence and add review flag for each shipment
    clientShipmentData = clientShipmentData.map(shipment => {
      // Get confidence result using our local function instead of the service
      const confidenceResult = calculateConfidenceForShipment(shipment);
      
      // Add date conversion here to ensure dates are properly formatted
      const dateFields = [
        'promisedShipDate', 
        'requestDate', 
        'actualShipDate', 
        'expectedDeliveryDate'
      ];
      
      // Convert Excel dates to proper date strings
      for (const field of dateFields) {
        if (typeof shipment[field as keyof ShipmentData] === 'number') {
          const dateValue = shipment[field as keyof ShipmentData] as number;
          (shipment as any)[field] = convertExcelDateToJSDate(dateValue);
        }
      }
      
      return {
        ...shipment,
        confidence: confidenceResult.confidence,
        needsReview: confidenceResult.needsReview
      };
    });
    
    return clientShipmentData;
  } catch (error) {
    console.error('Error processing document:', error);
    return [];
  }
}

/**
 * Calculate the confidence score for a shipment
 */
function calculateConfidenceForShipment(shipment: ShipmentData): ShipmentConfidenceResult {
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
  
  // Check for existence of required fields
  const missingFields = CRITICAL_FIELDS.filter(field => 
    !shipment[field as keyof ShipmentData] || 
    shipment[field as keyof ShipmentData] === ''
  );
  
  if (missingFields.length > 0) {
    result.confidence = Math.max(0.1, 1 - (missingFields.length / CRITICAL_FIELDS.length));
    result.needsReview = true;
    result.message = `Missing critical fields: ${missingFields.join(', ')}`;
    return result;
  }
  
  // Check if there are AI-mapped fields
  if (shipment.aiMappedFields && shipment.aiMappedFields.length > 0) {
    // Calculate average confidence across all AI mapped fields
    const sum = shipment.aiMappedFields.reduce((total, field) => total + field.confidence, 0);
    const avgConfidence = sum / shipment.aiMappedFields.length;
    
    result.confidence = avgConfidence;
    result.needsReview = avgConfidence < 0.7;
    result.message = result.needsReview 
      ? 'Low confidence in AI field mappings, manual review recommended' 
      : 'Shipment processed with AI field mapping';
  }
  
  return result;
}