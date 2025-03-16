import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
    ssl: process.env.NODE_ENV === 'production',
  },
  environment: process.env.NODE_ENV || 'development',
}; 