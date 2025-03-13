import { z } from 'zod';

// Define public interfaces without implementation details
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  location?: string;
  currentVehicleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DriverStatus = 
  | 'AVAILABLE'
  | 'BUSY'
  | 'OFFLINE'
  | 'ON_BREAK';

// Validation schema that doesn't depend on implementation
export const DriverValidationSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'ON_BREAK']),
  location: z.string().optional(),
  currentVehicleId: z.string().uuid().optional(),
});

// Export functions that will be implemented elsewhere
export interface DriverRepository {
  findAll(): Promise<Driver[]>;
  findById(id: string): Promise<Driver | null>;
  findByEmail(email: string): Promise<Driver | null>;
  create(data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver>;
  update(id: string, data: Partial<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Driver>;
  delete(id: string): Promise<void>;
  updateLocation(id: string, location: string): Promise<Driver>;
  updateStatus(id: string, status: DriverStatus): Promise<Driver>;
} 