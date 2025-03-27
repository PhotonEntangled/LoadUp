import React, { memo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { Vehicle } from '../../store/map/useVehicleStore';
import type { LocationData } from '../../store/map/useLocationStore';

interface RouteLayerProps {
  vehicle: Vehicle;
  location?: LocationData;
}

const RouteLayer: React.FC<RouteLayerProps> = ({ vehicle, location }) => {
  // Skip rendering if no location or if vehicle has no current shipment
  if (!location || !vehicle.currentShipmentId) {
    return null;
  }
  
  // Create GeoJSON for the route line
  const generateRouteGeoJSON = () => {
    // In this refactored version, routes are fetched separately based on shipment ID
    // For now, let's create a simple route from the vehicle to a dummy destination
    const { longitude, latitude } = location;
    
    // Simple mock route - in production, this would be fetched from an API
    const coordinates: [number, number][] = [
      [longitude, latitude],
      [longitude + 0.02, latitude + 0.01], // Simple offset for demo
    ];
    
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
  };
  
  // Define colors based on vehicle status
  const getRouteColor = () => {
    switch (vehicle.status) {
      case 'active':
        return '#3B82F6'; // Blue
      case 'idle':
        return '#10B981'; // Green
      case 'enroute':
        return '#F59E0B'; // Amber
      case 'offline':
        return '#6B7280'; // Gray
      default:
        return '#3B82F6'; // Default to blue
    }
  };
  
  const routeGeoJSON = {
    type: 'FeatureCollection',
    features: [generateRouteGeoJSON()]
  };
  
  return (
    <Source id={`route-${vehicle.id}`} type="geojson" data={routeGeoJSON}>
      <Layer
        id={`route-layer-${vehicle.id}`}
        type="line"
        paint={{
          'line-color': getRouteColor(),
          'line-width': 3,
          'line-dasharray': vehicle.status === 'idle' ? [2, 1] : undefined,
          'line-opacity': 0.8
        }}
      />
    </Source>
  );
};

export default memo(RouteLayer, (prevProps, nextProps) => {
  // Only re-render if the route or status changes
  if (prevProps.vehicle.status !== nextProps.vehicle.status) {
    return false;
  }
  
  // Check if location exists in both
  if (!prevProps.location || !nextProps.location) {
    return prevProps.location === nextProps.location;
  }
  
  // Check if location changed
  if (prevProps.location.latitude !== nextProps.location.latitude ||
      prevProps.location.longitude !== nextProps.location.longitude) {
    return false;
  }
  
  // Check if shipment ID changed
  if (prevProps.vehicle.currentShipmentId !== nextProps.vehicle.currentShipmentId) {
    return false;
  }
  
  // Nothing important changed, no need to re-render
  return true;
}); 