import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', {
    enum: ['ADMIN', 'DRIVER', 'CUSTOMER']
  }).notNull().default('CUSTOMER'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  // Define relations if needed
}));

export type User = InferModel<typeof users>; 