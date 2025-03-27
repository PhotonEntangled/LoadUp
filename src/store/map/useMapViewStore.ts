import { create } from 'zustand';

export interface Viewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface MapBounds {
  southWest: [number, number];
  northEast: [number, number];
}

interface MapViewState {
  // State
  viewport: Viewport;
  mapToken: string | null;
  isMapLoaded: boolean;
  hasMapError: boolean;
  mapErrorMessage: string | null;
  
  // Actions
  setViewport: (viewport: Viewport) => void;
  setMapToken: (token: string | null) => void;
  setMapReady: (ready: boolean) => void;
  setMapLoaded: (loaded: boolean) => void;
  setMapError: (hasError: boolean, message?: string) => void;
  fitBounds: (bounds: MapBounds) => void;
}

export const useMapViewStore = create<MapViewState>((set) => ({
  // Initial state
  viewport: {
    center: [101.6869, 3.1390], // Kuala Lumpur, Malaysia
    zoom: 11,
    bearing: 0,
    pitch: 0
  },
  mapToken: null,
  isMapLoaded: false,
  hasMapError: false,
  mapErrorMessage: null,
  
  // Actions
  setViewport: (viewport) => set({ viewport }),
  
  setMapToken: (token) => set({ mapToken: token }),
  
  setMapReady: (ready) => set({ 
    isMapLoaded: ready
  }),
  
  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
  
  setMapError: (hasError, message) => set({
    hasMapError: hasError,
    mapErrorMessage: message || null
  }),
  
  fitBounds: (bounds) => {
    // This is just a state update; the actual fitting happens in the map component
    set((state) => ({
      viewport: {
        ...state.viewport,
        // Calculate approximate center from bounds
        center: [
          (bounds.southWest[0] + bounds.northEast[0]) / 2, 
          (bounds.southWest[1] + bounds.northEast[1]) / 2
        ]
      }
    }));
  }
})); 