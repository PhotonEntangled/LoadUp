import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layer, Source } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import { mapDirectionsService, RouteInfo, Coordinate } from '../../services/maps/MapDirectionsService';
import { Vehicle } from '../../types/vehicle';

interface MapDirectionsLayerProps {
  origin?: Coordinate;
  destination?: Coordinate;
  waypoints?: Coordinate[];
  vehicle?: Vehicle;
  color?: string;
  width?: number;
  animated?: boolean;
  pulsing?: boolean;
  showStartEnd?: boolean;
  onRouteLoaded?: (route: RouteInfo) => void;
  onRouteError?: (error: Error) => void;
  useMockData?: boolean;
}

// Define GeoJSON feature properties types
interface RouteFeatureProperties {
  routeId: string;
  color: string;
  width: number;
}

interface MarkerFeatureProperties {
  markerType: 'start' | 'end';
  description: string;
}

// For rate limiting API calls (debounce mechanism)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * MapDirectionsLayer - Renders routes fetched from Mapbox Directions API
 * 
 * This component can be used to show directions between:
 * 1. A specific origin and destination
 * 2. A vehicle and a destination
 * 3. Multiple waypoints
 */
const MapDirectionsLayer: React.FC<MapDirectionsLayerProps> = ({
  origin,
  destination,
  waypoints = [],
  vehicle,
  color = '#00BFFF',
  width = 4,
  animated = false,
  pulsing = false,
  showStartEnd = true,
  onRouteLoaded,
  onRouteError,
  useMockData = false,
}) => {
  // State for route data
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Determine the coordinates to use
  const originCoords = useMemo((): Coordinate | undefined => {
    // If vehicle is provided, use its location
    if (vehicle && vehicle.location) {
      return [vehicle.location.longitude, vehicle.location.latitude];
    }
    // Otherwise use the provided origin
    return origin;
  }, [vehicle, origin]);
  
  // Load route when inputs change
  useEffect(() => {
    // Skip if we don't have both origin and destination
    if (!originCoords || !destination) {
      return;
    }
    
    const loadRoute = async () => {
      try {
        // Implement rate limiting to avoid 429 errors
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
          console.log('[MapDirectionsLayer] Rate limiting API call - using mock data instead');
          useMockData = true;
        } else {
          lastRequestTime = now;
        }
        
        setLoading(true);
        setError(null);
        
        // Fetch route with waypoints
        const routeData = await mapDirectionsService.getDirections({
          origin: originCoords,
          destination,
          waypoints
        }, {
          // Use mock data if specified, otherwise use the service default
          useMock: useMockData,
          // Request step-by-step directions
          steps: true,
          // Request full route geometry
          overview: 'full',
          // Get additional annotations for visualization
          annotations: ['speed', 'duration', 'distance']
        });
        
        setRoute(routeData);
        
        // Notify parent component
        if (onRouteLoaded) {
          onRouteLoaded(routeData);
        }
      } catch (err) {
        console.error('[MapDirectionsLayer] Error loading route:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Notify parent component
        if (onRouteError) {
          onRouteError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadRoute();
  }, [originCoords, destination, waypoints, useMockData, onRouteLoaded, onRouteError]);
  
  // Generate GeoJSON for the route
  const routeGeoJSON = useMemo(() => {
    // Return empty feature collection if no route
    if (!route) {
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
    
    // Create a feature for the route line
    const routeFeature = {
      type: 'Feature',
      properties: {
        routeId: route.id,
        color,
        width,
      } as RouteFeatureProperties,
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates
      }
    };
    
    const features: any[] = [routeFeature];
    
    // Add start and end markers if requested
    if (showStartEnd && route.coordinates.length > 1) {
      // Add start point
      features.push({
        type: 'Feature',
        properties: {
          markerType: 'start',
          description: route.originName || 'Start'
        } as MarkerFeatureProperties,
        geometry: {
          type: 'Point',
          coordinates: route.coordinates[0]
        }
      });
      
      // Add end point
      const lastIndex = route.coordinates.length - 1;
      features.push({
        type: 'Feature',
        properties: {
          markerType: 'end',
          description: route.destinationName || 'Destination'
        } as MarkerFeatureProperties,
        geometry: {
          type: 'Point',
          coordinates: route.coordinates[lastIndex]
        }
      });
    }
    
    return {
      type: 'FeatureCollection',
      features
    };
  }, [route, color, width, showStartEnd]);
  
  // Create line layer style
  const lineLayer: LineLayer = {
    id: 'route-line',
    type: 'line',
    paint: {
      'line-width': width,
      'line-color': color,
      'line-opacity': pulsing ? 0.8 : 0.8,
      'line-blur': 0.5,
    },
  };
  
  // Add line animation if requested
  const animatedLineLayer: LineLayer = {
    id: 'route-line-animated',
    type: 'line',
    paint: {
      'line-width': width,
      'line-color': 'white',
      'line-opacity': 0.8,
      'line-blur': 1,
      'line-dasharray': [0, 4, 3],
    },
  };
  
  // Create outline layer for better visibility
  const outlineLayer: LineLayer = {
    id: 'route-outline',
    type: 'line',
    paint: {
      'line-width': width + 4,
      'line-color': 'white',
      'line-opacity': 0.5,
      'line-blur': 2,
    },
  };
  
  // Render loading state
  if (loading) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12
      }}>
        Loading route...
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        backgroundColor: 'rgba(255,0,0,0.5)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 12
      }}>
        Error: {error.message}
      </div>
    );
  }
  
  // Skip rendering if no route or no features
  if (!route || routeGeoJSON.features.length === 0) {
    return null;
  }
  
  // Render the route
  return (
    <Source id="directions-source" type="geojson" data={routeGeoJSON}>
      {/* Outline layer (bottom) */}
      <Layer {...outlineLayer} />
      
      {/* Main route line */}
      <Layer {...lineLayer} />
      
      {/* Animated line on top (if enabled) */}
      {animated && <Layer {...animatedLineLayer} />}
    </Source>
  );
};

export default React.memo(MapDirectionsLayer); 