import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface SimpleRouteProps {
  map: mapboxgl.Map;
  coordinates: [number, number][]; // [longitude, latitude] pairs
  id?: string;
  color?: string;
  width?: number;
  glow?: boolean;
  opacity?: number;
}

/**
 * SimpleRoute - A lightweight component for drawing route lines on a map
 * 
 * This component is optimized for simple route visualization with minimal overhead.
 * It doesn't handle complex routing, optimization, or animation - just draws lines.
 */
const SimpleRoute: React.FC<SimpleRouteProps> = ({
  map,
  coordinates,
  id = `route-${Math.random().toString(36).substring(2, 9)}`,
  color = '#00FF00',
  width = 3,
  glow = false,
  opacity = 0.8,
}) => {
  // Track if source and layer are added to the map
  const addedRef = useRef<boolean>(false);
  const sourceIdRef = useRef<string>(`${id}-source`);
  const layerIdRef = useRef<string>(`${id}-layer`);
  
  // Add route to map or update existing route
  useEffect(() => {
    // Skip if map is not available or coordinates are invalid
    if (!map || !coordinates || coordinates.length < 2) {
      return;
    }
    
    // Check if map is loaded
    if (!map.loaded()) {
      console.log('[SimpleRoute] Map not loaded yet, will retry on load event');
      const onLoad = () => {
        addOrUpdateRoute();
        map.off('load', onLoad);
      };
      map.on('load', onLoad);
      return () => {
        map.off('load', onLoad);
      };
    }
    
    // Add or update route
    addOrUpdateRoute();
    
    // Cleanup function
    return () => {
      cleanupRoute();
    };
  }, [map, coordinates, color, width, glow, opacity]);
  
  // Function to add or update the route
  const addOrUpdateRoute = () => {
    try {
      // Create paint properties
      const paintProps: mapboxgl.LinePaint = {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity
      };
      
      // Add glow effect if requested
      if (glow) {
        paintProps['line-blur'] = width / 2;
      }
      
      // Check if source already exists
      if (map.getSource(sourceIdRef.current)) {
        // Update existing source
        const source = map.getSource(sourceIdRef.current) as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
        
        // Update paint properties
        map.setPaintProperty(layerIdRef.current, 'line-color', color);
        map.setPaintProperty(layerIdRef.current, 'line-width', width);
        map.setPaintProperty(layerIdRef.current, 'line-opacity', opacity);
        
        if (glow) {
          map.setPaintProperty(layerIdRef.current, 'line-blur', width / 2);
        } else {
          map.setPaintProperty(layerIdRef.current, 'line-blur', 0);
        }
      } else {
        // Add new source and layer
        map.addSource(sourceIdRef.current, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        });
        
        // Add the layer
        map.addLayer({
          id: layerIdRef.current,
          type: 'line',
          source: sourceIdRef.current,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: paintProps
        });
        
        // Mark as added
        addedRef.current = true;
      }
    } catch (error) {
      console.error('[SimpleRoute] Error adding/updating route:', error);
    }
  };
  
  // Function to clean up the route
  const cleanupRoute = () => {
    if (!map || !addedRef.current) return;
    
    try {
      // Remove layer and source if they exist
      if (map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
      }
      
      if (map.getSource(sourceIdRef.current)) {
        map.removeSource(sourceIdRef.current);
      }
      
      // Reset added flag
      addedRef.current = false;
    } catch (error) {
      console.error('[SimpleRoute] Error cleaning up route:', error);
    }
  };
  
  // This component doesn't render any visible React elements
  return null;
};

export default React.memo(SimpleRoute); 