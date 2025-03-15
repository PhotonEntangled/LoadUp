import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { signInUser } from "./supabase";

// Define role types
export type UserRole = 'admin' | 'driver' | 'customer';

// Define role-based route access
const roleBasedAccess: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'driver', 'customer'],
  '/dashboard/admin': ['admin'],
  '/dashboard/drivers': ['admin'],
  '/dashboard/customers': ['admin'],
  '/dashboard/shipments': ['admin', 'driver'],
  '/dashboard/settings': ['admin'],
  '/dashboard/profile': ['admin', 'driver', 'customer'],
};

// Helper function to check if a user has access to a route
const hasAccess = (pathname: string, userRole?: string): boolean => {
  // Check exact path match
  if (roleBasedAccess[pathname] && userRole) {
    return roleBasedAccess[pathname].includes(userRole as UserRole);
  }
  
  // Check parent paths
  for (const path in roleBasedAccess) {
    if (pathname.startsWith(path) && userRole) {
      return roleBasedAccess[path].includes(userRole as UserRole);
    }
  }
  
  // Public routes
  return !pathname.startsWith('/dashboard');
};

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "customer";
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      
      // If not logged in and trying to access a protected route
      if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        return false;
      }
      
      // If logged in, check role-based access
      if (isLoggedIn) {
        const userRole = auth.user.role;
        return hasAccess(pathname, userRole);
      }
      
      // Public routes
      return true;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        try {
          const { data, error } = await signInUser({
            email: parsedCredentials.data.email,
            password: parsedCredentials.data.password,
          });

          if (error || !data.user) {
            return null;
          }

          // Extract user data from Supabase response
          const { user } = data;
          
          // Get role from user metadata or default to customer
          const role = user.user_metadata?.role || "customer";
          
          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
}; 