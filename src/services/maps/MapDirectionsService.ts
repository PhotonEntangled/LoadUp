/**
 * MapDirectionsService
 * 
 * Handles routing and directions using Mapbox Directions API
 * Provides fallback to simplified routes when API is unavailable
 */

import { getMapboxPublicToken } from '../../utils/mapbox-token';
import { Vehicle } from '../../types/vehicle';

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

// Default token fallback
const FALLBACK_MAPBOX_TOKEN = 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';

class MapDirectionsService {
  private token: string;
  private useMockData: boolean;
  private cachedRoutes: Map<string, RouteInfo>;
  
  // Add additional globals for rate limiting and retries
  private rateLimitRemaining: number = 300; // Default Mapbox free tier limit
  private rateLimitNextReset: number = Date.now() + 60000; // Default 1 minute
  private mockModeForced: boolean = false;
  private errorCache: Map<string, { error: Error, timestamp: number }> = new Map();
  private readonly ERROR_CACHE_DURATION = 60000; // 1 minute
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second
  
  constructor() {
    this.token = getMapboxPublicToken(FALLBACK_MAPBOX_TOKEN);
    this.useMockData = false;
    this.cachedRoutes = new Map();
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
   * Check if we should use mock data based on rate limits and cached errors
   * @param cacheKey The cache key for the route
   * @returns True if mock data should be used
   */
  private shouldUseMockData(cacheKey: string): boolean {
    // If mock mode is globally forced, use mock data
    if (this.mockModeForced || this.useMockData) {
      return true;
    }
    
    // Check if we have a cached error
    if (this.errorCache.has(cacheKey)) {
      const { timestamp } = this.errorCache.get(cacheKey)!;
      // If the error is still fresh, use mock data
      if (Date.now() - timestamp < this.ERROR_CACHE_DURATION) {
        console.log('[MapDirectionsService] Using mock data due to recently cached error');
        return true;
      } else {
        // Error cache expired, remove it
        this.errorCache.delete(cacheKey);
      }
    }
    
    // Check if we're rate limited
    if (this.rateLimitRemaining <= 5) {
      const nowTime = Date.now();
      if (nowTime < this.rateLimitNextReset) {
        console.log(`[MapDirectionsService] Rate limit near exhaustion, using mock data until reset (${Math.round((this.rateLimitNextReset - nowTime)/1000)}s)`);
        return true;
      }
      // Reset time passed, reset our counter
      this.rateLimitRemaining = 300;
    }
    
    return false;
  }
  
  /**
   * Update rate limit information from response headers
   * @param headers Response headers from Mapbox API
   */
  private updateRateLimits(headers: Headers): void {
    try {
      // Extract rate limit information from headers
      const remaining = headers.get('X-Rate-Limit-Remaining');
      const reset = headers.get('X-Rate-Limit-Reset');
      
      if (remaining) {
        this.rateLimitRemaining = parseInt(remaining, 10);
      }
      
      if (reset) {
        // Reset time is in seconds, convert to milliseconds
        this.rateLimitNextReset = parseInt(reset, 10) * 1000;
      }
      
      console.log(`[MapDirectionsService] Rate limit: ${this.rateLimitRemaining} requests remaining, resets in ${Math.round((this.rateLimitNextReset - Date.now())/1000)}s`);
    } catch (error) {
      console.warn('[MapDirectionsService] Error parsing rate limit headers:', error);
    }
  }
  
  /**
   * Force mock mode globally (use for severe rate limiting)
   * @param force Whether to force mock mode
   */
  public forceMockMode(force: boolean): void {
    this.mockModeForced = force;
    console.log(`[MapDirectionsService] ${force ? 'Forcing mock mode ON' : 'Forcing mock mode OFF'}`);
  }
  
  /**
   * Get directions for a route with more detailed options
   */
  async getDirections(
    route: SimpleRouteRequest,
    options: RouteOptions = {}
  ): Promise<RouteInfo> {
    // Create a cache key based on coordinates and options
    const cacheKey = this.createCacheKey(route, options);
    
    // Check if we should use mock data
    const useMock = options.useMock !== undefined ? options.useMock : this.shouldUseMockData(cacheKey);
    
    // For mock mode, return simplified route
    if (useMock) {
      console.log('[MapDirectionsService] Using mock route data');
      return this.createMockRoute(route);
    }
    
    // Check cache first
    if (this.cachedRoutes.has(cacheKey)) {
      console.log('[MapDirectionsService] Returning cached route');
      return this.cachedRoutes.get(cacheKey)!;
    }
    
    // Implement retry with exponential backoff
    let retries = 0;
    while (retries <= this.MAX_RETRIES) {
      try {
        // Build the request URL
        const { origin, destination, waypoints } = route;
        
        // Format coordinates as 'lng,lat' strings
        const originStr = `${origin[0]},${origin[1]}`;
        const destinationStr = `${destination[0]},${destination[1]}`;
        
        // Add waypoints if provided
        let waypointsStr = '';
        if (waypoints && waypoints.length > 0) {
          waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
          waypointsStr = `;${waypointsStr};`;
        }
        
        // Build coordinates string
        const coordinatesStr = `${originStr}${waypointsStr}${destinationStr}`;
        
        // Set default options if not provided
        const profile = options.profile || 'driving';
        const steps = options.steps !== undefined ? options.steps : true;
        const geometries = options.geometries || 'geojson';
        const alternatives = options.alternatives !== undefined ? options.alternatives : false;
        const overview = options.overview || 'full';
        const annotations = options.annotations?.join(',') || '';
        
        // Build query parameters
        const params = new URLSearchParams({
          access_token: this.token,
          steps: String(steps),
          geometries,
          alternatives: String(alternatives),
          overview,
        });
        
        // Add annotations if specified
        if (annotations) {
          params.append('annotations', annotations);
        }
        
        // Build the final URL
        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesStr}?${params.toString()}`;
        
        console.log(`[MapDirectionsService] Fetching route from Mapbox Directions API (attempt ${retries + 1}): ${url.substring(0, 100)}...`);
        
        // Make the API request
        const response = await fetch(url);
        
        // Update rate limit information
        this.updateRateLimits(response.headers);
        
        // Handle rate limiting
        if (response.status === 429) {
          console.warn(`[MapDirectionsService] Hit rate limit (429 Too Many Requests)`);
          
          // Cache the error
          this.errorCache.set(cacheKey, { 
            error: new Error('Mapbox Directions API rate limit exceeded'),
            timestamp: Date.now()
          });
          
          // Force mock mode if this is the second 429 error in a row
          if (retries >= 1) {
            this.forceMockMode(true);
            // Auto-reset after 5 minutes
            setTimeout(() => {
              this.forceMockMode(false);
            }, 5 * 60 * 1000);
          }
          
          // If we've tried enough times, fall back to mock route
          if (retries >= this.MAX_RETRIES) {
            console.warn(`[MapDirectionsService] Max retries exceeded, falling back to mock route`);
            return this.createMockRoute(route);
          }
          
          // Otherwise, retry with exponential backoff
          const delay = this.RETRY_DELAY_BASE * Math.pow(2, retries);
          console.log(`[MapDirectionsService] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          continue;
        }
        
        // Check if the request was successful
        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`Mapbox Directions API error: ${response.status} ${errorText}`);
          
          // Cache the error
          this.errorCache.set(cacheKey, { error, timestamp: Date.now() });
          
          throw error;
        }
        
