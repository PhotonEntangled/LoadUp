/**
 * Unified Vehicle Types for LoadUp Vehicle Tracking
 * 
 * This file contains type definitions for both real and simulated vehicles.
 * These types provide a common interface for the unified tracking system.
 */

/**
 * Location type used across the application
 */
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Possible vehicle status values
 */
export type VehicleStatus = 'pending' | 'in-progress' | 'completed' | 'delayed' | 'failed' 
  | 'arrived' | 'departed' | 'skipped' | 'loading' | 'unloading' | 'moving' | 'idle' | 'maintenance' | 'delivered';

/**
 * Base vehicle interface with common properties
 */
export interface BaseVehicle {
  id: string;
  type: string;
  location: Location;
  heading: number;  // Direction in degrees
  speed: number;    // Current speed in km/h
  status: VehicleStatus;
  lastUpdated: Date;
}

/**
 * Shipment data interface for vehicles created from shipments
 */
export interface ShipmentData {
  orderId: string;
  poNumber: string;
  shipDate: string;
  origin: string;
  destination: string;
  contact: string;
  remarks: string;
  weight: number;
  [key: string]: any; // Allow additional shipment properties
}

/**
 * Simulated vehicle with simulation-specific properties
 */
export interface SimulatedVehicle extends BaseVehicle {
  isSimulated: true;
  route?: {
    id: string;
    stops: Array<{
      id: string;
      location: Location;
      type: string;
    }>;
    currentStopIndex: number;
  };
  driver?: {
    id: string;
    name: string;
    phone?: string;
  };
  
  // Extended properties for rendering
  routeData?: {
    id: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    width: number;
    glow?: boolean;
  };
  
  // Visual properties for rendering
  visuals?: {
    color?: string;
    size?: number;
    pulseEffect?: boolean;
    emoji?: string;
    fontSize?: number;
  };

  // Shipment data associated with this vehicle (for vehicles created from shipments)
  shipmentData?: ShipmentData;
}

/**
 * Real vehicle with tracking-specific properties
 */
export interface RealVehicle extends BaseVehicle {
  isSimulated: false;
  deviceId?: string;
  signalStrength?: number;
  lastContactTime?: Date;
}

/**
 * Union type for both vehicle types
 */
export type Vehicle = SimulatedVehicle | RealVehicle;

/**
 * Type guard to check if a vehicle is simulated
 */
export function isSimulatedVehicle(vehicle: Vehicle): vehicle is SimulatedVehicle {
  return vehicle.isSimulated === true;
}

/**
 * Type guard to check if a vehicle is real
 */
export function isRealVehicle(vehicle: Vehicle): vehicle is RealVehicle {
  return vehicle.isSimulated === false;
}

/**
 * Route interface for vehicle routes
 */
export interface Route {
  id: string;
  stops: Stop[];
  startTime: Date;
  estimatedEndTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

/**
 * Stop interface for route stops
 */
export interface Stop {
  id: string;
  type: 'pickup' | 'delivery';
  location: Location;
  scheduledTime: Date;
  status: 'pending' | 'arrived' | 'completed' | 'cancelled';
}

/**
 * Geofence interface for location-based triggers
 */
export interface Geofence {
  id: string;
  name: string;
  type: 'post_office' | 'warehouse' | 'custom';
  shape: {
    type: 'circle' | 'polygon';
    // For circle
    center?: Location;
    radiusMeters?: number;
    // For polygon
    coordinates?: Location[];
  };
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  metadata?: Record<string, any>;
}

/**
 * Geofence event interface for tracking entry/exit events
 */
export interface GeofenceEvent {
  id: string;
  geofenceId: string;
  vehicleId: string;
  eventType: 'enter' | 'exit' | 'dwell';
  timestamp: Date;
  location: Location;
} 