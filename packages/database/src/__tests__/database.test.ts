import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../drizzle.js';
import { eq } from 'drizzle-orm';
import { shipments } from '../schema/shipments.js';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

// Define types for query results
interface ExistsResult {
  exists: boolean;
}

interface IndexResult {
  indexname: string;
  indexdef: string;
}

describe('Database Final Validation Tests', () => {
  let pool: Pool;

  beforeAll(async () => {
    // Initialize connection pool
    pool = new Pool({
      max: 20,
      min: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  test('Connection Pool Performance', async () => {
    const startTime = Date.now();
    const connections = await Promise.all(
      Array(10).fill(null).map(() => pool.connect())
    );
    const endTime = Date.now();

    // Connection time should be under 1 second
    expect(endTime - startTime).toBeLessThan(1000);

    // Release connections
    await Promise.all(connections.map(client => client.release()));
  });

  test('Query Performance - Indexed Search', async () => {
    const startTime = Date.now();
    await db.select()
      .from(shipments)
      .where(eq(shipments.status, 'PENDING'))
      .limit(100);
    const endTime = Date.now();

    // Query should complete in under 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  test('Spatial Query Performance', async () => {
    const startTime = Date.now();
    await db.execute(sql`
      SELECT * FROM shipments 
      WHERE ST_DWithin(
        location, 
        ST_SetSRID(ST_Point(-73.935242, 40.730610), 4326),
        5000
      ) 
      LIMIT 100
    `);
    const endTime = Date.now();

    // Spatial query should complete in under 200ms
    expect(endTime - startTime).toBeLessThan(200);
  });

  test('Migration Verification', async () => {
    // Use type assertion to handle the query result
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments'
      );
    `);
    
    // Type assertion for the result
    const existsResult = result as unknown as Array<{exists: boolean}>;
    
    // Check if the result has the expected structure
    expect(existsResult).toHaveLength(1);
    expect(existsResult[0]).toHaveProperty('exists');
    expect(existsResult[0].exists).toBe(true);

    // Verify indexes
    const indexes = await db.execute(sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'shipments';
    `);
    
    // Type assertion for the indexes result
    const indexResults = indexes as unknown as Array<{indexname: string; indexdef: string}>;
    
    // Convert result to array of index names
    const indexNames = indexResults.map(idx => idx.indexname);
    expect(indexNames).toContain('idx_shipments_tracking');
    expect(indexNames).toContain('idx_shipments_status');
    expect(indexNames).toContain('idx_shipments_customer');
    expect(indexNames).toContain('idx_shipments_dates');
  });
}); 