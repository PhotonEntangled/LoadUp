import { db } from '../packages/database/src/drizzle';
import { sql } from 'drizzle-orm';
import { logger } from '../packages/shared/src/logger';

async function verifyMigrations() {
  try {
    logger.info('Verifying database migrations...');

    // Check if required tables exist
    const tables = [
      'shipments',
      'users',
      'drivers',
      'vehicles',
      'tracking_updates'
    ];

    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        );
      `);

      if (!result[0].exists) {
        throw new Error(`Required table "${table}" not found`);
      }
    }

    // Verify indexes
    const requiredIndexes = {
      shipments: [
        'idx_shipments_tracking',
        'idx_shipments_status',
        'idx_shipments_customer',
        'idx_shipments_dates'
      ],
      tracking_updates: [
        'idx_tracking_updates_shipment',
        'idx_tracking_updates_timestamp'
      ],
      drivers: [
        'idx_drivers_status',
        'idx_drivers_location'
      ]
    };

    for (const [table, indexes] of Object.entries(requiredIndexes)) {
      const existingIndexes = await db.execute(sql`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = ${table};
      `);

      const indexNames = existingIndexes.map(idx => idx.indexname);
      
      for (const requiredIndex of indexes) {
        if (!indexNames.includes(requiredIndex)) {
          throw new Error(`Required index "${requiredIndex}" not found on table "${table}"`);
        }
      }
    }

    // Verify PostGIS extension
    const postgisResult = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
      );
    `);

    if (!postgisResult[0].exists) {
      throw new Error('PostGIS extension not installed');
    }

    // Verify column types and constraints
    const shipmentColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'shipments';
    `);

    const requiredColumns = {
      id: { type: 'uuid', nullable: 'NO' },
      tracking_number: { type: 'text', nullable: 'NO' },
      status: { type: 'text', nullable: 'NO' },
      location: { type: 'geometry', nullable: 'YES' }
    };

    for (const [column, specs] of Object.entries(requiredColumns)) {
      const col = shipmentColumns.find(c => c.column_name === column);
      if (!col) {
        throw new Error(`Required column "${column}" not found in shipments table`);
      }
      if (col.data_type !== specs.type && !(specs.type === 'geometry' && col.data_type === 'USER-DEFINED')) {
        throw new Error(`Column "${column}" has incorrect type: ${col.data_type} (expected ${specs.type})`);
      }
      if (col.is_nullable !== specs.nullable) {
        throw new Error(`Column "${column}" has incorrect nullable setting: ${col.is_nullable} (expected ${specs.nullable})`);
      }
    }

    logger.info('✅ All migrations verified successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Migration verification failed:', error);
    process.exit(1);
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyMigrations();
} 