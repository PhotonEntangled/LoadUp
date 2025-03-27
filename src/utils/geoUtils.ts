/**
 * Geographic Utilities for LoadUp Simulation
 * 
 * This file contains functions for geographic calculations used by the simulation engine,
 * including coordinate math, geofencing, and route progression.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 */
export const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
export const toDegrees = (radians: number): number => {
  return radians * (180 / Math.PI);
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return distance;
};

/**
 * Calculate the bearing/heading from one point to another
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Bearing in degrees (0-360)
 */
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const startLat = toRadians(lat1);
  const startLng = toRadians(lon1);
  const destLat = toRadians(lat2);
  const destLng = toRadians(lon2);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  
  // Normalize to 0-360
  return (brng + 360) % 360;
};

/**
 * Calculate new position based on start position, bearing and distance
 * @param lat Starting latitude in degrees
 * @param lon Starting longitude in degrees
 * @param bearing Direction of travel in degrees (0-360)
 * @param distance Distance to travel in kilometers
 * @returns New position as {latitude, longitude}
 */
export const calculateNewPosition = (
  lat: number,
  lon: number,
  bearing: number,
  distance: number
): { latitude: number; longitude: number } => {
  const angularDistance = distance / EARTH_RADIUS_KM;
  const bearingRad = toRadians(bearing);

  const startLat = toRadians(lat);
  const startLon = toRadians(lon);

  const destLat = Math.asin(
    Math.sin(startLat) * Math.cos(angularDistance) +
      Math.cos(startLat) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const destLon =
    startLon +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(startLat),
      Math.cos(angularDistance) - Math.sin(startLat) * Math.sin(destLat)
    );

  return {
    latitude: toDegrees(destLat),
    longitude: toDegrees(destLon),
  };
};

/**
 * Check if a point is inside a circular geofence
 * @param lat Latitude of point in degrees
 * @param lon Longitude of point in degrees
 * @param centerLat Latitude of geofence center in degrees
 * @param centerLon Longitude of geofence center in degrees
 * @param radiusMeters Radius of geofence in meters
 * @returns Boolean indicating whether point is inside geofence
 */
export const isInGeofence = (
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean => {
  // Convert radius from meters to kilometers
  const radiusKm = radiusMeters / 1000;
  
  // Calculate distance between point and geofence center
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  
  // Check if distance is less than radius
  return distance <= radiusKm;
};

/**
 * Calculate the bounding box for a set of coordinates
 * @param coordinates Array of [longitude, latitude] coordinates
 * @returns Bounding box as [minLng, minLat, maxLng, maxLat]
 */
export const calculateBoundingBox = (
  coordinates: [number, number][]
): [number, number, number, number] => {
  if (coordinates.length === 0) {
    return [0, 0, 0, 0];
  }

  let minLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLng = coordinates[0][0];
  let maxLat = coordinates[0][1];

  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });

  return [minLng, minLat, maxLng, maxLat];
};

/**
 * Generate a random point within a radius of a given center point
 * @param centerLat Latitude of center point in degrees
 * @param centerLon Longitude of center point in degrees
 * @param radiusKm Radius in kilometers
 * @returns Random point as {latitude, longitude}
 */
export const generateRandomPoint = (
  centerLat: number,
  centerLon: number,
  radiusKm: number
): { latitude: number; longitude: number } => {
  // Generate a random distance within the radius
  const randomDistance = radiusKm * Math.sqrt(Math.random());
  
  // Generate a random bearing
  const randomBearing = Math.random() * 360;
  
  // Calculate the new position
  return calculateNewPosition(
    centerLat,
    centerLon,
    randomBearing,
    randomDistance
  );
};

// Kuala Lumpur coordinates (for generating Malaysian routes)
export const KUALA_LUMPUR_CENTER = {
  latitude: 3.139,
  longitude: 101.6869,
};

// Common locations in Kuala Lumpur for simulation
export const KUALA_LUMPUR_LOCATIONS = [
  { name: "KLCC", latitude: 3.1586, longitude: 101.7114, type: "pickup" as const },
  { name: "KL Sentral", latitude: 3.1349, longitude: 101.6869, type: "pickup" as const },
  { name: "Bukit Bintang", latitude: 3.1488, longitude: 101.7137, type: "delivery" as const },
  { name: "Batu Caves", latitude: 3.2366, longitude: 101.6833, type: "delivery" as const },
  { name: "Shah Alam", latitude: 3.0738, longitude: 101.5183, type: "pickup" as const },
  { name: "Subang Jaya", latitude: 3.0567, longitude: 101.5852, type: "delivery" as const },
  { name: "Putrajaya", latitude: 2.9264, longitude: 101.6964, type: "waypoint" as const },
  { name: "Cyberjaya", latitude: 2.9188, longitude: 101.6520, type: "pickup" as const },
  { name: "Petaling Jaya", latitude: 3.1073, longitude: 101.6067, type: "delivery" as const },
  { name: "Ampang", latitude: 3.1644, longitude: 101.7542, type: "waypoint" as const },
]; 