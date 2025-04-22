"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import Map, { 
  NavigationControl, 
  ViewState, 
  ViewStateChangeEvent, 
  ErrorEvent, 
  MapEvent, 
  Marker, 
  Source, 
  Layer 
} from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';
import { logger } from '../../utils/logger';
import { Feature, Point, LineString } from 'geojson';
import bbox from '@turf/bbox';
import { Home, Flag, MapPin, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Props definition based on Phase 4.2 Specification
export interface StaticRouteMapProps {
  routeGeometry: Feature<LineString> | null; // Allow null for error handling
  originCoordinates: [number, number];
  destinationCoordinates: [number, number];
  lastKnownPosition?: Feature<Point> | null; // Optional
  mapboxToken: string; // Passed from parent
  mapStyle?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
  maxZoom?: number;
  onError?: (error: Error) => void;
  onRefreshLocation?: () => void;
  onViewTracking?: () => void;
}

const DEFAULT_ZOOM = 11;

/**
 * StaticRouteMap component - Renders a non-interactive snapshot of a shipment route.
 * Displays origin, destination, route line, and optionally last known vehicle position.
 */
export const StaticRouteMap = React.memo(({
  routeGeometry,
  originCoordinates,
  destinationCoordinates,
  lastKnownPosition,
  mapboxToken,
  mapStyle = "mapbox://styles/mapbox/navigation-night-v1",
  className = '',
  height = '400px', // Default height suitable for detail pages
  width = '100%',
  maxZoom = 16, // Slightly lower max zoom for static view
  onError,
  onRefreshLocation,
  onViewTracking,
}: StaticRouteMapProps) => {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);

  // Map State - Simplified from SimulationMap
  // Calculate initial center based on origin
  const initialCenter = { 
    longitude: originCoordinates[0], 
    latitude: originCoordinates[1], 
    zoom: DEFAULT_ZOOM 
  };
  const [viewState, setViewState] = useState<Partial<ViewState>>(initialCenter);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Mapbox GL instance loaded state

  // --- Effects ---

  // Mounted ref for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      logger.debug('StaticRouteMap unmounted');
    };
  }, []);

  // Effect to fit bounds when the route geometry is available and map is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (map && isMapLoaded) {
      try {
        let featuresToBound: (Feature | Point | [number, number])[] = [];
        
        // Add coordinates if they exist
        if (originCoordinates) featuresToBound.push(originCoordinates);
        if (destinationCoordinates) featuresToBound.push(destinationCoordinates);
        
        // Add route geometry if it exists and is valid
        if (routeGeometry?.geometry?.coordinates && routeGeometry.geometry.coordinates.length >= 2) {
            featuresToBound.push(routeGeometry); 
        } else if (routeGeometry) {
             logger.warn('StaticRouteMap: Invalid route geometry provided for bounds calculation, ignoring route.');
        }

        if (featuresToBound.length > 0) {
            let calculatedBounds;
            if (featuresToBound.length === 1 && Array.isArray(featuresToBound[0])) {
                // Only one point - fly to it
                logger.debug('StaticRouteMap: Only one point provided, flying to location.');
                map.flyTo({ center: featuresToBound[0] as [number, number], zoom: 13, duration: 500 });
                return;
            } else {
               // Create a FeatureCollection for bbox calculation
               const fc = turf.featureCollection(featuresToBound.map(f => 
                   Array.isArray(f) ? turf.point(f) : f as Feature // Convert coordinate arrays to turf points
               ));
               calculatedBounds = bbox(fc) as LngLatBoundsLike;
            }

            if (Array.isArray(calculatedBounds) && calculatedBounds.length === 4 && calculatedBounds.every(num => typeof num === 'number' && isFinite(num))) {
                logger.debug('StaticRouteMap: Fitting map bounds to combined features', { calculatedBounds });
                map.fitBounds(calculatedBounds, {
                    padding: 60, // Increased padding slightly
                    duration: 500, 
                    maxZoom: 15 
                });
            } else {
                 logger.warn('StaticRouteMap: Could not calculate valid combined bounds.');
                 // Fallback: attempt fly to origin if bounds fail
                 if (originCoordinates) map.flyTo({ center: originCoordinates, zoom: 13, duration: 500 });
            }
        } else {
             logger.warn('StaticRouteMap: No valid features provided to calculate bounds.');
             // Optionally center on a default location or do nothing
        }
      } catch (error) {
        logger.error('StaticRouteMap: Error calculating or fitting bounds:', error);
        // Fallback: attempt fly to origin if bounds fail
        if (originCoordinates) {
             try { map.flyTo({ center: originCoordinates, zoom: 13, duration: 500 }); } catch (e) {} 
        }
      }
    }
  // Depend on coordinates, route, and map load status
  }, [routeGeometry, originCoordinates, destinationCoordinates, isMapLoaded]); 

  // --- Event Handlers ---

  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    if (mountedRef.current) {
      setViewState(evt.viewState);
    }
  }, []);

  const handleMapLoad = useCallback((evt: MapEvent) => {
    if (mountedRef.current) {
      mapRef.current = evt.target; // Store the map instance
      setIsMapLoaded(true); // Mark Mapbox GL JS as loaded
      logger.info('StaticRouteMap: Mapbox GL JS instance loaded successfully');
    }
  }, []);

  const handleMapErrorInternal = useCallback((evt: ErrorEvent) => {
      logger.error('StaticRouteMap: Mapbox GL error:', evt.error);
      if (mountedRef.current) {
        const errorToReport = evt.error instanceof Error ? evt.error : new Error(evt.error?.message || 'Unknown map error');
        setMapError(errorToReport.message);
        if (onError) onError(errorToReport);
      }
  }, [onError]);

  // --- Render Logic ---

  // Error state (e.g., internal map error)
  if (mapError) {
    return (
      <div className={`flex items-center justify-center bg-destructive/10 text-destructive p-4 rounded-md ${className}`} style={{ height, width }}>
        <div>
          <h3 className="font-bold">Error loading map</h3>
          <p>{mapError}</p>
        </div>
      </div>
    );
  }
  
  // Get token directly from environment variable
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN; // Use the other public token variable
  
  // Neurotic check: Ensure token is provided
  if (!mapboxAccessToken) {
      logger.error('StaticRouteMap: NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN is not defined in environment variables!'); // Update error message
      return (
        <div className={`flex items-center justify-center bg-destructive/10 text-destructive p-4 rounded-md ${className}`} style={{ height, width }}>
           Map cannot be displayed: Configuration error (Missing Token).
        </div>
      );
  }

  // Render the map
  return (
    <div className={`static-route-map ${className} relative rounded overflow-hidden`} style={{ height, width }}>
      <Map
        {...viewState}
        onMove={handleViewStateChange}
        onLoad={handleMapLoad}
        onError={handleMapErrorInternal}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxAccessToken}
        maxZoom={maxZoom}
        interactive={true} // Keep basic interactivity (zoom/pan)
        // Assign map instance to ref for direct manipulation (fitBounds)
        ref={(instance) => { if (instance) mapRef.current = instance.getMap(); }}
      >
        <NavigationControl position="top-right" />

        {/* --- Render Route --- */}
        {routeGeometry && isMapLoaded && (
          <Source id="static-route-source" type="geojson" data={routeGeometry}>
            <Layer
              id="static-route-line"
              type="line"
              source="static-route-source"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#6B7280',
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
        {/* --- End Route --- */}

        {/* --- Render Markers --- */}
        {isMapLoaded && (
          <>
            {/* Origin Marker */}
            {originCoordinates && (
              <Marker longitude={originCoordinates[0]} latitude={originCoordinates[1]} anchor="bottom">
                <span title="Origin"><Home size={28} className="text-blue-400 opacity-90 drop-shadow" /></span>
              </Marker>
            )}

            {/* Destination Marker */}
            {destinationCoordinates && (
              <Marker longitude={destinationCoordinates[0]} latitude={destinationCoordinates[1]} anchor="bottom">
                <span title="Destination"><Flag size={28} className="text-green-400 opacity-90 drop-shadow"/></span>
              </Marker>
            )}

            {/* Last Known Position Marker (Conditional) */}
            {lastKnownPosition?.geometry?.coordinates && (
              <Marker 
                longitude={lastKnownPosition.geometry.coordinates[0]} 
                latitude={lastKnownPosition.geometry.coordinates[1]} 
                anchor="center"
              >
                <span title="Last Known Position"><MapPin size={16} className="text-gray-500 opacity-80" /></span>
              </Marker>
            )}
          </>
        )}
        {/* --- End Markers --- */}

      </Map>
      <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
          {onRefreshLocation && (
            <Button variant="outline" size="icon" onClick={onRefreshLocation} title="Refresh Location">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onViewTracking && (
            <Button variant="outline" size="icon" onClick={onViewTracking} title="View Live Tracking">
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
    </div>
  );
});

StaticRouteMap.displayName = 'StaticRouteMap'; 