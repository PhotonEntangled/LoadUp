import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';
import { vehicles } from './vehicles.js';

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().unique(),
  status: text('status', {
    enum: ['AVAILABLE', 'ON_DELIVERY', 'OFFLINE']
  }).notNull().default('OFFLINE'),
  location: text('location'),
  currentVehicleId: uuid('current_vehicle_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const driversRelations = relations(drivers, ({ one }) => ({
  currentVehicle: one(vehicles, {
    fields: [drivers.currentVehicleId],
    references: [vehicles.id],
  })
}));

export type Driver = InferModel<typeof drivers>; 