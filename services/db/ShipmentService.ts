/**
 * Service for managing shipments in the database
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { v4 as uuidv4 } from 'uuid';

import { 
  shipments, 
  shipmentHistory, 
  processedDocuments, 
  documentShipmentMap,
  documentBatches,
  SHIPMENT_STATUS_ENUM,
  DOCUMENT_SOURCE_ENUM,
  PROCESSING_STATUS_ENUM
} from '@loadup/database/schema/shipments';

import { ShipmentData } from '../ocr/DocumentParser';
import { DataSourceType } from '../data/ShipmentDataProcessor';

/**
 * Options for creating a shipment
 */
export interface CreateShipmentOptions {
  sourceDocumentId?: string;
  sourceType?: DataSourceType;
  batchId?: string;
  needsReview?: boolean;
}

/**
 * Service for managing shipments in the database
 */
export class ShipmentService {
  constructor(private db: PostgresJsDatabase) {}

  /**
   * Create a new shipment from shipment data
   * @param shipmentData The shipment data to create a shipment from
   * @param options Options for creating the shipment
   * @returns The created shipment
   */
  async createShipment(shipmentData: ShipmentData, options?: CreateShipmentOptions) {
    // Start a transaction
    return await this.db.transaction(async (tx) => {
      // Create the shipment
      const [shipment] = await tx.insert(shipments).values({
        id: uuidv4(),
        trackingNumber: shipmentData.trackingNumber,
        customerId: shipmentData.customerId || '00000000-0000-0000-0000-000000000000', // Placeholder, would be replaced with actual customer lookup
        status: 'PENDING',
        priority: shipmentData.priority || 'medium',
        pickupAddress: {
          street: shipmentData.sender.address || '',
          city: shipmentData.sender.city || '',
          state: shipmentData.sender.state || '',
          zipCode: shipmentData.sender.zipCode || '',
          country: shipmentData.sender.country || 'USA',
        },
        deliveryAddress: {
          street: shipmentData.recipient.address || '',
          city: shipmentData.recipient.city || '',
          state: shipmentData.recipient.state || '',
          zipCode: shipmentData.recipient.zipCode || '',
          country: shipmentData.recipient.country || 'USA',
        },
        packageDetails: {
          weight: shipmentData.packageDetails?.weight || 0,
          dimensions: shipmentData.packageDetails?.dimensions || '',
          type: shipmentData.packageDetails?.type || 'PACKAGE',
          fragile: shipmentData.packageDetails?.fragile || false,
        },
        scheduledPickupTime: shipmentData.scheduledPickupTime ? new Date(shipmentData.scheduledPickupTime) : null,
        estimatedDeliveryTime: shipmentData.estimatedDeliveryTime ? new Date(shipmentData.estimatedDeliveryTime) : null,
        notes: shipmentData.notes || '',
        sourceDocumentId: options?.sourceDocumentId ? options.sourceDocumentId : null,
        sourceType: options?.sourceType ? this.mapDataSourceToDocumentSource(options.sourceType) : null,
        batchId: options?.batchId ? options.batchId : null,
        needsReview: options?.needsReview || shipmentData.needsReview || false,
      }).returning();

      // Create initial shipment history entry
      await tx.insert(shipmentHistory).values({
        id: uuidv4(),
        shipmentId: shipment.id,
        status: 'PENDING',
        notes: 'Shipment created',
        updatedById: '00000000-0000-0000-0000-000000000000', // Placeholder, would be replaced with actual user ID
      });

      // If there's a source document, create a mapping
      if (options?.sourceDocumentId) {
        await tx.insert(documentShipmentMap).values({
          id: uuidv4(),
          documentId: options.sourceDocumentId,
          shipmentId: shipment.id,
        });
      }

      return shipment;
    });
  }

  /**
   * Create multiple shipments from a batch of shipment data
   * @param shipmentsData Array of shipment data to create shipments from
   * @param batchId Optional batch ID to associate with the shipments
   * @param sourceType The source type of the shipments
   * @returns The created shipments
   */
  async createShipmentBatch(shipmentsData: ShipmentData[], batchId?: string, sourceType?: DataSourceType) {
    // If no batch ID is provided, create a new batch
    let batchIdToUse = batchId;
    
    if (!batchIdToUse) {
      const [batch] = await this.db.insert(documentBatches).values({
        id: uuidv4(),
        name: `Batch ${new Date().toISOString()}`,
        source: this.mapDataSourceToDocumentSource(sourceType || DataSourceType.MANUAL_ENTRY),
        fileCount: shipmentsData.length,
        status: 'PENDING',
      }).returning();
      
      batchIdToUse = batch.id;
    }

    // Create shipments for each shipment data
    const createdShipments = [];
    for (const shipmentData of shipmentsData) {
      const shipment = await this.createShipment(shipmentData, {
        batchId: batchIdToUse,
        sourceType: sourceType || DataSourceType.MANUAL_ENTRY,
        needsReview: shipmentData.needsReview,
      });
      
      createdShipments.push(shipment);
    }

    // Update batch with processed count
    await this.db.update(documentBatches)
      .set({
        processedCount: createdShipments.length,
        status: 'PROCESSED',
      })
      .where(eq(documentBatches.id, batchIdToUse));

    return createdShipments;
  }

