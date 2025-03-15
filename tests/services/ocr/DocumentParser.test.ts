import { describe, it, expect } from '@jest/globals';
import { DocumentParser } from '../../../services/ocr/DocumentParser';

describe('DocumentParser', () => {
  let parser: DocumentParser;
  
  beforeEach(() => {
    parser = new DocumentParser();
  });

  it('should be defined', () => {
    expect(parser).toBeDefined();
  });

  describe('parseOcrResponse', () => {
    it('should extract shipping information from OCR response', () => {
      // Mock OCR response from Google Vision API
      const mockOcrResponse = {
        responses: [
          {
            fullTextAnnotation: {
              text: 'SHIPPING LABEL\nTracking #: 1Z999AA10123456784\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210\nFrom:\nAcme Inc.\n456 Business Ave\nCommerce, CA 90022\nWeight: 5.2 lbs\nService: Ground',
              pages: [{ confidence: 0.98 }]
            },
            textAnnotations: [
              {
                description: 'SHIPPING LABEL\nTracking #: 1Z999AA10123456784\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210\nFrom:\nAcme Inc.\n456 Business Ave\nCommerce, CA 90022\nWeight: 5.2 lbs\nService: Ground',
                boundingPoly: { vertices: [{ x: 0, y: 0 }] }
              },
              {
                description: 'SHIPPING',
                boundingPoly: { vertices: [{ x: 10, y: 10 }] }
              },
              {
                description: 'LABEL',
                boundingPoly: { vertices: [{ x: 80, y: 10 }] }
              },
              {
                description: 'Tracking',
                boundingPoly: { vertices: [{ x: 10, y: 40 }] }
              },
              {
                description: '#:',
                boundingPoly: { vertices: [{ x: 70, y: 40 }] }
              },
              {
                description: '1Z999AA10123456784',
                boundingPoly: { vertices: [{ x: 90, y: 40 }] }
              }
              // More annotations would be here in a real response
            ]
          }
        ]
      };

      const result = parser.parseOcrResponse(mockOcrResponse);

      // Check that the parser extracted the correct information
      expect(result).toEqual({
        trackingNumber: '1Z999AA10123456784',
        recipient: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210'
        },
        sender: {
          name: 'Acme Inc.',
          address: '456 Business Ave',
          city: 'Commerce',
          state: 'CA',
          zipCode: '90022'
        },
        weight: '5.2 lbs',
        service: 'Ground',
        confidence: 0.98
      });
    });

    it('should handle missing tracking number', () => {
      const mockOcrResponse = {
        responses: [
          {
            fullTextAnnotation: {
              text: 'SHIPPING LABEL\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210\nFrom:\nAcme Inc.\n456 Business Ave\nCommerce, CA 90022\nWeight: 5.2 lbs\nService: Ground',
              pages: [{ confidence: 0.95 }]
            },
            textAnnotations: [
              // Simplified annotations for test
              {
                description: 'SHIPPING LABEL\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210\nFrom:\nAcme Inc.\n456 Business Ave\nCommerce, CA 90022\nWeight: 5.2 lbs\nService: Ground',
                boundingPoly: { vertices: [{ x: 0, y: 0 }] }
              }
            ]
          }
        ]
      };

      const result = parser.parseOcrResponse(mockOcrResponse);

      expect(result.trackingNumber).toEqual('UNKNOWN');
      expect(result.confidence).toEqual(0.95);
    });

    it('should handle low confidence OCR results', () => {
      const mockOcrResponse = {
        responses: [
          {
            fullTextAnnotation: {
              text: 'SHIPPING LABEL\nTracking #: 1Z999AA10123456784\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210',
              pages: [{ confidence: 0.45 }]
            },
            textAnnotations: [
              {
                description: 'SHIPPING LABEL\nTracking #: 1Z999AA10123456784\nShip To:\nJohn Doe\n123 Main St\nAnytown, CA 90210',
                boundingPoly: { vertices: [{ x: 0, y: 0 }] }
              }
            ]
          }
        ]
      };

      const result = parser.parseOcrResponse(mockOcrResponse);

      expect(result.needsReview).toEqual(true);
      expect(result.confidence).toEqual(0.45);
    });
  });
}); 