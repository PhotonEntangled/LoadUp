import NextAuth, { User, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyCredentials } from "./lib/db-auth";

// Extend the User type to include our custom fields
interface ExtendedUser extends User {
  role?: string;
  fullName?: string;
}

// Extend the session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      fullName?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await verifyCredentials(credentials.email, credentials.password);
          
          if (!user) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.fullName || "",
            fullName: user.fullName || "",
            role: user.role,
          } as ExtendedUser;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as ExtendedUser).role;
        token.fullName = (user as ExtendedUser).fullName;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.fullName = token.fullName as string;
      }

      return session;
    },
  },
}); 