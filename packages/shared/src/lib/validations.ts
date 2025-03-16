import { z } from 'zod';

/**
 * Shipment validation schema
 */
export const shipmentSchema = z.object({
  id: z.string().optional(),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled']),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  weight: z.number().positive('Weight must be positive'),
  dimensions: z.object({
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
  }).optional(),
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
  }),
});

/**
 * User validation schema
 */
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'operator', 'customer', 'driver']),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Type definitions
 */
export type Shipment = z.infer<typeof shipmentSchema>;
export type User = z.infer<typeof userSchema>;
export type Login = z.infer<typeof loginSchema>; 