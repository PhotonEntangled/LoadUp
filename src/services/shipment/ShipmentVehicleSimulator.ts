import { Vehicle, VehicleStatus, SimulatedVehicle, Location } from '../../types/vehicle';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';

/**
 * Interface for a parsed shipment from document
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
  capacity?: {
    maxWeight: number;
    currentWeight: number;
  };
  isSimulated?: boolean;
  route?: {
    start: {
      name: string;
      latitude: number;
      longitude: number;
    };
    end: {
      name: string;
      latitude: number;
      longitude: number;
    };
  };
}

/**
 * ShipmentVehicleSimulator - Converts shipment data to simulated vehicles
 * 
 * This service handles the conversion of shipment data (from parsed documents)
 * to simulated vehicles that can be displayed on the map and tracked.
 */
export class ShipmentVehicleSimulator {
  private store: ReturnType<typeof useUnifiedVehicleStore>;
  private intervalIds: Record<string, NodeJS.Timeout> = {};
  private animationFractions: Record<string, number> = {};
  private simulationSpeed: number = 1; // Default speed multiplier
  
  /**
   * Create a new shipment vehicle simulator
   * @param store The unified vehicle store
   */
  constructor(store: ReturnType<typeof useUnifiedVehicleStore>) {
    this.store = store;
  }
  
  /**
   * Set the global simulation speed
   * @param speed Speed multiplier (1 = normal, 0.5 = slow, 2 = fast)
   */
  setSimulationSpeed(speed: number): void {
    this.simulationSpeed = speed;
  }
  
