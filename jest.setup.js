// Mock for crypto.subtle
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: async () => {
        return new Uint8Array([1, 2, 3, 4, 5]);
      }
    }
  }
});

// Custom matcher for valid email format
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid email address`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid email address`,
        pass: false
      };
    }
  }
});

// Add Jest setup code here
require('@testing-library/jest-dom');

// Set up environment variables for testing
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    // Create a standard img element instead of using JSX
    const img = document.createElement('img');
    Object.assign(img, props);
    img.alt = props.alt || '';
    return img;
  },
}));

// Set up global fetch mock
global.fetch = jest.fn();

// Suppress console errors during tests
console.error = jest.fn();

// Global setup
beforeAll(() => {
  // Add any global setup here
});

// Global teardown
afterAll(() => {
  // Add any global teardown here
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 