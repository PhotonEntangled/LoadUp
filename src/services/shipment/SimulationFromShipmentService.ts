/**
 * SimulationFromShipmentService
 * 
 * This service transforms parsed shipment data into a simulated vehicle
 * that can be displayed and animated on the tracking map.
 */

import { v4 as uuidv4 } from 'uuid';
import { ParsedShipment } from '../../types/ParsedShipment';
import { SimulatedVehicle, VehicleStatus, Location } from '../../types/vehicle';
import { getCoordinatesForLocation } from '../mock/POCoordinateMap';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { mapDirectionsService, Coordinate, RouteInfo } from '../../services/maps/MapDirectionsService';

// Define MapVehicle type for fallback if import fails
interface MapVehicle {
  id: string;
  name: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  licensePlate: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    timestamp: Date;
  };
}

// Constants for debugging and visualization
const DEBUG = true;
const ROUTE_LINE_COLOR = '#00FF00';
const ROUTE_LINE_WIDTH = 4;

// Static PO Box coordinate mapping (fallback if geocoding fails)
const PO_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
  'johor bahru': { lat: 1.4927, lng: 103.7414 },
  'penang': { lat: 5.4164, lng: 100.3327 },
  'ipoh': { lat: 4.5975, lng: 101.0901 },
  'kuching': { lat: 1.5535, lng: 110.3593 },
};

// Extended driver info with shipment details
interface ExtendedDriverInfo {
  id: string;
  name: string;
  phone: string;
  // Store original shipment data for reference
  shipmentData?: {
    orderId: string;
    poNumber: string;
    destination: string;
    contact: string;
    remarks: string;
    weight: number;
  };
}

// Options for simulation behavior
interface SimulationOptions {
  initialStatus?: VehicleStatus;
  speedMultiplier?: number;
  size?: number;
  color?: string;
  showTooltip?: boolean;
  icon?: string;
  showRouteLine?: boolean;
  routeLineColor?: string;
  routeLineWidth?: number;
  useMockRoute?: boolean;
}

// Get the mapStore if available
const mapStore = typeof window !== 'undefined' ? 
  (window as any).mapStore || useUnifiedVehicleStore : null;

/**
 * Service for converting shipment data to simulated vehicles
 */
