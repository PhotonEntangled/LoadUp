import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['ADMIN', 'DRIVER', 'READ_ONLY'] }).notNull(),
  status: text('status', { enum: ['ACTIVE', 'INACTIVE'] }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  vehicleType: text('vehicle_type').notNull(),
  licenseNumber: text('license_number').notNull(),
  phoneNumber: text('phone_number').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  lastLocationUpdate: timestamp('last_location_update'),
  driverStatus: text('driver_status', { 
    enum: ['AVAILABLE', 'EN_ROUTE', 'BUSY', 'OFFLINE'] 
  }).notNull().default('OFFLINE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}); 