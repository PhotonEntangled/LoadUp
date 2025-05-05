import 'server-only'; // Ensures this module only runs on the server
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { logger } from '@/utils/logger';
import * as schema from './schema';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

// Create a connection pool
export const pool = new Pool({ connectionString });

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema, logger: true });

logger.info('Database connection initialized using neon-serverless adapter.');

// Connection testing is less straightforward here as `pool` handles connections internally.
// A simple query execution can serve as a test if needed during startup, but might add overhead.
// db.execute(sql`select 1`).then(() => logger.info('Neon-serverless connection test successful.'))
//                        .catch(err => logger.error('Neon-serverless connection test failed:', err)); 