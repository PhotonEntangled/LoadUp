import { db } from '@loadup/database';
import { shipments } from '@loadup/database/schema';
import { z } from 'zod';
import { eq } from '@loadup/database';
// Mock the Google Cloud Vision client for now
// import vision from '@google-cloud/vision';

// Mock Google Cloud Vision client
const client = {
  documentTextDetection: async () => {
    return [{ fullTextAnnotation: { text: 'Mock OCR text' } }];
  }
};

// Validation schema for incoming shipment data
const ShipmentSlipSchema = z.object({
  externalId: z.string(),
  documentUrl: z.string().url(),
  source: z.string(),
  metadata: z.record(z.string()).optional(),
});

type ShipmentSlip = z.infer<typeof ShipmentSlipSchema>;

export class ShipmentSlipProcessor {
  constructor() {}

  private async processOCR(documentUrl: string) {
    try {
      // In a real implementation, we would download the file and process it
      // For now, we'll just return mock data
      // const [result] = await client.documentTextDetection(documentUrl);
      // const text = result.fullTextAnnotation.text || '';
      const text = 'Mock OCR text\nOrder #12345\nCustomer: John Doe\nPhone: 555-123-4567\nWeight: 10kg\nDimensions: 30x40x50cm';
      const lines = text.split('\n');
      
      return {
        orderNumber: this.extractOrderNumber(lines),
        customer: this.extractCustomerInfo(lines),
        shipmentDetails: this.extractShipmentDetails(lines),
        rawText: text,
      };
    } catch (error) {
      console.error('Error processing OCR:', error);
      throw new Error('Failed to process document with OCR');
    }
  }

  private extractOrderNumber(lines: string[]): string | undefined {
    const orderLine = lines.find(line => line.toLowerCase().includes('order'));
    if (!orderLine) return undefined;
    
    const match = orderLine.match(/#(\d+)/);
    return match ? match[1] : undefined;
  }

  private extractCustomerInfo(lines: string[]): { name?: string, phone?: string } {
    const customerLine = lines.find(line => line.toLowerCase().includes('customer'));
    const phoneLine = lines.find(line => line.toLowerCase().includes('phone'));
    
    return {
      name: customerLine ? customerLine.split(':')[1]?.trim() : undefined,
      phone: phoneLine ? phoneLine.split(':')[1]?.trim() : undefined,
    };
  }

  private extractShipmentDetails(lines: string[]): { weight?: string, dimensions?: string } {
    const weightLine = lines.find(line => line.toLowerCase().includes('weight'));
    const dimensionsLine = lines.find(line => line.toLowerCase().includes('dimensions'));
    
    return {
      weight: weightLine ? weightLine.split(':')[1]?.trim() : undefined,
      dimensions: dimensionsLine ? dimensionsLine.split(':')[1]?.trim() : undefined,
    };
  }

  async processBatch(slips: ShipmentSlip[]) {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as { id: string; error: string }[],
    };

    for (const slip of slips) {
      try {
        // Check if this slip has already been processed
        const existing = await db.query.shipments.findFirst({
          where: (fields) => eq(fields.trackingNumber as any, slip.externalId),
        });

        if (existing) {
          console.log(`Shipment with tracking number ${slip.externalId} already exists, skipping`);
          continue;
        }

        // Process the document with OCR
        const ocrResult = await this.processOCR(slip.documentUrl);

        // Store in staging table (we'll implement this properly later)
        console.log('Would store in staging table:', {
          slip,
          ocrResult,
          source: slip.source,
          status: 'PENDING',
        });

        results.processed++;
      } catch (error) {
        console.error(`Error processing slip ${slip.externalId}:`, error);
        results.failed++;
        results.errors.push({
          id: slip.externalId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Log error for staging
        console.log('Would store error in staging table:', {
          slip,
          source: slip.source,
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async transformStagedShipments() {
    const results = {
      transformed: 0,
      failed: 0,
      errors: [] as { id: string; error: string }[],
    };

    try {
      // This is a placeholder for now
      // We'll implement proper staging table queries later
      console.log('Would query staged shipments with status PENDING');
      
      // Mock data for now
      const stagedShipments = [
        {
          id: '1',
          rawData: {
            slip: {
              externalId: 'TEST-123',
              documentUrl: 'https://example.com/doc.pdf',
              source: 'test'
            },
            ocrResult: {
              customer: { name: 'Test Customer' }
            }
          },
          status: 'PENDING'
        }
      ];

      for (const shipment of stagedShipments) {
        try {
          const rawData = shipment.rawData as any;
          const slip = rawData.slip as ShipmentSlip;
          const ocrResult = rawData.ocrResult;

          // Transform and insert into main shipments table
          await db.insert(shipments).values({
            trackingNumber: slip.externalId,
            status: 'PENDING',
            customerName: ocrResult?.customer?.name || 'Unknown',
            pickupAddress: {},  // This would be populated from the OCR or other sources
            deliveryAddress: {}, // This would be populated from the OCR or other sources
          });

          // Log update for staging record
          console.log('Would update staging record:', {
            id: shipment.id,
            status: 'PROCESSED',
            processedAt: new Date(),
          });

          results.transformed++;
        } catch (error) {
          console.error(`Error transforming staged shipment ${shipment.id}:`, error);
          results.failed++;
          results.errors.push({
            id: shipment.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Log error update for staging record
          console.log('Would update staging record with error:', {
            id: shipment.id,
            status: 'ERROR',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('Error in transformStagedShipments:', error);
      throw error;
    }

    return results;
  }
} 