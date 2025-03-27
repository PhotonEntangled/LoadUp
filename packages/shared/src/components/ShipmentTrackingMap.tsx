import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxMap from './MapboxMap.js';
import MapboxMarker from './MapboxMarker.js';
import MapboxRoute, { RouteStop, RouteSegment } from './MapboxRoute.js';
import MapboxGeocodingService from '../services/MapboxGeocodingService.js';

// Define shipment status type
export type ShipmentStatus = 
  | 'pending' 
  | 'in-transit' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'failed' 
  | 'returned';

// Define vehicle/driver type
export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
}

// Define shipment details type
export interface ShipmentDetails {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  // Intermediate stops (pickup/dropoff points)
  stops?: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    type: 'pickup' | 'delivery' | 'waypoint' | 'depot';
    status: 'pending' | 'arrived' | 'departed' | 'completed' | 'failed';
    scheduledTime?: Date;
    actualTime?: Date;
    order: number; // Order in the route sequence
  }>;
  // Assigned vehicle/driver (optional)
  vehicle?: Vehicle;
  // Estimated delivery time (optional)
  estimatedDelivery?: Date;
  // Actual delivery time (optional)
  actualDelivery?: Date;
  // Optional fields for logistics
  weight?: string;
  dimensions?: string;
  specialInstructions?: string;
}

export interface ShipmentTrackingMapProps {
  // Shipment to display
  shipment: ShipmentDetails;
  // Optional manual center coordinates
  center?: {
    latitude: number;
    longitude: number;
  };
  // Optional manual zoom level
  zoom?: number;
  // Map style options
  mapStyle?: 'streets-v12' | 'light-v11' | 'dark-v11' | 'satellite-v9' | 'satellite-streets-v12';
  // Whether to optimize route automatically
  optimizeRoute?: boolean;
  // Whether to show markers for shipment stops
  showStopMarkers?: boolean;
  // Whether to show a marker for the vehicle
  showVehicle?: boolean;
  // Whether to auto-center the map to fit all stops
  autoCenterMap?: boolean;
  // Whether to animate vehicle movement
  animateVehicle?: boolean;
  // Optional callback when a marker is clicked
  onMarkerClick?: (stopId: string) => void;
  // Optional callback when route calculation completes
  onRouteCalculated?: (stops: RouteStop[]) => void;
  // Container style
  style?: React.CSSProperties;
  // Container className
  className?: string;
}

