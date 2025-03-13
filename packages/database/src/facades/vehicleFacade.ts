import { z } from 'zod';

// Define public interfaces without implementation details
export interface Vehicle {
  id: string;
  type: string;
  plateNumber: string;
  status: VehicleStatus;
  capacity: number;
  currentDriverId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleStatus = 
  | 'AVAILABLE'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

// Validation schema that doesn't depend on implementation
export const VehicleValidationSchema = z.object({
  type: z.string(),
  plateNumber: z.string(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
  capacity: z.number().positive(),
  currentDriverId: z.string().uuid().optional(),
});

// Export functions that will be implemented elsewhere
export interface VehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlateNumber(plateNumber: string): Promise<Vehicle | null>;
  create(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
  update(id: string, data: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: VehicleStatus): Promise<Vehicle>;
  assignDriver(id: string, driverId: string): Promise<Vehicle>;
  unassignDriver(id: string): Promise<Vehicle>;
} 