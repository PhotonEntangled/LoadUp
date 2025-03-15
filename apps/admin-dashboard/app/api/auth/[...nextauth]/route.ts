// Use .mjs extension to make this file an ES module
// Without the .mjs extension, the file is treated as CommonJS
// and we get errors with top-level await

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';

// Import database dynamically to avoid ESM/CommonJS issues
const dbPromise = import('@loadup/database').then(m => m.db);
const schemaPromise = import('@loadup/database/schema').then(m => m);

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type for our custom user
interface CustomUser extends User {
  role: string;
  id: string;
}

// Do NOT redefine the Session type here - it's already defined in packages/shared/src/types/next-auth.d.ts

export const authOptions: NextAuthOptions = {
  // JWT is best when not using an adapter
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = loginSchema.parse(credentials);

          // Get database and schema
          const db = await dbPromise;
          const schema = await schemaPromise;

          // Find user by email
          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          });

          // User not found or no password
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await compare(password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Return user with required fields
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name || user.email, // Use name field or fall back to email
          } as CustomUser;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    // Add role and other custom properties to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    // Add custom properties to session from token
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  }
};

// Create the auth handler with NextAuth
const handler = NextAuth(authOptions);

// Export the handlers as route handlers
export const GET = handler;
export const POST = handler;

// Export the auth options for middleware and API routes
export default authOptions; 