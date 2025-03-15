// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-mapbox-token';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 