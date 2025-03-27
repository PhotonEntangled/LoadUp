import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// Local implementation of the token utility since we can't import from the main project
// This matches the implementation in src/utils/mapbox-token.ts
const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoibG9hZHVwIiwiYSI6ImNsbTUxcWVsajJnOXAzZG83cHo1bjB5dWYifQ.8Fh30KBunCj-FlP2E7hGUw';

const getMapboxPublicToken = (): string => {
  // Check all potential token environment variables
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const publicToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappingToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  
  // Use the first available token with fallback
  return accessToken || publicToken || mappingToken || FALLBACK_PUBLIC_TOKEN;
};

// Mapbox access token - use utility function instead of direct env var access
const MAPBOX_ACCESS_TOKEN = getMapboxPublicToken();

export interface RouteStop {
  id: string;
  longitude: number;
  latitude: number;
  name?: string;
  address?: string;
  eta?: Date;
  arrivalTime?: Date;
  departureTime?: Date;
  status?: 'pending' | 'arrived' | 'departed' | 'completed' | 'skipped' | 'failed';
  stopType?: 'pickup' | 'delivery' | 'depot' | 'waypoint';
  stopOrder: number;
  duration?: number; // Duration at this stop in seconds
}

export interface RouteSegment {
  distance: number; // In meters
  duration: number; // In seconds
  coordinates: Array<[number, number]>; // [longitude, latitude] pairs
  startStopId: string;
  endStopId: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface MapboxRouteProps {
  // Required props
  map: mapboxgl.Map;
  stops: RouteStop[];
  
  // Optional props
  sourceId?: string;
  layerId?: string;
  optimizeRoute?: boolean; // Whether to optimize the route order
  showStopMarkers?: boolean; // Whether to show markers for stops
  includeCurrentLocation?: boolean; // Include current location as starting point
  currentLocation?: { longitude: number; latitude: number }; // Current location (e.g., driver)
  
  // Route styling
  routeColor?: string;
  routeCompletedColor?: string;
  routeWidth?: number;
  routeOpacity?: number;
  
  // Events
  onRouteCalculated?: (segments: RouteSegment[]) => void;
  onRouteFailed?: (error: Error) => void;
  onETACalculated?: (stops: RouteStop[]) => void;
  
  // Options
  showRouteSimulation?: boolean; // Animate a marker along the route
  simulationSpeed?: number; // Multiplier for simulation speed (1 = real-time)
}

const MapboxRoute: React.FC<MapboxRouteProps> = ({
  map,
  stops,
  sourceId = 'route-source',
  layerId = 'route-layer',
  optimizeRoute = false,
  showStopMarkers = true,
  includeCurrentLocation = false,
  currentLocation,
  routeColor = '#2196F3', // Blue
  routeCompletedColor = '#4CAF50', // Green
  routeWidth = 4,
  routeOpacity = 0.75,
  onRouteCalculated,
  onRouteFailed,
  onETACalculated,
  showRouteSimulation = false,
  simulationSpeed = 5,
}) => {
  // State to track route segments
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  // State to track optimized stops
  const [optimizedStops, setOptimizedStops] = useState<RouteStop[]>([]);
  // State to track if route is loaded
  const [routeLoaded, setRouteLoaded] = useState(false);
  // Reference to source
  const sourceRef = useRef<string>(sourceId);
  // Reference to marker sources and layers for simulation
  const simulationRefs = useRef<{
    sourceId: string;
    layerId: string;
    marker: mapboxgl.Marker | null;
    animationFrame: number | null;
  }>({
    sourceId: `${sourceId}-simulation`,
    layerId: `${layerId}-simulation`,
    marker: null,
    animationFrame: null,
  });

  // Sort stops by order if not optimizing
  useEffect(() => {
    if (!optimizeRoute) {
      const sortedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
      setOptimizedStops(sortedStops);
    }
  }, [stops, optimizeRoute]);

  // Function to calculate route between stops
  const calculateRoute = async (routeStops: RouteStop[]) => {
    if (!map || !MAPBOX_ACCESS_TOKEN || routeStops.length < 2) return;

    try {
      // Include current location as the starting point if specified
      const allCoordinates = includeCurrentLocation && currentLocation
        ? [
            [currentLocation.longitude, currentLocation.latitude],
            ...routeStops.map(stop => [stop.longitude, stop.latitude]),
          ]
        : routeStops.map(stop => [stop.longitude, stop.latitude]);

      // Create a string of coordinates for the API
      const coordinatesString = allCoordinates
        .map(coord => coord.join(','))
        .join(';');

      // Call Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      const route = data.routes[0];

      // Extract route coordinates
      const coordinates = route.geometry.coordinates;

      // Create route segments
      const segments: RouteSegment[] = [];
      let segmentStartIndex = 0;

      // If there's a current location, include it in segment calculations
      const allStops = includeCurrentLocation && currentLocation
        ? [{ id: 'current-location', longitude: currentLocation.longitude, latitude: currentLocation.latitude, stopOrder: -1 }, ...routeStops]
        : routeStops;

      for (let i = 0; i < allStops.length - 1; i++) {
        const startStop = allStops[i];
        const endStop = allStops[i + 1];
        
        // Find leg in the route that corresponds to this segment
        const legIndex = includeCurrentLocation ? i : i;
        
        // Make sure legs array exists and the specific leg exists before accessing
        if (route.legs && Array.isArray(route.legs) && route.legs.length > legIndex && route.legs[legIndex]) {
          const leg = route.legs[legIndex];
          
          segments.push({
            distance: leg.distance,
            duration: leg.duration,
            coordinates: coordinates.slice(segmentStartIndex, segmentStartIndex + leg.steps.length + 1),
            startStopId: startStop.id,
            endStopId: endStop.id,
            status: 'pending',
          });
          
          segmentStartIndex += leg.steps.length;
        }
      }

      // Calculate ETAs for each stop
      const stopsWithETA = [...routeStops];
      let cumulativeTime = 0;
      const now = new Date();

      // Skip first stop if including current location (start point)
      const startIndex = includeCurrentLocation ? 1 : 0;
      
      for (let i = startIndex; i < stopsWithETA.length; i++) {
        const prevSegmentIndex = i - startIndex;
        if (prevSegmentIndex >= 0 && segments[prevSegmentIndex]) {
          cumulativeTime += segments[prevSegmentIndex].duration;
          const etaTime = new Date(now.getTime() + cumulativeTime * 1000);
          stopsWithETA[i].eta = etaTime;
          
          // Add stop duration if available - using optional chaining and nullish coalescing
          const stopDuration = stopsWithETA[i]?.duration ?? 0;
          if (stopDuration > 0) {
            cumulativeTime += stopDuration;
          }
        }
      }

      // Update state with route segments and stops with ETAs
      setRouteSegments(segments);
      setOptimizedStops(stopsWithETA);
      
      // Notify parent components
      if (onRouteCalculated) {
        onRouteCalculated(segments);
      }
      if (onETACalculated) {
        onETACalculated(stopsWithETA);
      }

      // Add the route source to the map if it doesn't exist
      if (!map.getSource(sourceRef.current)) {
        map.addSource(sourceRef.current, {
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

        // Add the route layer
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceRef.current,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': routeColor,
            'line-width': routeWidth,
            'line-opacity': routeOpacity
          }
        });

        setRouteLoaded(true);
      } else {
        // Update existing source
        const source = map.getSource(sourceRef.current) as mapboxgl.GeoJSONSource;
        
        if (source && 'setData' in source) {
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          });
        }
      }

