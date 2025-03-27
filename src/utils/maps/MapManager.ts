import mapboxgl from 'mapbox-gl';

type MapReadyCallback = (map: mapboxgl.Map) => void;
type MapErrorCallback = (error: Error) => void;

interface MapRegistration {
  id: string;
  map: mapboxgl.Map;
  isReady: boolean;
  createdAt: Date;
}

export enum MapStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR',
}

/**
 * MapManager - Singleton for managing map instance lifecycles
 * 
 * This utility solves the common issue of components trying to access
 * map instances before they're ready, causing render loops.
 */
class MapManager {
  private maps: Record<string, MapRegistration> = {};
  private readyCallbacks: Record<string, MapReadyCallback[]> = {};
  private errorCallbacks: Record<string, MapErrorCallback[]> = {};
  private defaultMapId: string | null = null;
  
  // Keep references to event handlers for proper cleanup
  private eventHandlers: Record<string, Record<string, (...args: any[]) => void>> = {};
  
  // Debug mode flag
  private debug = true;

  /**
   * Register a map instance with the manager
   */
  registerMap(id: string, map: mapboxgl.Map): void {
    // Validate inputs
    if (!id) {
      console.error('[MapManager] Cannot register map with empty id');
      return;
    }
    
    if (!map) {
      console.error(`[MapManager] Cannot register map for id ${id}`);
      return;
    }
    
    // FOR DEBUGGING: Log total maps before registration
    const beforeCount = Object.keys(this.maps).length;
    this.debugLog(`[MapManager] Registering map ${id} (current map count: ${beforeCount})`);
    
    // If this is our first map, set as default
    if (Object.keys(this.maps).length === 0) {
      this.defaultMapId = id;
      this.debugLog(`[MapManager] Setting ${id} as default map`);
    }

    // Create registration if doesn't exist
    if (!this.maps[id]) {
      // Check if map is actually a mapbox-gl Map instance
      if (!(map instanceof mapboxgl.Map)) {
        console.warn(`[MapManager] Map ${id} doesn't appear to be a mapboxgl.Map instance. This may cause issues.`);
      }
      
      // Determine if map is already loaded
      let isLoaded = false;
      try {
        // Check internal _loaded property as a safe way to determine if map is loaded
        // This avoids TypeScript errors with the official API
        isLoaded = (map as any)._loaded === true;
      } catch (error) {
        console.error(`[MapManager] Error checking if map ${id} is loaded:`, error);
      }
      
      this.maps[id] = {
        id,
        map,
        isReady: isLoaded,
        createdAt: new Date(),
      };
      
      // Initialize callback arrays
      this.readyCallbacks[id] = this.readyCallbacks[id] || [];
      this.errorCallbacks[id] = this.errorCallbacks[id] || [];
      this.eventHandlers[id] = this.eventHandlers[id] || {};
      
      // FOR DEBUGGING: Log registered maps
      const afterCount = Object.keys(this.maps).length;
      const mapIds = Object.keys(this.maps).join(', ');
      this.debugLog(`[MapManager] Map ${id} registered, ready: ${this.maps[id].isReady} (map count: ${afterCount}, ids: ${mapIds})`);
      
      // If map is already loaded, fire ready callbacks
      if (isLoaded) {
        this.debugLog(`[MapManager] Map ${id} is already loaded, executing callbacks immediately`);
        this.executeReadyCallbacks(id);
      } else {
        // Otherwise, listen for load event
        const loadHandler = () => {
          this.debugLog(`[MapManager] Map ${id} loaded event fired`);
          this.maps[id].isReady = true;
          this.executeReadyCallbacks(id);
        };
        
        // Store reference to handler for cleanup
        this.eventHandlers[id]['load'] = loadHandler;
        
        // Safely add event listener
        try {
          map.on('load', loadHandler);
        } catch (error) {
          console.error(`[MapManager] Error adding load listener for map ${id}:`, error);
        }
        
        // Listen for error events
        const errorHandler = (e: any) => {
          const error = new Error(`Map error: ${e.error?.message || JSON.stringify(e)}`);
          console.error(`[MapManager] Error event from map ${id}:`, error);
          this.executeErrorCallbacks(id, error);
        };
        
        // Store reference to handler for cleanup
        this.eventHandlers[id]['error'] = errorHandler;
        
        // Safely add error listener
        try {
          map.on('error', errorHandler);
        } catch (error) {
          console.error(`[MapManager] Error adding error listener for map ${id}:`, error);
        }
        
        // Safety timeout - consider map ready after timeout even if event never fires
        setTimeout(() => {
          if (this.maps[id] && !this.maps[id].isReady) {
            console.warn(`[MapManager] Map ${id} load event never fired after 5s, forcing ready state`);
            this.maps[id].isReady = true;
            this.executeReadyCallbacks(id);
          }
        }, 5000);
      }
    } else {
      console.warn(`[MapManager] Map ${id} already registered`);
    }
  }
  
