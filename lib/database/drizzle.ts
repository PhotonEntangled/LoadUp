// import { neon } from '@neondatabase/serverless'; // Removed neon HTTP adapter import
// import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'; // Removed neon-http drizzle import
// import postgres from 'postgres'; // Removed postgres import
// import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js'; // Removed postgres-js drizzle import
import { sql } from '@vercel/postgres'; // Added vercel/postgres import
import { drizzle } from 'drizzle-orm/vercel-postgres'; // Added vercel-postgres drizzle import
import { logger } from '@/utils/logger';
import * as schema from './schema'; // Import all schema objects

// Note: DATABASE_URL is implicitly used by @vercel/postgres
// We don't need to explicitly check/configure the client like with postgres.js or neon-http

// logger.info('Attempting to initialize Drizzle with vercel-postgres adapter...');

// Initialize Drizzle ORM with vercel-postgres adapter and schema
// The `sql` object from `@vercel/postgres` handles the connection pooling automatically.
export const db = drizzle(sql, { schema, logger: true });

logger.info('Database connection initialized using vercel-postgres adapter.');

// Connection testing is less straightforward here as `sql` handles connections internally.
// A simple query execution can serve as a test if needed during startup, but might add overhead.
// db.execute(sql`select 1`).then(() => logger.info('Vercel-Postgres connection test successful.'))
//                        .catch(err => logger.error('Vercel-Postgres connection test failed:', err)); 