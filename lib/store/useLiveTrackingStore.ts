// lib/store/useLiveTrackingStore.ts
import { create } from 'zustand';
// import { produce } from 'immer'; // Removed unused import
import { LiveVehicleUpdate } from '@/types/tracking';
import type { Map as MapboxMap } from 'mapbox-gl';
// import { RefObject } from 'react'; // Only if using refs directly in state

// --- Static Data Type Placeholder ---
// TODO: Define this properly based on data fetched by getStaticTrackingDetails (Task 9.6.2)
// This will likely include origin/destination coords/address, RDD, driver name, etc.
// Needs to be imported from appropriate types file once defined.
// type YourStaticShipmentDataType = {
//   shipmentId: string;
//   documentId: string;
//   // ... other static fields
// };

// --- Service Dependency Placeholder ---
// Neurotic Check: How is the service instance accessed?
// Assuming a singleton export `liveTrackingService` from the implementation file (Task 9.4)
// This needs to be adjusted if a different pattern (DI, context) is used.
// import { liveTrackingService } from '@/services/tracking/FirestoreLiveTrackingService'; // Placeholder import
import { liveTrackingService } from '../../services/tracking/FirestoreLiveTrackingService'; // Using relative path
import { logger } from '@/utils/logger'; // Use logger

// --- State Interface ---
interface LiveTrackingState {
  trackedShipmentId: string | null; // ID of the shipment currently being tracked
  latestLiveUpdate: LiveVehicleUpdate | null; // The most recent update received from the source
  subscriptionStatus: 'idle' | 'subscribing' | 'active' | 'error'; // Tracks the connection state
  subscriptionError: string | null; // Stores error messages from the subscription
  unsubscribeFn: (() => void) | null; // Stores the cleanup function from the service
  isFollowingVehicle: boolean; // Whether the map should auto-pan to the vehicle
}

// --- Actions Interface ---
interface LiveTrackingActions {
  subscribe: (shipmentId: string) => Promise<void>;
  unsubscribe: () => void;
  _handleSubscriptionError: (error: Error) => void;
  _setUnsubscribeFn: (fn: (() => void) | null) => void;
  _handleLiveUpdate: (update: LiveVehicleUpdate) => void;
  setFollowingVehicle: (isFollowing: boolean) => void;
}

// --- Initial State ---
const initialState: LiveTrackingState = {
  trackedShipmentId: null,
  latestLiveUpdate: null,
  subscriptionStatus: 'idle',
  subscriptionError: null,
  unsubscribeFn: null,
  isFollowingVehicle: true,
};

