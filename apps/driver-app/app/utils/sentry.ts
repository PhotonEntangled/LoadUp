// @ts-ignore - Missing type declarations will be resolved when types are installed
import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking in the driver app
 */
export const initSentry = (): void => {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    
    if (!dsn) {
      console.warn('Sentry DSN not found. Error tracking is disabled.');
      return;
    }
    
    try {
      // Basic Sentry initialization without app metadata
      Sentry.init({
        dsn,
        enableAutoSessionTracking: true,
        tracesSampleRate: 1.0,
        debug: typeof __DEV__ !== 'undefined' && __DEV__,
      });
      
      // Try to load app metadata if expo-constants is available
      // @ts-ignore - Dynamic import
      import('expo-constants').then((Constants) => {
        const appVersion = Constants.default?.expoConfig?.version;
        const buildNumber = Constants.default?.expoConfig?.ios?.buildNumber || 
                           Constants.default?.expoConfig?.android?.versionCode;
        
        if (appVersion) {
          Sentry.setTag('appVersion', appVersion);
        }
        
        if (buildNumber) {
          Sentry.setTag('buildNumber', buildNumber);
        }
        
        console.log('Sentry initialized with app metadata');
      }).catch(error => {
        console.log('App metadata not available for Sentry');
      });
      
      console.log('Sentry initialized for driver app');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }
};

/**
 * Set user context in Sentry when a driver logs in
 * @param driverId - The ID of the logged-in driver
 * @param email - The email of the logged-in driver
 */
export const setDriverContext = (driverId: string, email: string): void => {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    Sentry.setUser({
      id: driverId,
      email,
    });
  }
};

/**
 * Clear user context in Sentry when a driver logs out
 */
export const clearDriverContext = (): void => {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    Sentry.setUser(null);
  }
};

/**
 * Capture an exception with Sentry
 * @param error - The error to capture
 * @param context - Additional context for the error
 */
export const captureException = (error: Error, context?: Record<string, any>): void => {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
}; 