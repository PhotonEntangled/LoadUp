import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { createSimpleMockVehicleService } from '../../services/SimpleMockVehicleService';
import { VehicleStatus } from '../../types/vehicle';

interface VehicleSimulationProviderProps {
  children: React.ReactNode;
  initiallyEnabled?: boolean;
  autoStart?: boolean;
  simulationSpeed?: 'slow' | 'normal' | 'fast';
}

/**
 * VehicleSimulationProvider - Controls vehicle simulation lifecycle
 * 
 * This component manages the lifecycle of the mock vehicle service
 * and provides controls for simulation (start/stop/speed/etc).
 * 
 * It acts as a container component that should wrap any components
 * that need access to simulated vehicles.
 */
export const VehicleSimulationProvider: React.FC<VehicleSimulationProviderProps> = ({
  children,
  initiallyEnabled = true,
  autoStart = true,
  simulationSpeed = 'normal'
}) => {
  // Get store actions for mock service
  const store = useUnifiedVehicleStore();
  
  // Local state
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(simulationSpeed);
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>('moving');
  
  // Create mock service with store actions
  const vehicleService = useMemo(() => 
    createSimpleMockVehicleService({
      updateVehicleBatch: store.updateVehicleBatch,
      setIsConnected: store.setIsConnected,
      setLastServerSync: store.setLastServerSync,
      resetConnectionAttempts: store.resetConnectionAttempts,
      incrementConnectionAttempts: store.incrementConnectionAttempts,
      removeVehicle: store.removeVehicle,
    }), [store]);
  
  // Initialize vehicle service
  useEffect(() => {
    if (initiallyEnabled) {
      if (autoStart) {
        vehicleService.initialize();
        setIsRunning(true);
      }
      
      // Enable movement simulation
      if ('setMovementEnabled' in vehicleService) {
        vehicleService.setMovementEnabled(true);
      }
      
      // Cleanup on unmount
      return () => {
        vehicleService.terminate();
      };
    }
  }, [initiallyEnabled, autoStart, vehicleService]);
  
  // Start simulation
  const startSimulation = useCallback(() => {
    vehicleService.initialize();
    setIsRunning(true);
  }, [vehicleService]);
  
  // Stop simulation
  const stopSimulation = useCallback(() => {
    vehicleService.terminate();
    setIsRunning(false);
  }, [vehicleService]);
  
  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [isRunning, startSimulation, stopSimulation]);
  
  // Update simulation speed
  const updateSpeed = useCallback((newSpeed: 'slow' | 'normal' | 'fast') => {
    setSpeed(newSpeed);
    
    // If we had access to the internal timing, we would update it
    // For now, this is just a placeholder
    console.log(`[VehicleSimulationProvider] Speed set to ${newSpeed}`);
  }, []);
  
  // Update vehicle status
  const updateVehicleStatus = useCallback((status: VehicleStatus) => {
    setVehicleStatus(status);
    
    if ('setVehicleStatus' in vehicleService) {
      vehicleService.setVehicleStatus(status);
    }
  }, [vehicleService]);
  
  // Reset simulation
  const resetSimulation = useCallback(() => {
    if ('reset' in vehicleService) {
      vehicleService.reset();
    }
  }, [vehicleService]);
  
  // Create simulation context value
  const simulationContextValue = useMemo(() => ({
    isRunning,
    speed,
    vehicleStatus,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    updateSpeed,
    updateVehicleStatus,
    resetSimulation,
    vehicleService
  }), [
    isRunning, 
    speed, 
    vehicleStatus, 
    startSimulation, 
    stopSimulation, 
    toggleSimulation, 
    updateSpeed, 
    updateVehicleStatus, 
    resetSimulation,
    vehicleService
  ]);
  
  // Render children with simulation controls and access to service
  return (
    <SimulationContext.Provider value={simulationContextValue}>
      {children}
    </SimulationContext.Provider>
  );
};

// Create simulation context for accessing simulation state and controls
export const SimulationContext = React.createContext<{
  isRunning: boolean;
  speed: 'slow' | 'normal' | 'fast';
  vehicleStatus: VehicleStatus;
  startSimulation: () => void;
  stopSimulation: () => void;
  toggleSimulation: () => void;
  updateSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  updateVehicleStatus: (status: VehicleStatus) => void;
  resetSimulation: () => void;
  vehicleService: any;
}>({
  isRunning: false,
  speed: 'normal',
  vehicleStatus: 'moving',
  startSimulation: () => {},
  stopSimulation: () => {},
  toggleSimulation: () => {},
  updateSpeed: () => {},
  updateVehicleStatus: () => {},
  resetSimulation: () => {},
  vehicleService: null
});

// Custom hook for accessing simulation context
export const useSimulation = () => React.useContext(SimulationContext);

export default VehicleSimulationProvider; 