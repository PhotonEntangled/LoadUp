/**
 * MapDirectionsService
 * 
 * Handles routing and directions using Mapbox Directions API
 * Uses the official Mapbox SDK for reliable and consistent API access
 */

import mapboxSdk from '@mapbox/mapbox-sdk';
import directionsService from '@mapbox/mapbox-sdk/services/directions';
import { getMapboxPublicToken } from '../../utils/mapbox-token';
import { Vehicle } from '../../types/vehicle';
import { validateMapboxToken } from '../../utils/mapbox-token';

// Define the coordinate type - [longitude, latitude]
export type Coordinate = [number, number];

// Route instruction step type
export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  coordinates: Coordinate[];
  maneuver?: {
    type: string;
    instruction: string;
    bearing_before: number;
    bearing_after: number;
  };
}

// Route summary information
export interface RouteSummary {
  distance: number; // in meters
  duration: number; // in seconds
  estimatedArrival: Date;
}

// Full route information
export interface RouteInfo {
  id: string;
  summary: RouteSummary;
  coordinates: Coordinate[];
  legs: {
    steps: RouteStep[];
    summary: {
      distance: number;
      duration: number;
    };
  }[];
  originName?: string;
  destinationName?: string;
  waypoints?: {
    name: string;
    location: Coordinate;
  }[];
}

// Options for route fetching
export interface RouteOptions {
  profile?: 'driving' | 'walking' | 'cycling';
  alternatives?: boolean;
  steps?: boolean;
  geometries?: 'geojson' | 'polyline';
  overview?: 'full' | 'simplified' | 'false';
  annotations?: string[];
  useMock?: boolean; // Override to use mock data
}

// Interface for simplified route request
export interface SimpleRouteRequest {
  origin: Coordinate;
  destination: Coordinate;
  waypoints?: Coordinate[];
}

// Centralized rate limiting and caching for all Mapbox Directions API calls
class RequestManager {
  private static instance: RequestManager | null = null;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private requestHistory: { timestamp: number }[] = [];
  
  private readonly CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour
  private readonly MAX_REQUESTS_PER_MINUTE = 50;
  
  private constructor() {}
  
  public static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }
  
  public async request<T>(key: string, executor: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      console.log(`[RequestManager] Using cached data for ${key}`);
      return cached.data;
    }
    
    // Check if this request is already in flight
    if (this.pendingRequests.has(key)) {
      console.log(`[RequestManager] Reusing in-flight request for ${key}`);
      return this.pendingRequests.get(key)!;
    }
    
    // Apply rate limiting
    await this.applyRateLimit();
    
    // Execute the request
    const requestPromise = executor()
      .then(data => {
        // Cache the result
        this.cache.set(key, { data, timestamp: Date.now() });
        // Remove from pending
        this.pendingRequests.delete(key);
        // Return the data
        return data;
      })
      .catch(error => {
        // Remove from pending
        this.pendingRequests.delete(key);
        // Re-throw the error
        throw error;
      });
    
    // Store the pending request
    this.pendingRequests.set(key, requestPromise);
    
    // Track this request for rate limiting
    this.requestHistory.push({ timestamp: Date.now() });
    
    return requestPromise;
  }
  
  private async applyRateLimit(): Promise<void> {
    // Clean up old requests
    const now = Date.now();
    this.requestHistory = this.requestHistory.filter(
      req => now - req.timestamp < 60000 // Last minute
    );
    
    // Check if we're about to exceed rate limit
    if (this.requestHistory.length >= this.MAX_REQUESTS_PER_MINUTE) {
      const oldestRequest = this.requestHistory[0];
      const timeToWait = 60000 - (now - oldestRequest.timestamp);
      
      console.log(`[RequestManager] Rate limit almost exceeded, waiting ${timeToWait}ms`);
      
      // Wait until we can make another request
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
  }
  
  public clearCache(): void {
    this.cache.clear();
    console.log('[RequestManager] Cache cleared');
  }
}

/**
 * MapDirectionsService using Mapbox SDK
 * Follows industry standard patterns for API interaction with Mapbox
 */
class MapDirectionsService {
  private directionsClient: any;
  private useMockData: boolean = false;
  private requestManager: RequestManager = RequestManager.getInstance();
  
  // Hardcoded fallback token for development
  private FALLBACK_MAPBOX_TOKEN = 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';
  
