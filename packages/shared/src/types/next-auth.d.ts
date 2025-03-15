/**
 * NextAuth custom type definitions for LoadUp
 * This file extends the default NextAuth types to include our custom properties
 */

import { UserRole } from '../enums';

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
    expires: string;
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    emailVerified?: Date | null;
  }

  /**
   * JWT token payload
   */
  interface JWT {
    id: string;
    role: string;
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
} 