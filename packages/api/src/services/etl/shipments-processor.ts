import { db } from '@loadup/database';
import { shipments, documentsTable } from '@loadup/database/schema';
import { z } from 'zod';
import vision from '@google-cloud/vision';

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient();

// Validation schema for incoming shipment data
const ShipmentSlipSchema = z.object({
  externalId: z.string().optional(),
  pickupAddress: z.string(),
  deliveryAddress: z.string(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().optional(), // URL to the scanned document
});

type ShipmentSlip = z.infer<typeof ShipmentSlipSchema>;

export class ShipmentSlipProcessor {
  /**
   * Process OCR for a document URL
   */
  private async processOCR(documentUrl: string) {
    try {
      // Perform OCR on the document
      const [result] = await client.textDetection(documentUrl);
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in document');
      }

      // Extract structured data from OCR results
      const text = detections[0].description;
      const lines = text.split('\n');
      
      // Parse the text to extract relevant information
      const extractedData = {
        orderNumber: this.extractOrderNumber(lines),
        customerInfo: this.extractCustomerInfo(lines),
        shipmentDetails: this.extractShipmentDetails(lines),
      };

      return extractedData;
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  /**
   * Extract order number from OCR text
   */
  private extractOrderNumber(lines: string[]): string | undefined {
    const orderLine = lines.find(line => line.includes('Order Number'));
    return orderLine?.split(':')[1]?.trim();
  }

  /**
   * Extract customer information from OCR text
   */
  private extractCustomerInfo(lines: string[]): { name?: string, phone?: string } {
    const customerInfo = {
      name: lines.find(line => line.includes('Customer Name'))?.split(':')[1]?.trim(),
      phone: lines.find(line => line.includes('CONTACT NO'))?.split(':')[1]?.trim(),
    };
    return customerInfo;
  }

  /**
   * Extract shipment details from OCR text
   */
  private extractShipmentDetails(lines: string[]): { weight?: string, dimensions?: string } {
    const details = {
      weight: lines.find(line => line.includes('Weight'))?.split(':')[1]?.trim(),
      dimensions: lines.find(line => line.includes('Dimensions'))?.split(':')[1]?.trim(),
    };
    return details;
  }

  /**
   * Process a batch of shipment slips with OCR support
   */
  async processBatch(slips: ShipmentSlip[]) {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each slip in the batch
    for (const slip of slips) {
      try {
        // Validate the slip data
        const validatedSlip = ShipmentSlipSchema.parse(slip);

        // Process OCR if document URL is provided
        let ocrData = null;
        if (validatedSlip.documentUrl) {
          try {
            ocrData = await this.processOCR(validatedSlip.documentUrl);
            
            // Store the document and OCR results
            await db.insert(documentsTable).values({
              shipmentId: validatedSlip.externalId || 'pending',
              type: 'shipment_slip',
              url: validatedSlip.documentUrl,
              processedData: ocrData,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } catch (ocrError) {
            console.error('OCR processing failed:', ocrError);
            // Continue processing even if OCR fails
          }
        }

        // Check for duplicates using external ID if available
        if (slip.externalId) {
          const existing = await db.query.shipments.findFirst({
            where: { externalId: slip.externalId },
          });

          if (existing) {
            results.failed++;
            results.errors.push(`Duplicate shipment: ${slip.externalId}`);
            continue;
          }
        }

        // Insert into staging table
        await db.insert(shipments.staging).values({
          ...validatedSlip,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
          ocrData: ocrData, // Store OCR results if available
        });

        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return results;
  }

  /**
   * Transform staged shipments into final format
   */
  async transformStagedShipments() {
    const results = {
      transformed: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // Get all staged shipments
      const stagedShipments = await db.query.shipments.staging.findMany();

      for (const shipment of stagedShipments) {
        try {
          // Transform and insert into main shipments table
          await db.insert(shipments).values({
            pickupAddress: shipment.pickupAddress,
            deliveryAddress: shipment.deliveryAddress,
            status: 'PENDING',
            customerName: shipment.customerName,
            customerPhone: shipment.customerPhone,
            weight: shipment.weight,
            dimensions: shipment.dimensions,
            notes: shipment.notes,
            externalId: shipment.externalId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Delete from staging
          await db.delete(shipments.staging)
            .where({ id: shipment.id });

          results.transformed++;
        } catch (error) {
          results.failed++;
          results.errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return results;
  }
} 