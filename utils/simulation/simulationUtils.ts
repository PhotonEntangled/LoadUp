// Utility functions for simulation logic will go here
import * as turf from '@turf/turf';
import { LineString } from 'geojson'; // Removed unused Feature, Point
import { SimulatedVehicle } from '../../types/vehicles'; // Corrected path
import { logger } from '../../utils/logger';

// Constants
const DEFAULT_AVERAGE_SPEED_KPH = 60; // Default average speed in km/h
const METERS_PER_SECOND_PER_KPH = 1000 / 3600; // Conversion factor

/**
 * Calculates the new position of a vehicle along its route based on elapsed time.
 *
 * @param vehicle - The current state of the simulated vehicle.
 * @param timeDeltaSeconds - The time elapsed since the last update in seconds.
 * @param speedMultiplier - Factor to adjust the simulation speed.
 * @returns A Partial<SimulatedVehicle> containing the updated position and bearing, or null if calculation is not possible.
 */
export function calculateNewPosition(
  vehicle: SimulatedVehicle,
  timeDeltaSeconds: number,
  speedMultiplier: number = 1
): Pick<SimulatedVehicle, 'currentPosition' | 'bearing' | 'traveledDistance'> | null {

  if (!vehicle.route?.geometry || vehicle.status !== 'En Route') {
    return null;
  }

  try {
    const routeLine = vehicle.route.geometry as LineString;
    const totalRouteDistanceMeters = vehicle.routeDistance;

    // Calculate distance to travel in this time step
    const averageSpeedMPS = DEFAULT_AVERAGE_SPEED_KPH * METERS_PER_SECOND_PER_KPH;
    const effectiveSpeedMPS = averageSpeedMPS * speedMultiplier;
    const distanceToTravelMeters = effectiveSpeedMPS * timeDeltaSeconds;

    // Calculate new total distance traveled
    let newTraveledDistanceMeters = vehicle.traveledDistance + distanceToTravelMeters;

    // Ensure the new distance doesn't exceed the total route distance
    newTraveledDistanceMeters = Math.min(newTraveledDistanceMeters, totalRouteDistanceMeters);

    // Get the new position along the route using Turf
    const newPositionFeature = turf.along(routeLine, newTraveledDistanceMeters, { units: 'meters' });

    // Calculate bearing (direction) - requires looking slightly ahead or behind
    let bearing = vehicle.bearing; // Default to current bearing
    if (newTraveledDistanceMeters < totalRouteDistanceMeters) {
        // Look slightly ahead to get bearing
        const lookAheadDistance = Math.min(newTraveledDistanceMeters + 5, totalRouteDistanceMeters); // Look 5m ahead or to end
        const lookAheadPoint = turf.along(routeLine, lookAheadDistance, { units: 'meters' });
        bearing = turf.bearing(newPositionFeature, lookAheadPoint);
    } else {
        // At destination, maintain bearing from the segment just before arrival
        if (totalRouteDistanceMeters > 10) { // Check if route is long enough
            const lookBehindPoint = turf.along(routeLine, totalRouteDistanceMeters - 10, { units: 'meters' });
            bearing = turf.bearing(lookBehindPoint, newPositionFeature);
        } // else: very short route, keep initial bearing (or 0)
    }

    // Normalize bearing to be between 0 and 360
    bearing = (bearing + 360) % 360;

    // Update vehicle state
    return {
      currentPosition: newPositionFeature, // This is already a Feature<Point>
      bearing: bearing,
      traveledDistance: newTraveledDistanceMeters,
    };

  } catch (error) {
    console.error('Error calculating new position with Turf.js:', error, { vehicleId: vehicle.id });
    return null;
  }
} 