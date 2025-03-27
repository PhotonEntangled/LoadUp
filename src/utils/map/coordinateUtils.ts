import { Coordinate } from './boundingBox';

/**
 * Utilities for coordinate calculations and manipulations
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees
 */
export const radiansToDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_KM * c;
};

/**
 * Calculates the bearing/heading from one coordinate to another
 * @returns Bearing in degrees (0-360, where 0 is north)
 */
export const calculateBearing = (from: Coordinate, to: Coordinate): number => {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  
  const startLat = degreesToRadians(lat1);
  const startLng = degreesToRadians(lng1);
  const destLat = degreesToRadians(lat2);
  const destLng = degreesToRadians(lng2);
  
  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  
  let bearing = Math.atan2(y, x);
  bearing = radiansToDegrees(bearing);
  
  // Normalize to 0-360
  return (bearing + 360) % 360;
};

/**
 * Creates a coordinate at the given distance and bearing from the start coordinate
 * @param start - Starting coordinate [lng, lat]
 * @param distanceKm - Distance in kilometers
 * @param bearingDegrees - Bearing in degrees (0 is north, 90 is east)
 * @returns New coordinate [lng, lat]
 */
export const createCoordinateAtDistance = (
  start: Coordinate,
  distanceKm: number,
  bearingDegrees: number
): Coordinate => {
  const [startLng, startLat] = start;
  
  const startLatRad = degreesToRadians(startLat);
  const startLngRad = degreesToRadians(startLng);
  const bearingRad = degreesToRadians(bearingDegrees);
  
  const distance = distanceKm / EARTH_RADIUS_KM;
  
  const destLatRad = Math.asin(
    Math.sin(startLatRad) * Math.cos(distance) +
    Math.cos(startLatRad) * Math.sin(distance) * Math.cos(bearingRad)
  );
  
  const destLngRad = startLngRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distance) * Math.cos(startLatRad),
    Math.cos(distance) - Math.sin(startLatRad) * Math.sin(destLatRad)
  );
  
  const destLat = radiansToDegrees(destLatRad);
  const destLng = radiansToDegrees(destLngRad);
  
  return [destLng, destLat];
};

/**
 * Interpolates between two coordinates based on a factor (0-1)
 * @param start - Starting coordinate
 * @param end - Ending coordinate
 * @param factor - Interpolation factor (0 = start, 1 = end)
 * @returns Interpolated coordinate
 */
export const interpolateCoordinate = (
  start: Coordinate,
  end: Coordinate,
  factor: number
): Coordinate => {
  // Ensure factor is between 0 and 1
  const t = Math.max(0, Math.min(1, factor));
  
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  
  // Simple linear interpolation
  return [
    startLng + (endLng - startLng) * t,
    startLat + (endLat - startLat) * t
  ];
};

/**
 * Creates a path of coordinates between two points with a specified number of steps
 * @returns Array of coordinates including start and end
 */
export const createPath = (
  start: Coordinate,
  end: Coordinate,
  steps: number
): Coordinate[] => {
  const path: Coordinate[] = [start];
  
  for (let i = 1; i < steps; i++) {
    const factor = i / steps;
    path.push(interpolateCoordinate(start, end, factor));
  }
  
  path.push(end);
  return path;
};

/**
 * Converts a coordinate to a string format
 */
export const coordinateToString = (coordinate: Coordinate): string => {
  const [lng, lat] = coordinate;
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
};

/**
 * Tries to parse a string into a coordinate
 * @returns Coordinate or null if invalid
 */
export const parseCoordinate = (str: string): Coordinate | null => {
  // Try common formats: "lat,lng", "lat, lng", "[lng,lat]"
  
  // Clean up the string
  const cleaned = str.trim().replace(/[\[\]]/g, '');
  
  // Split by comma
  const parts = cleaned.split(',').map(s => s.trim());
  
  if (parts.length === 2) {
    const num1 = parseFloat(parts[0]);
    const num2 = parseFloat(parts[1]);
    
    if (!isNaN(num1) && !isNaN(num2)) {
      // Determine if it's "lat,lng" or "lng,lat" format
      // Assume "lat,lng" format if latitude is within valid range
      if (Math.abs(num1) <= 90) {
        return [num2, num1]; // Convert to [lng, lat]
      } else {
        return [num1, num2]; // Already in [lng, lat]
      }
    }
  }
  
  return null;
}; 