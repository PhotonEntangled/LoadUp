import { db } from '@/lib/database/drizzle';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  try {
    console.log('Starting database migration...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main(); 