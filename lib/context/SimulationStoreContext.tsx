"use client";

import React, { createContext, useRef, useContext, type ReactNode } from 'react';
import { type StoreApi } from 'zustand';
import { createSimulationStore, type SimulationStoreApi } from '@/lib/store/useSimulationStore';

// Define the type for the context value, which is the Zustand store API
export type SimulationStoreContextValue = StoreApi<SimulationStoreApi> | null;

// Create the React Context with a default value of null
export const SimulationStoreContext = createContext<SimulationStoreContextValue>(null);

// Define the props for the Provider component
interface SimulationStoreProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const SimulationStoreProvider = ({ children }: SimulationStoreProviderProps) => {
  // Use useRef to ensure the store is created only once per component instance
  const storeRef = useRef<StoreApi<SimulationStoreApi>>();

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