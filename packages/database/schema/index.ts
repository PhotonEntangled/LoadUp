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
import { relations } from 'drizzle-orm';

// Enums for various status types
export const USER_ROLE_ENUM = pgEnum("user_role", ["ADMIN", "DRIVER", "CUSTOMER"]);
export const SHIPMENT_STATUS_ENUM = pgEnum("shipment_status", [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED"
]);
export const PAYMENT_STATUS_ENUM = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED"
]);
export const VEHICLE_TYPE_ENUM = pgEnum("vehicle_type", [
  "VAN",
  "TRUCK",
  "BIKE",
  "CAR"
]);

// Users table (includes both admin and drivers)
export const usersTable = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
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
  licenseNumber: varchar("license_number", { length: 50 }).notNull(),
  vehicleType: VEHICLE_TYPE_ENUM("vehicle_type").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  currentLocation: jsonb("current_location"), // Stores lat/long as JSON
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Shipments table
export const shipmentsTable = pgTable("shipments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id")
    .references(() => usersTable.id)
    .notNull(),
  driverId: uuid("driver_id")
    .references(() => driversTable.id),
  status: SHIPMENT_STATUS_ENUM("status").default("PENDING"),
  pickupAddress: jsonb("pickup_address").notNull(),
  deliveryAddress: jsonb("delivery_address").notNull(),
  packageDetails: jsonb("package_details").notNull(), // weight, dimensions, etc.
  scheduledPickupTime: timestamp("scheduled_pickup_time", { withTimezone: true }),
  actualPickupTime: timestamp("actual_pickup_time", { withTimezone: true }),
  estimatedDeliveryTime: timestamp("estimated_delivery_time", { withTimezone: true }),
  actualDeliveryTime: timestamp("actual_delivery_time", { withTimezone: true }),
  paymentStatus: PAYMENT_STATUS_ENUM("payment_status").default("PENDING"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Add shipmentHistoryTable definition
export const shipmentHistoryTable = pgTable('shipment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').notNull().references(() => shipmentsTable.id),
  status: text('status').notNull(),
  location: text('location'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes'),
});

// Tracking updates for shipments
export const trackingUpdatesTable = pgTable("tracking_updates", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id)
    .notNull(),
  status: SHIPMENT_STATUS_ENUM("status").notNull(),
  location: jsonb("location"), // Stores lat/long and address as JSON
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Documents (for OCR processing and storage)
export const documentsTable = pgTable("documents", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // invoice, bill of lading, etc.
  url: text("url").notNull(),
  processedData: jsonb("processed_data"), // Stores OCR results
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Payment records
export const paymentsTable = pgTable("payments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  shipmentId: uuid("shipment_id")
    .references(() => shipmentsTable.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: PAYMENT_STATUS_ENUM("status").default("PENDING"),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  refundId: varchar("refund_id", { length: 255 }),
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

export const usersRelations = relations(usersTable, ({ many }) => ({
  shipmentHistory: many(shipmentHistoryTable),
  shipments: many(shipmentsTable),
}));

export const shipmentsRelations = relations(shipmentsTable, ({ one, many }) => ({
  driver: one(driversTable, {
    fields: [shipmentsTable.driverId],
    references: [driversTable.id],
  }),
  history: many(shipmentHistoryTable),
}));

export const shipmentHistoryRelations = relations(shipmentHistoryTable, ({ one }) => ({
  shipment: one(shipmentsTable, {
    fields: [shipmentHistoryTable.shipmentId],
    references: [shipmentsTable.id],
  }),
  // Remove or comment out the updatedBy relation if updatedById doesn't exist
  // updatedBy: one(usersTable, {
  //   fields: [shipmentHistoryTable.updatedById],
  //   references: [usersTable.id],
  // }),
})); 