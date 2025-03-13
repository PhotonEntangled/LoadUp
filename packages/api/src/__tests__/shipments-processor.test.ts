/// <reference types="jest" />

import { ShipmentSlipProcessor } from '../services/etl/shipments-processor';
import { db } from '@loadup/database';
import { shipmentsStaging, documentsTable } from '@loadup/database/schema';

describe('ShipmentSlipProcessor', () => {
  let processor: ShipmentSlipProcessor;

  beforeEach(() => {
    processor = new ShipmentSlipProcessor();
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(shipmentsStaging);
    await db.delete(documentsTable);
  });

  it('should process valid shipment slips', async () => {
    const testSlips = [
      {
        externalId: 'TEST-001',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery Ave',
        customerName: 'Test Customer',
        customerPhone: '123-456-7890',
      },
    ];

    const result = await processor.processBatch(testSlips);
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('should detect duplicate shipments', async () => {
    const testSlip = {
      externalId: 'TEST-002',
      pickupAddress: '123 Pickup St',
      deliveryAddress: '456 Delivery Ave',
      customerName: 'Test Customer',
      customerPhone: '123-456-7890',
    };

    // Process the same slip twice
    await processor.processBatch([testSlip]);
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

    // Verify document was stored
    const doc = await db.query.documentsTable.findFirst({
      where: { shipmentId: testSlip.externalId },
    });
    expect(doc).toBeTruthy();
    expect(doc?.type).toBe('shipment_slip');
  });
}); 