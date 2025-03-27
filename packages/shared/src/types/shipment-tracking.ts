/**
 * shipment-tracking.ts
 * 
 * Types for the shipment tracking feature
 */

import { MarkerType, MarkerStatus } from '../components/MapboxMarker.js';

/**
 * Shipment Activity Status as defined in ERD
 * Maps to ActivityStatus field in PickUps and DropOffs tables
 */
export enum ActivityStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4,
  Delayed = 5,
  Skipped = 6,
}

/**
 * Shipment Tracking Status corresponding to status field in UI
 */
export type ShipmentTrackingStatus = 
  | 'pending'
  | 'in-transit' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'failed' 
  | 'returned'
  | 'delayed';

/**
 * Vehicle types for transport
 */
export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle';

/**
 * Vehicle/driver information
 */
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    timestamp: Date;
  };
}

/**
 * Location record with coordinates
 * Maps to Address table in ERD
 */
export interface LocationPoint {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/**
 * Shipment stop (pickup or delivery)
 * Maps to PickUps and DropOffs tables in ERD
 */
export interface ShipmentStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  
  // Based on ERD schema
  type: 'pickup' | 'delivery' | 'waypoint' | 'depot';
  status: 'pending' | 'arrived' | 'departed' | 'completed' | 'skipped' | 'failed';
  
  // Date fields from ERD
  scheduledTime?: Date; // Maps to PickUpDate or DropOffDate
  actualTimeOfArrival?: Date; // Maps to ActualDateTimeOfArrival
  actualTimeOfDeparture?: Date; // Maps to ActualDateTimeOfDeparture
  estimatedTimeOfArrival?: Date; // Maps to EstimatedDateTimeOfArrival
  estimatedTimeOfDeparture?: Date; // Maps to EstimatedDateTimeOfDeparture
  
  // Position in sequence
  order: number; // Maps to PickUpPosition or DropOffPosition
  
  // Cargo details from ERD
  shipmentWeight?: number; // Maps to ShipmentWeight
  shipmentVolume?: number; // Maps to ShipmentVolume
  quantityOfItems?: number; // Maps to QuantityOfItems
  totalPalettes?: number; // Maps to TotalPalettes
  
  // Additional fields specific to dropoffs
  customerDeliveryNumber?: string; // Maps to CustomerDeliveryNumber
  customerPoNumbers?: string; // Maps to CustomerPoNumbers
  
  // Other metadata
  tripPodId?: string; // Maps to TripPodId
  cargoStatusId?: string; // Maps to CargoStatusId
}

/**
 * Complete shipment details
 * Maps to Shipments, CustomShipmentDetails, and Trips tables in ERD
 */
export interface ShipmentDetails {
  // Core shipment info
  id: string;
  trackingNumber: string; // Maps to ShipmentDocumentNumber
  status: ShipmentTrackingStatus;
  
  // Origin and destination
  origin: LocationPoint;
  destination: LocationPoint;
  
  // Intermediate stops (pickup/dropoff points)
  stops?: ShipmentStop[];
  
  // Assigned vehicle/driver
  vehicle?: Vehicle;
  
  // Timing
  estimatedDelivery?: Date; // Maps to EarlyOutboundDate
  actualDelivery?: Date;
  
  // Trip details from ERD
  tripId?: string; // Maps to TripId
  tripConfigId?: string; // Maps to TripConfigId
  tripStatus?: string; // Maps to TripStatus
  
  // Vehicle details from ERD
  truckId?: string; // Maps to TruckId
  driverId?: string; // Maps to DriverId
  driverName?: string; // Maps to DriverName
  
  // Cargo details from CustomShipmentDetails
  weight?: string; // Maps to TotalTransportWeight
  dimensions?: string;
  totalTransportCost?: number; // Maps to TotalTransportCost
  totalTransportDistance?: number; // Maps to TotalTransportDistance
  totalTransportDuration?: number; // Maps to TotalTransportDuration
  totalTransportSegments?: number; // Maps to TotalTransportSegments
  totalTransportVolume?: number; // Maps to TotalTransportVolume
  
  // Additional fields from ERD
  specialInstructions?: string; // Maps to Remarks
  material?: string; // Maps to Material
  materialType?: string; // Maps to MaterialType
  sealed?: boolean; // Maps to Sealed
  hazardous?: boolean; // Maps to TotalHazardous
  
  // Route data for map display
  route?: {
    coordinates: Array<[number, number]>; // [longitude, latitude] pairs
    segments: RouteSegment[];
  };
}

/**
 * Route segment between two points
 */
export interface RouteSegment {
  startStopId: string;
  endStopId: string;
  distance: number; // In meters
  duration: number; // In seconds
  coordinates: Array<[number, number]>; // [longitude, latitude] pairs
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
}

/**
 * Stop in a route for map display
 */
export interface RouteStop {
  id: string;
  longitude: number;
  latitude: number;
  name?: string;
  address?: string;
  eta?: Date;
  arrivalTime?: Date;
  departureTime?: Date;
  status?: MarkerStatus;
  stopType?: MarkerType;
  stopOrder: number;
  duration?: number; // Duration at this stop in seconds
}

/**
 * Maps ActivityStatus enum to MarkerStatus type
 */
export const mapActivityStatusToMarkerStatus = (status: ActivityStatus): MarkerStatus => {
  switch (status) {
    case ActivityStatus.Pending:
      return 'pending';
    case ActivityStatus.InProgress:
      return 'in-progress';
    case ActivityStatus.Completed:
      return 'completed';
    case ActivityStatus.Failed:
      return 'failed';
    case ActivityStatus.Delayed:
      return 'delayed';
    case ActivityStatus.Skipped:
      return 'skipped';
    default:
      return 'pending';
  }
};

/**
 * Maps pickup/dropoff type to MarkerType
 */
export const mapStopTypeToMarkerType = (type: string): MarkerType => {
  switch (type) {
    case 'pickup':
      return 'pickup';
    case 'delivery':
      return 'delivery';
    case 'depot':
      return 'depot';
    case 'waypoint':
      return 'waypoint';
    default:
      return 'custom';
  }
};

/**
 * Helper function to convert ShipmentStop to RouteStop
 */
export const convertToRouteStop = (stop: ShipmentStop): RouteStop => {
  return {
    id: stop.id,
    longitude: stop.longitude,
    latitude: stop.latitude,
    name: stop.name,
    address: stop.address,
    eta: stop.estimatedTimeOfArrival,
    arrivalTime: stop.actualTimeOfArrival,
    departureTime: stop.actualTimeOfDeparture,
    status: stop.status as MarkerStatus,
    stopType: mapStopTypeToMarkerType(stop.type),
    stopOrder: stop.order,
    duration: stop.actualTimeOfDeparture && stop.actualTimeOfArrival 
      ? (stop.actualTimeOfDeparture.getTime() - stop.actualTimeOfArrival.getTime()) / 1000
      : undefined,
  };
}; 