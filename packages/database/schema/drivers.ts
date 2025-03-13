import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique().notNull(),
  phoneNumber: text('phone_number'),
  truckType: text('truck_type', { enum: ['box_truck', 'semi', 'van'] }).notNull(),
  status: text('status', { enum: ['available', 'on_delivery', 'offline'] }).notNull(),
  currentLocation: jsonb('current_location'),
  capacity: jsonb('capacity').notNull(),
  licenseNumber: text('license_number').unique().notNull(),
  licenseExpiry: timestamp('license_expiry').notNull(),
  documents: jsonb('documents'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}); 