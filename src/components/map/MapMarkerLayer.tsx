import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxMarker from '../../../packages/shared/src/components/MapboxMarker';
import { mapManager } from '../../utils/maps/MapManager';
import { Vehicle } from '../../types/vehicle';
import { useUnifiedVehicleStore } from '../../store/useUnifiedVehicleStore';
import { 
  VEHICLE_MAP_ID, 
  MAP_STYLES_ID, 
  MARKER_BASE_Z_INDEX,
  injectMapboxCSS
} from '../../utils/maps/constants';
import {
  createEmergencyMarkers,
  checkMarkerVisibility,
  forceMarkerVisibility,
  runMapDiagnostics,
  fixMapContainer
} from '../../utils/map/MapboxMarkerDebug';

interface MapMarkerLayerProps {
  mapId?: string;
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
}

/**
 * MapMarkerLayer - Renders vehicle markers only when map is ready
 * 
 * Uses the MapManager to safely wait for map initialization before
 * rendering any markers, preventing render loops and initialization issues.
 */
const MapMarkerLayer: React.FC<MapMarkerLayerProps> = ({
  mapId,
  vehicles,
  selectedVehicleId = null,
  onVehicleClick,
  onVehicleHover,
}) => {
  // States - Always declare all hooks at the top level in the same order
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  // Use any for these types to avoid mapboxgl inconsistencies
  const [mapBounds, setMapBounds] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState<any | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  // FIXED: Track whether we've tried adding direct markers
  const directMarkersAddedRef = useRef<boolean>(false);
  // FIXED: Track initialization attempts
  const initAttemptsRef = useRef<number>(0);
  
  // Get assigned map ID or fallback to default constant
  const resolvedMapId = useMemo(() => {
    return mapId || VEHICLE_MAP_ID;
  }, [mapId]);
  
  // Callback declarations - define all callbacks before using them in useEffect
  const logMapState = useCallback((readyMap: mapboxgl.Map) => {
    try {
      // Store current map center and zoom for ref
      const center = readyMap.getCenter();
      const zoom = readyMap.getZoom();
      // Explicitly cast to correct type to fix TypeScript error
      const bounds = (readyMap as any).getBounds ? (readyMap as any).getBounds() : null;
      
      // Log map state for debugging
      console.log('[MapMarkerLayer] Map state:', {
        mapId: resolvedMapId,
        bounds: bounds ? {
          sw: bounds.getSouthWest ? [bounds.getSouthWest().lng, bounds.getSouthWest().lat] : 'method not available',
          ne: bounds.getNorthEast ? [bounds.getNorthEast().lng, bounds.getNorthEast().lat] : 'method not available'
        } : 'not available',
        center: center ? [center.lng, center.lat] : null,
        zoom: zoom,
        loaded: (readyMap as any).loaded ? (readyMap as any).loaded() : false
      });
      
      // Update state
      if (center) {
        setMapCenter([center.lng, center.lat]);
        setMapZoom(zoom);
      }
    } catch (error) {
      console.error('[MapMarkerLayer] Error getting map state:', error);
    }
  }, [resolvedMapId]);
  
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    console.log(`[MapMarkerLayer] Vehicle clicked: ${vehicle.id}`);
    if (onVehicleClick) {
      onVehicleClick(vehicle);
    }
  }, [onVehicleClick]);
  
  const handleVehicleHover = useCallback((isHovered: boolean, vehicle: Vehicle) => {
    setHoveredVehicleId(isHovered ? vehicle.id : null);
    
    if (onVehicleHover) {
      onVehicleHover(isHovered ? vehicle : null);
    }
  }, [onVehicleHover]);
  
  // DEBUG: Log props when they change
  useEffect(() => {
    console.log(`[MapMarkerLayer] Received ${vehicles.length} vehicles, mapId: ${mapId}, selectedVehicle: ${selectedVehicleId || 'none'}`);
    
    // Check if vehicles have location data
    const vehiclesWithLocation = vehicles.filter(v => v && v.location && 
      typeof v.location.latitude === 'number' && 
      typeof v.location.longitude === 'number' &&
      !isNaN(v.location.latitude) && !isNaN(v.location.longitude));
    
    if (vehiclesWithLocation.length !== vehicles.length) {
      console.warn(`[MapMarkerLayer] Only ${vehiclesWithLocation.length} of ${vehicles.length} vehicles have valid location data`);
      
      // Log vehicles with missing location data for debugging
      const missingLocationVehicles = vehicles.filter(v => !v || !v.location || 
        typeof v.location.latitude !== 'number' || 
        typeof v.location.longitude !== 'number' ||
        isNaN(v.location.latitude) || isNaN(v.location.longitude));
      
      if (missingLocationVehicles.length > 0) {
        console.warn(`[MapMarkerLayer] Vehicles missing location data:`, 
          missingLocationVehicles.map(v => ({
            id: v.id,
            hasLocation: !!v.location,
            locationValues: v.location ? {
              lat: v.location.latitude,
              lng: v.location.longitude,
              isNaNLat: v.location.latitude ? isNaN(v.location.latitude) : true,
              isNaNLng: v.location.longitude ? isNaN(v.location.longitude) : true,
              typeOfLat: v.location.latitude ? typeof v.location.latitude : 'undefined',
              typeOfLng: v.location.longitude ? typeof v.location.longitude : 'undefined'
            } : 'no location'
          }))
        );
      }
    }
    
    // Sample vehicle data for debugging
    if (vehicles.length > 0) {
      const sampleVehicle = vehicles[0];
      console.log(`[MapMarkerLayer] Sample vehicle data:`, {
        id: sampleVehicle.id,
        location: sampleVehicle.location,
        isSimulated: 'isSimulated' in sampleVehicle ? sampleVehicle.isSimulated : 'unknown',
        hasValidLocation: sampleVehicle && sampleVehicle.location && 
          typeof sampleVehicle.location.latitude === 'number' && 
          typeof sampleVehicle.location.longitude === 'number' &&
          !isNaN(sampleVehicle.location.latitude) && !isNaN(sampleVehicle.location.longitude),
        routeData: 'routeData' in sampleVehicle ? (sampleVehicle as any).routeData : 'none',
        visuals: 'visuals' in sampleVehicle ? (sampleVehicle as any).visuals : 'none'
      });
    }
  }, [vehicles, mapId, selectedVehicleId]);
  
  // ENHANCE: Add event listener for map movement and updates
  useEffect(() => {
    if (!map) return () => {};
    
    const handleMapMove = () => {
      logMapState(map);
    };
    
    // Initial log of map state
    logMapState(map);
    
    // Set up event listeners safely with try/catch
    try {
      map.on('moveend', handleMapMove);
      map.on('zoomend', handleMapMove);
      
      return () => {
        map.off('moveend', handleMapMove);
        map.off('zoomend', handleMapMove);
      };
    } catch (error) {
      console.error('[MapMarkerLayer] Error setting up map event listeners:', error);
      return () => {};
    }
  }, [map, logMapState]);
  
  // FIXED: Create direct markers as a last resort fallback method
  const createDirectMarkers = useCallback((readyMap: mapboxgl.Map) => {
    if (!readyMap || directMarkersAddedRef.current || vehicles.length === 0) return;
    
    console.log('[MapMarkerLayer] Creating direct markers as fallback');
    directMarkersAddedRef.current = true;
    
    // FIXED: Use the emergency markers utility
    const newMarkers = createEmergencyMarkers(readyMap, vehicles, handleVehicleClick);
    
    // Store markers in ref
    markersRef.current = { ...markersRef.current, ...newMarkers };
    
    console.log(`[MapMarkerLayer] Added ${Object.keys(newMarkers).length} direct markers`);
    
    // Run diagnostics to verify marker creation
    runMapDiagnostics(resolvedMapId, readyMap);
  }, [vehicles, handleVehicleClick, resolvedMapId]);
  
  // Setup map ready listener using MapManager - simplified to be more reliable
  useEffect(() => {
    // Clear any existing map state first
    if (map) {
      console.log(`[MapMarkerLayer] Cleaning up previous map instance for ${resolvedMapId}`);
      setMap(null);
      setIsMapReady(false);
      
      // FIXED: Reset direct markers flag when changing maps
      directMarkersAddedRef.current = false;
    }
    
    console.log(`[MapMarkerLayer] Attempting to get map instance for ${resolvedMapId}`);
    
    // First check if map is already available and ready
    const readyMap = mapManager.getMap(resolvedMapId);
    if (readyMap) {
      console.log(`[MapMarkerLayer] Map ${resolvedMapId} is already ready, initializing markers`);
      setMap(readyMap);
      setIsMapReady(true);
      
      // Apply critical container fixes
      try {
        const container = readyMap.getContainer();
        if (container) {
          container.style.position = 'relative';
          container.style.overflow = 'visible';
          
          // Use the centralized CSS injection utility
          injectMapboxCSS(true); // Pass true to enable debug styles
          
          // FIXED: Use the new fixMapContainer utility
          fixMapContainer(resolvedMapId);
        }
      } catch (error) {
        console.error('[MapMarkerLayer] Error applying container style fix:', error);
      }
      
      // FIXED: Run diagnostics before creating markers
      runMapDiagnostics(resolvedMapId, readyMap);
      
      // FIXED: Create direct markers after map is ready, with longer timeout for better reliability
      setTimeout(() => {
        createDirectMarkers(readyMap);
      }, 1500);
      
      // Log the state of the map
      logMapState(readyMap);
      return;
    }
    
    // Increment initialization attempts
    initAttemptsRef.current += 1;
    console.log(`[MapMarkerLayer] Initialization attempt ${initAttemptsRef.current} for ${resolvedMapId}`);
    
    // Wait for map to be ready with a fallback timeout
    console.log(`[MapMarkerLayer] Waiting for map to be ready (${resolvedMapId})`);
    const unsubscribe = mapManager.waitForMap((readyMap) => {
      if (!readyMap) {
        console.error(`[MapMarkerLayer] waitForMap callback received null map for ${resolvedMapId}`);
        return;
      }
      
      console.log(`[MapMarkerLayer] Map is now ready (${resolvedMapId}), initializing markers`);
      setMap(readyMap);
      setIsMapReady(true);
      
      // Apply critical container fixes
      try {
        const container = readyMap.getContainer();
        if (container) {
          container.style.position = 'relative';
          container.style.overflow = 'visible';
          
          // Use the centralized CSS injection utility
          injectMapboxCSS(true); // Pass true to enable debug styles
          
          // FIXED: Use the new fixMapContainer utility
          fixMapContainer(resolvedMapId);
        }
      } catch (error) {
        console.error('[MapMarkerLayer] Error applying container style fix:', error);
      }
      
      // FIXED: Run diagnostics before creating markers
      runMapDiagnostics(resolvedMapId, readyMap);
      
      // FIXED: Create direct markers after map is ready, with longer timeout for better reliability
      setTimeout(() => {
        createDirectMarkers(readyMap);
      }, 1500);
      
      // Log the state of the map
      logMapState(readyMap);
    }, resolvedMapId);
    
    // Add a fallback timeout in case waitForMap never resolves
    const timeoutId = setTimeout(() => {
      console.warn(`[MapMarkerLayer] Map readiness timeout for ${resolvedMapId}, checking map status directly`);
      
      // Check map status directly as a last resort
      if (mapManager.isMapReady(resolvedMapId)) {
        const map = mapManager.getMap(resolvedMapId);
        if (map) {
          console.log(`[MapMarkerLayer] Map found through direct check for ${resolvedMapId}`);
          setMap(map);
          setIsMapReady(true);
          
          // FIXED: Create direct markers after timeout
          setTimeout(() => {
            createDirectMarkers(map);
          }, 1000);
        } else {
          console.error(`[MapMarkerLayer] Map getMap returned null after isMapReady was true`);
        }
      } else {
        console.error(`[MapMarkerLayer] Map is still not ready after timeout`);
        
        // FIXED: If still not ready after multiple attempts, try to get map directly from DOM
        if (initAttemptsRef.current >= 3) {
          console.warn(`[MapMarkerLayer] Multiple initialization attempts failed, trying direct DOM access`);
          try {
            const mapContainer = document.getElementById(resolvedMapId);
            if (mapContainer && (mapContainer as any)._map) {
              const directMap = (mapContainer as any)._map;
              console.log(`[MapMarkerLayer] Retrieved map directly from DOM:`, directMap);
              setMap(directMap);
              setIsMapReady(true);
              
              // FIXED: Create direct markers as last resort
              setTimeout(() => {
                createDirectMarkers(directMap);
              }, 1000);
            }
          } catch (error) {
            console.error(`[MapMarkerLayer] Error accessing map from DOM:`, error);
          }
        }
      }
    }, 3000);
    
    // Cleanup
    return () => {
      console.log(`[MapMarkerLayer] Cleaning up MapManager subscription for ${resolvedMapId}`);
      clearTimeout(timeoutId);
      unsubscribe();
      
      // FIXED: Clean up existing markers
      Object.values(markersRef.current).forEach(marker => {
        try {
          marker.remove();
        } catch (error) {
          console.error(`[MapMarkerLayer] Error removing marker:`, error);
        }
      });
      markersRef.current = {};
      directMarkersAddedRef.current = false;
    };
  }, [resolvedMapId, logMapState, vehicles, createDirectMarkers]);
  
  // Memoize valid vehicles to avoid unnecessary re-renders
  const validVehicles = useMemo(() => {
    const validVehicleList = vehicles.filter(v => 
      v && v.id && 
      typeof v.location?.latitude === 'number' && 
      typeof v.location?.longitude === 'number' && 
      !isNaN(v.location.latitude) && 
      !isNaN(v.location.longitude)
    );
    return validVehicleList;
  }, [vehicles]);
  
  // Force map refresh when vehicles length changes
  useEffect(() => {
    if (map) {
      console.log(`[MapMarkerLayer] Vehicle count changed (${validVehicles.length})`);
      try {
        // Check if map is valid and has resize method before calling
        if (map && typeof (map as any).resize === 'function') {
          (map as any).resize(); // Force layout refresh
        }
      } catch (error) {
        console.error('[MapMarkerLayer] Error resizing map:', error);
      }
    }
  }, [validVehicles.length, map]);
  
  // Check if we should fit bounds to display all vehicles - simplified logic
  useEffect(() => {
    if (!map || validVehicles.length === 0 || !isMapReady) return;
    
    try {
      // Skip bounds calculation if we have no vehicles with location data
      if (!validVehicles.some(v => v.location)) {
        console.log('[MapMarkerLayer] No vehicles with location data for bounds calculation');
        return;
      }

      // Use a simple coordinate array for bounds calculation
      // This avoids TypeScript issues with mapboxgl.LngLatBounds
      const points: [number, number][] = [];
      
      // Collect all valid coordinates
      validVehicles.forEach(vehicle => {
        if (vehicle.location && 
            typeof vehicle.location.longitude === 'number' && 
            typeof vehicle.location.latitude === 'number') {
          points.push([vehicle.location.longitude, vehicle.location.latitude]);
        }
      });
      
      if (points.length === 0) return;
      
      // If we have only one point, center on it instead of using bounds
      if (points.length === 1) {
        // Use type casting to solve the TypeScript error
        (map as any).flyTo({
          center: points[0],
          zoom: 14
        });
        return;
      }
      
      // Calculate bounds manually if needed, or use mapbox's method if available
      try {
        // Create a bounding box from all coordinates
        const southwest: [number, number] = [
          Math.min(...points.map(p => p[0])), // min longitude
          Math.min(...points.map(p => p[1]))  // min latitude
        ];
        
        const northeast: [number, number] = [
          Math.max(...points.map(p => p[0])), // max longitude
          Math.max(...points.map(p => p[1]))  // max latitude
        ];
        
        // Add some padding to the bounds
        const paddingFactor = 0.1; // 10% padding
        const lngDiff = northeast[0] - southwest[0];
        const latDiff = northeast[1] - southwest[1];
        
        const swWithPadding: [number, number] = [
          southwest[0] - lngDiff * paddingFactor,
          southwest[1] - latDiff * paddingFactor
        ];
        
        const neWithPadding: [number, number] = [
          northeast[0] + lngDiff * paddingFactor,
          northeast[1] + latDiff * paddingFactor
        ];
        
        // Fit map to these bounds
        map.fitBounds([swWithPadding, neWithPadding], {
          padding: 50,
          maxZoom: 15
        });
        
        console.log('[MapMarkerLayer] Fitted map to vehicle bounds');
      } catch (error) {
        console.error('[MapMarkerLayer] Error fitting bounds:', error);
        
        // Fallback: just center on the first point
        if (points.length > 0) {
          // Use type casting to solve the TypeScript error
          (map as any).flyTo({
            center: points[0],
            zoom: 12
          });
        }
      }
    } catch (error) {
      console.error('[MapMarkerLayer] Error in fitBounds effect:', error);
    }
  }, [isMapReady, map, validVehicles]);
  
  // FIXED: Add effect to check marker visibility
  useEffect(() => {
    if (!map || !isMapReady) return;
    
    // Set up a recurring check for marker visibility
    const checkInterval = setInterval(() => {
      // Check if we have any markers
      const markerIds = Object.keys(markersRef.current);
      
      if (markerIds.length === 0 && validVehicles.length > 0) {
        console.warn('[MapMarkerLayer] No markers found but we have vehicles, creating emergency markers');
        createDirectMarkers(map);
        return;
      }
      
      // Check a sample of markers for visibility
      const sampleSize = Math.min(3, markerIds.length);
      const sampleIds = markerIds.slice(0, sampleSize);
      
      sampleIds.forEach(id => {
        const marker = markersRef.current[id];
        if (marker) {
          const isVisible = checkMarkerVisibility(marker, id);
          if (!isVisible) {
            console.warn(`[MapMarkerLayer] Marker ${id} is not visible, applying fixes`);
            forceMarkerVisibility(marker, id);
          }
        }
      });
    }, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [map, isMapReady, validVehicles, createDirectMarkers]);
  
  // Early return if map is not ready
  if (!isMapReady || !map) {
    console.log(`[MapMarkerLayer] Map not ready yet, skipping render. isMapReady: ${isMapReady}, hasMap: ${!!map}`);
    return null;
  }
  
  // FIXED: If we have a map but no markers have been created, try the direct markers approach
  if (isMapReady && map && validVehicles.length > 0 && Object.keys(markersRef.current).length === 0 && !directMarkersAddedRef.current) {
    console.log('[MapMarkerLayer] We have a map but no markers, trying direct marker creation');
    setTimeout(() => {
      createDirectMarkers(map);
    }, 500);
  }
  
  // DEBUG: Log actual marker rendering
  console.log(`[MapMarkerLayer] Rendering ${validVehicles.length} vehicle markers`);
  
  // Render markers
  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 10 }}>
      {validVehicles.map(vehicle => (
        <VehicleMarker
          key={vehicle.id}
          map={map}
          vehicle={vehicle}
          isSelected={vehicle.id === selectedVehicleId}
          isHovered={vehicle.id === hoveredVehicleId}
          onClick={() => handleVehicleClick(vehicle)}
          onHover={(isHovered) => handleVehicleHover(isHovered, vehicle)}
        />
      ))}
    </div>
  );
};