        // Parse the response
        const data = await response.json();
        
        // Process the API response into our RouteInfo format
        const processedRoute = this.processMapboxResponse(data, route);
        
        // Cache the result
        this.cachedRoutes.set(cacheKey, processedRoute);
        
        return processedRoute;
      } catch (error) {
        console.error('[MapDirectionsService] Error fetching directions:', error);
        
        // If we've tried enough times, fall back to mock route
        if (retries >= this.MAX_RETRIES) {
          console.warn('[MapDirectionsService] Falling back to mock route due to API error');
          return this.createMockRoute(route);
        }
        
        // Otherwise, retry with exponential backoff
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, retries);
        console.log(`[MapDirectionsService] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }
    
    // If we get here, all retries failed
    console.error('[MapDirectionsService] All retries failed, using mock route');
    return this.createMockRoute(route);
  }
  
  /**
   * Convert Mapbox Directions API response to RouteInfo
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
   * Create a cache key for a route request
   */
  private createCacheKey(route: SimpleRouteRequest, options: RouteOptions): string {
    const { origin, destination, waypoints = [] } = route;
    
    // Format coordinates
    const originStr = `${origin[0]},${origin[1]}`;
    const destinationStr = `${destination[0]},${destination[1]}`;
    const waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
    
    // Create key with options
    return `${originStr}|${waypointsStr}|${destinationStr}|${options.profile || 'driving'}`;
  }
  
  /**
   * Clear the route cache
   */
  clearCache(): void {
    this.cachedRoutes.clear();
    console.log('[MapDirectionsService] Route cache cleared');
  }
}

// Export a singleton instance
export const mapDirectionsService = new MapDirectionsService();

// Default export for testing
export default MapDirectionsService; 