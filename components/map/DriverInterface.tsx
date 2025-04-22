import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapStore, MapStore } from '../../../../packages/shared/src/store/mapStore';
import { Vehicle, ShipmentStop, RouteSegment } from '../../../../packages/shared/src/types/shipment-tracking';
import MapboxMap from '../../../../packages/shared/src/components/MapboxMap';
import MapboxMarker from '../../../../packages/shared/src/components/MapboxMarker';
import MapboxRoute from '../../../../packages/shared/src/components/MapboxRoute';
import { Button } from '../ui/button';

// Define the RouteStop interface that matches what MapboxRoute expects
interface MapboxRouteStop {
  id: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  eta?: Date;
  status?: 'pending' | 'arrived' | 'departed' | 'completed' | 'skipped' | 'failed';
  stopType?: 'pickup' | 'delivery' | 'depot' | 'waypoint';
  stopOrder: number; // Required by MapboxRoute
}

// Helper function to convert ShipmentStop status to a valid MapboxRouteStop status
function mapShipmentStatusToRouteStatus(status: string | undefined): 'pending' | 'arrived' | 'departed' | 'completed' | 'skipped' | 'failed' | undefined {
  if (!status) return undefined;
  
  // Map any unsupported status to 'pending'
  if (status === 'in-progress') return 'pending';
  
  // Return the status if it's already a valid RouteStop status
  if (['pending', 'arrived', 'departed', 'completed', 'skipped', 'failed'].includes(status)) {
    return status as 'pending' | 'arrived' | 'departed' | 'completed' | 'skipped' | 'failed';
  }
  
  // Default fallback
  return 'pending';
}

// Mapper function to convert ShipmentStop[] to MapboxRouteStop[]
function mapShipmentStopsToRouteStops(stops: ShipmentStop[]): MapboxRouteStop[] {
  return stops.map(stop => ({
    id: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude,
    name: stop.name,
    address: stop.address,
    eta: stop.estimatedTimeOfArrival,
    status: mapShipmentStatusToRouteStatus(stop.status),
    stopType: stop.type,
    stopOrder: stop.order, // Map order to stopOrder
  }));
}

// Extended types for route directions
interface RouteStep {
  instruction: string;
  distance?: number;
  duration?: number;
}

interface RouteDirections {
  steps: RouteStep[];
  distance: number;
  duration: number;
  summary?: string;
}

// Extend RouteSegment with directions
interface ExtendedRouteSegment extends RouteSegment {
  directions?: RouteDirections;
}

// Types
export interface DriverInterfaceProps {
  className?: string;
  driverId: string;
  shipmentId?: string;
  currentVehicle?: Vehicle;
  stops?: ShipmentStop[];
  onArrival?: (stopId: string) => void;
  onDeparture?: (stopId: string) => void;
  onScanDocumentRequest?: (stopId: string) => void;
  onError?: (error: Error) => void;
  offlineMode?: boolean;
  height?: string | number;
  width?: string | number;
}

/**
 * DriverInterface component - Turn-by-turn navigation for drivers
 * Includes arrival/departure confirmation and document scanning workflow
 */
