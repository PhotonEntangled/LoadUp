# Mapbox Integration Fix Plan

## Current Issues

After analyzing the console errors and implementation patterns, we've identified several key issues with our current Mapbox integration:

1. **Duplicate API Requests**
   - Multiple components requesting the same routes simultaneously
   - Missing effective debounce mechanism for identical requests
   - Lack of request memoization/caching for repeated routes

2. **React Component Update Loops**
   - MapDirectionsLayer triggers excessive API calls on prop changes
   - "Maximum update depth exceeded" errors indicating infinite update cycles
   - State updates causing cascading component re-renders

3. **Store Integration Problems**
   - Inconsistent access of vehicle store (some code using array methods on Record structure)
   - For backward compatibility, we need to support both Array and Record formats

## Simplified High-Leverage Solutions

### 1. Fix Store Data Access Pattern

```typescript
// Helper to access vehicle store consistently, supporting both formats
function getVehicleFromStore(store, vehicleId) {
  const vehicles = store.getState().vehicles;
  
  // Handle both Record and Array formats
  if (Array.isArray(vehicles)) {
    return vehicles.find(v => v.id === vehicleId) || null;
  }
  
  // Handle Record/Object format
  if (vehicles && typeof vehicles === 'object') {
    return vehicles[vehicleId] || null;
  }
  
  return null;
}

// Helper to update vehicle in store
function updateVehicleInStore(store, vehicle) {
  const currentVehicles = store.getState().vehicles;
  
  // Handle array format
  if (Array.isArray(currentVehicles)) {
    const updatedVehicles = currentVehicles.filter(v => v.id !== vehicle.id);
    updatedVehicles.push(vehicle);
    store.setState({ vehicles: updatedVehicles });
    return;
  }
  
  // Handle Record format
  if (currentVehicles && typeof currentVehicles === 'object') {
    store.setState({
      vehicles: {
        ...currentVehicles,
        [vehicle.id]: vehicle
      }
    });
    return;
  }
  
  // Initialize if empty
  if (!currentVehicles) {
    store.setState({
      vehicles: { [vehicle.id]: vehicle }
    });
  }
}
```

### 2. Implement Request Memoization

```typescript
// Add memoization to MapDirectionsService
class MapDirectionsService {
  private memoCache = new Map<string, {
    timestamp: number,
    data: RouteInfo,
    expires: number
  }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  
  // Create cache key from request parameters
  private createCacheKey(origin, destination, options): string {
    return JSON.stringify({
      origin,
      destination,
      options
    });
  }
  
  // Get directions with memoization
  async getDirections(route, options = {}): Promise<RouteInfo> {
    const cacheKey = this.createCacheKey(route.origin, route.destination, options);
    
    // Check cache first
    const cached = this.memoCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && now < cached.expires) {
      console.log('[MapDirectionsService] Using cached route data');
      return cached.data;
    }
    
    // If not in cache or expired, fetch from API
    const result = await this.fetchDirectionsFromAPI(route, options);
    
    // Cache the result
    this.memoCache.set(cacheKey, {
      timestamp: now,
      data: result,
      expires: now + this.cacheDuration
    });
    
    return result;
  }
}
```

### 3. Add True Debounce Mechanism

```typescript
// Add proper debounce to MapDirectionsLayer
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl';
import { debounce } from 'lodash'; // Use standard debounce utility

const MapDirectionsLayer = ({ origin, destination, waypoints = [], ...props }) => {
  // State for route data
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create a stable cache key for this route request
  const routeKey = useMemo(() => {
    return JSON.stringify({ origin, destination, waypoints });
  }, [origin, destination, waypoints]);
  
  // Create a debounced fetch function that only triggers once per key change
  const debouncedFetchRoute = useCallback(
    debounce(async (routeKey) => {
      if (!origin || !destination) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Parse the route key
        const { origin: parsedOrigin, destination: parsedDestination, waypoints: parsedWaypoints } = 
          JSON.parse(routeKey);
        
        // Get route data
        const routeData = await mapDirectionsService.getDirections({
          origin: parsedOrigin,
          destination: parsedDestination,
          waypoints: parsedWaypoints
        }, props);
        
        setRoute(routeData);
        if (props.onRouteLoaded) {
          props.onRouteLoaded(routeData);
        }
      } catch (err) {
        console.error('[MapDirectionsLayer] Error loading route:', err);
        setError(err);
        if (props.onRouteError) {
          props.onRouteError(err);
        }
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms debounce
    [] // Stable reference
  );
  
  // Trigger the debounced function when route key changes
  useEffect(() => {
    debouncedFetchRoute(routeKey);
    
    // Clean up
    return () => {
      debouncedFetchRoute.cancel();
    };
  }, [routeKey, debouncedFetchRoute]);
  
  // Render logic remains the same...
};
```

### 4. Simplify API Error Handling

```typescript
// Better error handling for Mapbox API
async fetchDirectionsFromAPI(route, options) {
  // Track API calls for rate limiting awareness
  const now = Date.now();
  this.lastRequestTime = now;
  
  try {
    // Build the request URL & fetch data
    const response = await fetch(url);
    
    // Track rate limit info
    if (response.headers) {
      const remaining = response.headers.get('X-Rate-Limit-Remaining');
      if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    // Handle common error cases
    if (response.status === 429) {
      console.warn('[MapDirectionsService] Rate limit exceeded, using fallback');
      return this.createFallbackRoute(route);
    }
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.processMapboxResponse(data, route);
  } catch (error) {
    console.error('[MapDirectionsService] API error:', error);
    // Return fallback/mock route on any error
    return this.createFallbackRoute(route);
  }
}
```

## Implementation Priority

1. **Phase 1: Immediate Fixes** (Highest Priority)
   - Fix store access pattern to handle both Array and Record formats
   - Add basic memoization to prevent duplicate requests
   - Fix component update loops to prevent infinite rendering

2. **Phase 2: Optimization**
   - Implement proper debounce mechanism
   - Add more sophisticated request caching
   - Improve error handling with better fallbacks

3. **Phase 3: Long-term Improvements**
   - Consider adopting Mapbox SDK if complexity increases
   - Add monitoring for API usage tracking
   - Optimize batch requests for multiple routes

## Benefits of This Approach

1. **Simplicity**: Focus on standard techniques without architectural changes
2. **Performance**: Dramatically reduce API calls through memoization and debounce
3. **Compatibility**: Support both Array and Record formats for backward compatibility
4. **Maintainability**: Use standard libraries like lodash for debouncing 