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

/**
 * Authentication utility functions
 */

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns True if the email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength requirements
 * @param password Password to validate
 * @returns True if the password meets all requirements
 */
export function validatePassword(password: string): boolean {
  // Check for minimum length
  if (password.length < 8) return false;
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Check for number
  if (!/\d/.test(password)) return false;
  
  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
}

/**
 * Hashes a password using SHA-256 (for testing only)
 * In production, use a proper password hashing library like bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compares a plain password with a hashed password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns True if the passwords match
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const hashed = await hashPassword(plainPassword);
  return hashed === hashedPassword;
} 