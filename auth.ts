import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the User type to include role
interface CustomUser extends User {
  role?: string;
}

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// Mock database functions for now
const mockUserData = [
  {
    id: "1",
    email: "admin@loadup.com",
    password: "$2a$10$GQH.xZm5DqJu8HxEIq1jPuK6x5YmP5kQZZBz3Vz9BjM0mD1qpLmXa", // hashed "password123"
    name: "Admin User",
    role: "admin",
  },
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Mock database query
        const user = mockUserData.find(
          (user) => user.email === credentials.email
        );

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as CustomUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
}); 