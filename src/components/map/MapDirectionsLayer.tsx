import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Layer, Source, Marker } from 'react-map-gl';
import type { LineLayer, Map } from 'react-map-gl';
import { mapDirectionsService, RouteInfo, Coordinate } from '../../services/maps/MapDirectionsService';
import { Vehicle } from '../../types/vehicle';
import { mapManager } from '../../utils/maps/MapManager';
import styles from './MapDirectionsLayer.module.css';

// Define the structure for the routeData prop
interface RouteDataProp {
  id: string;
  type: string; // Should be 'LineString'
  coordinates: [number, number][];
  color: string;
  width: number;
  glow?: boolean;
  isRealRoute?: boolean;
}

interface MapDirectionsLayerProps {
  routeData?: RouteDataProp; // Add optional routeData prop
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

/**
 * MapDirectionsLayer - Renders routes fetched from Mapbox Directions API
 * 
 * This component can be used to show directions between:
 * 1. A specific origin and destination
 * 2. A vehicle and a destination
 * 3. Multiple waypoints
 */
const MapDirectionsLayer: React.FC<MapDirectionsLayerProps> = ({
  routeData,
  origin,
  destination,
  waypoints = [],
  vehicle,
  color = '#00BF30', // Slightly greener blue for better visibility
  width = 3,
  animated = true,   // Default to true for better user experience
  pulsing = true,    // Default to true for better user experience
  showStartEnd = true,
  onRouteLoaded,
  onRouteError,
  useMockData = false,
}) => {
  // ---> Log Component Render & Props <---
  console.log(`[MapDirectionsLayer ${routeData?.id ?? 'fetching'}] Rendering/Re-rendering. Props:`, { routeData, origin, destination, color, width, animated, pulsing, showStartEnd, useMockData });

  const [internalRoute, setInternalRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const sourceId = useMemo(() => `directions-source-${routeData?.id ?? origin?.join(',') ?? Date.now()}`, [routeData?.id, origin]);
  const layerId = useMemo(() => `directions-layer-${routeData?.id ?? origin?.join(',') ?? Date.now()}`, [routeData?.id, origin]);
  const pulsingLayerId = useMemo(() => `${layerId}-pulsing`, [layerId]);

  // Effect to get Map Instance via MapManager
  useEffect(() => {
    console.log(`[MapDirectionsLayer ${sourceId}] useEffect: Waiting for map instance...`);
    const cleanup = mapManager.waitForMap((map) => {
      console.log(`[MapDirectionsLayer ${sourceId}] Map instance received.`);
      setMapInstance(map as any); // Cast to any to bypass strict type check for now
    });
    return cleanup; // Cleanup function from waitForMap
  }, [sourceId]); // Re-run if sourceId changes (should be stable)

  // Effect to fetch route if not provided via props
  useEffect(() => {
    // ---> Log Effect Trigger <---
    console.log(`[MapDirectionsLayer ${sourceId}] useEffect: Fetch/Process Route. Has routeData prop: ${!!routeData}, Has origin/dest: ${!!(origin && destination)}`);

    if (routeData && routeData.coordinates && routeData.coordinates.length >= 2) {
      // ---> Log Using Prop Data <---
      console.log(`[MapDirectionsLayer ${sourceId}] Using routeData from props.`);
      // Basic mapping from prop to internal state structure
      const routeInfoFromProp: RouteInfo = {
        id: routeData.id,
        coordinates: routeData.coordinates,
        summary: { distance: 0, duration: 0, estimatedArrival: new Date() }, // Dummy summary
        legs: [] // Dummy legs
      };
      setInternalRoute(routeInfoFromProp);
      setLoading(false);
      setError(null);
      if (onRouteLoaded) onRouteLoaded(routeInfoFromProp);
      return; // Don't fetch if prop data is valid
    }

    if (origin && destination) {
      // ---> Log Fetching Data <---
      console.log(`[MapDirectionsLayer ${sourceId}] Fetching route from API... Origin: ${origin}, Dest: ${destination}`);
      setLoading(true);
      setError(null);

      mapDirectionsService.getRoute(origin, destination, { useMock: useMockData })
        .then(fetchedRoute => {
          // ---> Log Fetch Success <---
          console.log(`[MapDirectionsLayer ${sourceId}] Route fetched successfully:`, fetchedRoute);
          setInternalRoute(fetchedRoute);
          setLoading(false);
          if (onRouteLoaded) onRouteLoaded(fetchedRoute);
        })
        .catch(fetchError => {
          // ---> Log Fetch Error <---
          console.error(`[MapDirectionsLayer ${sourceId}] Error fetching route:`, fetchError);
          setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError))); // Ensure it's an Error object
          setLoading(false);
          if (onRouteError) onRouteError(fetchError instanceof Error ? fetchError : new Error(String(fetchError))); // Pass Error object
        });
    } else {
      // ---> Log Insufficient Data <---
      console.log(`[MapDirectionsLayer ${sourceId}] No routeData prop and no valid origin/destination provided.`);
      setLoading(false); // Not loading if no data to fetch
    }
  }, [routeData, origin, destination, useMockData, onRouteLoaded, onRouteError, sourceId]); // Dependencies

  // Memoize GeoJSON data for the route line
  const routeGeoJSON = useMemo((): GeoJSON.FeatureCollection<GeoJSON.LineString> | null => {
    if (!internalRoute?.coordinates || internalRoute.coordinates.length < 2) {
      // ---> Log No GeoJSON <---
      console.log(`[MapDirectionsLayer ${sourceId}] useMemo(routeGeoJSON): Not enough coordinates, returning null.`);
      return null;
    }
    const geoJsonData = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: { routeId: internalRoute.id, color, width },
        geometry: {
          type: 'LineString' as const,
          coordinates: internalRoute.coordinates,
        },
      }],
    };
    // ---> Log GeoJSON Creation <---
    console.log(`[MapDirectionsLayer ${sourceId}] useMemo(routeGeoJSON): Created GeoJSON with ${internalRoute.coordinates.length} coordinates.`, geoJsonData);
    return geoJsonData;
  }, [internalRoute, color, width, sourceId]);

  // Layer style for the main route line
  const routeLayerStyle: LineLayer = useMemo(() => ({
    id: layerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': color,
      'line-width': width,
      'line-opacity': 0.8,
    },
  }), [layerId, sourceId, color, width]);

  // Layer style for the pulsing animation effect
  const pulsingLayerStyle: LineLayer = useMemo(() => ({
    id: pulsingLayerId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': color,
      'line-width': width * 2.5, // Wider for the glow effect
      'line-opacity': 0.3, // More transparent
      'line-blur': 5, // Add blur for glow
    },
  }), [pulsingLayerId, sourceId, color, width]);

  // ---> Log Before Render Return <---
  console.log(`[MapDirectionsLayer ${sourceId}] Rendering return. isLoading: ${loading}, hasError: ${!!error}, hasGeoJSON: ${!!routeGeoJSON}, hasMapInstance: ${!!mapInstance}`);

  if (loading || error || !routeGeoJSON || !mapInstance) {
    // Don't render source/layer if data isn't ready, map isn't ready, or there's an error
    // ---> Log Why Not Rendering Layers <---
    if (loading) console.log(`[MapDirectionsLayer ${sourceId}] Not rendering layers: Loading...`);
    if (error) console.log(`[MapDirectionsLayer ${sourceId}] Not rendering layers: Error exists.`);
    if (!routeGeoJSON) console.log(`[MapDirectionsLayer ${sourceId}] Not rendering layers: No GeoJSON.`);
    if (!mapInstance) console.log(`[MapDirectionsLayer ${sourceId}] Not rendering layers: No Map Instance.`);
    return null;
  }

  // ---> Log Rendering Layers <---
  console.log(`[MapDirectionsLayer ${sourceId}] Rendering Source (${sourceId}) and Layers (${layerId}, ${pulsingLayerId})`);

  // Define coordinates for start and end markers
  const startCoord = internalRoute?.coordinates?.[0];
  const endCoord = internalRoute?.coordinates?.[internalRoute.coordinates.length - 1];

  return (
    <>
      <Source id={sourceId} type="geojson" data={routeGeoJSON}>
        {/* Main route line */} 
        <Layer {...routeLayerStyle} />
        {/* Pulsing effect layer (optional) */} 
        {pulsing && <Layer {...pulsingLayerStyle} />}
      </Source>

      {/* Start and End Markers */} 
      {showStartEnd && startCoord && (
        <Marker longitude={startCoord[0]} latitude={startCoord[1]} anchor="center">
          <div className={styles.startMarker} title={`Start: ${startCoord[1].toFixed(4)}, ${startCoord[0].toFixed(4)}`}>
            <div className={styles.pulseDot}></div>
          </div>
        </Marker>
      )}
      {showStartEnd && endCoord && (
        <Marker longitude={endCoord[0]} latitude={endCoord[1]} anchor="center">
          <div className={styles.endMarker} title={`Destination: ${endCoord[1].toFixed(4)}, ${endCoord[0].toFixed(4)}`}>
             <div className={styles.pulseDot}></div>
          </div>
        </Marker>
      )}
    </>
  );
};

export default MapDirectionsLayer; 