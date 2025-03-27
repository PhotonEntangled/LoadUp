# 🗺️ Map Marker Visibility Fix

## Problem Overview
We encountered persistent issues with map markers not appearing after page refresh in our Mapbox implementation. Specifically:

1. Markers would fail to appear after a page refresh despite vehicle data being properly loaded
2. Manual page refresh was required to make markers visible again
3. The map container and markers had CSS visibility issues
4. Initialization flags were not resetting properly between refreshes
5. CSS Module syntax errors prevented global styles from being applied correctly

## Root Causes Identified

After thorough analysis, we identified several root causes:

1. **Overly Complex Approach**: Our current implementation uses direct Mapbox GL JS manipulation, which requires extensive manual DOM management
2. **Global Initialization Flag Issue**: The `IS_MAP_INITIALIZED` flag in `SimulatedVehicleMap.tsx` was not resetting on page refresh
3. **CSS Visibility Conflicts**: Multiple components were injecting CSS with conflicting z-index and overflow properties
4. **Race Condition in Map Registration**: Map registration with `MapManager` sometimes occurred before the map was fully initialized
5. **Insufficient Cleanup on Unmount**: The map and markers weren't properly cleaned up when components unmounted
6. **Marker Creation Timing**: Markers were being created before the map was ready, without proper retry mechanisms
7. **CSS Module Syntax Errors**: Incorrect usage of `:global()` syntax in CSS Modules causing style application failures
8. **Framework-Specific CSS Limitations**: Next.js CSS Modules have specific limitations for global styles that required a different approach

## Current Approach vs. Recommended Approach

### Current Approach (Complex)

Currently, we're using direct Mapbox GL JS manipulation:

```tsx
// Creating a map instance
const newMap = new mapboxgl.Map({
  container: mapContainerRef.current,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: defaultCenter,
  zoom: defaultZoom,
  // ...other options
});

// Marker creation involves complex DOM manipulation
const el = document.createElement('div');
el.className = 'marker';
el.style.backgroundColor = '#FF0000';
// ...many more style properties

// Create and add marker
const marker = new mapboxgl.Marker({
  element: el,
})
  .setLngLat([longitude, latitude])
  .addTo(map);
```

This approach requires:
- Manual DOM element creation and styling
- Custom marker lifecycle management
- Complex CSS fixes for visibility issues
- Global state tracking for map instances

### Recommended Approach (Simpler)

Our project already has `react-map-gl` installed, which offers a much simpler React-based approach:

```tsx
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const VehicleMap = ({ vehicles }) => {
  return (
    <Map
      initialViewState={{
        longitude: -95.7129,
        latitude: 37.0902,
        zoom: 4
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <NavigationControl position="top-right" />
      
      {vehicles.map(vehicle => (
        <Marker
          key={vehicle.id}
          longitude={vehicle.location.longitude}
          latitude={vehicle.location.latitude}
          onClick={() => handleVehicleClick(vehicle)}
        >
          <div className="marker">{vehicle.emoji || '🚚'}</div>
        </Marker>
      ))}
    </Map>
  );
};
```

Benefits of this approach:
- Declarative React components for Map and Markers
- Automatic lifecycle management
- No need for manual DOM manipulation
- Proper handling of component mounting/unmounting
- No CSS visibility issues to fix
- No need for complex MapManager or initialization tracking

## Looking at Our Own Code

We already have examples of `react-map-gl` in our codebase:

1. **In the deprecated archive**:
   - `RouteMapComponent.tsx`, `MarkerMapComponent.tsx`, etc.

2. **Currently in the project**:
   - `apps/admin-dashboard/components/map/BasicMapComponent.tsx`
   - `src/components/map/RouteLayer.tsx`

These components are much simpler, declarative, and don't suffer from the marker visibility issues we're currently facing.

## Implemented Solutions

### 1. Map Initialization Improvements

- **Local Initialization Tracking**: Replaced global `IS_MAP_INITIALIZED` with local component refs in `SimulatedVehicleMap.tsx`
- **Proper Cleanup Handling**: Added cleanup tracking to prevent double cleanup and ensure map is unregistered properly
- **Diagnostic Utilities**: Created utility functions to check map element status and fix container issues

### 2. CSS Visibility Fixes

