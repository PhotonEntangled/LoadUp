import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';

interface MapViewProps {
  markers?: {
    id: string;
    lat: number;
    lng: number;
    label?: string;
    type: 'origin' | 'destination' | 'driver' | 'waypoint';
  }[];
  route?: {
    origin: [number, number];
    destination: [number, number];
    waypoints?: [number, number][];
  };
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

export function MapView({
  markers = [],
  route,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 10,
  className,
  onMarkerClick,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // This is a placeholder for actual Mapbox integration
    // In a real implementation, you would initialize the map here
    const initMap = () => {
      if (!mapRef.current) return;
      
      // Simulate map loading
      setTimeout(() => {
        setMapLoaded(true);
      }, 500);
      
      // In a real implementation, you would do something like:
      // mapboxgl.accessToken = 'your-mapbox-token';
      // const map = new mapboxgl.Map({
      //   container: mapRef.current,
      //   style: 'mapbox://styles/mapbox/streets-v11',
      //   center: center,
      //   zoom: zoom
      // });
      
      // Add markers, routes, etc.
    };
    
    initMap();
    
    // Cleanup function
    return () => {
      // Cleanup map instance if needed
    };
  }, [center, zoom]);

  return (
    <div className={cn('relative rounded-md border overflow-hidden', className)}>
      <div 
        ref={mapRef} 
        className="h-full w-full min-h-[300px] bg-gray-100"
      >
        {!mapLoaded ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Map integration placeholder. In production, this would display a Mapbox map with markers and routes.
            </p>
            {markers.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-md shadow-md text-xs">
                <p className="font-medium mb-1">Map would show:</p>
                <ul className="list-disc pl-4">
                  {markers.map(marker => (
                    <li key={marker.id}>
                      {marker.type}: {marker.label || `at ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`}
                    </li>
                  ))}
                  {route && (
                    <li>
                      Route from [{route.origin[0].toFixed(4)}, {route.origin[1].toFixed(4)}] to 
                      [{route.destination[0].toFixed(4)}, {route.destination[1].toFixed(4)}]
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 