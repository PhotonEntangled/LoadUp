// services/tracking/LiveTrackingService.ts
import { LiveVehicleUpdate } from '@/types/tracking';

/**
 * Interface for live tracking services.
 * Implementations can use different data sources (Firebase, WebSockets, etc)
 */
export interface LiveTrackingService {
  /**
   * Subscribe to live location updates for a specific shipment
   * 
   * @param shipmentId - The ID of the shipment to track
   * @param onUpdate - Callback for location updates
   * @param onError - Callback for errors during subscription
   * @returns A function to unsubscribe
   */
  subscribeToVehicleLocation(
    shipmentId: string,
    onUpdate: (update: LiveVehicleUpdate) => void,
    onError: (error: Error) => void
  ): () => void;

  // Optional future method for publishing updates (e.g., from a mock UI)
  // publishUpdate?(update: LiveVehicleUpdate): Promise<void>;
} 