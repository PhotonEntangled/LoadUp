import { ShipmentData } from '../ocr/DocumentParser';
import { DocumentParser } from '../ocr/DocumentParser';
import { ExcelParserService } from '../excel/ExcelParserService';
import { GoogleVisionService } from '../ocr/GoogleVisionService';

/**
 * Input types for the ShipmentParser
 */
export enum ShipmentSourceType {
  OCR_IMAGE = 'OCR_IMAGE',
  EXCEL_TXT = 'EXCEL_TXT',
}

/**
 * Input data for the ShipmentParser
 */
export interface ShipmentParserInput {
  type: ShipmentSourceType;
  data: string; // Base64 image for OCR or text content for Excel
}

/**
 * Unified parser for shipment data from different sources
 */
export class ShipmentParser {
  private documentParser: DocumentParser;
  private excelParser: ExcelParserService;
  private ocrService: GoogleVisionService;

  constructor(
    apiKey: string = process.env.GOOGLE_VISION_API_KEY || '',
  ) {
    this.documentParser = new DocumentParser();
    this.excelParser = new ExcelParserService();
    this.ocrService = new GoogleVisionService(apiKey);
  }

  /**
   * Parse shipment data from various sources
   * @param input The input data with source type
   * @returns Array of ShipmentData objects
   */
  async parseShipment(input: ShipmentParserInput): Promise<ShipmentData[]> {
    try {
      switch (input.type) {
        case ShipmentSourceType.OCR_IMAGE:
          return this.parseOcrImage(input.data);
        case ShipmentSourceType.EXCEL_TXT:
          return this.parseExcelTxt(input.data);
        default:
          throw new Error(`Unsupported shipment source type: ${input.type}`);
      }
    } catch (error) {
      console.error('Error parsing shipment data:', error);
      throw new Error(`Failed to parse shipment data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse shipment data from an OCR image
   * @param base64Image Base64-encoded image
   * @returns Array with a single ShipmentData object
   */
  private async parseOcrImage(base64Image: string): Promise<ShipmentData[]> {
    try {
      // Process the image with Google Vision API
      const ocrResponse = await this.ocrService.processImage(base64Image);
      
      // Parse the OCR response
      const shipmentData = this.documentParser.parseOcrResponse(ocrResponse);
      
      return [shipmentData];
    } catch (error) {
      console.error('Error parsing OCR image:', error);
      throw new Error(`Failed to parse OCR image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse shipment data from an Excel TXT file
   * @param content The content of the TXT file
   * @returns Array of ShipmentData objects
   */
  private async parseExcelTxt(content: string): Promise<ShipmentData[]> {
    try {
      // Parse the Excel TXT content
      const shipments = await this.excelParser.parseExcelTxt(content);
      
      // Calculate confidence for each shipment
      return shipments.map(shipment => this.excelParser.calculateConfidence(shipment));
    } catch (error) {
      console.error('Error parsing Excel TXT:', error);
      throw new Error(`Failed to parse Excel TXT: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 