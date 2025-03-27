/**
 * Simulation Types (Placeholder)
 * 
 * This is a simplified placeholder for the simulation types.
 * The original implementation has been removed to rebuild from scratch.
 * 
 * See simulation.ts.bak for the original implementation.
 */

/**
 * Core vehicle type for the simulation system (placeholder)
 */
export interface SimulationVehicle {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Minimal simulation state (placeholder)
 */
export interface SimulationState {
  isRunning: boolean;
  isDisabled: boolean;
  message: string;
}

/**
 * Exported for backward compatibility, but not used
 */
export interface SimulationRoute {
  id: string;
}

export interface SimulationStop {
  id: string;
}

export interface GeofenceEvent {
  id: string;
}

// Export type to prevent import errors
export type SimulationControls = {
  start: () => void;
  stop: () => void;
  reset: () => void;
}; 