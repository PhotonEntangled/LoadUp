import { Vehicle as AppVehicle, VehicleType, VehicleStatus } from '../store/map/useVehicleStore';
import { LocationData } from '../store/map/useLocationStore';

// Import the external Vehicle type from the shared package
import { Vehicle as SharedVehicle } from '../../packages/shared/src/types/shipment-tracking';

/**
 * Converts a shared Vehicle type to our application's internal Vehicle type
 * This allows us to adapt between the different data models
 */
export function convertToAppVehicle(sharedVehicle: SharedVehicle): AppVehicle {
  // Default values for required fields
  const defaultStatus: VehicleStatus = 'active';
  const truckType: VehicleType = 'truck';
  
  return {
    id: sharedVehicle.id,
    name: sharedVehicle.name || 'Unknown Vehicle',
    type: truckType,
    status: defaultStatus,
    driverId: '',  // Not available in shared type
    currentShipmentId: undefined,  // Not available in shared type
    plateNumber: sharedVehicle.licensePlate || '',
    isAvailable: true,
  };
}

/**
 * Get location data from a shared vehicle
 */
export function extractLocationData(sharedVehicle: SharedVehicle): LocationData | undefined {
  if (!sharedVehicle.currentLocation) return undefined;
  
  return {
    latitude: sharedVehicle.currentLocation.latitude,
    longitude: sharedVehicle.currentLocation.longitude,
    heading: sharedVehicle.currentLocation.heading,
    speed: sharedVehicle.currentLocation.speed,
    timestamp: sharedVehicle.currentLocation.timestamp.getTime(), // Convert Date to number
  };
}

/**
 * Converts an array of shared Vehicles to app Vehicles
 */
export function convertToAppVehicles(sharedVehicles: SharedVehicle[]): AppVehicle[] {
  return sharedVehicles.map(convertToAppVehicle);
}

/**
 * Extract location data from an array of shared vehicles
 */
export function extractLocationsFromVehicles(sharedVehicles: SharedVehicle[]): Record<string, LocationData> {
  const result: Record<string, LocationData> = {};
  
  sharedVehicles.forEach(vehicle => {
    if (vehicle.currentLocation) {
      result[vehicle.id] = {
        latitude: vehicle.currentLocation.latitude,
        longitude: vehicle.currentLocation.longitude,
        heading: vehicle.currentLocation.heading,
        speed: vehicle.currentLocation.speed,
        timestamp: vehicle.currentLocation.timestamp.getTime(), // Convert Date to number
      };
    }
  });
  
  return result;
}

/**
 * Converts our app Vehicle type to the shared Vehicle type
 * Used when we need to send data back to other parts of the application
 */
export function convertToSharedVehicle(appVehicle: AppVehicle, locationData?: LocationData): SharedVehicle {
  return {
    id: appVehicle.id,
    name: appVehicle.name,
    licensePlate: appVehicle.plateNumber,
    type: 'truck' as const, // Shared vehicle type
    currentLocation: locationData ? {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: new Date(locationData.timestamp), // Convert number to Date
      heading: locationData.heading,
      speed: locationData.speed,
    } : undefined,
  };
}

/**
 * Converts an array of app Vehicles to shared Vehicles
 */
export function convertToSharedVehicles(appVehicles: AppVehicle[], locationMap: Record<string, LocationData> = {}): SharedVehicle[] {
  return appVehicles.map(vehicle => convertToSharedVehicle(vehicle, locationMap[vehicle.id]));
} 