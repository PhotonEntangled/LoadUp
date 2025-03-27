/**
 * useSimulationStore (Placeholder)
 * 
 * This is a simplified placeholder for the useSimulationStore.
 * The original implementation has been removed to rebuild from scratch.
 * 
 * See useSimulationStore.ts.bak for the original implementation.
 */

import { create } from 'zustand';

// Simplified simulation state
interface SimulationState {
  isRunning: boolean;
  isDisabled: boolean;
  message: string;
}

// Define the store interface with minimal actions
interface SimulationStore extends SimulationState {
  // Placeholder actions that do nothing
  start: () => void;
  stop: () => void;
  reset: () => void;
}

// Initial state
const initialState: SimulationState = {
  isRunning: false,
  isDisabled: true,
  message: 'Simulation is disabled and being rebuilt from scratch',
};

// Create the simplified store
export const useSimulationStore = create<SimulationStore>((set) => ({
  // Initial state
  ...initialState,

  // Placeholder actions
  start: () => {
    console.log('[useSimulationStore] start() called, but simulation is disabled');
    set({ message: 'Simulation start attempted, but simulation is disabled' });
  },
  
  stop: () => {
    console.log('[useSimulationStore] stop() called, but simulation is disabled');
    set({ message: 'Simulation stop attempted, but simulation is disabled' });
  },
  
  reset: () => {
    console.log('[useSimulationStore] reset() called, but simulation is disabled');
    set({ message: 'Simulation reset attempted, but simulation is disabled' });
  },
}));

// Simplified selector hooks
export const useSimulationStatus = () => 
  useSimulationStore(state => ({
    isRunning: state.isRunning,
    isDisabled: state.isDisabled,
    message: state.message,
  })); 