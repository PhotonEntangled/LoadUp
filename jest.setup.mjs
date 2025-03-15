import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import '@testing-library/jest-dom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Increase timeout for database operations
jest.setTimeout(30000);

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock react-native-maps
const mockMapView = async () => {
  const React = (await import('react')).default;
  
  class MockMapView extends React.Component {
    render() {
      return React.createElement('div', this.props, this.props.children);
    }
  }
  
  class MockMarker extends React.Component {
    render() {
      return React.createElement('div', this.props, this.props.children);
    }
  }
  
  MockMapView.Marker = MockMarker;
  
  return {
    __esModule: true,
    default: MockMapView,
  };
};

jest.mock('react-native-maps', () => mockMapView());

// Mock mapbox-gl
jest.mock('mapbox-gl', () => ({
  Map: class {
    on() { return this; }
    remove() {}
  },
  Marker: class {
    setLngLat() { return this; }
    addTo() { return this; }
    remove() {}
  },
  NavigationControl: class {},
}));

// Mock @mapbox/mapbox-sdk
jest.mock('@mapbox/mapbox-sdk', () => ({
  __esModule: true,
  default: () => ({
    geocoding: () => ({
      forwardGeocode: () => ({
        send: () => Promise.resolve({
          body: {
            features: [
              {
                center: [-73.935242, 40.730610],
                place_name: 'New York, NY, USA',
              },
            ],
          },
        }),
      }),
    }),
  }),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}));

// Set environment variables for testing
process.env.MAPBOX_API_KEY = 'test_mapbox_key';
process.env.GOOGLE_CLOUD_VISION_API_KEY = 'test_vision_key';
process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';

// Suppress React Native warnings
global.console.warn = jest.fn();

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 