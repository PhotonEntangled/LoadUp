import { jest } from '@jest/globals';
import pg from 'pg';
const { Pool } = pg;

// Mock the pg Pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock drizzle-orm with proper typing
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

// Disable TypeScript checking for these mocks as they're just for tests
// @ts-ignore -- This is a test mock
mockDb.limit.mockImplementation(() => {
  return {
    // @ts-ignore -- This is a test mock
    execute: jest.fn().mockResolvedValue([])
  };
});

// @ts-ignore -- This is a test mock
mockDb.execute.mockImplementation(() => {
  return Promise.resolve({ rows: [{ exists: true }] });
});

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(() => mockDb),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 