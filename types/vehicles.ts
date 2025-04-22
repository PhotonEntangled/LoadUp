import { Feature, LineString, Point } from 'geojson';

// Defines the possible statuses for a simulated vehicle
export type VehicleStatus = 
  'Idle' 
  | 'En Route' 
  | 'At Pickup' 
  | 'Pending Delivery Confirmation'
  | 'AWAITING_STATUS'
  | 'Completed'
  | 'Delayed'
  | 'Error';

/**
 * Represents the state of a single simulated vehicle within the tracking system.
 */
export interface SimulatedVehicle {
  /** Unique identifier for this simulation instance (e.g., sim-<shipmentId>) */
  id: string; 
  /** The ID of the shipment document this simulation is based on */
  shipmentId: string; 
  /** Type of vehicle (currently fixed) */
  vehicleType: 'Truck'; 
  /** Current operational status */
  status: VehicleStatus;
  /** Current geographical position as a GeoJSON Point feature */
  currentPosition: Feature<Point>; 
  /** Current direction of travel in degrees (0-360) */
  bearing: number; 
  /** The full calculated route as a GeoJSON LineString feature, or null if route calculation failed */
  route: Feature<LineString> | null; 
  /** Total calculated distance of the route in meters */
  routeDistance: number; 
  /** Distance traveled along the current route in meters */
  traveledDistance: number; 
  /** Coordinates of the route origin [longitude, latitude] */
  originCoordinates: [number, number]; 
  /** Coordinates of the route destination [longitude, latitude] */
  destinationCoordinates: [number, number]; 
  /** Key identifier from the associated shipment for context */
  associatedPoNumber?: string;
  /** Key identifier from the associated shipment for context */
  associatedItemNumber?: string;

  // --- NEW: Fields for Display Panel (Task 4.2c) ---
  /** Requested Delivery Date (ISO string or Date object) */
  requestedDeliveryDate?: string | Date; 
  /** Recipient Contact Name */
  recipientName?: string;
  /** Recipient Contact Phone */
  recipientPhone?: string;
  /** Origin address string (e.g., from rawInput or concatenated fields) */
  originAddressString?: string;
  /** Destination address string (e.g., from rawInput or concatenated fields) */
  destinationAddressString?: string;
  /** Remarks associated with the shipment */
  remarks?: string;
  // --- End NEW Fields ---

  // Optional Truck & Driver Information (added from simulation input if available)
  driverName?: string;
  driverPhone?: string;
  driverIc?: string;
  truckId?: string; // e.g., License Plate

  /** Timestamp (ms since epoch) of the last position update */
  lastUpdateTime: number; 
} 