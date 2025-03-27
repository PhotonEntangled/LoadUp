# 🗺️ React-Map-GL Migration Plan

## 🎯 Project Goals

- Migrate from direct Mapbox GL JS manipulation to react-map-gl
- Fix marker visibility issues and rendering loops
- Simplify the codebase for better maintainability
- Maintain compatibility with existing services and utilities
- Implement proper memoization to prevent infinite render loops

## 🚧 Current Issues

1. **Marker Visibility Problems**: Direct DOM manipulation causes CSS conflicts
2. **Infinite Render Loops**: Improper integration with React lifecycle
3. **Complex Implementation**: Hard to maintain and debug
4. **Poor Error Handling**: Difficult to diagnose and fix issues
5. **No Separation of Concerns**: Map, markers, and routes tightly coupled

## 🏗️ Migration Strategy

We'll implement a phased approach to migrate to react-map-gl, focusing on one component at a time with careful testing at each step.

## 📅 Phase 1: Setup & Type Definitions ✅

- [x] Create/update type definitions for react-map-gl
- [x] Fix linter errors for proper type support
- [x] Ensure proper integration with existing MapManager
- [x] Test basic map rendering with react-map-gl

## 📅 Phase 2: Core Map Component ✅

- [x] Complete SimulatedVehicleMap implementation
- [x] Implement proper lifecycle management
- [x] Add error handling and fallbacks
- [x] Test basic map functionality (zoom, pan, etc.)
- [x] Ensure MapManager integration works correctly

## 📅 Phase 3: Vehicle Markers ⏳

- [x] Complete VehicleMarkerLayer implementation
- [x] Implement proper memoization to prevent render loops
- [ ] Handle vehicle selection and hover events
- [ ] Test marker rendering and interaction
- [ ] Optimize performance for large numbers of markers

## 📅 Phase 4: Route Visualization

- [x] Migrate MapRouteLayer to use react-map-gl components
- [x] Implement GeoJSON-based route lines
- [ ] Add proper styling and animation
- [ ] Test route rendering with different vehicle states
- [ ] Optimize for multiple concurrent routes

## 📅 Phase 5: Integration & Testing

- [ ] Integrate all components together
- [ ] Test with real vehicle data
- [ ] Fix any remaining issues
- [ ] Implement performance optimizations
- [ ] Document the new architecture

## 📅 Phase 6: Documentation & Cleanup

- [ ] Update documentation to reflect new architecture
- [ ] Remove deprecated code and components
- [ ] Create examples and usage guides
- [ ] Train team on new implementation
- [ ] Plan for future enhancements

## 📋 Implementation Details

### 🧩 Component Structure

1. **SimulatedVehicleMap**
   - Main container component
   - Initializes react-map-gl Map
   - Handles lifecycle management
   - Integrates with MapManager

2. **VehicleMarkerLayer**
   - Renders markers for vehicles
   - Implements proper memoization
   - Handles selection and hover events

3. **MapRouteLayer**
   - Renders routes for vehicles
   - Uses GeoJSON for route lines
   - Handles styling and animation

### 🔄 Data Flow

```
SimulatedVehicleMap
      ↓
VehicleMarkerLayer + MapRouteLayer
      ↓
useUnifiedVehicleStore
      ↓
MapManager (for compatibility)
```

### 🛠️ Tools & Libraries

- **react-map-gl**: Main mapping library that wraps Mapbox GL JS
- **mapbox-gl**: Base mapping library (used by react-map-gl)
- **zustand**: For state management
- **React.memo**: For component memoization
- **useCallback/useMemo**: For function and value memoization

## 🔄 Next Logical Step

Our next step is to complete Phase 3 by implementing and testing the vehicle selection and hover events in the VehicleMarkerLayer component. After that, we need to test marker rendering with different vehicle states and verify the optimizations work well with large numbers of vehicles. 