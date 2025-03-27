import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Vehicle } from '../types/vehicle';
import { useUnifiedVehicleStore } from '../store/useUnifiedVehicleStore';
import { VehicleListPresenter } from './VehicleListPresenter';

interface VehicleListContainerProps {
  className?: string;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

/**
 * Container component that handles all data fetching and store interactions
 * Completely isolates the presentational component from Zustand
 * Uses a pure unidirectional data flow to prevent infinite render loops
 */
export const VehicleListContainer: React.FC<VehicleListContainerProps> = ({ 
  className, 
  onVehicleSelect 
}) => {
  // Use local React state instead of reading from store during render
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Refs to store the latest state without triggering re-renders
  const vehiclesRef = useRef<Vehicle[]>([]);
  const selectedVehicleIdRef = useRef<string | null>(null);
  
  // Create a stable onSelect handler that we can pass to the presenter
  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    // Update the selection in the store
    useUnifiedVehicleStore.getState().selectVehicle(vehicle.id);
    
    // Call external handler if provided
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  }, [onVehicleSelect]);
  
  // Setup subscription to store updates completely outside of render cycle
  useEffect(() => {
    function updateFromStore() {
      // Get current values from store
      const state = useUnifiedVehicleStore.getState();
      const storeVehicles = state.getFilteredVehicles();
      const storeSelectedId = state.selectedVehicleId;
      
      // Check if data has changed
      const vehiclesChanged = !areVehicleArraysEqual(vehiclesRef.current, storeVehicles);
      const selectionChanged = selectedVehicleIdRef.current !== storeSelectedId;
      
      // Only update state if something changed
      if (vehiclesChanged) {
        vehiclesRef.current = storeVehicles;
        setVehicles(storeVehicles);
      }
      
      if (selectionChanged) {
        selectedVehicleIdRef.current = storeSelectedId;
        setSelectedVehicleId(storeSelectedId);
      }
    }
    
    // Initial update
    updateFromStore();
    
    // Subscribe to store changes
    const unsubscribe = useUnifiedVehicleStore.subscribe(updateFromStore);
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  // Compute the vehicle count only once per render
  const vehicleCount = useMemo(() => vehicles.length, [vehicles]);
  
  // Return the presenter component with stable props
  return (
    <VehicleListPresenter
      vehicles={vehicles}
      vehicleCount={vehicleCount}
      selectedVehicleId={selectedVehicleId}
      onVehicleSelect={handleVehicleSelect}
      className={className}
    />
  );
};

/**
 * Helper function to check if two vehicle arrays are equal
 * Only compares fields that would affect rendering
 */
function areVehicleArraysEqual(prevVehicles: Vehicle[], newVehicles: Vehicle[]): boolean {
  if (prevVehicles.length !== newVehicles.length) {
    return false;
  }
  
  for (let i = 0; i < prevVehicles.length; i++) {
    const prev = prevVehicles[i];
    const next = newVehicles[i];
    
    if (
      prev.id !== next.id ||
      prev.status !== next.status ||
      prev.type !== next.type ||
      prev.isSimulated !== next.isSimulated ||
      prev.speed !== next.speed ||
      prev.heading !== next.heading ||
      prev.location.latitude !== next.location.latitude ||
      prev.location.longitude !== next.location.longitude ||
      prev.lastUpdated !== next.lastUpdated
    ) {
      return false;
    }
  }
  
  return true;
} 