- **Separated Global CSS**: Moved all global Mapbox styles to a dedicated global CSS file instead of using CSS Modules
- **Centralized CSS Injection**: Reduced runtime CSS injection to only dynamic styles that need component-specific values
- **Critical CSS Properties**: Applied essential styles to ensure markers are visible:
  - `overflow: visible` on map container
  - Proper z-index layering for markers, popups, and controls
  - Explicit visibility, display, and opacity settings
- **CSS Module Compatibility**: Ensured compliance with Next.js CSS module requirements

### 3. Marker Creation Enhancements

- **Improved Retry Logic**: Implemented progressive retry for marker creation with better error handling
- **Direct Marker Fallback**: Added emergency direct marker creation using native Mapbox API when React components fail
- **Visibility Verification**: Added post-creation checks to verify markers are actually visible in the DOM
- **Forced Visibility Fixes**: Applied extreme measures to ensure markers remain visible

### 4. Debugging Utilities

- **MapboxMarkerDebug.ts**: Created a dedicated utility for diagnosing and fixing marker visibility issues
- **markerVisibilityTest.ts**: Added a test utility to run on page load and fix issues after refresh
- **Global Debug Console**: Exposed debugging functions to the browser console for manual testing

## CSS Considerations for Next.js

When working with CSS Modules in Next.js and third-party libraries like Mapbox, special considerations are needed:

### Correct Approach for Global Styles in Next.js

Next.js has specific requirements for CSS Modules and global styles. The recommended approach is:

1. **Create a separate global CSS file** for third-party library styles:
   ```css
   /* src/styles/mapbox-globals.css */
   .mapboxgl-marker {
     animation: markerPop 0.3s ease-out forwards;
     visibility: visible !important;
   }
   ```

2. **Import the global CSS file** directly in your component:
   ```jsx
   import 'mapbox-gl/dist/mapbox-gl.css';
   import '../../styles/mapbox-globals.css';
   ```

3. **Keep component-specific styles** in CSS Modules:
   ```css
   /* Component.module.css */
   .mapContainer {
     position: relative;
   }
   ```

### Incorrect Approaches (Avoid)

1. **Don't use `:global()` selector in CSS Modules**:
   ```css
   /* This causes errors in Next.js CSS Modules */
   :global(.mapboxgl-marker) {
     /* styles */
   }
   ```

2. **Don't use `:global {}` block in CSS Modules**:
   ```css
   /* This also causes errors in Next.js CSS Modules */
   :global {
     .mapboxgl-marker {
       /* styles */
     }
   }
   ```

### When to Use Runtime CSS Injection

Use runtime CSS injection (via JavaScript) only for:
- Dynamic styles that depend on runtime values
- Debugging styles that are toggled on/off
- Emergency fixes when CSS files can't be modified

## How to Test the Fix

1. **Normal Operation**:
   - Launch the application with `npm run dev`
   - Navigate to the tracking page
   - Confirm markers appear on the map without manual refresh

2. **Force Refresh Test**:
   - With the tracking page open, press F5 to refresh
   - Verify markers appear automatically without further action

3. **Manual Debug** (if needed):
   - Open browser console
   - Type `window.__MAP_DEBUG__.runDiagnostics()` to check map state
   - Type `window.__MAP_DEBUG__.recreateMarkers()` to force marker recreation

4. **CSS Style Verification**:
   - Inspect markers with browser developer tools
   - Verify CSS styles are being applied correctly
   - Check that animations are working as expected

## Implementation Files

The fix spans multiple files:

1. **SimulatedVehicleMap.tsx**: Fixed initialization and cleanup, imports global CSS
2. **MapMarkerLayer.tsx**: Enhanced marker creation and visibility checks
3. **MapboxMarker.tsx**: Improved component with better retry logic and visibility forcing
4. **constants.ts**: Reduced CSS injection to only dynamic styles
5. **MapboxMarkerDebug.ts**: Diagnostic and emergency utilities
6. **markerVisibilityTest.ts**: Page refresh handler and testing utilities
7. **SimulatedVehicleMap.module.css**: Removed global styles to comply with CSS Module requirements
8. **mapbox-globals.css**: New global CSS file for all Mapbox-related styles

## About Mapbox GL JS

