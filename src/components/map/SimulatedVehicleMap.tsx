// ✅ SimulatedVehicleMap.tsx
// Implementation using react-map-gl to simplify marker management and fix visibility issues

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Vehicle, SimulatedVehicle } from '../../types/vehicle';
import { mapManager } from '../../utils/maps/MapManager';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { useMapViewStore } from '../../store/map/useMapViewStore';
import { getMapboxPublicToken, validateMapboxToken } from '../../utils/mapbox-token';
import { 
  VEHICLE_MAP_ID, 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM 
} from '../../utils/maps/constants';
import VehicleMarkerLayer from './VehicleMarkerLayer';
import MapDirectionsLayer from './MapDirectionsLayer';
import styles from './SimulatedVehicleMap.module.css';

// Use type imports to avoid linter errors
type MapRef = import('react-map-gl').MapRef;
type ViewStateChangeEvent = import('react-map-gl').ViewStateChangeEvent;

// Enhanced vehicle type for components that need route data
interface VehicleWithRoute {
  id: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  };
  route?: {
    start: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    end: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    stops?: Array<{
      latitude: number;
      longitude: number;
      name?: string;
    }>;
  };
}

// Define extended SimulatedVehicle type with routeData property
interface ExtendedSimulatedVehicle extends SimulatedVehicle {
  routeData?: {
    id: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    width: number;
    glow?: boolean;
    isRealRoute?: boolean;
  };
}

// Type guard to check if a vehicle is a SimulatedVehicle with route
function isSimulatedVehicleWithRoute(vehicle: Vehicle): vehicle is ExtendedSimulatedVehicle & { route: NonNullable<SimulatedVehicle['route']> } {
  return 'isSimulated' in vehicle && 
         (vehicle as any).route !== undefined && 
         (vehicle as any).route?.stops !== undefined &&
         Array.isArray((vehicle as any).route?.stops);
}

// Type guard to check if a vehicle has real route data
function hasRealRouteData(vehicle: Vehicle): vehicle is ExtendedSimulatedVehicle & { route: NonNullable<SimulatedVehicle['route']> } {
  if (!vehicle) return false;
  
  // Check for routeData property with coordinates (primary method)
  if ('routeData' in vehicle && 
      (vehicle as any).routeData?.coordinates && 
      Array.isArray((vehicle as any).routeData?.coordinates) &&
      (vehicle as any).routeData?.coordinates.length >= 2) {
    
    // Check all coordinates are valid numbers
    const coords = (vehicle as any).routeData.coordinates;
    const allValid = coords.every((coord: any) => 
      Array.isArray(coord) && 
      coord.length === 2 && 
      typeof coord[0] === 'number' && !isNaN(coord[0]) &&
      typeof coord[1] === 'number' && !isNaN(coord[1])
    );
    
    if (allValid) {
      // Log success for debugging
      console.log(`[SimulatedVehicleMap] Found valid route data for vehicle ${vehicle.id} with ${coords.length} coordinates`);
      return true;
    }
  }
  
  // Fallback to checking for route with stops
  if ('route' in vehicle && 
      (vehicle as any).route?.stops && 
      Array.isArray((vehicle as any).route?.stops) &&
      (vehicle as any).route?.stops.length >= 2) {
    
    // All stops should have valid locations
    const stops = (vehicle as any).route.stops;
    const allValid = stops.every((stop: any) => 
      stop?.location?.latitude !== undefined && 
      stop?.location?.longitude !== undefined &&
      !isNaN(stop.location.latitude) && 
      !isNaN(stop.location.longitude)
    );
    
    if (allValid) {
      console.log(`[SimulatedVehicleMap] Using fallback route data from stops for vehicle ${vehicle.id}`);
      return true;
    }
  }
  
  // No valid route data found
  return false;
}

// Hardcoded valid token as fallback
const FALLBACK_MAPBOX_TOKEN = 'pk.eyJ1IjoiZXNyYXJ1c3RpbiIsImEiOiJjbThnaG9zbGUwaTJwMmtzN3Z2NG52aGFqIn0.YZU4AX-XapN8dwxI79fs0g';

// Safely extract coordinates from DEFAULT_MAP_CENTER
const defaultLongitude = DEFAULT_MAP_CENTER ? DEFAULT_MAP_CENTER.lng : -95.7129;
const defaultLatitude = DEFAULT_MAP_CENTER ? DEFAULT_MAP_CENTER.lat : 37.0902;

