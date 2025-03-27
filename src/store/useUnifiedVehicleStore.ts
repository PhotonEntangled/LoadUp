import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { Vehicle, RealVehicle, SimulatedVehicle, VehicleStatus } from '../types/vehicle';
import { VehicleStoreActions } from '../services/VehicleServiceFactory';

/**
 * State interface for the unified vehicle store
 */
interface UnifiedVehicleState {
  // Vehicle data
  vehicles: Record<string, Vehicle>;
  selectedVehicleId: string | null;
  
  // Display filters
  showSimulated: boolean;
  showReal: boolean;
  statusFilter: VehicleStatus[] | null;
  searchTerm: string;
  
  // Connection state
  isConnected: boolean;
  lastServerSync: Date | null;
  connectionAttempts: number;
}

/**
 * Interface for the unified vehicle store with state and actions
 */
interface UnifiedVehicleStore extends UnifiedVehicleState, VehicleStoreActions {
  // Computed getters
  getFilteredVehicles: () => Vehicle[];
  getSelectedVehicle: () => Vehicle | null;
  getVehiclesByStatus: (status: VehicleStatus) => Vehicle[];
  
  // Display actions
  toggleShowSimulated: () => void;
  toggleShowReal: () => void;
  setStatusFilter: (statuses: VehicleStatus[] | null) => void;
  setSearchTerm: (term: string) => void;
  
  // Vehicle actions
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  selectVehicle: (id: string | null) => void;
  
  // Additional vehicle actions for simulation
  addOrUpdateVehicle: (vehicle: Vehicle) => void;
}

/**
 * Create the unified vehicle store
 */
export const useUnifiedVehicleStore = create<UnifiedVehicleStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        vehicles: {},
        selectedVehicleId: null,
        showSimulated: true,
        showReal: true,
        statusFilter: null,
        searchTerm: '',
        isConnected: false,
        lastServerSync: null,
        connectionAttempts: 0,
        
        // Computed getters
        getFilteredVehicles: () => {
          const { vehicles, showSimulated, showReal, statusFilter, searchTerm } = get();
          
          return Object.values(vehicles).filter(vehicle => {
            // Filter by simulation type
            if (vehicle.isSimulated && !showSimulated) return false;
            if (!vehicle.isSimulated && !showReal) return false;
            
            // Filter by status
            if (statusFilter && statusFilter.length > 0 && !statusFilter.includes(vehicle.status)) {
              return false;
            }
            
            // Filter by search term
            if (searchTerm) {
              const term = searchTerm.toLowerCase();
              return vehicle.id.toLowerCase().includes(term);
            }
            
            return true;
          });
        },
        
        getSelectedVehicle: () => {
          const { vehicles, selectedVehicleId } = get();
          return selectedVehicleId ? vehicles[selectedVehicleId] || null : null;
        },
        
        getVehiclesByStatus: (status: VehicleStatus) => {
          const { vehicles } = get();
          return Object.values(vehicles).filter(v => v.status === status);
        },
        
        // Vehicle actions
        addVehicle: (vehicle: Vehicle) => set(produce(state => {
          state.vehicles[vehicle.id] = vehicle;
        })),
        
        updateVehicle: (id: string, data: Partial<Vehicle>) => set(produce(state => {
          if (state.vehicles[id]) {
            state.vehicles[id] = { ...state.vehicles[id], ...data };
          }
        })),
        
        // Convenient helper method that adds or updates a vehicle
        addOrUpdateVehicle: (vehicle: Vehicle) => set(produce(state => {
          state.vehicles[vehicle.id] = vehicle;
        })),
        
        updateVehicleBatch: (updates: Record<string, Vehicle>) => set(produce(state => {
          // Merge updates into existing vehicles
          Object.entries(updates).forEach(([id, vehicle]) => {
            state.vehicles[id] = vehicle;
          });
        })),
        
        removeVehicle: (id: string) => set(produce(state => {
          delete state.vehicles[id];
          
          // Clear selection if this vehicle was selected
          if (state.selectedVehicleId === id) {
            state.selectedVehicleId = null;
          }
        })),
        
        selectVehicle: (id: string | null) => set({ selectedVehicleId: id }),
        
        // Display actions
        toggleShowSimulated: () => set((state: UnifiedVehicleState) => ({ 
          showSimulated: !state.showSimulated 
        })),
        
        toggleShowReal: () => set((state: UnifiedVehicleState) => ({ 
          showReal: !state.showReal 
        })),
        
        setStatusFilter: (statuses: VehicleStatus[] | null) => set({ statusFilter: statuses }),
        setSearchTerm: (term: string) => set({ searchTerm: term }),
        
        // Connection actions
        setIsConnected: (isConnected: boolean) => set({ isConnected }),
        setLastServerSync: (time: Date) => set({ lastServerSync: time }),
        resetConnectionAttempts: () => set({ connectionAttempts: 0 }),
        incrementConnectionAttempts: () => set((state: UnifiedVehicleState) => ({ 
          connectionAttempts: state.connectionAttempts + 1 
        }))
      }),
      {
        name: 'unified-vehicle-store', // Persistent storage key
        partialize: (state) => ({
          // Only persist display preferences, not vehicle data
          showSimulated: state.showSimulated,
          showReal: state.showReal,
          statusFilter: state.statusFilter,
        })
      }
    )
  )
);

// Specific hooks for common use cases

/**
 * Hook to get the currently selected vehicle
 */
export const useSelectedVehicle = () => useUnifiedVehicleStore(state => ({
  vehicle: state.getSelectedVehicle(),
  selectVehicle: state.selectVehicle
}));

/**
 * Hook to get filtered vehicles
 */
export const useFilteredVehicles = () => useUnifiedVehicleStore(state => 
  state.getFilteredVehicles()
);

/**
 * Hook to get vehicles by status
 */
export const useVehiclesByStatus = (status: VehicleStatus) => useUnifiedVehicleStore(state => 
  state.getVehiclesByStatus(status)
);

/**
 * Hook to get vehicle connection status
 */
export const useVehicleConnectionStatus = () => useUnifiedVehicleStore(state => ({
  isConnected: state.isConnected,
  lastServerSync: state.lastServerSync,
  connectionAttempts: state.connectionAttempts
})); 