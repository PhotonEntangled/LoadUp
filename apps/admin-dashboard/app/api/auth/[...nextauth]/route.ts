import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@loadup/database';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // This is where you would verify the user's credentials
        if (!credentials?.email || !credentials?.password) return null;

        // Example: Check against your database
        // const user = await db.query.users.findFirst({
        //   where: eq(users.email, credentials.email),
        // });

        // if (user && (await verifyPassword(credentials.password, user.password))) {
        //   return {
        //     id: user.id,
        //     email: user.email,
        //     role: user.role,
        //   };
        // }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 