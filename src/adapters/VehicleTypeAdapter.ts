/**
 * Vehicle Type Adapter
 * 
 * This adapter provides conversion utilities between the two different RealVehicle types:
 * - RealVehicle from types/vehicle.ts (Firebase tracking data model)
 * - RealVehicle from store/map/useVehicleStore.ts (Store model)
 */

import { RealVehicle as TypesRealVehicle, VehicleStatus as TypesVehicleStatus, Location } from '../types/vehicle';
import { RealVehicle as StoreRealVehicle, VehicleStatus as StoreVehicleStatus } from '../store/map/useVehicleStore';

/**
 * Maps vehicle status from the types model to the store model
 */
export function mapTrackingStatusToStore(status: string): StoreVehicleStatus {
  const statusMap: Record<string, StoreVehicleStatus> = {
    'idle': 'inactive',
    'moving': 'active', 
    'loading': 'pickup',
    'unloading': 'delivery',
    'maintenance': 'maintenance'
  };
  
  return statusMap[status as TypesVehicleStatus] || 'active' as StoreVehicleStatus;
}

/**
 * Maps vehicle status from the store model to the types model
 */
export function mapStoreStatusToTracking(status: string): TypesVehicleStatus {
  const statusMap: Record<string, TypesVehicleStatus> = {
    'inactive': 'idle',
    'active': 'moving',
    'pickup': 'loading',
    'delivery': 'unloading',
    'maintenance': 'maintenance',
    'returning': 'moving',
    'offline': 'idle'
  };
  
  return statusMap[status as StoreVehicleStatus] || 'idle';
}

/**
 * Converts a tracking RealVehicle to a store RealVehicle
 * Ensures all required fields are present with defaults if necessary
 */
export function convertTrackingToStoreVehicle(vehicle: TypesRealVehicle): StoreRealVehicle {
  return {
    // Required fields with fallbacks
    id: vehicle.id || `vehicle-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: vehicle.id || 'Unnamed Vehicle',
    type: vehicle.type || 'truck',
    status: mapTrackingStatusToStore(vehicle.status || 'idle'),
    licenseNumber: vehicle.deviceId || vehicle.id || 'Unknown',
    
    // Optional tracking fields
    lastUpdate: vehicle.lastUpdated ? vehicle.lastUpdated.getTime() : Date.now(),
    lastPosition: vehicle.location ? {
      latitude: vehicle.location.latitude,
      longitude: vehicle.location.longitude
    } : undefined,
    
    // Optional metadata that might be useful
    notes: vehicle.isSimulated ? 'Simulated vehicle' : undefined,
    driverId: undefined,
    capacity: undefined,
    currentOrderId: undefined
  };
}

/**
 * Converts a batch of tracking RealVehicles to store RealVehicles
 * Handles null/undefined inputs safely
 */
export function convertTrackingBatchToStore(
  updates: Record<string, TypesRealVehicle> | null | undefined
): Record<string, StoreRealVehicle> {
  const result: Record<string, StoreRealVehicle> = {};
  
  if (!updates) {
    return result;
  }
  
  Object.entries(updates).forEach(([id, vehicle]) => {
    if (vehicle) {
      // Ensure the vehicle has an id (use the key if missing)
      const vehicleWithId = { ...vehicle, id: vehicle.id || id };
      result[id] = convertTrackingToStoreVehicle(vehicleWithId);
    }
  });
  
  return result;
}

/**
 * Converts a store RealVehicle to a tracking RealVehicle
 * Ensures all required fields are present with defaults if necessary
 */
export function convertStoreToTrackingVehicle(vehicle: StoreRealVehicle): TypesRealVehicle {
  const location: Location = vehicle.lastPosition ? {
    latitude: vehicle.lastPosition.latitude,
    longitude: vehicle.lastPosition.longitude
  } : { latitude: 0, longitude: 0 };
  
  return {
    id: vehicle.id,
    type: vehicle.type,
    status: mapStoreStatusToTracking(vehicle.status),
    isSimulated: false,
    heading: 0, // Default heading
    speed: 0,   // Default speed
    location: location,
    lastUpdated: vehicle.lastUpdate ? new Date(vehicle.lastUpdate) : new Date(),
    deviceId: vehicle.licenseNumber,
    
    // If we need to add other required fields for TypesRealVehicle, add them here
    signalStrength: Math.random() * 100 // For example, providing a default value
  };
}

/**
 * Converts a batch of store RealVehicles to tracking RealVehicles
 * Handles null/undefined inputs safely
 */
export function convertStoreBatchToTracking(
  updates: Record<string, StoreRealVehicle> | null | undefined
): Record<string, TypesRealVehicle> {
  const result: Record<string, TypesRealVehicle> = {};
  
  if (!updates) {
    return result;
  }
  
  Object.entries(updates).forEach(([id, vehicle]) => {
    if (vehicle) {
      // Ensure the vehicle has an id (use the key if missing)
      const vehicleWithId = { ...vehicle, id: vehicle.id || id };
      result[id] = convertStoreToTrackingVehicle(vehicleWithId);
    }
  });
  
  return result;
} 