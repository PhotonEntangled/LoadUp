// import NextAuth, { type NextAuthOptions } from 'next-auth'; // Commented out
// import { DrizzleAdapter } from '@auth/drizzle-adapter'; // Commented out
// import { db } from './database/drizzle'; // Assuming db is here

// TODO: Re-enable and configure properly when auth is restored

// Define user roles (Consider moving to a dedicated types file)
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  USER = "user",
}

// Example simplified auth setup (replace with actual options when re-enabled)
// export const authOptions: NextAuthOptions = { 
//   adapter: DrizzleAdapter(db),
//   providers: [
//     // Add providers like Credentials, Google, etc.
//   ],
//   // Add other options like pages, callbacks, secret etc.
// };

// Example simplified auth function (replace when re-enabled)
export const auth = async () => {
  // In a real scenario, this would call `getServerSession(authOptions)` or similar
  // For testing without auth, return a mock session or null
  console.warn("[lib/auth] Auth is disabled. Returning null session.");
  return null; // Or return a mock session object if needed for UI testing
  /*
  return {
    user: {
      id: 'mock-user-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: UserRole.ADMIN, // Or desired mock role
    },
  };
  */
};

// Existing auth logic (if any) would go here or be imported

// --- Authentication Functions (Potentially use NextAuth.js) ---

// Define a type for the auth object to ensure consistency
type AuthFunctions = {
  auth: () => Promise</*Session |*/ null>; // Commented out Session type
  signIn: (provider?: string, options?: Record<string, unknown>) => Promise<any>; // Simplified type
  signOut: (options?: Record<string, unknown>) => Promise<any>; // Simplified type
};

// Default object if auth is not initialized (prevents runtime errors)
const defaultAuthObject: AuthFunctions = {
  auth: async () => {
    console.warn("Auth function called but NextAuth might not be initialized.");
    return null;
  },
  signIn: async () => { throw new Error("Sign In not initialized"); },
  signOut: async () => { throw new Error("Sign Out not initialized"); },
};

// Attempt to initialize auth, but catch errors if dependencies are missing
let realAuthObject: AuthFunctions | null = null;
try {
    // Initialize NextAuth with options to get handlers/helpers
    // const { handlers, auth, signIn, signOut } = NextAuth(authOptions); // Commented out
    // Assign the actual functions to the realAuthObject
    realAuthObject = {
        auth: async () => null, // Mock implementation
        signIn: async () => { throw new Error("Auth not initialized"); },
        signOut: async () => { throw new Error("Auth not initialized"); },
    };
} catch (error) {
  console.warn("Could not initialize NextAuth, using default auth stubs:", error);
  // Fallback to default stubs if initialization fails
}

// Export the correct auth functions (either real or stubs)
const selectedAuth = realAuthObject || defaultAuthObject;

// export const auth = selectedAuth.auth; // Already defined above
export const signIn = selectedAuth.signIn;
export const signOut = selectedAuth.signOut;

// Additional helper functions (if any)
export async function getCurrentUser(): Promise<{ id: string; name: string; email: string; role: UserRole } | null> {
  // Get session data (type is simplified as 'any' since NextAuth is removed)
  const session: any | null = await auth(); 
  
  // Basic check if user data exists
  if (!session?.user) return null; 

  // Return mock or extracted user data
  return {
    id: session.user.id || 'mock-id', 
    name: session.user.name || 'Mock User',
    email: session.user.email || 'mock@example.com',
    role: session.user.role || UserRole.USER, 
  };
}

// Existing auth logic (if any) would go here or be imported
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
    auth: async (): Promise<any | null> => process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ? mockSession : null,
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

// Note: We are not exporting GET/POST handlers from here by default,
// the API route app/api/auth/[...nextauth]/route.ts handles that. 