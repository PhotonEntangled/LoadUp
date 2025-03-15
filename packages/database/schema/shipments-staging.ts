import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const shipmentsStaging = pgTable('shipments_staging', {
  id: uuid('id').primaryKey().defaultRandom(),
  rawData: jsonb('raw_data').notNull(),
  source: text('source').notNull(),
  status: text('status').notNull().default('PENDING'),
  errorMessage: text('error_message'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}); 