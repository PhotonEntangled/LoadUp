import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '../../../../packages/shared/src/store/mapStore';
import { Vehicle, VehicleType } from '../../../../packages/shared/src/types/shipment-tracking';
import { Button } from '../ui/button';
import MapboxMap from '../../../../packages/shared/src/components/MapboxMap';
import MapboxMarker from '../../../../packages/shared/src/components/MapboxMarker';

// Types for filter options
export interface VehicleFilters {
  types: VehicleType[];
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}

export interface VehicleLocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: Date;
}

export interface FleetOverviewMapProps {
  className?: string;
  initialVehicles?: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  refreshInterval?: number; // in ms, how often to refresh vehicle data
  showFilters?: boolean;
  height?: string | number;
  width?: string | number;
  maxZoom?: number;
  onError?: (error: Error) => void;
}

const DEFAULT_CENTER = { latitude: 3.1390, longitude: 101.6869 }; // Default center (Kuala Lumpur)

// Helper to safely set intervals and automatically handle cleanup
const useSafeInterval = () => {
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Create a safe setInterval that tracks the ID
  const safeSetInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = setInterval(callback, delay) as unknown as NodeJS.Timeout;
    intervalsRef.current.push(intervalId);
    return intervalId;
  }, []);
  
  // Cleanup function
  const clearAllIntervals = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);
  
  return { safeSetInterval, clearAllIntervals };
};

// Helper to safely set timeouts and automatically handle cleanup
const useSafeTimeout = () => {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Create a safe setTimeout that tracks the ID
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = setTimeout(callback, delay) as unknown as NodeJS.Timeout;
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);
  
  // Cleanup function
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  
  return { safeSetTimeout, clearAllTimeouts };
};

/**
 * FleetOverviewMap component - Shows all vehicles on a map with filtering options
 * Used in admin dashboard for fleet management
 */
