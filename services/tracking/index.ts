import { LiveTrackingService } from './LiveTrackingService';
import { liveTrackingService } from './FirestoreLiveTrackingService';
import { mockLiveTrackingService } from './MockLiveTrackingService';
import { logger } from '@/utils/logger';

/**
 * Factory function to get the appropriate tracking service based on configuration
 * Allows switching between firebase and mock implementations
 */
export function getTrackingService(): LiveTrackingService {
  // Check for mock mode flag
  const useMockMode = 
    process.env.NEXT_PUBLIC_USE_MOCK_ONLY_MODE === 'true' || 
    process.env.USE_MOCK_ONLY_MODE === 'true';
    
  if (useMockMode) {
    logger.info('[Tracking] Using MOCK tracking service');
    return mockLiveTrackingService;
  }
  
  // Check for required Firebase config
  const hasFirebaseConfig = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  
  if (!hasFirebaseConfig) {
    logger.warn('[Tracking] Firebase config missing - falling back to MOCK service');
    return mockLiveTrackingService;
  }
  
  // Use Firebase implementation
  logger.info('[Tracking] Using Firebase tracking service');
  return liveTrackingService;
}

// Export singleton instance for convenience
export const trackingService = getTrackingService(); 