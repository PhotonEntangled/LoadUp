import React, { useEffect, useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import type { LineLayer } from 'react-map-gl';
import { Vehicle } from '../../types/vehicle';
import { VEHICLE_MAP_ID } from '../../utils/maps/constants';

interface MapRouteLayerProps {
  mapId?: string;
  vehicles: Vehicle[];
}

/**
 * MapRouteLayer - Renders route lines for vehicles with route data
 * 
 * Uses react-map-gl Source and Layer components for better integration with React
 */
const MapRouteLayer: React.FC<MapRouteLayerProps> = ({
  mapId = VEHICLE_MAP_ID,
  vehicles,
}) => {
  // Generate GeoJSON data for routes
  const routeGeoJSON = useMemo(() => {
    const features = vehicles
      .filter(vehicle => {
        const hasRoute = 'route' in vehicle && (vehicle as any).route;
        const hasRouteData = 'routeData' in vehicle && (vehicle as any).routeData;
        return hasRoute || hasRouteData;
      })
      .map(vehicle => {
        // First try to use routeData if available (preferred format from SimulationFromShipmentService)
        if ('routeData' in vehicle && (vehicle as any).routeData) {
          const routeData = (vehicle as any).routeData;
          if (routeData.type === 'LineString' && Array.isArray(routeData.coordinates)) {
            return {
              type: 'Feature',
              properties: {
                vehicleId: vehicle.id,
                color: routeData.color || '#0080ff',
                width: routeData.width || 4,
              },
              geometry: {
                type: 'LineString',
                coordinates: routeData.coordinates,
              },
            };
          }
        }
        
        // If no routeData, try to use route property
        const route = (vehicle as any).route;
        if (!route) return null;
        
        // Check for different route formats
        // 1. Support stops format (used by SimulationFromShipmentService)
        if (Array.isArray(route.stops) && route.stops.length >= 2) {
          return {
            type: 'Feature',
            properties: {
              vehicleId: vehicle.id,
              color: (vehicle as any).visuals?.routeLineColor || '#0080ff',
              width: (vehicle as any).visuals?.routeLineWidth || 4,
            },
            geometry: {
              type: 'LineString',
              coordinates: route.stops.map((stop: any) => [
                stop.location.longitude, 
                stop.location.latitude
              ]),
            },
          };
        }
        
        // 2. Start/End format
        if (route.start && route.end) {
          return {
            type: 'Feature',
            properties: {
              vehicleId: vehicle.id,
              color: (vehicle as any).visuals?.routeLineColor || '#0080ff',
              width: (vehicle as any).visuals?.routeLineWidth || 4,
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [route.start.longitude, route.start.latitude],
                [route.end.longitude, route.end.latitude],
              ],
            },
          };
        }
        
        // 3. Waypoints format (array of coordinates)
        if (Array.isArray(route.waypoints) && route.waypoints.length >= 2) {
          return {
            type: 'Feature',
            properties: {
              vehicleId: vehicle.id,
              color: (vehicle as any).visuals?.routeLineColor || '#0080ff',
              width: (vehicle as any).visuals?.routeLineWidth || 4,
            },
            geometry: {
              type: 'LineString',
              coordinates: route.waypoints.map((waypoint: any) => 
                [waypoint.longitude, waypoint.latitude]
              ),
            },
          };
        }
        
        // 4. Simple array of [lng, lat] coordinates
        if (Array.isArray(route) && route.length >= 2) {
          return {
            type: 'Feature',
            properties: {
              vehicleId: vehicle.id,
              color: (vehicle as any).visuals?.routeLineColor || '#0080ff',
              width: (vehicle as any).visuals?.routeLineWidth || 4,
            },
            geometry: {
              type: 'LineString',
              coordinates: route.map((coord: any) => 
                Array.isArray(coord) ? coord : [coord.longitude, coord.latitude]
              ),
            },
          };
        }
        
        // Fall back to creating a simple line if we have current and next position
        if ('currentPosition' in vehicle && 'nextPosition' in vehicle) {
          const current = (vehicle as any).currentPosition;
          const next = (vehicle as any).nextPosition;
          
          if (current && next) {
            return {
              type: 'Feature',
              properties: {
                vehicleId: vehicle.id,
                color: (vehicle as any).visuals?.routeLineColor || '#0080ff',
                width: (vehicle as any).visuals?.routeLineWidth || 4,
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [current.longitude, current.latitude],
                  [next.longitude, next.latitude],
                ],
              },
            };
          }
        }
        
        // If we can't determine a route format, log a warning and return null
        console.warn(`[MapRouteLayer] Could not determine route format for vehicle ${vehicle.id}`, route);
        return null;
      })
      .filter(Boolean);
    
    return {
      type: 'FeatureCollection',
      features,
    };
  }, [vehicles]);
  
  // Line layer style
  const lineLayer: LineLayer = {
    id: 'route-lines',
    type: 'line',
    paint: {
      // Use get expression to read properties from the feature
      'line-width': ['get', 'width'],
      'line-color': ['get', 'color'],
      'line-opacity': 0.7,
      'line-dasharray': [0.5, 1.5], // Make routes slightly dashed for visibility
    },
  };
  
  // Log routes being rendered
  useEffect(() => {
    console.log(`[MapRouteLayer] Rendering ${routeGeoJSON.features.length} routes`);
    
    // Debug route data if there are routes but they aren't showing
    if (routeGeoJSON.features.length > 0) {
      console.log(`[MapRouteLayer] First route sample:`, routeGeoJSON.features[0]);
    } else if (vehicles.length > 0) {
      console.log(`[MapRouteLayer] No routes found in ${vehicles.length} vehicles`);
      if ('route' in vehicles[0]) {
        console.log(`[MapRouteLayer] First vehicle has route property:`, (vehicles[0] as any).route);
      } else {
        console.log(`[MapRouteLayer] First vehicle is missing route property`);
      }
    }
  }, [routeGeoJSON.features.length, vehicles]);
  
  // Create an outline layer to make routes more visible
  const outlineLayer: LineLayer = {
    id: 'route-outlines',
    type: 'line',
    paint: {
      'line-width': ['+', ['get', 'width'], 2],
      'line-color': '#ffffff',
      'line-opacity': 0.5,
      'line-blur': 1,
    },
  };
  
  // Return null if no routes
  if (routeGeoJSON.features.length === 0) {
    return null;
  }
  
  // Render routes
  return (
    <Source id="vehicle-routes" type="geojson" data={routeGeoJSON}>
      {/* Add outline layer first (underneath) */}
      <Layer {...outlineLayer} />
      {/* Then add the main route line on top */}
      <Layer {...lineLayer} />
    </Source>
  );
};

export default React.memo(MapRouteLayer); 