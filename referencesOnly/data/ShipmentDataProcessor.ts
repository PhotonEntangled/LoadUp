/**
 * Unified service for processing shipment data from various sources
 */

import { ShipmentData } from '../ocr/DocumentParser';
import { DocumentParser } from '../ocr/DocumentParser';
import { GoogleVisionService } from '../ocr/GoogleVisionService';
import { ExcelParserService } from '../excel/ExcelParserService';

/**
 * Data source types for shipment data
 */
export enum DataSourceType {
  OCR_IMAGE = 'OCR_IMAGE',
  EXCEL_TXT = 'EXCEL_TXT',
  MANUAL_ENTRY = 'MANUAL_ENTRY'
}

/**
 * Options for processing shipment data
 */
export interface ProcessOptions {
  source: DataSourceType;
  confidenceThreshold?: number;
  requireReview?: boolean;
}

/**
 * Result of processing shipment data
 */
export interface ProcessResult {
  shipments: ShipmentData[];
  totalProcessed: number;
  needsReview: number;
  errors: string[];
  source: DataSourceType;
}

/**
 * Service for processing shipment data from various sources
 */
export class ShipmentDataProcessor {
  private documentParser: DocumentParser;
  private visionService: GoogleVisionService;
  private excelParser: ExcelParserService;
  
  constructor(
    googleVisionApiKey: string,
    private defaultOptions: ProcessOptions = {
      source: DataSourceType.OCR_IMAGE,
      confidenceThreshold: 0.7,
      requireReview: true
    }
  ) {
    this.documentParser = new DocumentParser();
    this.visionService = new GoogleVisionService(googleVisionApiKey);
    this.excelParser = new ExcelParserService();
  }
  
  /**
   * Process shipment data from an image using OCR
   * @param imageBase64 Base64-encoded image data
   * @param options Processing options
   * @returns Processing result
   */
  async processImageData(imageBase64: string, options?: Partial<ProcessOptions>): Promise<ProcessResult> {
    const opts = { ...this.defaultOptions, ...options, source: DataSourceType.OCR_IMAGE };
    const errors: string[] = [];
    
    try {
      // Process image with Google Vision API
      const ocrResponse = await this.visionService.processImage(imageBase64);
      
      // Parse OCR response
      const shipmentData = this.documentParser.parseOcrResponse(ocrResponse);
      
      // Apply confidence threshold
      const needsReview = shipmentData.needsReview || 
        (shipmentData.confidence < (opts.confidenceThreshold || 0.7));
      
      const result: ProcessResult = {
        shipments: [{ ...shipmentData, needsReview }],
        totalProcessed: 1,
        needsReview: needsReview ? 1 : 0,
        errors,
        source: DataSourceType.OCR_IMAGE
      };
      
      return result;
    } catch (error) {
      errors.push(`Error processing image: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        shipments: [],
        totalProcessed: 0,
        needsReview: 0,
        errors,
        source: DataSourceType.OCR_IMAGE
      };
    }
  }
  
  /**
   * Process shipment data from an Excel file (saved as TXT)
   * @param txtContent Content of the TXT file
   * @param options Processing options
   * @returns Processing result
   */
  async processExcelTxtData(txtContent: string, options?: Partial<ProcessOptions>): Promise<ProcessResult> {
    const opts = { ...this.defaultOptions, ...options, source: DataSourceType.EXCEL_TXT };
    const errors: string[] = [];
    
    try {
      // Parse Excel TXT content
      const shipments = await this.excelParser.parseExcelTxt(txtContent);
      
      // Apply confidence threshold and calculate review status
      let needsReviewCount = 0;
      const processedShipments = shipments.map(shipment => {
        // Calculate confidence if not already set
        const shipmentWithConfidence = this.excelParser.calculateConfidence(shipment);
        
        // Check if needs review
        const needsReview = shipmentWithConfidence.needsReview || 
          (shipmentWithConfidence.confidence < (opts.confidenceThreshold || 0.7));
        
        if (needsReview) {
          needsReviewCount++;
        }
        
        return { ...shipmentWithConfidence, needsReview };
      });
      
      const result: ProcessResult = {
        shipments: processedShipments,
        totalProcessed: processedShipments.length,
        needsReview: needsReviewCount,
        errors,
        source: DataSourceType.EXCEL_TXT
      };
      
      return result;
    } catch (error) {
      errors.push(`Error processing Excel TXT: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        shipments: [],
        totalProcessed: 0,
        needsReview: 0,
        errors,
        source: DataSourceType.EXCEL_TXT
      };
    }
  }
  
  /**
   * Process shipment data from any supported source
   * @param data The data to process (Base64 image or TXT content)
   * @param options Processing options
   * @returns Processing result
   */
  async processData(data: string, options: ProcessOptions): Promise<ProcessResult> {
    switch (options.source) {
      case DataSourceType.OCR_IMAGE:
        return this.processImageData(data, options);
        
      case DataSourceType.EXCEL_TXT:
        return this.processExcelTxtData(data, options);
        
      case DataSourceType.MANUAL_ENTRY:
        // Manual entry is handled differently - this would typically
        // be a direct submission of ShipmentData objects
        return {
          shipments: [],
          totalProcessed: 0,
          needsReview: 0,
          errors: ['Manual entry processing not implemented'],
          source: DataSourceType.MANUAL_ENTRY
        };
        
      default:
        return {
          shipments: [],
          totalProcessed: 0,
          needsReview: 0,
          errors: [`Unsupported data source: ${options.source}`],
          source: options.source as DataSourceType
        };
    }
  }
  
  /**
   * Validate a shipment data object
   * @param shipment The shipment data to validate
   * @returns Validation result with errors if any
   */
  validateShipment(shipment: ShipmentData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!shipment.trackingNumber || shipment.trackingNumber === 'UNKNOWN') {
      errors.push('Missing tracking number');
    }
    
    if (!shipment.recipient.name || shipment.recipient.name === 'UNKNOWN') {
      errors.push('Missing recipient name');
    }
    
    if (!shipment.recipient.address || shipment.recipient.address === 'UNKNOWN') {
      errors.push('Missing recipient address');
    }
    
    if (!shipment.recipient.state || shipment.recipient.state === 'UNKNOWN') {
      errors.push('Missing recipient state');
    }
    
    // Validate tracking number format (example: alphanumeric, min 6 chars)
    if (shipment.trackingNumber && !/^[A-Za-z0-9]{6,}$/.test(shipment.trackingNumber)) {
      errors.push('Invalid tracking number format');
    }
    
    // Validate zip code format if present
    if (shipment.recipient.zipCode && 
        shipment.recipient.zipCode !== 'UNKNOWN' && 
        !/^\d{5}(-\d{4})?$/.test(shipment.recipient.zipCode)) {
      errors.push('Invalid recipient zip code format');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
} 