import { ExcelParserService } from '../../services/excel/ExcelParserService';

describe('ExcelParserService', () => {
  let excelParser: ExcelParserService;
  
  beforeEach(() => {
    excelParser = new ExcelParserService();
  });
  
  describe('parseExcelTxt', () => {
    it('should parse a valid TXT file with headers', async () => {
      // Sample TXT content with headers
      const txtContent = 
        'LOAD NO\tShip To Customer Name\tAddress Line 1 and 2\tState/ Province\tWeight (KG)\tShip Via\n' +
        'ABC123\tJohn Doe\t123 Main St "New York" 10001\tNY\t25\tGround\n' +
        'DEF456\tJane Smith\t456 Oak Ave "Los Angeles" 90001\tCA\t15\tExpress';
      
      const result = await excelParser.parseExcelTxt(txtContent);
      
      expect(result).toHaveLength(2);
      expect(result[0].trackingNumber).toBe('ABC123');
      expect(result[0].recipient.name).toBe('John Doe');
      expect(result[0].recipient.address).toBe('123 Main St "New York" 10001');
      expect(result[0].recipient.city).toBe('New York');
      expect(result[0].recipient.state).toBe('NY');
      expect(result[0].recipient.zipCode).toBe('10001');
      expect(result[0].weight).toBe('25');
      expect(result[0].service).toBe('Ground');
      
      expect(result[1].trackingNumber).toBe('DEF456');
      expect(result[1].recipient.name).toBe('Jane Smith');
      expect(result[1].recipient.state).toBe('CA');
    });
    
    it('should handle TXT files without headers', async () => {
      // Sample TXT content without headers
      const txtContent = 
        'ABC123\tJohn Doe\t123 Main St "New York" 10001\tNY\t25\tGround\n' +
        'DEF456\tJane Smith\t456 Oak Ave "Los Angeles" 90001\tCA\t15\tExpress';
      
      const result = await excelParser.parseExcelTxt(txtContent, { hasHeaderRow: false });
      
      expect(result).toHaveLength(2);
      // The exact mapping will depend on the implementation's fallback behavior
      // Here we're just checking that it parsed something
      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
    });
    
    it('should handle empty or invalid TXT files', async () => {
      const emptyContent = '';
      const invalidContent = 'Not a valid TXT format';
      
      const emptyResult = await excelParser.parseExcelTxt(emptyContent);
      const invalidResult = await excelParser.parseExcelTxt(invalidContent);
      
      expect(emptyResult).toHaveLength(0);
      expect(invalidResult).toHaveLength(0);
    });
    
    it('should extract address components correctly', async () => {
      const txtContent = 
        'LOAD NO\tShip To Customer Name\tAddress Line 1 and 2\tState/ Province\n' +
        'ABC123\tJohn Doe\t123 Main St "New York" 10001\tNY';
      
      const result = await excelParser.parseExcelTxt(txtContent);
      
      expect(result).toHaveLength(1);
      expect(result[0].recipient.address).toBe('123 Main St "New York" 10001');
      expect(result[0].recipient.city).toBe('New York');
      expect(result[0].recipient.zipCode).toBe('10001');
    });
  });
  
  describe('calculateConfidence', () => {
    it('should calculate confidence correctly for complete data', () => {
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
        confidence: 0,
        needsReview: false
      };
      
      const result = excelParser.calculateConfidence(shipment);
      
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.needsReview).toBe(false);
    });
    
    it('should mark shipments with missing data for review', () => {
      const shipment = {
        trackingNumber: 'ABC123',
        recipient: {
          name: 'UNKNOWN', // Missing name
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
        weight: 'UNKNOWN', // Missing weight
        service: 'UNKNOWN', // Missing service
        confidence: 0,
        needsReview: false
      };
      
      const result = excelParser.calculateConfidence(shipment);
      
      // With multiple missing fields, confidence should be well below 0.7
      expect(result.confidence).toBeLessThanOrEqual(0.65);
      expect(result.needsReview).toBe(true);
    });
  });
}); 