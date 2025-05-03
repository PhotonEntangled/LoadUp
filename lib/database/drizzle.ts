import 'server-only'; // Ensures this module only runs on the server
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { logger } from '@/utils/logger';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Initialize the Neon HTTP client
const sql = neon(connectionString);

// Initialize Drizzle with Neon HTTP adapter
export const db = drizzle(sql, { schema, logger: true });

logger.info('Database connection initialized using neon-http adapter.');

// Connection testing is less straightforward here as `sql` handles connections internally.
// A simple query execution can serve as a test if needed during startup, but might add overhead.
// db.execute(sql`select 1`).then(() => logger.info('Neon-HTTP connection test successful.'))
//                        .catch(err => logger.error('Neon-HTTP connection test failed:', err)); 