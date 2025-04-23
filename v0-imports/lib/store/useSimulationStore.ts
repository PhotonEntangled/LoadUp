import { create } from "zustand"
import type { SimulatedVehicle } from "../../types/vehicles"

interface SimulationState {
  // Simulation control
  isSimulationRunning: boolean
  simulationSpeedMultiplier: number

  // Vehicle data
  vehicles: Record<string, SimulatedVehicle>
  selectedVehicleId: string | null

  // Actions
  startGlobalSimulation: () => void
  stopGlobalSimulation: () => void
  setSimulationSpeed: (speed: number) => void
  setSelectedVehicleId: (id: string | null) => void
  resetStore: () => void
}

// Initial mock vehicles
const initialVehicles: Record<string, SimulatedVehicle> = {
  "vehicle-1": {
    id: "vehicle-1",
    shipmentId: "ship-123",
    status: "En Route",
    driverName: "John Smith",
    truckId: "TRUCK-001",
    bearing: 45,
    currentPosition: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.4194, 37.7749], // San Francisco
      },
      properties: {},
    },
    route: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4194, 37.7749], // San Francisco
          [-118.2437, 34.0522], // Los Angeles
        ],
      },
      properties: {},
    },
  },
  "vehicle-2": {
    id: "vehicle-2",
    shipmentId: "ship-456",
    status: "Idle",
    driverName: "Jane Doe",
    truckId: "TRUCK-002",
    bearing: 90,
    currentPosition: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-74.006, 40.7128], // New York
      },
      properties: {},
    },
  },
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Initial state
  isSimulationRunning: false,
  simulationSpeedMultiplier: 1,
  vehicles: initialVehicles,
  selectedVehicleId: null,

  // Actions
  startGlobalSimulation: () => set({ isSimulationRunning: true }),
  stopGlobalSimulation: () => set({ isSimulationRunning: false }),
  setSimulationSpeed: (speed) => set({ simulationSpeedMultiplier: speed }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  resetStore: () =>
    set({
      isSimulationRunning: false,
      simulationSpeedMultiplier: 1,
      vehicles: initialVehicles,
      selectedVehicleId: null,
    }),
}))
