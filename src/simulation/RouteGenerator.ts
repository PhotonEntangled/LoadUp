/**
 * RouteGenerator
 * 
 * Utility for creating test routes in the Kuala Lumpur area.
 * This module generates realistic routes with multiple stops for simulation.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  SimulationRoute, 
  SimulationStop,
  SimulationVehicle
} from '../types/simulation';
import { 
  KUALA_LUMPUR_LOCATIONS,
  KUALA_LUMPUR_CENTER,
  generateRandomPoint
} from '../utils/geoUtils';

/**
 * Generate a random route with multiple stops
 * @param stopCount Number of stops to include (defaults to 2-5)
 * @param usePredefinedLocations Whether to use predefined locations or random ones
 * @returns A complete route with stops
 */
export const generateRandomRoute = (
  stopCount?: number,
  usePredefinedLocations = true
): SimulationRoute => {
  // Determine number of stops if not specified
  const numStops = stopCount || Math.floor(Math.random() * 4) + 2; // 2-5 stops
  
  // Generate the stops
  const stops: SimulationStop[] = [];
  const usedLocationIndices = new Set<number>();
  
  for (let i = 0; i < numStops; i++) {
    let stop: SimulationStop;
    
    if (usePredefinedLocations) {
      // Use predefined locations, avoiding duplicates
      let locationIndex: number;
      do {
        locationIndex = Math.floor(Math.random() * KUALA_LUMPUR_LOCATIONS.length);
      } while (usedLocationIndices.has(locationIndex));
      
      usedLocationIndices.add(locationIndex);
      const location = KUALA_LUMPUR_LOCATIONS[locationIndex];
      
      stop = createStop({
        type: location.type,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.name
        }
      });
    } else {
      // Generate a random location within 20km of KL center
      const randomLocation = generateRandomPoint(
        KUALA_LUMPUR_CENTER.latitude,
        KUALA_LUMPUR_CENTER.longitude,
        20 // 20km radius around KL
      );
      
      // First stop is pickup, last is delivery, others are waypoints
      const stopType = i === 0 
        ? 'pickup' 
        : i === numStops - 1 
          ? 'delivery' 
          : Math.random() > 0.5 ? 'pickup' : 'delivery';
      
      stop = createStop({
        type: stopType,
        location: {
          latitude: randomLocation.latitude,
          longitude: randomLocation.longitude
        }
      });
    }
    
    stops.push(stop);
  }
  
  // Create start and end times
  const now = new Date();
  const startTime = now;
  const estimatedEndTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later
  
  return {
    id: uuidv4(),
    stops,
    currentStopIndex: 0,
    completed: false,
    startTime,
    estimatedEndTime
  };
};

/**
 * Create a delivery route from a warehouse to multiple delivery locations
 * @param deliveryLocations Array of delivery location indices (from KUALA_LUMPUR_LOCATIONS)
 * @param warehouseIndex Index of the warehouse location (from KUALA_LUMPUR_LOCATIONS)
 * @returns A complete delivery route
 */
export const createDeliveryRoute = (
  deliveryLocations: number[] = [2, 3, 5, 8], // Default to some delivery spots
  warehouseIndex: number = 4 // Default to Shah Alam as warehouse
): SimulationRoute => {
  const stops: SimulationStop[] = [];
  
  // Add warehouse as first stop (pickup)
  const warehouse = KUALA_LUMPUR_LOCATIONS[warehouseIndex];
  stops.push(createStop({
    type: 'pickup',
    location: {
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
      address: warehouse.name + ' (Warehouse)'
    }
  }));
  
  // Add delivery locations
  for (const locationIndex of deliveryLocations) {
    const location = KUALA_LUMPUR_LOCATIONS[locationIndex];
    stops.push(createStop({
      type: 'delivery',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.name
      }
    }));
  }
  
  // Create start and end times
  const now = new Date();
  const startTime = now;
  // Estimate 30 minutes per stop
  const estimatedEndTime = new Date(
    now.getTime() + (stops.length * 30 * 60 * 1000)
  );
  
  return {
    id: uuidv4(),
    stops,
    currentStopIndex: 0,
    completed: false,
    startTime,
    estimatedEndTime
  };
};