  /**
   * Update a shipment's status
   * @param shipmentId The ID of the shipment to update
   * @param status The new status
   * @param notes Optional notes about the status change
   * @param userId The ID of the user making the change
   * @returns The updated shipment
   */
  async updateShipmentStatus(shipmentId: string, status: string, notes?: string, userId?: string) {
    return await this.db.transaction(async (tx) => {
      // Update the shipment
      const [updatedShipment] = await tx.update(shipments)
        .set({
          status: status as any, // Cast to any to avoid type issues
          updatedAt: new Date(),
        })
        .where(eq(shipments.id, shipmentId))
        .returning();

      // Create shipment history entry
      await tx.insert(shipmentHistory).values({
        id: uuidv4(),
        shipmentId,
        status: status as any, // Cast to any to avoid type issues
        notes: notes || `Status updated to ${status}`,
        updatedById: userId || '00000000-0000-0000-0000-000000000000', // Placeholder
      });

      return updatedShipment;
    });
  }

  /**
   * Assign a driver to a shipment
   * @param shipmentId The ID of the shipment
   * @param driverId The ID of the driver
   * @param userId The ID of the user making the assignment
   * @returns The updated shipment
   */
  async assignDriver(shipmentId: string, driverId: string, userId?: string) {
    return await this.db.transaction(async (tx) => {
      // Update the shipment
      const [updatedShipment] = await tx.update(shipments)
        .set({
          driverId,
          status: 'ASSIGNED',
          updatedAt: new Date(),
        })
        .where(eq(shipments.id, shipmentId))
        .returning();

      // Create shipment history entry
      await tx.insert(shipmentHistory).values({
        id: uuidv4(),
        shipmentId,
        status: 'ASSIGNED',
        notes: `Driver assigned`,
        updatedById: userId || '00000000-0000-0000-0000-000000000000', // Placeholder
      });

      return updatedShipment;
    });
  }

  /**
   * Get a shipment by ID
   * @param shipmentId The ID of the shipment
   * @returns The shipment
   */
  async getShipment(shipmentId: string) {
    return await this.db.query.shipments.findFirst({
      where: eq(shipments.id, shipmentId),
    });
  }

  /**
   * Get a shipment by tracking number
   * @param trackingNumber The tracking number of the shipment
   * @returns The shipment
   */
  async getShipmentByTrackingNumber(trackingNumber: string) {
    return await this.db.query.shipments.findFirst({
      where: eq(shipments.trackingNumber, trackingNumber),
    });
  }

  /**
   * Get shipments that need review
   * @param limit The maximum number of shipments to return
   * @param offset The offset for pagination
   * @returns The shipments that need review
   */
  async getShipmentsNeedingReview(limit = 10, offset = 0) {
    return await this.db.query.shipments.findMany({
      where: eq(shipments.needsReview, true),
      limit,
      offset,
      orderBy: [desc(shipments.createdAt)],
    });
  }

  /**
   * Get shipments by status
   * @param status The status to filter by
   * @param limit The maximum number of shipments to return
   * @param offset The offset for pagination
   * @returns The shipments with the specified status
   */
  async getShipmentsByStatus(status: string, limit = 10, offset = 0) {
    return await this.db.query.shipments.findMany({
      where: eq(shipments.status, status as any), // Cast to any to avoid type issues
      limit,
      offset,
      orderBy: [desc(shipments.createdAt)],
    });
  }

  /**
   * Get shipments by customer ID
   * @param customerId The ID of the customer
   * @param limit The maximum number of shipments to return
   * @param offset The offset for pagination
   * @returns The shipments for the specified customer
   */
  async getShipmentsByCustomer(customerId: string, limit = 10, offset = 0) {
    return await this.db.query.shipments.findMany({
      where: eq(shipments.customerId, customerId),
      limit,
      offset,
      orderBy: [desc(shipments.createdAt)],
    });
  }

  /**
   * Get shipments by driver ID
   * @param driverId The ID of the driver
   * @param limit The maximum number of shipments to return
   * @param offset The offset for pagination
   * @returns The shipments for the specified driver
   */
  async getShipmentsByDriver(driverId: string, limit = 10, offset = 0) {
    return await this.db.query.shipments.findMany({
      where: eq(shipments.driverId, driverId),
      limit,
      offset,
      orderBy: [desc(shipments.createdAt)],
    });
  }

  /**
   * Get shipment history
   * @param shipmentId The ID of the shipment
   * @returns The shipment history
   */
  async getShipmentHistory(shipmentId: string) {
    return await this.db.query.shipmentHistory.findMany({
      where: eq(shipmentHistory.shipmentId, shipmentId),
      orderBy: [desc(shipmentHistory.timestamp)],
    });
  }

  /**
   * Mark a shipment as reviewed
   * @param shipmentId The ID of the shipment
   * @param userId The ID of the user who reviewed the shipment
   * @returns The updated shipment
   */
  async markShipmentAsReviewed(shipmentId: string, userId: string) {
    return await this.db.update(shipments)
      .set({
        needsReview: false,
        reviewedBy: userId,
        reviewedAt: new Date(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();
  }

  /**
   * Map DataSourceType to DOCUMENT_SOURCE_ENUM
   * @param sourceType The DataSourceType to map
   * @returns The corresponding DOCUMENT_SOURCE_ENUM
   */
  private mapDataSourceToDocumentSource(sourceType: DataSourceType): 'OCR_IMAGE' | 'EXCEL_TXT' {
    switch (sourceType) {
      case DataSourceType.OCR_IMAGE:
        return 'OCR_IMAGE';
      case DataSourceType.EXCEL_TXT:
        return 'EXCEL_TXT';
      case DataSourceType.MANUAL_ENTRY:
      default:
        return 'OCR_IMAGE'; // Default to OCR_IMAGE for manual entry
    }
  }
} 