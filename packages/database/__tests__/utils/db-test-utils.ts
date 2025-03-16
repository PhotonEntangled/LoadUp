import { db } from '@packages/database/*/src/drizzle.js';
import { sql } from 'drizzle-orm';

/**
 * Clear all data from the database
 */
export async function clearDatabase() {
  try {
    // Get all tables
    const result = await db.execute(sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);
    
    const tables = result.rows || [];

    // Disable foreign key checks
    await db.execute(sql`SET session_replication_role = 'replica'`);

    // Truncate all tables
    for (const row of tables) {
      const tablename = row.tablename as string;
      await db.execute(sql`TRUNCATE TABLE "public"."${sql.identifier(tablename)}" CASCADE`);
    }

    // Enable foreign key checks
    await db.execute(sql`SET session_replication_role = 'origin'`);
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Set up the test database with seed data
 */
export async function setupTestDatabase() {
  try {
    await clearDatabase();
    // Add any seed data needed for tests
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

/**
 * Tear down the test database
 */
export async function teardownTestDatabase() {
  try {
    await clearDatabase();
    console.log('Test database teardown complete');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    throw error;
  }
} 