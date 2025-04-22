import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local first if it exists
dotenv.config({ path: '.env.local' });
// Load .env as fallback (though .env.local should have DATABASE_URL)
dotenv.config({ path: '.env' }); 

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Make sure it is defined in .env.local');
}

export default defineConfig({
  dialect: 'postgresql', // Specify the dialect
  schema: './lib/database/schema.ts', // Point to your schema file
  out: './drizzle', // Directory for migration files (good practice)
  dbCredentials: {
    url: dbUrl, // Use the DATABASE_URL from environment
  },
  // Optionally, add verbose logging for drizzle-kit
  verbose: true, 
  // Optionally, enforce strict mode
  strict: true, 
}); 