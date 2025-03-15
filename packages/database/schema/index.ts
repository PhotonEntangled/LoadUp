import {
  integer,
  text,
  pgTable,
  varchar,
  pgEnum,
  timestamp,
  uuid,
  jsonb,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from 'drizzle-orm';
import { users } from './users';
import { shipments, shipmentHistory } from './shipments';
import { drivers } from './users';

// Enums for various status types
export const USER_ROLE_ENUM = pgEnum("user_role", ["ADMIN", "DRIVER", "CUSTOMER", "DISPATCHER"]);
export const SHIPMENT_STATUS_ENUM = pgEnum("shipment_status", [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "CANCELLED"
]);
export const PAYMENT_STATUS_ENUM = pgEnum("payment_status", [
  "PENDING",
  "PROCESSING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED"
]);
export const VEHICLE_TYPE_ENUM = pgEnum("vehicle_type", [
  "BOX_TRUCK",
  "SEMI_TRUCK",
  "CARGO_VAN",
  "SPRINTER_VAN",
  "PICKUP_TRUCK"
]);
export const DRIVER_STATUS_ENUM = pgEnum("driver_status", [
  "AVAILABLE",
  "EN_ROUTE",
  "ON_DELIVERY",
  "ON_BREAK",
  "OFF_DUTY",
  "OFFLINE"
]);
export const DOCUMENT_TYPE_ENUM = pgEnum("document_type", [
  "BILL_OF_LADING",
  "INVOICE",
  "PROOF_OF_DELIVERY",
  "INSURANCE",
  "DRIVER_LICENSE",
  "VEHICLE_REGISTRATION"
]);

// Users table (includes all user types)
export const usersTable = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: USER_ROLE_ENUM("role").default("CUSTOMER"),
  phone: varchar("phone", { length: 20 }),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Drivers specific information
export const driversTable = pgTable("drivers", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  licenseExpiry: timestamp("license_expiry", { withTimezone: true }).notNull(),
  vehicleType: VEHICLE_TYPE_ENUM("vehicle_type").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  vehicleCapacity: jsonb("vehicle_capacity").notNull(), // { volume: number, weight: number }
  currentLocation: jsonb("current_location"), // { lat: number, lng: number, address: string }
  status: DRIVER_STATUS_ENUM("status").default("OFFLINE"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalDeliveries: integer("total_deliveries").default(0),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }),
  activeRoute: jsonb("active_route"), // Current route with waypoints
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Customers specific information
export const customersTable = pgTable("customers", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),
  company: varchar("company", { length: 255 }),
  defaultAddress: jsonb("default_address"),
  billingAddress: jsonb("billing_address"),
  paymentMethod: jsonb("payment_method"), // Stripe customer info
  totalShipments: integer("total_shipments").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Shipments table
export const shipmentsTable = pgTable("shipments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .references(() => customersTable.id)
    .notNull(),
  driverId: uuid("driver_id")
    .references(() => driversTable.id),
  status: SHIPMENT_STATUS_ENUM("status").default("PENDING"),
  pickupAddress: jsonb("pickup_address").notNull(), // { address, lat, lng, instructions }
  deliveryAddress: jsonb("delivery_address").notNull(), // { address, lat, lng, instructions }
  packageDetails: jsonb("package_details").notNull(), // { weight, dimensions, type, fragile }
  scheduledPickupTime: timestamp("scheduled_pickup_time", { withTimezone: true }),
  actualPickupTime: timestamp("actual_pickup_time", { withTimezone: true }),
  estimatedDeliveryTime: timestamp("estimated_delivery_time", { withTimezone: true }),
  actualDeliveryTime: timestamp("actual_delivery_time", { withTimezone: true }),
  paymentStatus: PAYMENT_STATUS_ENUM("payment_status").default("PENDING"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  distance: decimal("distance", { precision: 10, scale: 2 }), // In miles
  route: jsonb("route"), // Mapbox route data
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Shipment history for tracking all status changes
export const shipmentHistoryTable = pgTable('shipment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id')
    .references(() => shipmentsTable.id)
    .notNull(),
  status: SHIPMENT_STATUS_ENUM("status").notNull(),
  location: jsonb('location'), // { lat, lng, address }
  notes: text('notes'),
  updatedById: uuid('updated_by_id')
    .references(() => usersTable.id)
    .notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});

// Real-time tracking updates
export const trackingUpdatesTable = pgTable("tracking_updates", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id)
    .notNull(),
  driverId: uuid("driver_id")
    .references(() => driversTable.id)
    .notNull(),
  location: jsonb("location").notNull(), // { lat, lng, address, speed, heading }
  eventType: varchar("event_type", { length: 50 }), // LOCATION_UPDATE, STOP, START, etc.
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Documents for OCR processing and storage
export const documentsTable = pgTable("documents", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id),
  driverId: uuid("driver_id")
    .references(() => driversTable.id),
  type: DOCUMENT_TYPE_ENUM("type").notNull(),
  url: text("url").notNull(),
  processedData: jsonb("processed_data"), // OCR results
  verified: boolean("verified").default(false),
  verifiedBy: uuid("verified_by")
    .references(() => usersTable.id),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Payment records
export const paymentsTable = pgTable("payments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id)
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => customersTable.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: PAYMENT_STATUS_ENUM("status").default("PENDING"),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  stripeRefundId: varchar("stripe_refund_id", { length: 255 }),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  metadata: jsonb("metadata"), // Additional Stripe metadata
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Staging table for shipments
export const shipmentsStaging = pgTable("shipments_staging", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  externalId: varchar("external_id", { length: 100 }),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }),
  weight: decimal("weight"),
  dimensions: varchar("dimensions", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull(),
  ocrData: jsonb("ocr_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define relationships
export const usersRelations = relations(usersTable, ({ one }) => ({
  driver: one(driversTable, {
    fields: [usersTable.id],
    references: [driversTable.userId],
  }),
  customer: one(customersTable, {
    fields: [usersTable.id],
    references: [customersTable.userId],
  }),
}));

export const driversRelations = relations(driversTable, ({ many }) => ({
  shipments: many(shipmentsTable),
  documents: many(documentsTable),
  trackingUpdates: many(trackingUpdatesTable),
}));

export const customersRelations = relations(customersTable, ({ many }) => ({
  shipments: many(shipmentsTable),
  payments: many(paymentsTable),
}));

export const shipmentsRelations = relations(shipmentsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [shipmentsTable.customerId],
    references: [customersTable.id],
  }),
  driver: one(driversTable, {
    fields: [shipmentsTable.driverId],
    references: [driversTable.id],
  }),
  history: many(shipmentHistoryTable),
  trackingUpdates: many(trackingUpdatesTable),
  documents: many(documentsTable),
  payment: one(paymentsTable),
}));

