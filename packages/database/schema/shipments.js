import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  jsonb,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define the enums directly in this file
const SHIPMENT_STATUS_ENUM = pgEnum("shipment_status", [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED"
]);

const PAYMENT_STATUS_ENUM = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED"
]);

export const shipments = pgTable("shipments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id").notNull(),
  driverId: uuid("driver_id"),
  status: SHIPMENT_STATUS_ENUM("status").default("PENDING"),
  pickupAddress: jsonb("pickup_address").notNull(),
  deliveryAddress: jsonb("delivery_address").notNull(),
  packageDetails: jsonb("package_details").notNull(),
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

export const shipmentHistory = pgTable('shipment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  shipmentId: uuid('shipment_id').notNull(),
  status: text('status').notNull(),
  location: text('location'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes'),
});