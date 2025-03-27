import pg from 'pg';
const { Client } = pg;
import { drizzle } from '@loadup/database/dist/drizzle.js';

describe('Database Connection', () => {
  let client: Client;
  let adminClient: Client;

  beforeAll(async () => {
    // Connect as test user
    client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'test',
      password: 'test',
      database: 'loadup_test'
    });
    await client.connect();
    
    // Connect as admin user for operations that require higher privileges
    adminClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'loadup_test'
    });
    await adminClient.connect();
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.end();
    }
    if (client) {
      await client.end();
    }
  });

  it('should connect to the test database', async () => {
    const result = await client.query('SELECT current_database()');
    expect(result.rows[0].current_database).toBe('loadup_test');
  });

  it('should have proper permissions', async () => {
    const result = await client.query(`
      SELECT has_database_privilege(current_user, current_database(), 'CREATE')
    `);
    expect(result.rows[0].has_database_privilege).toBe(true);
  });

  it('should initialize drizzle orm', async () => {
    const db = drizzle(client);
    expect(db).toBeDefined();
  });

  it('should be able to create and drop tables', async () => {
    // Create a test table using admin client
    await adminClient.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT
      )
    `);

    // Grant permissions to test user
    await adminClient.query(`
      GRANT ALL PRIVILEGES ON TABLE test_table TO test;
      GRANT ALL PRIVILEGES ON SEQUENCE test_table_id_seq TO test;
    `);

    // Verify table exists using test client
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'test_table'
      )
    `);
    expect(result.rows[0].exists).toBe(true);

    // Drop the test table using admin client
    await adminClient.query('DROP TABLE test_table');

    // Verify table was dropped using test client
    const afterDrop = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'test_table'
      )
    `);
    expect(afterDrop.rows[0].exists).toBe(false);
  });
}); 