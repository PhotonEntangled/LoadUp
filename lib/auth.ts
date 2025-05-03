import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth'; 
import { DrizzleAdapter } from '@auth/drizzle-adapter'; 
import { db } from './database/drizzle'; // Assuming db is here
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { users } from './database/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { logger } from '@/utils/logger';

// Define user roles (Consider moving to a dedicated types file)
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  USER = "user",
}

// --- Type Augmentation for Session --- 
// Add custom properties like 'role' and 'id' to the session user object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole | null;
    } & DefaultSession["user"]; // Keep default fields like name, email, image
  }

  // You might also need to augment the User model if using database sessions extensively
  interface User {
     role?: UserRole | null;
  }
}

// --- ACTUAL AUTH OPTIONS --- 
export const authOptions: NextAuthOptions = { 
  adapter: (() => { 
      logger.info("[Auth Options] Initializing DrizzleAdapter...");
      const adapter = DrizzleAdapter(db);
      logger.info("[Auth Options] DrizzleAdapter initialized.");
      return adapter;
  })(),
  session: {
    strategy: "database", // Explicitly set strategy if using adapter
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // --- DB Connection Test --- 
        try {
          logger.info("[Authorize] Attempting simple DB query to test connection...");
          // Perform a simple, non-critical query
          await db.select({ id: users.id }).from(users).limit(1);
          logger.info("[Authorize] DB connection test successful.");
        } catch (dbConnectionError: any) {
            logger.error(`[Authorize] FATAL: DB connection test failed: ${dbConnectionError.message}`, { stack: dbConnectionError.stack });
            // Return null or throw an error to prevent further execution if DB fails
            return null; 
        }
        // --- End DB Connection Test ---

        logger.info(`[Authorize] Attempting authorization for email: ${credentials?.email}`);
        if (!credentials?.email || !credentials?.password) {
          logger.warn('[Authorize] Missing email or password.');
          return null; // Or throw appropriate error
        }

        let user = null;
        try {
          logger.debug(`[Authorize] Querying database for user: ${credentials.email}`);
          user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });
          logger.debug(`[Authorize] Database query result for ${credentials.email}: ${user ? 'User Found' : 'Not Found'}`);
        } catch (dbError: any) {
          logger.error(`[Authorize] Database error querying user ${credentials.email}: ${dbError.message}`, { stack: dbError.stack });
          return null; // Return null on DB error during auth
        }

        if (!user) {
          logger.warn(`[Authorize] No user found for email: ${credentials.email}`);
          return null;
        }
        
        // If password bypass is active
        if (process.env.NEXTAUTH_PASSWORD_BYPASS === "true") {
             logger.warn(`[Authorize] Bypassing password check for ${credentials.email}`);
             const userToReturn = { 
                 id: user.id,
                 name: user.name,
                 email: user.email,
                 role: user.role as UserRole, // Ensure role matches enum
                 // image: user.image // Schema doesn't have image
             };
             logger.info(`[Authorize] Bypass successful. Returning user: ${JSON.stringify(userToReturn)}`);
             return userToReturn;
        }

        // Regular password check
        if (!user.password) { 
          logger.error(`[Authorize] User ${credentials.email} found but has no password hash set.`);
          return null; // Cannot authenticate if user has no password
        }

        let isValidPassword = false;
        try {
          logger.debug(`[Authorize] Comparing provided password with hash for ${credentials.email}`);
          isValidPassword = await bcrypt.compare(credentials.password, user.password);
          logger.debug(`[Authorize] Password validation result for ${credentials.email}: ${isValidPassword}`);
        } catch (compareError: any) {
             logger.error(`[Authorize] Error comparing password hash for ${credentials.email}: ${compareError.message}`, { stack: compareError.stack });
             return null; // Return null on hash comparison error
        }

        if (isValidPassword) {
          const userToReturn = { 
              id: user.id, 
              name: user.name, 
              email: user.email,
              role: user.role as UserRole 
          };
          logger.info(`[Authorize] Password valid. Returning user: ${JSON.stringify(userToReturn)}`);
          return userToReturn;
        } else {
          logger.warn(`[Authorize] Invalid password for email: ${credentials.email}`);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
        logger.debug(`[Callback JWT] Fired. User present: ${!!user}, Token received: ${JSON.stringify(token)}`);
        // This callback is typically used with JWT strategy
        // If using DB strategy, user info should be added in the session callback
        if (user) {
          // On sign in, add user properties to the token
          token.id = user.id;
          // Safely assign role, providing a default if null/undefined
          token.role = user.role ?? UserRole.USER; 
          logger.debug(`[Callback JWT] Adding user info to token: ${JSON.stringify({id: user.id, role: token.role})}`); // Log the assigned role
        }
        logger.debug(`[Callback JWT] Returning token: ${JSON.stringify(token)}`);
        return token;
    },
    async session({ session, token, user }) {
      // The `user` object here comes from the adapter based on session ID
      // The `token` object is only available if using JWT strategy (and jwt callback)
      logger.info(`[Callback Session] Fired. Session received: ${JSON.stringify(session)}, User object (from adapter): ${JSON.stringify(user)}, Token object (JWT only): ${JSON.stringify(token)}`);

      // Ensure session.user exists
      if (session.user) {
          // Add id and role from the user object (fetched by adapter) to the session
          if (user) { // Check if user object from adapter exists
            session.user.id = user.id;
            session.user.role = user.role as UserRole | null;
            logger.debug(`[Callback Session] Added id/role from adapter user: ${JSON.stringify({ id: user.id, role: user.role })}`);
          } else {
            // This case might happen if adapter fails or if JWT strategy is somehow mixed?
            logger.warn(`[Callback Session] User object from adapter was missing. Session ID might be invalid or adapter failed.`);
            // We might want to invalidate the session here by returning null or an empty session?
            // For now, just log, session might still contain basic info like email/name
          }
      } else {
         logger.warn(`[Callback Session] Received session object without 'user' property.`);
      }
      
      logger.info(`[Callback Session] Returning session: ${JSON.stringify(session)}`);
      return session;
    },
  },
  pages: {
    signIn: '/auth/sign-in', 
    // signOut: '/auth/sign-out',
    // error: '/auth/error', // Optional
    // verifyRequest: '/auth/verify-request', // Optional
    // newUser: '/auth/new-user' // Optional
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug logs in dev
  // Add events for logging if needed
  events: {
    async signIn(message) { logger.info(`[Event SignIn] User signed in: ${JSON.stringify(message)}`) },
    async signOut(message) { logger.info(`[Event SignOut] User signed out: ${JSON.stringify(message)}`) },
    async createUser(message) { logger.info(`[Event CreateUser] User created: ${JSON.stringify(message)}`) },
    async updateUser(message) { logger.info(`[Event UpdateUser] User updated: ${JSON.stringify(message)}`) },
    async linkAccount(message) { logger.info(`[Event LinkAccount] Account linked: ${JSON.stringify(message)}`) },
    async session(message) { logger.debug(`[Event Session] Session event: ${JSON.stringify(message)}`) }, // Debug level for potentially noisy session events
  }
}; 

