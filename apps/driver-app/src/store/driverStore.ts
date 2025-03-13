import { create } from 'zustand';
import { TruckDriver, Shipment } from '@loadup/shared';
import { StateCreator } from 'zustand';

interface DriverStore {
  currentDriver: TruckDriver | null;
  currentShipment: Shipment | null;
  isOnline: boolean;
  setCurrentDriver: (driver: TruckDriver | null) => void;
  setCurrentShipment: (shipment: Shipment | null) => void;
  updateDriverLocation: (location: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  }) => void;
  setOnlineStatus: (status: boolean) => void;
}

export const useDriverStore = create<DriverStore>((set: StateCreator<DriverStore>) => ({
  currentDriver: null,
  currentShipment: null,
  isOnline: false,

  setCurrentDriver: (driver: TruckDriver | null) => set({ currentDriver: driver }),
  
  setCurrentShipment: (shipment: Shipment | null) => set({ currentShipment: shipment }),
  
  updateDriverLocation: (location: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  }) =>
    set((state: DriverStore) => ({
      currentDriver: state.currentDriver
        ? {
            ...state.currentDriver,
            currentLocation: location,
          }
        : null,
    })),
    
  setOnlineStatus: (status: boolean) =>
    set((state: DriverStore) => ({
      isOnline: status,
      currentDriver: state.currentDriver
        ? {
            ...state.currentDriver,
            status: status ? 'available' : 'offline',
          }
        : null,
    })),
})); 