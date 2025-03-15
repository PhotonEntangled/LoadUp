import { db } from '../db';
import { 
  shipments, 
  shipmentEvents, 
  shipmentDocuments, 
  SHIPMENT_STATUS_ENUM,
} from '../schema/shipments';
import { eq, and, desc, asc, gte, lte, like, inArray, sql } from 'drizzle-orm';
import { generateTrackingNumber } from '../utils/tracking';
import { v4 as uuidv4 } from 'uuid';

// Define types for address and contact
export type AddressType = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

export type ContactType = {
  name: string;
  phone: string;
  email?: string;
  company?: string;
};

export type CreateShipmentInput = {
  customerId: string;
  driverId?: string;
  description?: string;
  weight?: string;
  dimensions?: string;
  packageCount?: string;
  pickupLocation: AddressType;
  pickupContact: ContactType;
  pickupDate?: Date;
  pickupInstructions?: string;
  deliveryLocation: AddressType;
  deliveryContact: ContactType;
  deliveryDate?: Date;
  deliveryInstructions?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  cost?: string;
};

export type ShipmentFilters = {
  status?: string[];
  customerId?: string;
  driverId?: string;
  trackingNumber?: string;
  fromDate?: Date;
  toDate?: Date;
  priority?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export class ShipmentService {
  /**
   * Create a new shipment
   */
  async createShipment(data: CreateShipmentInput) {
    const trackingNumber = generateTrackingNumber();
    
    const [shipment] = await db.insert(shipments).values({
      id: uuidv4(),
      trackingNumber,
      customerId: data.customerId,
      driverId: data.driverId,
      description: data.description,
      weight: data.weight,
      dimensions: data.dimensions,
      packageCount: data.packageCount,
      pickupAddress: data.pickupLocation,
      deliveryAddress: data.deliveryLocation,
      pickupContact: data.pickupContact,
      deliveryContact: data.deliveryContact,
      scheduledPickupTime: data.pickupDate,
      estimatedDeliveryTime: data.deliveryDate,
      priority: data.priority || 'medium',
      status: data.driverId ? 'ASSIGNED' : 'PENDING',
      notes: `${data.pickupInstructions || ''}\n${data.deliveryInstructions || ''}`.trim(),
      amount: data.cost ? parseFloat(data.cost) : null,
    }).returning();

    // Create initial shipment event
    await db.insert(shipmentEvents).values({
      id: uuidv4(),
      shipmentId: shipment.id,
      status: shipment.status,
      notes: 'Shipment created',
    });

    return shipment;
  }

  /**
   * Get shipment by ID
   */
  async getShipmentById(id: string) {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    
    if (!shipment) {
      return null;
    }
    
    // Get shipment events
    const events = await db.select().from(shipmentEvents)
      .where(eq(shipmentEvents.shipmentId, id))
      .orderBy(desc(shipmentEvents.createdAt));
    
    // Get shipment documents
    const documents = await db.select().from(shipmentDocuments)
      .where(eq(shipmentDocuments.shipmentId, id))
      .orderBy(desc(shipmentDocuments.uploadedAt));
    
    return {
      ...shipment,
      events,
      documents
    };
  }

  /**
   * Get shipment by tracking number
   */
  async getShipmentByTrackingNumber(trackingNumber: string) {
    const [shipment] = await db.select().from(shipments)
      .where(eq(shipments.trackingNumber, trackingNumber));
    
    if (!shipment) {
      return null;
    }
    
    // Get shipment events
    const events = await db.select().from(shipmentEvents)
      .where(eq(shipmentEvents.shipmentId, shipment.id))
      .orderBy(desc(shipmentEvents.createdAt));
    
    // Get shipment documents
    const documents = await db.select().from(shipmentDocuments)
      .where(eq(shipmentDocuments.shipmentId, shipment.id))
      .orderBy(desc(shipmentDocuments.uploadedAt));
    
    return {
      ...shipment,
      events,
      documents
    };
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(id: string, status: string, userId: string, notes?: string, location?: Partial<AddressType>) {
    // Update shipment
    const [updatedShipment] = await db.update(shipments)
      .set({ 
        status: status as any, // Type assertion to handle enum
        updatedAt: new Date()
      })
      .where(eq(shipments.id, id))
      .returning();
    
    if (!updatedShipment) {
      return null;
    }
    
    // Create shipment event
    await db.insert(shipmentEvents).values({
      id: uuidv4(),
      shipmentId: id,
      status: status as any, // Type assertion to handle enum
      notes,
      location,
      createdBy: userId
    });
    
    return updatedShipment;
  }

  /**
   * Assign driver to shipment
   */
  async assignDriver(id: string, driverId: string, userId: string) {
    // Update shipment
    const [updatedShipment] = await db.update(shipments)
      .set({ 
        driverId,
        status: 'ASSIGNED' as any, // Type assertion to handle enum
        updatedAt: new Date()
      })
      .where(eq(shipments.id, id))
      .returning();
    
    if (!updatedShipment) {
      return null;
    }
    
    // Create shipment event
    await db.insert(shipmentEvents).values({
      id: uuidv4(),
      shipmentId: id,
      status: 'ASSIGNED' as any, // Type assertion to handle enum
      notes: `Assigned to driver ID: ${driverId}`,
      createdBy: userId
    });
    
    return updatedShipment;
  }

  /**
   * Upload document to shipment
   */
  async uploadDocument(shipmentId: string, name: string, type: string, url: string, userId: string) {
    const [document] = await db.insert(shipmentDocuments).values({
      id: uuidv4(),
      shipmentId,
      name,
      type,
      url,
      uploadedBy: userId
    }).returning();
    
    return document;
  }

  /**
   * Get shipments with filtering and pagination
   */
  async getShipments(filters: ShipmentFilters = {}) {
    const {
      status,
      customerId,
      driverId,
      trackingNumber,
      fromDate,
      toDate,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;
    
    // Build where conditions
    let query = db.select().from(shipments);
    
    if (status && status.length > 0) {
      // Use SQL for dynamic enum values
      query = query.where(sql`${shipments.status} IN ${status}`);
    }
    
    if (customerId) {
      query = query.where(eq(shipments.customerId, customerId));
    }
    
    if (driverId) {
      query = query.where(eq(shipments.driverId, driverId));
    }
    
    if (trackingNumber) {
      query = query.where(eq(shipments.trackingNumber, trackingNumber));
    }
    
    if (fromDate) {
      query = query.where(gte(shipments.createdAt, fromDate));
    }
    
    if (toDate) {
      query = query.where(lte(shipments.createdAt, toDate));
    }
    
    if (priority && priority.length > 0) {
      // Use SQL for dynamic enum values
      query = query.where(sql`${shipments.priority} IN ${priority}`);
    }
    
    if (search) {
      query = query.where(
        like(shipments.trackingNumber, `%${search}%`)
      );
    }
    
    // Add sorting
    if (sortBy && sortBy in shipments) {
      const column = shipments[sortBy as keyof typeof shipments];
      if (column) {
        if (sortOrder === 'asc') {
          query = query.orderBy(asc(column));
        } else {
          query = query.orderBy(desc(column));
        }
      }
    } else {
      // Default sort by createdAt
      query = query.orderBy(desc(shipments.createdAt));
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    
    // Execute query
    const results = await query;
    
    // Get total count
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(shipments);
    
    return {
      data: results,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit)
      }
    };
  }

  /**
   * Get shipments for a customer
   */
  async getCustomerShipments(customerId: string, filters: Omit<ShipmentFilters, 'customerId'> = {}) {
    return this.getShipments({
      ...filters,
      customerId
    });
  }

  /**
   * Get shipments for a driver
   */
  async getDriverShipments(driverId: string, filters: Omit<ShipmentFilters, 'driverId'> = {}) {
    return this.getShipments({
      ...filters,
      driverId
    });
  }

  /**
   * Delete shipment
   */
  async deleteShipment(id: string) {
    // This will cascade delete events and documents
    const [deletedShipment] = await db.delete(shipments)
      .where(eq(shipments.id, id))
      .returning();
    
    return deletedShipment;
  }
} 