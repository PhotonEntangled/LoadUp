import { db } from '@loadup/database';
import { users } from '@loadup/database/schema';
import { eq } from '@loadup/database';

export interface UserSession {
  userId: string;
  role: string;
}

export class AuthService {
  async getUserById(userId: string) {
    return db.query.users.findFirst({
      where: eq(users.id as any, userId),
    });
  }

  async updateLastLogin(userId: string) {
    await db.update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id as any, userId));
  }

  async validateSession(session: UserSession) {
    const user = await this.getUserById(session.userId);
    return user?.role === session.role;
  }
} 