// Export handlers, signIn, signOut
// logger.debug("[lib/auth] Initializing NextAuth handlers...");
export const { handlers, signIn: nextAuthSignIn, signOut: nextAuthSignOut } = NextAuth(authOptions);
// logger.debug("[lib/auth] NextAuth handlers initialized.");

// Re-export signIn and signOut for potential use in Server Actions
// (Ensure these are not confused with client-side imports from next-auth/react)
export { nextAuthSignIn as signIn, nextAuthSignOut as signOut };

/**
 * Wrapper for `getServerSession` to simplify usage
 * IMPORTANT: Use this in Server Components and Route Handlers
 */
export async function auth() {
  // logger.debug("[auth func] Calling getServerSession...");
  const session = await getServerSession(authOptions);
  // logger.debug(`[auth func] getServerSession returned: ${session ? JSON.stringify(session) : 'null'}`);
  return session;
}

// ... rest of file (isAdmin, getCurrentUser etc.)

export async function getCurrentUser(): Promise<{ id: string; name: string; email: string; role: UserRole } | null> {
  // Get session data using the real auth function
  const session = await auth(); 
  
  // Basic check if user data exists
  if (!session?.user) return null; 

  // Return mock or extracted user data
  return {
    id: session.user.id, // Should now be correctly typed from Session augmentation
    name: session.user.name ?? 'N/A',
    email: session.user.email ?? 'N/A',
    role: session.user.role ?? UserRole.USER, 
  };
}

export function isAdmin(role: UserRole | string | undefined): boolean {
  return role === UserRole.ADMIN;
}

const createBypassAuth = () => {
  // ... keep bypass logic if still needed for specific tests ...
  const mockSession = {
    user: {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", 
      name: "Dev Test User",
      email: "dev.test.user@example.com",
      role: UserRole.ADMIN, 
      image: null
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  return {
    auth: async (): Promise<any | null> => process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ? mockSession : null,
    signIn: async (provider?: string, options?: any): Promise<any> => {
        console.log("[AUTH BYPASS] signIn called");
        return { success: true }; 
    },
    signOut: async (options?: any): Promise<any> => {
        console.log("[AUTH BYPASS] signOut called");
        return { success: true };
    }
  };
};

// Note: We are not exporting GET/POST handlers from here by default,
// the API route app/api/auth/[...nextauth]/route.ts handles that. 