  /**
   * Unregister a map instance
   */
  unregisterMap(id: string): void {
    // FOR DEBUGGING: Log total maps before unregistration
    const beforeCount = Object.keys(this.maps).length;
    const beforeMapIds = Object.keys(this.maps).join(', ');
    this.debugLog(`[MapManager] Unregistering map ${id} (current map count: ${beforeCount}, ids: ${beforeMapIds})`);
    
    if (this.maps[id]) {
      // Clean up event listeners
      try {
        const map = this.maps[id].map;
        
        // Remove event listeners using stored references
        if (this.eventHandlers[id]) {
          Object.entries(this.eventHandlers[id]).forEach(([event, handler]) => {
            try {
              map.off(event, handler);
              this.debugLog(`[MapManager] Removed ${event} listener from map ${id}`);
            } catch (error) {
              console.error(`[MapManager] Error removing ${event} listener from map ${id}:`, error);
            }
          });
          
          delete this.eventHandlers[id];
        }
      } catch (error) {
        console.warn(`[MapManager] Error cleaning up map ${id}:`, error);
      }
      
      // Delete registration
      delete this.maps[id];
      delete this.readyCallbacks[id];
      delete this.errorCallbacks[id];
      
      // Update default map if needed
      if (this.defaultMapId === id) {
        this.defaultMapId = Object.keys(this.maps)[0] || null;
        if (this.defaultMapId) {
          this.debugLog(`[MapManager] Updated default map to ${this.defaultMapId}`);
        } else {
          this.debugLog(`[MapManager] No default map after unregistering ${id}`);
        }
      }
      
      // FOR DEBUGGING: Log remaining maps
      const afterCount = Object.keys(this.maps).length;
      const afterMapIds = Object.keys(this.maps).join(', ');
      this.debugLog(`[MapManager] Map ${id} unregistered (remaining map count: ${afterCount}, ids: ${afterMapIds})`);
    } else {
      console.warn(`[MapManager] Attempted to unregister unknown map ${id}`);
    }
  }
  
  /**
   * Get map status
   */
  getMapStatus(id?: string): MapStatus {
    const mapId = this.resolveMapId(id);
    if (!mapId || !this.maps[mapId]) {
      return MapStatus.INITIALIZING;
    }
    
    return this.maps[mapId].isReady ? MapStatus.READY : MapStatus.INITIALIZING;
  }
  
  /**
   * Check if map is ready
   */
  isMapReady(id?: string): boolean {
    const mapId = this.resolveMapId(id);
    return !!(mapId && this.maps[mapId]?.isReady);
  }
  
  /**
   * Get map instance (only if ready)
   */
  getMap(id?: string): mapboxgl.Map | null {
    const mapId = this.resolveMapId(id);
    if (!mapId) {
      this.debugLog(`[MapManager] getMap called with no valid mapId`);
      return null;
    }
    
    if (!this.maps[mapId]) {
      this.debugLog(`[MapManager] getMap: no map registered with id ${mapId}`);
      return null;
    }
    
    if (!this.maps[mapId].isReady) {
      this.debugLog(`[MapManager] getMap: map ${mapId} is not ready yet`);
      return null;
    }
    
    return this.maps[mapId].map;
  }
  
