import { pgEnum } from "drizzle-orm/pg-core";

// Export the enums
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

export const USER_ROLE_ENUM = pgEnum("user_role", ["ADMIN", "DRIVER", "CUSTOMER"]);
