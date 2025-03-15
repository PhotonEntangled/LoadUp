// This file defines NextAuth JWT types for our application

import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    email?: string;
    name?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}

// Define a Session type that matches what our middleware expects
export interface Session {
  user: {
    id: string;
    email?: string;
    name?: string;
    role: string;
  };
  expires: string;
} 