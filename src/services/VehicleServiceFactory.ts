import { createMockVehicleService } from './MockVehicleService';
import { createVehicleTrackingService } from './VehicleTrackingService';
import { Vehicle, RealVehicle } from '../types/vehicle';

/**
 * Interface for store actions both services need.
 * 
 * NOTE: There are TWO distinct RealVehicle types in the codebase:
 * 1. src/types/vehicle.ts (RealVehicle) - Used by tracking services
 * 2. src/store/map/useVehicleStore.ts (RealVehicle) - Used by the vehicle store
 * 
 * This interface expects the RealVehicle from the types directory.
 * When implementing this interface with useVehicleStore, use
 * the VehicleTypeAdapter to convert between these types.
 * 
 * @see src/adapters/VehicleTypeAdapter.ts
 */
export interface VehicleStoreActions {
  updateVehicleBatch: (updates: Record<string, RealVehicle>) => void;
  setIsConnected: (isConnected: boolean) => void;
  setLastServerSync: (time: Date) => void;
  resetConnectionAttempts: () => void;
  incrementConnectionAttempts: () => void;
  removeVehicle: (id: string) => void;
}

/**
 * Types of vehicle tracking services available
 */
export enum VehicleServiceType {
  FIREBASE = 'firebase',
  MOCK = 'mock'
}

/**
 * Common interface for both service types
 */
export interface VehicleService {
  initialize: () => void;
  terminate: () => void;
  isConnected: () => boolean;
  reconnect: () => void;
}

/**
 * Extended interface with mock-specific methods
 */
export interface MockVehicleServiceExtended extends VehicleService {
  addVehicle: () => void;
  removeRandomVehicle: () => void;
  reset: () => void;
}

/**
 * Factory function that creates the appropriate service based on type
 */
export function createVehicleService(
  type: VehicleServiceType, 
  store: VehicleStoreActions
): VehicleService | MockVehicleServiceExtended {
  
  switch (type) {
    case VehicleServiceType.FIREBASE:
      return createVehicleTrackingService(store);
    case VehicleServiceType.MOCK:
      return createMockVehicleService(store);
    default:
      console.warn(`Unknown service type: ${type}, falling back to Firebase`);
      return createVehicleTrackingService(store);
  }
}

/**
 * React Hook for using vehicle service in components
 * @param type Service type to use
 * @param store Store actions
 */
export function useVehicleService(
  type: VehicleServiceType = VehicleServiceType.FIREBASE, 
  store: VehicleStoreActions
): VehicleService | MockVehicleServiceExtended {
  // If environment variable is set, override the type
  const serviceType = process.env.NEXT_PUBLIC_USE_MOCK_VEHICLES === 'true' 
    ? VehicleServiceType.MOCK 
    : type;
  
  return createVehicleService(serviceType, store);
}

/**
 * Type guard to check if a service is the mock extended version
 */
export function isMockService(
  service: VehicleService | MockVehicleServiceExtended
): service is MockVehicleServiceExtended {
  return 'addVehicle' in service && 'removeRandomVehicle' in service && 'reset' in service;
} 