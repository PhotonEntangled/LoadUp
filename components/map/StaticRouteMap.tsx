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
  Layer, 
  MapProvider,
  useMap
} from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';
import { logger } from '@/utils/logger';
import { Feature, Point, LineString } from 'geojson';
import bbox from '@turf/bbox';
import { Home, Flag, MapPin, RefreshCw, ExternalLink, Loader2, LocateFixed } from 'lucide-react';
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
  isRefreshingLocation?: boolean;
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
  isRefreshingLocation
}: StaticRouteMapProps) => {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);
  const { current: map } = useMap();

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
        const featuresToBound: (Feature | Point | [number, number])[] = [];
        
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
             try { map.flyTo({ center: originCoordinates, zoom: 13, duration: 500 }); } catch (e) { logger.warn('StaticRouteMap: Error during fallback flyTo:', e); } 
        }
      }
    }
  // Depend on coordinates, route, and map load status
  }, [routeGeometry, originCoordinates, destinationCoordinates, isMapLoaded]); 

  // Function to handle zooming to the last known location
  const handleZoomToLastLocation = () => {
    if (lastKnownPosition?.geometry?.coordinates && map) {
      const [lon, lat] = lastKnownPosition.geometry.coordinates;
      logger.debug('[StaticRouteMap] Zooming to LKL:', { lon, lat });
      map.flyTo({ center: [lon, lat], zoom: 15 });
    } else {
      logger.warn('[StaticRouteMap] Cannot zoom to LKL: Missing position data or map instance.');
    }
  };

  // Effect to log prop changes for debugging
  useEffect(() => {
    logger.debug('[StaticRouteMap Props Update]', {
      originCoordinates,
      destinationCoordinates,
      routeGeometry: !!routeGeometry, // Log boolean presence
      lastKnownPosition: lastKnownPosition // Log the actual feature or null
    });
  }, [originCoordinates, destinationCoordinates, routeGeometry, lastKnownPosition]);

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
  const mapboxAccessToken = mapboxToken;
  
  // Neurotic check: Ensure token is provided
  if (!mapboxAccessToken) {
      logger.error('StaticRouteMap: mapboxToken prop is missing or empty!'); // Update error message
      return (
        <div className={`flex items-center justify-center bg-destructive/10 text-destructive p-4 rounded-md ${className}`} style={{ height, width }}>
           Map cannot be displayed: Configuration error (Missing Token).
        </div>
      );
  }

  // Render the map
  return (
    <div className={`relative ${className}`}>
      <MapProvider>
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
          {isMapLoaded && originCoordinates && (
            <Marker longitude={originCoordinates[0]} latitude={originCoordinates[1]} anchor="bottom">
              {/* Use a simple SVG or styled div for origin */}
               <Home className="h-6 w-6 text-green-600 fill-green-200" /> 
            </Marker>
          )}
          {isMapLoaded && destinationCoordinates && (
            <Marker longitude={destinationCoordinates[0]} latitude={destinationCoordinates[1]} anchor="bottom">
              {/* Use a simple SVG or styled div for destination */}
               <Flag className="h-6 w-6 text-red-600 fill-red-200" />
            </Marker>
          )}
          {isMapLoaded && lastKnownPosition?.geometry?.coordinates && (
            (() => {
              const [lon, lat] = lastKnownPosition.geometry.coordinates;
              // --- REPLACE LKL MARKER with structure from SimulationMap --- 
              return (
                <Marker longitude={lon} latitude={lat} anchor="center">
                  {/* Remove outer rotation div from SimulationMap */}
                  {/* Sizing div - Adapt size if needed, remove filter */}
                  <div style={{
                      width: '32px', 
                      height: '32px',
                      // filter: 'none', // Explicitly no filter
                      transition: 'none' // No transition needed
                   }}>
                    {/* Use the exact SVG structure from icons8-truck-top-view-48.svg / SimulationMap */}
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
                      {/* Main body - Use a fixed color (e.g., blue) instead of dynamic statusColor */}
                      {/* Path data extracted from the provided SVG */}
                      <path d="M0 0 C0.66 0 1.32 0 2 0 C2 0.99 2 1.98 2 3 C2.94875 2.938125 3.8975 2.87625 4.875 2.8125 C5.90625 2.874375 6.9375 2.93625 8 3 C10.84799817 7.27199725 10.33018316 10.97798285 10.3125 16 C10.32861328 16.91523438 10.34472656 17.83046875 10.36132812 18.7734375 C10.36197266 19.65257813 10.36261719 20.53171875 10.36328125 21.4375 C10.36626221 22.24058594 10.36924316 23.04367188 10.37231445 23.87109375 C9.90941468 26.51796982 9.13462297 27.40861466 7 29 C4.3125 29.1875 4.3125 29.1875 2 29 C2 29.99 2 30.98 2 32 C1.34 32 0.68 32 0 32 C0 31.01 0 30.02 0 29 C-2.97 29 -5.94 29 -9 29 C-9 20.42 -9 11.84 -9 3 C-6.03 3 -3.06 3 0 3 C0 2.01 0 1.02 0 0 Z " fill="#3B82F6" transform="translate(38,9)"/> {/* Blue-500 */} 
                      {/* Other parts (windshield, wheels) - keep original fills */}
                      <path d="M0 0 C2.875 -0.1875 2.875 -0.1875 6 0 C6.66 0.99 7.32 1.98 8 3 C5.36 3 2.72 3 0 3 C0 2.01 0 1.02 0 0 Z " fill="#6CAEEB" transform="translate(40,16)"/>
                      <path d="M0 0 C2.64 0 5.28 0 8 0 C7.01 1.485 7.01 1.485 6 3 C2.875 3.1875 2.875 3.1875 0 3 C0 2.01 0 1.02 0 0 Z " fill="#69B1EF" transform="translate(31,33)"/>
                      <path d="M0 0 C2.64 0 5.28 0 8 0 C7.01 1.485 7.01 1.485 6 3 C2.875 3.1875 2.875 3.1875 0 3 C0 2.01 0 1.02 0 0 Z " fill="#69B1EF" transform="translate(31,14)"/>
                      {/* Removed the second body path which was likely for color overlay in original SVG */}
                    </svg>
                  </div>
                </Marker>
              );
              // --- END REPLACE LKL MARKER --- 
            })()
          )}

          {/* --- Map Overlay Buttons --- */}
          {/* Container for buttons - Already top-left */}
           <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10"> 
              {/* Refresh Button */}
               <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={onRefreshLocation} 
                   disabled={!onRefreshLocation || isRefreshingLocation}
                   title="Refresh Last Known Location"
                   className="bg-card hover:bg-muted"
               >
                  {isRefreshingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
               </Button>
              {/* Zoom to Last Location Button */}
               <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={handleZoomToLastLocation} 
                   disabled={!lastKnownPosition?.geometry?.coordinates}
                   title="Zoom to Last Known Location"
                   className="bg-card hover:bg-muted"
               >
                  <LocateFixed className="h-4 w-4" />
               </Button>
              {/* View Tracking/Simulation Button - Keep only if prop provided */}
              {onViewTracking && (
                  <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={onViewTracking} 
                      title="View Live Tracking / Simulation"
                      className="bg-card hover:bg-muted"
                  >
                     <ExternalLink className="h-4 w-4" />
                  </Button>
              )}
           </div> 
        </Map>
      </MapProvider>
    </div>
  );
});

StaticRouteMap.displayName = 'StaticRouteMap'; 