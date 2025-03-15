import * as schema from '../../../packages/database/schema/index.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { testDb } from '../setup-db';

export async function setupTestUser() {
  const testUser = {
    email: 'test@loadup.com',
    password: await bcrypt.hash('ValidPassword123!', 10),
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN' as const,
    emailVerified: new Date()
  };

  // Clean up any existing test user
  await testDb.delete(schema.users).where(eq(schema.users.email, testUser.email));

  // Create new test user
  const [createdUser] = await testDb.insert(schema.users).values(testUser).returning();

  return createdUser;
}

export async function cleanupTestUser() {
  await testDb.delete(schema.users).where(eq(schema.users.email, 'test@loadup.com'));
}