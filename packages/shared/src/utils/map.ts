import { Shipment, TruckDriver, DeliveryStop, MapRegion } from '../types/index.js';
import { Marker } from 'react-native-maps';
import type { Region, LatLng } from 'react-native-maps';

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface MapMarker extends LatLng {
  id: string;
  title?: string;
  description?: string;
  markerType: 'shipment' | 'driver' | 'destination';
  status?: string;
  estimatedArrival?: Date;
}

const DEFAULT_DELTA = 0.02;
const MIN_DELTA = 0.01;
const MAX_DELTA = 0.2;

/**
 * Generates markers for active shipments and their assigned trucks
 */
export const generateShipmentMarkers = ({
  shipments,
  drivers,
}: {
  shipments: Shipment[];
  drivers: TruckDriver[];
}): MapMarker[] => {
  const markers: MapMarker[] = [];

  // Add shipment markers
  shipments.forEach((shipment) => {
    shipment.stops.forEach((stop) => {
      markers.push({
        id: `${shipment.trackingCode}-${stop.id}`,
        latitude: stop.latitude,
        longitude: stop.longitude,
        title: `Delivery: ${shipment.trackingCode}`,
        description: `Status: ${stop.status}`,
        markerType: 'shipment',
        status: stop.status,
        estimatedArrival: stop.estimatedArrival
      });
    });
  });

  // Add truck markers
  drivers.forEach((driver) => {
    if (driver.currentLocation) {
      markers.push({
        id: `driver-${driver.id}`,
        latitude: driver.currentLocation.latitude,
        longitude: driver.currentLocation.longitude,
        title: `Truck #${driver.id}`,
        description: `Current Shipment: ${driver.currentShipment || 'None'}`,
        markerType: 'driver'
      });
    }
  });

  return markers;
};

/**
 * Calculates the optimal map region to show all delivery stops
 */
export const calculateRegion = (markers: MapMarker[]): Region => {
  if (!markers.length) {
    // Default to US center if no markers
    return {
      latitude: 39.8283,
      longitude: -98.5795,
      latitudeDelta: MAX_DELTA,
      longitudeDelta: MAX_DELTA
    };
  }

  // Calculate bounds
  const lats = markers.map(m => m.latitude);
  const lngs = markers.map(m => m.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Calculate center
  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;

  // Calculate appropriate zoom level (delta)
  const latDelta = Math.max(Math.abs(maxLat - minLat) * 1.5, MIN_DELTA);
  const lngDelta = Math.max(Math.abs(maxLng - minLng) * 1.5, MIN_DELTA);

  return {
    latitude,
    longitude,
    latitudeDelta: Math.min(latDelta, MAX_DELTA),
    longitudeDelta: Math.min(lngDelta, MAX_DELTA)
  };
};

/**
 * Calculates estimated delivery times for each stop in the route
 */
export const calculateDeliveryTimes = async ({
  stops,
  driverLocation,
}: {
  stops: DeliveryStop[];
  driverLocation: { latitude: number; longitude: number };
}): Promise<DeliveryStop[]> => {
  try {
    let currentLocation = driverLocation;
    const updatedStops = [...stops];

    // Calculate times for each stop sequentially
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      
      // Get route from current location to next stop
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.longitude},${currentLocation.latitude};${stop.longitude},${stop.latitude}?access_token=${MAPBOX_API_KEY}`
      );
      
      const data = await response.json();
      const duration = data.routes[0].duration; // Duration in seconds
      
      // Update stop with estimated arrival
      updatedStops[i] = {
        ...stop,
        estimatedArrival: new Date(Date.now() + duration * 1000),
      };

      // Update current location for next iteration
      currentLocation = {
        latitude: stop.latitude,
        longitude: stop.longitude,
      };
    }

    return updatedStops;
  } catch (error) {
    console.error('Error calculating delivery times:', error);
    return stops;
  }
};

/**
 * Optimizes the delivery route to minimize travel time
 */
export const optimizeRoute = async ({
  stops,
  driverLocation,
}: {
  stops: DeliveryStop[];
  driverLocation: { latitude: number; longitude: number };
}): Promise<DeliveryStop[]> => {
  if (stops.length <= 1) {
    return stops;
  }

  try {
    // In a real implementation, this would call a routing service API
    // For now, implement a simple nearest-neighbor algorithm
    
    let currentLocation = driverLocation;
    const unvisited = [...stops];
    const optimizedRoute: DeliveryStop[] = [];

    // Simple nearest neighbor algorithm
    while (unvisited.length > 0) {
      // Find the closest unvisited stop
      let closestIdx = 0;
      let closestDistance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        unvisited[0].latitude,
        unvisited[0].longitude
      );

      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIdx = i;
        }
      }

      // Add the closest stop to the route
      const nextStop = unvisited.splice(closestIdx, 1)[0];
      optimizedRoute.push(nextStop);

      // Update current location
      currentLocation = {
        latitude: nextStop.latitude,
        longitude: nextStop.longitude,
      };
    }

    return optimizedRoute;
  } catch (error) {
    console.error('Error optimizing route:', error);
    return stops;
  }
};

/**
 * Calculates the distance between two points using the Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Converts degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
}; 