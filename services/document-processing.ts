import fs from 'fs';
import path from 'path';
import { ExcelParserService } from './excel/ExcelParserService';
import { TextFileParserService } from './text/TextFileParserService';
import { logger } from '../utils/logger';
import { ShipmentData, ShipmentConfidenceResult } from '../types/shipment';

// Type for the document processing result
export interface DocumentProcessingResult {
  data: ShipmentData[];
  confidence: number;
  needsReview: boolean;
  message: string;
  aiMapped?: boolean;
}

// Document processing options
export interface DocumentProcessingOptions {
  useAIMapping?: boolean;
  aiConfidenceThreshold?: number;
}

/**
 * Process a document file (Excel or Text) and return structured data
 * @param filePath Path to the document file
 * @param options Processing options including AI mapping settings
 * @returns Structured shipment data with confidence information
 */
export async function processDocument(
  filePath: string,
  options: DocumentProcessingOptions = {}
): Promise<DocumentProcessingResult> {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  // Get file extension
  const fileExt = path.extname(filePath).toLowerCase();
  
  // Initialize result
  let result: DocumentProcessingResult = {
    data: [],
    confidence: 1.0,
    needsReview: false,
    message: 'Shipment processed successfully'
  };
  
  try {
    // Process based on file type
    if (fileExt === '.xlsx' || fileExt === '.xls') {
      logger.info(`Processing Excel file: ${filePath}${options.useAIMapping ? ' with AI mapping' : ''}`);
      
      // Use Excel parser
      const excelParser = new ExcelParserService();
      
      // Read file to buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      // Parse Excel file
      const parsedData = await excelParser.parseExcelFile(fileBuffer.buffer, {
        useAIMapping: options.useAIMapping ?? false
      });
      
      // Set the parsed data in the result
      result.data = parsedData;
      
      // Check if we have data to calculate confidence
      if (parsedData.length > 0) {
        // Calculate confidence for the first shipment (we might need to refine this for multiple shipments)
        const confidenceResult = excelParser.calculateConfidence(parsedData[0]);
        
        result.confidence = confidenceResult.confidence;
        result.needsReview = confidenceResult.needsReview;
        result.message = confidenceResult.message;
        result.aiMapped = options.useAIMapping ?? false;
        
        // Log AI-mapped fields if present
        const aiMappedFields = parsedData[0]?.aiMappedFields;
        if (aiMappedFields && aiMappedFields.length > 0) {
          logger.info(`AI mapped ${aiMappedFields.length} fields in Excel file`);
          
          // Log low confidence mappings
          const lowConfidenceMappings = aiMappedFields.filter(
            mapping => mapping.confidence < (options.aiConfidenceThreshold ?? 0.7)
          );
          
          if (lowConfidenceMappings.length > 0) {
            logger.warn(`${lowConfidenceMappings.length} fields have low confidence mappings`);
            lowConfidenceMappings.forEach(mapping => {
              logger.warn(`Low confidence mapping: ${mapping.originalField} -> ${mapping.field} (${mapping.confidence.toFixed(2)})`);
            });
          }
        }
      }
    } else if (fileExt === '.txt') {
      logger.info(`Processing text file: ${filePath}`);
      
      // Use Text file parser
      const textParser = new TextFileParserService();
      const parsedData = await textParser.parseTextFile(filePath);
      
      // Set the parsed data in the result
      result.data = parsedData;
    } else {
      throw new Error('Unsupported file type');
    }
    
    return result;
  } catch (error) {
    logger.error(`Error processing document: ${(error as Error).message}`);
    throw error;
  }
} 