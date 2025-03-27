// ✅ SimulatedVehicleMap.tsx
// Implementation using react-map-gl to simplify marker management and fix visibility issues

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Vehicle, SimulatedVehicle } from '../../types/vehicle';
import { mapManager } from '../../utils/maps/MapManager';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { useMapViewStore } from '../../store/map/useMapViewStore';
import { getMapboxPublicToken } from '../../utils/mapbox-token';
import { 
  VEHICLE_MAP_ID, 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM 
} from '../../utils/maps/constants';
import VehicleMarkerLayer from './VehicleMarkerLayer';
import MapRouteLayer from './MapRouteLayer';
import MapDirectionsLayer from './MapDirectionsLayer';
import styles from './SimulatedVehicleMap.module.css';

// Use type imports to avoid linter errors
type MapRef = import('react-map-gl').MapRef;
type ViewStateChangeEvent = import('react-map-gl').ViewStateChangeEvent;

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
  return ('routeData' in vehicle && 
         (vehicle as any).routeData?.coordinates && 
         Array.isArray((vehicle as any).routeData?.coordinates) &&
         (vehicle as any).routeData?.coordinates.length > 0) &&
         isSimulatedVehicleWithRoute(vehicle);
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
  
  // Initialize mapbox token
  useEffect(() => {
    const token = getMapboxPublicToken(FALLBACK_MAPBOX_TOKEN);
    console.log(`[SimulatedVehicleMap] Using Mapbox token: ${token.substring(0, 9)}...`);
    setMapboxToken(token);
  }, []);
  
  // Register map with map manager when loaded
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || initializedRef.current) return;
    
    console.log(`[SimulatedVehicleMap] Registering map with MapManager (ID: ${VEHICLE_MAP_ID})`);
    
    // Set initialization flag to prevent duplicate registration
    initializedRef.current = true;
    
    // Register map with map manager
    const mapInstance = mapRef.current.getMap();
    mapManager.registerMap(VEHICLE_MAP_ID, mapInstance);
    
    // Update viewport in store
    setViewport({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
    
    // Clean up on unmount
    return () => {
      console.log(`[SimulatedVehicleMap] Unregistering map from MapManager (ID: ${VEHICLE_MAP_ID})`);
      mapManager.unregisterMap(VEHICLE_MAP_ID);
      initializedRef.current = false;
    };
  }, [isMapLoaded, setViewport, viewState.bearing, viewState.latitude, viewState.longitude, viewState.pitch, viewState.zoom]);
  
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
  
  // Handle map load event
  const handleMapLoad = useCallback(() => {
    console.log(`[SimulatedVehicleMap] Map loaded successfully (ID: ${VEHICLE_MAP_ID})`);
    setIsMapLoaded(true);
  }, []);
  
  // Handle map errors
  const handleMapError = useCallback((error: any) => {
    console.error('[SimulatedVehicleMap] Mapbox error:', error);
    setMapLoadError(`Map error: ${error?.message || 'Unknown error'}`);
  }, []);
  
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

  // Filter vehicles with real routes (using the improved hasRealRouteData function)
  const vehiclesWithRealRoutes = useMemo(() => {
    if (!useRealRoutes) return [];
    return vehicles.filter(hasRealRouteData);
  }, [vehicles, useRealRoutes]);
  
  // Render the component
  return (
    <div
      ref={mapContainerRef}
      className={`${styles.mapContainer} ${className || ''} map-container`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        minHeight: '500px', // Ensure minimum height for visibility
        background: '#e5e5e5', // Light gray background to see container bounds
        border: '1px solid #ccc', // Add border to see container
      }}
    >
      {headerContent && (
        <div className={styles.header}>
          {headerContent}
        </div>
      )}
      
      {mapboxToken ? (
        <ReactMapGL
          id={VEHICLE_MAP_ID}
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          {...viewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          attributionControl={attribution}
          interactive={!disableMapBoxInteraction}
          onMove={handleViewStateChange}
          onLoad={handleMapLoad}
          onError={handleMapError}
        >
          {zoomControl && (
            <NavigationControl position="top-right" />
          )}
          
          {isMapLoaded && (
            <>
              {/* Vehicle Markers */}
              <VehicleMarkerLayer
                vehicles={vehicles}
                selectedVehicleId={selectedVehicle?.id}
                onVehicleClick={handleVehicleClick}
                onVehicleHover={handleVehicleHover}
                rotateToMatchBearing={rotateToMatchBearing}
              />
              
              {/* Routes - Choose between simple routes and real-world routes */}
              {enableRoutes && (
                <>
                  {useRealRoutes ? (
                    // Real-world routes from Mapbox Directions API for vehicles with isRealRoute flag
                    vehiclesWithRealRoutes.map(vehicle => (
                      <MapDirectionsLayer
                        key={`directions-${vehicle.id}`}
                        origin={vehicle.route.stops[0]?.location ? 
                          [vehicle.route.stops[0].location.longitude, vehicle.route.stops[0].location.latitude] : 
                          undefined}
                        destination={vehicle.route.stops[1]?.location ?
                          [vehicle.route.stops[1].location.longitude, vehicle.route.stops[1].location.latitude] :
                          undefined}
                        color={vehicle.routeData?.color || '#00FF00'}
                        width={vehicle.routeData?.width || 4}
                        animated={true}
                        pulsing={false} // Disable pulsing to avoid errors
                        showStartEnd={false} // We handle start/end markers separately
                        useMockData={vehicle.routeData?.isRealRoute === false} // Use mock data if not a real route
                      />
                    ))
                  ) : (
                    // Fallback to simple straight-line routes
                    <MapRouteLayer
                      mapId={VEHICLE_MAP_ID}
                      vehicles={vehicles.filter(v => 'route' in v || 'routeData' in v)}
                    />
                  )}
                </>
              )}
              
              {/* Start/End Destination Markers */}
              {routeMarkers}
            </>
          )}
        </ReactMapGL>
      ) : (
        <div className={styles.mapLoadingError}>
          {mapLoadError || 'Loading map...'}
        </div>
      )}
      
      {mapLoadError && (
        <div className={styles.mapLoadingError}>
          {mapLoadError}
          <br />
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#4a80f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          
          <button 
            onClick={() => {
              const map = mapManager.getMap(VEHICLE_MAP_ID);
              if (map) {
                console.log('Map instance:', map);
                console.log('Vehicle count:', vehicles.length);
                console.log('Selected vehicle:', selectedVehicle);
                console.log('View state:', viewState);
                alert('Map diagnostics logged to console');
              }
            }}
            style={{
              padding: '5px 10px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Debug Map
          </button>
        </div>
      )}
    </div>
  );
};

export default SimulatedVehicleMap; 