// --- Store Definition (Task 9.3.3 & 9.3.4) ---
export const useLiveTrackingStore = create<LiveTrackingState & LiveTrackingActions>((set, get) => ({
  ...initialState,

  // == SUBSCRIPTION MANAGEMENT ACTIONS ==

  subscribe: async (shipmentId) => {
    // Prevent double subscriptions
    if (get().subscriptionStatus === 'subscribing' || get().subscriptionStatus === 'active') {
      // Avoid subscribing if already subscribed to the *same* shipmentId
      if (get().trackedShipmentId === shipmentId) {
        logger.warn(`[LiveTrackingStore] Already subscribed/subscribing to shipment: ${shipmentId}. Ignoring call.`);
        return;
      } else {
        // If active for a *different* shipment, log a warning but allow proceeding (unsubscribe is handled by caller)
        logger.warn(`[LiveTrackingStore] Subscription active for ${get().trackedShipmentId}, but new request for ${shipmentId}. Caller should have unsubscribed first.`);
      }
    }

    logger.info(`[LiveTrackingStore] Attempting to subscribe to live updates for shipment: ${shipmentId}`);
    set({
      subscriptionStatus: 'subscribing',
      trackedShipmentId: shipmentId,
      latestLiveUpdate: null, // Clear previous updates
      subscriptionError: null, // Clear previous errors
      unsubscribeFn: null    // Clear previous unsubscribe function
    });

    try {
      // Call the actual service
      const unsubscribe = liveTrackingService.subscribeToVehicleLocation(
        shipmentId,
        // Pass internal actions as callbacks
        (update: LiveVehicleUpdate) => get()._handleLiveUpdate(update),
        (error: Error) => get()._handleSubscriptionError(error)
      );

      // Store the unsubscribe function
      get()._setUnsubscribeFn(unsubscribe);
      set({ subscriptionStatus: 'active' });
      logger.info(`[LiveTrackingStore] Successfully subscribed to live updates for shipment: ${shipmentId}`);

    } catch (error) {
      // Handle synchronous errors
      logger.error(`[LiveTrackingStore] Synchronous error during subscription setup for ${shipmentId}:`, error);
      get()._handleSubscriptionError(error instanceof Error ? error : new Error('Unknown subscription setup error'));
    }
  },

  unsubscribe: () => {
    const { unsubscribeFn, trackedShipmentId } = get();
    // Only log/attempt if there's actually something to unsubscribe from
    if (trackedShipmentId || unsubscribeFn || get().subscriptionStatus !== 'idle') {
      logger.info(`[LiveTrackingStore] Attempting to unsubscribe from shipment: ${trackedShipmentId ?? 'N/A'}`);

      if (unsubscribeFn) {
        try {
          unsubscribeFn(); // Call the stored cleanup function
          logger.info(`[LiveTrackingStore] Called unsubscribe function for shipment: ${trackedShipmentId}`);
        } catch (error) {
          logger.error(`[LiveTrackingStore] Error calling unsubscribe function for ${trackedShipmentId}:`, error);
        }
      }
      // Reset the entire state slice to initial values for thorough cleanup
      // Avoid spreading initialState if you want to preserve certain states like isFollowingVehicle
      set({
        trackedShipmentId: null,
        latestLiveUpdate: null,
        subscriptionStatus: 'idle',
        subscriptionError: null,
        unsubscribeFn: null,
        // Keep isFollowingVehicle state unless explicitly reset elsewhere
        // isFollowingVehicle: initialState.isFollowingVehicle 
      });
      logger.info('[LiveTrackingStore] Live tracking state reset.');
    } else {
      logger.debug('[LiveTrackingStore] Unsubscribe called, but no active subscription found. State already idle.');
    }
  },

  // == INTERNAL HELPER ACTIONS ==

  _setUnsubscribeFn: (fn) => {
    set({ unsubscribeFn: fn });
  },

  _handleSubscriptionError: (error: Error) => {
    const { trackedShipmentId } = get(); // Get ID for logging before potential reset
    logger.error(`[LiveTrackingStore] Live tracking subscription error for ${trackedShipmentId}:`, error);
    // Attempt to clean up existing subscription if possible (redundant check, but safe)
    const { unsubscribeFn } = get(); 
    if (unsubscribeFn) {
      try {
        unsubscribeFn();
        logger.info(`[LiveTrackingStore] Called unsubscribe function due to error for shipment: ${trackedShipmentId}`);
      } catch (cleanupError) {
        logger.error(`[LiveTrackingStore] Error calling unsubscribe function during error handling for ${trackedShipmentId}:`, cleanupError);
      }
    }
    // Update state to reflect the error
    set({
      subscriptionStatus: 'error',
      subscriptionError: error.message || 'Unknown subscription error',
      unsubscribeFn: null, // Clear the defunct unsubscribe function
      latestLiveUpdate: null // Clear potentially stale data
      // trackedShipmentId: null // Keep trackedShipmentId to indicate *which* subscription failed?
      // Decision: Keep trackedShipmentId so UI knows which one errored.
    });
  },

  _handleLiveUpdate: (update: LiveVehicleUpdate) => {
    // Check if the update corresponds to the currently tracked shipment
    // This prevents processing updates for a previously tracked shipment after a quick switch
    if (update.shipmentId !== get().trackedShipmentId) {
        logger.warn(`[LiveTrackingStore] Received update for ${update.shipmentId}, but currently tracking ${get().trackedShipmentId}. Discarding.`);
        return;
    }
    
    // --- Basic Data Validation (Task 9.7.6) ---
    if (
      !update || 
      typeof update.latitude !== 'number' || 
      typeof update.longitude !== 'number' || 
      typeof update.timestamp !== 'number'
    ) {
      logger.warn("[LiveTrackingStore._handleLiveUpdate] Received invalid or incomplete update, discarding:", update);
      return; // Discard invalid update
    }

    // TODO: Add timestamp check to prevent out-of-order updates if necessary
    // const { latestLiveUpdate } = get();
    // if (latestLiveUpdate && update.timestamp <= latestLiveUpdate.timestamp) {
    //   console.warn(`[LiveTrackingStore._handleLiveUpdate] Received stale/duplicate timestamp (${update.timestamp} <= ${latestLiveUpdate.timestamp}), discarding.`);
    //   return;
    // }

    // --- Update State ---
    logger.debug(`[LiveTrackingStore] Processing valid live update for ${update.shipmentId} at ${new Date(update.timestamp).toISOString()}`);
    set({
      latestLiveUpdate: update,
      subscriptionStatus: 'active', 
      subscriptionError: null
    });
  },

  // == MAP INTERACTION ACTIONS ==
  setFollowingVehicle: (isFollowing) => {
    logger.info(`[LiveTrackingStore] Setting isFollowingVehicle to: ${isFollowing}`);
    set({ isFollowingVehicle: isFollowing });
  },

  // --- Selectors ---
  // getVehiclePosition: () => get().lastKnownLocation,
  // getOriginCoords: () => get().staticShipmentDetails?.originCoords || null,
  // getDestinationCoords: () => get().staticShipmentDetails?.destinationCoords || null,
  // getPlannedRouteGeometry: () => get().staticShipmentDetails?.plannedRouteGeometry || null,
}));

// console.log('useLiveTrackingStore defined with state and all actions.'); // Reduce noise

// Remove temporary export
// export {}; 