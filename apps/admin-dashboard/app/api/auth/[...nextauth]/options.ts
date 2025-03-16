import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@loadup/database";
// import { users } from "@loadup/database/schema";
// import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from 'zod';

// Mock database functions for now
const mockUserData = [
  {
    id: "1",
    email: "admin@loadup.com",
    password: "$2a$10$GQH.xZm5DqJu8HxEIq1jPuK6x5YmP5kQZZBz3Vz9BjM0mD1qpLmXa", // hashed "password123"
    name: "Admin User",
    role: "admin",
  },
];

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type for our custom user
interface CustomUser extends User {
  role: string;
}

// Do NOT redefine the Session type here - it's already defined in packages/shared/src/types/next-auth.d.ts

// Create the auth options
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Mock database query
        const user = mockUserData.find(
          (user) => user.email === credentials.email
        );

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
}; 