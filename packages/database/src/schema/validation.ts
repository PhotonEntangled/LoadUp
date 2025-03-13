import { z } from 'zod';

// Address schema
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

// Comprehensive shipment slip validation
export const ShipmentSlipSchema = z.object({
  // Required fields
  externalId: z.string(),
  pickupAddress: AddressSchema,
  deliveryAddress: AddressSchema,
  customerName: z.string(),
  customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),

  // Optional fields with defaults
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  priority: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY']).default('STANDARD'),
  notes: z.string().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED']).default('PENDING'),
});

export type ShipmentSlip = z.infer<typeof ShipmentSlipSchema>; 