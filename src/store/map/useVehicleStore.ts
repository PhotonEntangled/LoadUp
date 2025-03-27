import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// Vehicle types
export type VehicleType = 'truck' | 'van' | 'car' | 'bike' | string;

// Vehicle statuses
export type VehicleStatus = 
  | 'active'      // Vehicle is available and ready
  | 'delivery'    // Vehicle is on a delivery task
  | 'pickup'      // Vehicle is on a pickup task
  | 'returning'   // Vehicle is returning to base/depot
  | 'maintenance' // Vehicle is under maintenance
  | 'inactive'    // Vehicle is temporarily inactive
  | 'offline'     // Vehicle is offline/unavailable
  | string;       // Allow for custom statuses

// Vehicle model
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  status: VehicleStatus;
  licenseNumber: string;
  capacity?: number;       // Capacity in kg or items
  currentOrderId?: string; // Current order being handled if any
  driverId?: string;       // Associated driver
  notes?: string;          // Any notes about the vehicle
}

// Real vehicle model extends basic vehicle with tracking data
export interface RealVehicle extends Vehicle {
  lastUpdate?: number;     // Timestamp of last update
  lastPosition?: {
    latitude: number;
    longitude: number;
  };
}

// Filter options
export interface VehicleFilters {
  types: VehicleType[];
  statuses: VehicleStatus[];
  searchTerm: string;
}

// Store state
interface VehicleState {
  vehicles: Vehicle[];
  filters: VehicleFilters;
  selectedVehicleId: string | null;
  isConnected: boolean;         // Is connected to tracking service
  lastServerSync: Date | null;  // Last time synced with server
  connectionAttempts: number;   // Number of connection attempts
  error: string | null;         // Any error message
  isMockFallback: boolean;      // Whether using mock fallback
}

// Store actions
interface VehicleActions {
  // CRUD operations
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  
  // Batch operations
  updateVehicleBatch: (updates: Record<string, RealVehicle>) => void;
  
  // Filtering
  setFilter: (filter: Partial<VehicleFilters>) => void;
  clearFilters: () => void;
  
  // Selection
  selectVehicle: (id: string | null) => void;
  
  // Connection status
  setConnectionStatus: (isConnected: boolean) => void;
  setLastServerSync: (time: Date) => void;
  incrementConnectionAttempts: () => void;
  resetConnectionAttempts: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  
  // Fallback management
  setIsMockFallback: (isMock: boolean) => void;
}

// Combined store type
export type VehicleStore = VehicleState & VehicleActions;

// Initial filter state
const initialFilters: VehicleFilters = {
  types: [],
  statuses: [],
  searchTerm: '',
};

// Create the store
export const useVehicleStore = create<VehicleStore>()(
  devtools(
    (set) => ({
      // Initial state
      vehicles: [],
      filters: initialFilters,
      selectedVehicleId: null,
      isConnected: false,
      lastServerSync: null,
      connectionAttempts: 0,
      error: null,
      isMockFallback: false,
      
      // CRUD operations
      addVehicle: (vehicle) => 
        set((state) => ({
          vehicles: [...state.vehicles, vehicle],
        })),
        
      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),
        
      removeVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          selectedVehicleId: state.selectedVehicleId === id ? null : state.selectedVehicleId,
        })),
        
      setVehicles: (vehicles) => set({ vehicles }),
      
      // Batch update vehicles from tracking service
      updateVehicleBatch: (updates) =>
        set((state) => {
          const updatedVehicles = [...state.vehicles];
          const vehicleMap = new Map(updatedVehicles.map(v => [v.id, v]));
          
          // Update existing vehicles and add new ones
          Object.entries(updates).forEach(([id, vehicle]) => {
            if (vehicleMap.has(id)) {
              const index = updatedVehicles.findIndex(v => v.id === id);
              updatedVehicles[index] = { ...updatedVehicles[index], ...vehicle };
            } else {
              updatedVehicles.push(vehicle);
            }
          });
          
          return { vehicles: updatedVehicles };
        }),
      
      // Filtering
      setFilter: (filter) =>
        set((state) => ({
          filters: { ...state.filters, ...filter },
        })),
        
      clearFilters: () => set({ filters: initialFilters }),
      
      // Selection
      selectVehicle: (id) => set({ selectedVehicleId: id }),
      
      // Connection status
      setConnectionStatus: (isConnected) => set({ isConnected }),
      setLastServerSync: (time) => set({ lastServerSync: time }),
      incrementConnectionAttempts: () => 
        set((state) => ({ connectionAttempts: state.connectionAttempts + 1 })),
      resetConnectionAttempts: () => set({ connectionAttempts: 0 }),
      
      // Error handling
      setError: (error) => set({ error }),
      
      // Fallback management
      setIsMockFallback: (isMockFallback) => set({ isMockFallback }),
    }),
    { name: 'vehicle-store' }
  )
);

// Selector for filtered vehicles
export const useFilteredVehicles = () => {
  return useVehicleStore((state) => {
    const { vehicles, filters } = state;
    
    return vehicles.filter((vehicle) => {
      // Filter by type if types are selected
      if (filters.types.length > 0 && !filters.types.includes(vehicle.type)) {
        return false;
      }
      
      // Filter by status if statuses are selected
      if (filters.statuses.length > 0 && !filters.statuses.includes(vehicle.status)) {
        return false;
      }
      
      // Filter by search term if provided
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          vehicle.name.toLowerCase().includes(searchLower) ||
          vehicle.licenseNumber.toLowerCase().includes(searchLower) ||
          (vehicle.notes && vehicle.notes.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  });
};

// Selector for selected vehicle
export const useSelectedVehicle = () => {
  const selectedVehicleId = useVehicleStore((state) => state.selectedVehicleId);
  const vehicles = useVehicleStore((state) => state.vehicles);
  
  return vehicles.find((v) => v.id === selectedVehicleId) || null;
};

export const useVehicleById = (id: string) => 
  useVehicleStore(state => state.vehicles.find(vehicle => vehicle.id === id) || null);

export const useVehicleFilter = () => 
  useVehicleStore(state => state.filters); 