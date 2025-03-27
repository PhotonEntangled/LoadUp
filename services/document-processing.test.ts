import { describe, test, expect, vi, beforeEach } from 'vitest';
import { processDocument } from './document-processing';
import { ExcelParserService } from './excel/ExcelParserService';
import { TextFileParserService } from './text/TextFileParserService';
import fs from 'fs';

// Mock the parser services
vi.mock('./excel/ExcelParserService', () => ({
  ExcelParserService: vi.fn().mockImplementation(() => ({
    parseExcelFile: vi.fn(),
    calculateConfidence: vi.fn()
  }))
}));

vi.mock('./text/TextFileParserService', () => ({
  TextFileParserService: vi.fn().mockImplementation(() => ({
    parseTextFile: vi.fn()
  }))
}));

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('mock data')),
  existsSync: vi.fn()
}));

describe('Document Processing', () => {
  let excelParserMock: any;
  let textParserMock: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    excelParserMock = new ExcelParserService();
    textParserMock = new TextFileParserService();
    
    // Mock file existence check
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });
  
  test('should process Excel files with AI mapping enabled', async () => {
    // Mock Excel data
    const mockParsedData = [{
      loadNumber: 'L12345',
      orderNumber: 'O12345',
      promisedShipDate: '2023-05-01',
      aiMappedFields: [
        { field: 'remarks', originalField: 'Notes', confidence: 0.92 }
      ]
    }];
    
    const mockConfidenceResult = {
      confidence: 0.85,
      needsReview: false,
      message: 'Shipment processed with AI field mapping'
    };
    
    // Setup mocks
    vi.mocked(excelParserMock.parseExcelFile).mockResolvedValueOnce(mockParsedData);
    vi.mocked(excelParserMock.calculateConfidence).mockReturnValueOnce(mockConfidenceResult);
    
    // Process an Excel file with AI mapping
    const result = await processDocument('test.xlsx', { useAIMapping: true });
    
    // Check if Excel parser was used with AI mapping
    expect(excelParserMock.parseExcelFile).toHaveBeenCalledWith('test.xlsx', { useAIMapping: true });
    expect(result).toEqual({
      data: mockParsedData,
      confidence: 0.85,
      needsReview: false,
      message: 'Shipment processed with AI field mapping'
    });
  });
  
  test('should process Excel files without AI mapping when disabled', async () => {
    // Mock Excel data without AI mapping
    const mockParsedData = [{
      loadNumber: 'L12345',
      orderNumber: 'O12345',
      promisedShipDate: '2023-05-01'
    }];
    
    const mockConfidenceResult = {
      confidence: 1.0,
      needsReview: false,
      message: 'Shipment processed successfully'
    };
    
    // Setup mocks
    vi.mocked(excelParserMock.parseExcelFile).mockResolvedValueOnce(mockParsedData);
    vi.mocked(excelParserMock.calculateConfidence).mockReturnValueOnce(mockConfidenceResult);
    
    // Process an Excel file without AI mapping
    const result = await processDocument('test.xlsx', { useAIMapping: false });
    
    // Check if Excel parser was used without AI mapping
    expect(excelParserMock.parseExcelFile).toHaveBeenCalledWith('test.xlsx', { useAIMapping: false });
    expect(result).toEqual({
      data: mockParsedData,
      confidence: 1.0,
      needsReview: false,
      message: 'Shipment processed successfully'
    });
  });
  
  test('should process text files as before', async () => {
    // Mock text file data
    const mockParsedData = [{
      loadNumber: 'L12345',
      orderNumber: 'O12345',
      promisedShipDate: '2023-05-01'
    }];
    
    // Setup mock
    vi.mocked(textParserMock.parseTextFile).mockResolvedValueOnce(mockParsedData);
    
    // Process a text file
    const result = await processDocument('test.txt');
    
    // Check if text parser was used
    expect(textParserMock.parseTextFile).toHaveBeenCalledWith('test.txt');
    expect(result).toEqual({
      data: mockParsedData,
      confidence: 1.0,
      needsReview: false,
      message: 'Shipment processed successfully'
    });
  });
  
  test('should handle files with low confidence AI mappings', async () => {
    // Mock Excel data with low confidence mappings
    const mockParsedData = [{
      loadNumber: 'L12345',
      orderNumber: 'O12345',
      aiMappedFields: [
        { field: 'shipToAddress', originalField: 'Address', confidence: 0.4 }
      ]
    }];
    
    const mockConfidenceResult = {
      confidence: 0.5,
      needsReview: true,
      message: 'Low confidence in field mappings, manual review recommended'
    };
    
    // Setup mocks
    vi.mocked(excelParserMock.parseExcelFile).mockResolvedValueOnce(mockParsedData);
    vi.mocked(excelParserMock.calculateConfidence).mockReturnValueOnce(mockConfidenceResult);
    
    // Process an Excel file with low confidence mappings
    const result = await processDocument('test.xlsx', { useAIMapping: true });
    
    // Check results reflect low confidence
    expect(result).toEqual({
      data: mockParsedData,
      confidence: 0.5,
      needsReview: true,
      message: 'Low confidence in field mappings, manual review recommended'
    });
  });
  
  test('should throw error for non-existent files', async () => {
    // Mock file not existing
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    
    // Expect error when processing non-existent file
    await expect(processDocument('nonexistent.xlsx')).rejects.toThrow('File not found');
  });
  
  test('should throw error for unsupported file types', async () => {
    // Expect error when processing unsupported file type
    await expect(processDocument('test.pdf')).rejects.toThrow('Unsupported file type');
  });
}); 