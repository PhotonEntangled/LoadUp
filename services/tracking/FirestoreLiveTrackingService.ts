// services/tracking/FirestoreLiveTrackingService.ts
import {
  doc,
  onSnapshot,
  FirestoreError,
  DocumentSnapshot
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/clientApp'; // Use the initialized client-side instance
import { LiveTrackingService } from './LiveTrackingService';
import { LiveVehicleUpdate } from '@/types/tracking';
import { logger } from '@/utils/logger'; // Assuming a logger utility exists

class FirestoreLiveTrackingService implements LiveTrackingService {
  subscribeToVehicleLocation(
    shipmentId: string,
    onUpdate: (update: LiveVehicleUpdate) => void,
    onError: (error: Error) => void
  ): () => void { // Returns unsubscribe function
    // Neurotic Check: Validate shipmentId format? Ensure not empty?
    if (!shipmentId) {
      const error = new Error('subscribeToVehicleLocation requires a valid shipmentId.');
      logger.error('Subscription Error:', error);
      onError(error);
      return () => { logger.warn('Attempted to unsubscribe from failed setup (invalid shipmentId).'); }; // Return no-op
    }

    logger.info(`Subscribing to live location for shipment: ${shipmentId}`);

    // Construct the document reference based on plan (Section 2.3)
    // Path: /active_vehicles/{shipmentId}
    const docRef = doc(firestore, 'active_vehicles', shipmentId);

    try {
      const unsubscribe = onSnapshot(docRef,
        (docSnap: DocumentSnapshot) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Neurotic Check: Add validation for incoming data shape against LiveVehicleUpdate?
            // Basic check for essential fields:
            if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number' && typeof data.timestamp === 'number') {
              // Assume data matches LiveVehicleUpdate, cast carefully
              const update = data as LiveVehicleUpdate;
              // TODO: Add timestamp check here if needed (Task 9.7.6)
              // const { latestLiveUpdate } = useLiveTrackingStore.getState(); // Avoid store access in service
              // if (!latestLiveUpdate || update.timestamp > latestLiveUpdate.timestamp) { ... }
              logger.debug(`Received valid update for ${shipmentId}`);
              onUpdate(update);
            } else {
              // Data exists but doesn't have the essential fields
              logger.error(`Invalid data format received for shipment ${shipmentId}:`, data);
              onError(new Error(`Received invalid data format for shipment ${shipmentId}.`));
              // Consider unsubscribing or just reporting error?
            }
          } else {
            // Document doesn't exist (or was deleted)
            logger.warn(`Firestore document for shipment ${shipmentId} does not exist.`);
            // Call onError as per plan decision (Task 9.4.2)
            onError(new Error(`Tracking data not found for shipment ${shipmentId}.`));
          }
        },
        (error: FirestoreError) => {
          // Handle Firestore subscription errors (permissions, network, etc.)
          logger.error(`Firestore subscription error for ${shipmentId}:`, error);
          onError(error); // Pass the FirestoreError up
        }
      );

      logger.info(`Subscription established for shipment: ${shipmentId}`);
      // Return the actual unsubscribe function provided by onSnapshot
      return unsubscribe;

    } catch (error) {
       // Catch synchronous errors during initial onSnapshot setup (rare but possible)
       logger.error(`Synchronous error setting up subscription for ${shipmentId}:`, error);
       onError(error instanceof Error ? error : new Error('Failed to setup Firestore subscription'));
       // Return a no-op unsubscribe function in case of setup failure
       return () => { logger.warn(`Attempted to unsubscribe from failed setup for ${shipmentId}`); };
    }
  }

  // publishUpdate implementation (if needed later)
  // async publishUpdate(update: LiveVehicleUpdate): Promise<void> { ... }
}

// Export a singleton instance for easy use across the app
// Neurotic Check: Singleton pattern is simple but consider dependency injection for larger apps.
export const liveTrackingService = new FirestoreLiveTrackingService();

console.log('FirestoreLiveTrackingService initialized.'); 