import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Provide fallbacks for missing variables in development
if (env.NODE_ENV === 'development') {
  if (!env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using mock data');
  }
  if (!env.NEXTAUTH_SECRET) {
    console.warn('NEXTAUTH_SECRET not set, authentication will not work properly');
  }
}

// Export environment variables
export default {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: parseInt(env.PORT, 10),
  databaseUrl: env.DATABASE_URL,
  nextAuthSecret: env.NEXTAUTH_SECRET,
  nextAuthUrl: env.NEXTAUTH_URL,
}; 