  /**
   * Convert a parsed shipment to a simulated vehicle
   * @param shipment The shipment data
   * @returns A vehicle object
   */
  convertShipmentToVehicle(shipment: ParsedShipment): SimulatedVehicle {
    // Generate a unique ID for the vehicle based on the shipment
    const vehicleId = `sim-${shipment.orderId.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Map shipment vehicle type to a known vehicle type
    const vehicleType = this.mapToVehicleType(shipment.vehicleType);
    
    // Map shipment status to a vehicle status
    const vehicleStatus = this.mapToVehicleStatus(shipment.status);
    
    // Determine route coordinates
    let startCoords: Location = { latitude: 0, longitude: 0 };
    let endCoords: Location = { latitude: 0, longitude: 0 };
    
    // Use route from shipment if available
    if (shipment.route) {
      startCoords = {
        latitude: shipment.route.start.latitude,
        longitude: shipment.route.start.longitude
      };
      
      endCoords = {
        latitude: shipment.route.end.latitude,
        longitude: shipment.route.end.longitude
      };
    } else {
      // Use default coordinates if not specified
      // This would typically come from a geocoding service
      startCoords = { latitude: 3.1493, longitude: 101.6953 }; // KL General Post Office
      endCoords = { latitude: 1.4927, longitude: 103.7414 };   // Johor
    }
    
    // Create simulated route data
    const routeCoordinates: [number, number][] = [
      [startCoords.longitude, startCoords.latitude],
      [endCoords.longitude, endCoords.latitude]
    ];
    
    // Create the vehicle object
    const vehicle: SimulatedVehicle = {
      id: vehicleId,
      type: vehicleType,
      status: vehicleStatus,
      location: { ...startCoords }, // Start at the origin
      isSimulated: true,
      lastUpdated: new Date(),
      heading: 0, // Will be calculated during movement
      speed: 60, // Default speed in km/h
      
      // Add route data for rendering
      routeData: {
        id: `route-${vehicleId}`,
        type: 'delivery',
        coordinates: routeCoordinates,
        color: '#00BFFF', // Bright blue
        width: 3,
        glow: true
      },
      
      // Visual properties for rendering
      visuals: {
        color: '#00BFFF', // Bright blue
        size: 40,
        pulseEffect: true,
        emoji: '🚚',
        fontSize: 24
      },
      
      // Additional shipment-specific data
      shipmentData: {
        orderId: shipment.orderId,
        poNumber: shipment.poNumber,
        shipDate: shipment.shipDate,
        origin: shipment.originPO,
        destination: shipment.destination,
        contact: shipment.contact,
        remarks: shipment.remarks,
        weight: shipment.weight
      }
    };
    
    return vehicle;
  }
  
  /**
   * Start simulating a vehicle's journey based on a shipment
   * @param shipment The shipment data
   * @param duration Duration of the simulation in milliseconds
   * @returns The vehicle ID
   */
  startShipmentSimulation(shipment: ParsedShipment, duration: number = 60000): string {
    // Convert shipment to vehicle
    const vehicle = this.convertShipmentToVehicle(shipment);
    
    // Add vehicle to store
    this.store.addOrUpdateVehicle(vehicle);
    
    // Store starting coordinates
    const startLat = vehicle.location.latitude;
    const startLng = vehicle.location.longitude;
    
    // Get destination coordinates from route data
    const endLat = vehicle.routeData?.coordinates[1][1] ?? 0;
    const endLng = vehicle.routeData?.coordinates[1][0] ?? 0;
    
    // Calculate initial heading (bearing)
    const heading = this.calculateBearing(startLat, startLng, endLat, endLng);
    
    // Update vehicle with initial heading
    this.store.addOrUpdateVehicle({
      ...vehicle,
      heading
    });
    
    // Store animation state
    this.animationFractions[vehicle.id] = 0;
    
    // Calculate update interval (adjust based on desired smoothness)
    const updateInterval = 1000; // Update every second
    
    // Setup animation interval
    this.intervalIds[vehicle.id] = setInterval(() => {
      // Update animation progress
      this.animationFractions[vehicle.id] += (updateInterval * this.simulationSpeed) / duration;
      
      // Cap progress at 1.0 (100%)
      const progress = Math.min(this.animationFractions[vehicle.id], 1.0);
      
      // If complete, stop the animation
      if (progress >= 1.0) {
        this.stopShipmentSimulation(vehicle.id);
        
        // Update to final position and status
        this.store.addOrUpdateVehicle({
          ...vehicle,
          location: { 
            latitude: endLat, 
            longitude: endLng 
          },
          status: 'arrived'
        });
        
        return;
      }
      
      // Calculate interpolated position
      const newLat = startLat + (endLat - startLat) * progress;
      const newLng = startLng + (endLng - startLng) * progress;
      
      // Update vehicle in store
      this.store.addOrUpdateVehicle({
        ...vehicle,
        location: { 
          latitude: newLat, 
          longitude: newLng 
        }
      });
    }, updateInterval);
    
    return vehicle.id;
  }
  
  /**
   * Stop simulation for a specific vehicle
   * @param vehicleId The ID of the vehicle to stop
   */
  stopShipmentSimulation(vehicleId: string): void {
    if (this.intervalIds[vehicleId]) {
      clearInterval(this.intervalIds[vehicleId]);
      delete this.intervalIds[vehicleId];
      delete this.animationFractions[vehicleId];
    }
  }
  
  /**
   * Stop all active simulations
   */
  stopAllSimulations(): void {
    Object.keys(this.intervalIds).forEach(id => {
      clearInterval(this.intervalIds[id]);
    });
    
    this.intervalIds = {};
    this.animationFractions = {};
  }
  
  /**
   * Calculate bearing between two points
   * @param startLat Start latitude
   * @param startLng Start longitude
   * @param endLat End latitude
   * @param endLng End longitude
   * @returns Bearing in degrees (0-360)
   */
  private calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number): number {
    const toRad = (n: number) => n * Math.PI / 180;
    const toDeg = (n: number) => n * 180 / Math.PI;
    
    const dLng = toRad(endLng - startLng);
    const startLatRad = toRad(startLat);
    const endLatRad = toRad(endLat);
    
    const y = Math.sin(dLng) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
              Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
    
    let bearing = toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360
    
    return bearing;
  }
  
  /**
   * Map shipment vehicle type to a known vehicle type
   * @param shipmentType Vehicle type from shipment
   * @returns Standardized vehicle type
   */
  private mapToVehicleType(shipmentType: string): string {
    // Map shipment vehicle types to standard vehicle types
    const typeMap: Record<string, string> = {
      '16-wheeler': 'truck',
      '10-wheeler': 'truck',
      'lorry': 'truck',
      'van': 'van',
      'pickup': 'van',
      'motorcycle': 'motorcycle'
    };
    
    // Normalize input to lowercase for case-insensitive matching
    const normalizedType = shipmentType.toLowerCase();
    
    // Check for containing common type words
    if (normalizedType.includes('wheeler') || normalizedType.includes('lorry') || normalizedType.includes('truck')) {
      return 'truck';
    } else if (normalizedType.includes('van') || normalizedType.includes('pickup')) {
      return 'van';
    } else if (normalizedType.includes('motor') || normalizedType.includes('bike')) {
      return 'motorcycle';
    }
    
    // Use direct mapping if available
    return typeMap[normalizedType] || 'truck'; // Default to truck
  }
  
  /**
   * Map shipment status to vehicle status
   * @param shipmentStatus Status from shipment
   * @returns Standardized vehicle status
   */
  private mapToVehicleStatus(shipmentStatus: string): VehicleStatus {
    // Map shipment statuses to vehicle statuses
    const statusMap: Record<string, VehicleStatus> = {
      'loading': 'loading',
      'unloading': 'unloading',
      'in transit': 'moving',
      'moving': 'moving',
      'idle': 'idle',
      'maintenance': 'maintenance',
      'waiting': 'idle',
      'arrived': 'arrived',
      'completed': 'completed',
      'delivered': 'delivered'
    };
    
    // Normalize input to lowercase for case-insensitive matching
    const normalizedStatus = shipmentStatus.toLowerCase();
    
    // Use direct mapping if available, or default to 'moving'
    return statusMap[normalizedStatus] || 'moving';
  }
}

/**
 * Create a simulator instance with the given store
 * @param store The unified vehicle store instance
 * @returns A shipment vehicle simulator instance
 */
export function createShipmentVehicleSimulator(
  store: ReturnType<typeof useUnifiedVehicleStore>
): ShipmentVehicleSimulator {
  return new ShipmentVehicleSimulator(store);
}

/**
 * Mock shipment for testing (from PLANNING.md)
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