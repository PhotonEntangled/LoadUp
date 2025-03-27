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

## Next Steps

1. Test with simulated vehicles to verify all aspects of the integration work correctly
2. Add proper error handling for Mapbox API failures with graceful fallbacks
3. Improve styling and UI feedback during loading/error states
4. Implement further optimization for vehicle updates to reduce rerenders

## Technical Details

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

This ensures proper vehicle updates regardless of the store structure. 