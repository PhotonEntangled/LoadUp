import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/loadup';

// Create postgres connection
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds a client can be idle before being closed
  connect_timeout: 10, // Max seconds to wait for connection
  prepare: false, // Disable prepared statements for better compatibility
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export for use in other files
export { schema }; 