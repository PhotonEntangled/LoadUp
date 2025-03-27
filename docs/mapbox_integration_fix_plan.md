# Mapbox Integration Fix Plan

## Current Issues

After analyzing the console errors and implementation patterns, we've identified several key issues with our current Mapbox integration:

1. **Ineffective Rate Limiting**
   - Each component instance implements its own rate limiting
   - Multiple instances make parallel requests, quickly hitting API limits
   - Using custom fetch implementation instead of official Mapbox SDKs

2. **React Component Update Loops**
   - MapDirectionsLayer triggers excessive API calls on prop changes
   - "Maximum update depth exceeded" errors indicating infinite update cycles
   - State updates causing cascading component re-renders

3. **Store Integration Problems**
   - Inconsistent access of vehicle store (array vs. Record structure)
   - Type mismatches causing runtime errors

## Industry Standard Solution

### 1. Use Official Mapbox SDKs

The Mapbox documentation recommends using their official SDKs which provide built-in:
- Rate limiting
- Retry logic
- Request batching
- Caching

```typescript
// Replace our custom MapDirectionsService with official SDK
import { DirectionsService } from '@mapbox/mapbox-sdk/services/directions';

const directionsClient = new DirectionsService({ accessToken: mapboxToken });
```

### 2. Implement Request Batching and Queue

```typescript
// Centralized request manager
class MapboxRequestManager {
  private queue: Array<{ request: any, resolve: Function, reject: Function }> = [];
  private processing = false;
  private rateLimitRemaining = 300;
  private resetTime = Date.now() + 60000;
  
  // Add request to queue
  public enqueue(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.processQueue();
    });
  }
  
  // Process queue with rate limiting
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    // Check rate limits
    if (this.rateLimitRemaining <= 5) {
      const now = Date.now();
      if (now < this.resetTime) {
        console.log(`Rate limit reached, pausing requests for ${Math.ceil((this.resetTime - now)/1000)}s`);
        setTimeout(() => {
          this.processing = false;
          this.processQueue();
        }, this.resetTime - now);
        return;
      }
      this.rateLimitRemaining = 300;
    }
    
    // Process next request
    const { request, resolve, reject } = this.queue.shift()!;
    
    try {
      const response = await request();
      
      // Update rate limit info from headers
      if (response.headers) {
        const remaining = response.headers.get('X-Rate-Limit-Remaining');
        const reset = response.headers.get('X-Rate-Limit-Reset');
        
        if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
        if (reset) this.resetTime = parseInt(reset, 10) * 1000;
      }
      
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      setTimeout(() => this.processQueue(), 200); // Add small delay between requests
    }
  }
}

export const mapboxRequestManager = new MapboxRequestManager();
```

### 3. Move Data Fetching Out of Component Lifecycle

Use React Query or a similar data fetching library to manage API requests outside of the component lifecycle:

```typescript
// Using React Query for data fetching
import { useQuery } from 'react-query';

function useMapboxDirections(origin, destination, options = {}) {
  return useQuery(
    ['directions', origin, destination, options],
    () => directionsClient.getDirections({
      points: [origin, destination],
      profile: options.profile || 'driving',
      geometries: 'geojson'
    }),
    { 
      // Cache results for 1 hour
      staleTime: 60 * 60 * 1000,
      // Retry failed requests
      retry: 3,
      // Use our request manager for rate limiting
      queryFn: (key) => mapboxRequestManager.enqueue(() => /* API call */)
    }
  );
}
```

### 4. Refactor Components to Prevent Update Loops

```typescript
// Refactored MapDirectionsLayer
const MapDirectionsLayer = React.memo(({ origin, destination, ...props }) => {
  // Use proper key for query to prevent unnecessary refetches
  const queryKey = useMemo(() => 
    JSON.stringify({ origin, destination, ...props }),
    [origin, destination, props.profile]
  );
  
  // Use custom hook that handles data fetching
  const { data, isLoading, error } = useMapboxDirections(origin, destination, props);
  
  // Return null during loading or on error
  if (isLoading) return null;
  if (error) return null;
  
  // Properly memoize route elements to prevent recreation
  const routeElements = useMemo(() => {
    if (!data) return null;
    return (
      <Source id="directions-source" type="geojson" data={data.geoJson}>
        <Layer {...layerProps} />
      </Source>
    );
  }, [data]);
  
  return routeElements;
});
```

### 5. Fix Store Integration

```typescript
// Fix store access to properly handle Record structure
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
```

## Implementation Plan

1. **Phase 1: Stop the bleeding**
   - Fix immediate store structure integration issues
   - Implement central request queue for rate limiting
   - Add proper error boundaries to prevent component crashes

2. **Phase 2: Modernize the architecture**
   - Integrate official Mapbox SDKs
   - Implement React Query for data fetching
   - Move API logic to dedicated services

3. **Phase 3: Optimize and stabilize**
   - Add comprehensive caching
   - Implement request batching and deduplication
   - Add monitoring for API usage

## Benefits of this Approach

1. **Reliability**: Proper rate limiting prevents API errors
2. **Performance**: Caching and batching reduce API calls
3. **Maintainability**: Using standard libraries reduces custom code
4. **Scalability**: Architecture supports increasing route complexity 