// Component interface definition
interface SimulatedVehicleMapProps {
  className?: string;
  enableRoutes?: boolean;
  useRealRoutes?: boolean; // New prop to enable real-world routing
  showDestinationMarkers?: boolean; // New prop to show destination markers
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  disableMapBoxInteraction?: boolean;
  width?: string | number;
  height?: string | number;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  headerContent?: React.ReactNode;
  zoomControl?: boolean;
  attribution?: boolean;
  rotateToMatchBearing?: boolean;
  autoFitBounds?: boolean; // New prop to control auto-fit behavior
}

// Vehicle animation speed options
const SPEED_OPTIONS = [
  { label: 'Slow (1×)', value: 1 },
  { label: 'Normal (5×)', value: 5 },
  { label: 'Fast (10×)', value: 10 },
  { label: 'Very Fast (20×)', value: 20 },
];

// Default to normal speed (more realistic)
const DEFAULT_ANIMATION_SPEED = 5;

// Map component for vehicle tracking simulation using react-map-gl
const SimulatedVehicleMap: React.FC<SimulatedVehicleMapProps> = ({
  className,
  enableRoutes = true, // Changed to true to enable routes by default
  useRealRoutes = true, // Enable real-world routing by default
  showDestinationMarkers = true, // Enable destination markers by default
  onVehicleClick,
  onVehicleHover,
  disableMapBoxInteraction = false,
  width = '100%',
  height = '100%', // Changed from 400px to 100% to fill container
  defaultCenter = [defaultLongitude, defaultLatitude],
  defaultZoom = DEFAULT_MAP_ZOOM,
  headerContent,
  zoomControl = true,
  attribution = false,
  rotateToMatchBearing = false,
  autoFitBounds = false, // Default to false to prevent automatic zooming
}) => {
  // React-map-gl map reference
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef<boolean>(false);
  const initialFitCompleteRef = useRef<boolean>(false); // Track if initial fit has occurred
  
  // State hooks
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [userInteracted, setUserInteracted] = useState<boolean>(false); // Track user map interaction
  const [viewState, setViewState] = useState({
    longitude: defaultCenter[0],
    latitude: defaultCenter[1],
    zoom: defaultZoom,
    bearing: 0,
    pitch: 0
  });
  
  // Add state for animation speed
  const [animationSpeed, setAnimationSpeed] = useState<number>(DEFAULT_ANIMATION_SPEED);
  
  // Debug coordinates conversion
  useEffect(() => {
    console.log('[SimulatedVehicleMap] Using coordinates:', {
      defaultLongitude,
      defaultLatitude,
      viewState: {
        longitude: viewState.longitude,
        latitude: viewState.latitude
      }
    });
  }, []);
  
  // Get unified vehicle store
  const { getFilteredVehicles, vehicles: allVehicles } = useUnifiedVehicleStore();
  const { setViewport } = useMapViewStore();
  
  // Get filtered vehicles and memoize to prevent unnecessary rerenders
  const vehicles = useMemo(() => {
    console.log(`[SimulatedVehicleMap] Fetching filtered vehicles, total in store: ${Object.keys(allVehicles).length}`);
    return getFilteredVehicles() || [];
  }, [getFilteredVehicles, allVehicles]);
  
  // Log vehicle data for debugging
  useEffect(() => {
    console.log(`[SimulatedVehicleMap] Vehicle data update: ${vehicles.length} vehicles available`);
    if (vehicles.length > 0) {
      console.log(`[SimulatedVehicleMap] Sample vehicle:`, vehicles[0]);
    }
  }, [vehicles]);
  
  // Initialize mapbox token with detailed error handling
  useEffect(() => {
    // Initialize mapbox token with detailed error handling
    try {
      const token = getMapboxPublicToken(FALLBACK_MAPBOX_TOKEN);
      
      // Validate token
      const validation = validateMapboxToken(token);
      if (!validation.valid) {
        console.error(`[SimulatedVehicleMap] Invalid Mapbox token: ${validation.reason}`);
        setMapLoadError(`Invalid Mapbox token: ${validation.reason}`);
      } else {
        console.log(`[SimulatedVehicleMap] Using valid Mapbox token: ${token.substring(0, 9)}...`);
        setMapboxToken(token);
      }
    } catch (error) {
      console.error('[SimulatedVehicleMap] Error initializing Mapbox token:', error);
      setMapLoadError('Error initializing map: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, []);
  
  // Handle map load event
  const handleMapLoad = useCallback(() => {
    console.log(`[SimulatedVehicleMap] Map loaded event fired (ID: ${VEHICLE_MAP_ID})`);
    setIsMapLoaded(true);
    console.log(`[SimulatedVehicleMap] isMapLoaded state set to true.`);
  }, []);
  
  // Handle map errors
  const handleMapError = useCallback((error: any) => {
    console.error('[SimulatedVehicleMap] Mapbox error:', error);
    setMapLoadError(`Map error: ${error?.message || 'Unknown error'}`);
  }, []);
  
  // Register map with map manager when loaded
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || initializedRef.current) return;
    
    console.log(`[SimulatedVehicleMap] Attempting to register map with MapManager (ID: ${VEHICLE_MAP_ID})`);
    
    // Register map with map manager
    const mapInstance = mapRef.current.getMap();
    console.log('[SimulatedVehicleMap] mapInstance before registration:', mapInstance);
    
    // Check if mapInstance seems valid
    if (!mapInstance || typeof mapInstance.getCanvas !== 'function') {
      console.error('[SimulatedVehicleMap] Invalid mapInstance detected before registration (getCanvas check failed)!');
      return;
    }
    
    // Set initialization flag to prevent duplicate registration
    initializedRef.current = true;
    mapManager.registerMap(VEHICLE_MAP_ID, mapInstance);
    console.log(`[SimulatedVehicleMap] Map registered successfully.`);
    
    // Clean up on unmount
    return () => {
      console.log(`[SimulatedVehicleMap] Unregistering map from MapManager (ID: ${VEHICLE_MAP_ID})`);
      mapManager.unregisterMap(VEHICLE_MAP_ID);
      initializedRef.current = false;
    };
  }, [isMapLoaded]);
  
  // Handle vehicle selection and click events
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    console.log(`[SimulatedVehicleMap] Vehicle clicked: ${vehicle.id}`);
    setSelectedVehicle(vehicle);
    
    if (onVehicleClick) {
      onVehicleClick(vehicle);
    }
    
    // Fly to vehicle position
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [vehicle.location.longitude, vehicle.location.latitude],
        zoom: 14,
      });
    }
  }, [onVehicleClick]);
  
  // Handle vehicle hover events
  const handleVehicleHover = useCallback((vehicle: Vehicle | null) => {
    if (onVehicleHover) {
      onVehicleHover(vehicle);
    }
  }, [onVehicleHover]);
  
  // Handle map view state changes
  const handleViewStateChange = useCallback((e: ViewStateChangeEvent) => {
    // Mark that user has interacted with the map
    setUserInteracted(true);
    
    setViewState(e.viewState);
    
    // Update viewport in store
    setViewport({
      center: [e.viewState.longitude, e.viewState.latitude],
      zoom: e.viewState.zoom,
      bearing: e.viewState.bearing,
      pitch: e.viewState.pitch
    });
  }, [setViewport]);
  
  // Fit bounds to show all vehicles when vehicles change, but only if:
  // 1. autoFitBounds is true OR we haven't done the initial fit yet
  // 2. User hasn't manually interacted with the map (if not autoFitBounds)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || vehicles.length === 0) return;
    
    // Skip if initial fit is complete and not in autoFitBounds mode and user has interacted
    if (initialFitCompleteRef.current && !autoFitBounds && userInteracted) {
      return;
    }
    
    // Filter vehicles with valid locations
    const validVehicles = vehicles.filter(v => 
      v && v.location && 
      typeof v.location.latitude === 'number' && 
      typeof v.location.longitude === 'number' &&
      !isNaN(v.location.latitude) && !isNaN(v.location.longitude)
    );
    
    if (validVehicles.length === 0) return;
    
    // If we have only one vehicle, center on it
    if (validVehicles.length === 1) {
      const vehicle = validVehicles[0];
      mapRef.current.flyTo({
        center: [vehicle.location.longitude, vehicle.location.latitude],
        zoom: 14
      });
      
      // Mark initial fit as complete
      initialFitCompleteRef.current = true;
      return;
    }
    
    // Calculate bounds from all vehicle locations
    const bounds = validVehicles.reduce(
      (acc, vehicle) => {
        const lng = vehicle.location.longitude;
        const lat = vehicle.location.latitude;
        return {
          minLng: Math.min(acc.minLng, lng),
          maxLng: Math.max(acc.maxLng, lng),
          minLat: Math.min(acc.minLat, lat),
          maxLat: Math.max(acc.maxLat, lat)
        };
      },
      { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
    );
    
    // Add padding
    const padding = 0.1; // 10% padding
    const lngDiff = bounds.maxLng - bounds.minLng;
    const latDiff = bounds.maxLat - bounds.minLat;
    
    // Fit map to bounds
    mapRef.current.fitBounds(
      [
        [bounds.minLng - lngDiff * padding, bounds.minLat - latDiff * padding],
        [bounds.maxLng + lngDiff * padding, bounds.maxLat + latDiff * padding]
      ],
      { padding: 50, maxZoom: 15 }
    );
    
    // Mark initial fit as complete
    initialFitCompleteRef.current = true;
    
  }, [vehicles, isMapLoaded, autoFitBounds, userInteracted]);
  
  // Function to manually fit all vehicles in view (for UI controls)
  const fitAllVehicles = useCallback(() => {
    if (!mapRef.current || !isMapLoaded || vehicles.length === 0) return;
    
    // Filter vehicles with valid locations
    const validVehicles = vehicles.filter(v => 
      v && v.location && 
      typeof v.location.latitude === 'number' && 
      typeof v.location.longitude === 'number' &&
      !isNaN(v.location.latitude) && !isNaN(v.location.longitude)
    );
    
    if (validVehicles.length === 0) return;
    
    // Calculate bounds
    const bounds = validVehicles.reduce(
      (acc, vehicle) => {
        const lng = vehicle.location.longitude;
        const lat = vehicle.location.latitude;
        return {
          minLng: Math.min(acc.minLng, lng),
          maxLng: Math.max(acc.maxLng, lng),
          minLat: Math.min(acc.minLat, lat),
          maxLat: Math.max(acc.maxLat, lat)
        };
      },
      { minLng: 180, maxLng: -180, minLat: 90, maxLat: -90 }
    );
    
    // Add padding
    const padding = 0.1; // 10% padding
    const lngDiff = bounds.maxLng - bounds.minLng;
    const latDiff = bounds.maxLat - bounds.minLat;
    
    // Fit map to bounds
    mapRef.current.fitBounds(
      [
        [bounds.minLng - lngDiff * padding, bounds.minLat - latDiff * padding],
        [bounds.maxLng + lngDiff * padding, bounds.maxLat + latDiff * padding]
      ],
      { padding: 50, maxZoom: 15 }
    );
  }, [vehicles, isMapLoaded]);
  
  // Prepare route markers for start/end points if showDestinationMarkers is true
  const routeMarkers = useMemo(() => {
    if (!showDestinationMarkers || !vehicles || vehicles.length === 0) {
      return null;
    }
    
    // Collect all unique start/end points from vehicles with routes
    const markers: JSX.Element[] = [];
    
    vehicles.forEach(vehicle => {
      if (isSimulatedVehicleWithRoute(vehicle) && vehicle.route.stops.length > 0) {
        // Add start marker
        const startStop = vehicle.route.stops[0];
        markers.push(
          <Marker
            key={`start-${startStop.id}`}
            longitude={startStop.location.longitude}
            latitude={startStop.location.latitude}
          >
            <div 
              className={styles.startMarker}
              title={`Start: ${startStop.location.latitude.toFixed(4)}, ${startStop.location.longitude.toFixed(4)}`}
            >
              <div className={styles.pulseDot}></div>
            </div>
          </Marker>
        );
        
        // Add end marker if there's more than one stop
        if (vehicle.route.stops.length > 1) {
          const endStop = vehicle.route.stops[vehicle.route.stops.length - 1];
          markers.push(
            <Marker
              key={`end-${endStop.id}`}
              longitude={endStop.location.longitude}
              latitude={endStop.location.latitude}
            >
              <div 
                className={styles.endMarker}
                title={`Destination: ${endStop.location.latitude.toFixed(4)}, ${endStop.location.longitude.toFixed(4)}`}
              >
                <div className={styles.pulseDot}></div>
              </div>
            </Marker>
          );
        }
      }
    });
    
    return markers;
  }, [vehicles, showDestinationMarkers, styles.startMarker, styles.endMarker, styles.pulseDot]);

  // Filter vehicles with real routes
  const vehiclesWithRealRoutes = useMemo(() => {
    if (!useRealRoutes) return [];
    return vehicles.filter(hasRealRouteData);
  }, [vehicles, useRealRoutes]);
  
  // Pre-calculate direction layers to avoid type issues
  const directionLayers = useMemo(() => {
    if (!enableRoutes || !useRealRoutes || vehicles.length === 0) {
      return null;
    }

    return vehicles.map(vehicle => {
      // Skip vehicles without location
      if (!vehicle.location) {
        return null;
      }
      
      // Get route data
      const routeData = (vehicle as any).routeData;
      const route = (vehicle as any).route;
      
      // Skip if no route data
      if (!route || !routeData) {
        return null;
      }
      
      // Get start and end coordinates
      let origin: [number, number] | undefined;
      let destination: [number, number] | undefined;
      
      // Get coordinates from routeData if available
      if (routeData.coordinates && routeData.coordinates.length >= 2) {
        origin = routeData.coordinates[0];
        destination = routeData.coordinates[routeData.coordinates.length - 1];
      }
      // Fall back to route stops
      else if (route.stops && route.stops.length >= 2) {
        const startStop = route.stops[0];
        const endStop = route.stops[route.stops.length - 1];
        origin = [startStop.location.longitude, startStop.location.latitude];
        destination = [endStop.location.longitude, endStop.location.latitude];
      }
      
      // Skip if no valid coordinates
      if (!origin || !destination) return null;
            
      return (
        <MapDirectionsLayer
          key={`directions-${vehicle.id}`}
          origin={origin}
          destination={destination}
          color={routeData.color || '#00bfff'}
          width={routeData.width || 4}
          animated={true}
          pulsing={true}
          showStartEnd={showDestinationMarkers}
        />
      );
    }).filter(Boolean);
  }, [enableRoutes, useRealRoutes, vehicles, showDestinationMarkers]);
  
  // Handler for clearing all vehicles
  const handleClearAllVehicles = useCallback(() => {
    const state = useUnifiedVehicleStore.getState();
    const vehicles = state.getFilteredVehicles();
    
    // Remove each vehicle one by one
    vehicles.forEach(vehicle => {
      state.removeVehicle(vehicle.id);
    });
  }, []);
  
  // Handler for changing animation speed
  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
    
    // Update speed in simulation service
    // This will be picked up by the animation loop in SimulationFromShipmentService
    try {
      window.sessionStorage.setItem('vehicle-animation-speed', speed.toString());
      console.log(`[SimulatedVehicleMap] Set animation speed to ${speed}x`);
    } catch (error) {
      console.error('[SimulatedVehicleMap] Failed to save animation speed:', error);
    }
  }, []);
  
  // Log the calculated layers just before rendering
  console.log('[SimulatedVehicleMap] Calculated Layers:', {
    markerLayersCount: routeMarkers?.length ?? 0,
    directionLayersCount: directionLayers?.length ?? 0,
    // Example: Log details of the first direction layer if it exists
    firstDirectionLayerProps: directionLayers?.[0]?.props ?? null,
    // Example: Log details of the first marker layer if it exists
    firstMarkerLayerProps: routeMarkers?.[0]?.props ?? null
  });

  // Render the component
  return (
    <>
      {(() => { 
        console.log('[SimulatedVehicleMap] Rendering - Key Info:', { 
          isMapLoaded, 
          numVehicles: vehicles.length, 
          hasDirectionLayers: !!directionLayers && directionLayers.length > 0,
          // Note: Logging full directionLayers object might be too verbose
        }); 
        return null; 
      })()}
      <div ref={mapContainerRef} className={styles.mapContainer} style={{ width, height }}>
        {headerContent && <div className={styles.header}>{headerContent}</div>}
      
        {mapLoadError && (
          <div className={styles.errorOverlay}>
            <h3>Map Error</h3>
            <p>{mapLoadError}</p>
          </div>
        )}
        
        {mapboxToken && (
          <ReactMapGL
            ref={mapRef}
            mapboxAccessToken={mapboxToken}
            initialViewState={viewState}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            style={{ width: '100%', height: '100%' }}
            onMove={handleViewStateChange}
            onLoad={handleMapLoad}
            onError={handleMapError}
            interactiveLayerIds={disableMapBoxInteraction ? [] : undefined}
            attributionControl={attribution}
          >
            <>
              {/* Direction layers */}
              {directionLayers}
              
              {/* Vehicle markers */}
              <VehicleMarkerLayer
                vehicles={vehicles}
                onVehicleClick={handleVehicleClick}
                onVehicleHover={handleVehicleHover}
                selectedVehicleId={selectedVehicle?.id}
                rotateToMatchBearing={rotateToMatchBearing}
              />
              
              {/* Navigation controls */}
              {zoomControl && (
                <NavigationControl position="top-right" showCompass showZoom />
              )}
              
              {/* Map controls panel */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 1000
              }}>
                {/* Speed control buttons */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  padding: '8px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                    Animation Speed
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {SPEED_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleSpeedChange(option.value)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: animationSpeed === option.value ? '#007BFF' : '#e0e0e0',
                          color: animationSpeed === option.value ? 'white' : 'black',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: animationSpeed === option.value ? 'bold' : 'normal'
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Clear all vehicles button */}
                {vehicles.length > 0 && (
                  <button
                    onClick={handleClearAllVehicles}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f54a4a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    Clear All Vehicles
                  </button>
                )}
              </div>
            </>
          </ReactMapGL>
        )}
      </div>
    </>
  );
};

export default SimulatedVehicleMap; 