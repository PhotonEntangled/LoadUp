import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the authentication state
interface AuthState {
  user: {
    id: string;
    email: string;
    role: string;
    fullName?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  setUser: (user: AuthState['user']) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  logout: () => void;
  clearUser: () => void;
}

// Create the authentication store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, isAuthenticated: false }),
      clearUser: () => set({ user: null, isAuthenticated: false, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Define the shipment state
interface Shipment {
  id: string;
  externalId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  weight?: number;
  dimensions?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ShipmentState {
  shipments: Shipment[];
  isLoading: boolean;
  error: Error | null;
  setShipments: (shipments: Shipment[]) => void;
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, shipment: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Create the shipment store
export const useShipmentStore = create<ShipmentState>()((set) => ({
  shipments: [],
  isLoading: false,
  error: null,
  setShipments: (shipments) => set({ shipments }),
  addShipment: (shipment) =>
    set((state) => ({ shipments: [...state.shipments, shipment] })),
  updateShipment: (id, updatedShipment) =>
    set((state) => ({
      shipments: state.shipments.map((shipment) =>
        shipment.id === id ? { ...shipment, ...updatedShipment } : shipment
      ),
    })),
  deleteShipment: (id) =>
    set((state) => ({
      shipments: state.shipments.filter((shipment) => shipment.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Define the driver state
interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  location?: {
    lat: number;
    lng: number;
  };
  currentShipmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DriverState {
  drivers: Driver[];
  isLoading: boolean;
  error: Error | null;
  setDrivers: (drivers: Driver[]) => void;
  updateDriver: (id: string, driver: Partial<Driver>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Create the driver store
export const useDriverStore = create<DriverState>()((set) => ({
  drivers: [],
  isLoading: false,
  error: null,
  setDrivers: (drivers) => set({ drivers }),
  updateDriver: (id, updatedDriver) =>
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === id ? { ...driver, ...updatedDriver } : driver
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 