-- Create enum types
CREATE TYPE "shipment_status" AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE "user_role" AS ENUM ('admin', 'driver', 'customer');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "role" user_role NOT NULL DEFAULT 'customer',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS "drivers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "license_number" varchar(255) NOT NULL UNIQUE,
  "vehicle_type" varchar(255) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS "shipments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "driver_id" uuid REFERENCES "drivers"("id"),
  "pickup_address" text NOT NULL,
  "delivery_address" text NOT NULL,
  "status" shipment_status NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create shipment_history table
CREATE TABLE IF NOT EXISTS "shipment_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "shipment_id" uuid NOT NULL REFERENCES "shipments"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "status" shipment_status NOT NULL,
  "notes" text,
  "location" point,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON "users"("email");
CREATE INDEX idx_drivers_user_id ON "drivers"("user_id");
CREATE INDEX idx_shipments_user_id ON "shipments"("user_id");
CREATE INDEX idx_shipments_driver_id ON "shipments"("driver_id");
CREATE INDEX idx_shipments_status ON "shipments"("status");
CREATE INDEX idx_shipment_history_shipment_id ON "shipment_history"("shipment_id");
CREATE INDEX idx_shipment_history_user_id ON "shipment_history"("user_id");

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON "drivers"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON "shipments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 