      // Create simulation marker if needed
      if (showRouteSimulation && coordinates.length > 0) {
        initializeRouteSimulation(coordinates);
      }

    } catch (error) {
      const routeError = error instanceof Error 
        ? error 
        : new Error('Failed to calculate route');
      console.error('Route calculation failed:', routeError);
      
      if (onRouteFailed) {
        onRouteFailed(routeError);
      }
    }
  };

  // Initialize route simulation
  const initializeRouteSimulation = (coordinates: Array<[number, number]>) => {
    // Clear any existing simulation
    clearRouteSimulation();

    if (!map || coordinates.length === 0) return;

    // Create a GeoJSON point feature for the current position
    const point = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: coordinates[0]
      }
    };

    // Add a source for the moving point if it doesn't exist
    if (!map.getSource(simulationRefs.current.sourceId)) {
      map.addSource(simulationRefs.current.sourceId, {
        type: 'geojson',
        data: point as any
      });

      // Add a layer for the moving point
      map.addLayer({
        id: simulationRefs.current.layerId,
        type: 'circle',
        source: simulationRefs.current.sourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': '#007cbf',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });
    } else {
      // Update existing source
      const source = map.getSource(simulationRefs.current.sourceId) as mapboxgl.GeoJSONSource;
      if (source && 'setData' in source) {
        source.setData(point as any);
      }
    }

    // Start the animation
    let step = 0;
    const animateRoute = (timestamp: number) => {
      const progress = Math.min(1, step / (coordinates.length - 1));
      const currentIndex = Math.floor(progress * (coordinates.length - 1));
      const nextIndex = Math.min(currentIndex + 1, coordinates.length - 1);
      
      const currentCoord = coordinates[currentIndex];
      const nextCoord = coordinates[nextIndex];
      
      // Calculate interpolation between points
      const t = (progress * (coordinates.length - 1)) % 1;
      const lng = currentCoord[0] + (nextCoord[0] - currentCoord[0]) * t;
      const lat = currentCoord[1] + (nextCoord[1] - currentCoord[1]) * t;
      
      // Update point position
      const source = map.getSource(simulationRefs.current.sourceId) as mapboxgl.GeoJSONSource;
      if (source && 'setData' in source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        } as any);
      }
      
      // Increment step based on simulation speed
      step += simulationSpeed * 0.0005;
      
      // Reset if we reached the end
      if (step >= coordinates.length - 1) {
        step = 0;
      }
      
      // Continue animation
      simulationRefs.current.animationFrame = requestAnimationFrame(animateRoute);
    };
    
    simulationRefs.current.animationFrame = requestAnimationFrame(animateRoute);
  };

  // Clear route simulation
  const clearRouteSimulation = () => {
    if (simulationRefs.current.animationFrame) {
      cancelAnimationFrame(simulationRefs.current.animationFrame);
      simulationRefs.current.animationFrame = null;
    }
    
    if (simulationRefs.current.marker) {
      simulationRefs.current.marker.remove();
      simulationRefs.current.marker = null;
    }
  };

  // Calculate optimized route when needed
  useEffect(() => {
    if (map && optimizeRoute && stops.length > 1) {
      // In a real implementation, you would call a route optimization service
      // For now, we'll just use the original order as a placeholder
      const sortedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
      setOptimizedStops(sortedStops);
      calculateRoute(sortedStops);
    } else if (map && stops.length > 1) {
      // Use the order provided
      calculateRoute(optimizedStops);
    }
  }, [map, stops, optimizeRoute, currentLocation, includeCurrentLocation]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      clearRouteSimulation();
      
      if (map && map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      
      if (map && map.getSource(sourceRef.current)) {
        map.removeSource(sourceRef.current);
      }
      
      if (map && map.getLayer(simulationRefs.current.layerId)) {
        map.removeLayer(simulationRefs.current.layerId);
      }
      
      if (map && map.getSource(simulationRefs.current.sourceId)) {
        map.removeSource(simulationRefs.current.sourceId);
      }
    };
  }, [map, layerId]);

  // Update route styling when props change
  useEffect(() => {
    if (map && routeLoaded && map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'line-color', routeColor);
      map.setPaintProperty(layerId, 'line-width', routeWidth);
      map.setPaintProperty(layerId, 'line-opacity', routeOpacity);
    }
  }, [map, routeColor, routeWidth, routeOpacity, routeLoaded, layerId]);

  // This component doesn't render any visible React elements
  return null;
};

export default MapboxRoute; 