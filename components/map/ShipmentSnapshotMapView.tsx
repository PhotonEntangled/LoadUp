import React, { useState, useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vehicle, ShipmentStop, ShipmentDetails } from '../../../../packages/shared/src/types/shipment-tracking';
import MapboxMap from '../../../../packages/shared/src/components/MapboxMap';
import MapboxMarker from '../../../../packages/shared/src/components/MapboxMarker';
import MapboxRoute from '../../../../packages/shared/src/components/MapboxRoute';
import { Button } from '../ui/button';
import { Share, Clock, AlertCircle } from 'lucide-react';

// Enum for ShipmentTrackingStatus to match our expected values
type ShipmentTrackingStatus = 
  | 'pending' 
  | 'processing' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

// Types
export interface CustomerTrackingViewProps {
  className?: string;
  shipment: ShipmentDetails;
  vehicle?: Vehicle;
  showVehicleLocation?: boolean;
  showShareOptions?: boolean;
  onShare?: () => void;
  onNotificationEnable?: () => void;
  onError?: (error: Error) => void;
  height?: string | number;
  width?: string | number;
}

/**
 * CustomerTrackingView component - Simplified tracking view for customers
 * Includes ETA display and sharing options
 */
export function CustomerTrackingView({
  className = '',
  shipment,
  vehicle,
  showVehicleLocation = true,
  showShareOptions = true,
  onShare,
  onNotificationEnable,
  onError,
  height = '400px',
  width = '100%',
}: CustomerTrackingViewProps) {
  // Refs
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Local state
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentEta, setCurrentEta] = useState<Date | null>(
    shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery) : null
  );
  const [shareUrl, setShareUrl] = useState<string>('');
  
  // Format stops for the route
  const stops = useMemo(() => {
    if (!shipment.stops || shipment.stops.length === 0) {
      // If no intermediate stops, create origin and destination stops
      return [
        {
          id: 'origin',
          latitude: shipment.origin.latitude,
          longitude: shipment.origin.longitude,
          name: 'Origin',
          address: shipment.origin.address,
          type: 'pickup' as const,
          status: 'completed' as const,
          order: 0,
        },
        {
          id: 'destination',
          latitude: shipment.destination.latitude,
          longitude: shipment.destination.longitude,
          name: 'Destination',
          address: shipment.destination.address,
          type: 'delivery' as const,
          status: 'pending' as const,
          order: 1,
        },
      ];
    }
    
    // Otherwise, use the shipment's stops
    return shipment.stops.map((stop: any) => ({
      id: stop.id,
      latitude: stop.latitude,
      longitude: stop.longitude,
      name: stop.name,
      address: stop.address,
      type: stop.type,
      status: stop.status,
      order: stop.order,
    }));
  }, [shipment]);
  
  // Calculate remaining time
  const remainingTime = useMemo(() => {
    if (!currentEta) return null;
    
    const now = new Date();
    const diff = currentEta.getTime() - now.getTime();
    
    if (diff <= 0) return 'Arriving now';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }, [currentEta]);
  
  // Generate share URL on mount
  useEffect(() => {
    // Create a shareable URL for this tracking view
    const baseUrl = window.location.origin;
    const trackingUrl = `${baseUrl}/tracking/${shipment.id}`;
    setShareUrl(trackingUrl);
  }, [shipment.id]);
  
  // Handle map load
  const handleMapLoad = (map: mapboxgl.Map) => {
    mapRef.current = map;
    setIsMapLoaded(true);
    
    // Fit the map to show the entire route
    if (map && stops.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      stops.forEach((stop: any) => {
        bounds.extend([stop.longitude, stop.latitude]);
      });
      
      // Add vehicle position to bounds if showing
      if (showVehicleLocation && vehicle?.currentLocation) {
        bounds.extend([
          vehicle.currentLocation.longitude,
          vehicle.currentLocation.latitude,
        ]);
      }
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  };
  
  // Handle map error
  const handleMapError = (err: Error) => {
    console.error('Map error:', err);
    setError(err);
    if (onError) onError(err);
  };
  
  // Handle share button click
  const handleShare = () => {
    // Try to use the native share API if available
    if (navigator.share) {
      navigator.share({
        title: `Tracking shipment ${shipment.trackingNumber}`,
        text: `Track your shipment in real-time`,
        url: shareUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else if (onShare) {
      // Otherwise, call the provided onShare callback
      onShare();
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Tracking link copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };
  
  // Handle notification enable
  const handleNotificationEnable = () => {
    if (onNotificationEnable) {
      onNotificationEnable();
    } else {
      // Simple fallback if no handler provided
      alert('You will be notified when your shipment is out for delivery');
    }
  };
  
  // Get shipment status text
  const getShipmentStatusText = (): string => {
    const status = shipment.status as ShipmentTrackingStatus;
    
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'processing':
        return 'Processing';
      case 'in_transit':
        return 'In Transit';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Processing';
    }
  };
  
  return (
    <div className={`customer-tracking-view ${className}`} style={{ height, width }}>
      {error && (
        <div className="error-container p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-700 text-sm font-medium">
            Error: {error.message}
          </p>
        </div>
      )}
      
      {/* Shipment info bar */}
      <div className="shipment-info bg-white p-4 rounded-md shadow-sm mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{getShipmentStatusText()}</h3>
            <p className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</p>
          </div>
          {showShareOptions && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="text-gray-500"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}
        </div>
        
        {currentEta && remainingTime && (
          <div className="eta-display flex items-center mt-3 p-2 bg-blue-50 rounded-md">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-700">
                Estimated arrival: {remainingTime}
              </p>
              <p className="text-xs text-blue-500">
                {currentEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, 
                {currentEta.toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Map view */}
      <div className="map-container relative rounded-md overflow-hidden" style={{ height: 'calc(100% - 140px)' }}>
        <MapboxMap
          initialCenter={{ 
            latitude: stops[0]?.latitude || 0, 
            longitude: stops[0]?.longitude || 0 
          }}
          initialZoom={12}
          mapStyle="streets-v12"
          showNavigation
          showScale
          onMapLoad={handleMapLoad}
          onError={handleMapError}
          className="h-full w-full"
        >
          {/* Vehicle Marker */}
          {vehicle && (
            <MapboxMarker
              longitude={vehicle.currentLocation.longitude}
              latitude={vehicle.currentLocation.latitude}
              markerType="vehicle"
              label={vehicle.id}
            />
          )}

          {/* Stop Markers */}
          {stops.map((stop: any, index: number) => (
            <MapboxMarker
              key={`stop-${index}`}
              longitude={stop.longitude}
              latitude={stop.latitude}
              markerType="stop"
              label={stop.name}
            />
          ))}

          {/* Route */}
          {stops.length > 1 && (
            <MapboxRoute
              coordinates={stops.map((stop: any) => [stop.longitude, stop.latitude])}
              routeOptions={{ color: '#3887be', width: 5 }}
              onRouteFailed={(err: any) => {
                console.error('Failed to fetch route:', err);
                if (onError) onError(err);
              }}
              onRouteLoaded={(route) => {
                if (route?.bounds && mapRef.current) {
                  mapRef.current.fitBounds(route.bounds, { padding: 60 });
                }
              }}
            />
          )}
        </MapboxMap>
      </div>
      
      {/* Action buttons */}
      <div className="actions mt-4">
        <Button
          className="w-full h-12 flex items-center justify-center"
          variant="outline"
          onClick={handleNotificationEnable}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          Notify me when out for delivery
        </Button>
      </div>
    </div>
  );
} 