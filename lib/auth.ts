import NextAuth, { type DefaultSession, type NextAuthOptions } from 'next-auth'; 
import { DrizzleAdapter } from '@auth/drizzle-adapter'; 
import { db } from './database/drizzle'; // Assuming db is here
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { users } from './database/schema';
import { eq } from 'drizzle-orm';

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
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string)
        });

        if (!user) {
          console.log(`[Authorize] User not found: ${credentials.email}`);
          return null;
        }
        
        // If password bypass is active
        if (process.env.NEXTAUTH_PASSWORD_BYPASS === "true") {
             console.log(`[AUTH DEBUG] Bypassing password check for ${credentials.email}`);
             // Use existing fields from schema
             return { 
                 id: user.id,
                 name: user.name,
                 email: user.email,
                 role: user.role as UserRole, // Ensure role matches enum
                 // image: user.image // REMOVED: image column doesn't exist in schema
             }; 
        }

        // Regular password check
        // Use the 'password' field from schema, assuming it holds the hash
        if (!user.password) { 
            console.log(`[Authorize] User ${credentials.email} has no password set.`);
            return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.password);
        console.log(`[Authorize] Password match for ${credentials.email}: ${passwordMatch}`);

        if (passwordMatch) {
          // Return the user object expected by NextAuth, using fields from schema
          return { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole, // Ensure role matches enum
            // image: user.image // REMOVED: image column doesn't exist in schema
          }; 
        } else {
          return null;
        }
      }
    })
    // Add other providers like Google, etc. if needed
  ],
  session: { strategy: "jwt" }, // Use JWT for session strategy
  pages: {
    signIn: '/auth/sign-in', 
    // error: '/auth/error', // Optional: Custom error page
    // verifyRequest: '/auth/verify-request', // Optional: Email verification page
    // newUser: '/auth/new-user' // Optional: Redirect new users
  },
  callbacks: {
    async jwt({ token, user }) {
      // If user object exists (occurs on sign in), add custom properties to the token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Role might be directly on user or need casting
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties from the token to the session object
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === 'development', // Enable debug logs in dev
};

// --- Get Server Session --- 
// Standard way to get session in Server Components / API Routes
import { getServerSession } from "next-auth/next"

export const auth = () => getServerSession(authOptions);

// --- Authentication Functions --- 
// Use the actual NextAuth handlers/functions
const { handlers, signIn, signOut } = NextAuth(authOptions);

export { handlers, signIn, signOut };

// Remaining helper functions (getCurrentUser, isAdmin, etc.) can stay the same
// or be slightly adapted if needed based on the final Session type.

// REMOVE the old stub/mock logic
/*
// Define a type for the auth object to ensure consistency
type AuthFunctions = {
// ... stubs ... 
};
// Default object if auth is not initialized (prevents runtime errors)
const defaultAuthObject: AuthFunctions = {
// ... stubs ... 
};
// Attempt to initialize auth, but catch errors if dependencies are missing
let realAuthObject: AuthFunctions | null = null;
// ... try/catch with stubs ... 
// Export the correct auth functions (either real or stubs)
const selectedAuth = realAuthObject || defaultAuthObject;
// export const auth = selectedAuth.auth; // Already defined above
export const signIn = selectedAuth.signIn;
export const signOut = selectedAuth.signOut;
*/

// ... Keep getCurrentUser, isAdmin, createBypassAuth etc. ... 

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
    role: session.user.role ?? UserRole.USER, // Provide default if role is unexpectedly null
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