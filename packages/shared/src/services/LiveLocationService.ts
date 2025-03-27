import { Vehicle as ShipmentVehicle } from '../types/shipment-tracking.js';

// Local type definitions to ensure compatibility
interface CurrentLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface Vehicle extends ShipmentVehicle {
  currentLocation?: CurrentLocation;
}

export interface LocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface LocationTrackingOptions {
  pollingInterval?: number; // Time in ms between location updates when using polling
  maxAge?: number; // Maximum age of location data in ms
  enableHighAccuracy?: boolean;
  useWebsocket?: boolean; // Whether to use WebSocket for real-time updates
  websocketUrl?: string;
  apiUrl?: string; // API endpoint for polling
  onLocationUpdate?: (location: LocationUpdate) => void;
  onError?: (error: Error) => void;
  vehicleIds?: string[]; // IDs of vehicles to track
  shipmentId?: string; // ID of shipment to track
}

export interface LocationServiceState {
  tracking: boolean;
  vehicles: { [id: string]: Vehicle };
  lastUpdated: { [id: string]: Date };
  listeners: Array<(locations: { [id: string]: CurrentLocation }) => void>;
  websocket: WebSocket | null;
  pollingInterval: number | null;
}

/**
 * Service for tracking live location of vehicles/drivers
 */
class LiveLocationService {
  private options: LocationTrackingOptions;
  private state: LocationServiceState;
  private locationWatchId?: number;
  
  /**
   * Create a new LiveLocationService
   * @param options Options for location tracking
   */
  constructor(options: LocationTrackingOptions = {}) {
    this.options = {
      pollingInterval: 5000, // 5 seconds default
      maxAge: 60000, // 1 minute default
      enableHighAccuracy: true,
      useWebsocket: true,
      websocketUrl: undefined,
      apiUrl: undefined,
      ...options,
    };
    
    this.state = {
      tracking: false,
      vehicles: {},
      lastUpdated: {},
      listeners: [],
      websocket: null,
      pollingInterval: null,
    };
  }
  
  /**
   * Start tracking vehicle locations
   * @param options Tracking options that override constructor options
   */
  startTracking(options?: Partial<LocationTrackingOptions>): void {
    if (this.state.tracking) {
      this.stopTracking();
    }
    
    // Update options with any new values
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    if (this.options.useWebsocket && this.options.websocketUrl) {
      this.setupWebSocket();
    } else if (this.options.apiUrl) {
      this.setupPolling();
    } else {
      throw new Error('No API URL or WebSocket URL provided for location tracking');
    }
    
    this.state.tracking = true;
  }
  
  /**
   * Stop tracking vehicle locations
   */
  stopTracking(): void {
    if (this.state.websocket) {
      this.state.websocket.close();
      this.state.websocket = null;
    }
    
    if (this.state.pollingInterval !== null) {
      clearInterval(this.state.pollingInterval);
      this.state.pollingInterval = null;
    }
    
    if (this.locationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = undefined;
    }
    
    this.state.tracking = false;
  }
  