  /**
   * Wait for map to be ready, then execute callback
   */
  waitForMap(callback: MapReadyCallback, id?: string): () => void {
    const mapId = this.resolveMapId(id);
    
    if (!mapId) {
      console.warn('[MapManager] No map registered, cannot wait');
      return () => {};
    }
    
    this.debugLog(`[MapManager] waitForMap called for map ${mapId}`);
    
    // Create the registration structure if it doesn't exist yet
    if (!this.maps[mapId]) {
      this.debugLog(`[MapManager] waitForMap: map ${mapId} not registered yet, setting up callback only`);
      // Initialize callback arrays
      this.readyCallbacks[mapId] = this.readyCallbacks[mapId] || [];
      this.readyCallbacks[mapId].push(callback);
      
      return () => {
        if (this.readyCallbacks[mapId]) {
          this.readyCallbacks[mapId] = this.readyCallbacks[mapId].filter(cb => cb !== callback);
        }
      };
    }
    
    // If map is already ready, execute callback immediately
    if (this.maps[mapId].isReady) {
      this.debugLog(`[MapManager] Map ${mapId} already ready, executing callback immediately`);
      try {
        callback(this.maps[mapId].map);
      } catch (error) {
        console.error(`[MapManager] Error executing immediate callback:`, error);
      }
      return () => {};
    }
    
    // Otherwise, add callback to queue
    this.readyCallbacks[mapId] = this.readyCallbacks[mapId] || [];
    this.readyCallbacks[mapId].push(callback);
    
    this.debugLog(`[MapManager] Added callback to wait queue for map ${mapId}`);
    
    // Return cleanup function
    return () => {
      if (this.readyCallbacks[mapId]) {
        this.readyCallbacks[mapId] = this.readyCallbacks[mapId].filter(cb => cb !== callback);
      }
    };
  }
  
  /**
   * Register error callback
   */
  onMapError(callback: MapErrorCallback, id?: string): () => void {
    const mapId = this.resolveMapId(id);
    
    if (!mapId) {
      console.warn('[MapManager] No map registered, cannot register error callback');
      return () => {};
    }
    
    this.errorCallbacks[mapId] = this.errorCallbacks[mapId] || [];
    this.errorCallbacks[mapId].push(callback);
    
    // Return cleanup function
    return () => {
      if (this.errorCallbacks[mapId]) {
        this.errorCallbacks[mapId] = this.errorCallbacks[mapId].filter(cb => cb !== callback);
      }
    };
  }
  
  /**
   * Execute ready callbacks for a map
   */
  private executeReadyCallbacks(id: string): void {
    if (!this.readyCallbacks[id]?.length) {
      this.debugLog(`[MapManager] No ready callbacks to execute for map ${id}`);
      return;
    }
    
    this.debugLog(`[MapManager] Executing ${this.readyCallbacks[id].length} ready callbacks for map ${id}`);
    
    // Make a copy of callbacks before executing to avoid issues if callbacks modify the array
    const callbacks = [...this.readyCallbacks[id]];
    
    // Execute each callback with the map instance
    callbacks.forEach(callback => {
      try {
        callback(this.maps[id].map);
      } catch (error) {
        console.error(`[MapManager] Error executing ready callback:`, error);
      }
    });
    
    // Clear callbacks after execution
    this.readyCallbacks[id] = [];
  }
  
  /**
   * Execute error callbacks for a map
   */
  private executeErrorCallbacks(id: string, error: Error): void {
    if (!this.errorCallbacks[id]?.length) return;
    
    this.debugLog(`[MapManager] Executing ${this.errorCallbacks[id].length} error callbacks for map ${id}`);
    
    // Make a copy of callbacks before executing
    const callbacks = [...this.errorCallbacks[id]];
    
    // Execute each callback with the error
    callbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error(`[MapManager] Error executing error callback:`, callbackError);
      }
    });
  }
  
  /**
   * Resolve map ID (use default if not provided)
   */
  private resolveMapId(id?: string): string | null {
    if (id) return id;
    
    if (!this.defaultMapId) {
      this.debugLog('[MapManager] No default map ID available');
    }
    
    return this.defaultMapId;
  }
  
  /**
   * Debug log - only logs if debug mode is enabled
   */
  private debugLog(message: string): void {
    if (this.debug) {
      console.log(message);
    }
  }
  
  /**
   * Get current state for debugging
   */
  getDebugState(): any {
    return {
      mapCount: Object.keys(this.maps).length,
      mapIds: Object.keys(this.maps),
      defaultMapId: this.defaultMapId,
      maps: Object.entries(this.maps).map(([id, reg]) => ({
        id,
        isReady: reg.isReady,
        createdAt: reg.createdAt.toISOString(),
        pendingCallbacks: (this.readyCallbacks[id] || []).length
      }))
    };
  }
}

// Export singleton instance
export const mapManager = new MapManager();
export default mapManager; 