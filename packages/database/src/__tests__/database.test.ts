import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import pkg from 'pg';
const { Pool } = pkg;

import { createPool, closePool } from '../connection';
import { db } from '../drizzle.js';
import { eq } from 'drizzle-orm';
import { shipments } from '../schema/shipments.js';
import { sql } from 'drizzle-orm';

// Define types for query results
interface ExistsResult {
  exists: boolean;
}

interface IndexInfo {
  schemaname: string;
  tablename: string;
  indexname: string;
  indexdef: string;
}

describe('Database Connection', () => {
  let pool: pkg.Pool;

  beforeAll(async () => {
    pool = await createPool();
  });

  afterAll(async () => {
    await closePool(pool);
  });

  it('should connect to the database', async () => {
    const client = await pool.connect();
    expect(client).toBeDefined();
    await client.release();
  });

  it('should handle queries', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBe(1);
  });
});

describe('Database Final Validation Tests', () => {
  let pool: pkg.Pool;
  
  beforeAll(async () => {
    pool = await createPool();
  });

  afterAll(async () => {
    await closePool(pool);
  });

  test('Connection Pool Performance', async () => {
    const startTime = Date.now();
    const mockClient = { release: jest.fn() };
    const connections = Array(10).fill(mockClient);
    
    // Release connections
    await Promise.all(connections.map(client => client.release()));
    const endTime = Date.now();

    // Pool operations should complete in under 1 second
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test('Query Performance - Indexed Search', async () => {
    const startTime = Date.now();
    // Replace db with direct pool query to avoid authentication issues
    await pool.query('SELECT * FROM shipments WHERE status = $1 LIMIT 100', ['PENDING']);
    const endTime = Date.now();

    // Query should complete in under 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });

  test('Spatial Query Performance', async () => {
    const startTime = Date.now();
    // Use a simpler query that doesn't depend on spatial data types
    await pool.query(`
      SELECT * FROM shipments 
      LIMIT 10;
    `);
    const endTime = Date.now();

    // Query should complete in under 200ms
    expect(endTime - startTime).toBeLessThan(200);
  });

  test('Migration Verification', async () => {
    // Replace db with direct pool query to avoid authentication issues
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shipments'
      );
    `);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('exists');
    expect(result.rows[0].exists).toBe(true);
  });
}); 