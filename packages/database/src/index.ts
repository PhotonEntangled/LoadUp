import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from './schema.js';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle database instance
export const db = drizzle(pool, { schema });

// Export schema and utilities
export * from './drizzle.js';
export * from './schema.js';
export * from './db-utils.js';

// Export facades to avoid circular dependencies
// Explicitly re-export to resolve naming conflicts
export type {
  Shipment as ShipmentInterface,
  ShipmentStatus,
  ShipmentRepository
} from './facades/shipmentFacade.js';
export { ShipmentValidationSchema } from './facades/shipmentFacade.js';

export type {
  Driver as DriverInterface,
  DriverStatus,
  DriverRepository
} from './facades/driverFacade.js';
export { DriverValidationSchema } from './facades/driverFacade.js';

export type {
  Vehicle as VehicleInterface,
  VehicleStatus,
  VehicleRepository
} from './facades/vehicleFacade.js';
export { VehicleValidationSchema } from './facades/vehicleFacade.js'; 