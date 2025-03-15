import { ShipmentSlip } from '../schema/validation.js';

// Types for raw data
interface RawAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: { lat: number; lng: number };
}

interface StandardAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates: { lat: number; lng: number };
  formattedAddress?: string;
}

export interface RawShipmentData {
  externalId: string;
  pickupAddress: RawAddress;
  deliveryAddress: RawAddress;
  customerName: string;
  customerPhone: string;
  weight?: number | string;
  dimensions?: string;
  priority?: 'STANDARD' | 'EXPRESS' | 'PRIORITY';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
  notes?: string;
}

interface ValidatedShipment extends Omit<ShipmentSlip, 'pickupAddress' | 'deliveryAddress'> {
  pickupAddress: StandardAddress;
  deliveryAddress: StandardAddress;
}

// Address standardization
const normalizeAddress = (address: RawAddress): RawAddress => {
  return {
    street: address.street.trim().replace(/\s+/g, ' ').replace(/(\w)(\w*)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase()),
    city: address.city.trim().replace(/\s+/g, ' ').replace(/(\w)(\w*)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase()),
    state: address.state.trim().toUpperCase(),
    zip: address.zip.trim(),
    coordinates: address.coordinates
  };
};

// Format address for display
const formatAddress = (address: RawAddress): string => {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
};

// Geocode address (mock implementation)
const geocodeAddress = (address: RawAddress): { lat: number; lng: number } => {
  // In a real implementation, this would call a geocoding service
  // For now, return mock coordinates if none provided
  if (address.coordinates) {
    return address.coordinates;
  }
  
  // Mock coordinates based on state
  const stateCoordinates: Record<string, { lat: number; lng: number }> = {
    'NY': { lat: 40.7128, lng: -74.0060 },
    'CA': { lat: 37.7749, lng: -122.4194 },
    'TX': { lat: 29.7604, lng: -95.3698 },
    // Default coordinates
    'DEFAULT': { lat: 39.8283, lng: -98.5795 }
  };
  
  return stateCoordinates[address.state] || stateCoordinates['DEFAULT'];
};

// Standardize address
const standardizeAddress = (address: RawAddress): StandardAddress => {
  const normalized = normalizeAddress(address);
  const coordinates = geocodeAddress(normalized);
  return {
    ...normalized,
    coordinates,
    formattedAddress: formatAddress(normalized)
  };
};

// Standardize phone number
const standardizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Ensure it has country code
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`;
  } else if (phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  return `+1${digits}`;
};

// Determine priority based on data
const determinePriority = (data: RawShipmentData): 'STANDARD' | 'EXPRESS' | 'PRIORITY' => {
  if (data.priority) {
    return data.priority;
  }
  
  // Default to STANDARD
  return 'STANDARD';
};

// Main transformation function
export const transformShipmentData = (data: RawShipmentData): ValidatedShipment => {
  return {
    externalId: data.externalId,
    pickupAddress: standardizeAddress(data.pickupAddress),
    deliveryAddress: standardizeAddress(data.deliveryAddress),
    customerName: data.customerName.trim(),
    customerPhone: standardizePhoneNumber(data.customerPhone),
    weight: typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight,
    dimensions: data.dimensions?.trim(),
    priority: determinePriority(data),
    notes: data.notes?.trim(),
    paymentStatus: data.paymentStatus || 'PENDING'
  };
}; 