export class SimulationFromShipmentService {
  private static instance: SimulationFromShipmentService | null = null;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private simulatedVehicles: Map<string, SimulatedVehicle> = new Map();
  private animationFrameIds: Map<string, number> = new Map();
  private routeCache: Map<string, RouteInfo> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    if (DEBUG) console.log('[SimulationFromShipmentService] Service initialized');
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): SimulationFromShipmentService {
    if (!SimulationFromShipmentService.instance) {
      SimulationFromShipmentService.instance = new SimulationFromShipmentService();
    }
    return SimulationFromShipmentService.instance;
  }

  /**
   * Create a simulated vehicle from a parsed shipment
   * @param shipment The parsed shipment data
   * @param options Options for simulation behavior
   * @returns The created simulated vehicle
   */
  public async createVehicleFromShipment(
    shipment: ParsedShipment,
    options: SimulationOptions = {}
  ): Promise<SimulatedVehicle | null> {
    try {
      if (DEBUG) console.log('[SimulationFromShipmentService] Creating vehicle from shipment', shipment.orderId);
      
      // Initialize route if not present
      if (!shipment.route) {
        shipment.route = {
          start: { name: '', latitude: 0, longitude: 0 },
          end: { name: '', latitude: 0, longitude: 0 }
        };
      }
      
      if (!shipment.route.start || !shipment.route.end) {
        // Try to resolve coordinates if not already present
        this.resolveShipmentCoordinates(shipment);
      }

      // Enhanced validation of coordinates
      if (!this.validateCoordinates(shipment.route.start) || !this.validateCoordinates(shipment.route.end)) {
        console.error('[SimulationFromShipmentService] Failed to resolve valid coordinates for shipment', shipment.orderId);
        
        // Use fallback KL coordinates if coordinates are invalid
        if (!this.validateCoordinates(shipment.route.start)) {
          console.warn('[SimulationFromShipmentService] Using fallback coordinates for start location');
          shipment.route.start = {
            name: 'Kuala Lumpur',
            latitude: 3.1402,
            longitude: 101.6869
          };
        }
        
        if (!this.validateCoordinates(shipment.route.end)) {
          console.warn('[SimulationFromShipmentService] Using fallback coordinates for end location');
          shipment.route.end = {
            name: 'Putrajaya',
            latitude: 2.9264,  // Default coords for nearby location
            longitude: 101.6964
          };
        }
      }

      // Generate a unique vehicle ID based on the shipment
      const vehicleId = `sim-${shipment.orderId.toLowerCase()}-${uuidv4().substring(0, 8)}`;
      
      // Log the actual coordinates being used
      console.log('[SimulationFromShipmentService] Vehicle coordinates:', {
        start: {
          lat: shipment.route.start.latitude,
          lng: shipment.route.start.longitude
        },
        end: {
          lat: shipment.route.end.latitude,
          lng: shipment.route.end.longitude
        }
      });

      // Fetch route from Mapbox Directions API
      let routeData: RouteInfo | null = null;
      let routeCoordinates: Coordinate[] = [];
      try {
        // Only fetch route if not using mock routes
        if (!options.useMockRoute) {
          const cacheKey = `${shipment.route.start.latitude},${shipment.route.start.longitude}-${shipment.route.end.latitude},${shipment.route.end.longitude}`;
          
          // Check cache first
          if (this.routeCache.has(cacheKey)) {
            routeData = this.routeCache.get(cacheKey)!;
            console.log('[SimulationFromShipmentService] Using cached route for', shipment.orderId);
          } else {
            // Call MapDirectionsService to get route
            routeData = await mapDirectionsService.getRoute(
              [shipment.route.start.longitude, shipment.route.start.latitude],
              [shipment.route.end.longitude, shipment.route.end.latitude],
              {
                profile: 'driving',
                steps: true,
                overview: 'full',
                annotations: ['speed', 'duration', 'distance']
              }
            );
            
            // Cache the route
            this.routeCache.set(cacheKey, routeData);
            console.log('[SimulationFromShipmentService] Fetched and cached route for', shipment.orderId);
          }
          
          if (routeData) {
            routeCoordinates = routeData.coordinates;
          }
        }
      } catch (error) {
        console.error('[SimulationFromShipmentService] Error fetching route from Mapbox:', error);
        console.warn('[SimulationFromShipmentService] Falling back to straight line route');
      }

      // If route fetching failed or mock route option is set, create fallback route
      if (!routeData || options.useMockRoute || routeCoordinates.length === 0) {
        console.log('[SimulationFromShipmentService] Using straight line route fallback');
        routeCoordinates = [
          [shipment.route.start.longitude, shipment.route.start.latitude],
          [shipment.route.end.longitude, shipment.route.end.latitude]
        ];
      }

      // Create the simulated vehicle with extended driver info
      const vehicle: SimulatedVehicle & { 
        driver?: ExtendedDriverInfo;
        // Add visual enhancement properties
        visuals?: {
          size?: number;
          color?: string;
          showTooltip?: boolean;
          icon?: string;
          highlightColor?: string;
          showRouteLine?: boolean;
          routeLineColor?: string;
          routeLineWidth?: number;
          emoji?: string;
          fontSize?: number;
          zoomDependent?: boolean;
        };
        // Add explicit routeData property for MapboxMarker compatibility
        routeData?: {
          id: string;
          type: string;
          coordinates: [number, number][];
          color: string;
          width: number;
          glow?: boolean;
          isRealRoute?: boolean;
        };
      } = {
        id: vehicleId,
        type: shipment.vehicleType || '16-wheeler',
        location: { ...shipment.route.start },
        heading: this.calculateHeading(shipment.route.start, shipment.route.end),
        speed: 0,
        status: options.initialStatus || this.mapShipmentStatusToVehicle(shipment.status),
        lastUpdated: new Date(),
        isSimulated: true,
        route: {
          id: `route-${vehicleId}`,
          stops: [
            {
              id: `pickup-${vehicleId}`,
              location: { ...shipment.route.start },
              type: 'pickup'
            },
            {
              id: `delivery-${vehicleId}`,
              location: { ...shipment.route.end },
              type: 'delivery'
            }
          ],
          currentStopIndex: 0
        },
        // Store shipment data in the driver field for tooltip display
        driver: {
          id: `driver-${vehicleId}`,
          name: `Driver for ${shipment.orderId}`,
          phone: this.extractPhoneFromContact(shipment.contact),
          // Store original shipment data for reference
          shipmentData: {
            orderId: shipment.orderId,
            poNumber: shipment.poNumber,
            destination: shipment.destination,
            contact: shipment.contact,
            remarks: shipment.remarks,
            weight: shipment.weight
          }
        },
        // Add visual enhancement properties with improved visibility
        visuals: {
          size: options.size || 2.5,  // Make vehicles much larger by default
          color: options.color || '#00BFFF',  // Bright neon blue color
          showTooltip: options.showTooltip ?? true,
          icon: options.icon || 'truck',  // Default icon
          emoji: '🚚',  // Truck emoji for better visibility
          fontSize: 24,  // Larger font size for emoji
          highlightColor: '#ffff00',  // Yellow highlight for selection
          showRouteLine: options.showRouteLine ?? true,  // Show route line by default
          routeLineColor: options.routeLineColor || ROUTE_LINE_COLOR, // Bright green route line
          routeLineWidth: options.routeLineWidth || ROUTE_LINE_WIDTH, // Thicker line for visibility
          zoomDependent: true, // Enable zoom-dependent styling
        },
        // Add route data for map rendering
        routeData: {
          id: `route-${vehicleId}`,
          type: 'line',
          coordinates: routeCoordinates.map(coord => [coord[0], coord[1]]),
          color: options.routeLineColor || ROUTE_LINE_COLOR,
          width: options.routeLineWidth || ROUTE_LINE_WIDTH,
          glow: true,
          isRealRoute: !options.useMockRoute && routeData !== null
        }
      };
      
      // Store in our local map of simulated vehicles
      this.simulatedVehicles.set(vehicleId, vehicle as SimulatedVehicle);
      
      // Add to unified vehicle store
      if (useUnifiedVehicleStore) {
        try {
          const store = useUnifiedVehicleStore.getState();
          store.addVehicle(vehicle as SimulatedVehicle);
        } catch (error) {
          console.error('[SimulationFromShipmentService] Error adding vehicle to unified store:', error);
        }
      }
      
      // Add to mapStore if available
      if (mapStore) {
        try {
          // Get current vehicles from mapStore
          const mapVehicles = [...(mapStore.getState().vehicles || [])];
          
          // Convert vehicle to mapStore format
          const mapVehicle: MapVehicle & { 
            isSimulated?: boolean; 
            status?: string;
            routeData?: any;
            visuals?: any;
          } = {
            id: vehicle.id,
            name: vehicle.id,
            type: (vehicle.type || 'truck') as any,
            licensePlate: vehicle.id,
            currentLocation: vehicle.location ? {
              latitude: vehicle.location.latitude,
              longitude: vehicle.location.longitude,
              heading: vehicle.heading || 0,
              timestamp: vehicle.lastUpdated || new Date(),
            } : undefined,
            isSimulated: vehicle.isSimulated,
            status: vehicle.status,
            routeData: vehicle.routeData,
            visuals: vehicle.visuals
          };
          
          // Add to list of vehicles in mapStore
          mapVehicles.push(mapVehicle);
          console.log(`[SimulationFromShipmentService] Adding vehicle ${vehicle.id} to mapStore`);
          
          // Update the store
          mapStore.setState({ vehicles: mapVehicles });
        } catch (error) {
          console.error('[SimulationFromShipmentService] Error adding vehicle to mapStore:', error);
        }
      }

      return vehicle as SimulatedVehicle;
    } catch (error) {
      console.error('Error creating vehicle from shipment:', error);
      return null;
    }
  }

  /**
   * Validate coordinates to ensure they're within Mapbox API acceptable range
   * @param location Location to validate
   * @returns True if coordinates are valid
   */
  private validateCoordinates(location?: { latitude: number; longitude: number }): boolean {
    if (!location) return false;
    
    // Check that coordinates exist and are numbers
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      console.error('[SimulationFromShipmentService] Invalid coordinate types:', location);
      return false;
    }
    
    // Check latitude is between -90 and 90
    if (location.latitude < -90 || location.latitude > 90) {
      console.error(`[SimulationFromShipmentService] Invalid latitude: ${location.latitude}`);
      return false;
    }
    
    // Check longitude is between -180 and 180
    if (location.longitude < -180 || location.longitude > 180) {
      console.error(`[SimulationFromShipmentService] Invalid longitude: ${location.longitude}`);
      return false;
    }
    
    return true;
  }

  /**
   * Extract phone number from contact field
   */
  private extractPhoneFromContact(contact: string): string {
    // Simple regex to extract a phone number-like pattern
    const phoneMatch = contact.match(/(\d{8,15})/);
    return phoneMatch ? phoneMatch[1] : '';
  }

  /**
   * Resolve missing coordinates for a shipment
   */
  private resolveShipmentCoordinates(shipment: ParsedShipment): void {
    if (!shipment.route) {
      shipment.route = {
        start: { name: '', latitude: 0, longitude: 0 },
        end: { name: '', latitude: 0, longitude: 0 }
      };
    }

    // Resolve start coordinates from origin PO
    if (!shipment.route.start || (!shipment.route.start.latitude && !shipment.route.start.longitude)) {
      const startLocation = getCoordinatesForLocation(shipment.originPO);
      if (startLocation) {
        shipment.route.start = { ...startLocation };
      } else {
        console.warn(`Could not resolve coordinates for origin PO: ${shipment.originPO}`);
      }
    }

    // Resolve end coordinates from destination
    if (!shipment.route.end || (!shipment.route.end.latitude && !shipment.route.end.longitude)) {
      const endLocation = getCoordinatesForLocation(shipment.destination);
      if (endLocation) {
        shipment.route.end = { ...endLocation };
      } else {
        console.warn(`Could not resolve coordinates for destination: ${shipment.destination}`);
        
        // Fallback to Johor location if destination contains "JOHOR"
        if (shipment.destination.includes("JOHOR") || shipment.destinationState.includes("JOHOR")) {
          shipment.route.end = {
            name: shipment.destination,
            latitude: 1.4927,  // Default Johor coordinates
            longitude: 103.7414
          };
        }
      }
    }
  }

  /**
   * Calculate heading between two locations
   */
  private calculateHeading(start: Location, end: Location): number {
    const dLon = end.longitude - start.longitude;
    const y = Math.sin(dLon) * Math.cos(end.latitude);
    const x = Math.cos(start.latitude) * Math.sin(end.latitude) - 
              Math.sin(start.latitude) * Math.cos(end.latitude) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Map shipment status to vehicle status
   */
  private mapShipmentStatusToVehicle(status: string): VehicleStatus {
    switch (status.toLowerCase()) {
      case 'loading':
        return 'loading';
      case 'unloading':
        return 'unloading';
      case 'in transit':
      case 'intransit':
      case 'transit':
        return 'moving';
      case 'idle':
      case 'waiting':
        return 'idle';
      case 'maintenance':
        return 'maintenance';
      default:
        return 'moving';
    }
  }

  /**
   * Animate a vehicle along its route
   * @param vehicleId ID of the vehicle to animate
   * @param options Animation options
   * @returns Object with stop function
   */
  public animateVehicle(
    vehicleId: string,
    options: { speed?: number; updateInterval?: number } = {}
  ): { stop: () => void } {
    const vehicle = this.simulatedVehicles.get(vehicleId);
    
    // Return if vehicle not found
    if (!vehicle) {
      console.error(`[SimulationFromShipmentService] Vehicle ${vehicleId} not found for animation`);
      return { stop: () => {} };
    }
    
    // Stop any existing animation
    this.stopAnimation(vehicleId);
    
    // Get route and stops from vehicle
    const routeData = (vehicle as any).routeData;
    const coordinates = routeData?.coordinates || [];
    
    // If no coordinates are available, fall back to start/end points
    if (!coordinates || coordinates.length < 2) {
      console.warn(`[SimulationFromShipmentService] No route coordinates for vehicle ${vehicleId}, using fallback`);
      if (vehicle.route && vehicle.route.stops && vehicle.route.stops.length >= 2) {
        const start = vehicle.route.stops[0].location;
        const end = vehicle.route.stops[1].location;
        
        // Create basic straight line route
        coordinates.push([start.longitude, start.latitude]);
        coordinates.push([end.longitude, end.latitude]);
      } else {
        console.error(`[SimulationFromShipmentService] Cannot animate vehicle ${vehicleId} - no route data`);
        return { stop: () => {} };
      }
    }
    
    // Assign speed based on options or defaults
    const speedKmPerHour = options.speed || 60;  // Default 60 km/h
    const updateIntervalMs = options.updateInterval || 100;  // Default 100ms update
    
    // Initialize animation variables
    let currentStep = 0;
    const totalSteps = coordinates.length;
    
    // Calculate distance and duration for straight line path
    const getTotalDistance = () => {
      let distance = 0;
      for (let i = 1; i < coordinates.length; i++) {
        const prev = { latitude: coordinates[i-1][1], longitude: coordinates[i-1][0] };
        const curr = { latitude: coordinates[i][1], longitude: coordinates[i][0] };
        distance += this.calculateDistance(prev, curr);
      }
      return distance;
    };
    
    const totalDistance = getTotalDistance();
    const totalAnimationTimeSeconds = (totalDistance / speedKmPerHour) * 3600;
    
    if (DEBUG) {
      console.log('[SimulationFromShipmentService] Animation parameters:');
      console.log('  - Distance:', totalDistance.toFixed(2), 'km');
      console.log('  - Speed:', speedKmPerHour, 'km/h');
      console.log('  - Estimated time:', (totalAnimationTimeSeconds / 60).toFixed(2), 'minutes');
      console.log('  - Total steps:', totalSteps);
    }
    
    // Update vehicle with initial state
    const initialVehicle: SimulatedVehicle = { 
      ...vehicle,
      location: {
        latitude: coordinates[0][1],
        longitude: coordinates[0][0]
      },
      status: 'moving',
      speed: speedKmPerHour,
      lastUpdated: new Date(),
      isSimulated: true
    };
    
    this.updateVehicleInStore(initialVehicle);
    
    // Animation function for real route with multiple coordinates
    const animate = () => {
      // Animation complete - vehicle arrived at destination
      if (currentStep >= totalSteps - 1) {
        // Create a new vehicle object for the final state
        const currentVehicle = this.simulatedVehicles.get(vehicleId);
        if (!currentVehicle) return;
        
        const finalVehicle: SimulatedVehicle = { 
          ...currentVehicle,
          location: {
            latitude: coordinates[totalSteps-1][1],
            longitude: coordinates[totalSteps-1][0]
          },
          status: 'unloading',
          speed: 0,
          lastUpdated: new Date(),
          isSimulated: true
        };
        
        if (DEBUG) console.log('[SimulationFromShipmentService] Vehicle', vehicleId, 'reached destination');
        
        this.updateVehicleInStore(finalVehicle);
        this.stopAnimation(vehicleId);
        return;
      }

      // Get latest vehicle state
      const currentVehicle = this.simulatedVehicles.get(vehicleId);
      if (!currentVehicle) return;
      
      // Move to next coordinate
      currentStep += 1;
      
      // Calculate heading between current and next positions
      const heading = currentStep < totalSteps - 1 ? 
        this.calculateHeadingFromCoordinates(
          { latitude: coordinates[currentStep][1], longitude: coordinates[currentStep][0] },
          { latitude: coordinates[currentStep+1][1], longitude: coordinates[currentStep+1][0] }
        ) : currentVehicle.heading;
      
      // Create a new vehicle object for this update
      const updatedVehicle: SimulatedVehicle = { 
        ...currentVehicle,
        location: {
          latitude: coordinates[currentStep][1],
          longitude: coordinates[currentStep][0]
        },
        heading,
        speed: speedKmPerHour,
        lastUpdated: new Date(),
        isSimulated: true
      };
      
      // Update vehicle in store
      this.updateVehicleInStore(updatedVehicle);
      
      // Calculate delay based on distance to next point
      let nextDelay = updateIntervalMs;
      if (currentStep < totalSteps - 1) {
        const curr = { latitude: coordinates[currentStep][1], longitude: coordinates[currentStep][0] };
        const next = { latitude: coordinates[currentStep+1][1], longitude: coordinates[currentStep+1][0] };
        const segmentDistance = this.calculateDistance(curr, next);
        
        // Calculate time required to travel this segment at the current speed
        const segmentTimeSeconds = (segmentDistance / speedKmPerHour) * 3600;
        
        // Adjust delay based on segment time, but keep it reasonable
        nextDelay = Math.max(50, Math.min(1000, segmentTimeSeconds * 1000 / 10));
      }
      
      // Request next animation frame
      const timerId = setTimeout(animate, nextDelay);
      this.updateIntervals.set(vehicleId, timerId);
    };
    
    // Start animation loop
    const timerId = setTimeout(animate, updateIntervalMs);
    this.updateIntervals.set(vehicleId, timerId);
    
    // Return control object with stop function
    return {
      stop: () => this.stopAnimation(vehicleId)
    };
  }

  /**
   * Stop animation for a vehicle
   */
  private stopAnimation(vehicleId: string): void {
    // Clear interval
    const intervalId = this.updateIntervals.get(vehicleId);
    if (intervalId) {
      clearTimeout(intervalId);
      this.updateIntervals.delete(vehicleId);
    }

    // Cancel animation frame
    const frameId = this.animationFrameIds.get(vehicleId);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.animationFrameIds.delete(vehicleId);
    }
  }

  /**
   * Calculate distance between two locations in kilometers
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Update vehicle in the store
   */
  private updateVehicleInStore(vehicle: SimulatedVehicle): void {
    try {
      // Update the unified vehicle store - uses Record<string, Vehicle> structure
      const store = useUnifiedVehicleStore.getState();
      store.updateVehicle(vehicle.id, vehicle);
      
      // Also update the map store to prevent synchronization issues
      // Convert the vehicle to map store format - only include properties from the MapVehicle interface
      const mapVehicle: MapVehicle = {
        id: vehicle.id,
        name: vehicle.id,
        type: (vehicle.type || 'truck') as 'truck' | 'van' | 'car' | 'motorcycle',
        licensePlate: vehicle.id,
        currentLocation: vehicle.location ? {
          latitude: vehicle.location.latitude,
          longitude: vehicle.location.longitude,
          heading: vehicle.heading || 0,
          timestamp: vehicle.lastUpdated || new Date(),
        } : undefined,
        // No additional properties that don't exist in MapVehicle type
      };
      
      // Only update mapStore if it's available
      if (mapStore) {
        try {
          // FIXED: Handle mapStore.getState().vehicles as a Record, not array
          const mapState = mapStore.getState();
          
          // Check if mapState.vehicles is available and in the right format
          if (!mapState || typeof mapState.setVehicles !== 'function') {
            console.warn('[SimulationFromShipmentService] mapStore has invalid structure, skipping update');
            return;
          }
          
          // Get current vehicles (handle both array and record formats)
          const currentVehicles = mapState.vehicles || {};
          let updatedVehicles;
          
          // Handle based on the actual type of currentVehicles
          if (Array.isArray(currentVehicles)) {
            // If it's an array, update or add the vehicle
            updatedVehicles = currentVehicles.filter((v: MapVehicle) => v.id !== vehicle.id);
            updatedVehicles.push(mapVehicle);
          } else if (typeof currentVehicles === 'object') {
            // If it's an object/record, directly update the vehicle entry
            updatedVehicles = {
              ...currentVehicles,
              [vehicle.id]: mapVehicle
            };
          } else {
            // Fallback to a new array with just this vehicle
            updatedVehicles = [mapVehicle];
          }
          
          // Update the map store
          mapState.setVehicles(updatedVehicles);
        } catch (error) {
          console.error('[SimulationFromShipmentService] Error updating mapStore:', error);
        }
      }
    } catch (error) {
      console.error('[SimulationFromShipmentService] Error updating vehicle in store:', error);
    }
  }

  /**
   * Remove a vehicle from simulation
   */
  public removeVehicle(vehicleId: string): void {
    this.stopAnimation(vehicleId);
    this.simulatedVehicles.delete(vehicleId);
    
    // Remove from unified store
    const store = useUnifiedVehicleStore.getState();
    store.removeVehicle(vehicleId);
    
    // Also remove from map store if available
    if (mapStore) {
      try {
        const currentVehicles = mapStore.getState().vehicles || [];
        const updatedVehicles = currentVehicles.filter((v: MapVehicle) => v.id !== vehicleId);
        mapStore.getState().setVehicles(updatedVehicles);
      } catch (error) {
        console.error('[SimulationFromShipmentService] Error removing vehicle from mapStore:', error);
      }
    }
  }

  /**
   * Remove all simulated vehicles
   */
  public removeAllVehicles(): void {
    // Get all vehicle IDs
    const vehicleIds = Array.from(this.simulatedVehicles.keys());
    
    // Remove each vehicle
    vehicleIds.forEach(id => this.removeVehicle(id));
  }

  /**
   * Calculate heading between two coordinates
   */
  private calculateHeadingFromCoordinates(start: Location, end: Location): number {
    const dLon = (end.longitude - start.longitude) * Math.PI / 180;
    const lat1 = start.latitude * Math.PI / 180;
    const lat2 = end.latitude * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    
    // Convert to 0-360 range
    heading = (heading + 360) % 360;
    
    return heading;
  }
}

