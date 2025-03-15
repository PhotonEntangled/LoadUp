/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/admin-dashboard/$1',
    '^@loadup/(.*)$': '<rootDir>/packages/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'apps/admin-dashboard/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  verbose: true,
};

module.exports = config; 