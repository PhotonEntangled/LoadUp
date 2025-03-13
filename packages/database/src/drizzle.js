import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
});
export const db = drizzle(pool, { schema });
// Export schema for use in migrations
export * from './schema';
