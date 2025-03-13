import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default database credentials
const defaultCredentials = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  ssl: false,
};

// Try to extract database connection details from DATABASE_URL if available
let dbCredentials = defaultCredentials;
try {
  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbCredentials = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 5432,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1), // Remove leading slash
      ssl: process.env.NODE_ENV === 'production',
    };
  }
} catch (error) {
  console.warn('Invalid DATABASE_URL, using default credentials');
}

export default {
  schema: './schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials,
  verbose: true,
  strict: true,
} satisfies Config; 