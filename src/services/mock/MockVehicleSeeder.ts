/**
 * MockVehicleSeeder.ts
 * Utility for seeding the vehicle store with simulated vehicles for testing
 */

import { Vehicle, VehicleStatus, SimulatedVehicle } from '../../types/vehicle';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';

/**
 * Additional data needed for simulation
 */
export interface SimulationData {
  originName: string;
  destinationName: string;
  progress: number; // 0-100% along route
  duration: number; // seconds
  startTime: number; // timestamp
}

/**
 * Extended vehicle interface with simulation data
 */
export interface SimulatedVehicleWithData extends SimulatedVehicle {
  simulationData: SimulationData;
  // Additional properties that might be used in the vehicle creation
  capacity?: {
    maxWeight: number;
    currentWeight: number;
  };
}

/**
 * Post office locations in Kuala Lumpur for simulation origins and destinations
 */
const postOffices = [
  {
    name: 'Kuala Lumpur GPO',
    lat: 3.1493,
    lng: 101.6953
  },
  {
    name: 'Bangsar Post Office',
    lat: 3.1302,
    lng: 101.6765
  },
  {
    name: 'Damansara Heights Post Office',
    lat: 3.1589,
    lng: 101.6502
  },
  {
    name: 'Ampang Post Office',
    lat: 3.1631,
    lng: 101.7497
  }
];

/**
 * Vehicle types for simulation
 */
const vehicleTypes = ['16-wheeler', 'van', 'truck', 'pickup'];

/**
 * Status options for vehicles
 */
const vehicleStatuses: VehicleStatus[] = ['loading', 'moving', 'unloading', 'idle'];

/**
 * Emoji options for vehicle markers
 */
const vehicleEmojis = ['🚚', '🚛', '🚐', '🚗', '🚜'];

/**
 * Color options for vehicle markers and routes
 */
const colors = ['#00BFFF', '#FF6347', '#32CD32', '#FFD700', '#9370DB'];

/**
 * Utilities for throttling updates to prevent render loops
 */
const throttle = {
  lastUpdateTime: 0,
  inProgress: false,
  minInterval: 500, // Minimum time between updates in ms
  
  /**
   * Checks if an update is allowed based on time since last update
   */
  canUpdate(): boolean {
    const now = Date.now();
    if (this.inProgress) return false;
    if (now - this.lastUpdateTime < this.minInterval) return false;
    return true;
  },
  
  /**
   * Marks an update as started
   */
  startUpdate(): void {
    this.inProgress = true;
  },
  
  /**
   * Marks an update as completed
   */
  finishUpdate(): void {
    this.lastUpdateTime = Date.now();
    this.inProgress = false;
  }
};

/**
 * Utility class for seeding simulated vehicles
 */
export class MockVehicleSeeder {
  // Flag to avoid multiple simultaneous updates
  static isUpdating = false;
  
  // Interval ID for auto-updates
  static updateIntervalId: NodeJS.Timeout | null = null;
  
