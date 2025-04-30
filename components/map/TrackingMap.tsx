"use client";

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import Map, {
  NavigationControl,
  ViewState,
  ViewStateChangeEvent,
  ErrorEvent,
  MapEvent,
  Marker,
  Source,
  Layer,
  Popup,
  MapRef
} from 'react-map-gl/mapbox';
import { useLiveTrackingStore } from '../../lib/store/useLiveTrackingStore'; // Using relative path
import { LiveVehicleUpdate } from '../../types/tracking'; // Using relative path
import { logger } from '../../utils/logger'; // Using relative path
import { Feature, Point as GeoJsonPoint, LineString } from 'geojson'; // Renamed to avoid conflict with React Point
import { Home, Flag } from 'lucide-react';
// TODO: Decide if VehicleStatus enum is needed here or if we rely on subscriptionStatus
import { cn } from "../../lib/utils"; // Using relative path
import { formatTimestamp, formatSpeed } from '../../utils/formatters'; // Assume these exist

// Define potential methods to expose via the ref
export interface TrackingMapRef {
  getMap: () => mapboxgl.Map | null;
  triggerResize: () => void;
  zoomToFit: () => void;
  // Add other methods if needed (e.g., flyTo)
}

// Props definition for the TrackingMap
export interface TrackingMapProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  maxZoom?: number;
  mapboxToken: string; // Make token mandatory
  // No explicit onError needed, will rely on store's error state
}

const DEFAULT_CENTER = { latitude: 3.1390, longitude: 101.6869, zoom: 11 }; // Default center (Kuala Lumpur)

// Interface for popup data to ensure structure
interface PopupInfo {
  longitude: number;
  latitude: number;
  timestamp?: number | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  driverName?: string | null;
  shipmentId?: string | null;
}

/**
 * TrackingMap component - Renders the interactive map for LIVE vehicle tracking.
 * Displays vehicle markers based on live data, planned routes, and handles interactions.
 */
