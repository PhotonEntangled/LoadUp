import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackingNumber: text('tracking_number').notNull().unique(),
  status: text('status').notNull(),
  customerName: text('customer_name').notNull(),
  pickupAddress: jsonb('pickup_address').notNull(),
  deliveryAddress: jsonb('delivery_address').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  location: text('location'),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  driverId: uuid('driver_id'),
  vehicleId: uuid('vehicle_id')
});

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().unique(),
  status: text('status').notNull(),
  location: text('location'),
  currentVehicleId: uuid('current_vehicle_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  plateNumber: text('plate_number').notNull().unique(),
  status: text('status').notNull(),
  capacity: integer('capacity').notNull(),
  currentDriverId: uuid('current_driver_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const trackingUpdates = pgTable('tracking_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').notNull(),
  status: text('status').notNull(),
  location: text('location'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: jsonb('details')
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', {
    enum: ['ADMIN', 'DRIVER', 'CUSTOMER']
  }).notNull().default('CUSTOMER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define relations
export const shipmentsRelations = relations(shipments, ({ one }) => ({
  driver: one(drivers, {
    fields: [shipments.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [shipments.vehicleId],
    references: [vehicles.id],
  })
}));

export const driversRelations = relations(drivers, ({ one }) => ({
  currentVehicle: one(vehicles, {
    fields: [drivers.currentVehicleId],
    references: [vehicles.id],
  })
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  currentDriver: one(drivers, {
    fields: [vehicles.currentDriverId],
    references: [drivers.id],
  })
}));

export const trackingUpdatesRelations = relations(trackingUpdates, ({ one }) => ({
  shipment: one(shipments, {
    fields: [trackingUpdates.shipmentId],
    references: [shipments.id],
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  // Define relations if needed
}));

// Export types
export type Shipment = InferModel<typeof shipments>;
export type Driver = InferModel<typeof drivers>;
export type Vehicle = InferModel<typeof vehicles>;
export type TrackingUpdate = InferModel<typeof trackingUpdates>;
export type User = InferModel<typeof users>; 