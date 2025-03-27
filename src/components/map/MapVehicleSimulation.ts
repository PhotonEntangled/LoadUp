/**
 * SIMULATION COMPLETELY DISABLED
 * 
 * This file contains a no-op implementation of the vehicle simulation.
 * All methods are stubs that do nothing to prevent performance issues.
 * 
 * DO NOT MODIFY THIS FILE TO ENABLE SIMULATION - it causes serious performance issues.
 */

import { Vehicle } from '../../store/map/useVehicleStore';

// Empty configuration
export interface SimulationConfig {
  vehicleCount?: number;
  updateFrequency?: number;
  speedMultiplier?: number;
  baseLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDeviation?: number;
  speedRange?: {
    min: number;
    max: number;
  };
}

// Empty route
export interface Route {
  waypoints: [number, number][];
  speed: number;
}

// Default config - never actually used, just for type completion
const DEFAULT_CONFIG: Required<SimulationConfig> = {
  vehicleCount: 0,
  updateFrequency: 1000,
  speedMultiplier: 1,
  baseLocation: {
    latitude: 0,
    longitude: 0
  },
  maxDeviation: 0,
  speedRange: {
    min: 0,
    max: 0
  }
};

// Vehicle interfaces just for type compatibility
interface SimVehicle {
  id: string;
  [key: string]: any;
}

interface SimVehicleLocation {
    latitude: number;
    longitude: number;
  [key: string]: any;
}

// No-op class that implements all original methods but does nothing
export class MapVehicleSimulation {
  private static instance: MapVehicleSimulation | null = null;
  
  // Constructor is public to avoid TypeScript errors with getInstance
  constructor() {
    // Only create a new instance if one doesn't exist already
    if (MapVehicleSimulation.instance) {
      console.log('[MapVehicleSimulation] Returning existing instance');
      return MapVehicleSimulation.instance;
    }
    
    console.log('[MapVehicleSimulation] Created disabled simulator (no-op)');
    MapVehicleSimulation.instance = this;
  }
  
  // Singleton getter - static method to get the instance
  public static getInstance(): MapVehicleSimulation {
    if (!MapVehicleSimulation.instance) {
      MapVehicleSimulation.instance = new MapVehicleSimulation();
    }
    return MapVehicleSimulation.instance;
  }
  
  // No-op initialize method - does nothing
  public initialize(): void {
    console.log('[MapVehicleSimulation] Initialize called (no-op)');
  }
  
  // No-op cleanup method - does nothing
  public cleanup(): void {
    console.log('[MapVehicleSimulation] Cleanup called (no-op)');
  }
  
  // No-op update method - does nothing
  public update(): void {
    // No-op
  }
  
  // No-op getter methods
  public getVehicles(): SimVehicle[] {
    return [];
  }
  
  public getVehicleLocations(): Record<string, SimVehicleLocation> {
    return {};
  }
  
  // No-op status methods
  public isInitialized(): boolean {
    return false;
  }
  
  public isRunning(): boolean {
    return false;
  }
  
  // Other compatibility methods
  public addVehicle(): void {
    // No-op
  }
  
  public removeVehicle(): void {
    // No-op
  }
  
  public setVehicleCount(): void {
    // No-op
  }
  
  public toggleRunning(): void {
    // No-op
  }
  
  public setRunning(): void {
    // No-op
  }
}

// Keep the original factory function API
export const createMapVehicleSimulation = (): MapVehicleSimulation => {
  return MapVehicleSimulation.getInstance();
};

// Maintain backward compatibility with the old API
let simulationInstance: MapVehicleSimulation | null = null;

export default (config?: any): MapVehicleSimulation => {
  if (simulationInstance) {
    return simulationInstance;
  }
  
  // Always return a new disabled instance
  simulationInstance = MapVehicleSimulation.getInstance();
  return simulationInstance;
};

/**
 * Clear simulation instance (DISABLED)
 * Does nothing but clear the reference
 */
export const clearSimulationInstance = () => {
  console.warn('⚠️ SIMULATION DISABLED: clearSimulationInstance() called but simulation is disabled.');
  simulationInstance = null;
}; 