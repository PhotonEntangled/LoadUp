import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "DRIVER", "CUSTOMER"]).default("CUSTOMER"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const userSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["ADMIN", "DRIVER", "CUSTOMER"]),
  isActive: z.boolean().default(true),
});

export const shipmentSchema = z.object({
  id: z.string().optional(),
  trackingNumber: z.string().min(5, "Tracking number must be at least 5 characters"),
  status: z.enum(["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"]),
  origin: z.string().min(3, "Origin must be at least 3 characters"),
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  estimatedDelivery: z.date(),
  actualDelivery: z.date().optional().nullable(),
  weight: z.number().positive("Weight must be positive"),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
}); 