import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Add development bypass for easier testing
const createBypassAuth = () => {
  // Mock session for development
  const mockSession = {
    user: {
      id: "dev-user-id",
      name: "Development User",
      email: "dev@example.com",
      role: "admin",
      image: null
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  // Create bypass functions
  return {
    auth: async () => process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ? mockSession : null,
    signIn: async () => ({ success: true }),
    signOut: async () => ({ success: true })
  };
};

// Choose between real auth and bypass auth
export const { auth, signIn, signOut } = 
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" 
    ? createBypassAuth() 
    : NextAuth(authConfig); 