import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { signInUser } from "./supabase";
import { UserRole } from "@/auth";

// Define role-based route access
const roleBasedAccess: Record<string, string[]> = {
  '/dashboard': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
  '/dashboard/admin': [UserRole.ADMIN],
  '/dashboard/drivers': [UserRole.ADMIN],
  '/dashboard/customers': [UserRole.ADMIN],
  '/dashboard/shipments': [UserRole.ADMIN, UserRole.DRIVER],
  '/dashboard/settings': [UserRole.ADMIN],
  '/dashboard/profile': [UserRole.ADMIN, UserRole.DRIVER, UserRole.USER],
};

// Helper function to check if a user has access to a route
const hasAccess = (pathname: string, userRole?: string): boolean => {
  // Check exact path match
  if (roleBasedAccess[pathname] && userRole) {
    return roleBasedAccess[pathname].includes(userRole);
  }
  
  // Check parent paths
  for (const path in roleBasedAccess) {
    if (pathname.startsWith(path) && userRole) {
      return roleBasedAccess[path].includes(userRole);
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
        token.id = user.id as string;
        // Convert role to UserRole enum value or default to USER
        const role = user.role || "user";
        token.role = (role === "admin" ? UserRole.ADMIN : 
                     role === "driver" ? UserRole.DRIVER : 
                     UserRole.USER) as UserRole;
        token.email = user.email as string;
        token.name = user.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
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