// services/tracking/LiveTrackingService.ts
import { LiveVehicleUpdate } from '@/types/tracking';

/**
 * Defines the contract for a service responsible for handling 
 * real-time vehicle location subscriptions. 
 * This abstraction allows for different underlying implementations 
 * (e.g., Firestore, Ably, Mock) while maintaining a consistent interface 
 * for the rest of the application.
 */
export interface LiveTrackingService {
  /**
   * Subscribes to live location updates for a specific shipment.
   * 
   * @param shipmentId The ID of the shipment to track. Must correspond to the 
   *                   identifier used in the real-time data source (e.g., Firestore document ID).
   * @param onUpdate Callback function triggered with each new LiveVehicleUpdate received 
   *                 from the subscription. It's the responsibility of this callback
   *                 to handle state updates.
   * @param onError Callback function triggered if an error occurs during subscription setup 
   *                or while the subscription is active (e.g., permission denied, network issues).
   * @returns A function that, when called, will unsubscribe from the location updates. 
   *          It is crucial to call this cleanup function when the subscription is no longer needed 
   *          (e.g., component unmount) to prevent memory leaks and unnecessary reads/costs.
   *          Returns a no-op function if the initial subscription setup failed.
   */
  subscribeToVehicleLocation(
    shipmentId: string,
    onUpdate: (update: LiveVehicleUpdate) => void,
    onError: (error: Error) => void
  ): () => void; // Returns the unsubscribe function

  // Optional future method for publishing updates (e.g., from a mock UI)
  // publishUpdate?(update: LiveVehicleUpdate): Promise<void>;
} 