import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vehicle } from '../../../packages/shared/src/types/shipment-tracking';
import MapboxMarker from '../../../packages/shared/src/components/MapboxMarker';

interface VehicleMarkerProps {
  map: mapboxgl.Map;
  vehicle: Vehicle;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}

/**
 * VehicleMarker component - Enhanced version with better cleanup
 */
export function VehicleMarker({
  map,
  vehicle,
  isSelected,
  isHovered,
  onClick,
  onHover,
}: VehicleMarkerProps) {
  // Use a ref to store the marker instance
  const markerRef = useRef<{ marker?: any, cleanup?: () => void }>({});
  
  // Clean up marker when component unmounts or dependencies change
  useEffect(() => {
    // Return the cleanup function
    return () => {
      if (markerRef.current.cleanup) {
        markerRef.current.cleanup();
        // Reset ref after cleanup to avoid stale references if component re-renders quickly
        markerRef.current = {}; 
      }
    };
    // Empty dependency array ensures this runs only on mount and unmount
  }, []);
  
  // If vehicle has no location data, return null (AFTER hooks)
  if (!vehicle.currentLocation) return null;
  
  // Determine marker type based on vehicle type
  const markerType: 'pickup' | 'delivery' | 'vehicle' | 'custom' = 'vehicle';
  
  // Determine marker status
  let markerStatus: 'pending' | 'completed' | 'failed' = 'pending';
  
  // Check if vehicle data is stale
  const isStale = new Date().getTime() - new Date(vehicle.currentLocation.timestamp).getTime() > 15 * 60 * 1000;
  if (!isStale) {
    markerStatus = 'completed';
  }
  
  // Create handlers for mouse events
  const handleMouseEnter = () => onHover(true);
  const handleMouseLeave = () => onHover(false);
  
  // Store cleanup function when marker is created
  const handleMarkerCreated = (marker: any, cleanup: () => void) => {
    markerRef.current = { marker, cleanup };
  };
  
  return (
    <MapboxMarker
      map={map}
      id={vehicle.id}
      latitude={vehicle.currentLocation.latitude}
      longitude={vehicle.currentLocation.longitude}
      title={vehicle.name}
      description={`${vehicle.licensePlate} - ${vehicle.type}`}
      markerType={markerType}
      status={markerStatus}
      onClick={onClick}
      showPopup={isSelected}
      onMarkerCreated={handleMarkerCreated}
    />
  );
} 