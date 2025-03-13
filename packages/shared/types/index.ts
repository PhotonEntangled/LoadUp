export type Role = 'ADMIN' | 'DRIVER' | 'READ_ONLY';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  assignedDriverId?: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export type ShipmentStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ShipmentHistory {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  updatedById: string;
  timestamp: Date;
  notes?: string;
}

export type DriverStatus = 'AVAILABLE' | 'EN_ROUTE' | 'BUSY' | 'OFFLINE';

export interface Driver extends Omit<User, 'role'> {
  role: 'DRIVER';
  vehicleType: string;
  licenseNumber: string;
  phoneNumber: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  driverStatus: DriverStatus;
} 