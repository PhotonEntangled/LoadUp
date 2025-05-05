"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle, useContext } from 'react';
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
  Popup
} from 'react-map-gl/mapbox';
import { useSimulationStoreContext } from '@/lib/store/useSimulationStoreContext';
import { SimulationStoreContext } from '@/lib/context/SimulationStoreContext';
import { SimulationStoreApi } from '@/lib/store/useSimulationStore';
import { SimulatedVehicle } from '../../types/vehicles'; // Assuming types/vehicles.ts exists
import { logger } from '../../utils/logger';
import { Feature, LineString } from 'geojson';
import { Home, Flag } from 'lucide-react'; // Remove Truck import
import { VehicleStatus } from '../../types/vehicles'; // Import status type
import { cn } from "@/lib/utils"; // ADDED cn utility import

// Define potential methods to expose via the ref
export interface SimulationMapRef {
  getMap: () => mapboxgl.Map | null;
  triggerResize: () => void;
}

// Props definition for the SimulationMap
export interface SimulationMapProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  maxZoom?: number;
  onError?: (error: Error) => void;
}

const DEFAULT_CENTER = { latitude: 3.1390, longitude: 101.6869, zoom: 11 }; // Default center (Kuala Lumpur)

// Helper function to get status color
const getStatusColor = (status: VehicleStatus): string => {
  switch (status) {
    case 'Idle': return '#9CA3AF'; // gray-400
    case 'En Route': return '#3B82F6'; // blue-500
    case 'Pending Delivery Confirmation': return '#EAB308'; // yellow-500
    case 'Completed': return '#22C55E'; // green-500
    case 'Error': return '#DC2626'; // red-600
    default: return '#9CA3AF'; // Default gray-400
  }
};

/**
 * SimulationMap component - Renders the interactive map for vehicle simulation.
 * Displays simulated vehicles, routes, and handles user interactions.
 */
