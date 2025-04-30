/**
 * Defines the structure of the data packet sent by the live source 
 * (e.g., driver app, mock sender) and stored/retrieved via Firestore.
 */
export interface LiveVehicleUpdate {
  /** Corresponds to the primary key of the shipment being tracked (e.g., shipments_erd.id) */
  shipmentId: string; 

  /** Latitude coordinate in decimal degrees. */
  latitude: number;

  /** Longitude coordinate in decimal degrees. */
  longitude: number;

  /** Timestamp of the location reading in Unix milliseconds UTC. */
  timestamp: number; 

  /** Optional: Vehicle heading in degrees (0-359.9). North is 0 degrees. Null if unavailable. */
  heading?: number | null; 

  /** Optional: Vehicle speed in meters per second. Null if unavailable. */
  speed?: number | null; 

  /** Optional: Estimated accuracy of the location reading in meters. Null if unavailable. */
  accuracy?: number | null; 

  /** Optional: Device battery level as a percentage (0-100). Null if unavailable. */
  batteryLevel?: number | null; 

  // Potentially add status flags if needed from driver app in the future:
  // e.g., isBreak: boolean; isOffline: boolean;
}

/**
 * Defines the structure for static shipment details needed for the tracking view.
 * This data is typically fetched once when the tracking page loads.
 */
export interface StaticTrackingDetails {
  /** Corresponds to the primary key of the shipment being tracked (e.g., shipments_erd.id) */
  shipmentId: string;

  /** ID of the parent document, if applicable (e.g., from document processing) */
  documentId: string;

  /** Coordinates of the shipment origin. Null if not available. */
  originCoords: { lat: number; lon: number } | null;

  /** Coordinates of the shipment destination. Null if not available. */
  destinationCoords: { lat: number; lon: number } | null;

  /** Formatted address string for the origin. Null if not available. */
  originAddress: string | null;

  /** Formatted address string for the destination. Null if not available. */
  destinationAddress: string | null;

  /** Name of the assigned driver. Null if not available. */
  driverName: string | null;

  /** Optional: Pre-calculated planned route geometry as a GeoJSON LineString. Null if unavailable or not fetched. */
  plannedRouteGeometry?: GeoJSON.LineString | null;

  /** Optional: Required Delivery Date or Time Window - Needs specific type definition */
  // requiredDeliveryDate?: Date | string | null; // Example, adjust type as needed

  // Add other relevant static fields as needed by the UI
} 