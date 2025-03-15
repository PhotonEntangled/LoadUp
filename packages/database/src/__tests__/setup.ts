import { jest } from '@jest/globals';
import { Pool } from 'pg';

// Mock the pg Pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock drizzle-orm
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

mockDb.limit.mockResolvedValue([]);
mockDb.execute.mockResolvedValue({ rows: [{ exists: true }] });

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(() => mockDb),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 