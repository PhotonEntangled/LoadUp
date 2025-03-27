/**
 * mapStore
 * 
 * Global store for map-related state, including vehicles, markers, routes, etc.
 * This implementation is deliberately simplified to avoid circular dependencies.
 */
import { create } from 'zustand';
import { RouteSegment, RouteStop, ShipmentDetails, Vehicle } from '../types/shipment-tracking';

// CRITICAL FIX: Add these React imports needed for proper snapshot caching
import { useCallback, useEffect, useRef } from 'react';
import { useSyncExternalStore } from 'react';

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface MapFocus {
  latitude: number;
  longitude: number;
  zoom: number;
  animateDuration?: number;
}

interface MapState {
  // Flag to indicate whether the map is initialized
  initialized: boolean;
  // Vehicles to display on the map
  vehicles: Vehicle[];
  // Selected vehicle ID if any
  selectedVehicleId: string | null;
  // Bounds to fit the map to
  bounds: {
    southWest: [number, number];
    northEast: [number, number];
  } | null;
  
  // Additional properties for selectors
  activeShipment?: ShipmentDetails | null;
  routeStops: RouteStop[];
  selectedStopId: string | null;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setSelectedVehicleId: (id: string | null) => void;
  fitBounds: (bounds: { southWest: [number, number]; northEast: [number, number] }) => void;
}

// Create the store
export const mapStore = create<MapState>()((set) => ({
  initialized: false,
  vehicles: [],
  selectedVehicleId: null,
  bounds: null,
  activeShipment: null,
  routeStops: [],
  selectedStopId: null,
  
  setInitialized: (initialized) => set({ initialized }),
  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedVehicleId: (selectedVehicleId) => set({ selectedVehicleId }),
  fitBounds: (bounds) => set({ bounds }),
}));

// CRITICAL FIX: Create a properly cached hook for consuming the mapStore
// This solves the "Warning: The result of getServerSnapshot should be cached" error
function useMapStoreInternal<T>(selector: (state: MapState) => T): T {
  // Create references to maintain stability
  const storeRef = useRef(mapStore);
  const selectorRef = useRef(selector);
  const prevStateRef = useRef<any>(null);
  const prevResultRef = useRef<T | null>(null);
  
  // Update the selector ref when it changes
  useEffect(() => {
    selectorRef.current = selector;
  }, [selector]);
  
  // A stable snapshot getter that properly caches its results
  const getSnapshot = useCallback(() => {
    const store = storeRef.current;
    const nextState = store.getState();
    
    // Only calculate a new result if the state changed or the selector changed
    if (prevStateRef.current !== nextState || prevResultRef.current === null) {
      prevStateRef.current = nextState;
      prevResultRef.current = selectorRef.current(nextState);
    }
    
    return prevResultRef.current as T;
  }, []);
  
  // Same for server snapshot
  const getServerSnapshot = useCallback(() => {
    const store = storeRef.current;
    const nextState = store.getState();
    
    // Only calculate a new result if the state changed or the selector changed
    if (prevStateRef.current !== nextState || prevResultRef.current === null) {
      prevStateRef.current = nextState;
      prevResultRef.current = selectorRef.current(nextState);
    }
    
    return prevResultRef.current as T;
  }, []);
  
  // Subscribe to the store with proper snapshot caching
  return useSyncExternalStore(
    mapStore.subscribe,
    getSnapshot,
    getServerSnapshot
  );
}

// Export the main hook with the original name for backward compatibility
export const useMapStore = useMapStoreInternal;

// Also export the selector with a more descriptive name
export const useMapStoreSelector = useMapStoreInternal;

// Selector to get the active vehicle from the active shipment
export const useActiveVehicle = () => useMapStore((state) => state.activeShipment?.vehicle);

// Selector to get active route stops
export const useActiveRouteStops = () => useMapStore((state) => state.routeStops);

// Selector to get the currently selected stop details
export const useSelectedStop = () => {
  const { routeStops, selectedStopId } = useMapStore(state => ({
    routeStops: state.routeStops,
    selectedStopId: state.selectedStopId
  }));
  
  return routeStops.find((stop: RouteStop) => stop.id === selectedStopId);
}; 