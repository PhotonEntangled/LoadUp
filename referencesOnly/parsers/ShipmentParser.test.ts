import { ShipmentParser, ShipmentSourceType } from './ShipmentParser';
import { GoogleVisionService } from '../ocr/GoogleVisionService';
import { DocumentParser } from '../ocr/DocumentParser';
import { ExcelParserService } from '../excel/ExcelParserService';

// Mock the dependencies
jest.mock('../ocr/GoogleVisionService');
jest.mock('../ocr/DocumentParser');
jest.mock('../excel/ExcelParserService');

describe('ShipmentParser', () => {
  let shipmentParser: ShipmentParser;
  let mockGoogleVisionService: jest.Mocked<GoogleVisionService>;
  let mockDocumentParser: jest.Mocked<DocumentParser>;
  let mockExcelParserService: jest.Mocked<ExcelParserService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mocks
    mockGoogleVisionService = new GoogleVisionService('') as jest.Mocked<GoogleVisionService>;
    mockDocumentParser = new DocumentParser() as jest.Mocked<DocumentParser>;
    mockExcelParserService = new ExcelParserService() as jest.Mocked<ExcelParserService>;

    // Create instance with mocked dependencies
    shipmentParser = new ShipmentParser('test-api-key');
  });

  describe('parseShipment', () => {
    it('should parse OCR image data correctly', async () => {
      // Mock data
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMC...';
      const mockOcrResponse = { text: 'Sample OCR text', confidence: 0.9 };
      const mockShipmentData = {
        trackingNumber: '123456789',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        sender: {
          name: 'Jane Smith',
          address: '456 Oak Ave',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890'
        },
        weight: '5 lbs',
        service: 'Express',
        confidence: 0.85,
        needsReview: false
      };

      // Setup mocks
      (GoogleVisionService.prototype.processImage as jest.Mock).mockResolvedValue(mockOcrResponse);
      (DocumentParser.prototype.parseOcrResponse as jest.Mock).mockReturnValue(mockShipmentData);

      // Call the method
      const result = await shipmentParser.parseShipment({
        type: ShipmentSourceType.OCR_IMAGE,
        data: base64Image
      });

      // Assertions
      expect(GoogleVisionService.prototype.processImage).toHaveBeenCalledWith(base64Image);
      expect(DocumentParser.prototype.parseOcrResponse).toHaveBeenCalledWith(mockOcrResponse);
      expect(result).toEqual([mockShipmentData]);
    });

    it('should parse Excel TXT data correctly', async () => {
      // Mock data
      const txtContent = 'LOAD NO\tShip To Customer Name\tAddress Line 1 and 2\tState/ Province\n123456\tJohn Doe\t123 Main St\tCA';
      const mockShipmentData = [{
        trackingNumber: '123456',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        sender: {
          name: 'NIRO TRANSPORTER',
          address: 'Default Address',
          city: 'Default City',
          state: 'Default State',
          zipCode: 'Default ZipCode'
        },
        weight: 'UNKNOWN',
        service: 'UNKNOWN',
        confidence: 0.8,
        needsReview: false
      }];

      // Setup mocks
      (ExcelParserService.prototype.parseExcelTxt as jest.Mock).mockResolvedValue(mockShipmentData);
      (ExcelParserService.prototype.calculateConfidence as jest.Mock).mockImplementation(shipment => ({
        ...shipment,
        confidence: 0.8,
        needsReview: false
      }));

      // Call the method
      const result = await shipmentParser.parseShipment({
        type: ShipmentSourceType.EXCEL_TXT,
        data: txtContent
      });

      // Assertions
      expect(ExcelParserService.prototype.parseExcelTxt).toHaveBeenCalledWith(txtContent);
      expect(ExcelParserService.prototype.calculateConfidence).toHaveBeenCalledTimes(mockShipmentData.length);
      expect(result).toEqual(mockShipmentData);
    });

    it('should throw an error for unsupported source type', async () => {
      // Call the method with an invalid type
      await expect(shipmentParser.parseShipment({
        // @ts-ignore - Testing invalid type
        type: 'INVALID_TYPE',
        data: 'test data'
      })).rejects.toThrow('Unsupported shipment source type: INVALID_TYPE');
    });

    it('should handle OCR processing errors', async () => {
      // Setup mock to throw an error
      (GoogleVisionService.prototype.processImage as jest.Mock).mockRejectedValue(new Error('OCR processing failed'));

      // Call the method
      await expect(shipmentParser.parseShipment({
        type: ShipmentSourceType.OCR_IMAGE,
        data: 'test-image'
      })).rejects.toThrow('Failed to parse OCR image: OCR processing failed');
    });

    it('should handle Excel parsing errors', async () => {
      // Setup mock to throw an error
      (ExcelParserService.prototype.parseExcelTxt as jest.Mock).mockRejectedValue(new Error('Excel parsing failed'));

      // Call the method
      await expect(shipmentParser.parseShipment({
        type: ShipmentSourceType.EXCEL_TXT,
        data: 'test-content'
      })).rejects.toThrow('Failed to parse Excel TXT: Excel parsing failed');
    });
  });
}); 