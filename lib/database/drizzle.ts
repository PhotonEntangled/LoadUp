// import { neon } from '@neondatabase/serverless'; // Removed neon HTTP adapter import
// import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'; // Removed neon-http drizzle import
import postgres from 'postgres'; // Added postgres import
import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js'; // Added postgres-js drizzle import
import { logger } from '@/utils/logger';
import * as schema from './schema'; // Import all schema objects

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

// Configure postgres client
// logger.info('Attempting to connect to Neon database via postgres.js...'); // Log adapted
const connectionString = process.env.DATABASE_URL;

// --- postgres.js configuration ---
// Disable prefetch as it is not supported for "Transaction" pool mode
// TODO: Consider adjusting pool settings if needed, defaults are generally okay
// const client = postgres(connectionString, { prepare: false }); 
const client = postgres(connectionString, { 
  prepare: false,
  // Add SSL configuration if needed for Vercel/Neon, although usually handled by connection string
  // ssl: 'require', // Example: uncomment if direct connection needs explicit SSL
  // Consider connection pooling options if performance issues arise later
  // max: 1 // Example: Limiting connections for serverless
}); 
// logger.info('postgres.js client configured.'); // Log adapted

// Initialize Drizzle ORM with postgres.js adapter and schema
// export const db = drizzleNeon(sqlNeon, { schema, logger: true }); // Original neon-http line
export const db = drizzlePostgresJs(client, { schema, logger: true }); // Use postgres-js adapter
// logger.info('Drizzle ORM initialized successfully with postgres.js adapter.'); // Log adapted

logger.info('Database connection initialized using postgres.js adapter.');

// Optional: Add a simple connection test if desired (can be noisy)
// db.execute(sql`select 1`).then(() => logger.info('Postgres.js connection test successful.'))
//                        .catch(err => logger.error('Postgres.js connection test failed:', err)); 