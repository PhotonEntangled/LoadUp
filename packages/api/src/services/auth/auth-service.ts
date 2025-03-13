import { db } from '@loadup/database';
import { usersTable } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';

export interface UserSession {
  userId: string;
  role: string;
}

export class AuthService {
  async getUserById(userId: string) {
    return db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });
  }

  async updateLastLogin(userId: string) {
    await db.update(usersTable)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async validateSession(session: UserSession) {
    const user = await this.getUserById(session.userId);
    return user?.role === session.role;
  }
} 