const ShipmentTrackingMap: React.FC<ShipmentTrackingMapProps> = ({
  shipment,
  center,
  zoom,
  mapStyle = 'streets-v12',
  optimizeRoute = true,
  showStopMarkers = true,
  showVehicle = true,
  autoCenterMap = true,
  animateVehicle = true,
  onMarkerClick,
  onRouteCalculated,
  style = { width: '100%', height: '400px' },
  className = '',
}) => {
  // Reference to the map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // State for stops data
  const [stops, setStops] = useState<RouteStop[]>([]);
  
  // State for map center
  const [mapCenter, setMapCenter] = useState<{latitude: number; longitude: number} | undefined>(center);
  
  // State for map zoom
  const [mapZoom, setMapZoom] = useState<number | undefined>(zoom);
  
  // State for tracking if map is loaded
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Geocoding service for converting addresses to coordinates if needed
  const geocodingService = useRef(new MapboxGeocodingService());

  // Convert shipment data to route stops when shipment changes
  useEffect(() => {
    if (!shipment) return;

    // Prepare base stops (origin, destination, and intermediate stops)
    const allStops: RouteStop[] = [];
    
    // Add origin
    allStops.push({
      id: `origin-${shipment.id}`,
      longitude: shipment.origin.longitude,
      latitude: shipment.origin.latitude,
      name: shipment.origin.name,
      address: shipment.origin.address,
      status: 'completed', // Origin is always completed
      stopType: 'pickup',
      stopOrder: 0,
    });
    
    // Add intermediate stops if any
    if (shipment.stops && shipment.stops.length > 0) {
      shipment.stops.forEach((stop) => {
        allStops.push({
          id: stop.id,
          longitude: stop.longitude,
          latitude: stop.latitude,
          name: stop.name,
          address: stop.address,
          status: stop.status,
          stopType: stop.type,
          stopOrder: stop.order,
          // Convert scheduled time to ETA if available
          eta: stop.scheduledTime,
          // Store actual time if available
          arrivalTime: stop.actualTime,
        });
      });
    }
    
    // Add destination
    allStops.push({
      id: `destination-${shipment.id}`,
      longitude: shipment.destination.longitude,
      latitude: shipment.destination.latitude,
      name: shipment.destination.name,
      address: shipment.destination.address,
      status: shipment.status === 'delivered' ? 'completed' : 'pending',
      stopType: 'delivery',
      stopOrder: allStops.length, // Set order to last
      eta: shipment.estimatedDelivery,
      arrivalTime: shipment.actualDelivery,
    });
    
    // Sort stops by order
    const sortedStops = [...allStops].sort((a, b) => a.stopOrder - b.stopOrder);
    setStops(sortedStops);
    
    // Auto-center map if enabled and no manual center is provided
    if (autoCenterMap && !center) {
      // Calculate center point of all stops
      const latitudes = sortedStops.map(stop => stop.latitude);
      const longitudes = sortedStops.map(stop => stop.longitude);
      
      // Add vehicle location if available
      if (shipment.vehicle?.currentLocation) {
        latitudes.push(shipment.vehicle.currentLocation.latitude);
        longitudes.push(shipment.vehicle.currentLocation.longitude);
      }
      
      // Calculate bounds
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      // Set map center to middle of bounds
      setMapCenter({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
      });
      
      // Calculate appropriate zoom level based on bounds
      const latDelta = (maxLat - minLat) * 1.5; // Add some padding
      const lngDelta = (maxLng - minLng) * 1.5;
      
      // Derive zoom from the larger of the two deltas
      const maxDelta = Math.max(latDelta, lngDelta);
      // Simple algorithm to estimate zoom level from delta
      let calculatedZoom = 14;
      if (maxDelta > 0.5) calculatedZoom = 9;
      else if (maxDelta > 0.2) calculatedZoom = 10;
      else if (maxDelta > 0.1) calculatedZoom = 11;
      else if (maxDelta > 0.05) calculatedZoom = 12;
      else if (maxDelta > 0.01) calculatedZoom = 13;
      
      setMapZoom(calculatedZoom);
    }
  }, [shipment, autoCenterMap, center]);

  // Handle map load
  const handleMapLoad = (map: mapboxgl.Map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };

  // Handle marker click
  const handleMarkerClick = (e: mapboxgl.MapMouseEvent) => {
    if (!onMarkerClick) return;
    
    // Get the marker element
    const element = e.originalEvent.target as HTMLElement;
    const markerId = element.getAttribute('data-marker-id');
    
    if (markerId) {
      onMarkerClick(markerId);
    }
  };

  // Handle route calculation completion
  const handleRouteCalculated = (routeSegments: RouteSegment[]) => {
    // Route segments have been calculated, but we need the updated stops with ETAs
    // The actual stops with ETAs will be provided via the onETACalculated callback
  };

  return (
    <div className={`shipment-tracking-map ${className}`} style={style}>
      <MapboxMap
        initialCenter={mapCenter}
        initialZoom={mapZoom || 12}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        showUserLocation={false}
        showNavigation={true}
        showScale={true}
        onMapLoad={handleMapLoad}
        onMapClick={() => {}} // Empty handler to prevent default behavior
      />
      
      {mapLoaded && mapRef.current && (
        <>
          {/* Render markers for each stop if enabled */}
          {showStopMarkers && stops.map((stop) => (
            <MapboxMarker
              key={stop.id}
              map={mapRef.current as mapboxgl.Map}
              id={stop.id}
              latitude={stop.latitude}
              longitude={stop.longitude}
              title={stop.name || ''}
              description={`${stop.address || ''} ${stop.eta ? `\nETA: ${stop.eta.toLocaleString()}` : ''}`}
              markerType={stop.stopType === 'pickup' ? 'pickup' : stop.stopType === 'delivery' ? 'delivery' : 'depot'}
              status={stop.status === 'pending' ? 'pending' : 
                      stop.status === 'arrived' ? 'in-progress' : 
                      stop.status === 'completed' ? 'completed' : 'failed'}
              styleOptions={{
                size: stop.stopType === 'pickup' || stop.stopType === 'delivery' ? 30 : 25,
              }}
              showPopup={true}
              onClick={handleMarkerClick}
            />
          ))}
          
          {/* Render vehicle marker if enabled and vehicle location is available */}
          {showVehicle && shipment.vehicle?.currentLocation && (
            <MapboxMarker
              map={mapRef.current as mapboxgl.Map}
              id={`vehicle-${shipment.vehicle.id}`}
              latitude={shipment.vehicle.currentLocation.latitude}
              longitude={shipment.vehicle.currentLocation.longitude}
              title={`${shipment.vehicle.name} (${shipment.vehicle.licensePlate})`}
              description={`Current vehicle location\nUpdated: ${shipment.vehicle.currentLocation.timestamp.toLocaleString()}`}
              markerType="vehicle"
              status="in-progress"
              styleOptions={{
                size: 35,
                pulseEffect: true,
                rotation: shipment.vehicle.currentLocation.heading,
              }}
              showPopup={true}
              onClick={handleMarkerClick}
            />
          )}
          
          {/* Render route between stops */}
          {stops.length > 1 && (
            <MapboxRoute
              map={mapRef.current as mapboxgl.Map}
              stops={stops}
              optimizeRoute={optimizeRoute}
              includeCurrentLocation={showVehicle && !!shipment.vehicle?.currentLocation}
              currentLocation={
                shipment.vehicle?.currentLocation
                  ? {
                      longitude: shipment.vehicle.currentLocation.longitude,
                      latitude: shipment.vehicle.currentLocation.latitude,
                    }
                  : undefined
              }
              showRouteSimulation={animateVehicle && !shipment.vehicle?.currentLocation}
              onRouteCalculated={handleRouteCalculated}
              onETACalculated={(stopsWithETA) => {
                // Update stops with calculated ETAs
                setStops(stopsWithETA);
                
                // Forward to parent component if needed
                if (onRouteCalculated) {
                  onRouteCalculated(stopsWithETA);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ShipmentTrackingMap; 