// lib/store/useLiveTrackingStore.ts
import { create } from 'zustand';
// import { produce } from 'immer'; // Removed unused import
import { LiveVehicleUpdate, StaticTrackingDetails } from '@/types/tracking';
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

// --- State Interface ---
interface LiveTrackingState {
  trackedShipmentId: string | null; // ID of the shipment currently being tracked
  staticShipmentDetails: StaticTrackingDetails | null; // Holds origin, dest, RDD etc.
  latestLiveUpdate: LiveVehicleUpdate | null; // The most recent update received from the source
  subscriptionStatus: 'idle' | 'subscribing' | 'active' | 'error'; // Tracks the connection state
  subscriptionError: string | null; // Stores error messages from the subscription
  unsubscribeFn: (() => void) | null; // Stores the cleanup function from the service
  lastKnownLocation: { lat: number; lon: number } | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  isFollowingVehicle: boolean; // Whether the map should auto-pan to the vehicle
  currentMapInstance: MapboxMap | null; // Reference to the Mapbox GL JS map instance
  isMapLoaded: boolean;
}

// --- Actions Interface ---
interface LiveTrackingActions {
  subscribe: (shipmentId: string, staticDetails: StaticTrackingDetails) => Promise<void>;
  unsubscribe: () => void;
  _handleSubscriptionError: (error: Error) => void;
  _setUnsubscribeFn: (fn: (() => void) | null) => void;
  _handleLiveUpdate: (update: LiveVehicleUpdate) => void;
  // Action to explicitly enable/disable follow mode
  setFollowingVehicle: (isFollowing: boolean) => void;
}

// --- Initial State ---
const initialState: LiveTrackingState = {
  trackedShipmentId: null,
  staticShipmentDetails: null,
  latestLiveUpdate: null,
  subscriptionStatus: 'idle',
  subscriptionError: null,
  unsubscribeFn: null,
  lastKnownLocation: null,
  connectionStatus: 'connecting',
  error: null,
  isFollowingVehicle: true,
  currentMapInstance: null,
  isMapLoaded: false,
};

