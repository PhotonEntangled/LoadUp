import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  varchar, 
  boolean,
  pgEnum,
  jsonb,
  integer,
  decimal
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const USER_ROLE_ENUM = pgEnum("user_role", ["ADMIN", "DRIVER", "CUSTOMER", "DISPATCHER"]);
export const USER_STATUS_ENUM = pgEnum("user_status", ["ACTIVE", "INACTIVE", "SUSPENDED"]);
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

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: USER_ROLE_ENUM('role').notNull().default('CUSTOMER'),
  status: USER_STATUS_ENUM('status').notNull().default('ACTIVE'),
  phone: varchar('phone', { length: 20 }),
  profileImage: text('profile_image'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  company: varchar('company', { length: 255 }),
  defaultAddress: jsonb('default_address'),
  billingAddress: jsonb('billing_address'),
  paymentMethod: jsonb('payment_method'), // Stripe customer info
  totalShipments: integer('total_shipments').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Drivers table
export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull().unique(),
  licenseExpiry: timestamp('license_expiry', { withTimezone: true }).notNull(),
  vehicleType: VEHICLE_TYPE_ENUM('vehicle_type').notNull(),
  vehiclePlate: varchar('vehicle_plate', { length: 20 }).notNull(),
  vehicleCapacity: jsonb('vehicle_capacity').notNull(), // { volume: number, weight: number }
  currentLocation: jsonb('current_location'), // { lat: number, lng: number, address: string }
  status: DRIVER_STATUS_ENUM('status').default('OFFLINE'),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  totalDeliveries: integer('total_deliveries').default(0),
  completionRate: decimal('completion_rate', { precision: 5, scale: 2 }),
  activeRoute: jsonb('active_route'), // Current route with waypoints
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}); 