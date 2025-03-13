import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Read the database URL from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a new postgres client for migrations
const migrationClient = postgres(connectionString, { max: 1 });

// Create a new drizzle instance
const db = drizzle(migrationClient);

// Run migrations
async function main() {
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }

  // Close the database connection
  await migrationClient.end();
  process.exit(0);
}

main(); 