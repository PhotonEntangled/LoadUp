import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';
import { drivers } from './drivers.js';

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', {
    enum: ['BOX_TRUCK', 'SEMI', 'VAN']
  }).notNull(),
  plateNumber: text('plate_number').notNull().unique(),
  status: text('status', {
    enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE']
  }).notNull().default('AVAILABLE'),
  capacity: integer('capacity').notNull(),
  currentDriverId: uuid('current_driver_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  currentDriver: one(drivers, {
    fields: [vehicles.currentDriverId],
    references: [drivers.id],
  })
}));

export type Vehicle = InferModel<typeof vehicles>; 