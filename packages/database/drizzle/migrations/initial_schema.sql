-- Create enum types
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'DRIVER', 'CUSTOMER', 'DISPATCHER');
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "vehicle_type" AS ENUM ('BOX_TRUCK', 'SEMI_TRUCK', 'CARGO_VAN', 'SPRINTER_VAN', 'PICKUP_TRUCK');
CREATE TYPE "driver_status" AS ENUM ('AVAILABLE', 'EN_ROUTE', 'ON_DELIVERY', 'ON_BREAK', 'OFF_DUTY', 'OFFLINE');
CREATE TYPE "shipment_status" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED');
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "document_type" AS ENUM ('BILL_OF_LADING', 'PROOF_OF_DELIVERY', 'INVOICE', 'CUSTOMS_DECLARATION', 'INSURANCE_CERTIFICATE', 'DAMAGE_REPORT', 'OTHER');

-- Create drizzle migrations table
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
  "id" SERIAL PRIMARY KEY,
  "hash" VARCHAR(64) NOT NULL,
  "migration_name" VARCHAR(255) NOT NULL,
  "timestamp" BIGINT NOT NULL,
  "success" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert initial migration record
INSERT INTO "__drizzle_migrations" ("hash", "migration_name", "timestamp", "success")
VALUES ('initial_schema_hash', 'initial_schema', 1710539400000, TRUE);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "first_name" VARCHAR(100) NOT NULL,
  "last_name" VARCHAR(100) NOT NULL,
  "role" user_role NOT NULL DEFAULT 'CUSTOMER',
  "status" user_status NOT NULL DEFAULT 'ACTIVE',
  "phone" VARCHAR(20),
  "profile_image" TEXT,
  "last_login_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS "drivers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "license_number" VARCHAR(50) NOT NULL UNIQUE,
  "license_expiry" TIMESTAMP WITH TIME ZONE NOT NULL,
  "vehicle_type" vehicle_type NOT NULL,
  "vehicle_plate" VARCHAR(20) NOT NULL,
  "vehicle_capacity" JSONB NOT NULL,
  "current_location" JSONB,
  "status" driver_status DEFAULT 'OFFLINE',
  "rating" DECIMAL(3, 2),
  "total_deliveries" INTEGER DEFAULT 0,
  "completion_rate" DECIMAL(5, 2),
  "active_route" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS "shipments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tracking_number" VARCHAR(50) NOT NULL UNIQUE,
  "customer_id" UUID NOT NULL,
  "driver_id" UUID,
  "status" shipment_status DEFAULT 'PENDING',
  "pickup_address" JSONB NOT NULL,
  "delivery_address" JSONB NOT NULL,
  "package_details" JSONB NOT NULL,
  "scheduled_pickup_time" TIMESTAMP WITH TIME ZONE,
  "actual_pickup_time" TIMESTAMP WITH TIME ZONE,
  "estimated_delivery_time" TIMESTAMP WITH TIME ZONE,
  "actual_delivery_time" TIMESTAMP WITH TIME ZONE,
  "payment_status" payment_status DEFAULT 'PENDING',
  "amount" DECIMAL(10, 2),
  "distance" DECIMAL(10, 2),
  "route" JSONB,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create shipment history table
CREATE TABLE IF NOT EXISTS "shipment_history" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "shipment_id" UUID NOT NULL REFERENCES "shipments"("id"),
  "status" shipment_status NOT NULL,
  "location" JSONB,
  "notes" TEXT,
  "updated_by_id" UUID NOT NULL REFERENCES "users"("id"),
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sessions table for auth
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create verification tokens table for auth
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
); 