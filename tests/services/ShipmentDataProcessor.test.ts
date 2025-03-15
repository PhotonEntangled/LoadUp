import { ShipmentDataProcessor, DataSourceType, ProcessOptions } from '../../services/data/ShipmentDataProcessor';
import { GoogleVisionService } from '../../services/ocr/GoogleVisionService';
import { DocumentParser } from '../../services/ocr/DocumentParser';
import { ExcelParserService } from '../../services/excel/ExcelParserService';

// Mock the dependencies
jest.mock('../../services/ocr/GoogleVisionService');
jest.mock('../../services/ocr/DocumentParser');
jest.mock('../../services/excel/ExcelParserService');

describe('ShipmentDataProcessor', () => {
  let processor: ShipmentDataProcessor;
  const mockApiKey = 'test-api-key';
  
  // Mock implementations
  const mockProcessImage = jest.fn();
  const mockParseOcrResponse = jest.fn();
  const mockParseExcelTxt = jest.fn();
  const mockCalculateConfidence = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    (GoogleVisionService as jest.Mock).mockImplementation(() => ({
      processImage: mockProcessImage
    }));
    
    (DocumentParser as jest.Mock).mockImplementation(() => ({
      parseOcrResponse: mockParseOcrResponse
    }));
    
    (ExcelParserService as jest.Mock).mockImplementation(() => ({
      parseExcelTxt: mockParseExcelTxt,
      calculateConfidence: mockCalculateConfidence
    }));
    
    // Create processor instance
    processor = new ShipmentDataProcessor(mockApiKey);
  });
  
  describe('processImageData', () => {
    it('should process image data correctly', async () => {
      // Mock data
      const imageBase64 = 'base64-image-data';
      const mockOcrResponse = { text: 'Sample OCR text' };
      const mockShipmentData = {
        trackingNumber: 'ABC123',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        sender: {
          name: 'Sender Name',
          address: 'Sender Address',
          city: 'Sender City',
          state: 'Sender State',
          zipCode: 'Sender ZipCode'
        },
        weight: '25',
        service: 'Ground',
        confidence: 0.85,
        needsReview: false
      };
      
      // Setup mocks
      mockProcessImage.mockResolvedValue(mockOcrResponse);
      mockParseOcrResponse.mockReturnValue(mockShipmentData);
      
      // Call the method
      const result = await processor.processImageData(imageBase64);
      
      // Assertions
      expect(mockProcessImage).toHaveBeenCalledWith(imageBase64);
      expect(mockParseOcrResponse).toHaveBeenCalledWith(mockOcrResponse);
      expect(result.shipments).toHaveLength(1);
      expect(result.shipments[0]).toEqual({
        ...mockShipmentData,
        needsReview: false
      });
      expect(result.totalProcessed).toBe(1);
      expect(result.needsReview).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.source).toBe(DataSourceType.OCR_IMAGE);
    });
    
    it('should handle errors during image processing', async () => {
      // Mock data
      const imageBase64 = 'base64-image-data';
      const mockError = new Error('OCR processing failed');
      
      // Setup mocks to throw an error
      mockProcessImage.mockRejectedValue(mockError);
      
      // Call the method
      const result = await processor.processImageData(imageBase64);
      
      // Assertions
      expect(result.shipments).toHaveLength(0);
      expect(result.totalProcessed).toBe(0);
      expect(result.needsReview).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('OCR processing failed');
      expect(result.source).toBe(DataSourceType.OCR_IMAGE);
    });
    
    it('should mark shipments for review based on confidence threshold', async () => {
      // Mock data
      const imageBase64 = 'base64-image-data';
      const mockOcrResponse = { text: 'Sample OCR text' };
      const mockShipmentData = {
        trackingNumber: 'ABC123',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        sender: {
          name: 'Sender Name',
          address: 'Sender Address',
          city: 'Sender City',
          state: 'Sender State',
          zipCode: 'Sender ZipCode'
        },
        weight: '25',
        service: 'Ground',
        confidence: 0.65, // Below default threshold of 0.7
        needsReview: false
      };
      
      // Setup mocks
      mockProcessImage.mockResolvedValue(mockOcrResponse);
      mockParseOcrResponse.mockReturnValue(mockShipmentData);
      
      // Call the method
      const result = await processor.processImageData(imageBase64);
      
      // Assertions
      expect(result.shipments[0].needsReview).toBe(true);
      expect(result.needsReview).toBe(1);
    });
  });
  
  describe('processExcelTxtData', () => {
    it('should process Excel TXT data correctly', async () => {
      // Mock data
      const txtContent = 'Sample TXT content';
      const mockShipments = [
        {
          trackingNumber: 'ABC123',
          recipient: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001'
          },
          sender: {
            name: 'Sender Name',
            address: 'Sender Address',
            city: 'Sender City',
            state: 'Sender State',
            zipCode: 'Sender ZipCode'
          },
          weight: '25',
          service: 'Ground',
          confidence: 0.95,
          needsReview: false
        },
        {
          trackingNumber: 'DEF456',
          recipient: {
            name: 'Jane Smith',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001'
          },
          sender: {
            name: 'Sender Name',
            address: 'Sender Address',
            city: 'Sender City',
            state: 'Sender State',
            zipCode: 'Sender ZipCode'
          },
          weight: '15',
          service: 'Express',
          confidence: 0.85,
          needsReview: false
        }
      ];
      
      // Setup mocks
      mockParseExcelTxt.mockResolvedValue(mockShipments);
      mockCalculateConfidence.mockImplementation(shipment => ({
        ...shipment,
        confidence: shipment.confidence,
        needsReview: shipment.confidence < 0.7
      }));
      
      // Call the method
      const result = await processor.processExcelTxtData(txtContent);
      
      // Assertions
      expect(mockParseExcelTxt).toHaveBeenCalledWith(txtContent);
      expect(result.shipments).toHaveLength(2);
      expect(result.totalProcessed).toBe(2);
      expect(result.needsReview).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.source).toBe(DataSourceType.EXCEL_TXT);
    });
    
    it('should handle errors during Excel TXT processing', async () => {
      // Mock data
      const txtContent = 'Sample TXT content';
      const mockError = new Error('Excel parsing failed');
      
      // Setup mocks to throw an error
      mockParseExcelTxt.mockRejectedValue(mockError);
      
      // Call the method
      const result = await processor.processExcelTxtData(txtContent);
      
      // Assertions
      expect(result.shipments).toHaveLength(0);
      expect(result.totalProcessed).toBe(0);
      expect(result.needsReview).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Excel parsing failed');
      expect(result.source).toBe(DataSourceType.EXCEL_TXT);
    });
  });
  
  describe('processData', () => {
    it('should route to the correct processor based on source type', async () => {
      // Mock implementations for the specific processors
      const processImageDataSpy = jest.spyOn(processor, 'processImageData').mockResolvedValue({
        shipments: [],
        totalProcessed: 1,
        needsReview: 0,
        errors: [],
        source: DataSourceType.OCR_IMAGE
      });
      
      const processExcelTxtDataSpy = jest.spyOn(processor, 'processExcelTxtData').mockResolvedValue({
        shipments: [],
        totalProcessed: 2,
        needsReview: 0,
        errors: [],
        source: DataSourceType.EXCEL_TXT
      });
      
      // Test OCR_IMAGE source
      await processor.processData('image-data', { source: DataSourceType.OCR_IMAGE });
      expect(processImageDataSpy).toHaveBeenCalledWith('image-data', { source: DataSourceType.OCR_IMAGE });
      
      // Test EXCEL_TXT source
      await processor.processData('txt-data', { source: DataSourceType.EXCEL_TXT });
      expect(processExcelTxtDataSpy).toHaveBeenCalledWith('txt-data', { source: DataSourceType.EXCEL_TXT });
      
      // Test MANUAL_ENTRY source (not implemented)
      const manualResult = await processor.processData('manual-data', { source: DataSourceType.MANUAL_ENTRY });
      expect(manualResult.errors).toContain('Manual entry processing not implemented');
      
      // Test invalid source
      const invalidResult = await processor.processData('data', { source: 'INVALID' as DataSourceType });
      expect(invalidResult.errors[0]).toContain('Unsupported data source');
    });
  });
  
  describe('validateShipment', () => {
    it('should validate a complete shipment as valid', () => {
      const shipment = {
        trackingNumber: 'ABC123',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        sender: {
          name: 'Sender Name',
          address: 'Sender Address',
          city: 'Sender City',
          state: 'Sender State',
          zipCode: 'Sender ZipCode'
        },
        weight: '25',
        service: 'Ground',
        confidence: 0.95,
        needsReview: false
      };
      
      const result = processor.validateShipment(shipment);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should identify missing required fields', () => {
      const shipment = {
        trackingNumber: 'UNKNOWN',
        recipient: {
          name: 'John Doe',
          address: 'UNKNOWN',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        sender: {
          name: 'Sender Name',
          address: 'Sender Address',
          city: 'Sender City',
          state: 'Sender State',
          zipCode: 'Sender ZipCode'
        },
        weight: '25',
        service: 'Ground',
        confidence: 0.95,
        needsReview: false
      };
      
      const result = processor.validateShipment(shipment);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing tracking number');
      expect(result.errors).toContain('Missing recipient address');
    });
    
    it('should validate format of tracking number and zip code', () => {
      const shipment = {
        trackingNumber: 'A1', // Too short
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: 'ABCDE' // Not a valid zip code format
        },
        sender: {
          name: 'Sender Name',
          address: 'Sender Address',
          city: 'Sender City',
          state: 'Sender State',
          zipCode: 'Sender ZipCode'
        },
        weight: '25',
        service: 'Ground',
        confidence: 0.95,
        needsReview: false
      };
      
      const result = processor.validateShipment(shipment);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid tracking number format');
      expect(result.errors).toContain('Invalid recipient zip code format');
    });
  });
}); 