export const TrackingMap = React.memo(forwardRef<TrackingMapRef, TrackingMapProps>((
{
  className = '',
  height = '100%',
  width = '100%',
  maxZoom = 18,
  mapboxToken,
}, ref) => {
  // Refs
  const mapRefInternal = useRef<MapRef | null>(null); // Use MapRef type from react-map-gl
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null); // Ref for origin marker
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null); // Ref for destination marker

  // Map State
  const [viewState, setViewState] = useState<Partial<ViewState>>(DEFAULT_CENTER);
  const [mapError, setMapError] = useState<string | null>(null); // Local map init errors
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null); // State for popup
  const [isStale, setIsStale] = useState(false); // Add state for staleness

  // Live Tracking Store State (Selectors will be added in Task 9.5.2)
  // const { latestLiveUpdate, subscriptionStatus, ... } = useLiveTrackingStore(...);
  // Connect to the store and select necessary state (Task 9.5.2)
  const {
    trackedShipmentId,
    latestLiveUpdate,
    staticShipmentDetails,
    subscriptionStatus,
    subscriptionError,
    isFollowingVehicle,
    setFollowingVehicle,
    subscribe
  } = useLiveTrackingStore(
    useCallback(state => ({
      trackedShipmentId: state.trackedShipmentId,
      latestLiveUpdate: state.latestLiveUpdate,
      staticShipmentDetails: state.staticShipmentDetails,
      subscriptionStatus: state.subscriptionStatus,
      subscriptionError: state.subscriptionError,
      isFollowingVehicle: state.isFollowingVehicle,
      setFollowingVehicle: state.setFollowingVehicle,
      subscribe: state.subscribe
    }), [])
  );

  // Expose methods via the passed ref
  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
    triggerResize: () => {
      mapInstanceRef.current?.resize();
      logger.debug('[TrackingMap] Externally triggered resize()');
    },
    zoomToFit: () => {
      const map = mapInstanceRef.current;
      const currentState = useLiveTrackingStore.getState();
      const { staticShipmentDetails, latestLiveUpdate, setFollowingVehicle } = currentState;

      if (!map) {
        logger.warn('[TrackingMap.zoomToFit] Map instance not available.');
        return;
      }

      const points: mapboxgl.LngLatLike[] = [];
      if (latestLiveUpdate && typeof latestLiveUpdate.longitude === 'number' && typeof latestLiveUpdate.latitude === 'number') {
        points.push([latestLiveUpdate.longitude, latestLiveUpdate.latitude]);
      }
      if (staticShipmentDetails?.originCoords) {
        points.push([staticShipmentDetails.originCoords.lon, staticShipmentDetails.originCoords.lat]);
      }
      if (staticShipmentDetails?.destinationCoords) {
        points.push([staticShipmentDetails.destinationCoords.lon, staticShipmentDetails.destinationCoords.lat]);
      }

      if (points.length === 0) {
        logger.warn('[TrackingMap.zoomToFit] No valid points (vehicle, origin, destination) available to fit bounds.');
        // Optional: fly to default center?
        return;
      } 
      // If only one point, fly to it
      else if (points.length === 1) {
         logger.info('[TrackingMap.zoomToFit] Only one point available, flying to it.');
         map.flyTo({ center: points[0], zoom: 15, duration: 1000 }); 
      }
      // If multiple points, fit bounds
      else {
        logger.info(`[TrackingMap.zoomToFit] Fitting bounds to ${points.length} points.`);
        const bounds = new mapboxgl.LngLatBounds();
        points.forEach(point => bounds.extend(point));
        map.fitBounds(bounds, {
          padding: 60, // Add padding around the bounds
          maxZoom: 16,  // Prevent zooming in too close
          duration: 1000 // Animation duration
        });
      }
      
      // Disable follow mode after zooming to fit
      if (currentState.isFollowingVehicle) {
        setFollowingVehicle(false);
      }
    }
  }), [setFollowingVehicle]);

  // --- Callback Definitions ---

  // Moved handleLayerClick definition here
  const handleLayerClick = useCallback((e: mapboxgl.MapLayerMouseEvent) => {
    // Neurotic Check: Use getState() inside handler to avoid stale closures
    const currentState = useLiveTrackingStore.getState();
    const currentUpdate = currentState.latestLiveUpdate;
    const currentStatic = currentState.staticShipmentDetails;

    if (!e.features || e.features.length === 0 || !currentUpdate) {
      logger.warn("[TrackingMap] Click detected, but no features or latest update available.");
      setPopupInfo(null); // Ensure popup is closed if data is missing
      return;
    }

    const coordinates = (e.features[0].geometry as GeoJsonPoint).coordinates.slice();
    // Ensure longitude/latitude are numbers
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    setPopupInfo({
      longitude: coordinates[0],
      latitude: coordinates[1],
      timestamp: currentUpdate.timestamp,
      speed: currentUpdate.speed,
      heading: currentUpdate.heading,
      accuracy: currentUpdate.accuracy,
      driverName: currentStatic?.driverName,
      shipmentId: currentUpdate.shipmentId
    });
    logger.debug("[TrackingMap] Popup opened for shipment:", currentUpdate.shipmentId);

  }, []);

  // Callback for general map mouse move (to reset cursor)
  const handleMapMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ['live-vehicle-layer'] });
    // Reset cursor if mouse is NOT over the vehicle layer
    map.getCanvas().style.cursor = (features && features.length > 0) ? 'pointer' : '';
  }, []);

  // Callback specifically when mouse enters/moves over the vehicle layer (to set cursor)
  // Note: While 'mousemove' on layer is often used, combining logic in general mousemove
  // is simpler here to handle both setting and resetting the cursor.
  // We primarily use handleMapMouseMove now.

  // Callback to disable follow mode on user interaction
  const disableFollowMode = useCallback(() => {
    // Use getState to ensure we check the *latest* state before potentially setting it
    if (useLiveTrackingStore.getState().isFollowingVehicle) {
        logger.debug('[TrackingMap] User interaction detected, disabling follow mode.');
        setFollowingVehicle(false); // setFollowingVehicle is stable from the store hook
    }
  }, [setFollowingVehicle]); // Depends on the stable setFollowingVehicle action

  const handleMapLoad = useCallback((event: MapEvent) => {
    logger.info('[TrackingMap] Map Loaded');
    const loadedMap = event.target;
    mapInstanceRef.current = loadedMap;

    // Task 9.5.4: Add SVG icon to map style resources
    // Create an Image element to load the SVG path data
    // Note: Using path data directly is more complex with map.addImage.
    // A simpler way is often to load an actual image URL or use SDF icons.
    // Workaround: Create a canvas, draw SVG path, get ImageData.
    // Simpler Workaround for now: Using a pre-defined icon name assumes it's in the style
    // or loaded elsewhere. Let's define the SVG data and use map.addImage.

    const svgString = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44 18V34H40V38H34V42H14V38H8V34H4V18L10 6H38L44 18Z" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2" stroke-linejoin="round"/>
        <path d="M14 12H34V18H14V12Z" fill="#BFDBFE" stroke="#1E3A8A" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 24H36" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 30H38" stroke="#1E3A8A" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    // Convert SVG string to ImageBitmap or HTMLImageElement for map.addImage
    // This requires browser environment and can be tricky.
    // Alternative: If possible, add the icon directly to the Mapbox style or use an existing icon.
    // For now, let's assume an icon named 'truck-icon' can be resolved or added manually later.
    // If using map.addImage, it MUST be done carefully to handle async loading.
    logger.warn("[TrackingMap] map.addImage for SVG string not implemented directly. Assuming 'truck-icon' exists in style or added manually.");
    // Example of how it *might* be done (requires careful handling):
    /*
    const img = new Image(48, 48);
    img.onload = () => {
      if (map.hasImage('truck-icon')) map.removeImage('truck-icon');
      map.addImage('truck-icon', img, { sdf: false }); // Set sdf: true if icon designed for color tinting
      logger.info("[TrackingMap] Truck icon added to map resources.");
    };
    img.onerror = (err) => {
        logger.error("[TrackingMap] Error loading SVG for map icon:", err);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    */

    setIsMapLoaded(true);
    
    // Add listeners AFTER map is loaded
    if (loadedMap) {
      loadedMap.on('click', 'live-vehicle-layer', handleLayerClick);
      loadedMap.on('mousemove', handleMapMouseMove);
      
      // Listen for user interactions to disable follow mode
      loadedMap.on('dragstart', disableFollowMode);
      loadedMap.on('zoomstart', disableFollowMode);

    } else {
        logger.error("[TrackingMap] Map instance not available during onLoad to attach listeners.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleLayerClick, handleMapMouseMove, disableFollowMode]); // Added disableFollowMode to deps

  const handleMapError = useCallback((event: ErrorEvent) => {
    logger.error('[TrackingMap] MapLibre Error:', event.error);
    setMapError(event.error?.message || 'An unknown map error occurred');
    // Note: We don't call an onError prop, UI should react to store's subscriptionError
  }, []);

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
    // Close popup on map move for simplicity? Or let it stay anchored?
    // Decision: Keep it simple for now, popup stays until explicitly closed.
  }, []);

  // --- Effects ---
  useEffect(() => {
    mountedRef.current = true;
    const map = mapInstanceRef.current; // Capture instance for cleanup
    
    // Cleanup function for listeners added in handleMapLoad
    return () => {
      mountedRef.current = false;
      if (map) {
        map.off('click', 'live-vehicle-layer', handleLayerClick);
        map.off('mousemove', handleMapMouseMove);
        // Remove user interaction listeners
        map.off('dragstart', disableFollowMode);
        map.off('zoomstart', disableFollowMode);
         // Reset cursor explicitly on unmount
        try {
          if (map.getCanvas()) map.getCanvas().style.cursor = '';
        } catch (e) { /* Ignore potential errors getting canvas */ }
      }
      logger.debug('TrackingMap unmounted, listeners removed.');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep deps empty to run only on mount/unmount - callbacks use refs or getState

  // Effect for handling local map init errors
  useEffect(() => {
    if (mapError) {
      // Display error to user? For now, just log.
      console.error(`Map Initialization Error: ${mapError}`);
    }
  }, [mapError]);

  // Effect to update GeoJSON source data when live update changes (Task 9.5.4)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const STALE_THRESHOLD_MS = 30000; // 30 seconds

    if (!map || !map.isStyleLoaded() || !isMapLoaded) {
      return; // Map not ready
    }

    // Calculate staleness
    let currentIsStale = false;
    if (latestLiveUpdate && typeof latestLiveUpdate.timestamp === 'number') {
      const timeDiff = Date.now() - latestLiveUpdate.timestamp;
      currentIsStale = timeDiff > STALE_THRESHOLD_MS;
    }
    setIsStale(currentIsStale); // Update state

    // Update marker source and layer properties
    if (!latestLiveUpdate || typeof latestLiveUpdate.longitude !== 'number' || typeof latestLiveUpdate.latitude !== 'number') {
      // If no valid update, ensure opacity is normal (or hide layer if preferred)
      if (map.getLayer('live-vehicle-layer')) {
         map.setPaintProperty('live-vehicle-layer', 'icon-opacity', 1);
         // Optionally hide if no data: map.setLayoutProperty('live-vehicle-layer', 'visibility', 'none');
      }
      return; // No valid update to display
    }

    const source = map.getSource('live-vehicle-source') as mapboxgl.GeoJSONSource;
    const geoJsonData: Feature<GeoJsonPoint> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [latestLiveUpdate.longitude, latestLiveUpdate.latitude]
      },
      properties: {
        // Add any properties needed for popups or styling, e.g., rotation
        // rotation: latestLiveUpdate.heading ?? 0 // Store raw heading
      }
    };

    if (source) {
      source.setData(geoJsonData);
      logger.debug('[TrackingMap] Updated live-vehicle-source data');
    } else {
      // Source might not be added yet if map just loaded, handle gracefully
      logger.warn('[TrackingMap] live-vehicle-source not found when trying to setData');
    }

    // Update layer rotation and opacity directly
    const newRotation = (latestLiveUpdate.heading ?? 0) - 90; // Apply 90-degree anti-clockwise offset
    if (map.getLayer('live-vehicle-layer')) {
      map.setLayoutProperty('live-vehicle-layer', 'icon-rotate', newRotation);
      map.setPaintProperty('live-vehicle-layer', 'icon-opacity', currentIsStale ? 0.5 : 1);
    } else {
        logger.warn('[TrackingMap] live-vehicle-layer not found when trying to set layout property');
    }

  }, [latestLiveUpdate, isMapLoaded]); // Depend on latestLiveUpdate and isMapLoaded - isStale derived internally

  // Effect for Follow Vehicle Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      map && 
      isMapLoaded && 
      isFollowingVehicle && 
      latestLiveUpdate && 
      typeof latestLiveUpdate.longitude === 'number' && 
      typeof latestLiveUpdate.latitude === 'number'
    ) {
      logger.debug('[TrackingMap] Follow mode active, flying to vehicle location.');
      map.flyTo({
        center: [latestLiveUpdate.longitude, latestLiveUpdate.latitude],
        zoom: map.getZoom(), // Maintain current zoom level
        speed: 1.2, // Adjust speed as needed for smooth follow
        curve: 1,
        essential: true // Make sure animation completes
      });
    }
  }, [latestLiveUpdate, isFollowingVehicle, isMapLoaded]); // Dependencies trigger re-centering

  // Effect to manage planned route source and layer (Task 9.5.5)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGeometry = staticShipmentDetails?.plannedRouteGeometry; // Assuming this structure

    if (!map || !map.isStyleLoaded() || !isMapLoaded) {
      return; // Map not ready
    }

    const sourceId = 'planned-route-source';
    const layerId = 'planned-route-layer';

    const cleanup = () => {
        try {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
          logger.debug('[TrackingMap] Cleaned up planned route layer/source');
        } catch (e) {
          logger.error('[TrackingMap] Error during planned route cleanup:', e);
        }
    };

    if (routeGeometry && routeGeometry.type === 'LineString' && routeGeometry.coordinates.length > 1) {
        const routeFeature: Feature<GeoJsonPoint | LineString> = {
            type: 'Feature',
            properties: {},
            geometry: routeGeometry
        };
        try {
            const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
            if (!source) {
                map.addSource(sourceId, { type: 'geojson', data: routeFeature });
                logger.debug('[TrackingMap] Added planned-route-source');
            } else {
                source.setData(routeFeature);
                logger.debug('[TrackingMap] Updated planned-route-source data');
            }

            if (!map.getLayer(layerId)) {
                map.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#888', // Grey color
                        'line-width': 3,
                        'line-dasharray': [2, 2], // Dashed line
                        'line-opacity': 0.6
                    }
                });
                logger.debug('[TrackingMap] Added planned-route-layer');
            }
        } catch (e) {
             logger.error('[TrackingMap] Error adding/updating planned route:', e);
        }
    } else {
      // If geometry is invalid or removed, ensure layer/source are cleaned up
      cleanup();
    }

    return cleanup; // Return cleanup function

  }, [staticShipmentDetails?.plannedRouteGeometry, isMapLoaded]); // Depend on geometry and map load state

  // Effect to manage Origin/Destination Markers (Task 9.5.6)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const originCoords = staticShipmentDetails?.originCoords;
    const destinationCoords = staticShipmentDetails?.destinationCoords;

    if (!map || !map.isStyleLoaded() || !isMapLoaded) {
      return; // Map not ready
    }

    const cleanupMarkers = () => {
      try {
        if (originMarkerRef.current) {
          originMarkerRef.current.remove();
          originMarkerRef.current = null;
        }
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.remove();
          destinationMarkerRef.current = null;
        }
        logger.debug('[TrackingMap] Cleaned up origin/destination markers');
      } catch (e) {
        logger.error('[TrackingMap] Error during marker cleanup:', e);
      }
    };

    // Clean up existing markers before potentially adding new ones
    cleanupMarkers();

    try {
      // Add Origin Marker
      if (originCoords && typeof originCoords.lat === 'number' && typeof originCoords.lon === 'number') {
        const originMarker = new mapboxgl.Marker({ color: '#16a34a' }) // Green
          .setLngLat([originCoords.lon, originCoords.lat])
          .addTo(map);
        originMarkerRef.current = originMarker;
        logger.debug('[TrackingMap] Added origin marker');
      } else {
          logger.warn('[TrackingMap] Invalid or missing originCoords, cannot add marker.');
      }

      // Add Destination Marker
      if (destinationCoords && typeof destinationCoords.lat === 'number' && typeof destinationCoords.lon === 'number') {
        const destinationMarker = new mapboxgl.Marker({ color: '#dc2626' }) // Red
          .setLngLat([destinationCoords.lon, destinationCoords.lat])
          .addTo(map);
        destinationMarkerRef.current = destinationMarker;
        logger.debug('[TrackingMap] Added destination marker');
      } else {
          logger.warn('[TrackingMap] Invalid or missing destinationCoords, cannot add marker.');
      }
    } catch (e) {
      logger.error('[TrackingMap] Error adding origin/destination markers:', e);
      // Attempt cleanup again in case of partial success before error
      cleanupMarkers();
    }

    // Return the main cleanup function to be called on unmount or dependency change
    return cleanupMarkers;

  }, [staticShipmentDetails?.originCoords, staticShipmentDetails?.destinationCoords, isMapLoaded]); // Depend on coords and map load

  // --- Render ---
  if (!mapboxToken) {
    return <div className="flex items-center justify-center h-full">Mapbox token is missing.</div>;
  }

  if (mapError) {
    return <div className="flex items-center justify-center h-full text-red-600">Error loading map: {mapError}</div>;
  }

  return (
    <div className={className} style={{ height, width, position: 'relative' }}>
      <Map
        ref={mapRefInternal} // Ref for react-map-gl component instance
        mapboxAccessToken={mapboxToken}
        // Removed initialViewState, let viewState handle updates
        {...viewState} // Spread viewState for controlled map
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12" // Standard Mapbox style
        maxZoom={maxZoom}
        attributionControl={false} // Optional: Hide default attribution
        onLoad={handleMapLoad}
        onError={handleMapError}
        onMove={handleMove}
        // onClick={handleMapClick} // Removed direct onClick, using map.on('click', layerId)
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />

        {/* Markers, Popups, Sources, Layers will be added here based on store state */}
        {/* Example: <Marker longitude={...} latitude={...} /> */}
        {/* Example: <Source id="route" type="geojson" data={...} /> */}
        {/* Example: <Layer {...routeLayer} /> */}

        {/* --- Live Vehicle Source and Layer (Task 9.5.4) --- */}
        {isMapLoaded && (
            <Source
                id="live-vehicle-source"
                type="geojson"
                data={{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        // Initial position (optional, could be null/empty initially)
                        coordinates: latestLiveUpdate && typeof latestLiveUpdate.longitude === 'number' && typeof latestLiveUpdate.latitude === 'number'
                            ? [latestLiveUpdate.longitude, latestLiveUpdate.latitude]
                            : [0, 0] // Default off-screen or handle null case
                    },
                    properties: {}
                }}
            >
                <Layer
                    id="live-vehicle-layer"
                    type="symbol"
                    source="live-vehicle-source" // Link to the source ID
                    layout={{
                        'icon-image': 'truck-icon', // MUST match the ID used in map.addImage or style
                        'icon-size': 0.6,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                        'icon-rotate': (latestLiveUpdate?.heading ?? 0) - 90, // Apply offset here too for initial render
                        'icon-rotation-alignment': 'map'
                    }}
                    // Removed interactive={true} prop as it's not valid and interactivity
                    // is handled by map.on('click', layerId) instead.
                    // interactive={true} 
                />
            </Source>
        )}

        {/* --- Popup Display (Task 9.5.7) --- */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false} // Keep popup open until explicitly closed
            // Optional: Add offset if needed
            // offset={popupOffset} 
          >
            {/* Popup Content - Neurotic Check: Handle nulls gracefully */}
            <div className="text-sm p-1">
              <p><strong>Shipment:</strong> {popupInfo.shipmentId ?? 'N/A'}</p>
              <p><strong>Driver:</strong> {popupInfo.driverName ?? 'N/A'}</p>
              <p><strong>Updated:</strong> {popupInfo.timestamp ? formatTimestamp(popupInfo.timestamp) : 'N/A'}</p>
              <p><strong>Speed:</strong> {popupInfo.speed !== null && popupInfo.speed !== undefined ? formatSpeed(popupInfo.speed) : 'N/A'}</p>
              <p><strong>Heading:</strong> {popupInfo.heading !== null && popupInfo.heading !== undefined ? `${popupInfo.heading.toFixed(0)}°` : 'N/A'}</p>
              <p><strong>Accuracy:</strong> {popupInfo.accuracy !== null && popupInfo.accuracy !== undefined ? `${popupInfo.accuracy.toFixed(0)} m` : 'N/A'}</p>
            </div>
          </Popup>
        )}

      </Map>
      {/* Optional: Overlay elements like loading indicators or error messages based on store state */}
      {subscriptionStatus === 'subscribing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <p className="text-white text-lg">Loading live tracking data...</p>
              {/* Add spinner later if desired */}
          </div>
      )}
      {subscriptionStatus === 'error' && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex flex-col items-center justify-center z-10 p-4">
              <p className="text-white text-lg font-semibold mb-2">Error Subscribing</p>
              <p className="text-white text-center mb-4">{subscriptionError || 'An unknown error occurred.'}</p>
              {/* Add a Retry button that calls store's subscribe action */}
              <button 
                onClick={() => {
                  // Neurotic Check: Ensure we have the necessary details to retry
                  if (trackedShipmentId && staticShipmentDetails) {
                    subscribe(trackedShipmentId, staticShipmentDetails);
                  } else {
                    logger.error("[TrackingMap] Cannot retry subscription: Missing shipmentId or static details.");
                    // Optional: Add user feedback here?
                  }
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-red-900"
              >
                Retry Subscription
              </button>
          </div>
      )}
    </div>
  );
}));

// Set display name for debugging
TrackingMap.displayName = 'TrackingMap'; 

// Helper function placeholders (assuming they exist in utils/formatters.ts)
// Example implementations - adjust as needed:
/*
// utils/formatters.ts
export const formatTimestamp = (ms: number): string => {
  if (!ms) return 'N/A';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatSpeed = (metersPerSecond: number): string => {
  if (metersPerSecond === null || metersPerSecond === undefined) return 'N/A';
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`; // Or convert to mph
};
*/ 