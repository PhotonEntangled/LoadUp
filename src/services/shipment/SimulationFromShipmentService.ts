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
  routeLineGlow?: boolean;
  emoji?: string;
  zoomDependent?: boolean;
}

// Extended simulated vehicle with route data
interface ExtendedSimulatedVehicle extends SimulatedVehicle {
  routeData?: RouteData;
  route?: {
    id: string;
    stops: Array<{
      id: string;
      location: Location;
      type: string;
    }>;
    currentStopIndex: number;
  };
}

// Route data structure
interface RouteData {
  id: string;
  type: string;
  coordinates: [number, number][];
  color: string;
  width: number;
  glow?: boolean;
  isRealRoute?: boolean;
}

// Animation options
interface AnimationOptions {
  onProgress?: (data: {
    vehicleId: string;
    progress: number;
    currentPosition: Location;
    speed: number;
    heading: number;
  }) => void;
  onComplete?: () => void;
}

// Animation progress data
interface AnimationProgressData {
  vehicleId: string;
  progress: number;
  currentPosition: Location;
  speed: number;
  heading: number;
}

// Helper function to safely get the mapStore
function getMapStore() {
  const win = typeof window !== 'undefined' ? window : {} as any;
  return win.mapStore || null;
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
   * Fetch a route from the Mapbox Directions API
   * @param start The start location
   * @param end The end location
   * @returns The route data
   */
  private async fetchDirectionsRoute(
    start: { latitude: number; longitude: number }, 
    end: { latitude: number; longitude: number },
    options: { useMock?: boolean } = {}
  ): Promise<RouteInfo | null> {
    try {
      // Skip API call if mock is specified
      if (options.useMock) {
        return null;
      }
      
      // Check if coordinates are valid
      if (!this.validateCoordinates(start) || !this.validateCoordinates(end)) {
        console.error('[SimulationFromShipmentService] Invalid coordinates for route fetching');
        return null;
      }

      // Generate cache key
      const cacheKey = `${start.latitude},${start.longitude}-${end.latitude},${end.longitude}`;
          
      // Check cache first
      if (this.routeCache.has(cacheKey)) {
        const routeData = this.routeCache.get(cacheKey)!;
        console.log('[SimulationFromShipmentService] Using cached route');
        return routeData;
      }
      
      // Format coordinates for Mapbox API
      const origin: [number, number] = [start.longitude, start.latitude];
      const destination: [number, number] = [end.longitude, end.latitude];
      
      // Call MapDirectionsService to get route
      console.log('[SimulationFromShipmentService] Fetching route from Mapbox API');
      const routeData = await mapDirectionsService.getRoute(
        origin,
        destination,
        {
          profile: 'driving',
          steps: true,
          overview: 'full',
          annotations: ['speed', 'duration', 'distance'],
          // No need to set useMock here since we've already checked above
        }
      );
      
      // Log fetched route data before caching
      console.log('[SimulationFromShipmentService] Fetched routeData from API:', routeData);
            
      // Cache the result
      this.routeCache.set(cacheKey, routeData);
      
      return routeData;
    } catch (error) {
      console.error('[SimulationFromShipmentService] Error fetching route:', error);
      return null;
    }
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
      let routeCoordinates: [number, number][] = [];
      
      try {
        // Only fetch route if not using mock routes
        if (!options.useMockRoute) {
          routeData = await this.fetchDirectionsRoute(
            shipment.route.start,
            shipment.route.end,
            { useMock: options.useMockRoute }
          );
          
          if (routeData) {
            routeCoordinates = routeData.coordinates as [number, number][];
            console.log('[SimulationFromShipmentService] Using real-world route with', 
              routeCoordinates.length, 'coordinates');
          }
        }
      } catch (error) {
        console.error('[SimulationFromShipmentService] Error fetching route from Mapbox:', error);
        console.warn('[SimulationFromShipmentService] Falling back to straight line route');
      }

      // If route fetching failed or mock route option is set, create fallback route
      if (!routeData || options.useMockRoute || routeCoordinates.length < 2) {
        console.log('[SimulationFromShipmentService] Using straight line route fallback');
        routeCoordinates = [
          [shipment.route.start.longitude, shipment.route.start.latitude],
          [shipment.route.end.longitude, shipment.route.end.latitude]
        ];
      }

      // Default route color and width with enhanced visibility
      const ROUTE_LINE_COLOR = options.routeLineColor || '#00FF00'; // Bright green
      const ROUTE_LINE_WIDTH = options.routeLineWidth || 5; // Thicker line

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
        // Add shipment data for info display
        shipment?: {
          orderId: string;
          poNumber: string;
          shipDate: string;
          origin: string;
          destination: string;
          contact: string;
          remarks: string;
          weight: number;
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
          emoji: options.emoji || '🚚',  // Truck emoji for better visibility
          fontSize: 24,  // Larger font size for emoji
          highlightColor: '#ffff00',  // Yellow highlight for selection
          showRouteLine: options.showRouteLine ?? true,  // Show route line by default
          routeLineColor: ROUTE_LINE_COLOR, // Bright green route line
          routeLineWidth: ROUTE_LINE_WIDTH, // Thicker line for visibility
          zoomDependent: options.zoomDependent !== false, // Enable zoom-dependent styling
        },
        // Add explicit route data for map rendering - CRITICAL for visualization
        routeData: {
          id: `route-${vehicleId}`,
          type: 'LineString',
          coordinates: routeCoordinates,
          color: ROUTE_LINE_COLOR,
          width: ROUTE_LINE_WIDTH,
          glow: options.routeLineGlow !== false,
          isRealRoute: true,
        },
        // Add shipment data for info display
        shipment: {
          orderId: shipment.orderId,
          poNumber: shipment.poNumber,
          shipDate: shipment.shipDate || new Date().toISOString().split('T')[0],
          origin: shipment.originPO,
          destination: shipment.destination,
          contact: shipment.contact,
          remarks: shipment.remarks,
          weight: shipment.weight
        }
      };
      
      // Verify route data before saving
      if (!vehicle.routeData || !Array.isArray(vehicle.routeData.coordinates) || 
          vehicle.routeData.coordinates.length < 2) {
        console.error('[SimulationFromShipmentService] Invalid route data structure:', vehicle.routeData);
        // Set a minimal valid route as fallback
        vehicle.routeData = {
          id: `route-${vehicleId}`,
          type: 'LineString',
          coordinates: [
            [shipment.route.start.longitude, shipment.route.start.latitude],
            [shipment.route.end.longitude, shipment.route.end.latitude]
          ],
          color: ROUTE_LINE_COLOR,
          width: ROUTE_LINE_WIDTH,
          glow: true,
          isRealRoute: false
        };
      }
      
      // Log the constructed routeData object
      console.log('[SimulationFromShipmentService] Constructed routeData for vehicle:', vehicle.id, vehicle.routeData);

      // Track the vehicle in our local map
      this.simulatedVehicles.set(vehicleId, vehicle);
      
      const cachedRoute = this.routeCache.get(shipment.orderId);

      // Create the final vehicle object for the store, mapping RouteInfo to the expected routeData structure
      const vehicleToStore: ExtendedSimulatedVehicle = {
        ...vehicle, // Spread the base vehicle properties
        routeData: cachedRoute ? {
          id: cachedRoute.id,
          type: 'LineString',
          coordinates: cachedRoute.coordinates,
          color: '#007cff',
          width: 4,
          isRealRoute: true
        } : undefined
      };

      // ---> ADD LOGGING HERE <---
      console.log('[SimulationFromShipmentService] Vehicle before adding to store:', JSON.stringify(vehicleToStore, null, 2));
      
      // Add to store
      useUnifiedVehicleStore.getState().addOrUpdateVehicle(vehicleToStore);

      console.log(`[SimulationFromShipmentService] Added/Updated vehicle ${vehicleToStore.id} to store from shipment ${shipment.orderId}`);

      return vehicle;
    } catch (error) {
      console.error('[SimulationFromShipmentService] Error creating vehicle from shipment:', error);
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
   * Animates a vehicle along a route
   */
  private animateVehicle(
    vehicle: ExtendedSimulatedVehicle,
    routeData: RouteData,
    options: AnimationOptions = {}
  ): { stop: () => void } {
    const { onProgress, onComplete } = options;
    
    // Get the coordinates from the route
    const { coordinates } = routeData;
    
    if (!coordinates || coordinates.length < 2) {
      console.error('[SimulationFromShipmentService] Cannot animate vehicle: no valid coordinates');
      return { stop: () => {} };
    }
    
    // Get animation speed from sessionStorage, or use a reasonable default
    let speedMultiplier = 5; // Default reasonable speed
    try {
      const storedSpeed = window.sessionStorage.getItem('vehicle-animation-speed');
      if (storedSpeed) {
        const parsedSpeed = parseInt(storedSpeed, 10);
        if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
          speedMultiplier = parsedSpeed;
        }
      }
    } catch (error) {
      console.warn('[SimulationFromShipmentService] Could not read animation speed from sessionStorage:', error);
    }
    
    // Animation variables
    let currentIndex = 0;
    let running = true;
    let lastTimestamp = performance.now();
    let totalDistance = 0;
    
    // Calculate real-world distances between all points
    const segmentDistances: number[] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const distance = this.calculateDistance(
        coordinates[i][1], coordinates[i][0],
        coordinates[i+1][1], coordinates[i+1][0]
      );
      segmentDistances.push(distance);
      totalDistance += distance;
    }
    
    // Calculate realistic travel durations for each segment in seconds
    // Assuming average speed of 60 km/h = 16.7 m/s in urban areas
    const averageSpeed = 16.7; // meters per second
    const segmentDurations: number[] = segmentDistances.map(distance => distance / averageSpeed);
    
    // Animation timing variables
    const frameDuration = 1000 / 30; // Target 30 FPS
    let animationDuration = segmentDurations.reduce((sum, d) => sum + d, 0) * 1000; // in ms
    
    // Apply speed multiplier to make animation faster/slower
    animationDuration = animationDuration / speedMultiplier;
    
    console.log(`[SimulationFromShipmentService] Starting animation with ${coordinates.length} points, ${totalDistance.toFixed(0)}m distance, ${(animationDuration/1000).toFixed(1)}s duration (${speedMultiplier}x speed)`);
    
    // Update vehicle status to 'moving' (Corrected from 'in_transit')
    this.updateVehicleStatus(vehicle.id, 'moving');
    
    // Animation loop
    const animate = (timestamp: number) => {
      if (!running) return;
      
      // Calculate elapsed time since last frame
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Check if we need to update the animation speed from sessionStorage
      try {
        const storedSpeed = window.sessionStorage.getItem('vehicle-animation-speed');
        if (storedSpeed) {
          const parsedSpeed = parseInt(storedSpeed, 10);
          if (!isNaN(parsedSpeed) && parsedSpeed > 0 && parsedSpeed !== speedMultiplier) {
            // Update speed multiplier
            speedMultiplier = parsedSpeed;
            console.log(`[SimulationFromShipmentService] Updated animation speed to ${speedMultiplier}x`);
          }
        }
      } catch (error) {
        // Ignore errors reading from sessionStorage
      }
      
      // Move to next position based on elapsed time and speed
      // Calculate progress proportional to realistic travel time
      let elapsedDistance = 0;
      let targetSegment = 0;
      
      // Find which segment we're currently in
      let progressWithinSegment = 0;
      let timeInCurrentSegment = 0;
      
      for (let i = 0; i < segmentDurations.length; i++) {
        // Adjust segment duration based on speed multiplier
        const adjustedDuration = segmentDurations[i] * 1000 / speedMultiplier;
        
        if (timeInCurrentSegment + adjustedDuration >= deltaTime) {
          // We're in this segment
          targetSegment = i;
          progressWithinSegment = deltaTime / (adjustedDuration);
          break;
        }
        
        timeInCurrentSegment += adjustedDuration;
      }
      
      // Ensure we don't exceed the array bounds
      if (currentIndex + 1 >= coordinates.length) {
        // Animation complete
        running = false;
        
        // Set final position
        this.updateVehiclePosition(
          vehicle.id,
          coordinates[coordinates.length - 1][1],
          coordinates[coordinates.length - 1][0],
          0 // No movement, so speed is 0
        );
        
        // Update vehicle status to 'delivered'
        this.updateVehicleStatus(vehicle.id, 'delivered');
        
        // Fire completion callback
        if (onComplete) {
          onComplete();
        }
        
        console.log(`[SimulationFromShipmentService] Animation complete for vehicle ${vehicle.id}`);
        return;
      }

      // Calculate interpolated position
      const start = coordinates[currentIndex];
      const end = coordinates[currentIndex + 1];
      
      // Calculate heading (bearing) between points
      const bearing = this.calculateBearing(
        start[1], start[0],
        end[1], end[0]
      );
      
      // Interpolate between current segment
      const lat = start[1] + progressWithinSegment * (end[1] - start[1]);
      const lng = start[0] + progressWithinSegment * (end[0] - start[0]);
      
      // Calculate simulated speed based on the current segment's distance and duration
      // This gives us a realistic speed in m/s, which we convert to km/h
      const segmentDistance = segmentDistances[currentIndex];
      const segmentDuration = segmentDurations[currentIndex];
      const speed = (segmentDistance / segmentDuration) * 3.6; // Convert m/s to km/h
      
      // Update vehicle position
      this.updateVehiclePosition(vehicle.id, lat, lng, speed, bearing);
      
      // Call progress callback
      if (onProgress) {
        const overallProgress = currentIndex / (coordinates.length - 1);
        onProgress({
          vehicleId: vehicle.id,
          progress: overallProgress,
          currentPosition: { latitude: lat, longitude: lng },
          speed,
          heading: bearing
        });
      }
      
      // Move to next segment if we've completed the current one
      if (progressWithinSegment >= 1) {
        currentIndex++;
      }
      
      // Continue animation
      if (running) {
        requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
    
    // Return control object
    return {
      stop: () => {
        running = false;
        console.log(`[SimulationFromShipmentService] Animation stopped for vehicle ${vehicle.id}`);
      }
    };
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = this.deg2rad(lat1);
    const φ2 = this.deg2rad(lat2);
    const Δφ = this.deg2rad(lat2 - lat1);
    const Δλ = this.deg2rad(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate bearing between two points in degrees
   */
  private calculateBearing(
    lat1: number,
    lon1: number, 
    lat2: number,
    lon2: number
  ): number {
    const φ1 = this.deg2rad(lat1);
    const φ2 = this.deg2rad(lat2);
    const Δλ = this.deg2rad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // in degrees
  }

  /**
   * Update vehicle in the store
   */
  private updateVehicleInStore(vehicle: SimulatedVehicle): void {
    // Log the vehicle object being sent to the store
    console.log('[SimulationFromShipmentService] Updating vehicle in store:', vehicle.id, vehicle);
    
    if (!useUnifiedVehicleStore) {
      console.error('[SimulationFromShipmentService] useUnifiedVehicleStore is not available.');
      return;
    }
    
    try {
      // 1. First update the unified vehicle store (primary store)
      try {
        const store = useUnifiedVehicleStore.getState();
        if (store && typeof store.updateVehicle === 'function') {
          store.updateVehicle(vehicle.id, vehicle);
        } else if (store && typeof store.addOrUpdateVehicle === 'function') {
          store.addOrUpdateVehicle(vehicle);
        } else {
          console.warn('[SimulationFromShipmentService] Unable to find valid update method in unified store');
        }
      } catch (error) {
        console.error('[SimulationFromShipmentService] Error updating unified store:', error);
      }
      
      // 2. Create a compatible vehicle object for the map store
      const vehicleForMapStore = {
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
        // Add these properties to ensure compatibility with both stores
        isSimulated: vehicle.isSimulated,
        status: vehicle.status,
        routeData: (vehicle as any).routeData
      };
      
      // 3. Update the map store if available
      if (mapStore) {
        try {
          const mapState = mapStore.getState();
          
          // Apply different update strategies depending on the store's structure
          if (!mapState) {
            console.warn('[SimulationFromShipmentService] mapStore state is unavailable');
            return;
          }
          
          // Direct store action methods - try each method in order of preference
          if (typeof mapState.updateVehicle === 'function') {
            // Method 1: updateVehicle(id, data)
            mapState.updateVehicle(vehicle.id, vehicleForMapStore);
          } else if (typeof mapState.addOrUpdateVehicle === 'function') {
            // Method 2: addOrUpdateVehicle(vehicle)
            mapState.addOrUpdateVehicle(vehicleForMapStore);
          } else if (typeof mapState.addVehicle === 'function') {
            // Method 3: addVehicle(vehicle)
            mapState.addVehicle(vehicleForMapStore);
          } else if (typeof mapState.setVehicles === 'function' && mapState.vehicles) {
            // Method 4: Rebuild entire vehicles collection and setVehicles()
            
            // Handle both array and object structures
            let updatedVehicles;
            
            if (Array.isArray(mapState.vehicles)) {
              // For array structure, filter + add
              updatedVehicles = [
                ...mapState.vehicles.filter((v: any) => v.id !== vehicle.id),
                vehicleForMapStore
              ];
            } else if (typeof mapState.vehicles === 'object') {
              // For object structure, spread + update
              updatedVehicles = {
                ...mapState.vehicles,
                [vehicle.id]: vehicleForMapStore
              };
            } else {
              // Fallback to single-item array
              updatedVehicles = [vehicleForMapStore];
            }
            
            // Update the entire collection
            mapState.setVehicles(updatedVehicles);
          } else {
            // Last resort: direct state mutation
            console.warn('[SimulationFromShipmentService] Using direct state mutation (not recommended)');
            if (mapState.vehicles) {
              if (Array.isArray(mapState.vehicles)) {
                // Remove existing entry if present
                mapState.vehicles = mapState.vehicles.filter((v: any) => v.id !== vehicle.id);
                // Add updated vehicle
                mapState.vehicles.push(vehicleForMapStore);
              } else if (typeof mapState.vehicles === 'object') {
                // Direct object update
                mapState.vehicles[vehicle.id] = vehicleForMapStore;
              }
            } else {
              // Create new vehicles collection
              mapState.vehicles = typeof mapState.vehicles === 'object' 
                ? { [vehicle.id]: vehicleForMapStore } 
                : [vehicleForMapStore];
            }
          }
        } catch (error) {
          console.error('[SimulationFromShipmentService] Error updating mapStore:', error);
        }
      }
    } catch (error) {
      console.error('[SimulationFromShipmentService] Error in updateVehicleInStore:', error);
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

  /**
   * Stop animation for a vehicle
   */
  private stopAnimation(vehicleId: string): void {
    // Clear interval
    const intervalId = this.updateIntervals.get(vehicleId);
    if (intervalId) {
      clearInterval(intervalId);
      this.updateIntervals.delete(vehicleId);
      console.log(`[SimulationFromShipmentService] Animation stopped for vehicle ${vehicleId}`);
    }
  }

  /**
   * Updates a vehicle's position
   */
  private updateVehiclePosition(
    vehicleId: string,
    latitude: number,
    longitude: number,
    speed: number,
    heading?: number
  ): void {
    const vehicle = this.simulatedVehicles.get(vehicleId);
    if (!vehicle) return;
    
    // Create a new vehicle object with updated properties
    const updatedVehicle = {
      ...vehicle,
      location: {
        latitude,
        longitude
      },
      heading: heading !== undefined ? heading : vehicle.heading,
      speed,
      lastUpdated: new Date()
    };
    
    // Update in store
    this.updateVehicleInStore(updatedVehicle);
  }

  /**
   * Updates a vehicle's status
   */
  private updateVehicleStatus(
    vehicleId: string,
    status: VehicleStatus
  ): void {
    const vehicle = this.simulatedVehicles.get(vehicleId);
    if (!vehicle) return;
    
    // Create a new vehicle object with updated status
    const updatedVehicle = {
      ...vehicle,
      status,
      lastUpdated: new Date()
    };
    
    // Update in store
    this.updateVehicleInStore(updatedVehicle);
  }

  /**
   * Public wrapper to start vehicle animation.
   * @param vehicleId The ID of the vehicle to animate.
   * @param options Animation options.
   * @returns Control object with stop function, or null if animation can't start.
   */
  public startAnimation(
    vehicleId: string,
    options: AnimationOptions = {}
  ): { stop: () => void } | null {
    const vehicle = this.simulatedVehicles.get(vehicleId) as ExtendedSimulatedVehicle;
    if (!vehicle) {
      console.error(`[SimulationFromShipmentService] Cannot start animation: Vehicle ${vehicleId} not found`);
      return null;
    }

    const routeData = vehicle.routeData;
    if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
      console.error(`[SimulationFromShipmentService] Cannot start animation for ${vehicleId}: Invalid route data`, routeData);
      return null;
    }

    return this.animateVehicle(vehicle, routeData, options);
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
// Define a type for the combined options including AnimationOptions
interface CreateAndAnimateOptions extends SimulationOptions, AnimationOptions {
  speed?: number; 
  updateInterval?: number;
}

export async function createAndAnimateVehicle(
  shipment: ParsedShipment,
  options: CreateAndAnimateOptions = {}
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
  
  // Ensure routeData exists before attempting animation
  if (!vehicle.routeData) {
    console.error(`[SimulationFromShipmentService] Cannot animate vehicle ${vehicle.id}: Missing routeData.`);
    return { vehicle, stop: () => {} }; // Return vehicle but no-op stop function
  }
  
  // Use the public startAnimation method
  const animationControl = service.startAnimation(vehicle.id, {
    onProgress: options.onProgress,
    onComplete: options.onComplete
  });
  
  return {
    vehicle,
    stop: animationControl ? animationControl.stop : () => {}
  };
} 