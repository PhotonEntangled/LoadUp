import { RealVehicle, Vehicle, VehicleStatus } from '../types/vehicle';

// Sample post office locations in Kuala Lumpur
const KL_POST_OFFICES = [
  { name: 'KL General Post Office', latitude: 3.1493, longitude: 101.6953 },
  { name: 'Damansara Heights Post Office', latitude: 3.1589, longitude: 101.6502 },
  { name: 'Bangsar Post Office', latitude: 3.1302, longitude: 101.6765 },
  { name: 'Ampang Post Office', latitude: 3.1631, longitude: 101.7497 },
  { name: 'Sentul Post Office', latitude: 3.1853, longitude: 101.6893 }
];

// Mock vehicle statuses for random assignment
const VEHICLE_STATUSES: VehicleStatus[] = ['moving', 'loading', 'unloading', 'idle', 'maintenance'];

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
 * Service that generates and updates mock vehicles for testing
 */
export class MockVehicleService {
  private static instance: MockVehicleService | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private mockVehicles: Record<string, RealVehicle> = {};
  private isRunning = false;
  private store: MockVehicleStoreActions;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor(store: MockVehicleStoreActions) {
    this.store = store;
    // Generate initial mock vehicles
    this.generateMockVehicles(10); // Start with 10 vehicles
  }
  
  /**
   * Get the singleton instance of the service
   */
  public static getInstance(store: MockVehicleStoreActions): MockVehicleService {
    if (!MockVehicleService.instance) {
      MockVehicleService.instance = new MockVehicleService(store);
    } else {
      // Update store reference in case it changes
      MockVehicleService.instance.store = store;
    }
    return MockVehicleService.instance;
  }
  
  /**
   * Generate a specified number of mock vehicles
   */
  private generateMockVehicles(count: number): void {
    for (let i = 0; i < count; i++) {
      const id = `mock-${Date.now()}-${i}`;
      const postOffice = KL_POST_OFFICES[Math.floor(Math.random() * KL_POST_OFFICES.length)];
      
      this.mockVehicles[id] = {
        id,
        type: '16-wheeler',
        location: {
          latitude: postOffice.latitude + (Math.random() * 0.02 - 0.01),
          longitude: postOffice.longitude + (Math.random() * 0.02 - 0.01)
        },
        heading: Math.floor(Math.random() * 360),
        speed: Math.floor(Math.random() * 80),
        status: VEHICLE_STATUSES[Math.floor(Math.random() * VEHICLE_STATUSES.length)],
        lastUpdated: new Date(),
        isSimulated: false, // These are mock "real" vehicles
        deviceId: `device-${i}`,
        signalStrength: Math.floor(Math.random() * 5) + 1 // 1-5 signal strength
      };
    }
  }
  
  /**
   * Update all mock vehicles with realistic movement
   */
  private updateMockVehicles(): void {
    // Update each vehicle's position and status
    Object.values(this.mockVehicles).forEach(vehicle => {
      // Random movement (more movement for higher speed)
      const latChange = (Math.random() * 0.002 - 0.001) * (vehicle.speed / 50);
      const lngChange = (Math.random() * 0.002 - 0.001) * (vehicle.speed / 50);
      
      // Update vehicle
      this.mockVehicles[vehicle.id] = {
        ...vehicle,
        location: {
          latitude: vehicle.location.latitude + latChange,
          longitude: vehicle.location.longitude + lngChange
        },
        // Occasionally change heading
        heading: Math.random() < 0.1 ? 
          (vehicle.heading + Math.floor(Math.random() * 30) - 15) % 360 : 
          vehicle.heading,
        // Occasionally change speed
        speed: Math.random() < 0.2 ? 
          Math.max(0, Math.min(80, vehicle.speed + Math.floor(Math.random() * 10) - 5)) : 
          vehicle.speed,
        // Occasionally change status
        status: Math.random() < 0.05 ? 
          VEHICLE_STATUSES[Math.floor(Math.random() * VEHICLE_STATUSES.length)] : 
          vehicle.status,
        lastUpdated: new Date()
      };
    });
    
    // Send batch update to store
    this.store.updateVehicleBatch({ ...this.mockVehicles });
    this.store.setLastServerSync(new Date());
  }
  
  /**
   * Start generating mock vehicle updates
   */
  public start(): void {
    if (this.isRunning) return;
    
    console.log('[MockVehicleService] Starting mock updates');
    
    // Start sending periodic updates
    this.updateInterval = setInterval(() => this.updateMockVehicles(), 1000);
    this.isRunning = true;
    this.store.setIsConnected(true);
    this.store.resetConnectionAttempts();
  }
  
  /**
   * Stop generating mock vehicle updates
   */
  public stop(): void {
    if (!this.isRunning || !this.updateInterval) return;
    
    console.log('[MockVehicleService] Stopping mock updates');
    
    clearInterval(this.updateInterval);
    this.updateInterval = null;
    this.isRunning = false;
    this.store.setIsConnected(false);
  }
  
  /**
   * Add a new mock vehicle
   */
  public addVehicle(): void {
    console.log('[MockVehicleService] Adding a new mock vehicle');
    this.generateMockVehicles(1);
    // Update store with new vehicle
    this.store.updateVehicleBatch({ ...this.mockVehicles });
  }
  
  /**
   * Remove a random vehicle
   */
  public removeRandomVehicle(): void {
    const vehicleIds = Object.keys(this.mockVehicles);
    if (vehicleIds.length === 0) return;
    
    const randomId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];
    console.log(`[MockVehicleService] Removing mock vehicle: ${randomId}`);
    
    delete this.mockVehicles[randomId];
    
    // Remove from store
    this.store.removeVehicle(randomId);
  }
  
  /**
   * Check if the mock service is active
   */
  public isActive(): boolean {
    return this.isRunning;
  }
  
  /**
   * Reset all mock vehicles
   */
  public reset(): void {
    console.log('[MockVehicleService] Resetting all mock vehicles');
    this.mockVehicles = {};
    this.generateMockVehicles(10);
    this.store.updateVehicleBatch({ ...this.mockVehicles });
  }
}

/**
 * Helper function to create a mock vehicle service for a store
 */
export function createMockVehicleService(store: MockVehicleStoreActions) {
  const service = MockVehicleService.getInstance(store);
  
  return {
    initialize: () => service.start(),
    terminate: () => service.stop(),
    isConnected: () => service.isActive(),
    reconnect: () => {
      service.stop();
      service.start();
    },
    
    // Mock-specific actions
    addVehicle: () => service.addVehicle(),
    removeRandomVehicle: () => service.removeRandomVehicle(),
    reset: () => service.reset()
  };
} 