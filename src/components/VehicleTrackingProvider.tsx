import React, { useEffect, useRef, useMemo } from 'react';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';
import { VehicleService, VehicleStoreActions } from '../services/VehicleServiceFactory';
import { createMockVehicleService } from '../services/MockVehicleService';
import { RealVehicle } from '../types/vehicle';

interface VehicleTrackingProviderProps {
  children: React.ReactNode;
}

/**
 * Minimal version of VehicleTrackingProvider with tracking functionality
 * temporarily disabled for debugging.
 */
export const VehicleTrackingProvider: React.FC<VehicleTrackingProviderProps> = ({ children }) => {
  // Use refs to prevent re-renders and break circular dependencies
  const serviceRef = useRef<VehicleService | null>(null);
  const storeRef = useRef(useUnifiedVehicleStore.getState());

  // Cache store selectors
  const store = useMemo<VehicleStoreActions>(() => ({
    updateVehicleBatch: storeRef.current.updateVehicleBatch,
    setIsConnected: storeRef.current.setIsConnected,
    setLastServerSync: storeRef.current.setLastServerSync,
    resetConnectionAttempts: storeRef.current.resetConnectionAttempts,
    incrementConnectionAttempts: storeRef.current.incrementConnectionAttempts,
    removeVehicle: storeRef.current.removeVehicle,
  }), []);

  // Initialize service in useEffect to avoid render-time side effects
  useEffect(() => {
    if (serviceRef.current) {
      return; // Service already initialized
    }

    try {
      // Force mock mode in development
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true') {
        console.log('[VehicleTrackingProvider] Initializing mock service');
        serviceRef.current = createMockVehicleService(store);
      } else {
        throw new Error('Firebase service disabled in safe mode');
      }

      // Initialize the service
      serviceRef.current.initialize();
      console.log('[VehicleTrackingProvider] Service initialized successfully');
    } catch (error) {
      console.error('[VehicleTrackingProvider] Failed to initialize service:', error);
      // Fallback to mock service on error
      serviceRef.current = createMockVehicleService(store);
    }

    // Cleanup function
    return () => {
      if (serviceRef.current) {
        console.log('[VehicleTrackingProvider] Cleaning up service');
        serviceRef.current.terminate();
      }
    };
  }, []); // Empty dependency array since we use refs

  // Add debug information in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[VehicleTrackingProvider] Running in safe mode');
  }

  return (
    <div data-testid="vehicle-tracking-provider">
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded shadow">
          Safe Mode Active
        </div>
      )}
    </div>
  );
};

// Add display name for React DevTools
VehicleTrackingProvider.displayName = 'VehicleTrackingProvider';

export default VehicleTrackingProvider; 