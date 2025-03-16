import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "../../../../lib/hooks/useAuth";

// Create a simple auth handler with basic configuration
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Mock authentication for testing
        if (credentials.email === "admin@loadup.com" && credentials.password === "admin123") {
          return {
            id: "1",
            name: "Admin User",
            email: credentials.email,
            role: UserRole.ADMIN,
          };
        }
        
        if (credentials.email === "driver@loadup.com" && credentials.password === "driver123") {
          return {
            id: "2",
            name: "Driver User",
            email: credentials.email,
            role: UserRole.DRIVER,
          };
        }
        
        if (credentials.email === "user@loadup.com" && credentials.password === "user123") {
          return {
            id: "3",
            name: "Regular User",
            email: credentials.email,
            role: UserRole.USER,
          };
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
});

export { handler as GET, handler as POST };
