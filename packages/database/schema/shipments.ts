import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackingNumber: text('tracking_number').notNull().unique(),
  status: text('status', {
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
  }).notNull().default('PENDING'),
  assignedDriverId: uuid('assigned_driver_id').references(() => users.id),
  pickupAddress: jsonb('pickup_address').notNull(),
  deliveryAddress: jsonb('delivery_address').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  estimatedDeliveryDate: timestamp('estimated_delivery_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const shipmentHistory = pgTable('shipment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
  status: text('status', {
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
  }).notNull(),
  updatedById: uuid('updated_by_id').references(() => users.id).notNull(),
  notes: text('notes'),
  location: jsonb('location'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}); 