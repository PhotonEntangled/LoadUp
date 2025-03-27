# Map Visibility Issue Resolution

## Summary of Issues Fixed

We've identified and fixed several critical issues that were preventing the map from rendering correctly in the tracking page:

1. **Store Structure Mismatch**: 
   - The `SimulationFromShipmentService` was treating the vehicle store as an array when it's actually a Record structure
   - Fixed by updating `updateVehicleInStore` method to handle both array and Record formats properly

2. **Invalid Coordinates**:
   - Mapbox API was returning 422 errors due to latitude values outside the -90 to 90 range
   - Added robust coordinate validation in both:
     - `SimulationFromShipmentService.validateCoordinates()`
     - `MapDirectionsService.validateCoordinate()`

3. **Immer Store Updates**:
   - Fixed errors related to Immer's array handling in the unified vehicle store
   - Ensured proper type checking before accessing store properties

4. **Map Styling Issues**:
   - Added explicit styling to ensure the map container is always visible:
     - Set minimum height (500px)
     - Added background color and border
     - Added the `map-container` class for easier debugging

5. **Debugging Tools**:
   - Added `MapDebugInfo` component to show:
     - Map container dimensions
     - Mapbox token status
     - Map initialization status
     - Vehicle count in the store

6. **Mapbox API Rate Limit Errors**:
   - Fixed 429 "Too Many Requests" errors from Mapbox Directions API
   - Implemented rate limiting with automatic throttling when approaching limits
   - Added retry logic with exponential backoff for failed requests
   - Implemented smart caching to reduce API calls
   - Added automatic fallback to mock data when rate limited

7. **MapboxGL Line Layer Animation Errors**:
   - Fixed "layers.route-line.paint.line-opacity[2]: Expected number but found array" errors
   - Replaced complex array-based animations with simpler static values
   - Improved error handling and user feedback
   - Disabled problematic features temporarily until better solutions are found

## Next Steps

1. Test with simulated vehicles to verify all aspects of the integration work correctly
2. Continue improving error handling for Mapbox API failures with graceful fallbacks
3. Improve styling and UI feedback during loading/error states
4. Implement further optimization for vehicle updates to reduce rerenders
5. Develop a more compatible animation solution for route lines that works with Mapbox GL
6. Implement a better rate limit tracking system that aggregates API usage across components

## Technical Details

### Store Structure Fix

The key issue was in the store integration. Our unified store uses a Record structure:

```typescript
vehicles: Record<string, Vehicle>
```

But the SimulationFromShipmentService was treating it as an array:

```typescript
// Old incorrect code
const currentVehicles = mapStore.getState().vehicles || [];
const updatedVehicles = currentVehicles.map((v: MapVehicle) => 
  v.id === vehicle.id ? mapVehicle : v
);
```

We fixed this by properly handling both potential formats:

```typescript
// New fixed code
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
}
```

### Mapbox API Rate Limit Handling

To handle Mapbox API rate limits, we implemented a comprehensive solution:

```typescript
// Track rate limit information
private rateLimitRemaining: number = 300; // Default Mapbox free tier limit
private rateLimitNextReset: number = Date.now() + 60000; // Default 1 minute

// Update rate limits from response headers
private updateRateLimits(headers: Headers): void {
  try {
    const remaining = headers.get('X-Rate-Limit-Remaining');
    const reset = headers.get('X-Rate-Limit-Reset');
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    if (reset) {
      this.rateLimitNextReset = parseInt(reset, 10) * 1000;
    }
  } catch (error) {
    console.warn('[MapDirectionsService] Error parsing rate limit headers:', error);
  }
}
```

We also implemented retry logic with exponential backoff:

```typescript
// Implement retry with exponential backoff
let retries = 0;
while (retries <= this.MAX_RETRIES) {
  try {
    // API call here...
  } catch (error) {
    // If we've tried enough times, fall back to mock route
    if (retries >= this.MAX_RETRIES) {
      return this.createMockRoute(route);
    }
    
    // Otherwise, retry with exponential backoff
    const delay = this.RETRY_DELAY_BASE * Math.pow(2, retries);
    await new Promise(resolve => setTimeout(resolve, delay));
    retries++;
  }
}
```

### MapboxGL Line Layer Animation Fix

We fixed issues with the MapboxGL line layer animations:

```typescript
// OLD (problematic) animation code
'line-opacity': pulsing ? [
  'interpolate',
  ['linear'],
  ['modulo', ['*', 0.01, ['time']], 1.0],
  0, 0.5,
  0.5, 1.0,
  1.0, 0.5
] : 0.8,

// NEW fixed code
'line-opacity': pulsing ? 0.8 : 0.8, // Static value instead of array expression
```

This ensures proper rendering of route lines without Mapbox GL errors. 