  constructor() {
    // Initialize the Mapbox SDK with token - prioritize environment token, fallback to hardcoded
    let token = getMapboxPublicToken();
    
    // Add explicit token validation logging
    const validation = validateMapboxToken(token);
    console.log(`[MapDirectionsService] Token validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
    
    // If token is invalid, use fallback token
    if (!validation.valid) {
      console.warn(`[MapDirectionsService] Token validation failed: ${validation.reason}`);
      console.log(`[MapDirectionsService] Using fallback token instead`);
      token = this.FALLBACK_MAPBOX_TOKEN;
      
      // Validate fallback token
      const fallbackValidation = validateMapboxToken(token);
      if (!fallbackValidation.valid) {
        console.error(`[MapDirectionsService] Fallback token also invalid: ${fallbackValidation.reason}`);
        console.log(`[MapDirectionsService] Will use mock data only`);
        this.useMockData = true;
      } else {
        console.log(`[MapDirectionsService] Fallback token validated successfully ✅`);
      }
    } else {
      console.log(`[MapDirectionsService] Using valid Mapbox token: ${token.substring(0, 9)}...`);
    }
    
    try {
      // Initialize SDK with the (possibly fallback) token
      const mapboxClient = mapboxSdk({ accessToken: token });
      this.directionsClient = directionsService(mapboxClient);
      
      console.log('[MapDirectionsService] ✅ Initialized with Mapbox SDK');
    } catch (error) {
      console.error('[MapDirectionsService] ❌ Error initializing Mapbox SDK:', error);
      console.log('[MapDirectionsService] Falling back to mock data');
      this.useMockData = true;
    }
  }
  
  /**
   * Set whether to use mock data globally
   */
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    console.log(`[MapDirectionsService] ${useMock ? 'Using mock data' : 'Using real Mapbox API'}`);
  }
  
  /**
   * Validate a single coordinate to ensure it's within Mapbox bounds
   */
  private validateCoordinate(coord: Coordinate): boolean {
    // Coordinates must be [longitude, latitude]
    if (!Array.isArray(coord) || coord.length !== 2) {
      console.error('[MapDirectionsService] Invalid coordinate format:', coord);
      return false;
    }
    
    const [longitude, latitude] = coord;
    
    // Check that coordinates are numbers
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      console.error('[MapDirectionsService] Coordinates must be numbers:', coord);
      return false;
    }
    
    // Check latitude is between -90 and 90
    if (latitude < -90 || latitude > 90) {
      console.error(`[MapDirectionsService] Invalid latitude: ${latitude}`);
      return false;
    }
    
    // Check longitude is between -180 and 180
    if (longitude < -180 || longitude > 180) {
      console.error(`[MapDirectionsService] Invalid longitude: ${longitude}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Get a route from origin to destination
   */
  async getRoute(
    origin: Coordinate,
    destination: Coordinate,
    options: RouteOptions = {}
  ): Promise<RouteInfo> {
    // Validate coordinates
    if (!this.validateCoordinate(origin) || !this.validateCoordinate(destination)) {
      throw new Error('Invalid coordinates provided');
    }
    
    return this.getDirections({
      origin,
      destination,
      waypoints: []
    }, options);
  }
  
  /**
   * Get a route from a vehicle to a destination
   */
  async getVehicleRoute(
    vehicle: Vehicle,
    destination: Coordinate,
    options: RouteOptions = {}
  ): Promise<RouteInfo> {
    if (!vehicle.location) {
      throw new Error('Vehicle does not have a location');
    }
    
    return this.getDirections({
      origin: [vehicle.location.longitude, vehicle.location.latitude],
      destination,
      waypoints: []
    }, options);
  }
  
  /**
   * Get directions using Mapbox SDK
   */
  async getDirections(
    route: SimpleRouteRequest,
    options: RouteOptions = {}
  ): Promise<RouteInfo> {
    // Create cache key
    const cacheKey = this.createCacheKey(route, options);
    
    // If mock mode is requested, return mock data immediately
    if (options.useMock || this.useMockData) {
      console.log('[MapDirectionsService] Using mock route data');
      return this.createMockRoute(route);
    }
    
    try {
      // Use request manager to handle caching and rate limiting
      return await this.requestManager.request(cacheKey, async () => {
        // Log the operation
        console.log(`[MapDirectionsService] Fetching directions from Mapbox SDK for ${route.origin} to ${route.destination}`);
        
        // Prepare the request based on SDK format
        const requestParams = {
          profile: options.profile || 'driving',
          geometries: options.geometries || 'geojson',
          overview: options.overview || 'full',
          steps: options.steps !== undefined ? options.steps : true,
          annotations: options.annotations || ['speed', 'duration', 'distance'],
          waypoints: [
            { coordinates: route.origin },
            ...(route.waypoints || []).map(wp => ({ coordinates: wp })),
            { coordinates: route.destination }
          ],
          alternatives: options.alternatives
        };
        
        // Add detailed request logging
        console.log(`[MapDirectionsService] Request parameters:`, JSON.stringify(requestParams));
        
        try {
          // Make the request using the official SDK
          const response = await this.directionsClient.getDirections(requestParams).send();
          
          // Success logging
          console.log(`[MapDirectionsService] Received successful response with ${response.body.routes?.length || 0} routes`);
          
          // Process the response
          return this.processMapboxResponse(response.body, route);
        } catch (requestError) {
          console.error('[MapDirectionsService] Error in Mapbox SDK request:', requestError);
          // Throw to trigger fallback
          throw requestError;
        }
      });
    } catch (error) {
      console.error('[MapDirectionsService] Error fetching directions:', error);
      console.warn('[MapDirectionsService] Falling back to mock route');
      
      // If API request fails, fall back to mock data
      return this.createMockRoute(route);
    }
  }
  
  /**
   * Create a cache key for a route request
   */
  private createCacheKey(route: SimpleRouteRequest, options: RouteOptions): string {
    const { origin, destination, waypoints } = route;
    
    // Normalize waypoints to empty array if undefined
    const normalizedWaypoints = waypoints || [];
    
    // Create a string that uniquely identifies this request
    const coordsString = [
      origin.join(','),
      ...normalizedWaypoints.map(wp => wp.join(',')),
      destination.join(',')
    ].join(';');
    
    // Include relevant options in the cache key
    const optionsString = [
      options.profile || 'driving',
      options.alternatives ? 'alt' : 'noalt',
      options.overview || 'full'
    ].join('_');
    
    return `${coordsString}|${optionsString}`;
  }
  
  /**
   * Convert Mapbox Directions SDK response to RouteInfo
   */
  private processMapboxResponse(response: any, request: SimpleRouteRequest): RouteInfo {
    // Ensure we have routes in the response
    if (!response.routes || response.routes.length === 0) {
      throw new Error('No routes found in Mapbox response');
    }
    
    // Get the first (optimal) route
    const route = response.routes[0];
    
    // Extract waypoint names if available
    const waypoints = response.waypoints?.map((wp: any) => ({
      name: wp.name || 'Unnamed location',
      location: [wp.location[0], wp.location[1]] as Coordinate
    })) || [];
    
    // Create route legs with steps
    const legs = route.legs?.map((leg: any) => ({
      steps: leg.steps?.map((step: any) => ({
        instruction: step.maneuver?.instruction || 'Continue',
        distance: step.distance || 0,
        duration: step.duration || 0,
        coordinates: step.geometry?.coordinates || [],
        maneuver: step.maneuver ? {
          type: step.maneuver.type || 'turn',
          instruction: step.maneuver.instruction || '',
          bearing_before: step.maneuver.bearing_before || 0,
          bearing_after: step.maneuver.bearing_after || 0
        } : undefined
      })) || [],
      summary: {
        distance: leg.distance || 0,
        duration: leg.duration || 0
      }
    })) || [];
    
    // Extract all coordinates from the route geometry
    const coordinates = route.geometry?.coordinates || [];
    
    // Calculate estimated arrival time
    const now = new Date();
    const estimatedArrival = new Date(now.getTime() + (route.duration || 0) * 1000);
    
    // Create a unique ID for the route
    const id = `route-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Return formatted route info
    return {
      id,
      summary: {
        distance: route.distance || 0,
        duration: route.duration || 0,
        estimatedArrival
      },
      coordinates,
      legs,
      originName: waypoints[0]?.name,
      destinationName: waypoints[waypoints.length - 1]?.name,
      waypoints
    };
  }
  
  /**
   * Create a mock route for testing or offline use
   */
  private createMockRoute(route: SimpleRouteRequest): RouteInfo {
    const { origin, destination, waypoints = [] } = route;
    
    // Create a unique ID
    const id = `mock-route-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Calculate a mock distance (straight line)
    const distance = this.calculateDistance(origin, destination);
    
    // Estimate duration based on speed (60 km/h = 16.67 m/s)
    const duration = distance / 16.67;
    
    // Calculate estimated arrival
    const now = new Date();
    const estimatedArrival = new Date(now.getTime() + duration * 1000);
    
    // Create coordinates array
    let coordinates: Coordinate[] = [origin];
    
    // Add waypoints if provided
    if (waypoints && waypoints.length > 0) {
      coordinates = [...coordinates, ...waypoints];
    }
    
    // Add destination
    coordinates.push(destination);
    
    // If only two points, add a midpoint to make the route more realistic
    if (coordinates.length === 2) {
      const midpoint: Coordinate = [
        (origin[0] + destination[0]) / 2,
        (origin[1] + destination[1]) / 2 + (Math.random() * 0.01 - 0.005) // Add slight variation
      ];
      coordinates = [origin, midpoint, destination];
    }
    
    // Mock a single leg with one step
    const legs = [{
      steps: [{
        instruction: 'Drive to destination',
        distance,
        duration,
        coordinates,
        maneuver: {
          type: 'depart',
          instruction: 'Start driving',
          bearing_before: 0,
          bearing_after: 90
        }
      }],
      summary: {
        distance,
        duration
      }
    }];
    
    return {
      id,
      summary: {
        distance,
        duration,
        estimatedArrival
      },
      coordinates,
      legs,
      originName: 'Origin',
      destinationName: 'Destination'
    };
  }
  
  /**
   * Calculate straight-line distance between two coordinates (in meters)
   * Uses the Haversine formula
   */
  private calculateDistance(point1: Coordinate, point2: Coordinate): number {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    
    // Convert to radians
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const radLon1 = (lon1 * Math.PI) / 180;
    const radLon2 = (lon2 * Math.PI) / 180;
    
    // Differences
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;
    
    // Haversine formula
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Earth radius in meters
    const R = 6371000;
    
    // Calculate distance
    return R * c;
  }
  
  /**
   * Clear the route cache
   */
  clearCache(): void {
    this.requestManager.clearCache();
  }
}

// Export a singleton instance - only create this once
export const mapDirectionsService = new MapDirectionsService();

// Default export for testing
export default MapDirectionsService;
