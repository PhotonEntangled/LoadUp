import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import Map, { NavigationControl, ViewState, ViewStateChangeEvent, ErrorEvent, MapEvent, Marker, Source, Layer, Popup } from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';
import useSimulationStore, { SimulationState } from '../../lib/store/useSimulationStore';
import { SimulatedVehicle, VehicleStatus } from '../../types/vehicles';
import { logger } from '../../utils/logger';
import { Feature, LineString } from 'geojson';

// Comment out imports from missing packages/shared
// import { useMapStore } from '../../../../packages/shared/src/store/mapStore';
// import { Vehicle, VehicleType } from '../../../../packages/shared/src/types/shipment-tracking';
// import MapboxMap from '../../../../packages/shared/src/components/MapboxMap';
// import MapboxMarker from '../../../../packages/shared/src/components/MapboxMarker';

// TEMP: Use dummy types until we integrate types/vehicles and store
// type Vehicle = any; 
// type VehicleType = string;

// Types for filter options
export interface VehicleFilters {
  types: string[]; // TEMP: Use string for now
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}

// export interface VehicleLocationUpdate { ... } // Keep if needed later

export interface FleetOverviewMapProps {
  className?: string;
  // initialVehicles?: Vehicle[]; // Comment out for now
  // onVehicleClick?: (vehicle: Vehicle) => void; // Comment out for now
  // onVehicleHover?: (vehicle: Vehicle | null) => void; // Comment out for now
  // refreshInterval?: number; // Comment out for now
  showFilters?: boolean;
  height?: string | number;
  width?: string | number;
  maxZoom?: number;
  onError?: (error: Error) => void;
}

const DEFAULT_CENTER = { latitude: 3.1390, longitude: 101.6869, zoom: 11 }; // Default center (Kuala Lumpur)

/**
 * FleetOverviewMap component - Shows all vehicles on a map with filtering options
 * Used in admin dashboard for fleet management
 */