  /**
   * Seed a specified number of vehicles into the store
   * @param count Number of vehicles to create (default: 3)
   * @param clearExisting Whether to clear existing vehicles first (default: true)
   */
  static seed(count: number = 3, clearExisting: boolean = true): Vehicle[] {
    console.log(`[MockVehicleSeeder] Seeding ${count} vehicles (clearExisting: ${clearExisting})`);
    
    // Throttle updates to prevent render loops
    if (!throttle.canUpdate()) {
      console.log('[MockVehicleSeeder] Skipping seed operation - throttled');
      return [];
    }
    
    throttle.startUpdate();
    
    try {
      const store = useUnifiedVehicleStore.getState();
      const vehicles: SimulatedVehicleWithData[] = [];
  
      // Clear existing vehicles if requested
      if (clearExisting) {
        console.log('[MockVehicleSeeder] Clearing existing vehicles');
        // Get current vehicle IDs to remove
        const currentVehicleIds = Object.keys(store.vehicles);
        
        // Remove each vehicle individually
        currentVehicleIds.forEach(id => {
          store.removeVehicle(id);
        });
      }
  
      // Create the requested number of vehicles
      for (let i = 0; i < count; i++) {
        const id = `sim-veh-${Date.now()}-${i}`;
        
        // Pick random origin and destination post offices
        const origin = postOffices[Math.floor(Math.random() * postOffices.length)];
        let dest;
        do {
          dest = postOffices[Math.floor(Math.random() * postOffices.length)];
        } while (dest.name === origin.name);
  
        // Create route coordinates (straight line from origin to destination)
        const coordinates: [number, number][] = [
          [origin.lng, origin.lat],
          [dest.lng, dest.lat]
        ];
  
        // Randomize attributes
        const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        const status = vehicleStatuses[Math.floor(Math.random() * vehicleStatuses.length)];
        const emoji = vehicleEmojis[Math.floor(Math.random() * vehicleEmojis.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const weight = Math.floor(Math.random() * 20000 + 5000); // 5000-25000 kg
  
        // Create the vehicle object
        const vehicle: SimulatedVehicleWithData = {
          id,
          type: vehicleType,
          status: status,
          location: {
            latitude: origin.lat,
            longitude: origin.lng
          },
          heading: Math.floor(Math.random() * 360), // Random heading 0-359
          speed: status === 'moving' ? Math.random() * 80 : 0, // Random speed if moving
          isSimulated: true,
          lastUpdated: new Date(),
          routeData: {
            id: `route-${id}`,
            type: 'simulated',
            coordinates,
            color,
            width: 5,
            glow: true
          },
          capacity: {
            maxWeight: 36000000, // 36 tons in grams
            currentWeight: weight
          },
          visuals: {
            emoji,
            pulseEffect: status === 'moving',
            color
          },
          simulationData: {
            originName: origin.name,
            destinationName: dest.name,
            progress: 0, // 0-100% along route
            duration: 60 + Math.floor(Math.random() * 120), // 1-3 minutes
            startTime: new Date().getTime()
          }
        };
  
        vehicles.push(vehicle);
      }
  
      // Add all vehicles to the store in a single batch update if possible
      console.log(`[MockVehicleSeeder] Adding ${vehicles.length} vehicles to store`);
      
      if (vehicles.length > 0) {
        // Use a single requestAnimationFrame to batch all state updates
        window.requestAnimationFrame(() => {
          vehicles.forEach(vehicle => {
            store.addVehicle(vehicle);
          });
        });
      }
  
      return vehicles as Vehicle[];
    } finally {
      throttle.finishUpdate();
    }
  }

  /**
   * Update simulated vehicle positions along their routes
   * @param speedFactor Multiplier for simulation speed (default: 1)
   */
  static updatePositions(speedFactor: number = 1): void {
    // Avoid multiple simultaneous updates
    if (this.isUpdating) {
      console.log('[MockVehicleSeeder] Update already in progress, skipping');
      return;
    }
    
    // Throttle updates to prevent render loops
    if (!throttle.canUpdate()) {
      console.log('[MockVehicleSeeder] Skipping position update - throttled');
      return;
    }
    
    this.isUpdating = true;
    throttle.startUpdate();
    
    try {
      // IMPORTANT: Get state outside of React render cycle
      const store = useUnifiedVehicleStore.getState();
      const vehicles = Object.values(store.vehicles)
        .filter(v => v.isSimulated) as SimulatedVehicle[];
      
      // Filter vehicles that have simulationData
      const simulatedVehicles = vehicles.filter(v => {
        const vehicleWithData = v as unknown as SimulatedVehicleWithData;
        return vehicleWithData.simulationData !== undefined;
      }) as unknown as SimulatedVehicleWithData[];
      
      // Skip if no vehicles to update
      if (simulatedVehicles.length === 0) {
        console.log('[MockVehicleSeeder] No vehicles to update');
        return;
      }
      
      console.log(`[MockVehicleSeeder] Updating ${simulatedVehicles.length} vehicles with speed factor ${speedFactor}`);
      
      // Prepare updates to be applied in a single batch
      const updates: Record<string, Partial<Vehicle>> = {};
      
      simulatedVehicles.forEach(vehicle => {
        if (!vehicle.simulationData || !vehicle.routeData || vehicle.status !== 'moving') {
          return;
        }
        
        const { progress, duration } = vehicle.simulationData;
        const { coordinates } = vehicle.routeData;
        
        if (!coordinates || coordinates.length < 2) {
          return;
        }
        
        // Calculate new progress (0-100)
        const newProgress = Math.min(100, progress + (speedFactor * (1 / duration) * 100));
        
        // Interpolate position between origin and destination
        const origin = coordinates[0];
        const destination = coordinates[coordinates.length - 1];
        
        const newLng = origin[0] + ((destination[0] - origin[0]) * (newProgress / 100));
        const newLat = origin[1] + ((destination[1] - origin[1]) * (newProgress / 100));
        
        // Calculate heading (angle of movement)
        const heading = Math.atan2(destination[1] - origin[1], destination[0] - origin[0]) * (180 / Math.PI);
        
        // Queue update (don't apply yet)
        updates[vehicle.id] = {
          location: {
            latitude: newLat,
            longitude: newLng
          },
          heading,
          // Add simulationData with explicit type assertion
          simulationData: {
            ...vehicle.simulationData,
            progress: newProgress
          } as any // Force TypeScript to accept this property
        } as Partial<SimulatedVehicleWithData>; // Cast the entire object
      });
      
      // Apply all updates in a single batch outside of render cycle
      if (Object.keys(updates).length > 0) {
        // IMPORTANT: Use requestAnimationFrame to ensure updates happen at the right time
        // This prevents updates during React's render phase
        window.requestAnimationFrame(() => {
          // Get a fresh reference to the store to avoid stale closures
          const storeInstance = useUnifiedVehicleStore.getState();
          
          // Apply individual updates
          Object.entries(updates).forEach(([id, update]) => {
            storeInstance.updateVehicle(id, update);
          });
        });
      }
    } finally {
      this.isUpdating = false;
      throttle.finishUpdate();
    }
  }

  /**
   * Start automatic position updates with specified interval and speed
   * @param interval Update interval in milliseconds (default: 1000ms)
   * @param speedFactor Multiplier for simulation speed (default: 1)
   * @returns Function to stop the simulation
   */
  static startAutoUpdate(interval: number = 1000, speedFactor: number = 1): () => void {
    console.log(`[MockVehicleSeeder] Starting auto-update (interval: ${interval}ms, speed: ${speedFactor}x)`);
    
    // Clear any existing interval
    this.stopAutoUpdate();
    
    // IMPORTANT: Use requestAnimationFrame to schedule the first update
    // This ensures we start outside of any React render cycle
    window.requestAnimationFrame(() => {
      // Set minimum interval to prevent excessive updates
      const safeInterval = Math.max(500, interval);
      
      // Create new interval for updates
      this.updateIntervalId = setInterval(() => {
        // Schedule the actual update via requestAnimationFrame
        // This creates a double buffer that prevents React render cycle interference
        window.requestAnimationFrame(() => {
          MockVehicleSeeder.updatePositions(speedFactor);
        });
      }, safeInterval);
    });
    
    return this.stopAutoUpdate.bind(this);
  }
  
  /**
   * Stop the automatic position updates
   */
  static stopAutoUpdate(): void {
    if (this.updateIntervalId) {
      console.log('[MockVehicleSeeder] Stopping auto-update');
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }
}

export default MockVehicleSeeder; 