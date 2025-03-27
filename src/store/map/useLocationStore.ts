import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

export interface LocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: number;
  accuracy?: number;
}

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: number;
  accuracy?: number;
  isSimulated?: boolean;
}

export interface LocationHistory {
  [vehicleId: string]: VehicleLocation[];
}

interface LocationState {
  // Current locations of all vehicles
  vehicleLocations: Record<string, VehicleLocation>;
  
  // History of locations for playback/tracking
  locationHistory: LocationHistory;
  
  // Maximum history entries per vehicle
  maxHistoryLength: number;
  
  // Track if simulation is active
  isSimulationActive: boolean;
}

interface LocationActions {
  // Update a single vehicle location
  updateVehicleLocation: (update: LocationUpdate) => void;
  
  // Update multiple vehicle locations at once
  updateVehicleLocations: (updates: LocationUpdate[]) => void;
  
  // Clear history for specific vehicle or all
  clearLocationHistory: (vehicleId?: string) => void;
  
  // Toggle simulation mode
  setSimulationActive: (active: boolean) => void;
  
  // Set max history length
  setMaxHistoryLength: (length: number) => void;
}

type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      vehicleLocations: {},
      locationHistory: {},
      maxHistoryLength: 100,
      isSimulationActive: false,
      
      // Actions
      updateVehicleLocation: (update) => {
        const { vehicleId } = update;
        const { vehicleLocations, locationHistory, maxHistoryLength } = get();
        
        // Update current location
        const updatedLocations = {
          ...vehicleLocations,
          [vehicleId]: {
            ...update,
            isSimulated: get().isSimulationActive,
          },
        };
        
        // Update history (preserving maxHistoryLength)
        const vehicleHistory = locationHistory[vehicleId] || [];
        const updatedHistory = {
          ...locationHistory,
          [vehicleId]: [
            ...vehicleHistory,
            { ...update, isSimulated: get().isSimulationActive },
          ].slice(-maxHistoryLength),
        };
        
        set({ 
          vehicleLocations: updatedLocations,
          locationHistory: updatedHistory,
        });
      },
      
      updateVehicleLocations: (updates) => {
        const { vehicleLocations, locationHistory, maxHistoryLength, isSimulationActive } = get();
        
        // Batch update all vehicles
        const updatedLocations = { ...vehicleLocations };
        const updatedHistory = { ...locationHistory };
        
        updates.forEach(update => {
          const { vehicleId } = update;
          
          // Update current location
          updatedLocations[vehicleId] = {
            ...update,
            isSimulated: isSimulationActive,
          };
          
          // Update history
          const vehicleHistory = updatedHistory[vehicleId] || [];
          updatedHistory[vehicleId] = [
            ...vehicleHistory,
            { ...update, isSimulated: isSimulationActive },
          ].slice(-maxHistoryLength);
        });
        
        set({ 
          vehicleLocations: updatedLocations,
          locationHistory: updatedHistory,
        });
      },
      
      clearLocationHistory: (vehicleId) => {
        if (vehicleId) {
          // Clear history for specific vehicle
          const updatedHistory = { ...get().locationHistory };
          delete updatedHistory[vehicleId];
          set({ locationHistory: updatedHistory });
        } else {
          // Clear all history
          set({ locationHistory: {} });
        }
      },
      
      setSimulationActive: (active) => {
        set({ isSimulationActive: active });
      },
      
      setMaxHistoryLength: (length) => {
        set({ maxHistoryLength: length });
      },
    }),
    { name: 'location-store' }
  )
);

// Selectors with memoization
export const useVehicleLocations = () => 
  useLocationStore((state) => state.vehicleLocations);

export const useVehicleLocationById = (vehicleId: string) => 
  useLocationStore((state) => state.vehicleLocations[vehicleId]);

export const useLocationHistoryByVehicleId = (vehicleId: string) => 
  useLocationStore((state) => state.locationHistory[vehicleId] || []);

export const useIsSimulationActive = () => 
  useLocationStore((state) => state.isSimulationActive); 