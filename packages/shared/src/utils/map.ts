import { Shipment, TruckDriver, DeliveryStop, MapRegion } from '../types';

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

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
        latitude: stop.latitude,
        longitude: stop.longitude,
        title: `Delivery: ${shipment.trackingCode}`,
        type: 'delivery',
        status: stop.status,
        estimatedArrival: stop.estimatedArrival,
      });
    });
  });

  // Add truck markers
  drivers.forEach((driver) => {
    if (driver.currentLocation) {
      markers.push({
        latitude: driver.currentLocation.latitude,
        longitude: driver.currentLocation.longitude,
        title: `${driver.firstName} ${driver.lastName}`,
        type: 'truck',
        truckType: driver.truckType,
        currentShipment: driver.currentShipment,
      });
    }
  });

  return markers;
};

/**
 * Calculates the optimal map region to show all delivery stops
 */
export const calculateShipmentRegion = ({
  stops,
}: {
  stops: DeliveryStop[];
}): MapRegion => {
  if (!stops.length) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const lats = stops.map(stop => stop.latitude);
  const lngs = stops.map(stop => stop.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding padding

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
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
 * Optimizes the route order for multiple delivery stops
 */
export const optimizeRoute = async ({
  stops,
  driverLocation,
}: {
  stops: DeliveryStop[];
  driverLocation: { latitude: number; longitude: number };
}): Promise<DeliveryStop[]> => {
  try {
    // Convert stops to Mapbox coordinates format
    const coordinates = stops.map(stop => 
      `${stop.longitude},${stop.latitude}`
    ).join(';');

    // Call Mapbox Optimization API
    const response = await fetch(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${driverLocation.longitude},${driverLocation.latitude};${coordinates}?access_token=${MAPBOX_API_KEY}`
    );

    const data = await response.json();
    
    // Reorder stops based on optimization
    const optimizedStops = data.waypoints.map((waypoint: any) => 
      stops[waypoint.waypoint_index - 1]
    );

    return optimizedStops;
  } catch (error) {
    console.error('Error optimizing route:', error);
    return stops;
  }
}; 