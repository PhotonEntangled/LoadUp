import postgres from 'postgres'; // Import postgres.js
import { drizzle } from 'drizzle-orm/postgres-js'; // Use drizzle's postgres-js adapter
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

logger.info('Attempting to connect to Neon database via postgres.js...');

let client;
try {
  // Configure the postgres.js client
  // Ensure SSL is properly configured for Neon (usually required)
  client = postgres(connectionString, { 
    ssl: 'require', // Or adjust based on Neon's requirements/your setup
    max: 1 // Recommended setting for serverless environments
  }); 
  logger.info('postgres.js client configured.');
} catch (error) {
  logger.error('Failed to configure postgres.js client:', error);
  throw new Error('Failed to configure postgres.js client');
}

let dbInstance;
try {
  // Use the postgres-js adapter for Drizzle
  dbInstance = drizzle(client, { schema, logger: true }); 
  logger.info('Drizzle ORM initialized successfully with postgres.js adapter.');
} catch (error) {
  logger.error('Failed to initialize Drizzle ORM with postgres.js:', error);
  throw new Error('Failed to initialize Drizzle ORM with postgres.js');
}

export const db = dbInstance; 