// --- Store Definition (Task 9.3.3 & 9.3.4) ---
export const useLiveTrackingStore = create<LiveTrackingState & LiveTrackingActions>((set, get) => ({
  ...initialState,

  // == SUBSCRIPTION MANAGEMENT ACTIONS ==

  subscribe: async (shipmentId, staticDetails) => {
    // Prevent double subscriptions
    if (get().subscriptionStatus === 'subscribing' || get().subscriptionStatus === 'active') {
      console.warn(`Subscription already active/pending for ${get().trackedShipmentId}. Unsubscribe first.`);
      return;
    }

    console.log(`Attempting to subscribe to live updates for shipment: ${shipmentId}`);
    set({
      subscriptionStatus: 'subscribing',
      trackedShipmentId: shipmentId,
      staticShipmentDetails: staticDetails,
      latestLiveUpdate: null, // Clear previous updates
      subscriptionError: null, // Clear previous errors
      unsubscribeFn: null    // Clear previous unsubscribe function
    });

    try {
      // Call the actual service (implementation in Task 9.4)
      const unsubscribe = liveTrackingService.subscribeToVehicleLocation(
        shipmentId,
        // Pass internal actions as callbacks, ensuring types match interface
        (update: LiveVehicleUpdate) => get()._handleLiveUpdate(update),
        (error: Error) => get()._handleSubscriptionError(error)
      );

      // Store the unsubscribe function provided by the service
      get()._setUnsubscribeFn(unsubscribe);
      set({ subscriptionStatus: 'active' });
      console.log(`Successfully subscribed to live updates for shipment: ${shipmentId}`);

    } catch (error) {
      // Handle synchronous errors during the subscribe call itself
      console.error(`Synchronous error during subscription setup for ${shipmentId}:`, error);
      get()._handleSubscriptionError(error instanceof Error ? error : new Error('Unknown subscription setup error'));
    }
  },

  unsubscribe: () => {
    const { unsubscribeFn, trackedShipmentId } = get();
    console.log(`Attempting to unsubscribe from shipment: ${trackedShipmentId ?? 'N/A'}`);

    if (unsubscribeFn) {
      try {
        unsubscribeFn(); // Call the stored cleanup function from the service
        console.log(`Called unsubscribe function for shipment: ${trackedShipmentId}`);
      } catch (error) {
        // Log error if cleanup fails, but proceed with state reset
        console.error(`Error calling unsubscribe function for ${trackedShipmentId}:`, error);
      }
    }
    // Reset the entire state slice to initial values for thorough cleanup
    set({ ...initialState });
    console.log('Live tracking state reset to initial.');
  },

  // == INTERNAL HELPER ACTIONS ==

  _setUnsubscribeFn: (fn) => {
    set({ unsubscribeFn: fn });
  },

  // Placeholder - Implementation in Task 9.3.4
  _handleSubscriptionError: (error: Error) => {
    console.error("Live tracking subscription error:", error);
    // Attempt to clean up existing subscription if possible
    const { unsubscribeFn, trackedShipmentId } = get();
    if (unsubscribeFn) {
      try {
        unsubscribeFn();
        console.log(`Called unsubscribe function due to error for shipment: ${trackedShipmentId}`);
      } catch (cleanupError) {
        console.error(`Error calling unsubscribe function during error handling for ${trackedShipmentId}:`, cleanupError);
      }
    }
    // Update state to reflect the error
    set({
      subscriptionStatus: 'error',
      subscriptionError: error.message || 'Unknown subscription error',
      // Clear the defunct unsubscribe function and potentially latest update
      unsubscribeFn: null,
      latestLiveUpdate: null // Or keep last known good? Decision: Clear for safety.
    });
  },

  // Placeholder - Implementation in Task 9.3.4
  _handleLiveUpdate: (update: LiveVehicleUpdate) => {
    // --- Basic Data Validation (Task 9.7.6) ---
    if (
      !update || 
      typeof update.latitude !== 'number' || 
      typeof update.longitude !== 'number' || 
      typeof update.timestamp !== 'number'
    ) {
      console.warn("[LiveTrackingStore._handleLiveUpdate] Received invalid or incomplete update, discarding:", update);
      return; // Discard invalid update
    }

    // TODO: Add timestamp check to prevent out-of-order updates if necessary
    // const { latestLiveUpdate } = get();
    // if (latestLiveUpdate && update.timestamp <= latestLiveUpdate.timestamp) {
    //   console.warn(`[LiveTrackingStore._handleLiveUpdate] Received stale/duplicate timestamp (${update.timestamp} <= ${latestLiveUpdate.timestamp}), discarding.`);
    //   return;
    // }

    // --- Update State ---
    console.log(`Processing valid live update for ${update.shipmentId} at ${new Date(update.timestamp).toISOString()}`);
    set({
      latestLiveUpdate: update,
      subscriptionStatus: 'active', // Ensure status is active on successful update
      subscriptionError: null     // Clear any previous error
    });
  },

  // == MAP INTERACTION ACTIONS ==
  setFollowingVehicle: (isFollowing) => {
    console.log(`Setting isFollowingVehicle to: ${isFollowing}`);
    set({ isFollowingVehicle: isFollowing });
  },

  // --- Selectors ---
  getVehiclePosition: () => get().lastKnownLocation,
  getOriginCoords: () => get().staticShipmentDetails?.originCoords || null,
  getDestinationCoords: () =>
    get().staticShipmentDetails?.destinationCoords || null,
  getPlannedRouteGeometry: () =>
    get().staticShipmentDetails?.plannedRouteGeometry || null,
}));

console.log('useLiveTrackingStore defined with state and all actions.');

// Remove temporary export
// export {}; 