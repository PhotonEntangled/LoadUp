import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '../../packages/database/schema/index.js';
import path from 'path';
import crypto from 'crypto';

// Generate a unique suffix for test databases to prevent conflicts in parallel tests
const TEST_DB_SUFFIX = crypto.randomBytes(4).toString('hex');
const TEST_DB_NAME = `loadup_test_${TEST_DB_SUFFIX}`;

// Track created databases for cleanup
const createdDatabases = new Set<string>();

// Default database configuration for initial setup
let defaultPool: Pool | null = null;
let testPool: Pool | null = null;

// Create Drizzle database instance for tests
export let testDb: ReturnType<typeof drizzle>;

export async function setupTestDatabase(customDbName?: string) {
  const dbName = customDbName || TEST_DB_NAME;
  
  try {
    console.log(`Setting up test database: ${dbName}...`);
    
    // Create pools if they don't exist
    if (!defaultPool) {
      defaultPool = new Pool({
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'postgres'
      });
    }
    
    // Drop existing database if it exists
    console.log(`Checking for existing test database: ${dbName}...`);
    try {
      // Check if database exists first
      const { rows } = await defaultPool.query(`
        SELECT 1 FROM pg_database WHERE datname = $1
      `, [dbName]);
      
      if (rows.length > 0) {
        // Terminate all connections to the database
        console.log(`Terminating connections to existing test database: ${dbName}...`);
        await defaultPool.query(`
          SELECT pg_terminate_backend(pid) 
          FROM pg_stat_activity 
          WHERE datname = $1;
        `, [dbName]);
        
        // Drop the database
        console.log(`Dropping existing test database: ${dbName}...`);
        await defaultPool.query(`DROP DATABASE IF EXISTS "${dbName}";`);
        console.log(`Existing test database dropped: ${dbName}`);
      }
    } catch (error) {
      console.warn(`Warning: Could not drop existing database ${dbName}. It may not exist or there might be active connections:`, error);
    }
    
    // Create new test database
    console.log(`Creating new test database: ${dbName}...`);
    try {
      // Create the database
      await defaultPool.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Test database created: ${dbName}`);
      
      // Track the created database for cleanup
      createdDatabases.add(dbName);
      
      // Create test user if it doesn't exist
      try {
        await defaultPool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test') THEN
              CREATE USER test WITH PASSWORD 'test';
            END IF;
          END
          $$;
        `);
        console.log('Test user created or already exists');
      } catch (error) {
        console.warn('Warning: Could not create test user:', error);
      }
      
      // Grant privileges to test user
      await defaultPool.query(`GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO test;`);
      console.log(`Database privileges granted to test user for ${dbName}`);
      
      // Connect to the test database as postgres to set up schema permissions
      const tempPool = new Pool({
        user: 'postgres',
        password: 'postgres',
        host: 'localhost',
        port: 5432,
        database: dbName
      });
      
      try {
        // Grant schema permissions
        await tempPool.query('GRANT ALL ON SCHEMA public TO test;');
        await tempPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO test;');
        await tempPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO test;');
        await tempPool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO test;');
        console.log(`Schema privileges granted to test user for ${dbName}`);
      } finally {
        // Close the temporary pool
        await tempPool.end();
      }
    } catch (error) {
      console.error(`Error creating test database ${dbName}:`, error);
      throw error;
    }
    
    // Create test pool if it doesn't exist
    if (testPool) {
      // Close existing pool before creating a new one
      await testPool.end();
      testPool = null;
    }
    
    // Create a new test pool
    testPool = new Pool({
      user: 'test',
      password: 'test',
      host: 'localhost',
      port: 5432,
      database: dbName
    });
    
    // Initialize testDb
    testDb = drizzle(testPool, { schema });
    
    // Run migrations
    console.log('Running migrations...');
    const migrationsPath = path.resolve(process.cwd(), 'packages/database/drizzle/migrations');
    console.log('Migrations path:', migrationsPath);
    await migrate(testDb, { migrationsFolder: migrationsPath });
    console.log('Migrations completed');
    
    console.log(`Test database setup complete: ${dbName}`);
    return dbName;
  } catch (error) {
    console.error(`Error setting up test database ${dbName}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function teardownTestDatabase(dbName?: string) {
  try {
    const databasesToCleanup = dbName ? [dbName] : Array.from(createdDatabases);
    
    for (const db of databasesToCleanup) {
      console.log(`Tearing down test database: ${db}...`);
      
      // Close test pool
      if (testPool) {
        await testPool.end();
        testPool = null;
      }
      
      // Drop the database if it exists
      if (defaultPool) {
        try {
          // Terminate all connections to the database
          await defaultPool.query(`
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = $1;
          `, [db]);
          
          // Drop the database
          await defaultPool.query(`DROP DATABASE IF EXISTS "${db}";`);
          console.log(`Test database dropped: ${db}`);
          
          // Remove from tracking
          createdDatabases.delete(db);
        } catch (error) {
          console.warn(`Warning: Could not drop test database ${db}:`, error);
        }
      }
    }
    
    // Close default pool if no more databases to manage
    if (createdDatabases.size === 0 && defaultPool) {
      await defaultPool.end();
      defaultPool = null;
    }
    
    console.log('Test database connections closed');
  } catch (error) {
    console.error('Error tearing down test database:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
} 