import { useEffect } from 'react';
import { initSentry } from './utils/sentry.ts';

export default function RootLayout() {
  // Initialize Sentry on app startup
  useEffect(() => {
    try {
      initSentry();
      console.log('Sentry initialization attempted');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }, []);

  // Original layout code goes here
  return null; // Placeholder for actual layout
} 