export const FleetOverviewMap = React.memo(({
  className = '',
  initialVehicles = [],
  onVehicleClick,
  onVehicleHover,
  refreshInterval = 5000,
  showFilters = true,
  height = '600px',
  width = '100%',
  maxZoom = 18,
  onError,
}: FleetOverviewMapProps) => {
  // Safe timers
  const { safeSetInterval, clearAllIntervals } = useSafeInterval();
  const { safeSetTimeout, clearAllTimeouts } = useSafeTimeout();
  
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mountedRef = useRef<boolean>(true);
  const lastBoundsUpdateRef = useRef<number>(0);
  const prevFilteredVehiclesCountRef = useRef<number>(0);
  
  // Local state
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
  const [filters, setFilters] = useState<VehicleFilters>({ 
    types: ['truck', 'van', 'car', 'motorcycle'],
    status: 'active',
    search: '',
  });
  const [error, setError] = useState<Error | null>(null);
  
  // Use the fixed mapStore with stable selectors
  const vehicles = useMapStore((state) => state.vehicles);
  const setVehicles = useMapStore((state) => state.setVehicles);
  const fitBounds = useMapStore((state) => state.fitBounds);
  const setInitialized = useMapStore((state) => state.setInitialized);
  
  // Initialize store and vehicles on mount
  useEffect(() => {
    setInitialized(true);
    
    if (initialVehicles && initialVehicles.length > 0) {
      setVehicles(initialVehicles);
    }
    
    return () => {
      mountedRef.current = false;
      clearAllIntervals();
      clearAllTimeouts();
    };
  }, [setInitialized, setVehicles, initialVehicles, clearAllIntervals, clearAllTimeouts]);
  
  // Simulation is completely disabled to prevent render loops
  
  // Apply filters to vehicles - memoize to prevent unnecessary recalculations
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: Vehicle) => {
      // Filter by type
      if (filters.types.length > 0 && !filters.types.includes(vehicle.type)) {
        return false;
      }
      
      // Cache timestamp calculations to avoid repeated Date operations
      let isActive = false;
      if (vehicle.currentLocation) {
        const currentTime = new Date().getTime();
        const locationTime = new Date(vehicle.currentLocation.timestamp).getTime();
        const timeDiff = currentTime - locationTime;
        isActive = timeDiff <= 15 * 60 * 1000;
      }
      
      // Filter by status
      if (filters.status === 'active' && !isActive) {
        return false;
      }
      
      if (filters.status === 'inactive' && isActive) {
        return false;
      }
      
      // Filter by search (lowercase once)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const vehicleName = vehicle.name.toLowerCase();
        const licensePlate = vehicle.licensePlate.toLowerCase();
        if (!vehicleName.includes(search) && !licensePlate.includes(search)) {
          return false;
        }
      }
      
      return true;
    });
  }, [vehicles, filters.types, filters.status, filters.search]);
  
  // Properly memoize the updateMapBounds function with all dependencies
  const updateMapBounds = useCallback(() => {
    if (!isMapLoaded || filteredVehicles.length === 0 || !mountedRef.current) return;
    
    // Only update bounds if the count changed or at least 2 seconds have passed
    const now = Date.now();
    const shouldUpdateBounds = 
      filteredVehicles.length !== prevFilteredVehiclesCountRef.current ||
      (now - lastBoundsUpdateRef.current > 2000);
    
    if (!shouldUpdateBounds) return;
    
    // Update reference counts
    prevFilteredVehiclesCountRef.current = filteredVehicles.length;
    lastBoundsUpdateRef.current = now;
    
    const activeVehicles = filteredVehicles.filter((v: Vehicle) => v.currentLocation);
    
    if (activeVehicles.length === 0) return;
    
    // Calculate bounds
    const lngs = activeVehicles.map((v: Vehicle) => v.currentLocation!.longitude);
    const lats = activeVehicles.map((v: Vehicle) => v.currentLocation!.latitude);
    
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    // Skip tiny or invalid bounds
    if (
      !isFinite(minLng) || !isFinite(maxLng) || 
      !isFinite(minLat) || !isFinite(maxLat) ||
      (maxLng - minLng < 0.0001 && maxLat - minLat < 0.0001)
    ) {
      return;
    }
    
    // Add padding
    const paddingFactor = 0.1;
    const lngDiff = maxLng - minLng;
    const latDiff = maxLat - minLat;
    
    // Update bounds safely
    if (mountedRef.current && fitBounds) {
      fitBounds({
        southWest: [minLng - lngDiff * paddingFactor, minLat - latDiff * paddingFactor],
        northEast: [maxLng + lngDiff * paddingFactor, maxLat + latDiff * paddingFactor],
      });
    }
  }, [isMapLoaded, filteredVehicles, fitBounds]);
  
  // Trigger bounds update with a debounce
  useEffect(() => {
    if (!isMapLoaded || !mountedRef.current) return;
    
    const boundsUpdateTimeout = safeSetTimeout(() => {
      updateMapBounds();
    }, 200);
    
    return () => {
      clearTimeout(boundsUpdateTimeout);
    };
  }, [isMapLoaded, updateMapBounds, safeSetTimeout]);
  
  // Filter update functions - stable with useCallback
  const updateTypeFilter = useCallback((types: VehicleType[]) => {
    setFilters(prev => ({ ...prev, types }));
  }, []);
  
  const updateStatusFilter = useCallback((status: 'active' | 'inactive' | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  }, []);
  
  const updateSearchFilter = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);
  
  // Event handlers - stable with useCallback
  const handleMapLoad = useCallback((map: mapboxgl.Map) => {
    console.log('[FleetOverviewMap] Map loaded successfully', { mapCenter: map.getCenter() });
    mapRef.current = map;
    setIsMapLoaded(true);
  }, []);
  
  const handleMapError = useCallback((err: Error) => {
    console.error('Map error:', err);
    setError(err);
    if (onError) onError(err);
  }, [onError]);
  
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    if (!mountedRef.current) return;
    
    setSelectedVehicleId(vehicle.id);
    if (onVehicleClick) onVehicleClick(vehicle);
    
    // Center map on vehicle
    if (vehicle.currentLocation && mapRef.current) {
      if (mountedRef.current && fitBounds) {
        fitBounds({
          southWest: [
            vehicle.currentLocation.longitude - 0.01, 
            vehicle.currentLocation.latitude - 0.01
          ],
          northEast: [
            vehicle.currentLocation.longitude + 0.01, 
            vehicle.currentLocation.latitude + 0.01
          ],
        });
      }
    }
  }, [onVehicleClick, fitBounds]);
  
  const handleVehicleHover = useCallback((vehicle: Vehicle | null) => {
    if (!mountedRef.current) return;
    
    setHoveredVehicleId(vehicle?.id || null);
    if (onVehicleHover) onVehicleHover(vehicle);
  }, [onVehicleHover]);
  
  const showAllVehicles = useCallback(() => {
    if (!mountedRef.current) return;
    
    setSelectedVehicleId(null);
    updateMapBounds();
  }, [updateMapBounds]);
  
  // Memoize VehicleMarkers component instance to prevent recreation on every render
  const vehicleMarkersComponent = useMemo(() => {
    if (!isMapLoaded || !mapRef.current) {
      console.log('[FleetOverviewMap] Cannot render markers - Map not loaded:', { isMapLoaded, hasMapRef: !!mapRef.current });
      return null;
    }
    
    console.log('[FleetOverviewMap] Rendering markers for vehicles:', filteredVehicles.length, { 
      sampleVehicle: filteredVehicles.length > 0 ? filteredVehicles[0] : null 
    });
    
    return (
      <VehicleMarkers
        map={mapRef.current}
        vehicles={filteredVehicles}
        selectedVehicleId={selectedVehicleId}
        hoveredVehicleId={hoveredVehicleId}
        onVehicleClick={handleVehicleClick}
        onVehicleHover={handleVehicleHover}
      />
    );
  }, [isMapLoaded, filteredVehicles, selectedVehicleId, hoveredVehicleId, handleVehicleClick, handleVehicleHover]);
  
  // Log vehicle data for debugging
  useEffect(() => {
    if (isMapLoaded && filteredVehicles.length > 0) {
      console.log('[FleetOverviewMap] Filtered vehicles available:', filteredVehicles.length);
      console.log('[FleetOverviewMap] Sample vehicle data:', filteredVehicles[0]);
    }
  }, [isMapLoaded, filteredVehicles]);
  
  return (
    <div className={`fleet-overview-map ${className}`} style={{ height, width }}>
      {error && (
        <div className="map-error-container p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-700 text-sm font-medium">
            Error: {error.message}
          </p>
        </div>
      )}
      
      {showFilters && (
        <div className="fleet-filters bg-white p-4 rounded-md shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <div className="flex flex-wrap gap-2">
                {(['truck', 'van', 'car', 'motorcycle'] as VehicleType[]).map(type => (
                  <Button
                    key={type}
                    variant={filters.types.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newTypes = filters.types.includes(type)
                        ? filters.types.filter(t => t !== type)
                        : [...filters.types, type];
                      updateTypeFilter(newTypes);
                    }}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-2">
                {(['active', 'inactive', 'all'] as const).map(status => (
                  <Button
                    key={status}
                    variant={filters.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={e => updateSearchFilter(e.target.value)}
                placeholder="Search by name or license"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={showAllVehicles}
            >
              Show All Vehicles
            </Button>
          </div>
        </div>
      )}
      
      <div 
        className="map-container relative rounded-md overflow-hidden" 
        style={{ height: showFilters ? 'calc(100% - 150px)' : '100%' }}
      >
        <MapboxMap
          initialCenter={{ 
            latitude: DEFAULT_CENTER.latitude, 
            longitude: DEFAULT_CENTER.longitude 
          }}
          initialZoom={11}
          mapStyle="streets-v12"
          showNavigation
          showUserLocation
          showScale
          onMapLoad={handleMapLoad}
          onError={handleMapError}
          className="h-full w-full"
        />
        
        {vehicleMarkersComponent}
      </div>
    </div>
  );
});

// Add displayName
FleetOverviewMap.displayName = 'FleetOverviewMap';

// Memoized vehicle markers component to prevent unnecessary re-renders
const VehicleMarkers = React.memo(({
  map,
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  onVehicleHover,
}: {
  map: mapboxgl.Map;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  hoveredVehicleId: string | null;
  onVehicleClick: (vehicle: Vehicle) => void;
  onVehicleHover: (vehicle: Vehicle | null) => void;
}) => {
  // Filter out vehicles without location data
  const vehiclesWithLocation = useMemo(() => {
    return vehicles.filter(vehicle => vehicle.currentLocation);
  }, [vehicles]);

  return (
    <>
      {vehiclesWithLocation.map(vehicle => (
        <VehicleMarker
          key={vehicle.id}
          map={map}
          vehicle={vehicle}
          isSelected={vehicle.id === selectedVehicleId}
          isHovered={vehicle.id === hoveredVehicleId}
          onClick={() => onVehicleClick(vehicle)}
          onHover={(isHovered) => {
            if (isHovered) {
              onVehicleHover(vehicle);
            } else if (hoveredVehicleId === vehicle.id) {
              onVehicleHover(null);
            }
          }}
        />
      ))}
    </>
  );
});

// Individual vehicle marker component
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
  if (!vehicle.currentLocation) return null;
  
  // Debug log
  console.log('[VehicleMarker] Rendering marker for vehicle:', vehicle.id, {
    location: vehicle.currentLocation,
    routeData: (vehicle as any).routeData,
    isSimulated: (vehicle as any).isSimulated
  });
  
  // Determine marker type and status
  let markerType: 'pickup' | 'delivery' | 'vehicle' | 'simulated-vehicle' | 'custom' = 'vehicle';
  
  // Check if the vehicle is simulated
  if ((vehicle as any).isSimulated) {
    markerType = 'simulated-vehicle';
  }
  
  // Check if vehicle data is stale
  const isStale = new Date().getTime() - new Date(vehicle.currentLocation.timestamp).getTime() > 15 * 60 * 1000;
  // Access status safely to handle vehicles that may not have this property
  const vehicleStatus = (vehicle as any).status || 'unknown';
  const markerStatus = isStale ? 'pending' : vehicleStatus;
  
  // Extract any custom visual properties if they exist
  const visuals = (vehicle as any).visuals || {};
  
  // Prepare style options for the marker
  const styleOptions = {
    color: visuals.color || '#00BFFF', // Default to bright blue
    size: visuals.size || 40, // Larger default size
    pulseEffect: vehicleStatus === 'moving' || visuals.pulseEffect,
    emoji: visuals.emoji || '🚚', // Default truck emoji
    fontSize: visuals.fontSize || 24 // Larger font size
  };
  
  // Extract route data if available
  const routeData = (vehicle as any).routeData;
  
  // Debug route data
  if (routeData) {
    console.log('[VehicleMarker] Route data present for vehicle:', vehicle.id, routeData);
  }
  
  return (
    <MapboxMarker
      map={map}
      id={vehicle.id}
      latitude={vehicle.currentLocation.latitude}
      longitude={vehicle.currentLocation.longitude}
      title={vehicle.name || vehicle.id}
      description={`${vehicle.licensePlate || vehicle.type} - Status: ${vehicleStatus}`}
      markerType={markerType}
      status={markerStatus}
      styleOptions={styleOptions}
      onClick={onClick}
      showPopup={isSelected}
      routeData={routeData}
      zoomDependent={true}
    />
  );
});

// Add display names for React DevTools
VehicleMarkers.displayName = 'VehicleMarkers';
VehicleMarker.displayName = 'VehicleMarker'; 