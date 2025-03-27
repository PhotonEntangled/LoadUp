import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  DRIVER = "driver",
  USER = "user",
}

// Define custom user type
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Extend the session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// Define the auth configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth.ts: authorize called with credentials:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth.ts: Missing email or password');
          return null;
        }

        try {
          // Mock authentication for testing
          if (credentials.email === "admin@loadup.com" && credentials.password === "admin123") {
            console.log('Auth.ts: Admin login successful');
            return {
              id: "1",
              name: "Admin User",
              email: credentials.email,
              role: UserRole.ADMIN,
            };
          }
          
          if (credentials.email === "driver@loadup.com" && credentials.password === "driver123") {
            console.log('Auth.ts: Driver login successful');
            return {
              id: "2",
              name: "Driver User",
              email: credentials.email,
              role: UserRole.DRIVER,
            };
          }
          
          if (credentials.email === "user@loadup.com" && credentials.password === "user123") {
            console.log('Auth.ts: User login successful');
            return {
              id: "3",
              name: "Regular User",
              email: credentials.email,
              role: UserRole.USER,
            };
          }
          
          console.log('Auth.ts: Invalid credentials for:', credentials.email);
          console.log('Auth.ts: Expected admin@loadup.com/admin123 or driver@loadup.com/driver123');
          return null;
        } catch (error) {
          console.error('Auth.ts: Error in authorize function:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        console.log('Auth.ts: JWT callback with user:', user.email);
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id && token.role) {
        console.log('Auth.ts: Session callback with token:', token.email);
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  debug: true, // Enable debug mode to see more detailed logs
}); 