/**
 * Helper function to create a simulated vehicle from a shipment
 * @param shipment The parsed shipment data
 * @param options Simulation options
 * @returns The created vehicle or null if creation failed
 */
export async function createVehicleFromShipment(
  shipment: ParsedShipment,
  options: SimulationOptions = {}
): Promise<SimulatedVehicle | null> {
  return SimulationFromShipmentService.getInstance().createVehicleFromShipment(shipment, options);
}

/**
 * Create and immediately animate a vehicle from a shipment
 * @param shipment The parsed shipment data
 * @param options Animation and simulation options
 * @returns Object with the vehicle and stop function
 */
export async function createAndAnimateVehicle(
  shipment: ParsedShipment,
  options: SimulationOptions & { speed?: number; updateInterval?: number } = {}
): Promise<{ vehicle: SimulatedVehicle | null; stop: () => void }> {
  const service = SimulationFromShipmentService.getInstance();
  
  // Apply our default visual options if not specified
  const enhancedOptions = {
    ...options,
    size: options.size || 2.5,
    color: options.color || '#00BFFF',
    showTooltip: options.showTooltip ?? true,
    showRouteLine: options.showRouteLine ?? true,
    routeLineColor: options.routeLineColor || ROUTE_LINE_COLOR,
    routeLineWidth: options.routeLineWidth || ROUTE_LINE_WIDTH
  };
  
  const vehicle = await service.createVehicleFromShipment(shipment, enhancedOptions);
  
  if (!vehicle) {
    return { vehicle: null, stop: () => {} };
  }
  
  const animation = service.animateVehicle(vehicle.id, options);
  
  return {
    vehicle,
    stop: animation.stop
  };
} 