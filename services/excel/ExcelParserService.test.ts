import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ExcelParserService } from './ExcelParserService';
import { openAIService } from '../ai/OpenAIService';

// Mock the OpenAI service
vi.mock('../ai/OpenAIService', () => ({
  openAIService: {
    mapField: vi.fn()
  }
}));

// Mock xlsx library
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}));

describe('ExcelParserService', () => {
  let service: ExcelParserService;
  
  beforeEach(() => {
    service = new ExcelParserService();
    vi.clearAllMocks();
  });
  
  describe('getStandardFieldName', () => {
    test('should return direct match when field exists in mapping', async () => {
      // Explicitly added `: any` to access private method
      const result = await (service as any).getStandardFieldName('LOAD NO', { 'LOAD NO': 'loadNumber' });
      
      expect(result).toEqual({
        fieldName: 'loadNumber',
        confidence: 1.0,
        aiMapped: false,
        originalField: 'LOAD NO'
      });
    });
    
    test('should return case-insensitive match when field exists with different case', async () => {
      const result = await (service as any).getStandardFieldName('load no', { 'LOAD NO': 'loadNumber' });
      
      expect(result).toEqual({
        fieldName: 'loadNumber',
        confidence: 0.95,
        aiMapped: false,
        originalField: 'load no'
      });
    });
    
    test('should use AI mapping when no direct or case-insensitive match exists', async () => {
      // Mock AI mapping response
      vi.mocked(openAIService.mapField).mockResolvedValueOnce({
        mappedField: 'remarks',
        confidence: 0.92,
        reasoning: 'This field contains notes about the shipment'
      });
      
      const result = await (service as any).getStandardFieldName('Notes and Comments', { 'REMARKS': 'remarks' });
      
      expect(openAIService.mapField).toHaveBeenCalled();
      expect(result).toEqual({
        fieldName: 'remarks',
        confidence: 0.92,
        aiMapped: true,
        originalField: 'Notes and Comments'
      });
    });
    
    test('should fall back to normalized field name when AI mapping has low confidence', async () => {
      // Mock AI mapping response with low confidence
      vi.mocked(openAIService.mapField).mockResolvedValueOnce({
        mappedField: 'unknown',
        confidence: 0.3,
        reasoning: 'Could not confidently map this field'
      });
      
      const result = await (service as any).getStandardFieldName('Misc Info Field', {});
      
      expect(result).toEqual({
        fieldName: 'miscInfoField',
        confidence: 0.3,
        aiMapped: false,
        originalField: 'Misc Info Field'
      });
    });
  });
  
  describe('calculateConfidence', () => {
    test('should calculate higher confidence for shipments with more fields', () => {
      const completeShipment = {
        loadNumber: 'L12345',
        orderNumber: 'O12345',
        promisedShipDate: '2023-05-01',
        shipToAddress: '123 Main St',
        shipToCustomer: 'Test Customer',
        shipToState: 'CA',
        contactNumber: '123-456-7890',
        poNumber: 'PO12345',
        remarks: 'Test remarks',
        items: [{ 
          itemNumber: 'I1', 
          description: 'Test Item', 
          quantity: 1 
        }],
        totalWeight: 100
      };
      
      const result = service.calculateConfidence(completeShipment);
      
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.needsReview).toBe(false);
    });
    
    test('should flag shipments with AI-mapped critical fields for review', () => {
      const shipmentWithAIMappedFields = {
        loadNumber: 'L12345',
        orderNumber: 'O12345',
        promisedShipDate: '2023-05-01',
        shipToAddress: '123 Main St',
        shipToCustomer: 'Test Customer',
        items: [{ 
          itemNumber: 'I1', 
          description: 'Test Item', 
          quantity: 1 
        }],
        totalWeight: 100,
        aiMappedFields: [
          { field: 'shipToAddress', originalField: 'Address', confidence: 0.6 },
          { field: 'remarks', originalField: 'Notes', confidence: 0.85 }
        ]
      };
      
      const result = service.calculateConfidence(shipmentWithAIMappedFields);
      
      expect(result.confidence).toBeLessThan(0.7);
      expect(result.needsReview).toBe(true);
    });
    
    test('should not flag shipments with high-confidence AI mappings for review', () => {
      const shipmentWithHighConfidenceAIMappings = {
        loadNumber: 'L12345',
        orderNumber: 'O12345',
        promisedShipDate: '2023-05-01',
        shipToAddress: '123 Main St',
        shipToCustomer: 'Test Customer',
        items: [{ 
          itemNumber: 'I1', 
          description: 'Test Item', 
          quantity: 1 
        }],
        totalWeight: 100,
        aiMappedFields: [
          { field: 'remarks', originalField: 'Notes', confidence: 0.95 },
          { field: 'poNumber', originalField: 'Purchase Order', confidence: 0.92 }
        ]
      };
      
      const result = service.calculateConfidence(shipmentWithHighConfidenceAIMappings);
      
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.needsReview).toBe(false);
    });
  });
});
