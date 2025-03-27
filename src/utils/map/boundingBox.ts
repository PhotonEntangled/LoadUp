/**
 * Utilities for calculating and manipulating map bounding boxes
 */
import { MapBounds } from '../../components/map/FleetOverviewMapV2';

// A geographic coordinate [lng, lat]
export type Coordinate = [number, number];

// A bounding box defined by southwest and northeast corners
export type BoundingBox = [Coordinate, Coordinate];

/**
 * Calculate a bounding box that contains all provided coordinates
 */
export const calculateBoundingBox = (coordinates: Coordinate[]): BoundingBox | null => {
  if (!coordinates.length) return null;
  
  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];
  
  // Find min/max values
  coordinates.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });
  
  // Return southwest and northeast corners
  return [
    [minLng, minLat], // Southwest
    [maxLng, maxLat]  // Northeast
  ];
};

/**
 * Expand a bounding box by a padding factor
 */
export const expandBoundingBox = (
  boundingBox: BoundingBox, 
  paddingFactor = 0.1
): BoundingBox => {
  const [[minLng, minLat], [maxLng, maxLat]] = boundingBox;
  
  const lngDelta = (maxLng - minLng) * paddingFactor;
  const latDelta = (maxLat - minLat) * paddingFactor;
  
  return [
    [minLng - lngDelta, minLat - latDelta],
    [maxLng + lngDelta, maxLat + latDelta]
  ];
};

/**
 * Check if a coordinate is within a bounding box
 */
export const isCoordinateInBoundingBox = (
  coordinate: Coordinate, 
  boundingBox: BoundingBox
): boolean => {
  const [lng, lat] = coordinate;
  const [[minLng, minLat], [maxLng, maxLat]] = boundingBox;
  
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
};

/**
 * Calculate the center point of a bounding box
 */
export const calculateBoundingBoxCenter = (boundingBox: BoundingBox): Coordinate => {
  const [[minLng, minLat], [maxLng, maxLat]] = boundingBox;
  
  return [
    (minLng + maxLng) / 2,
    (minLat + maxLat) / 2
  ];
};

/**
 * Merge multiple bounding boxes into one that contains all of them
 */
export const mergeBoundingBoxes = (boundingBoxes: BoundingBox[]): BoundingBox | null => {
  if (!boundingBoxes.length) return null;
  
  let minLng = boundingBoxes[0][0][0];
  let minLat = boundingBoxes[0][0][1];
  let maxLng = boundingBoxes[0][1][0];
  let maxLat = boundingBoxes[0][1][1];
  
  boundingBoxes.forEach(([[boxMinLng, boxMinLat], [boxMaxLng, boxMaxLat]]) => {
    minLng = Math.min(minLng, boxMinLng);
    minLat = Math.min(minLat, boxMinLat);
    maxLng = Math.max(maxLng, boxMaxLng);
    maxLat = Math.max(maxLat, boxMaxLat);
  });
  
  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
};

/**
 * Calculate a bounding box from a center point and radius in kilometers
 */
export const boundingBoxFromCenterAndRadius = (
  center: Coordinate, 
  radiusKm: number
): BoundingBox => {
  // Approximate degrees for the given distance
  // This is a simplification and only accurate near the equator
  const latDelta = radiusKm / 111; // 1 degree latitude is approximately 111km
  
  // Longitude degrees per km varies with latitude
  const lngDelta = radiusKm / (111 * Math.cos(center[1] * (Math.PI / 180)));
  
  return [
    [center[0] - lngDelta, center[1] - latDelta],
    [center[0] + lngDelta, center[1] + latDelta]
  ];
};

/**
 * Calculate a bounding box from an array of coordinates
 */
export const calculateBoundingBoxFromCoordinates = (
  coordinates: Coordinate[]
): MapBounds | null => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const [longitude, latitude] of coordinates) {
    if (latitude > north) north = latitude;
    if (latitude < south) south = latitude;
    if (longitude > east) east = longitude;
    if (longitude < west) west = longitude;
  }

  // Add padding to the bounds
  const latPadding = (north - south) * 0.1;
  const lngPadding = (east - west) * 0.1;

  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding
  };
};

/**
 * Calculate center point of a bounding box
 */
export const getBoundingBoxCenter = (bounds: MapBounds): Coordinate => {
  const longitude = (bounds.east + bounds.west) / 2;
  const latitude = (bounds.north + bounds.south) / 2;
  return [longitude, latitude];
};

/**
 * Convert a MapBounds object to an array of coordinates representing the corners
 */
export const boundingBoxToCoordinates = (bounds: MapBounds): Coordinate[] => {
  return [
    [bounds.west, bounds.north], // Northwest
    [bounds.east, bounds.north], // Northeast
    [bounds.east, bounds.south], // Southeast
    [bounds.west, bounds.south], // Southwest
    [bounds.west, bounds.north]  // Close the loop (Northwest again)
  ];
};

/**
 * Create a bounding box around a point with a specific padding
 */
export const createBoundingBoxAroundPoint = (
  center: Coordinate,
  paddingKm: number = 1
): MapBounds => {
  // Earth's radius in km
  const earthRadius = 6371;
  const [longitude, latitude] = center;
  
  // Convert padding from km to degrees
  // At the equator, 1 degree of latitude is approximately 111 km
  const latPadding = (paddingKm / earthRadius) * (180 / Math.PI);
  
  // Longitude degrees get smaller as you move away from the equator
  const lngPadding = latPadding / Math.cos(latitude * Math.PI / 180);
  
  return {
    north: latitude + latPadding,
    south: latitude - latPadding,
    east: longitude + lngPadding,
    west: longitude - lngPadding
  };
};

/**
 * Check if a coordinate is within a bounding box
 */
export const isCoordinateInBounds = (
  coordinate: Coordinate,
  bounds: MapBounds
): boolean => {
  const [longitude, latitude] = coordinate;
  return (
    latitude <= bounds.north &&
    latitude >= bounds.south &&
    longitude <= bounds.east &&
    longitude >= bounds.west
  );
}; 