import type { Session, User, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@loadup/database";
// import { users } from "@loadup/database/schema";
// import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from 'zod';
import type { JWT } from "next-auth/jwt";
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
  return true;
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
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type for our custom user (align with JWT/Session)
// Ensure packages/shared/src/types/next-auth.d.ts is consistent
interface CustomUser extends User {
  role: UserRole;
}

// Create the auth options
export const authOptions: AuthOptions = {
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
         const email = credentials.email as string;
         const password = credentials.password as string;

        // Mock database query
        const user = mockUserData.find(
          (user) => user.email === email
        );

        if (!user) {
          console.log(`No user found for email: ${email}`);
          return null;
        }

        // <<< ADDED: Log inputs before bcrypt comparison >>>
        console.log(`[AUTH DEBUG] Comparing provided password: '${password}'`);
        console.log(`[AUTH DEBUG] Against stored hash for ${user.email}: '${user.password}'`);
        // <<< END ADDED >>>

        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) {
           console.log(`Password mismatch for email: ${email}`);
          return null;
        }

        console.log(`Login successful for: ${email}`);
        // Return object needs to match User type signature expected by NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Pass role as defined in mock data
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // <<< ADDED: Explicit Cookie Configuration >>>
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // domain: // Optional: specify if needed for subdomains
      }
    }
    // Add other cookie configurations if needed (e.g., csrfToken, callbackUrl, pkceCodeVerifier)
  },
  // <<< END ADDED >>>
  // pages: {
  //   signIn: "/sign-in",
  //   signOut: "/sign-out",
  //   error: "/error",
  // },
  callbacks: {
    // JWT callback - Add custom claims
    // Use broader type for incoming user, handle role conversion
    async jwt({ token, user }: { token: JWT, user?: User }): Promise<JWT> {
      if (user) {
        // User object is available on initial sign-in
        token.id = user.id;
        // Assign role from user object, casting to UserRole if necessary
        // Provide a default role if user.role is undefined/null
        token.role = (user.role as UserRole) || UserRole.USER;
        token.email = user.email;
        token.name = user.name;
        console.log('JWT callback: User signed in, adding to token:', { id: token.id, role: token.role });
      }
      return token;
    },

    // Session callback - Make token info available to client
    async session({ session, token }: { session: Session, token: JWT }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  // Align fallback secret with .env.local value
  secret: process.env.NEXTAUTH_SECRET || "your_nextauth_secret_key_should_be_at_least_32_chars", 
  debug: process.env.NODE_ENV === 'development',
}; 