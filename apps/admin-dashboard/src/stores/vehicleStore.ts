import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define types for vehicle data
export interface VehicleLocation {
  lngLat: [number, number];
  heading: number;
  speed: number;
  timestamp: string;
}

export interface VehicleRoute {
  id: string;
  waypoints: [number, number][];
  status: 'active' | 'completed' | 'planned';
  etaMinutes?: number;
  distanceMeters?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  status: 'delivering' | 'loading' | 'idle' | 'delivered';
  position: [number, number];
  heading: number;
  speed: number;
  lastUpdate: string;
  route: [number, number][];
  driver?: {
    id: string;
    name: string;
    phone?: string;
  };
  vehicle?: {
    type: string;
    licensePlate?: string;
    capacity?: number;
  };
}

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclePosition: (vehicleId: string, position: [number, number], heading?: number, speed?: number) => void;
  selectVehicle: (vehicleId: string | null) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  updateVehicleRoute: (vehicleId: string, route: [number, number][]) => void;
  
  // Selectors (computed values)
  getActiveVehicles: () => Vehicle[];
  getVehicleById: (id: string) => Vehicle | undefined;
  getVehiclesByStatus: (status: Vehicle['status']) => Vehicle[];
}

// Sample initial data (for development)
const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'v-001',
    name: 'Truck 001',
    status: 'delivering',
    position: [-122.4194, 37.7749],
    heading: 45,
    speed: 35,
    lastUpdate: new Date().toISOString(),
    route: [
      [-122.4194, 37.7749],
      [-122.4156, 37.7598],
      [-122.4090, 37.7516],
      [-122.4030, 37.7380],
    ],
    driver: {
      id: 'd-001',
      name: 'John Smith',
      phone: '555-123-4567'
    },
    vehicle: {
      type: 'Delivery Truck',
      licensePlate: 'CA-1234',
      capacity: 5000
    }
  },
  {
    id: 'v-002',
    name: 'Truck 002',
    status: 'loading',
    position: [-74.0060, 40.7128],
    heading: 90,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    route: [
      [-74.0060, 40.7128],
      [-73.9867, 40.7585],
      [-73.9624, 40.7799],
    ],
    driver: {
      id: 'd-002',
      name: 'Emily Johnson',
      phone: '555-234-5678'
    },
    vehicle: {
      type: 'Box Truck',
      licensePlate: 'NY-5678',
      capacity: 3000
    }
  },
  {
    id: 'v-003',
    name: 'Truck 003',
    status: 'idle',
    position: [-87.6298, 41.8781],
    heading: 180,
    speed: 0,
    lastUpdate: new Date().toISOString(),
    route: [],
    driver: {
      id: 'd-003',
      name: 'Michael Brown',
      phone: '555-345-6789'
    },
    vehicle: {
      type: 'Van',
      licensePlate: 'IL-9012',
      capacity: 1500
    }
  }
];

// Create the store
export const useVehicleStore = create<VehicleState>()(
  devtools(
    (set, get) => ({
      vehicles: SAMPLE_VEHICLES,
      selectedVehicleId: null,
      isLoading: false,
      error: null,
      
      // Actions
      setVehicles: (vehicles) => set({ vehicles }),
      
      updateVehiclePosition: (vehicleId, position, heading, speed) => set((state) => {
        const updatedVehicles = state.vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              position,
              heading: heading !== undefined ? heading : vehicle.heading,
              speed: speed !== undefined ? speed : vehicle.speed,
              lastUpdate: new Date().toISOString()
            };
          }
          return vehicle;
        });
        
        return { vehicles: updatedVehicles };
      }),
      
      selectVehicle: (vehicleId) => set({ selectedVehicleId: vehicleId }),
      
      updateVehicleStatus: (vehicleId, status) => set((state) => {
        const updatedVehicles = state.vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              status,
              lastUpdate: new Date().toISOString()
            };
          }
          return vehicle;
        });
        
        return { vehicles: updatedVehicles };
      }),
      
      updateVehicleRoute: (vehicleId, route) => set((state) => {
        const updatedVehicles = state.vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              route,
              lastUpdate: new Date().toISOString()
            };
          }
          return vehicle;
        });
        
        return { vehicles: updatedVehicles };
      }),
      
      // Selectors
      getActiveVehicles: () => {
        return get().vehicles.filter(v => v.status === 'delivering' || v.status === 'loading');
      },
      
      getVehicleById: (id) => {
        return get().vehicles.find(v => v.id === id);
      },
      
      getVehiclesByStatus: (status) => {
        return get().vehicles.filter(v => v.status === status);
      }
    }),
    { name: 'vehicle-store' }
  )
); 