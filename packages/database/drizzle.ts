import { drizzle } from '@loadup/database/dist/drizzle.js';
import pg from 'pg';
const { Pool } = pg;
import * as schema from "./schema.js";

// Load environment variables
const {
  POSTGRES_HOST = 'localhost',
  POSTGRES_PORT = '5432',
  POSTGRES_USER = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
  POSTGRES_DB = 'loadup'
} = process.env;

// Create PostgreSQL connection pool
const pool = new Pool({
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT, 10),
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  ssl: process.env.NODE_ENV === 'production'
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema }); 