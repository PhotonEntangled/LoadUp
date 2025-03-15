import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  jsonb,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Define the enum directly in this file
const VEHICLE_TYPE_ENUM = pgEnum("vehicle_type", [
  "VAN",
  "TRUCK",
  "BIKE",
  "CAR"
]);

export const drivers = pgTable("drivers", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull(),
  vehicleType: VEHICLE_TYPE_ENUM("vehicle_type").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  currentLocation: jsonb("current_location"),
  isAvailable: boolean("is_available").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}); 