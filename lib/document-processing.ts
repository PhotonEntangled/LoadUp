/**
 * Document Processing Utilities for LoadUp Logistics
 * 
 * This file contains utilities for processing shipping documents,
 * standardizing data formats, and extracting structured information.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Import canonical types from root directories
import { 
  ShipmentData, 
  ShipmentItem, 
  LocationDetail,
  ParsingMetadata,
  SourceInfo, // Moved from parser.types if previously there
  ShipmentConfidenceScore,
  DocumentType, // Source is shipment.ts
  AIMappedField,
  RawRowData // Assuming this also belongs here
} from 'types/shipment'; 

// Import parser-specific types from root directory
import type { ExcelParseOptions, ParsedShipmentBundle } from 'types/parser.types';

// Import the utility function for date conversion (assuming it's in lib)
import { convertExcelDateToJSDate } from 'lib/excel-helper'; 

// MODIFIED: Import class, remove others
import { ExcelParserService } from 'services/excel/ExcelParserService';
import { OpenAIService } from 'services/ai/OpenAIService'; 

// Import logger from root directory
import { logger } from 'utils/logger'; 

/**
 * Enum for document types supported by the application
 */
// export enum DocumentType {
//   ETD_REPORT = 'ETD_REPORT',
//   OUTSTATION_RATES = 'OUTSTATION_RATES',
//   UNKNOWN = 'UNKNOWN'
// }

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
  // MODIFIED: Instantiate parser service here
  const localExcelParserService = new ExcelParserService();
  
  try {
    logger.info(`Processing document: ${fileName}`);
    
    let clientShipmentData: ShipmentData[] = [];
    let parsedBundles: ParsedShipmentBundle[] = [];

    // Determine if file is Excel or text format
    const isExcelFile = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
    
    logger.info(`File type: ${isExcelFile ? 'Excel' : 'Text'}, Size: ${file instanceof Buffer ? `${file.length} bytes` : `${file.length} chars`}`);
    
    // Detect type if not provided and assert type
    const documentType = (options.documentType || detectDocumentType(isExcelFile ? 'excel' : (file as string))) as DocumentType;
    logger.info(`Document type determined as: ${documentType}`);

    // Prepare common parse options
    const parseOptions: Partial<ExcelParseOptions> = {
      hasHeaderRow: options.hasHeaderRow !== false,
      aiFieldMappingEnabled: options.useAIMapping || false,
      aiMappingConfidenceThreshold: options.aiMappingConfidenceThreshold || 0.7,
      sheetIndex: options.sheetIndex,
      documentType: documentType,
      isOcrData: !isExcelFile,
      ocrSource: isExcelFile ? undefined : fileName,
    };

    // Process Excel file (binary)
    if (isExcelFile && file instanceof Buffer) {
      logger.info('Processing Excel file in binary format');
      
      try {
        const arrayBuffer = bufferToArrayBuffer(new Uint8Array(file));
        
        // Use the instantiated service
        parsedBundles = await localExcelParserService.parseExcelFile(arrayBuffer, parseOptions);
        
        logger.info(`Excel parsing complete. Extracted ${parsedBundles.length} shipment bundles.`);
        
      } catch (error) {
        logger.error(`Error parsing Excel file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    } else if (!isExcelFile && typeof file === 'string') {
      // Handle text file - NOTE: This path likely needs review as parseText is not available
      logger.warn('Processing text file - parseText method is unavailable, attempting parseTextFile');
      try {
        // Use the instantiated service - using parseTextFile as parseText doesn't exist
        // This might fail if the content isn't structured like a file parseTextFile expects
        parsedBundles = await localExcelParserService.parseTextFile(file, parseOptions);
        logger.info(`Text file parsing complete. Extracted ${parsedBundles.length} shipment bundles.`);
      } catch (error) {
        logger.error(`Error parsing text file ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
        // Decide how to handle text parsing failure - rethrow or return empty?
        // For now, rethrow to make failure explicit
        throw error; 
      }
    } else {
      // Handle invalid input type
      const errorMsg = `Invalid file input type for ${fileName}. Expected Buffer (for Excel) or string (for text). Received: ${typeof file}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // *** CRITICAL CHECK: Does ParsedShipmentBundle map directly to ShipmentData? ***
    // Based on the type error from the build, they are likely different.
    // We need to map the fields from ParsedShipmentBundle to ShipmentData.
    // This is a placeholder - the actual mapping needs to be defined based on both types.
    clientShipmentData = parsedBundles.map(bundle => {
      // TODO: Implement proper mapping from ParsedShipmentBundle to ShipmentData
      // This requires understanding both type structures.
      // Example placeholder mapping (LIKELY INCORRECT):
      return {
        id: bundle.shipmentBaseData.id,
        loadNumber: bundle.customDetailsData?.customerShipmentNumber,
        orderNumber: bundle.customDetailsData?.customerDocumentNumber,
        // ... map other fields ...
        items: bundle.itemsData.map(item => ({ /* map item fields */ ...item })), // Placeholder item map
        originAddress: bundle.originAddressData, // Placeholder - needs mapping
        destinationAddress: bundle.destinationAddressData, // Placeholder - needs mapping
        // ... map pickupData, dropoffData, metadata etc. into appropriate ShipmentData fields
        parsingMetadata: bundle.metadata as any, // Coerce metadata type for now
      } as ShipmentData; // Cast to ShipmentData
    });

    logger.info(`Finished processing ${fileName}. Mapped ${clientShipmentData.length} shipments.`);
    return clientShipmentData;

  } catch (error) {
    logger.error(`Failed to process document ${fileName}:`, error);
    // Consider how errors should propagate - throw or return empty array?
    throw error; // Re-throw for now
  }
}

/**
 * Aggregate shipment data (example - customize as needed)
 */
export function aggregateShipmentData(shipments: ShipmentData[]): Record<string, any> {
  const totalShipments = shipments.length;
  const totalWeight = shipments.reduce((total: number, shipment) => total + (shipment.totalWeight || 0), 0);
  const totalItems = shipments.reduce((total: number, shipment) => {
    // Ensure items is an array before accessing length
    const itemsLength = (shipment.items ?? []).length;
    return total + itemsLength;
  }, 0);
  const statusCounts = shipments.reduce((counts: Record<string, number>, shipment) => {
    const status = shipment.status || 'pending';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  // Calculate average confidence (if available)
  const shipmentsWithConfidence = shipments.filter(s => (s as any).confidence !== undefined);
  const averageConfidence = shipmentsWithConfidence.length > 0
    ? shipmentsWithConfidence.reduce((total: number, shipment) => total + ((shipment as any).confidence || 0), 0) / shipmentsWithConfidence.length
    : 0;
    
  // Count shipments needing review
  const needsReviewCount = shipments.filter(s => (s as any).needsReview).length;

  return {
    totalShipments,
    totalWeight,
    totalItems,
    statusCounts,
    averageConfidence: parseFloat(averageConfidence.toFixed(2)),
    needsReviewCount
  };
}

/**
 * Calculates a simple completeness score for a shipment object.
 * @param shipment The shipment data object.
 * @returns A score between 0 and 1, where 1 is more complete.
 */
function calculateCompleteness(shipment: ShipmentData): number {
    const requiredFields: (keyof ShipmentData)[] = [
        'loadNumber', 
        'orderNumber',
        'promisedShipDate', 
        'shipToCustomer', 
        'items',
        'totalWeight'
    ];
    const optionalFields: (keyof ShipmentData)[] = [
        'poNumber', 'requestDate', 'contactNumber', 'remarks', 'status'
    ];
    
    const totalFields = requiredFields.length + optionalFields.length;
    let filledFields = 0;

    requiredFields.forEach(field => {
        const value = shipment[field];
        if (field === 'items') {
            if (Array.isArray(value) && value.length > 0) filledFields++;
        } else if (value !== null && value !== undefined && value !== '') {
            filledFields++;
        }
    });

    optionalFields.forEach(field => {
        const value = shipment[field];
        if (value !== null && value !== undefined && value !== '') {
            filledFields += 0.5; // Give half point for optional fields
        }
    });

    return Math.min(1, filledFields / requiredFields.length); // Normalize based on required fields count
}

/**
 * Improved confidence calculation focusing on critical fields and completeness.
 */
function calculateConfidenceForShipment(shipment: ShipmentData): ShipmentConfidenceScore {
    const CRITICAL_FIELDS: (keyof ShipmentData)[] = [
        'loadNumber', 
        'orderNumber', 
        'promisedShipDate', 
        'shipToCustomer', 
        'items' // Consider items critical
    ];
    let confidence = 1.0;
    let needsReview = false;
    const messages: string[] = [];

    // 1. Check for missing critical fields
    const missingCritical = CRITICAL_FIELDS.filter(field => {
        const value = shipment[field];
        if (field === 'items') return !Array.isArray(value) || value.length === 0;
        return value === null || value === undefined || value === '' || value === 'UNKNOWN';
    });

    if (missingCritical.length > 0) {
        confidence *= (1 - (missingCritical.length * 0.2)); // Penalize heavily for missing critical fields
        needsReview = true;
        messages.push(`Missing critical fields: ${missingCritical.join(', ')}`);
    }

    // 2. Check AI mapping confidence (if available)
    const aiFieldsObject = shipment.parsingMetadata?.aiMappedFields || {};
    const aiFieldsArray: AIMappedField[] = Object.values(aiFieldsObject);
    const lowConfidenceAIFields = aiFieldsArray.filter(f => f.confidence < 0.7);

    if (lowConfidenceAIFields.length > 0) {
        confidence *= 0.9; // Small penalty for any low confidence AI mapping
        needsReview = true;
        messages.push(`Low AI confidence for: ${lowConfidenceAIFields.map(f => f.originalField || f.field).join(', ')}`);
    }

    // 3. Check overall completeness
    const completenessScore = calculateCompleteness(shipment);
    confidence = (confidence * 0.7) + (completenessScore * 0.3); // Blend confidence with completeness

    // Ensure confidence is within bounds [0.1, 1.0]
    confidence = Math.max(0.1, Math.min(1.0, confidence));

    // Final review flag based on threshold
    if (confidence < 0.75 && !needsReview) {
        needsReview = true;
        messages.push('Overall data quality confidence is low.');
    }

    return {
        confidence: parseFloat(confidence.toFixed(2)),
        needsReview,
        message: messages.length > 0 ? messages.join('. ') : 'Data quality appears acceptable.'
    };
}

/**
 * Validates a single shipment object against a basic set of rules.
 */
function validateShipment(shipment: ShipmentData): string[] {
  const errors: string[] = [];
  if (!shipment.loadNumber) errors.push('Missing Load Number');
  // Replace checks for removed fields with checks for new fields if needed
  // e.g., check shipment.destination?.rawInput instead of shipToAddress
  if (!shipment.destination?.rawInput && !shipment.destination?.resolvedAddress) {
    errors.push('Missing Destination Address/Details');
  }
  if (!shipment.promisedShipDate) errors.push('Missing Promised Ship Date');
  return errors;
}

// ... inside aggregateShipmentData function ...

  const validFields: (keyof ShipmentData)[] = [
    'loadNumber',
    'orderNumber',
    'promisedShipDate',
    'requestDate',
    // 'shipToAddress', // Removed
    'shipToCustomer',
    // 'shipToState', // Removed
    'shipToArea', 
    'contactNumber',
    'remarks',
    'status',
    'orderType',
    'poNumber',
    'actualDeliveryArrival', 
    'carrierName', 
    'truckId', 
    'driverName',
    'origin', 
    'destination' 
  ];

// ... inside calculateConfidenceForShipment function ...

  const requiredFields: (keyof ShipmentData)[] = [
    'loadNumber',
    // 'shipToAddress', // Removed
    'promisedShipDate',
    'shipToCustomer',
    'items',
    'origin',
    'destination'
  ];

  // ... rest of the function ...

// ... somewhere around line 494, update aiMappedFields access ...

function someFunctionUsingAIMappedFields(shipment: ShipmentData) {
    // Example usage correction:
    const aiFieldsObject = shipment.parsingMetadata?.aiMappedFields || {}; 
    // ... rest of logic using aiFieldsObject ...
}

// ... Add Export block if missing, or ensure it includes necessary types ...
// NOTE: The original file didn't show an export block, but components rely on it.
//       Adding a placeholder based on previous context. Ensure functions are defined above.

export {
  // Functions are already exported where defined (e.g., export function formatDate)
  // We only need to re-export types here

  // Re-export imported types needed externally
  type ShipmentData, 
  type ShipmentItem, 
  type LocationDetail,
  type ParsingMetadata,
  type SourceInfo,
  type ShipmentConfidenceScore,
  DocumentType,
  type AIMappedField,
  type RawRowData,
  type ExcelParseOptions,
  type ParsedShipmentBundle,
  // Removed: formatDate,
  // Removed: detectDocumentType,
  // Removed: processShipmentDocument,
  // Removed: aggregateShipmentData,
  // Add other exported non-function constants/variables if needed
};

// Ensure the functions mentioned in the export (processShipmentDocument, etc.) are actually defined above this block.