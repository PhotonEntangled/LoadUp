import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { getFirebaseDatabase } from '../lib/firebase';
import { FirebaseVehicleAdapter, FirebaseVehicleData } from '../adapters/FirebaseVehicleAdapter';
import { RealVehicle } from '../types/vehicle';

// Interface defining what we expect from the UnifiedVehicleStore
interface VehicleStoreActions {
  updateVehicleBatch: (updates: Record<string, RealVehicle>) => void;
  setIsConnected: (isConnected: boolean) => void;
  setLastServerSync: (time: Date) => void;
  resetConnectionAttempts: () => void;
  incrementConnectionAttempts: () => void;
}

/**
 * Service that connects to Firebase Realtime Database and tracks vehicle updates
 */
export class VehicleTrackingService {
  private static instance: VehicleTrackingService | null = null;
  private adapter = new FirebaseVehicleAdapter();
  private isInitialized = false;
  private store: VehicleStoreActions;
  private database = getFirebaseDatabase();
  private vehiclesRef = ref(this.database, 'vehicles');
  private updateQueue: Record<string, FirebaseVehicleData> = {};
  private updateTimerId: NodeJS.Timeout | null = null;
  private updateInterval = 100; // 100ms batch interval
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor(store: VehicleStoreActions) {
    this.store = store;
  }
  
  /**
   * Get the singleton instance of the service
   */
  public static getInstance(store: VehicleStoreActions): VehicleTrackingService {
    if (!VehicleTrackingService.instance) {
      VehicleTrackingService.instance = new VehicleTrackingService(store);
    } else {
      // Update store reference in case it changes
      VehicleTrackingService.instance.store = store;
    }
    return VehicleTrackingService.instance;
  }
  
  /**
   * Initialize the tracking service and connect to Firebase
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    // Listen for changes to the vehicles node
    onValue(this.vehiclesRef, this.handleVehicleUpdate, (error: Error) => {
      console.error('Firebase vehicle tracking error:', error);
      this.store.setIsConnected(false);
      this.store.incrementConnectionAttempts();
    });
    
    this.isInitialized = true;
    this.store.setIsConnected(true);
    this.store.setLastServerSync(new Date());
    this.store.resetConnectionAttempts();

    console.log('[VehicleTrackingService] Initialized and connected to Firebase');
  }
  
  /**
   * Terminate the tracking service and disconnect from Firebase
   */
  public terminate(): void {
    if (!this.isInitialized) return;
    
    // Remove Firebase listeners
    off(this.vehiclesRef);
    
    // Clear any pending updates
    if (this.updateTimerId) {
      clearTimeout(this.updateTimerId);
      this.updateTimerId = null;
    }
    
    this.isInitialized = false;
    this.store.setIsConnected(false);

    console.log('[VehicleTrackingService] Terminated Firebase connection');
  }
  
  /**
   * Handle vehicle updates from Firebase
   */
  private handleVehicleUpdate = (snapshot: DataSnapshot): void => {
    const vehiclesData = snapshot.val() as Record<string, FirebaseVehicleData> | null;
    
    if (!vehiclesData) {
      console.log('[VehicleTrackingService] No vehicles data in Firebase');
      return;
    }
    
    // Queue updates for batching
    Object.entries(vehiclesData).forEach(([vehicleId, vehicleData]) => {
      this.updateQueue[vehicleId] = {
        ...vehicleData,
        id: vehicleId
      };
    });
    
    // Schedule batch update if not already scheduled
    if (!this.updateTimerId) {
      this.updateTimerId = setTimeout(this.processBatchUpdate, this.updateInterval);
    }
    
    // Update connection status
    this.store.setLastServerSync(new Date());
  };
  
  /**
   * Process all queued updates in a batch
   */
  private processBatchUpdate = (): void => {
    // Process all queued updates
    if (Object.keys(this.updateQueue).length > 0) {
      console.log(`[VehicleTrackingService] Processing batch update with ${Object.keys(this.updateQueue).length} vehicles`);
      
      const transformedVehicles = this.adapter.transformBatchToUnifiedFormat(this.updateQueue);
      
      // Update the store
      this.store.updateVehicleBatch(transformedVehicles);
      
      // Clear the queue
      this.updateQueue = {};
    }
    
    // Reset the timer
    this.updateTimerId = null;
  };
  
  /**
   * Check if the service is currently connected
   */
  public isConnected(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Reconnect to Firebase
   */
  public reconnect(): void {
    console.log('[VehicleTrackingService] Attempting to reconnect to Firebase');
    this.terminate();
    this.store.incrementConnectionAttempts();
    this.initialize();
  }
}

/**
 * Helper function to create a tracking service for a store
 */
export function createVehicleTrackingService(store: VehicleStoreActions) {
  const service = VehicleTrackingService.getInstance(store);
  
  return {
    initialize: () => service.initialize(),
    terminate: () => service.terminate(),
    isConnected: () => service.isConnected(),
    reconnect: () => service.reconnect()
  };
} 