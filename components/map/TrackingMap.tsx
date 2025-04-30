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
} from 'react-map-gl/mapbox';
import { useLiveTrackingStore } from '../../lib/store/useLiveTrackingStore'; // Using relative path
import { LiveVehicleUpdate } from '../../types/tracking'; // Using relative path
import { logger } from '../../utils/logger'; // Using relative path
import { Feature, Point as GeoJsonPoint, LineString } from 'geojson'; // Renamed to avoid conflict with React Point
import { Home, Flag, MapPin, Loader2 } from 'lucide-react';
// TODO: Decide if VehicleStatus enum is needed here or if we rely on subscriptionStatus
import { cn } from "../../lib/utils"; // Using relative path
import { formatTimestamp, formatSpeed } from '../../utils/formatters'; // Assume these exist
import ReactDOMServer from 'react-dom/server'; // For rendering icons to string
import { GeoJSONSource } from 'mapbox-gl';
import { LngLatBounds } from 'mapbox-gl';

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
  mapStyle: string; // ADDED: Map style URL
  // ADDED Props for static details (Task 9.R.4)
  originCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  plannedRouteGeometry: GeoJSON.LineString | null;
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
  mapStyle, // Destructure mapStyle
  // Destructure new props
  originCoords,
  destinationCoords,
  plannedRouteGeometry,
}, ref) => {
  // Refs
  const mapRefInternal = useRef<any>(null); // Use any for now to avoid typing issues
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null); // Ref for origin marker
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null); // Ref for destination marker

  // Map State
  const [viewState, setViewState] = useState<Partial<ViewState>>(DEFAULT_CENTER);
  const [mapError, setMapError] = useState<string | null>(null); // Local map init errors
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null); // State for popup
  const [isStale, setIsStale] = useState(false); // Add state for staleness
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Track if the map is loaded

  // Live Tracking Store State
  const {
    trackedShipmentId,
    latestLiveUpdate,
    subscriptionStatus,
    subscriptionError,
    isFollowingVehicle,
    setFollowingVehicle,
  } = useLiveTrackingStore(
    useCallback(state => ({
      trackedShipmentId: state.trackedShipmentId,
      latestLiveUpdate: state.latestLiveUpdate,
      subscriptionStatus: state.subscriptionStatus,
      subscriptionError: state.subscriptionError,
      isFollowingVehicle: state.isFollowingVehicle,
      setFollowingVehicle: state.setFollowingVehicle,
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
      // Get latest update directly from store state
      const currentUpdate = useLiveTrackingStore.getState().latestLiveUpdate;

      if (!map) {
        logger.warn('[TrackingMap.zoomToFit] Map instance not available.');
        return;
      }

      const points: mapboxgl.LngLatLike[] = [];
      // Use currentUpdate from store
      if (currentUpdate && typeof currentUpdate.longitude === 'number' && typeof currentUpdate.latitude === 'number') {
        points.push([currentUpdate.longitude, currentUpdate.latitude]);
      }
      // Use props for origin/dest
      if (originCoords) {
        points.push(originCoords);
      }
      if (destinationCoords) {
        points.push(destinationCoords);
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
      if (useLiveTrackingStore.getState().isFollowingVehicle) {
        setFollowingVehicle(false);
      }
    }
  }), [setFollowingVehicle, originCoords, destinationCoords]); // Add props to dependency array

  // --- Callback Definitions ---

  // Moved handleLayerClick definition here
  const handleLayerClick = useCallback((e: mapboxgl.MapLayerMouseEvent) => {
    // Neurotic Check: Use getState() inside handler to avoid stale closures
    const currentUpdate = useLiveTrackingStore.getState().latestLiveUpdate;

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
      shipmentId: currentUpdate.shipmentId
    });
    logger.debug("[TrackingMap] Popup opened for shipment:", currentUpdate.shipmentId);

  }, []);

  // Callback for general map mouse move (to reset cursor)
  const handleMapMouseMove = useCallback((e: mapboxgl.MapMouseEvent) => {
    const map = mapInstanceRef.current;
    // Neurotic Check: Ensure map and layer exist before querying
    if (!map || !map.getLayer('live-vehicle-layer')) {
        // If layer doesn't exist yet, ensure cursor is default
        if(map) map.getCanvas().style.cursor = ''; 
        return;
    }
    const features = map.queryRenderedFeatures(e.point, { layers: ['live-vehicle-layer'] });
    // Reset cursor if mouse is NOT over the vehicle layer
    map.getCanvas().style.cursor = (features && features.length > 0) ? 'pointer' : '';
  }, []);

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
    
    // Set map loaded state to true
    setIsMapLoaded(true);

    // Add truck icon image
    if (!loadedMap.hasImage('truck-icon')) {
      loadedMap.loadImage(
        '/images/truck-marker.png', // Ensure this path is correct
        (error, image) => {
          if (error) {
             logger.error('[TrackingMap] Error loading truck icon:', error);
             return;
          }
          if (image && !loadedMap.hasImage('truck-icon')) {
             loadedMap.addImage('truck-icon', image, { sdf: false }); // sdf: false for PNG
             logger.debug('[TrackingMap] Truck icon added to map style.');
             // Force a re-render or update the source AFTER icon is loaded if needed
             // This might involve updating state or re-triggering the effect that adds the layer
          } else if (!image) {
              logger.error('[TrackingMap] Truck icon image data is null or undefined after loading.');
          }
        }
      );
    }

    // Initial source/layer setup for planned route (if needed immediately)
    addRouteSourceAndLayer(loadedMap);

    // Initial setup for origin/destination markers (if needed immediately)
    updateOriginDestinationMarkers(loadedMap, originCoords, destinationCoords);

  }, [originCoords, destinationCoords]);

  // Function to add vehicle source and layer (called after icon loaded)
  const addVehicleSourceAndLayer = useCallback((map: mapboxgl.Map) => {
      if (!map || !map.isStyleLoaded()) {
          logger.warn('[TrackingMap.addVehicleSourceAndLayer] Map not ready.');
          return;
      }
      // Add source for live vehicle
      if (!map.getSource('live-vehicle-source')) {
          logger.debug('[TrackingMap] Adding live-vehicle-source');
          map.addSource('live-vehicle-source', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] } // Start empty
          });
      }

      // Add layer for live vehicle icon
      if (!map.getLayer('live-vehicle-layer')) {
          logger.debug('[TrackingMap] Adding live-vehicle-layer');
          map.addLayer({
              id: 'live-vehicle-layer',
              type: 'symbol',
              source: 'live-vehicle-source',
              layout: {
                  'icon-image': 'truck-icon', // Reference the added image
                  'icon-size': 0.75,
                  'icon-rotate': ['get', 'heading'], // Get rotation from feature properties
                  'icon-rotation-alignment': 'map',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true
              }
          });
    
          // Add click listener to the layer
          map.on('click', 'live-vehicle-layer', handleLayerClick);
          // Add mouse move listener for cursor change
          map.on('mousemove', 'live-vehicle-layer', handleMapMouseMove);
          // Reset cursor when leaving the layer
          map.on('mouseleave', 'live-vehicle-layer', handleMapMouseMove); 
      }
  }, [handleLayerClick, handleMapMouseMove]);

  // Function to add planned route source and layer
  const addRouteSourceAndLayer = useCallback((map: mapboxgl.Map) => {
    if (!map || !map.isStyleLoaded()) {
      logger.warn('[TrackingMap.addRouteSourceAndLayer] Map not ready.');
      return;
    }
    // Add source for the planned route
    if (!map.getSource('planned-route-source')) {
        logger.debug('[TrackingMap] Adding planned-route-source');
        map.addSource('planned-route-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] } 
        });
    }
    // Add layer for the planned route
    if (!map.getLayer('planned-route-layer')) {
        logger.debug('[TrackingMap] Adding planned-route-layer');
        map.addLayer({
            id: 'planned-route-layer',
            type: 'line',
            source: 'planned-route-source',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#888', // Grey
                'line-width': 4,
                'line-dasharray': [2, 2] // Dashed line
            }
        });
    }
  }, []);

  // Function to update origin/destination markers
  const updateOriginDestinationMarkers = useCallback((map: mapboxgl.Map, origin: [number, number] | null, destination: [number, number] | null) => {
      if (!map) return;

      // Remove previous markers if they exist
      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      originMarkerRef.current = null;
      destinationMarkerRef.current = null;

      const createMarkerElement = (IconComponent: React.ElementType, color: string) => {
          const el = document.createElement('div');
          el.innerHTML = ReactDOMServer.renderToString(<IconComponent size={32} color={color} />); 
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          return el;
      };

      // Add new origin marker
      if (origin) {
          logger.debug('[TrackingMap] Adding origin marker at:', origin);
          const originEl = createMarkerElement(Home, '#16a34a'); // Green Home icon
          originMarkerRef.current = new mapboxgl.Marker(originEl)
              .setLngLat(origin)
              .addTo(map);
      }

      // Add new destination marker
      if (destination) {
          logger.debug('[TrackingMap] Adding destination marker at:', destination);
          const destEl = createMarkerElement(Flag, '#dc2626'); // Red Flag icon
          destinationMarkerRef.current = new mapboxgl.Marker(destEl)
              .setLngLat(destination)
              .addTo(map);
      }
  }, []);

  // --- Lifecycle Effects ---

  // Effect to handle component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    logger.debug('[TrackingMap] Mounted');
    return () => {
      mountedRef.current = false;
      logger.debug('[TrackingMap] Unmounting');
      // Cleanup map instance on unmount
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      // Clean up markers explicitly
      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
    };
  }, []);

  // Effect to update vehicle source data when latestLiveUpdate changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const source = map?.getSource('live-vehicle-source') as mapboxgl.GeoJSONSource;

    if (!map || !source || !map.isStyleLoaded() || !latestLiveUpdate) {
      // Clear source if no update
      if(source && !latestLiveUpdate) {
          source.setData({ type: 'FeatureCollection', features: [] });
    }
      return;
    }

    // Ensure source and layer are ready (icon might load slightly after map load)
    if (!map.getLayer('live-vehicle-layer') || !map.hasImage('truck-icon')) {
        logger.debug('[TrackingMap] Vehicle layer or icon not ready yet, deferring setData.');
        return; 
    }

    const vehicleFeature: Feature<GeoJsonPoint> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [latestLiveUpdate.longitude, latestLiveUpdate.latitude]
      },
      properties: {
        shipmentId: latestLiveUpdate.shipmentId,
        heading: latestLiveUpdate.heading ?? 0, // Provide default heading
        timestamp: latestLiveUpdate.timestamp
        // Add other properties if needed for popups or styling
      }
    };

    logger.debug('[TrackingMap] Setting vehicle source data:', vehicleFeature);
    source.setData({ type: 'FeatureCollection', features: [vehicleFeature] });

    // Handle follow mode
    if (isFollowingVehicle) {
      logger.debug('[TrackingMap] Following vehicle, panning to:', vehicleFeature.geometry.coordinates);
      map.panTo(vehicleFeature.geometry.coordinates as mapboxgl.LngLatLike, { duration: 500 }); // Smooth pan
    }

  }, [latestLiveUpdate, isFollowingVehicle, isMapLoaded]); // Depend on isMapLoaded

  // Effect to update planned route when prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const source = map?.getSource('planned-route-source') as mapboxgl.GeoJSONSource;
    if (map && source && map.isStyleLoaded()) {
      logger.debug('[TrackingMap] Updating planned route geometry:', plannedRouteGeometry);
      // Update source data based on whether geometry exists
      const newData = plannedRouteGeometry
        ? { type: 'Feature', geometry: plannedRouteGeometry, properties: {} }
        : { type: 'FeatureCollection', features: [] }; // Use empty FeatureCollection if null
      source.setData(newData as any); // Use type assertion if needed by mapbox types
    }
  }, [plannedRouteGeometry, isMapLoaded]); // Depend on prop and map load state

  // Effect to update origin/destination markers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
      if (map && isMapLoaded) {
          logger.debug('[TrackingMap] Updating origin/destination markers based on props.');
          updateOriginDestinationMarkers(map, originCoords, destinationCoords);
      }
      // Cleanup function to remove markers if props become null or component unmounts
      return () => {
          if(mapInstanceRef.current){
            originMarkerRef.current?.remove();
            destinationMarkerRef.current?.remove();
            }
      }
  }, [originCoords, destinationCoords, isMapLoaded, updateOriginDestinationMarkers]); // Depend on props, load state, and callback

  // Effect to check for staleness (same as in TrackingPageView)
  useEffect(() => {
    const STALE_THRESHOLD_MS = 30000; // 30 seconds
    let staleCheckTimer: NodeJS.Timeout | null = null;

    const checkStaleness = () => {
        let currentIsStale = false;
        const currentUpdate = useLiveTrackingStore.getState().latestLiveUpdate; // Check latest store state
        if (currentUpdate && typeof currentUpdate.timestamp === 'number') {
            const timeDiff = Date.now() - currentUpdate.timestamp;
            currentIsStale = timeDiff > STALE_THRESHOLD_MS;
      } else {
            currentIsStale = false; // Not stale if no update exists
        }
        if (mountedRef.current) { // Check if component is still mounted
            setIsStale(currentIsStale);
        }
    };

    checkStaleness(); // Initial check

    // Periodically check even if no new updates arrive
    staleCheckTimer = setInterval(checkStaleness, 5000); // Check every 5 seconds

    return () => {
      if (staleCheckTimer) {
        clearInterval(staleCheckTimer);
    }
    };
  }, [latestLiveUpdate]); // Re-run if latestLiveUpdate changes

  // Effect to handle subscription errors visually
  useEffect(() => {
    if (subscriptionStatus === 'error') {
      // Maybe show an overlay or border?
      logger.error(`[TrackingMap] Subscription error detected: ${subscriptionError}`);
      // Display handled by TrackingPageView now
    }
  }, [subscriptionStatus, subscriptionError]);

  // --- Render Component ---
  return (
    <div className={cn("relative", className)} style={{ height, width }}>
      {/* Loading / Error States Handled by Parent (TrackingPageView) */}
      {/* Render Map */}
      <Map
        ref={mapRefInternal}
        mapboxAccessToken={mapboxToken}
        initialViewState={DEFAULT_CENTER}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        maxZoom={maxZoom}
        onLoad={handleMapLoad}
        onError={(e: ErrorEvent) => {
            logger.error("[TrackingMap] Mapbox GL Error:", e.error);
            setMapError(e.error.message || 'Map failed to load');
        }}
        onMove={disableFollowMode} // Disable follow on manual move
        onZoom={disableFollowMode} // Disable follow on manual zoom
        onRotate={disableFollowMode} // Disable follow on manual rotate
        onPitchStart={disableFollowMode}
        onDragStart={disableFollowMode}
        onMouseMove={handleMapMouseMove}
        onClick={handleLayerClick}
        interactiveLayerIds={['live-vehicle-layer']}
        reuseMaps // Important for performance with multiple map instances if needed elsewhere
      >
        <NavigationControl position="top-right" />

        {/* Vehicle Source and Layer are added via effects */}
        {isMapLoaded && (
           <Source
             id="live-vehicle-source"
             type="geojson"
             data={{
               type: 'FeatureCollection',
               features: latestLiveUpdate ? [{
                 type: 'Feature',
                 geometry: {
                   type: 'Point',
                   coordinates: [latestLiveUpdate.longitude, latestLiveUpdate.latitude]
                 },
                 properties: {
                   shipmentId: latestLiveUpdate.shipmentId,
                   heading: latestLiveUpdate.heading ?? 0,
                   timestamp: latestLiveUpdate.timestamp
                 }
               }] : []
             }}
           >
             <Layer
               id="live-vehicle-layer"
               type="symbol"
               source="live-vehicle-source" // Link to source id
               layout={{
                 'icon-image': 'truck-icon', // Reference the added image
                 'icon-size': 0.75,
                 'icon-rotate': ['get', 'heading'], // Get rotation from feature properties
                 'icon-rotation-alignment': 'map',
                 'icon-allow-overlap': true,
                 'icon-ignore-placement': true
               }}
             />
           </Source>
        )}

        {/* Planned Route Source and Layer */} 
        {isMapLoaded && plannedRouteGeometry && (
          <Source
            id="planned-route-source"
            type="geojson"
            data={{ type: 'Feature', geometry: plannedRouteGeometry, properties: {} }}
          >
             <Layer
                id="planned-route-layer"
                type="line"
                source="planned-route-source" // Link to source id
                layout={{
                    'line-join': 'round',
                    'line-cap': 'round'
                }}
                paint={{
                    'line-color': '#888', // Grey
                    'line-width': 4,
                    'line-dasharray': [2, 2] // Dashed line
                }}
            />
          </Source>
        )}

        {/* Origin Marker */} 
        {isMapLoaded && originCoords && (
           <Marker longitude={originCoords[0]} latitude={originCoords[1]} anchor="center">
             <Home size={32} color="#16a34a" />
           </Marker>
        )}
        
        {/* Destination Marker */} 
        {isMapLoaded && destinationCoords && (
           <Marker longitude={destinationCoords[0]} latitude={destinationCoords[1]} anchor="center">
             <Flag size={32} color="#dc2626" />
           </Marker>
        )}

        {/* Popup Display */} 
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false} // Keep open even if map clicked elsewhere
            anchor="bottom"
            offset={25}
          >
            <div className="text-xs p-1">
              <p><strong>Shipment:</strong> {popupInfo.shipmentId || 'N/A'}</p>
              {popupInfo.timestamp && <p><strong>Updated:</strong> {formatTimestamp(popupInfo.timestamp)}</p>}
              {popupInfo.speed !== null && popupInfo.speed !== undefined && <p><strong>Speed:</strong> {formatSpeed(popupInfo.speed)}</p>}
              {popupInfo.heading !== null && popupInfo.heading !== undefined && <p><strong>Heading:</strong> {Math.round(popupInfo.heading)}&deg;</p>}
              {popupInfo.accuracy !== null && popupInfo.accuracy !== undefined && <p><strong>Accuracy:</strong> {popupInfo.accuracy.toFixed(1)} m</p>}
            </div>
          </Popup>
        )}
      </Map>
       {/* Display local map errors */} 
      {mapError && (
        <div className="absolute top-2 left-2 bg-red-100 text-red-700 p-2 rounded shadow-md text-xs z-10">
            Map Error: {mapError}
          </div>
      )}
       {/* Stale data indicator (Optional visual cue on map itself) */} 
       {isStale && subscriptionStatus === 'active' && (
          <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 p-1 px-2 rounded shadow-md text-xs z-10">
              ⚠️ Live data is stale
          </div>
      )}
       {/* Loading indicator for subscription */} 
       {subscriptionStatus === 'subscribing' && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
       )}

    </div>
  );
}));

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