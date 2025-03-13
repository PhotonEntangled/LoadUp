import { z } from 'zod';

// Define public interfaces without implementation details
export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  customerName: string;
  pickupAddress: any;
  deliveryAddress: any;
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  driverId?: string;
  vehicleId?: string;
}

export type ShipmentStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

// Validation schema that doesn't depend on implementation
export const ShipmentValidationSchema = z.object({
  trackingNumber: z.string(),
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
  customerName: z.string(),
  pickupAddress: z.any(),
  deliveryAddress: z.any(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
});

// Export functions that will be implemented elsewhere
export interface ShipmentRepository {
  findAll(): Promise<Shipment[]>;
  findById(id: string): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: string): Promise<Shipment | null>;
  create(data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment>;
  update(id: string, data: Partial<Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Shipment>;
  delete(id: string): Promise<void>;
} 