export const FleetOverviewMap = React.memo(({
  className = '',
  // initialVehicles = [],
  // onVehicleClick,
  // onVehicleHover,
  // refreshInterval = 5000,
  showFilters = false, // Default to false for now
  height = '600px',
  width = '100%',
  maxZoom = 18,
  onError,
}: FleetOverviewMapProps) => {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);
  // const lastBoundsUpdateRef = useRef<number>(0); // Related to bounds update
  // const prevFilteredVehiclesCountRef = useRef<number>(0); // Related to bounds update

  // --- Map State ---
  const [viewState, setViewState] = useState<Partial<ViewState>>(DEFAULT_CENTER);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Keep this for marker logic later

  // Local state (Commented out for now - related to filters/selection)
  // const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  // const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  // const [filters, setFilters] = useState<VehicleFilters>({ ... });
  // const [error, setError] = useState<Error | null>(null); // Use mapError

  // --- Get state and actions from Simulation Store ---
  const vehicles = useSimulationStore((state: SimulationState) => state.vehicles);
  const selectedVehicleId = useSimulationStore((state: SimulationState) => state.selectedVehicleId);
  const setSelectedVehicleId = useSimulationStore((state) => state.setSelectedVehicleId);
  // State for managing the popup
  const [popupInfo, setPopupInfo] = useState<SimulatedVehicle | null>(null);

  // Convert vehicles object to array for easier mapping
  const vehicleList = useMemo(() => Object.values(vehicles) as SimulatedVehicle[], [vehicles]);
  const selectedVehicle = useMemo(() => selectedVehicleId ? vehicles[selectedVehicleId] : null, [selectedVehicleId, vehicles]);

  // Get the route for the selected vehicle
  const selectedVehicleRoute = useMemo(() => {
    if (!selectedVehicleId || !vehicles[selectedVehicleId]) {
        return null;
    }
    // Ensure the route is a valid Feature<LineString>
    const route = vehicles[selectedVehicleId].route;
    if (route && route.type === 'Feature' && route.geometry?.type === 'LineString') {
        return route as Feature<LineString>; // Cast to be sure
    }
    logger.warn('Selected vehicle route is invalid or missing', { selectedVehicleId });
    return null;
}, [selectedVehicleId, vehicles]);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      setIsMapLoading(true);
      setMapError(null);
      try {
        const response = await fetch('/api/mapbox-token');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch Mapbox token');
        }
        const data = await response.json();
        if (!data.token) {
          throw new Error('Mapbox token not found in API response');
        }
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        const message = err instanceof Error ? err.message : 'Failed to load map token';
        setMapError(message);
        if (onError) onError(new Error(message));
      } finally {
        setIsMapLoading(false);
      }
    };
    fetchToken();
  }, [onError]);

  // Mounted ref cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // --- Comment out Filter/Bounds Logic --- 
  // const filteredVehicles = useMemo(() => { ... });
  // const updateMapBounds = useCallback(() => { ... });
  // useEffect(() => { /* Bounds update trigger */ }, ...);
  // const updateTypeFilter = useCallback(() => { ... });
  // const updateStatusFilter = useCallback(() => { ... });
  // const updateSearchFilter = useCallback(() => { ... });

  // --- Map Interaction Logic --- 
  // SPECIFICATION FOR V0: Map Interactions
  // 1. Zoom-to-Route: When a vehicle is selected OR initially loaded, 
  //    the map viewport should automatically adjust (fitBounds) to show the 
  //    entire route geometry. Padding should be applied.
  // 2. Follow-Vehicle Mode (Optional): Implement a toggle control (outside the map component, likely on the page).
  //    When active AND a vehicle is selected AND simulation is running,
  //    the map should smoothly pan (`flyTo` or `panTo`) to keep the selected vehicle centered.
  // --- END SPECIFICATION ---

  // Effect to fit bounds when the selected vehicle's route changes
  useEffect(() => {
      if (mapRef.current && selectedVehicleRoute && isMapLoaded) { // Ensure map is loaded
          try {
              // Calculate bounding box from the route geometry
              const bounds = turf.bbox(selectedVehicleRoute.geometry);
              
              // Check for valid bounds (turf.bbox might return [-Infinity, -Infinity, Infinity, Infinity] for point/empty)
              if (bounds && bounds.length === 4 && isFinite(bounds[0]) && isFinite(bounds[1]) && isFinite(bounds[2]) && isFinite(bounds[3])) {
                  logger.debug('Fitting map bounds to selected route', { bounds });
                  mapRef.current.fitBounds(bounds as LngLatBoundsLike, {
                      padding: 60, // Simplified padding
                      duration: 1000, 
                      maxZoom: 15 
                  });
              } else {
                  logger.warn('Could not calculate valid bounds for selected route geometry', { selectedVehicleId });
                  // Optionally fly to the vehicle's start point if bounds fail?
                  // const startCoords = selectedVehicleRoute.geometry.coordinates[0];
                  // mapRef.current.flyTo({ center: startCoords, zoom: 14 });
              }
          } catch (error) {
              logger.error('Error calculating or fitting bounds:', error);
          }
      }
  }, [selectedVehicleRoute, isMapLoaded]); // Dependencies

  // TODO: Add effect for Follow-Vehicle mode if implementing prototype logic here.
  // It would likely depend on `isSimulationRunning`, `selectedVehicleId`, and potentially 
  // the vehicle's `currentPosition` from the store, triggering `mapRef.current.panTo(...)`.

  // --- Event Handlers --- 
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    if (mountedRef.current) {
      setViewState(evt.viewState);
    }
  }, []);

  const handleMapLoad = useCallback((evt: MapEvent) => {
    if (mountedRef.current) {
      mapRef.current = evt.target;
      setIsMapLoaded(true);
      logger.info('[FleetOverviewMap] Map loaded successfully');
      // Potentially fit bounds to initial vehicle if one is pre-selected/loaded?
    }
  }, []);

  const handleMapErrorInternal = useCallback((evt: ErrorEvent) => {
      logger.error('Map error:', evt.error);
      if (mountedRef.current) {
        // Construct a proper error object if needed, or handle ErrorLike
        const errorToReport = evt.error instanceof Error ? evt.error : new Error(evt.error?.message || 'Unknown map error');
        setMapError(errorToReport.message);
        if (onError) onError(errorToReport);
      }
  }, [onError]);

  // Updated handler for marker click to manage popup
  const handleMarkerClick = useCallback((vehicle: SimulatedVehicle) => {
      logger.debug('Marker clicked', { vehicleId: vehicle.id });
      setSelectedVehicleId(vehicle.id); // Update selected state in store
      setPopupInfo(vehicle); // Set vehicle data for popup display
      // TODO: Add logic to potentially fly map to the selected marker (Phase 3.2 Spec)
  }, [setSelectedVehicleId]);

  // Handler to close the popup
  const handlePopupClose = useCallback(() => {
      setPopupInfo(null);
      // Optionally deselect vehicle when popup closes, or keep it selected
      // setSelectedVehicleId(null); 
  }, []);

  // --- Marker Rendering Logic --- 
  const markers = useMemo(() => {
      if (!isMapLoaded) return null;
      logger.debug('Rendering markers for vehicles:', { count: vehicleList.length });

      // --- SPECIFICATION FOR V0 MARKER GENERATION ---
      // 1. Icon: Use a truck icon (e.g., Font Awesome truck, or an SVG).
      // 2. Rotation: Rotate the icon based on `vehicle.bearing`.
      // 3. Color Coding: Apply background/border color based on `vehicle.status`:
      //    - Idle: Gray (e.g., bg-gray-500)
      //    - En Route: Blue (e.g., bg-blue-500)
      //    - At Pickup: Orange (e.g., bg-orange-500) - Not used yet
      //    - At Dropoff: Green (e.g., bg-green-500)
      //    - Error: Red (e.g., bg-red-600)
      // 4. Selection: Indicate selection (e.g., larger size, different border color) when `vehicle.id === selectedVehicleId`.
      // --- END SPECIFICATION ---

      return (vehicleList).map((vehicle: SimulatedVehicle) => {
          if (!vehicle.currentPosition?.geometry?.coordinates) {
              logger.warn('Vehicle missing position data for marker', { vehicleId: vehicle.id });
              return null;
          }
          const [longitude, latitude] = vehicle.currentPosition.geometry.coordinates;

          // --- Basic Prototype Color Logic --- 
          let markerBgColor = 'bg-gray-400'; // Default/Idle
          switch (vehicle.status) {
              case 'En Route': markerBgColor = 'bg-blue-500'; break;
              case 'At Dropoff': markerBgColor = 'bg-green-500'; break;
              case 'Error': markerBgColor = 'bg-red-600'; break;
              // Add 'At Pickup' case later if needed
          }
          const isSelected = selectedVehicleId === vehicle.id;

          return (
              <Marker
                  key={vehicle.id}
                  longitude={longitude}
                  latitude={latitude}
                  anchor="bottom"
                  // Add rotation based on bearing later if needed for prototype
                  // rotation={vehicle.bearing}
                  onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(vehicle); // Pass the whole vehicle object
                  }}
              >
                  {/* Basic Prototype Marker Styling */}
                  <div 
                     className={`w-6 h-6 rounded-full border-2 shadow cursor-pointer flex items-center justify-center 
                                ${markerBgColor} 
                                ${isSelected ? 'border-yellow-400 scale-110' : 'border-white'}`}
                     style={{ transform: `rotate(${vehicle.bearing}deg)` }} // Basic rotation prototype
                  >
                      {/* Replace with actual icon later based on spec */}
                      <span className="text-white text-xs font-bold">T</span> 
                  </div>
              </Marker>
          );
      });
  // Dependencies updated to include selectedVehicleId for styling
  }, [isMapLoaded, vehicleList, handleMarkerClick, selectedVehicleId]);

  // --- Route Layer Definition --- 
  const routeLayerStyle: mapboxgl.LineLayer = {
    id: 'route-line',
    type: 'line',
    source: 'route-source', // Matches the Source ID
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be', // Blue color for the route
      'line-width': 5,
      'line-opacity': 0.75
    }
  };

  // --- Render Logic --- 
  if (isMapLoading) {
    return <div className="flex items-center justify-center h-full">Loading map token...</div>;
  }

  if (mapError || !mapboxToken) {
    return (
      <div className="flex items-center justify-center bg-red-100 text-red-800 p-4 h-full rounded-md">
        <div>
          <h3 className="font-bold">Error loading map</h3>
          <p>{mapError || 'Failed to load Mapbox token'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fleet-overview-map ${className} relative`} style={{ height, width }}>
      {/* Render react-map-gl Map */} 
      <Map
        {...viewState}
        onMove={handleViewStateChange}
        onLoad={handleMapLoad}
        onError={handleMapErrorInternal}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12" // Example style
        mapboxAccessToken={mapboxToken}
        maxZoom={maxZoom}
        // Pass mapRef for potential direct manipulation if needed later
        ref={(instance) => { if (instance) mapRef.current = instance.getMap(); }}
      >
        <NavigationControl position="top-right" />
        
        {/* Render the markers */}
        {markers}

        {/* Render Route Source and Layer if a route is selected */} 
        {selectedVehicleRoute && (
          <Source id="route-source" type="geojson" data={selectedVehicleRoute}> 
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* --- SPECIFICATION FOR V0 POPUP GENERATION --- */}
        {/* Popup should display when a marker is clicked (managed by popupInfo state). */} 
        {/* Required Fields from popupInfo (SimulatedVehicle): */} 
        {/* - id */} 
        {/* - shipmentId */} 
        {/* - status */} 
        {/* - driverName (Optional) */} 
        {/* - truckId (Optional) */} 
        {/* --- END SPECIFICATION --- */}

        {/* --- Basic Prototype Popup --- */} 
        {popupInfo && (
             <Popup
                anchor="top" 
                longitude={popupInfo.currentPosition.geometry.coordinates[0]}
                latitude={popupInfo.currentPosition.geometry.coordinates[1]}
                onClose={handlePopupClose}
                closeOnClick={false} // Keep open until explicitly closed
             >
                <div>
                   <h4 className="font-bold text-sm mb-1">Vehicle Info (Prototype)</h4>
                   <p className="text-xs">ID: {popupInfo.id}</p>
                   <p className="text-xs">Status: {popupInfo.status}</p>
                   {/* Add other fields here later for spec validation if needed */}
                </div>
             </Popup>
        )}

      </Map>
      
      {/* TODO: Add filter UI back later */} 
      {/* {showFilters && ( ... filter UI div ... )} */} 

      {/* TODO: Render selected vehicle details panel later */} 
    </div>
  );
});

FleetOverviewMap.displayName = 'FleetOverviewMap';

// --- Comment out internal marker components for now --- 
// const VehicleMarkers = React.memo(({ ... }) => { ... });
// const VehicleMarker = React.memo(({ ... }) => { ... }); 