export function DriverInterface({
  className = '',
  driverId,
  shipmentId,
  currentVehicle,
  stops = [],
  onArrival,
  onDeparture,
  onScanDocumentRequest,
  onError,
  offlineMode = false,
  height = '600px',
  width = '100%',
}: DriverInterfaceProps) {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Local state
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [currentLocationOverride, setCurrentLocationOverride] = useState<{latitude: number, longitude: number} | null>(null);
  const [navigationDirections, setNavigationDirections] = useState<{
    currentStep: string;
    distance: string;
    duration: string;
    nextStep: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [routeSegments, setRouteSegments] = useState<ExtendedRouteSegment[]>([]);
  
  // Get data from Zustand store
  const { 
    currentLocation,
    setCurrentLocation,
    selectedStopId: storeSelectedStopId,
    setSelectedStopId: storeSetSelectedStopId,
    storeRouteStops,
    setRouteStops,
    routeSegments: storeRouteSegments,
    setRouteSegments: storeSetRouteSegments,
    viewport,
    setViewport,
    activeShipment,
    setActiveShipment,
  } = useMapStore((state: MapStore) => ({
      currentLocation: state.currentLocation,
      setCurrentLocation: state.setCurrentLocation,
      selectedStopId: state.selectedStopId,
      setSelectedStopId: state.setSelectedStopId,
      storeRouteStops: state.routeStops, // Renamed to avoid conflict
      setRouteStops: state.setRouteStops,
      routeSegments: state.routeSegments,
      setRouteSegments: state.setRouteSegments,
      viewport: state.viewport,
      setViewport: state.setViewport,
      activeShipment: state.activeShipment,
      setActiveShipment: state.setActiveShipment,
    }));
  
  // Sort stops by order
  const sortedStops = useMemo(() => {
    return [...stops].sort((a, b) => a.order - b.order);
  }, [stops]);
  
  // Convert to route stops for MapboxRoute
  const routeStops = useMemo(() => {
    return mapShipmentStopsToRouteStops(sortedStops);
  }, [sortedStops]);
  
  // Determine next stop
  const nextStop = useMemo(() => {
    const pendingStops = sortedStops.filter(stop => 
      stop.status === 'pending' || stop.status === 'arrived'
    );
    return pendingStops.length > 0 ? pendingStops[0] : null;
  }, [sortedStops]);
  
  // Track driver location updates
  useEffect(() => {
    // Set initial route stops
    if (routeStops.length > 0) {
      setRouteStops(routeStops);
      
      // If there's a next stop, select it
      if (nextStop) {
        setSelectedStopId(nextStop.id);
        storeSetSelectedStopId(nextStop.id);
      }
    }
    
    // If we're not in offline mode, get the driver's real location
    if (!offlineMode) {
      // Get user's location
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update current location in store
          setCurrentLocation({
            latitude,
            longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(new Error(`Geolocation error: ${err.message}`));
          if (onError) onError(new Error(`Geolocation error: ${err.message}`));
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        }
      );
    } else if (currentVehicle?.currentLocation) {
      // In offline mode, use the vehicle's current location from props
      setCurrentLocation({
        latitude: currentVehicle.currentLocation.latitude,
        longitude: currentVehicle.currentLocation.longitude,
        timestamp: currentVehicle.currentLocation.timestamp,
        heading: currentVehicle.currentLocation.heading,
        speed: currentVehicle.currentLocation.speed,
      });
    }
    
    // Cleanup
    return () => {
      // Clear any watchers if needed
    };
  }, [
    routeStops, 
    nextStop, 
    offlineMode, 
    currentVehicle, 
    setCurrentLocation, 
    setRouteStops, 
    storeSetSelectedStopId
  ]);
  
  // Handle map load
  const handleMapLoad = (map: mapboxgl.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
  };
  
  // Handle map error
  const handleMapError = (err: Error) => {
    console.error('Map error:', err);
    setError(err);
    if (onError) onError(err);
  };
  
  // Handle route calculation result
  const handleRouteCalculated = (segments: RouteSegment[]) => {
    // Cast segments to our extended type that includes directions
    const extendedSegments = segments as ExtendedRouteSegment[];
    setRouteSegments(extendedSegments);
    storeSetRouteSegments(segments);
    
    // Extract current navigation step if there are segments
    if (extendedSegments.length > 0 && extendedSegments[0].directions) {
      const currentSegment = extendedSegments[0];
      const directions = currentSegment.directions;
      
      if (directions && directions.steps && directions.steps.length > 0) {
        const currentStep = directions.steps[0];
        const nextStep = directions.steps.length > 1 ? directions.steps[1] : null;
        
        setNavigationDirections({
          currentStep: currentStep.instruction || 'Proceed to route',
          distance: formatDistance(currentStep.distance || 0),
          duration: formatDuration(currentStep.duration || 0),
          nextStep: nextStep ? nextStep.instruction || '' : 'Arrive at destination',
        });
      }
    }
  };
  
  // Handle arrival at a stop
  const handleArrival = (stopId: string) => {
    // Find the stop
    const stop = stops.find((s) => s.id === stopId);
    
    if (!stop) return;
    
    // Call the arrival callback
    if (onArrival) onArrival(stopId);
    
    // Request document scanning if it's a delivery stop
    if (stop.type === 'delivery' && onScanDocumentRequest) {
      onScanDocumentRequest(stopId);
    }
  };
  
  // Handle departure from a stop
  const handleDeparture = (stopId: string) => {
    if (onDeparture) onDeparture(stopId);
    
    // After departure, find the next stop and select it
    const stopIndex = sortedStops.findIndex((s) => s.id === stopId);
    if (stopIndex >= 0 && stopIndex < sortedStops.length - 1) {
      const nextStopId = sortedStops[stopIndex + 1].id;
      setSelectedStopId(nextStopId);
      storeSetSelectedStopId(nextStopId);
    }
  };
  
  // Helper function to format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };
  
  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}min`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}min`;
    }
  };
  
  return (
    <div className={`driver-interface ${className}`} style={{ height, width }}>
      {error && (
        <div className="error-container p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-700 text-sm font-medium">
            Error: {error.message}
          </p>
        </div>
      )}
      
      {/* Navigation bar */}
      {navigationDirections && (
        <div className="navigation-bar bg-blue-900 text-white p-4 rounded-t-md">
          <div className="flex items-center justify-between">
            <div className="current-direction flex-1">
              <p className="text-xl font-semibold">{navigationDirections.currentStep}</p>
              <div className="flex gap-4 mt-1 text-blue-200">
                <span>{navigationDirections.distance}</span>
                <span>•</span>
                <span>{navigationDirections.duration}</span>
              </div>
            </div>
            {offlineMode && (
              <div className="offline-badge px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-md">
                OFFLINE
              </div>
            )}
          </div>
          {navigationDirections.nextStep && (
            <div className="next-direction mt-3 pt-3 border-t border-blue-800">
              <p className="text-sm text-blue-200">THEN</p>
              <p className="mt-1">{navigationDirections.nextStep}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Map view */}
      <div className="map-container relative rounded-b-md overflow-hidden" 
           style={{ 
             height: navigationDirections ? `calc(100% - 120px)` : '100%'
           }}>
        <MapboxMap
          initialCenter={{ 
            latitude: viewport.latitude, 
            longitude: viewport.longitude 
          }}
          initialZoom={viewport.zoom}
          mapStyle="navigation-night-v1"
          showNavigation
          showUserLocation={!offlineMode} // Only show user location if not in offline mode
          showScale
          onMapLoad={handleMapLoad}
          onMapMove={(center) => {
            setViewport({
              ...viewport,
              latitude: center.latitude,
              longitude: center.longitude,
            });
          }}
          onError={handleMapError}
          className="h-full w-full"
        />
        
        {/* Render route if map is loaded */}
        {isMapLoaded && mapRef.current && routeStops.length > 0 && (
          <MapboxRoute
            map={mapRef.current}
            stops={routeStops}
            includeCurrentLocation={true}
            currentLocation={currentLocationOverride || 
              (currentLocation ? { 
                latitude: currentLocation.latitude, 
                longitude: currentLocation.longitude 
              } : undefined)}
            showStopMarkers={true}
            optimizeRoute={false}
            onRouteCalculated={handleRouteCalculated}
            onRouteFailed={(err) => {
              setError(err);
              if (onError) onError(err);
            }}
            routeColor="#3B82F6" // Blue
            routeCompletedColor="#10B981" // Green
            showRouteSimulation={false}
          />
        )}
        
        {/* Stop markers will be rendered by MapboxRoute */}
      </div>
      
      {/* Action buttons for the current stop */}
      {nextStop && selectedStopId === nextStop.id && (
        <div className="stop-actions mt-4 flex gap-4">
          {nextStop.status === 'pending' ? (
            <Button
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleArrival(nextStop.id)}
            >
              Arrive at {nextStop.name}
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={() => handleDeparture(nextStop.id)}
            >
              Depart from {nextStop.name}
            </Button>
          )}
          
          {nextStop.type === 'delivery' && (
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                if (onScanDocumentRequest) onScanDocumentRequest(nextStop.id);
              }}
            >
              Scan Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 