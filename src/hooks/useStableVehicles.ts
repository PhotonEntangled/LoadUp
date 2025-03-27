import { useStableVehicleList } from '../store/stableVehicleStore';

/**
 * Hook that provides stable references to filtered vehicles to prevent render loops
 * 
 * This hook is now a simple wrapper around our stable vehicle store implementation.
 * The actual work of preventing infinite loops is done by the store wrapper.
 */
export function useStableVehicles() {
  return useStableVehicleList();
} 