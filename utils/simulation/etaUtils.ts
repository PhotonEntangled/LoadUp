import { SimulatedVehicle } from '@/types/vehicles';
import { logger } from '../logger';

// Assume average trucking speed in meters per second (e.g., 60 km/h ≈ 16.67 m/s)
// This is a simplification for the simulation.
// Real-world ETA would use Mapbox route duration or more complex factors.
const BASE_AVG_SPEED_MPS = 16.67;

interface EtaResult {
  etaDate: Date | null;
  remainingDurationMs: number | null;
}

/**
 * Calculates the estimated time of arrival (ETA) for a simulated vehicle.
 * 
 * @param vehicle The simulated vehicle object.
 * @param speedMultiplier The current simulation speed multiplier.
 * @returns An object containing the ETA Date object and remaining duration in milliseconds, or nulls if ETA cannot be calculated.
 */
export function calculateEta(
  vehicle: SimulatedVehicle | null,
  speedMultiplier: number
): EtaResult {
  if (!vehicle || vehicle.status !== 'En Route' || !vehicle.route || vehicle.routeDistance <= 0) {
    // Cannot calculate if not En Route, no route, or distance is zero/negative
    return { etaDate: null, remainingDurationMs: null };
  }

  const remainingDistance = Math.max(0, vehicle.routeDistance - vehicle.traveledDistance);
  
  if (remainingDistance <= 0) {
    // Already arrived or passed
    return { etaDate: null, remainingDurationMs: 0 }; 
  }

  const effectiveSpeedMps = BASE_AVG_SPEED_MPS * speedMultiplier;

  if (effectiveSpeedMps <= 0) {
    logger.warn('Cannot calculate ETA: Effective speed is zero or negative.', { speedMultiplier });
    return { etaDate: null, remainingDurationMs: null };
  }

  const remainingTimeSeconds = remainingDistance / effectiveSpeedMps;
  const remainingDurationMs = Math.round(remainingTimeSeconds * 1000);
  const etaTimestamp = Date.now() + remainingDurationMs;

  return {
    etaDate: new Date(etaTimestamp),
    remainingDurationMs: remainingDurationMs,
  };
} 