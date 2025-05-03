import { neon } from '@neondatabase/serverless'; // Import neon HTTP adapter
import { drizzle } from 'drizzle-orm/neon-http'; // Use drizzle's neon-http adapter
import * as schema from './schema'; // Import the schema we just created
import { logger } from '@/utils/logger'; // Assuming logger exists
// import ws from 'ws'; // No longer needed for HTTP

// WebSocket config is not needed for the HTTP adapter
// neonConfig.webSocketConstructor = ws;

// Validate DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error('DATABASE_URL environment variable is not set.');
  throw new Error('DATABASE_URL environment variable is not set.');
}

logger.info('Attempting to connect to Neon database via @neondatabase/serverless (HTTP)...');

let sql;
try {
  // Configure the Neon HTTP client
  sql = neon(connectionString, {
    // Optional fetch options:
    // fetchOptions: {
    //   cache: "no-store", // Prevent caching if needed
    // }
  });
  logger.info('@neondatabase/serverless client configured.');
} catch (error) {
  logger.error('Failed to configure @neondatabase/serverless client:', error);
  throw new Error('Failed to configure @neondatabase/serverless client');
}

let dbInstance;
try {
  // Use the neon-http adapter for Drizzle
  // Pass the configured sql instance directly
  dbInstance = drizzle(sql, { schema, logger: true });
  logger.info('Drizzle ORM initialized successfully with neon-http adapter.');
} catch (error) {
  logger.error('Failed to initialize Drizzle ORM with neon-http:', error);
  throw new Error('Failed to initialize Drizzle ORM with neon-http');
}

export const db = dbInstance; 