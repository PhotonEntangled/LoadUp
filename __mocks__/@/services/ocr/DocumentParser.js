/**
 * Mock for the DocumentParser module
 */

/**
 * Mock for Address type
 */
export const Address = {
  name: 'Mock Name',
  address: 'Mock Address',
  city: 'Mock City',
  state: 'MS',
  zipCode: '12345'
};

/**
 * Mock for ShipmentData type
 */
export const ShipmentData = {
  trackingNumber: 'MOCK123',
  recipient: Address,
  sender: Address,
  weight: '10 lbs',
  service: 'Mock Service',
  confidence: 0.9,
  needsReview: false
};

/**
 * Mock for DocumentParser class
 */
export class DocumentParser {
  /**
   * Mock implementation of parseOcrResponse
   */
  parseOcrResponse = jest.fn().mockImplementation((ocrResponse) => {
    return {
      trackingNumber: 'OCR123',
      recipient: {
        name: 'OCR Recipient',
        address: '123 OCR St',
        city: 'OCR City',
        state: 'OC',
        zipCode: '12345'
      },
      sender: {
        name: 'OCR Sender',
        address: '456 OCR Ave',
        city: 'OCR Town',
        state: 'OS',
        zipCode: '67890'
      },
      weight: '10 lbs',
      service: 'OCR Express',
      confidence: 0.85,
      needsReview: false
    };
  });
} 