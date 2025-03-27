/**
 * ParsedShipment Interface
 * 
 * This interface represents the structure of a parsed shipment slip
 * that will be used to simulate vehicles on the map.
 */

import { Location } from './vehicle';

/**
 * Geographic location with additional name
 */
export interface NamedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Route information for a shipment
 */
export interface ShipmentRoute {
  start: NamedLocation;
  end: NamedLocation;
}

/**
 * Vehicle capacity information
 */
export interface VehicleCapacity {
  maxWeight: number;
  currentWeight: number;
}

/**
 * ParsedShipment interface for vehicle simulation
 */
export interface ParsedShipment {
  orderId: string;
  poNumber: string;
  shipDate: string;
  originPO: string;
  destination: string;
  destinationState: string;
  contact: string;
  remarks: string;
  weight: number;
  status: string;
  vehicleType: string;
  capacity?: VehicleCapacity;
  isSimulated: boolean;
  route?: ShipmentRoute;
}

/**
 * Example mock shipment matching the provided structure
 */
export const mockShipment: ParsedShipment = {
  orderId: "LOA123456",
  poNumber: "HWSH053412",
  shipDate: "2025-01-07",
  originPO: "Kuala Lumpur General Post Office",
  destination: "HOME CREATIVE LAB SDN. BHD., JOHOR",
  destinationState: "JOHOR",
  contact: "MR YAP 60167705522 / SD CHIN TAK 60192017664",
  remarks: "NEED UNLOADING SERVICE, CALL PIC 1 HOUR BEFORE DELIVERY",
  weight: 29000,
  status: "loading",
  vehicleType: "16-wheeler",
  capacity: {
    maxWeight: 36000000,
    currentWeight: 29000
  },
  isSimulated: true,
  route: {
    start: {
      name: "Kuala Lumpur General Post Office",
      latitude: 3.1493,
      longitude: 101.6953
    },
    end: {
      name: "Johor Dropoff Location",
      latitude: 1.4927, 
      longitude: 103.7414
    }
  }
}; 