import { describe, test, expect } from '@jest/globals';
import { z } from 'zod';
import { transformShipmentData } from '../etl/transform.js';
import { ShipmentSlipSchema } from '../schema/validation.js';

describe('ELT Pipeline Final Validation', () => {
  test('Shipment Slip Schema Validation', () => {
    const validShipment = {
      externalId: 'SHIP123',
      pickupAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      deliveryAddress: {
        street: '456 Park Ave',
        city: 'Brooklyn',
        state: 'NY',
        zip: '11201',
        coordinates: { lat: 40.6782, lng: -73.9442 }
      },
      customerName: 'John Doe',
      customerPhone: '+1234567890',
      weight: 50,
      dimensions: '20x30x40',
      priority: 'EXPRESS' as const,
      paymentStatus: 'PENDING' as const
    };

    const result = ShipmentSlipSchema.safeParse(validShipment);
    expect(result.success).toBe(true);
  });

  test('Address Standardization', () => {
    const rawAddress = {
      street: '123  MAIN  ST',
      city: 'NEW  YORK',
      state: 'ny',
      zip: '10001'
    };

    const standardized = transformShipmentData({
      ...mockShipmentData,
      pickupAddress: rawAddress
    });

    expect(standardized.pickupAddress).toEqual({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      coordinates: expect.any(Object)
    });
  });

  test('Phone Number Standardization', () => {
    const testCases = [
      { input: '1234567890', expected: '+11234567890' },
      { input: '+1-234-567-8900', expected: '+12345678900' },
      { input: '(123) 456-7890', expected: '+11234567890' }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = transformShipmentData({
        ...mockShipmentData,
        customerPhone: input
      });
      expect(result.customerPhone).toBe(expected);
    });
  });

  test('Error Handling - Invalid Data', () => {
    const invalidShipment = {
      externalId: 'SHIP123',
      // Missing required fields
      customerName: 'John Doe'
    };

    const result = ShipmentSlipSchema.safeParse(invalidShipment);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  test('Batch Processing Performance', async () => {
    const batchSize = 100;
    const shipments = Array(batchSize).fill(null).map((_, i) => ({
      ...mockShipmentData,
      externalId: `SHIP${i}`
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      shipments.map(shipment => transformShipmentData(shipment))
    );
    const endTime = Date.now();

    // Batch processing should complete in under 5 seconds
    expect(endTime - startTime).toBeLessThan(5000);
    expect(results).toHaveLength(batchSize);
  });
});

// Mock data for tests
const mockShipmentData = {
  externalId: 'SHIP123',
  pickupAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  deliveryAddress: {
    street: '456 Park Ave',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    coordinates: { lat: 40.6782, lng: -73.9442 }
  },
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  weight: 50,
  dimensions: '20x30x40',
  priority: 'EXPRESS' as const,
  paymentStatus: 'PENDING' as const
}; 