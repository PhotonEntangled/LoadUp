/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    // Handle file extensions for relative imports
    // For NodeNext resolution, we need to preserve the extension
    '^(\\.{1,2}/.*)\\.js$': '$1.js',
    '^(\\.{1,2}/.*)\\.ts$': '$1.ts',
    '^(\\.{1,2}/.*)\\.tsx$': '$1.tsx',
    
    // Handle CSS and asset imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Handle wildcard imports - more specific pattern first
    '@/services/(.*)$': '<rootDir>/services/$1',
    
    // Package aliases
    '^@loadup/api$': '<rootDir>/packages/api/src',
    '^@loadup/api/(.*)$': '<rootDir>/packages/api/src/$1',
    '^@loadup/database$': '<rootDir>/packages/database/src',
    '^@loadup/database/(.*)$': '<rootDir>/packages/database/src/$1',
    '^@loadup/db$': '<rootDir>/packages/db/src',
    '^@loadup/db/(.*)$': '<rootDir>/packages/db/src/$1',
    '^@loadup/shared$': '<rootDir>/packages/shared/src',
    '^@loadup/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    
    // App aliases
    '^@admin/(.*)$': '<rootDir>/apps/admin-dashboard/$1',
    '^@admin-app$': '<rootDir>/apps/admin-dashboard',
    '^@driver/(.*)$': '<rootDir>/apps/driver-app/$1',
    '^@driver-app$': '<rootDir>/apps/driver-app',
    
    // Root level aliases - standardized to match tsconfig.json exactly
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        allowImportingTsExtensions: true,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/e2e/',
    // '<rootDir>/__tests__/components/DocumentScanner.test.tsx', // Uncomment to skip this test
    '<rootDir>/__tests__/components/MapView.test.tsx',
    '<rootDir>/__tests__/api/shipments.test.ts',
    '<rootDir>/tests/components/ExcelUploader.test.tsx',
    '<rootDir>/tests/components/ValidationInterface.test.tsx',
    '<rootDir>/packages/api/src/__tests__/security.test.ts',
    '<rootDir>/__tests__/components/ShipmentsPage.test.tsx',
    '<rootDir>/__tests__/security/auth.security.test.ts',
  ],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // Configure different test environments based on file patterns
  projects: [
    {
      displayName: 'node',
      testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.simple.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'jsdom',
      testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/**/*.simple.test.tsx'],
      testEnvironment: 'jsdom',
    }
  ]
}; 