import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { drizzle } from '@loadup/database/dist/drizzle.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createInterface } from 'readline';
import { stdin as input, stdout as output } from 'process';

// Load test environment variables
const envPath = path.resolve(process.cwd(), '../../.env.test');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

console.log('Database URL:', process.env.DATABASE_URL);

// Connect as postgres user (default superuser)
const superClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres', // We just set this password
  database: 'postgres'
});

async function getPostgresPassword(): Promise<string> {
  const rl = createInterface({ input, output });
  return new Promise((resolve) => {
    rl.question('Enter PostgreSQL superuser (postgres) password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function setupTestDatabase() {
  try {
    console.log('Connecting as postgres user...');
    await superClient.connect();
    console.log('Connected successfully');

    try {
      // Create test user if it doesn't exist
      console.log('Creating test user...');
      await superClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_catalog.pg_roles
            WHERE rolname = 'test'
          ) THEN
            CREATE USER test WITH PASSWORD 'test' CREATEDB;
          END IF;
        END
        $$;
      `);
      console.log('Test user created or already exists');

      // Drop test database if it exists
      console.log('Dropping existing test database if it exists...');
      await superClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = 'loadup_test';
      `);
      await superClient.query('DROP DATABASE IF EXISTS loadup_test;');
      console.log('Existing test database dropped or did not exist');

      // Create new test database
      console.log('Creating new test database...');
      await superClient.query('CREATE DATABASE loadup_test OWNER test;');
      console.log('Test database created successfully');

      // Grant privileges
      console.log('Granting privileges...');
      await superClient.query('GRANT ALL PRIVILEGES ON DATABASE loadup_test TO test;');
      console.log('Privileges granted successfully');

      console.log('Test database setup completed successfully');
    } catch (error) {
      console.error('Error during database setup:', error);
      throw error;
    } finally {
      await superClient.end();
    }
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase(); 