  /**
   * Set up WebSocket connection for real-time location updates
   */
  private setupWebSocket(): void {
    if (!this.options.websocketUrl) {
      throw new Error('WebSocket URL not provided');
    }
    
    const queryParams = [];
    
    if (this.options.vehicleIds && this.options.vehicleIds.length > 0) {
      queryParams.push(`vehicleIds=${this.options.vehicleIds.join(',')}`);
    }
    
    if (this.options.shipmentId) {
      queryParams.push(`shipmentId=${this.options.shipmentId}`);
    }
    
    const url = `${this.options.websocketUrl}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('Location tracking WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (Array.isArray(data)) {
            // Handle array of location updates
            data.forEach(update => this.processLocationUpdate(update));
          } else {
            // Handle single location update
            this.processLocationUpdate(data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          
          if (this.options.onError && error instanceof Error) {
            this.options.onError(error);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        if (this.options.onError) {
          this.options.onError(new Error('WebSocket connection error'));
        }
        
        // Fall back to polling if WebSocket fails
        this.fallbackToPolling();
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        
        // If still tracking, try to reconnect or fall back to polling
        if (this.state.tracking) {
          this.fallbackToPolling();
        }
      };
      
      this.state.websocket = ws;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      
      if (this.options.onError && error instanceof Error) {
        this.options.onError(error);
      }
      
      // Fall back to polling
      this.fallbackToPolling();
    }
  }
  
  /**
   * Fall back to polling if WebSocket connection fails
   */
  private fallbackToPolling(): void {
    console.log('Falling back to polling for location updates');
    
    // Clean up WebSocket if it exists
    if (this.state.websocket) {
      try {
        this.state.websocket.close();
      } catch (e) {
        console.error('Error closing WebSocket:', e);
      }
      
      this.state.websocket = null;
    }
    
    // Set up polling if API URL is available
    if (this.options.apiUrl) {
      this.setupPolling();
    } else {
      console.error('Cannot fall back to polling: No API URL provided');
      
      if (this.options.onError) {
        this.options.onError(new Error('Cannot track location: WebSocket failed and no API URL provided'));
      }
    }
  }
  
  /**
   * Set up polling for location updates
   */
  private setupPolling(): void {
    if (!this.options.apiUrl) {
      throw new Error('API URL not provided for location polling');
    }
    
    // Clear any existing polling interval
    if (this.state.pollingInterval !== null) {
      clearInterval(this.state.pollingInterval);
    }
    
    // Function to poll for location updates
    const pollLocations = async () => {
      try {
        const queryParams = [];
        
        if (this.options.vehicleIds && this.options.vehicleIds.length > 0) {
          queryParams.push(`vehicleIds=${this.options.vehicleIds.join(',')}`);
        }
        
        if (this.options.shipmentId) {
          queryParams.push(`shipmentId=${this.options.shipmentId}`);
        }
        
        const url = `${this.options.apiUrl}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Handle array of location updates
          data.forEach(update => this.processLocationUpdate(update));
        } else {
          // Handle single location update
          this.processLocationUpdate(data);
        }
      } catch (error) {
        console.error('Error polling for location updates:', error);
        
        if (this.options.onError && error instanceof Error) {
          this.options.onError(error);
        }
      }
    };
    
    // Poll immediately and then at the specified interval
    pollLocations();
    
    this.state.pollingInterval = window.setInterval(
      pollLocations,
      this.options.pollingInterval
    );
  }
  
  /**
   * Process a location update and notify listeners
   * @param update Location update data
   */
  private processLocationUpdate(update: LocationUpdate): void {
    // Validate location update
    if (!update.vehicleId || update.latitude === undefined || update.longitude === undefined) {
      console.warn('Invalid location update received:', update);
      return;
    }
    
    // Ensure timestamp is a Date object
    const timestamp = update.timestamp instanceof Date
      ? update.timestamp
      : new Date(update.timestamp);
    
    // Process the update
    const vehicle = this.state.vehicles[update.vehicleId];
    
    if (vehicle) {
      // Update existing vehicle
      if (vehicle.currentLocation) {
        vehicle.currentLocation.latitude = update.latitude;
        vehicle.currentLocation.longitude = update.longitude;
        vehicle.currentLocation.timestamp = timestamp;
        
        if (update.heading !== undefined) {
          vehicle.currentLocation.heading = update.heading;
        }
        
        if (update.speed !== undefined) {
          vehicle.currentLocation.speed = update.speed;
        }
        
        if (update.accuracy !== undefined) {
          vehicle.currentLocation.accuracy = update.accuracy;
        }
      } else {
        // Create new location object
        vehicle.currentLocation = {
          latitude: update.latitude,
          longitude: update.longitude,
          timestamp,
          heading: update.heading,
          speed: update.speed,
          accuracy: update.accuracy,
        };
      }
    } else {
      // Create a new vehicle if it doesn't exist
      this.state.vehicles[update.vehicleId] = {
        id: update.vehicleId,
        name: `Vehicle ${update.vehicleId}`,
        licensePlate: '',
        type: 'truck',
        currentLocation: {
          latitude: update.latitude,
          longitude: update.longitude,
          timestamp,
          heading: update.heading,
          speed: update.speed,
          accuracy: update.accuracy,
        },
      };
    }
    
    // Update last updated time
    this.state.lastUpdated[update.vehicleId] = new Date();
    
    // Trigger callback if provided
    if (this.options.onLocationUpdate) {
      this.options.onLocationUpdate(update);
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Notify all listeners with the current location data
   */
  private notifyListeners(): void {
    const locations: { [id: string]: CurrentLocation } = {};
    
    // Convert vehicles to locations
    Object.keys(this.state.vehicles).forEach(id => {
      const vehicle = this.state.vehicles[id];
      
      if (vehicle.currentLocation) {
        locations[id] = vehicle.currentLocation;
      }
    });
    
    // Notify all listeners
    this.state.listeners.forEach(listener => {
      try {
        listener(locations);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }
  
  /**
   * Start tracking the user's location (for driver app)
   * @param options Options for tracking
   */
  startTrackingUserLocation(options?: {
    enableHighAccuracy?: boolean;
    onLocationUpdate?: (location: CurrentLocation) => void;
    onError?: (error: Error) => void;
  }): void {
    if (this.locationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }
    
    // Merge with default options
    const trackOptions = {
      enableHighAccuracy: this.options.enableHighAccuracy,
      ...options,
    };
    
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      console.error(error);
      
      if (trackOptions.onError) {
        trackOptions.onError(error);
      }
      
      return;
    }
    
    // Start watching position
    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: CurrentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date(position.timestamp),
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };
        
        // Notify callback if provided
        if (trackOptions.onLocationUpdate) {
          trackOptions.onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        
        if (trackOptions.onError) {
          trackOptions.onError(new Error(`Geolocation error: ${error.message}`));
        }
      },
      {
        enableHighAccuracy: trackOptions.enableHighAccuracy,
        maximumAge: this.options.maxAge,
        timeout: 10000,
      }
    );
  }
  
  /**
   * Stop tracking the user's location
   */
  stopTrackingUserLocation(): void {
    if (this.locationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = undefined;
    }
  }
  
  /**
   * Add a listener for location updates
   * @param listener Callback function to be called with location updates
   * @returns Function to remove the listener
   */
  addListener(listener: (locations: { [id: string]: CurrentLocation }) => void): () => void {
    this.state.listeners.push(listener);
    
    // Return function to remove listener
    return () => {
      const index = this.state.listeners.indexOf(listener);
      
      if (index !== -1) {
        this.state.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Get all currently tracked vehicles
   * @returns Object with vehicle ID as key and Vehicle as value
   */
  getVehicles(): { [id: string]: Vehicle } {
    return { ...this.state.vehicles };
  }
  
  /**
   * Get a specific vehicle by ID
   * @param id Vehicle ID
   * @returns Vehicle object or undefined if not found
   */
  getVehicle(id: string): Vehicle | undefined {
    return this.state.vehicles[id];
  }
  
  /**
   * Check if a vehicle is stale (hasn't been updated recently)
   * @param id Vehicle ID
   * @returns True if vehicle is stale, false otherwise
   */
  isVehicleStale(id: string): boolean {
    const lastUpdated = this.state.lastUpdated[id];
    
    if (!lastUpdated) {
      return true;
    }
    
    const now = new Date();
    const ageMs = now.getTime() - lastUpdated.getTime();
    
    return ageMs > this.options.maxAge!;
  }
  
  /**
   * Get the service tracking status
   * @returns True if currently tracking, false otherwise
   */
  isTracking(): boolean {
    return this.state.tracking;
  }
}

// Export a singleton instance
const liveLocationService = new LiveLocationService();

export default liveLocationService; 