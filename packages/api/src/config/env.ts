import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Provide fallbacks for missing variables in development
if (env.NODE_ENV === 'development') {
  if (!env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using mock data');
  }
  if (!env.CLERK_SECRET_KEY) {
    console.warn('CLERK_SECRET_KEY not set, authentication will not work properly');
  }
}

// Export environment variables
export default {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: parseInt(env.PORT, 10),
  databaseUrl: env.DATABASE_URL,
  clerkSecretKey: env.CLERK_SECRET_KEY,
  clerkPublishableKey: env.CLERK_PUBLISHABLE_KEY,
}; 