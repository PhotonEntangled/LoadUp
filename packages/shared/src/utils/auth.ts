import { TruckDriver } from '../types/index.js';

export type UserRole = 'admin' | 'driver';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  driverId?: string;
}

export interface Session {
  user: User;
  expires: string;
}

export const isAdmin = (user?: User | null): boolean => {
  return user?.role === 'admin';
};

export const isDriver = (user?: User | null): boolean => {
  return user?.role === 'driver';
};

export const canManageShipments = (user?: User | null): boolean => {
  return isAdmin(user);
};

export const canViewShipment = (user: User | null, shipment: { assignedDriverId?: string | null }): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isDriver(user) && user.driverId === shipment.assignedDriverId) return true;
  return false;
};

export const canUpdateShipmentStatus = (user: User | null, shipment: { assignedDriverId?: string | null }): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isDriver(user) && user.driverId === shipment.assignedDriverId) return true;
  return false;
};

export const canManageDrivers = (user?: User | null): boolean => {
  return isAdmin(user);
};

export const canUpdateDriverLocation = (user: User | null, driver: TruckDriver): boolean => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (isDriver(user) && user.driverId === driver.id) return true;
  return false;
}; 