export const shipmentHistoryRelations = relations(shipmentHistoryTable, ({ one }) => ({
  shipment: one(shipmentsTable, {
    fields: [shipmentHistoryTable.shipmentId],
    references: [shipmentsTable.id],
  }),
  updatedBy: one(usersTable, {
    fields: [shipmentHistoryTable.updatedById],
    references: [usersTable.id],
  }),
}));

export const documentsRelations = relations(documentsTable, ({ one }) => ({
  shipment: one(shipmentsTable, {
    fields: [documentsTable.shipmentId],
    references: [shipmentsTable.id],
  }),
  driver: one(driversTable, {
    fields: [documentsTable.driverId],
    references: [driversTable.id],
  }),
  verifier: one(usersTable, {
    fields: [documentsTable.verifiedBy],
    references: [usersTable.id],
  }),
}));

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  shipment: one(shipmentsTable, {
    fields: [paymentsTable.shipmentId],
    references: [shipmentsTable.id],
  }),
  customer: one(customersTable, {
    fields: [paymentsTable.customerId],
    references: [customersTable.id],
  }),
}));

export const trackingUpdatesRelations = relations(trackingUpdatesTable, ({ one }) => ({
  shipment: one(shipmentsTable, {
    fields: [trackingUpdatesTable.shipmentId],
    references: [shipmentsTable.id],
  }),
  driver: one(driversTable, {
    fields: [trackingUpdatesTable.driverId],
    references: [driversTable.id],
  }),
}));

// Export schema files
export * from './users';
export * from './shipments';
export * from './shipments-staging';
export * from './documents';
export * from './auth';
export * from './drivers'; 