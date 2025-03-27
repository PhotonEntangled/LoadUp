import { useUnifiedVehicleStore } from './useUnifiedVehicleStore';
import { createStableSelector, createStableShallowSelector } from './stableSelectorStore';
import { Vehicle, VehicleStatus } from '../types/vehicle';

/**
 * Create stable selector hooks for the unified vehicle store
 */
const useStableVehicleSelector = createStableSelector(useUnifiedVehicleStore);
const useStableVehicleShallowSelector = createStableShallowSelector(useUnifiedVehicleStore);

/**
 * Selects vehicles with proper filtering and sorting in a stable way
 * to prevent infinite render loops.
 */
export function useStableFilteredVehicles() {
  return useStableVehicleSelector((state) => {
    const { vehicles, showSimulated, showReal, statusFilter, searchTerm } = state;
    
    const filteredVehicles = Object.values(vehicles).filter(vehicle => {
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
    
    // Status priority for sorting
    const statusPriority: Record<VehicleStatus, number> = {
      'moving': 1,
      'loading': 2,
      'unloading': 2,
      'idle': 3,
      'maintenance': 4,
      'pending': 5,
      'in-progress': 6,
      'completed': 7,
      'delayed': 8,
      'failed': 9,
      'arrived': 10,
      'departed': 11,
      'skipped': 12,
      'delivered': 13
    };
    
    // Sort by status priority (create new array to avoid mutating original)
    return [...filteredVehicles].sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
  });
}

/**
 * Selects the vehicle selection state and actions in a stable way
 */
export function useStableVehicleSelection() {
  return useStableVehicleShallowSelector(state => ({
    selectedVehicleId: state.selectedVehicleId,
    selectVehicle: state.selectVehicle
  }));
}

/**
 * Selects the vehicle count in a stable way
 */
export function useStableVehicleCount() {
  return useStableVehicleSelector(state => {
    const { vehicles, showSimulated, showReal, statusFilter, searchTerm } = state;
    
    // Get vehicle count with the same filtering logic
    return Object.values(vehicles).filter(vehicle => {
      if (vehicle.isSimulated && !showSimulated) return false;
      if (!vehicle.isSimulated && !showReal) return false;
      
      if (statusFilter && statusFilter.length > 0 && !statusFilter.includes(vehicle.status)) {
        return false;
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return vehicle.id.toLowerCase().includes(term);
      }
      
      return true;
    }).length;
  });
}

/**
 * Selects a specific vehicle by ID in a stable way
 */
export function useStableVehicle(vehicleId: string | null) {
  return useStableVehicleSelector(state => 
    vehicleId ? state.vehicles[vehicleId] || null : null
  );
}

/**
 * Combined hook that provides all the vehicle data needed for the VehicleList
 * component in a single, stable object
 */
export function useStableVehicleList() {
  // Get filtered vehicles
  const vehicles = useStableFilteredVehicles();
  
  // Get vehicle count
  const vehicleCount = useStableVehicleCount();
  
  // Get selection state and actions
  const { selectedVehicleId, selectVehicle } = useStableVehicleSelection();
  
  // Return a stable API that includes all the necessary data
  return {
    vehicles,
    vehicleCount,
    selectedVehicleId,
    selectVehicle
  };
} 