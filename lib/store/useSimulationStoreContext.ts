import { useContext } from 'react';
import { useStore } from 'zustand';
// Import the correct context value type
import { SimulationStoreContext, type SimulationStoreContextValue } from '@/lib/context/SimulationStoreContext';
// Import the state/action types directly from the store definition for the selector
import type { SimulationState, SimulationActions } from '@/lib/store/useSimulationStore';

// Define the type for the selector function
// The selector receives the state, not the entire store API
type Selector<T> = (state: SimulationState & SimulationActions) => T;

// Hook to safely access the context value
export const useSimulationStoreContext = <T,>(selector: Selector<T>): T => {
  // Use the correct context value type here
  const store = useContext(SimulationStoreContext);

  // Throw an error if the hook is used outside of a provider
  if (!store) {
    throw new Error('useSimulationStoreContext must be used within SimulationStoreProvider');
  }

  // Use Zustand's useStore hook to subscribe to the store slice
  return useStore(store, selector);
}; 