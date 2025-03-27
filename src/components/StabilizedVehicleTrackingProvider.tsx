import React, { useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';
import { VehicleService, VehicleStoreActions } from '../services/VehicleServiceFactory';
import { createSimpleMockVehicleService } from '../services/SimpleMockVehicleService';
import { getMapboxPublicToken } from '../utils/mapbox-token';
import mapboxgl from 'mapbox-gl';

// Define the extended service interface to include the SimpleMockVehicleService methods
interface ExtendedMockVehicleService extends VehicleService {
  setMovementEnabled: (enabled: boolean) => void;
  setVehicleStatus: (status: string) => void;
  moveToPostOffice: (index: number) => void;
}

// Type guard to check if a service is the extended mock service
function isExtendedMockService(
  service: VehicleService | null
): service is ExtendedMockVehicleService {
  return service !== null && 'setMovementEnabled' in service;
}

interface StabilizedVehicleTrackingProviderProps {
  children: React.ReactNode;
}

// Add console logs for debugging
const debugMapboxToken = () => {
  const token = getMapboxPublicToken();
  console.log('[DEBUG] Mapbox token from utility:', token?.substring(0, 10) + '...');
  console.log('[DEBUG] Current mapboxgl.accessToken:', mapboxgl.accessToken?.substring(0, 10) + '...');
}

/**
 * Stabilized version of VehicleTrackingProvider that only uses SimpleMockVehicleService
 * with proper ref handling to prevent infinite render loops.
 */
export const StabilizedVehicleTrackingProvider: React.FC<StabilizedVehicleTrackingProviderProps> = React.memo(({ children }) => {
  // Use refs to prevent re-renders and break circular dependencies
  const serviceRef = useRef<VehicleService | null>(null);
  const storeRef = useRef(useUnifiedVehicleStore.getState());
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  // Cache store selectors - this will only run once during component mount
  const store = useMemo<VehicleStoreActions>(() => ({
    updateVehicleBatch: storeRef.current.updateVehicleBatch,
    setIsConnected: storeRef.current.setIsConnected,
    setLastServerSync: storeRef.current.setLastServerSync,
    resetConnectionAttempts: storeRef.current.resetConnectionAttempts,
    incrementConnectionAttempts: storeRef.current.incrementConnectionAttempts,
    removeVehicle: storeRef.current.removeVehicle,
  }), []);

  // CRITICAL FIX: Use useLayoutEffect instead of useEffect to ensure service is initialized
  // before children are rendered - this prevents render phase issues
  useLayoutEffect(() => {
    // Guard against re-initialization
    if (initializedRef.current || initializingRef.current) {
      return;
    }

    // Mark initialization in progress
    initializingRef.current = true;
    
    try {
      console.log('[StabilizedVehicleTrackingProvider] Initializing simple mock service');
      serviceRef.current = createSimpleMockVehicleService(store);
      
      // Initialize the service
      serviceRef.current.initialize();
      
      // If we have the extended mock service, enable movement using the type guard
      if (isExtendedMockService(serviceRef.current)) {
        serviceRef.current.setMovementEnabled(true);
      }
      
      // IMPORTANT: We'll avoid the problematic dynamic import that's failing
      // The mapStore sync will be handled directly in the SimulationFromShipmentService
      console.log('[StabilizedVehicleTrackingProvider] Service initialized successfully');
      initializedRef.current = true;
    } catch (error) {
      console.error('[StabilizedVehicleTrackingProvider] Failed to initialize service:', error);
    } finally {
      // Mark initialization complete
      initializingRef.current = false;
    }

    // Cleanup function
    return () => {
      if (serviceRef.current) {
        console.log('[StabilizedVehicleTrackingProvider] Cleaning up service');
        serviceRef.current.terminate();
        serviceRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Log the token information when the component mounts
    debugMapboxToken();
  }, []);

  // Add debug information in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[StabilizedVehicleTrackingProvider] Running with simplified mock service');
  }

  // CRITICAL FIX: Memoize children to prevent unnecessary re-renders
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <div data-testid="vehicle-tracking-provider">
      {memoizedChildren}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-2 bg-green-100 text-green-800 text-xs rounded shadow">
          Test Vehicle Active
        </div>
      )}
    </div>
  );
});

// Add display name for React DevTools
StabilizedVehicleTrackingProvider.displayName = 'StabilizedVehicleTrackingProvider';

export default StabilizedVehicleTrackingProvider; 