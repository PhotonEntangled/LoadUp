import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the PostgreSQL client
const client = postgres(connectionString);

// Create the database instance with relations
export const db = drizzle(client, {
  schema: {
    ...schema,
    relations: {
      users: schema.usersRelations,
      shipments: schema.shipmentsRelations,
      shipmentHistory: schema.shipmentHistoryRelations,
    },
  },
});

// Export schema for use in other files
export * from './schema'; 