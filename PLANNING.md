# 🗺️ LoadUp Map Component Architecture

## 📊 Current Map Implementation Status

The map implementation is currently experiencing two main issues:
1. **Duplicate map rendering** - Two map instances appear to be created
2. **Marker visibility issues** - Vehicles aren't appearing as markers on the map
3. **"Create and animate vehicle" button not working** - Likely related to marker creation issues

## 🔄 Map Initialization & Marker Creation Flow

### Core Map Initialization Flow:
```
SimulatedVehicleMap
  ↓ Creates mapboxgl.Map instance
  ↓ Registers with MapManager
  ↓ Renders child MapMarkerLayer
        ↓ Waits for map from MapManager
        ↓ Creates markers for vehicles
```

### Marker Creation Flow:
```
useUnifiedVehicleStore (stores vehicle data)
  ↓ 
MapMarkerLayer (receives vehicles as props)
  ↓
VehicleMarker component (creates markers for each vehicle)
  OR
vehicleMarkerUtils.createVehicleMarkerElement (direct DOM creation)
  ↓
mapboxgl.Marker (adds marker to map)
```

## 📁 Critical Files for Map & Marker Implementation

### 🧩 Map Initialization
- `src/components/map/SimulatedVehicleMap.tsx` - Primary map container component
- `src/utils/maps/MapManager.ts` - Singleton for managing map instances
- `src/utils/mapbox-token.ts` - Handles Mapbox token retrieval

### 🚩 Marker Creation
- `src/components/map/MapMarkerLayer.tsx` - Renders markers based on vehicle data
- `src/utils/map/vehicleMarkerUtils.ts` - Utilities for creating marker DOM elements
- `src/store/useUnifiedVehicleStore.ts` - Central store for vehicle data
- `src/services/VehicleTrackingService.ts` - Manages vehicle data synchronization

### 🚗 Vehicle Simulation
- `src/services/shipment/SimulationFromShipmentService.ts` - Converts shipments to vehicles
- `src/services/shipment/ShipmentVehicleSimulator.ts` - Controls vehicle animation
- `src/components/SimulationDemo.tsx` - UI for triggering vehicle simulation

## 🐛 Identified Issues

### Duplicate Map Issue
- **Root cause**: Multiple map initialization or container duplication
- **Affected files**: 
  - `SimulatedVehicleMap.tsx` - Uses dynamic useRef for map ID
  - `MapManager.ts` - May be registering multiple map instances

### Marker Visibility Issues
- **Root cause**: Inconsistent marker creation methodologies or CSS visibility issues
- **Affected files**:
  - `MapMarkerLayer.tsx` - Contains internal VehicleMarker component
  - `SimulatedVehicleMap.tsx` - Creates direct debug marker in load event
  - CSS styling conflicts or visibility issues

### Vehicle Creation Button Issues
- **Root cause**: Connection between UI components and simulation services
- **Affected files**:
  - `SimulationDemo.tsx` - Contains animation controls
  - `SimulationFromShipmentService.ts` - Handles vehicle creation and animation

## 🔧 DOM Manipulation for Markers

Regarding the question about DOM manipulation for markers:

While direct DOM manipulation isn't generally a React best practice, **Mapbox GL JS requires direct DOM manipulation for markers**. This is because Mapbox GL JS has its own rendering system separate from React's virtual DOM.

**Best practices for Mapbox markers in React:**
1. Create marker elements using utility functions (like `createVehicleMarkerElement`)
2. Use mapboxgl.Marker API to add them directly to the map
3. Maintain references to markers to update or remove them
4. Synchronize with React state but accept that marker rendering happens outside React's control

The current implementation in `MapMarkerLayer.tsx` follows this pattern by:
- Waiting for the map to be ready via MapManager
- Creating React components that internally handle the DOM manipulation
- Using refs to track marker instances for cleanup

## 📈 Next Steps for Integration

1. ~~Fix the duplicate map issue first~~ *(Resolved)*
2. ~~Ensure marker creation works consistently~~ *(Resolved for base vehicle, DirectionsLayer markers also working)*
3. ~~Create a separate `MapDirectionsLayer` component~~ *(Implemented and working)*
4. ~~Have the directions layer subscribe to the same map instance via MapManager~~ *(Working)*
5. **Fix route accuracy:** Update `MapDirectionsService.ts` to request `overview: 'full'` for better road following. *(Implemented)*
6. **Investigate UI Update:** The "Active Vehicles" list doesn't update when a simulated shipment vehicle is added.
7. **Investigate Vehicle Movement:** Check if animation logic exists and why the vehicle isn't moving along the route.
8. **Prepare Pull Request:** Stage, commit, and push current progress.

This approach maintains separation of concerns while leveraging the existing architecture.

## 🧩 Recently Added/Modified Key Files

- `src/components/map/MapDirectionsLayer.tsx`: Renders the route line and start/end markers for a specific vehicle. Receives `routeData` and interacts with `MapDirectionsService`. Uses styles from `MapDirectionsLayer.module.css`.
- `src/components/map/MapDirectionsLayer.module.css`: Contains CSS styles specifically for the start and end markers used by `MapDirectionsLayer.tsx`.
- `src/services/maps/MapDirectionsService.ts`: Handles fetching route data from Mapbox Directions API. Updated to request `overview: 'full'` for better route geometry accuracy. 