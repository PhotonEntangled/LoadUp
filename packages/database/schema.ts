// Export all schemas from the schema directory
export * from './schema/index.js';

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

// Define role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'driver', 'customer']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('fullName').notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}); 