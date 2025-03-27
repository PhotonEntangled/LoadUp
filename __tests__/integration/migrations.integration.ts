import pg from 'pg';
const { Client } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import { setupTestDatabase, teardownTestDatabase } from './setup-db.js';

// Use a more reliable path resolution method
const MIGRATIONS_PATH = path.resolve(process.cwd(), 'packages/database/drizzle/migrations');

describe('Database Migrations', () => {
  let client: Client | null = null;
  let adminClient: Client | null = null;
  let db: ReturnType<typeof drizzle>;
  let adminDb: ReturnType<typeof drizzle>;
  let testDbName: string;

  // Increase timeout to 60 seconds
  beforeAll(async () => {
    // Set up test database with a unique name
    testDbName = await setupTestDatabase();
    
    try {
      // Connect as test user
      client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'test',
        password: 'test',
        database: testDbName
      });
      await client.connect();
      db = drizzle(client);
      
      // Connect as admin user for operations that require higher privileges
      adminClient = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: testDbName
      });
      await adminClient.connect();
      adminDb = drizzle(adminClient);
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }, 60000); // 60 second timeout

  afterAll(async () => {
    if (client) {
      await client.end();
    }
    if (adminClient) {
      await adminClient.end();
    }
    await teardownTestDatabase(testDbName);
  }, 60000); // 60 second timeout

  it('should apply migrations successfully', async () => {
    // Apply migrations using admin client
    await migrate(adminDb, { migrationsFolder: MIGRATIONS_PATH });
    
    // Check if tables were created using test client
    const { rows } = await client!.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = rows.map(row => row.table_name);
    
    // Verify essential tables exist
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('shipments');
    expect(tableNames).toContain('drivers');
  }, 30000); // 30 second timeout

  it('should have the correct schema version', async () => {
    // Check if the drizzle migrations table exists
    const { rows: migrationTableExists } = await client!.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      )
    `);
    
    expect(migrationTableExists[0].exists).toBe(true);
    
    // Check if migrations were applied
    const { rows: migrations } = await client!.query(`
      SELECT * FROM __drizzle_migrations
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    
    expect(migrations.length).toBeGreaterThan(0);
    
    // The latest migration should have a success status
    expect(migrations[0].success).toBe(true);
  }, 30000); // 30 second timeout

  it('should have the correct table structure', async () => {
    // Check users table columns
    const { rows: userColumns } = await client!.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    const columnNames = userColumns.map(col => col.column_name);
    
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('password');
    expect(columnNames).toContain('created_at');
  }, 30000); // 30 second timeout
}); 