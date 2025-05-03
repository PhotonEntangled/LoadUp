// import type { Session, User, AuthOptions } from "next-auth"; // Commented out
// import CredentialsProvider from "next-auth/providers/credentials"; // Commented out
// import { db } from "@loadup/database";
// import { users } from "@loadup/database/schema";
// import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from 'zod';
// import type { JWT } from "next-auth/jwt"; // Commented out
import type { NextRequest } from 'next/server';

// Define user roles (moved from deleted auth.ts)
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  USER = "user", // Assuming a general user role might exist
}

// Define role-based route access (from deleted auth.config.ts)
const roleBasedAccess: Record<string, string[]> = {
  '/dashboard': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
  '/documents': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER], // Added documents page
  '/shipments': [UserRole.ADMIN, UserRole.DRIVER], // Added shipments prefix
  '/tracking-stabilized': [UserRole.ADMIN, UserRole.DRIVER], // Added tracking page
  '/settings': [UserRole.ADMIN],
  // Add other protected routes here as needed
};

// Helper function to check if a user has access to a route (from deleted auth.config.ts)
const hasAccess = (pathname: string, userRole?: string): boolean => {
  if (!userRole) return false; // No access if no role

  // Allow access to sign-in page always
  if (pathname === '/sign-in') {
      return true;
  }

  // Check specific paths first
  const specificPath = Object.keys(roleBasedAccess).find(p => pathname === p || pathname.startsWith(p + '/'));
  if (specificPath) {
    return roleBasedAccess[specificPath].includes(userRole);
  }

  // More general check for protected prefixes as a fallback
  const protectedPrefixes = ['/dashboard', '/documents', '/shipments', '/tracking-stabilized', '/settings'];
  if (protectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
      // Check if the user has *any* role assigned access to the relevant sections
      return Object.entries(roleBasedAccess)
          .filter(([path]) => protectedPrefixes.includes(path))
          .some(([, roles]) => roles.includes(userRole));
  }

  // Allow access to root path or other non-explicitly protected paths
  // Adjust this logic if the root ('/') should also be protected
  return true; // Simplified for disabling auth
};

// Mock database functions for now
const mockUserData = [
  {
    id: "1",
    email: "admin@loadup.com",
    password: "$2a$10$GQH.xZm5DqJu8HxEIq1jPuK6x5YmP5kQZZBz3Vz9BjM0mD1qpLmXa", // hashed "password123"
    name: "Admin User",
    role: UserRole.ADMIN, // Use enum
  },
  // <<< ADDED Development User >>>
  {
    id: "dev-user-01", // Unique ID
    email: "dev@loadup.com",
    // bcrypt hash for the password "password" (cost factor 10) - Ensure this is correct
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", 
    name: "Development User",
    role: UserRole.ADMIN, // Assign appropriate role (e.g., ADMIN for full access)
  },
  // <<< END ADDED Development User >>>
  // Add other mock users if needed (e.g., driver)
];

// Login validation schema (optional, could remove if not actively used by provider)
// const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
// });

// Type for our custom user (align with JWT/Session)
// Ensure packages/shared/src/types/next-auth.d.ts is consistent
// interface CustomUser extends User { // Commented out User dependency
//   role: UserRole;
// }

// Determine cookie name based on environment
// const nodeEnv = process.env.NODE_ENV;
// const cookieName = nodeEnv === 'production' 
//   ? `__Secure-next-auth.session-token` 
//   : `next-auth.session-token`;

// console.log(`[AUTH OPTIONS] Determined session cookie name for NODE_ENV='${nodeEnv}': ${cookieName}`);

// Create the auth options (Commented out the main structure)
export const authOptions /*: AuthOptions*/ = {
  /* // Original Options Content
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
         // ... (authorize logic) ...
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      // name: cookieName, // Use dynamically determined name
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      // ... (jwt callback logic) ...
    },
    async session({ session, token, user }) {
      // ... (session callback logic) ...
    },
  },
  */ // End Original Options Content
}; // Keep the export but comment out the type and content
// ENSURE NO CODE FOLLOWS THIS LINE 