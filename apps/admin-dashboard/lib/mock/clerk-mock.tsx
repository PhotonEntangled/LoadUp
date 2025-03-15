import React from 'react';

/**
 * Mock implementations of Clerk hooks and functions for development mode
 * This allows the application to run without Clerk in development
 */

// Mock user data
const mockUser = {
  id: 'mock-user-id',
  email: 'admin@example.com',
  role: 'admin',
};

// Mock useAuth hook
export function useClerkAuth() {
  return {
    userId: mockUser.id,
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => 'mock-token',
    sessionId: 'mock-session-id',
    sessionClaims: { role: mockUser.role },
  };
}

// Mock auth function for API routes
export function auth() {
  return {
    userId: mockUser.id,
    sessionClaims: { role: mockUser.role },
  };
}

// Mock useClerk hook
export function useClerk() {
  return {
    signOut: async () => console.log('Mock sign out'),
    openSignIn: () => console.log('Mock open sign in'),
    openSignUp: () => console.log('Mock open sign up'),
    session: {
      id: 'mock-session-id',
      status: 'active',
    },
    user: {
      id: mockUser.id,
      primaryEmailAddress: { emailAddress: mockUser.email },
      fullName: 'Mock Admin',
    },
  };
}

// Mock SignIn component
export function SignIn({ appearance }: any) {
  return null; // This will be replaced with a custom sign-in form in development
}

// Mock SignUp component
export function SignUp({ appearance }: any) {
  return null; // This will be replaced with a custom sign-up form in development
}

// Mock ClerkProvider
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 