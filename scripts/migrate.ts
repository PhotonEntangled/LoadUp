import { config } from 'dotenv';
import { db, pool } from '../lib/database/drizzle';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

config({ path: '.env' });

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigrations();