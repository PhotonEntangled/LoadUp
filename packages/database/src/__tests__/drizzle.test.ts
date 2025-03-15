import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { eq } from 'drizzle-orm';
import { shipments, type Shipment } from '../schema/shipments';
import { ShipmentStatus, type Address } from '../schema/types';
import pg from 'pg';
const { Pool } = pg;
import path from 'path';

// Use a hardcoded path relative to the project root
const MIGRATIONS_PATH = path.resolve(process.cwd(), 'packages/database/drizzle/migrations');

describe('Drizzle ORM Tests', () => {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'loadup_test'
  });

  const db = drizzle(pool);

  beforeAll(async () => {
    console.log(`Using migrations path: ${MIGRATIONS_PATH}`);
    try {
      await migrate(db, { migrationsFolder: MIGRATIONS_PATH });
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should insert and query shipments', async () => {
    // First, clear any existing test data
    try {
      await pool.query("DELETE FROM shipments WHERE tracking_number = 'TEST123'");
    } catch (error) {
      console.error('Error clearing test data:', error);
    }

    const testShipment = {
      trackingNumber: 'TEST123',
      status: ShipmentStatus.PENDING,
      customerId: '00000000-0000-0000-0000-000000000001', // Mock UUID
      pickupAddress: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      deliveryAddress: {
        street: '456 Oak Ave',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      packageDetails: {
        weight: 10,
        dimensions: {
          length: 20,
          width: 15,
          height: 10
        },
        description: 'Test package'
      }
    };

    // Use raw SQL insert to match the actual schema
    await pool.query(`
      INSERT INTO shipments (
        tracking_number, customer_id, status, 
        pickup_address, delivery_address, package_details
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      testShipment.trackingNumber,
      testShipment.customerId,
      testShipment.status,
      JSON.stringify(testShipment.pickupAddress),
      JSON.stringify(testShipment.deliveryAddress),
      JSON.stringify(testShipment.packageDetails)
    ]);

    // Query using raw SQL
    const result = await pool.query(
      "SELECT * FROM shipments WHERE tracking_number = $1",
      [testShipment.trackingNumber]
    );
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].status).toBe(ShipmentStatus.PENDING);
    expect(result.rows[0].pickup_address.street).toBe('123 Main St');
  });
}); 