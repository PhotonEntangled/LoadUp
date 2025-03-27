import { ExcelParserService, FIELD_MAPPINGS } from '../../services/excel/ExcelParserService';
import * as fs from 'fs';
import * as path from 'path';

describe('ExcelParserService', () => {
  let service: ExcelParserService;
  
  beforeEach(() => {
    service = new ExcelParserService();
  });
  
  describe('parseExcelTxt', () => {
    it('should parse TXT version of ETD report format', async () => {
      // Arrange
      const filePath = path.resolve(__dirname, '../../analysis/LOADUP ETD 7.1.2025-2.xls.txt');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Act
      const result = await service.parseExcelTxt(content, {
        fieldMapping: FIELD_MAPPINGS.ETD_REPORT
      });
      
      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const firstShipment = result[0];
      expect(firstShipment.loadNumber).toBeDefined();
      expect(firstShipment.items.length).toBeGreaterThan(0);
    });
    
    it('should parse TXT version of Outstation Rates format', async () => {
      // Arrange
      const filePath = path.resolve(__dirname, '../../analysis/NIRO OUTSTATION (RATES) 30.12.24 - 31.12.2024.txt');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Act
      const result = await service.parseExcelTxt(content, {
        fieldMapping: FIELD_MAPPINGS.OUTSTATION_RATES
      });
      
      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
  
  describe('mapRowToFields', () => {
    it('should map row data to standardized field names', () => {
      // Arrange
      const headers = ['LOAD NO', 'Order Number', 'Ship To Customer Name', 'REMARK'];
      const row = ['12345', '67890', 'ACME Corp', 'Urgent'];
      
      // Act
      // @ts-ignore - testing private method
      const result = service.mapRowToFields(row, headers, FIELD_MAPPINGS.ETD_REPORT);
      
      // Assert
      expect(result.loadNumber).toBe('12345');
      expect(result.orderNumber).toBe('67890');
      expect(result.shipToCustomer).toBe('ACME Corp');
      expect(result.remarks).toBe('Urgent');
    });
    
    it('should handle empty or missing values', () => {
      // Arrange
      const headers = ['LOAD NO', 'Order Number', 'Ship To Customer Name', 'REMARK'];
      const row = ['12345', '', null, undefined];
      
      // Act
      // @ts-ignore - testing private method
      const result = service.mapRowToFields(row, headers, FIELD_MAPPINGS.ETD_REPORT);
      
      // Assert
      expect(result.loadNumber).toBe('12345');
      expect(result.orderNumber).toBe('');
      expect(result.shipToCustomer).toBeNull();
      expect(result.remarks).toBeUndefined();
    });
  });
  
  describe('normalizeFieldName', () => {
    it('should convert field names to camelCase', () => {
      // Arrange & Act
      // @ts-ignore - testing private method
      const result1 = service.normalizeFieldName('Ship To Customer');
      // @ts-ignore - testing private method
      const result2 = service.normalizeFieldName('Order Number');
      // @ts-ignore - testing private method
      const result3 = service.normalizeFieldName('LOAD NO');
      
      // Assert
      expect(result1).toBe('shipToCustomer');
      expect(result2).toBe('orderNumber');
      expect(result3).toBe('loadNo');
    });
    
    it('should handle special characters', () => {
      // Arrange & Act
      // @ts-ignore - testing private method
      const result = service.normalizeFieldName('PO # / Reference');
      
      // Assert
      expect(result).toBe('poReference');
    });
  });
  
  describe('calculateConfidence', () => {
    it('should add confidence score to shipment', () => {
      // Arrange
      const shipment = {
        loadNumber: '12345',
        orderNumber: '67890',
        promisedShipDate: '01/01/2025',
        shipToAddress: '123 Main St',
        shipToCustomer: 'ACME Corp',
        items: [
          { itemNumber: 'A123', description: 'Test Item', quantity: 5, weight: 10 }
        ],
        totalWeight: 10
      };
      
      // Act
      const result = service.calculateConfidence(shipment);
      
      // Assert
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.needsReview).toBeDefined();
    });
    
    it('should mark shipment for review when missing required fields', () => {
      // Arrange
      const shipment = {
        // Missing loadNumber and orderNumber
        promisedShipDate: '01/01/2025',
        shipToAddress: '123 Main St',
        items: [],
        totalWeight: 0
      };
      
      // Act
      const result = service.calculateConfidence(shipment);
      
      // Assert
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.needsReview).toBe(true);
    });
  });
});
