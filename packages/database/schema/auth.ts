import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import type { InferModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('USER'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
});

export type User = InferModel<typeof users, 'select'>;
export type NewUser = InferModel<typeof users, 'insert'>; 