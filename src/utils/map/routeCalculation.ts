import { calculateDistance } from './coordinateUtils';

export interface RoutePoint {
  coordinates: [number, number];
  name?: string;
  type: 'pickup' | 'delivery' | 'vehicle' | 'waypoint';
  time?: Date;
  status?: 'pending' | 'completed' | 'current' | 'missed';
  id: string;
}

export interface RouteSegment {
  id: string;
  from: RoutePoint;
  to: RoutePoint;
  distance: number; // in kilometers
  duration: number; // in seconds
  coordinates: [number, number][];
  status: 'completed' | 'active' | 'upcoming';
  color: string;
}

export interface Route {
  id: string;
  name: string;
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  stops: RoutePoint[];
  vehicleId?: string;
  driverId?: string;
}

// Colors for route segments based on status
const ROUTE_COLORS = {
  completed: '#10B981', // Green
  active: '#3B82F6',    // Blue
  upcoming: '#6B7280'   // Gray
};

/**
 * Calculate a simplified route between two points using a straight line
 * In a real implementation, this would call a routing API
 */
export const calculateSimpleRoute = (
  from: RoutePoint,
  to: RoutePoint,
  status: 'completed' | 'active' | 'upcoming' = 'upcoming'
): RouteSegment => {
  // For a straight line route, we just create a segment between the two points
  const distance = calculateDistance(from.coordinates, to.coordinates);
  
  // Estimated duration based on typical driving speed (50 km/h)
  const duration = (distance / 50) * 3600; // Convert to seconds
  
  // For a real implementation, this would fetch the actual route from a routing API
  // Here we just create a straight line between the two points
  return {
    id: `${from.id}-to-${to.id}`,
    from,
    to,
    distance,
    duration,
    coordinates: [from.coordinates, to.coordinates],
    status,
    color: ROUTE_COLORS[status]
  };
};

/**
 * Calculate a multi-stop route using an array of RoutePoints
 */
export const calculateMultiStopRoute = (
  stops: RoutePoint[],
  currentStopIndex: number = -1
): Route => {
  if (stops.length < 2) {
    throw new Error('A route requires at least 2 stops');
  }
  
  const segments: RouteSegment[] = [];
  let totalDistance = 0;
  let totalDuration = 0;
  
  // Generate segments between each pair of consecutive stops
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    
    // Determine segment status based on current stop
    let status: 'completed' | 'active' | 'upcoming' = 'upcoming';
    if (i < currentStopIndex) {
      status = 'completed';
    } else if (i === currentStopIndex) {
      status = 'active';
    }
    
    const segment = calculateSimpleRoute(from, to, status);
    segments.push(segment);
    
    totalDistance += segment.distance;
    totalDuration += segment.duration;
  }
  
  const routeId = `route-${stops[0].id}-to-${stops[stops.length - 1].id}`;
  const routeName = `Route from ${stops[0].name || 'Start'} to ${stops[stops.length - 1].name || 'End'}`;
  
  return {
    id: routeId,
    name: routeName,
    segments,
    totalDistance,
    totalDuration,
    stops
  };
};

/**
 * Extract all coordinates from a route for calculating bounds
 */
export const extractAllRouteCoordinates = (route: Route): [number, number][] => {
  const coordinates: [number, number][] = [];
  
  // Add all stop coordinates
  route.stops.forEach(stop => {
    coordinates.push(stop.coordinates);
  });
  
  // Add all segment coordinates
  route.segments.forEach(segment => {
    segment.coordinates.forEach(coord => {
      // Skip duplicates (stop coordinates are already added)
      const isDuplicate = coordinates.some(
        ([lon, lat]) => lon === coord[0] && lat === coord[1]
      );
      if (!isDuplicate) {
        coordinates.push(coord);
      }
    });
  });
  
  return coordinates;
};

/**
 * Calculate ETA to each stop based on route segments
 */
export const calculateETAs = (
  route: Route,
  startTime: Date = new Date()
): Map<string, Date> => {
  const ETAs = new Map<string, Date>();
  let currentTime = new Date(startTime);
  
  // Start point has ETA of start time
  ETAs.set(route.stops[0].id, new Date(currentTime));
  
  // Calculate ETAs for each subsequent stop
  for (let i = 0; i < route.segments.length; i++) {
    const segment = route.segments[i];
    const nextStop = route.stops[i + 1];
    
    // Add segment duration to current time
    currentTime = new Date(currentTime.getTime() + segment.duration * 1000);
    
    // Set ETA for the destination of this segment
    ETAs.set(nextStop.id, new Date(currentTime));
  }
  
  return ETAs;
};

/**
 * Get a simplified description of a route segment
 */
export const getSegmentDescription = (segment: RouteSegment): string => {
  const distance = segment.distance.toFixed(1);
  const duration = Math.round(segment.duration / 60); // Convert to minutes
  
  return `${distance} km (${duration} min) from ${segment.from.name || 'Start'} to ${segment.to.name || 'Destination'}`;
}; 