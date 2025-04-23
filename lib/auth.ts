import { type Session } from "@auth/core/types"; // Use v5 Session type
// Try importing authOptions using the @ alias
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; 
import NextAuth, {
  // Remove incorrect v4/top-level imports
  // signIn as nextAuthSignIn,
  // signOut as nextAuthSignOut,
  // handlers // Usually not needed directly here
} from "next-auth";
// Remove unused jwt helper import
// import { auth as nextAuthHelper } from "next-auth/jwt";

// Define user roles (moved from deleted auth.ts)
export enum UserRole {
  ADMIN = 'admin',
  DRIVER = 'driver',
  USER = 'user',
}

// Existing auth logic (if any) would go here or be imported
// e.g., functions for checking permissions based on role

export function isAdmin(role: UserRole | string | undefined): boolean {
  return role === UserRole.ADMIN;
}

// Add other permission checks as needed

// Add development bypass for easier testing
const createBypassAuth = () => {
  // Mock session for development using the newly created user ID
  const mockSession = {
    user: {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // <-- EDIT: Use the new user's UUID
      name: "Dev Test User", // Using the name we inserted
      email: "dev.test.user@example.com", // Using the email we inserted
      role: UserRole.ADMIN, 
      image: null
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  // Create bypass functions
  return {
    // Bypass auth() returns mock session or null
    auth: async (): Promise<Session | null> => process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ? mockSession : null,
    // Bypass signIn takes args but just returns success
    signIn: async (provider?: string, options?: any): Promise<any> => {
        console.log("[AUTH BYPASS] signIn called");
        return { success: true }; // Or mimic a redirect response if needed
    },
    // Bypass signOut takes args but just returns success
    signOut: async (options?: any): Promise<any> => {
        console.log("[AUTH BYPASS] signOut called");
        return { success: true }; // Or mimic redirect
    }
  };
};

// Real Auth Logic using NextAuth v5 pattern
let realAuthObject: { 
    auth: () => Promise<Session | null>; 
    signIn: (...args: any[]) => Promise<any>; 
    signOut: (...args: any[]) => Promise<any>; 
};

try {
    // Initialize NextAuth with options to get handlers/helpers
    const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
    // Assign the actual functions to the realAuthObject
    realAuthObject = {
        auth: auth,
        signIn: signIn,
        signOut: signOut,
    };
} catch (error) {
    console.error("Failed to initialize NextAuth:", error);
    // Fallback to dummy functions if initialization fails
    realAuthObject = {
        auth: async () => null,
        signIn: async () => { throw new Error("Auth not initialized"); },
        signOut: async () => { throw new Error("Auth not initialized"); },
    };
}

// Export based on bypass flag
const selectedAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" 
    ? createBypassAuth()
    : realAuthObject;

export const auth = selectedAuth.auth;
export const signIn = selectedAuth.signIn;
export const signOut = selectedAuth.signOut;

// Note: We are not exporting GET/POST handlers from here by default,
// the API route app/api/auth/[...nextauth]/route.ts handles that. 