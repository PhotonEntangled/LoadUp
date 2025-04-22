"use client";

import React, { createContext, useRef, type ReactNode } from 'react';
import { type StoreApi } from 'zustand';
// Import the necessary types from the store file
import { createSimulationStore, type SimulationStoreApi, type SimulationState, type SimulationActions } from '@/lib/store/useSimulationStore';

// Define the type for the context value, which is the Zustand store API
// Keep this name distinct if SimulationStoreApi is also imported
export type SimulationStoreContextValue = StoreApi<SimulationState & SimulationActions> | undefined;

// Create the React Context with a default value of undefined
export const SimulationStoreContext = createContext<SimulationStoreContextValue>(undefined);

// Define the props for the Provider component
interface SimulationStoreProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const SimulationStoreProvider = ({ children }: SimulationStoreProviderProps) => {
  // Use useRef to ensure the store is created only once per component instance
  // The ref should hold the actual store API type
  const storeRef = useRef<StoreApi<SimulationState & SimulationActions>>();

  // If the store hasn't been created yet, create it
  if (!storeRef.current) {
    storeRef.current = createSimulationStore();
  }

  // Provide the store instance through the context
  return (
    <SimulationStoreContext.Provider value={storeRef.current}>
      {children}
    </SimulationStoreContext.Provider>
  );
}; 