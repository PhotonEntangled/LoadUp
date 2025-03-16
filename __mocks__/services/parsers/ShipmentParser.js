/**
 * Mock for the ShipmentParser module
 */

// Import the ShipmentData type from the DocumentParser module
import { ShipmentData } from "../../../services/ocr/DocumentParser.js";

/**
 * Mock for ShipmentSourceType enum
 */
export const ShipmentSourceType = {
  OCR_IMAGE: 'OCR_IMAGE',
  EXCEL_TXT: 'EXCEL_TXT'
};

/**
 * Mock for ShipmentParser class
 */
export class ShipmentParser {
  /**
   * Mock implementation of parseShipment
   * This implementation returns mock data based on the input type
   */
  parseShipment = jest.fn().mockImplementation(async (input) => {
    if (input.type === ShipmentSourceType.OCR_IMAGE) {
      return [{
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
      }];
    } else {
      return [{
        trackingNumber: 'EXCEL123',
        recipient: {
          name: 'Excel Recipient',
          address: '123 Excel St',
          city: 'Excel City',
          state: 'EX',
          zipCode: '12345'
        },
        sender: {
          name: 'Excel Sender',
          address: '456 Excel Ave',
          city: 'Excel Town',
          state: 'ES',
          zipCode: '67890'
        },
        weight: '5 lbs',
        service: 'Excel Standard',
        confidence: 0.9,
        needsReview: false
      }];
    }
  })
} 