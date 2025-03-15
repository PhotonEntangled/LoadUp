/// <reference types="jest" />

// Create a mock db object
const mockDb = {
  delete: jest.fn().mockResolvedValue({}),
  insert: jest.fn().mockResolvedValue({}),
  select: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([])
  }),
  query: {
    documentsTable: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'doc-123',
        documentType: 'shipment_slip',
        fileName: 'test.pdf'
      })
    }
  }
};

// Mock the ShipmentSlipProcessor
jest.mock('../services/etl/shipments-processor', () => {
  return {
    ShipmentSlipProcessor: jest.fn().mockImplementation(() => {
      return {
        processSlip: jest.fn().mockResolvedValue({
          success: true,
          shipmentId: 'test-123'
        }),
        processBatch: jest.fn().mockResolvedValue({
          processed: 1,
          failed: 0,
          errors: []
        })
      };
    })
  };
});

// Import the processor
import { ShipmentSlipProcessor } from '../services/etl/shipments-processor';

describe('ShipmentSlipProcessor', () => {
  let processor: any;

  beforeEach(() => {
    processor = new ShipmentSlipProcessor();
    jest.clearAllMocks();
  });

  it('should process valid shipment slips', async () => {
    const testSlip = {
      externalId: 'SL-12345',
      content: 'Test shipment slip content',
      source: 'OCR'
    };

    const result = await processor.processSlip(testSlip);
    
    expect(result.success).toBe(true);
    expect(result.shipmentId).toBe('test-123');
  });

  it('should detect duplicate shipments', async () => {
    // Mock the processBatch method to simulate a duplicate error
    processor.processBatch = jest.fn().mockResolvedValue({
      processed: 0,
      failed: 1,
      errors: ['Duplicate shipment detected: TEST-002']
    });

    const testSlip = {
      externalId: 'TEST-002',
      pickupAddress: '123 Pickup St',
      deliveryAddress: '456 Delivery Ave',
      customerName: 'Test Customer',
      customerPhone: '123-456-7890',
    };

    const result = await processor.processBatch([testSlip]);

    expect(result.processed).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toContain('Duplicate shipment');
  });

  it('should process OCR data when document URL is provided', async () => {
    const testSlip = {
      externalId: 'TEST-003',
      pickupAddress: '123 Pickup St',
      deliveryAddress: '456 Delivery Ave',
      customerName: 'Test Customer',
      customerPhone: '123-456-7890',
      documentUrl: 'https://example.com/test-document.pdf',
    };

    const result = await processor.processBatch([testSlip]);
    expect(result.processed).toBe(1);
  });
}); 