import { RealVehicle, VehicleStatus } from '../types/vehicle';

// Sample post office locations in Kuala Lumpur
const KL_POST_OFFICES = [
  { name: 'KL General Post Office', latitude: 3.1493, longitude: 101.6953 },
  { name: 'Damansara Heights Post Office', latitude: 3.1589, longitude: 101.6502 },
  { name: 'Bangsar Post Office', latitude: 3.1302, longitude: 101.6765 },
  { name: 'Ampang Post Office', latitude: 3.1631, longitude: 101.7497 },
  { name: 'Sentul Post Office', latitude: 3.1853, longitude: 101.6893 }
];

// Fixed vehicle status for stability (can be changed for testing different states)
const DEFAULT_VEHICLE_STATUS: VehicleStatus = 'moving';

// Interface for store actions the mock service needs
interface MockVehicleStoreActions {
  updateVehicleBatch: (updates: Record<string, RealVehicle>) => void;
  setIsConnected: (isConnected: boolean) => void;
  setLastServerSync: (time: Date) => void;
  resetConnectionAttempts: () => void;
  incrementConnectionAttempts: () => void;
  removeVehicle: (id: string) => void;
}

/**
 * Simplified service that generates a single mock vehicle for testing
 * Designed for stability and predictability
 */
export class SimpleMockVehicleService {
  private static instance: SimpleMockVehicleService | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private store: MockVehicleStoreActions;
  private movementEnabled = false;
  private mockVehicles: Record<string, RealVehicle> = {};
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor(store: MockVehicleStoreActions) {
    this.store = store;
    // No longer create default test vehicles - will be created through the shipment simulation
    console.log('[SimpleMockVehicleService] Initialized without default test vehicles');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(store: MockVehicleStoreActions): SimpleMockVehicleService {
    if (!SimpleMockVehicleService.instance) {
      SimpleMockVehicleService.instance = new SimpleMockVehicleService(store);
    }
    return SimpleMockVehicleService.instance;
  }
  
  /**
   * Start the service
   */
  public start({
    updateInterval = 3000, // Update every 3 seconds by default
    enableMovement = false // Don't move by default
  }: {
    updateInterval?: number;
    enableMovement?: boolean;
  } = {}): void {
    if (this.isRunning) {
      console.log('[SimpleMockVehicleService] Already running, ignoring start call');
      return;
    }
    
    console.log(`[SimpleMockVehicleService] Starting service, updating every ${updateInterval}ms, movement ${enableMovement ? 'enabled' : 'disabled'}`);
    
    this.movementEnabled = enableMovement;
    this.isRunning = true;
    
    // Send initial update
    this.sendUpdate();
    
    // Schedule regular updates
    this.updateInterval = setInterval(() => {
      this.sendUpdate();
    }, updateInterval);
  }
  
  /**
   * Stop the service
   */
  public stop(): void {
    console.log('[SimpleMockVehicleService] Stopping service');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
  }
  
  /**
   * Check if the service is running
   */
  public isActive(): boolean {
    return this.isRunning;
  }
  
  /**
   * Enable or disable movement simulation
   */
  public setMovementEnabled(enabled: boolean): void {
    console.log(`[SimpleMockVehicleService] Setting movement ${enabled ? 'enabled' : 'disabled'}`);
    this.movementEnabled = enabled;
  }
  
  /**
   * Add or update a mock vehicle
   */
  public addMockVehicle(vehicle: RealVehicle): void {
    console.log(`[SimpleMockVehicleService.addMockVehicle] Adding vehicle ID: ${vehicle.id}, type: ${vehicle.type}, status: ${vehicle.status}`);
    console.log(`[SimpleMockVehicleService.addMockVehicle] Vehicle location: ${JSON.stringify(vehicle.location)}`);
    
    this.mockVehicles[vehicle.id] = vehicle;
    
    // Immediately update the store
    const updates: Record<string, RealVehicle> = {
      [vehicle.id]: vehicle
    };
    
    console.log(`[SimpleMockVehicleService.addMockVehicle] Updating store with vehicle: ${vehicle.id}`);
    this.store.updateVehicleBatch(updates);
    console.log(`[SimpleMockVehicleService.addMockVehicle] Store updated, total vehicles: ${Object.keys(this.mockVehicles).length}`);
    
    // Force an immediate update to ensure the vehicle is visible
    this.sendUpdate();
  }
  
  /**
   * Remove a mock vehicle
   */
  public removeMockVehicle(id: string): void {
    delete this.mockVehicles[id];
    this.store.removeVehicle(id);
  }
  
  /**
   * Get all mock vehicles
   */
  public getMockVehicles(): RealVehicle[] {
    return Object.values(this.mockVehicles);
  }
  
  /**
   * Clear all mock vehicles
   */
  public clearMockVehicles(): void {
    // Remove each vehicle from the store
    Object.keys(this.mockVehicles).forEach(id => {
      this.store.removeVehicle(id);
    });
    
    // Clear the local collection
    this.mockVehicles = {};
  }
  
  /**
   * Send an update to the store with the current vehicle state
   */
  private sendUpdate(): void {
    console.log(`[SimpleMockVehicleService.sendUpdate] Running update, isRunning: ${this.isRunning}, vehicleCount: ${Object.keys(this.mockVehicles).length}`);
    
    if (!this.isRunning || Object.keys(this.mockVehicles).length === 0) {
      console.log('[SimpleMockVehicleService.sendUpdate] No vehicles or service not running, skipping update');
      return;
    }
    
    // Make a copy of all vehicles for batch update
    const updatedVehicles: Record<string, RealVehicle> = {};
    
    // Update each vehicle
    Object.entries(this.mockVehicles).forEach(([id, vehicle]) => {
      // Create a copy with updated timestamp
      const updatedVehicle = {
        ...vehicle,
        lastUpdated: new Date()
      };
      
      // Simulate movement if enabled
      if (this.movementEnabled) {
        this.simulateMovement(updatedVehicle);
      }
      
      // Add to batch update
      updatedVehicles[id] = updatedVehicle;
      
      // Update local collection
      this.mockVehicles[id] = updatedVehicle;
    });
    
    console.log(`[SimpleMockVehicleService.sendUpdate] Sending batch update with ${Object.keys(updatedVehicles).length} vehicles`);
    // Send batch update to store
    this.store.updateVehicleBatch(updatedVehicles);
    console.log(`[SimpleMockVehicleService.sendUpdate] Batch update complete`);
  }
  
  /**
   * Simulate movement for a vehicle
   */
  private simulateMovement(vehicle: RealVehicle): void {
    if (!vehicle.location) return;
    
    // Extract current location
    const { latitude, longitude } = vehicle.location;
    
    // Move slightly in a random direction
    const latDelta = (Math.random() - 0.5) * 0.001;
    const lngDelta = (Math.random() - 0.5) * 0.001;
    
    // Update the location
    vehicle.location = {
      latitude: latitude + latDelta,
      longitude: longitude + lngDelta
    };
    
    // Calculate new heading (0-360 degrees)
    const heading = Math.atan2(lngDelta, latDelta) * (180 / Math.PI);
    vehicle.heading = (heading + 360) % 360;
  }
}

/**
 * Helper function to create a simplified mock vehicle service for a store
 * Maintains the same interface as MockVehicleService for compatibility
 */
export function createSimpleMockVehicleService(store: MockVehicleStoreActions) {
  const service = SimpleMockVehicleService.getInstance(store);
  
  return {
    initialize: () => service.start(),
    terminate: () => service.stop(),
    isConnected: () => service.isActive(),
    reconnect: () => {
      service.stop();
      service.start();
    },
    
    // Mock-specific actions (keep compatible with MockVehicleService)
    addVehicle: () => {
      console.log('[SimpleMockVehicleService] addVehicle called - operation not supported');
    },
    removeRandomVehicle: () => {
      console.log('[SimpleMockVehicleService] removeRandomVehicle called - operation not supported');
    },
    reset: () => service.clearMockVehicles(),
    
    // Additional actions specific to SimpleMockVehicleService
    setMovementEnabled: (enabled: boolean) => service.setMovementEnabled(enabled),
    setVehicleStatus: (status: VehicleStatus) => {
      console.log(`[SimpleMockVehicleService] Setting vehicle status to: ${status}`);
      service.getMockVehicles().forEach(vehicle => {
        vehicle.status = status;
        service.addMockVehicle(vehicle);
      });
    },
    moveToPostOffice: (index: number) => {
      if (index < 0 || index >= KL_POST_OFFICES.length) {
        console.error(`[SimpleMockVehicleService] Invalid post office index: ${index}`);
        return;
      }
      
      const postOffice = KL_POST_OFFICES[index];
      console.log(`[SimpleMockVehicleService] Moving vehicle to: ${postOffice.name}`);
      
      service.getMockVehicles().forEach(vehicle => {
        vehicle.location = {
          latitude: postOffice.latitude,
          longitude: postOffice.longitude
        };
        service.addMockVehicle(vehicle);
      });
    },
    
    // ADDED: Expose addMockVehicle method to allow adding test vehicles
    addMockVehicle: (vehicle: RealVehicle) => {
      console.log(`[SimpleMockVehicleService] Adding mock vehicle: ${vehicle.id}`);
      service.addMockVehicle(vehicle);
    }
  };
} 