// Memoized vehicle marker component
const VehicleMarker = React.memo(({
  map,
  vehicle,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: {
  map: mapboxgl.Map;
  vehicle: Vehicle;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}) => {
  // Safety check for location
  if (!vehicle.location || 
      typeof vehicle.location.latitude !== 'number' || 
      typeof vehicle.location.longitude !== 'number' ||
      isNaN(vehicle.location.latitude) || 
      isNaN(vehicle.location.longitude)) {
    console.warn(`[VehicleMarker] Vehicle ${vehicle.id} has no valid location data, skipping marker`);
    return null;
  }
  
  // Log marker creation
  console.log(`[VehicleMarker] Creating marker for vehicle ${vehicle.id} at [${vehicle.location.longitude}, ${vehicle.location.latitude}]`);
  
  // Determine marker type and status
  let markerType: 'pickup' | 'delivery' | 'vehicle' | 'simulated-vehicle' | 'custom' = 'vehicle';
  
  // Check if the vehicle is simulated
  if ('isSimulated' in vehicle && vehicle.isSimulated) {
    markerType = 'simulated-vehicle';
  }
  
  // Determine marker status
  const markerStatus = vehicle.status || 'pending';
  
  // Extract any custom visual properties if they exist
  const visuals = 'visuals' in vehicle ? vehicle.visuals || {} : {};
  
  // Create style options
  const styleOptions = {
    color: visuals.color || '#00BFFF', // Default to bright blue
    size: visuals.size || 40, // Larger default size
    pulseEffect: vehicle.status === 'moving' || (visuals.pulseEffect ?? false),
    emoji: visuals.emoji || '🚚', // Default truck emoji
    fontSize: visuals.fontSize || 24, // Larger font size
    rotation: vehicle.heading || 0,
    zoomDependent: true,
  };
  
  // Extract route data if available
  const routeData = 'routeData' in vehicle ? vehicle.routeData : undefined;
  
  // Add error handling for MapboxMarker
  try {
    // Custom click handler that works with MapboxMarker
    const handleClick = useCallback((e: mapboxgl.MapMouseEvent) => {
      console.log(`[VehicleMarker] Click event on marker ${vehicle.id}`);
      onClick();
    }, [onClick, vehicle.id]);

    return (
      <MapboxMarker
        map={map}
        id={vehicle.id}
        latitude={vehicle.location.latitude}
        longitude={vehicle.location.longitude}
        title={vehicle.id}
        description={`Type: ${vehicle.type}, Status: ${vehicle.status}`}
        markerType={markerType}
        status={markerStatus}
        styleOptions={styleOptions}
        onClick={handleClick}
        showPopup={isSelected}
        routeData={routeData}
        zoomDependent={true}
        minZoom={11}
        maxZoom={15}
      />
    );
  } catch (error) {
    console.error(`[VehicleMarker] Error rendering marker for vehicle ${vehicle.id}:`, error);
    return null;
  }
});

VehicleMarker.displayName = 'VehicleMarker';
MapMarkerLayer.displayName = 'MapMarkerLayer';

export default React.memo(MapMarkerLayer); 