### What is Mapbox GL JS?

Mapbox GL JS is a JavaScript library that uses WebGL to render interactive maps from vector tiles and Mapbox styles. It's part of the Mapbox ecosystem and is designed for high-performance, customizable map rendering in web applications.

Key features:
- Uses WebGL for hardware-accelerated rendering
- Supports vector tiles for smoother zooming and rotation
- Highly customizable styling
- Supports 3D terrain and buildings
- Real-time data visualization capabilities

### Our Current Implementation

In our application, we're using the native Mapbox GL JS library (v2.x) directly, rather than using a React wrapper. This gives us maximum control but requires careful management of the map lifecycle within React components. Our implementation:

1. Creates map instances in `SimulatedVehicleMap.tsx`
2. Manages these instances through a `MapManager` utility
3. Creates markers through both React components (`MapboxMarker.tsx`) and direct Mapbox API calls

### Mapbox Best Practices (from Documentation)

According to the Mapbox documentation, here are the best practices for marker implementation:

1. **Marker Creation**: Create markers after the map's `load` event has fired
   ```javascript
   map.on('load', () => {
     new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
   });
   ```

2. **Custom Marker Styling**: For performance with many markers, use custom HTML elements
   ```javascript
   const el = document.createElement('div');
   el.className = 'marker';
   new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map);
   ```

3. **Marker Animations**: Use CSS transitions and animations for smooth marker appearance
   ```css
   .marker {
     animation: pop-in 0.3s ease-out forwards;
   }
   
   @keyframes pop-in {
     0% { opacity: 0; transform: scale(0); }
     100% { opacity: 1; transform: scale(1); }
   }
   ```

4. **Overflow Setting**: Ensure map containers have `overflow: visible` to prevent marker clipping
   ```css
   .mapboxgl-map {
     overflow: visible !important;
   }
   ```

5. **Marker Clustering**: For large datasets, use clustering to improve performance

### React Mapbox Alternatives

For React applications, there are several popular alternatives to our current approach:

1. **react-map-gl**: An official Uber-maintained React wrapper for Mapbox GL JS
   - Provides React components for maps, markers, popups, etc.
   - Handles React lifecycle integration
   - Easier prop-based updates
   - **Already installed in our project** - we should use this instead of raw mapboxgl

2. **react-mapbox-gl**: A community-maintained React wrapper for Mapbox GL JS
   - Similar to react-map-gl but with different API design
   - Component-based approach to map elements

3. **MapLibre GL JS**: An open-source fork of Mapbox GL JS
   - Free alternative that doesn't require Mapbox tokens
   - Compatible API but may lag behind in features

## Future Recommendations

1. **Switch to react-map-gl**: Replace our current custom implementation with the simpler react-map-gl API that's already in our project
2. **Layer Separation**: Continue separating map initialization from marker/route rendering
3. **Add Animation**: Implement marker animations using CSS keyframes as shown in Mapbox examples
4. **Clustering**: Consider marker clustering for large vehicle fleets
5. **Unit Tests**: Add specific tests for map initialization and marker visibility
6. **Documentation**: Keep this document updated with any new fixes or changes
7. **Consistent Styling Approach**: Use global CSS files for third-party library styling in Next.js
8. **Framework-Specific Best Practices**: Follow Next.js recommendations for CSS organization

## Technical Notes

- Direct DOM manipulation is still necessary for Mapbox markers - this is expected and appropriate
- Debug mode can be enabled by setting `debug={true}` on marker components or by using `injectMapboxCSS(true)`
- The fix is compatible with both development and production environments
- All changes maintain backward compatibility with existing code
- Framework-specific CSS approaches are essential - what works in one framework may not work in another

## TypeScript Notes

Several TypeScript errors were fixed during implementation:
1. Fixed incorrect imports from `constants.ts`
2. Added proper type assertions for Mapbox methods that aren't in the TypeScript definitions
3. Fixed parameter ordering in utility functions
4. Ensured proper conversion between `LngLat` objects and `[number, number]` tuples

While our current fixes address the immediate issues, a more sustainable approach would be to migrate to `react-map-gl`, which we already have in the project. This would eliminate many of the complexities and provide a more robust, React-friendly interface for working with maps and markers. 