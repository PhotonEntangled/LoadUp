import { calculateDistance } from './coordinateUtils';
import { Route, RoutePoint, RouteSegment } from './routeCalculation';

/**
 * ETA Status represents the ETA in relation to target time
 */
export type ETAStatus = 'early' | 'on-time' | 'delayed' | 'significantly-delayed' | 'unknown';

/**
 * ETA Details includes all relevant information about an estimated arrival
 */
export interface ETADetails {
  estimatedArrival: Date;
  targetArrival?: Date;
  minutesRemaining: number;
  status: ETAStatus;
  formattedTime: string;
  formattedStatus: string;
  distanceRemaining: number; // in kilometers
  averageSpeed: number; // in km/h
}

/**
 * Traffic factor by time of day (multiplier for base duration)
 */
const TRAFFIC_FACTORS: { [key: string]: number } = {
  early_morning: 0.9,  // 4am-7am: Light traffic
  morning_rush: 1.5,   // 7am-10am: Heavy traffic
  midday: 1.1,         // 10am-4pm: Moderate traffic
  evening_rush: 1.6,   // 4pm-7pm: Heavy traffic
  evening: 1.2,        // 7pm-10pm: Moderate traffic
  night: 0.8           // 10pm-4am: Light traffic
};

/**
 * Get traffic factor based on time of day
 */
export const getTrafficFactor = (time: Date): number => {
  const hour = time.getHours();
  
  if (hour >= 4 && hour < 7) return TRAFFIC_FACTORS.early_morning;
  if (hour >= 7 && hour < 10) return TRAFFIC_FACTORS.morning_rush;
  if (hour >= 10 && hour < 16) return TRAFFIC_FACTORS.midday;
  if (hour >= 16 && hour < 19) return TRAFFIC_FACTORS.evening_rush;
  if (hour >= 19 && hour < 22) return TRAFFIC_FACTORS.evening;
  return TRAFFIC_FACTORS.night;
};

/**
 * Calculate the ETA for a specific stop in a route
 */
export const calculateStopETA = (
  route: Route,
  stopId: string,
  currentLocation: [number, number],
  currentTime: Date = new Date(),
  targetTime?: Date
): ETADetails | null => {
  // Find the stop in the route
  const stopIndex = route.stops.findIndex(stop => stop.id === stopId);
  if (stopIndex === -1) return null;
  
  const stop = route.stops[stopIndex];
  
  // Calculate distance and time from current location to the stop
  let distanceRemaining = 0;
  let timeRemaining = 0;
  
  // If we're already at this stop, ETA is now
  if (stopIndex === 0 && 
      currentLocation[0] === stop.coordinates[0] && 
      currentLocation[1] === stop.coordinates[1]) {
    return {
      estimatedArrival: new Date(currentTime),
      targetArrival: targetTime,
      minutesRemaining: 0,
      status: 'on-time',
      formattedTime: 'Now',
      formattedStatus: 'Arrived',
      distanceRemaining: 0,
      averageSpeed: 0
    };
  }
  
  // First, add distance from current location to next stop
  if (stopIndex > 0) {
    const distanceToNextStop = calculateDistance(currentLocation, stop.coordinates);
    distanceRemaining += distanceToNextStop;
    
    // Calculate time based on an average speed of 50 km/h and current traffic
    const trafficFactor = getTrafficFactor(currentTime);
    timeRemaining += (distanceToNextStop / 50) * 3600 * trafficFactor; // in seconds
  }
  
  // Add remaining segments
  for (let i = 0; i < stopIndex; i++) {
    if (i < route.segments.length) {
      distanceRemaining += route.segments[i].distance;
      
      // Apply traffic factor to each segment
      const segmentStartTime = new Date(
        currentTime.getTime() + timeRemaining * 1000
      );
      const trafficFactor = getTrafficFactor(segmentStartTime);
      timeRemaining += route.segments[i].duration * trafficFactor;
    }
  }
  
  // Calculate ETA
  const estimatedArrival = new Date(
    currentTime.getTime() + timeRemaining * 1000
  );
  
  // Calculate status
  let status: ETAStatus = 'unknown';
  if (targetTime) {
    const minutesDifference = 
      (estimatedArrival.getTime() - targetTime.getTime()) / (1000 * 60);
    
    if (minutesDifference < -15) {
      status = 'early';
    } else if (minutesDifference <= 5) {
      status = 'on-time';
    } else if (minutesDifference <= 30) {
      status = 'delayed';
    } else {
      status = 'significantly-delayed';
    }
  } else {
    status = 'on-time'; // No target, so we're on our own schedule
  }
  
  // Calculate minutes remaining
  const minutesRemaining = Math.round(timeRemaining / 60);
  
  // Format time
  const formattedTime = minutesRemaining <= 0 
    ? 'Now' 
    : formatMinutesRemaining(minutesRemaining);
  
  // Format status
  let formattedStatus = '';
  switch (status) {
    case 'early':
      formattedStatus = 'Early';
      break;
    case 'on-time':
      formattedStatus = 'On Time';
      break;
    case 'delayed':
      formattedStatus = 'Delayed';
      break;
    case 'significantly-delayed':
      formattedStatus = 'Significantly Delayed';
      break;
    default:
      formattedStatus = 'Unknown';
  }
  
  // Calculate average speed (km/h)
  const averageSpeed = minutesRemaining > 0 
    ? (distanceRemaining / (minutesRemaining / 60)) 
    : 0;
  
  return {
    estimatedArrival,
    targetArrival: targetTime,
    minutesRemaining,
    status,
    formattedTime,
    formattedStatus,
    distanceRemaining,
    averageSpeed
  };
};

/**
 * Format minutes remaining into a human-readable string
 */
export const formatMinutesRemaining = (minutes: number): string => {
  if (minutes < 1) return 'Less than a minute';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
};

/**
 * Calculate ETAs for all stops in a route
 */
export const calculateAllETAs = (
  route: Route,
  currentLocation: [number, number],
  currentTime: Date = new Date()
): Map<string, ETADetails> => {
  const etaMap = new Map<string, ETADetails>();
  
  for (const stop of route.stops) {
    const eta = calculateStopETA(route, stop.id, currentLocation, currentTime, stop.time);
    if (eta) {
      etaMap.set(stop.id, eta);
    }
  }
  
  return etaMap;
};

/**
 * Get the status color for an ETA
 */
export const getETAStatusColor = (status: ETAStatus): string => {
  switch (status) {
    case 'early':
      return '#10B981'; // Green
    case 'on-time':
      return '#3B82F6'; // Blue
    case 'delayed':
      return '#F59E0B'; // Amber
    case 'significantly-delayed':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
}; 