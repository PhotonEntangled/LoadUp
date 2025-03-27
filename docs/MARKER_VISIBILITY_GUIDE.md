# 🗺️ Mapbox Marker Visibility Guide

## 🚩 Current Issue Overview

The map and data flow architecture is working correctly, but marker visibility has been challenging. This guide will help you understand the CSS fixes we've implemented to solve these issues when you integrate the Mapbox Directions API.

## ✅ Current Solutions

We've implemented a centralized CSS management system to ensure consistent marker rendering:

1. **Constants File (`constants.ts`)** - Central location for all map-related constants including:
   - Map container IDs
   - Z-index values
   - CSS style blocks
   - Default marker styling
   - Utility functions for CSS injection

2. **CSS Injection Utility** - Use `injectMapboxCSS(debug)` to add critical CSS fixes:
   - Pass `true` for `debug` parameter during development to make markers extremely visible
   - This will add bright magenta markers with white borders for easy debugging

3. **Coordinated IDs** - All CSS styles use consistent ID patterns:
   - `MAP_STYLES_ID` - Base map container fixes
   - `MARKER_STYLES_ID` - Marker visibility fixes
   - `DEBUG_STYLES_ID` - Debug styling for development

## 🔄 When Implementing Directions API

When adding the Directions API, follow these steps to maintain marker visibility:

1. **Create a MapDirectionsLayer Component**:
   ```tsx
   <MapDirectionsLayer 
     mapId={VEHICLE_MAP_ID} 
     vehicles={vehicles} 
   />
   ```

2. **Apply CSS Fixes Early**:
   ```tsx
   useEffect(() => {
     if (!map) return;
     injectMapboxCSS(true); // Enable debug during development
   }, [map]);
   ```

3. **Z-Index Management**:
   - Use z-index values from the constants file
   - Route lines should be below markers: `Z_INDEX.MARKERS_BASE - 10`
   - Direction waypoints should use: `Z_INDEX.MARKERS_BASE`

4. **Debugging Techniques**:
   - If elements aren't visible, check the browser inspector
   - Look for elements with CSS class `.mapboxgl-marker`
   - Check that transform property and z-index are being applied correctly

## 🚀 Best Practices for Directions API

1. **Separate Components**:
   - Create `MapDirectionsLayer.tsx` following the pattern of `MapMarkerLayer.tsx`
   - Consider a `DirectionsService.ts` for API calls

2. **DOM Management**:
   - Use direct DOM manipulation through Mapbox GL's API for lines and routes
   - Consider `map.addSource()` and `map.addLayer()` for route lines

3. **Style Consistency**:
   - Define route line styles in `constants.ts`
   - Use coordinated colors with existing vehicle markers

## 🧪 Testing Your Implementation

1. Start with a single route between two points
2. Verify that markers remain visible when routes are added
3. Test with multiple concurrent routes
4. Check on different zoom levels

The architecture is now solid for Directions API integration. Good luck with the implementation! 