// Use forwardRef to allow parent components to get the map instance
export const SimulationMap = React.memo(forwardRef<SimulationMapRef, SimulationMapProps>(({
  className = '',
  height = '100%', // Default to full height
  width = '100%', // Default to full width
  maxZoom = 18,
  onError,
}, ref) => {
  // Refs
  const mapInstanceRefInternal = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);

  // --- ADDED: Get storeApi at the top level ---
  const storeApi = useContext(SimulationStoreContext);

  // Expose methods via the passed ref
  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRefInternal.current,
    triggerResize: () => {
      if (mapInstanceRefInternal.current?.resize) {
        mapInstanceRefInternal.current.resize();
        logger.debug('[SimulationMap] Externally triggered resize()');
      } else {
        logger.warn('[SimulationMap] TriggerResize called, but map or resize method not available.');
      }
    }
  }), []); // Empty dependency array ensures the ref object doesn't change

  // Map State
  const [viewState, setViewState] = useState<Partial<ViewState>>(DEFAULT_CENTER);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Mapbox GL instance loaded state

  // Simulation Store State via Context Hook (Selectors)
  const {
    vehicles,
    selectedVehicleId,
    isFollowingVehicle
  } = useSimulationStoreContext((state: SimulationStoreApi) => ({
    vehicles: state.vehicles,
    selectedVehicleId: state.selectedVehicleId,
    isFollowingVehicle: state.isFollowingVehicle
  }));

  const selectedVehicle = useMemo(() => selectedVehicleId ? vehicles[selectedVehicleId] : null, [selectedVehicleId, vehicles]);
  const originCoords = useMemo(() => selectedVehicle?.originCoordinates, [selectedVehicle]);
  const destinationCoords = useMemo(() => selectedVehicle?.destinationCoordinates, [selectedVehicle]);
  const selectedVehicleRoute = useMemo(() => {
      if (!selectedVehicle?.route) {
          return null;
      }
      if (selectedVehicle.route.type === 'Feature' && selectedVehicle.route.geometry?.type === 'LineString') {
        return selectedVehicle.route as Feature<LineString>;
      }
      logger.warn('Selected vehicle route is invalid or missing geometry type', { selectedVehicleId, routeType: selectedVehicle.route.type, geometryType: selectedVehicle.route.geometry?.type });
      return null;
  }, [selectedVehicle, selectedVehicleId]);

  // RE-ADD useMemo for vehicleList if needed by Marker logic
  const vehicleList = useMemo(() => Object.values(vehicles), [vehicles]);

  // --- Constants for Colors ---
  const ROUTE_GREEN = '#16A34A'; // Tailwind Green-600 (Bolder)
  const ROUTE_GREY = '#9CA3AF'; // Tailwind Gray-400 (Lighter for visibility)
  const STROBE_COLOR = '#FFFFFF'; // White

  // --- Effects ---

  // Mounted ref for cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      logger.debug('SimulationMap unmounted');
    };
  }, []);

  // Effect to center map on the selected vehicle's STARTING position when selected
  useEffect(() => {
    // Check if map instance and essential vehicle data are ready
    if (!mapInstanceRefInternal.current || !selectedVehicle || !isMapLoaded) {
      // logger.debug('[Map Center Effect] Skipping: Map, selected vehicle, or map loaded state not ready.');
      return;
    }

      const map = mapInstanceRefInternal.current;
    const vehiclePosition = selectedVehicle.currentPosition;
    const vehicleStatus = selectedVehicle.status;

    // --- ADDED CHECK: Prevent flyTo for invalid states/positions ---
    if (
      vehicleStatus === 'AWAITING_STATUS' ||
      !vehiclePosition ||
      !vehiclePosition.geometry ||
      !Array.isArray(vehiclePosition.geometry.coordinates) ||
      vehiclePosition.geometry.coordinates.length !== 2 ||
      // Basic check for valid, finite numbers
      vehiclePosition.geometry.coordinates.some(coord => typeof coord !== 'number' || !isFinite(coord))
    ) {
      logger.warn(`[Map Center Effect] Skipping flyTo for vehicle ${selectedVehicle.id}. Status: ${vehicleStatus} or Position invalid:`, { position: vehiclePosition });
      return; // Do not proceed with flyTo
    }
    // --- END ADDED CHECK ---

    // If checks pass, proceed with flying to the vehicle's position
    const [longitude, latitude] = vehiclePosition.geometry.coordinates;
    // const currentZoom = map.getZoom(); // Not currently used
      const targetZoom = 15; // Desired initial zoom level

    logger.info(`[Map Center Effect] Flying to vehicle ${selectedVehicle.id} position:`, { longitude, latitude, targetZoom });

      // Use flyTo for a smoother transition
      map.flyTo({
        center: [longitude, latitude],
        zoom: targetZoom,
        duration: 1500, // Adjust duration as needed
        essential: true // Ensures animation completes
      });

    // Original check for position existence was here, moved earlier.
    // } else {
    //   // Log if position data is missing but vehicle is selected (should be handled by the check above now)
    //   if (selectedVehicle) {
    //       logger.warn(`[Map Center Effect] Selected vehicle ${selectedVehicle.id} has no currentPosition data.`);
    //   }
    // }
    // Removed the empty else block
  }, [selectedVehicleId, isMapLoaded]); // <<< REMOVED selectedVehicle dependency

  // *** NEW Effect 1: Manage Route Source & Layer Existence ***
  useEffect(() => {
    const map = mapInstanceRefInternal.current;
    if (!map || !map.isStyleLoaded() || !isMapLoaded) {
      return;
    }

    const cleanup = () => {
        try {
          if (map.getLayer('route-line')) map.removeLayer('route-line');
          if (map.getSource('route-source')) map.removeSource('route-source');
        } catch (e) {
          logger.error('[Route Source/Layer Effect] Error during cleanup:', e);
        }
    };

    if (selectedVehicleRoute) {
      try {
        if (!map.getSource('route-source')) {
          map.addSource('route-source', { type: 'geojson', data: selectedVehicleRoute, lineMetrics: true });
        } else {
          (map.getSource('route-source') as mapboxgl.GeoJSONSource).setData(selectedVehicleRoute);
        }

        if (!map.getLayer('route-line')) {
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-source',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': ROUTE_GREY, // Initial color, gradient applied in separate effect
              'line-width': 5,
              'line-opacity': 0.8,
              // Set initial gradient here to avoid style validation errors, but it will be overwritten
              'line-gradient': ['step', ['line-progress'], ROUTE_GREEN, 0, ROUTE_GREY]
            }
          });
        }
      } catch (e) {
        logger.error('[Route Source/Layer Effect] Error adding source/layer:', e);
        cleanup(); // Attempt cleanup on error
      }
    } else {
      cleanup();
    }

    // Return the cleanup function to run when dependencies change or component unmounts
    return cleanup;

  }, [selectedVehicleId, selectedVehicleRoute, isMapLoaded]);


  // *** NEW Effect 2: Update Route Gradient ***
  useEffect(() => {
    const map = mapInstanceRefInternal.current;
    if (!map || !map.isStyleLoaded() || !isMapLoaded || !selectedVehicle || !map.getLayer('route-line')) {
      return;
    }

    // Calculate progress (ensure routeDistance is positive to avoid NaN/Infinity)
    const progress = (selectedVehicle.routeDistance > 0)
        ? Math.min(1, Math.max(0, selectedVehicle.traveledDistance / selectedVehicle.routeDistance))
        : 0;

    const gradientExpression = [
      'step', ['line-progress'],
      ROUTE_GREEN, progress, ROUTE_GREY
    ];

    try {
      map.setPaintProperty('route-line', 'line-color', undefined); // Ensure static color is cleared
      map.setPaintProperty('route-line', 'line-gradient', gradientExpression as any);
    } catch (e) {
      logger.error('[Route Gradient Effect] Error updating gradient:', e);
    }

  }, [selectedVehicle?.traveledDistance, selectedVehicle?.routeDistance, isMapLoaded]);

  // Effect for Follow Vehicle Mode
  useEffect(() => {
    const map = mapInstanceRefInternal.current;
    if (isFollowingVehicle && map && selectedVehicle?.currentPosition && isMapLoaded) {
      const [longitude, latitude] = selectedVehicle.currentPosition.geometry.coordinates;
      logger.debug(`[Follow Effect Action] Calling map.easeTo for ${selectedVehicle.id}`, { longitude, latitude });
      map.easeTo({
        center: [longitude, latitude],
        duration: 500,
        essential: false
      });
    }
  }, [isFollowingVehicle, selectedVehicle?.currentPosition, isMapLoaded]);

  // --- Event Handlers ---

  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    // Update viewState only if component is still mounted
    if (mountedRef.current) {
      setViewState(evt.viewState);
    }
  }, []);

  const handleMapLoad = useCallback((evt: MapEvent) => {
    if (mountedRef.current) {
      mapInstanceRefInternal.current = evt.target; // Store the map instance in the internal ref
      setIsMapLoaded(true);
      logger.info('Mapbox GL JS instance loaded successfully');
    }
  }, []);

  const handleMapErrorInternal = useCallback((evt: ErrorEvent) => {
      logger.error('Mapbox GL error:', evt.error);
      if (mountedRef.current) {
        const errorToReport = evt.error instanceof Error ? evt.error : new Error(evt.error?.message || 'Unknown map error');
        setMapError(errorToReport.message);
        if (onError) onError(errorToReport);
      }
  }, [onError]);

  // SIMPLIFIED: Click handler only sets selected vehicle ID
  const handleMarkerClick = useCallback((vehicle: SimulatedVehicle) => {
      // REMOVED: useContext call from inside callback
      if (!storeApi) { // Use storeApi obtained from component scope
          logger.error("[SimulationMap:handleMarkerClick] Store context not found at component level!");
          return;
      }
      logger.debug('Marker clicked, setting selected vehicle', { vehicleId: vehicle.id });
      storeApi.getState().setSelectedVehicleId(vehicle.id);
      if (storeApi.getState().isFollowingVehicle) {
          logger.info('[Follow Mode] Disabling via toggle action due to marker click.');
          storeApi.getState().toggleFollowVehicle();
      }
  }, [storeApi]); // ADDED storeApi to dependency array

  // Handler to disable follow mode on manual map interaction
  const handleMapInteraction = useCallback((eventType: string) => {
      // REMOVED: useContext call from inside callback
      if (!storeApi) { // Use storeApi obtained from component scope
          logger.error("[SimulationMap:handleMapInteraction] Store context not found at component level!");
          return;
      }
      const currentState = storeApi.getState().isFollowingVehicle;
    logger.debug(`[handleMapInteraction ${eventType}] Fired. Currently following: ${currentState}`);
    if (currentState) {
      logger.info(`[Follow Mode] Disabling via toggle action due to ${eventType}.`);
        storeApi.getState().toggleFollowVehicle();
    }
  }, [storeApi]); // ADDED storeApi to dependency array

  // --- Render Logic ---

  // Get token directly from environment variable
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;

  // Check for internal map errors (e.g., style loading fail)
  if (mapError) {
      return (
          <div className="flex items-center justify-center bg-destructive/10 text-destructive p-4 h-full w-full rounded-md">
              <div>
                  <h3 className="font-bold">Map Rendering Error</h3>
                  <p>{mapError}</p>
              </div>
          </div>
      );
  }

  // Check if the token is defined in the environment
  if (!mapboxAccessToken) {
      logger.error('SimulationMap: NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN is not defined in environment variables!');
      return (
          <div className="flex items-center justify-center bg-destructive/10 text-destructive p-4 h-full w-full rounded-md">
              <div>
                  <h3 className="font-bold">Map Configuration Error</h3>
                  <p>Mapbox access token is missing. Please check environment setup.</p>
              </div>
          </div>
      );
  }

  // NOTE: No separate "token loading" state needed anymore.
  // The map component itself handles loading its resources once token is provided.
  // We rely on the isMapLoaded state (set by onLoad) before rendering markers/layers.

  // Render the map
  return (
    <div className={`simulation-map ${className} relative`} style={{ height, width }}>
      <Map
        reuseMaps // Essential for performance with multiple map instances
        {...viewState} // Controlled view state
        mapboxAccessToken={mapboxAccessToken}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Using dark style for better contrast
        style={{ width, height }} // Apply height/width props
        maxZoom={maxZoom}
        onLoad={handleMapLoad}
        onMove={handleViewStateChange} // Use onMove for continuous updates
        onZoom={handleViewStateChange}
        onPitch={handleViewStateChange}
        onRotate={handleViewStateChange}
        // Disable follow on manual drag
        onDragStart={() => handleMapInteraction('drag')}
        onZoomStart={() => handleMapInteraction('zoom')}
        onPitchStart={() => handleMapInteraction('pitch')}
        onRotateStart={() => handleMapInteraction('rotate')}
        onError={handleMapErrorInternal}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />

        {/* Render Vehicle Markers */}
        {isMapLoaded && vehicleList.map((vehicle) => {
            // *** ADD CHECK: Only render marker if position is valid ***
            if (
              !vehicle.currentPosition ||
              !vehicle.currentPosition.geometry ||
              !Array.isArray(vehicle.currentPosition.geometry.coordinates) ||
              vehicle.currentPosition.geometry.coordinates.length !== 2 ||
              vehicle.currentPosition.geometry.coordinates.some(coord => typeof coord !== 'number' || !isFinite(coord))
            ) {
              // Optionally log if needed for debugging initial states
              // logger.debug(`Skipping marker render for vehicle ${vehicle.id}: Invalid position`, vehicle.currentPosition);
              return null; // Don't render marker if position is invalid
            }

            // Position is valid, proceed with rendering
            const [longitude, latitude] = vehicle.currentPosition.geometry.coordinates;
            const bearing = vehicle.bearing ?? 0; // Default bearing if null/undefined
            const isSelected = vehicle.id === selectedVehicleId;
            const color = getStatusColor(vehicle.status); // Get color based on status

            // Log the bearing value being used
            if (isSelected) {
              logger.debug(`[SimulationMap Marker] Applying rotation for ${vehicle.id}: Bearing=${bearing}`);
            }

            return (
                <Marker
                    key={vehicle.id}
                    longitude={longitude}
                    latitude={latitude}
                    anchor="center"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation(); // Prevent map click
                        if (storeApi) { // Use storeApi directly
                            storeApi.getState().setSelectedVehicleId(vehicle.id);
                        }
                        // Optional: Show popup or other interaction
                        logger.info(`Clicked marker for vehicle ${vehicle.id}`);
                    }}
                    rotation={bearing}
                    style={{ cursor: 'pointer' }}
                >
                   {/* Apply rotation via CSS transform, adjusting offset to -145 degrees */}
                   <div style={{ transform: `rotate(${bearing - 145}deg)` }}>
                     {/* Sizing div - Apply conditional highlighting here */}
                     <div style={{
                         width: '32px',
                         height: '32px',
                         // Apply drop-shadow filter for highlighting
                         filter: isSelected ? 'drop-shadow(0 0 3px rgb(96,165,250))' : 'none',
                         // Add transition for smooth effect
                         transition: 'filter 0.15s ease-in-out'
                      }}>
                       <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
                         {/* Main body - Apply dynamic status color */}
                         <path d="M0 0 C0.66 0 1.32 0 2 0 C2 0.99 2 1.98 2 3 C2.94875 2.938125 3.8975 2.87625 4.875 2.8125 C5.90625 2.874375 6.9375 2.93625 8 3 C10.84799817 7.27199725 10.33018316 10.97798285 10.3125 16 C10.32861328 16.91523438 10.34472656 17.83046875 10.36132812 18.7734375 C10.36197266 19.65257813 10.36261719 20.53171875 10.36328125 21.4375 C10.36626221 22.24058594 10.36924316 23.04367188 10.37231445 23.87109375 C9.90941468 26.51796982 9.13462297 27.40861466 7 29 C4.3125 29.1875 4.3125 29.1875 2 29 C2 29.99 2 30.98 2 32 C1.34 32 0.68 32 0 32 C0 31.01 0 30.02 0 29 C-2.97 29 -5.94 29 -9 29 C-9 29.66 -9 30.32 -9 31 C-18.57 31 -28.14 31 -38 31 C-38 21.1 -38 11.2 -38 1 C-28.43 1 -18.86 1 -9 1 C-9 1.66 -9 2.32 -9 3 C-6.03 3 -3.06 3 0 3 C0 2.01 0 1.02 0 0 Z " fill={color} transform="translate(38,9)"/>
                         {/* Other parts (windshield, wheels) - keep original fills */}
                         <path d="M0 0 C2.875 -0.1875 2.875 -0.1875 6 0 C6.66 0.99 7.32 1.98 8 3 C5.36 3 2.72 3 0 3 C0 2.01 0 1.02 0 0 Z " fill="#EF5A4A" transform="translate(40,16)"/> { /* Example: Assuming this was red trailer part */}
                         <path d="M0 0 C2.64 0 5.28 0 8 0 C7.01 1.485 7.01 1.485 6 3 C2.875 3.1875 2.875 3.1875 0 3 C0 2.01 0 1.02 0 0 Z " fill="#6CAEEB" transform="translate(31,33)"/> { /* Windshield */}
                         <path d="M0 0 C2.875 -0.1875 2.875 -0.1875 6 0 C6.66 0.99 7.32 1.98 8 3 C5.36 3 2.72 3 0 3 C0 2.01 0 1.02 0 0 Z " fill="#69B1EF" transform="translate(31,14)"/> { /* Example wheel */}
                       </svg>
                     </div>
                   </div>
                </Marker>
            );
        })}

        {/* Render Origin Marker - Keep using Lucide icon */}
        {isMapLoaded && originCoords && (
            <Marker longitude={originCoords[0]} latitude={originCoords[1]} anchor="bottom">
                 <Home size={32} fill="#10B981" className="text-background" strokeWidth={1.5}/>
            </Marker>
        )}

        {/* Render Destination Marker - Keep using Lucide icon */}
        {isMapLoaded && destinationCoords && (
            <Marker longitude={destinationCoords[0]} latitude={destinationCoords[1]} anchor="bottom">
                 <Flag size={32} fill="#EF4444" className="text-background" strokeWidth={1.5}/>
            </Marker>
        )}

      </Map>
    </div>
  );
}));

SimulationMap.displayName = 'SimulationMap';