/**
 * Create a pickup route starting from HQ and visiting multiple pickup locations
 * @param pickupLocations Array of pickup location indices (from KUALA_LUMPUR_LOCATIONS)
 * @param hqIndex Index of the HQ location (from KUALA_LUMPUR_LOCATIONS)
 * @returns A complete pickup route
 */
export const createPickupRoute = (
  pickupLocations: number[] = [0, 1, 7], // Default to some pickup spots
  hqIndex: number = 6 // Default to Putrajaya as HQ
): SimulationRoute => {
  const stops: SimulationStop[] = [];
  
  // Add HQ as first stop (start point)
  const hq = KUALA_LUMPUR_LOCATIONS[hqIndex];
  stops.push(createStop({
    type: 'waypoint',
    location: {
      latitude: hq.latitude,
      longitude: hq.longitude,
      address: hq.name + ' (HQ)'
    }
  }));
  
  // Add pickup locations
  for (const locationIndex of pickupLocations) {
    const location = KUALA_LUMPUR_LOCATIONS[locationIndex];
    stops.push(createStop({
      type: 'pickup',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.name
      }
    }));
  }
  
  // Add HQ as final stop (return point)
  stops.push(createStop({
    type: 'delivery',
    location: {
      latitude: hq.latitude,
      longitude: hq.longitude,
      address: hq.name + ' (HQ Return)'
    }
  }));
  
  // Create start and end times
  const now = new Date();
  const startTime = now;
  // Estimate 30 minutes per stop
  const estimatedEndTime = new Date(
    now.getTime() + (stops.length * 30 * 60 * 1000)
  );
  
  return {
    id: uuidv4(),
    stops,
    currentStopIndex: 0,
    completed: false,
    startTime,
    estimatedEndTime
  };
};

/**
 * Helper function to create a stop with default values
 * @param partial Partial stop data
 * @returns Complete stop object
 */
const createStop = (partial: Partial<SimulationStop>): SimulationStop => {
  return {
    id: uuidv4(),
    type: partial.type || 'delivery',
    location: partial.location || { ...KUALA_LUMPUR_CENTER },
    completed: false,
    geofenceRadius: partial.geofenceRadius || 100, // Default 100m radius
    arrivalTime: partial.arrivalTime,
    departureTime: partial.departureTime
  };
};

/**
 * Generate a test vehicle with a random route
 * @returns Vehicle data with route
 */
export const generateTestVehicle = (
  vehicleType: 'truck' | 'van' | 'motorcycle' = 'truck'
): SimulationVehicle => {
  return {
    id: uuidv4(),
    type: vehicleType,
    status: 'moving',
    location: { ...KUALA_LUMPUR_CENTER },
    heading: 0,
    speed: vehicleType === 'truck' ? 40 : vehicleType === 'van' ? 50 : 60,
    route: generateRandomRoute(),
    driver: {
      id: uuidv4(),
      name: getRandomDriverName()
    }
  };
};

/**
 * Generate a random Malaysian driver name
 * @returns A random Malaysian name
 */
const getRandomDriverName = (): string => {
  const malayNames = [
    'Ahmad Bin Abdullah',
    'Muhammad Bin Ibrahim',
    'Ali Bin Hassan',
    'Siti Binti Omar',
    'Nurul Binti Razak',
    'Noor Binti Rahman',
    'Tan Wei Ming',
    'Wong Li Hua',
    'Raj Kumar',
    'Sanjay Patel',
    'Muthu Krishnan',
    'Lee Chong Wei',
    'Rajesh Singh',
    'Gopal Ramachandran',
    'Aminah Binti Ismail'
  ];
  
  return malayNames[Math.floor(Math.random() * malayNames.length)];
}; 