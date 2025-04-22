import type { Feature, LineString } from 'geojson'; // Import LineString

/**
 * Defines the input structure required to initiate a shipment simulation.
 * This is derived from parsed document data but tailored for simulation needs,
 * ensuring required fields like coordinates and RDD are present and typed correctly.
 */
export interface SimulationInput {
  /** A unique identifier for this simulation scenario (e.g., mock-shipment-<id>) */
  scenarioId: string;
  /** The original shipment ID this simulation is based on (for context) */
  shipmentId: string;

  // Core Route Information (Must be validated numbers)
  originCoordinates: [number, number]; // [longitude, latitude]
  destinationCoordinates: [number, number]; // [longitude, latitude]

  // Essential Shipment Context
  /** Requested Delivery Date (ISO string or Date object) - Crucial for simulation timing/context */
  requestedDeliveryDate: string | Date;
  customerPoNumber?: string;
  customerShipmentNumber?: string;
  primaryItemDescription?: string; // e.g., the first item's description
  totalWeight?: number;
  remarks?: string;

  // Optional Truck & Driver Information (from parsed data if available)
  driverName?: string;
  driverPhone?: string;
  driverIc?: string;
  truckId?: string; // e.g., License Plate

  // Future potential fields
  // vehicleCapacity?: number;
  // requiredVehicleType?: string;

  // --- NEW Fields from discussion ---
  /** Recipient Contact Name */
  recipientName?: string;
  /** Recipient Contact Phone */
  recipientPhone?: string;
  /** Origin address string */
  originAddressString?: string;
  /** Destination address string */
  destinationAddressString?: string;
  // --- End NEW Fields ---

  /** The initial status derived from the source document (e.g., PENDING, DELIVERED, AWAITING_STATUS) */
  initialStatus?: string; // Allow any string from parser initially - TODO: Refine to VehicleStatus?

  routeGeometry: LineString | null; // <<< ADDED: Pre-fetched route geometry

  // <<< ADDED: Fields for initial state testing >>>
  initialTraveledDistance?: number; // Optional, distance in meters
  initialBearing?: number; // Optional, bearing in degrees
} 