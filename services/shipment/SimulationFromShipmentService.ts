import { SimulatedVehicle, VehicleStatus } from '../../types/vehicles';
import { logger } from '../../utils/logger';
import { Feature, Point, LineString } from 'geojson';
import { SimulationInput } from '../../types/simulation';
import { v4 as uuidv4 } from 'uuid';
import distance from '@turf/distance';
import length from '@turf/length';
import along from '@turf/along';
import bearing from '@turf/bearing';
import { point, lineString } from '@turf/helpers';
import { shipmentStatusEnum } from '@/lib/database/schema'; // <<< Import DB status enum

// Helper type for DB status values
type DbShipmentStatus = typeof shipmentStatusEnum.enumValues[number];

/**
 * Service responsible for creating vehicle simulations based on SimulationInput.
 * Handles fetching routes if needed and initializing state based on input parameters.
 */
class SimulationFromShipmentService {
  constructor() {
  }

  /**
   * Creates a new SimulatedVehicle object from a SimulationInput.
   * Fetches route if needed (for Idle status) and initializes state based on input fields.
   *
   * @param input - The SimulationInput data.
   * @returns The newly created SimulatedVehicle or null if critical errors occur.
   */
  async createVehicleFromShipment(input: SimulationInput): Promise<SimulatedVehicle | null> {
    logger.info(`[SimService] Creating vehicle for shipment: ${input.shipmentId}`);

    // --- Basic Input Validation ---
    // Ensure coordinates are valid numbers if they exist
    const validateCoordPair = (coords: [number | undefined, number | undefined] | undefined): coords is [number, number] => 
        coords !== undefined &&
        typeof coords[0] === 'number' && !isNaN(coords[0]) &&
        typeof coords[1] === 'number' && !isNaN(coords[1]);

    const hasValidOrigin = validateCoordPair(input.originCoordinates);
    const hasValidDestination = validateCoordPair(input.destinationCoordinates);

    // --- Resolve Initial VehicleStatus from DB Status ---
    let resolvedInitialStatus: VehicleStatus = 'AWAITING_STATUS'; // Default to AWAITING_STATUS

    // Map DB Status (from input.initialStatus) to VehicleStatus
    const dbStatus = input.initialStatus as DbShipmentStatus | undefined;
    logger.debug(`[SimService] Mapping DB status: '${dbStatus}' to VehicleStatus`);

    if (!hasValidOrigin || !hasValidDestination) {
        logger.warn(`[SimService] Missing or invalid origin/destination coordinates for shipment ${input.shipmentId}. Forcing status to AWAITING_STATUS.`);
        resolvedInitialStatus = 'AWAITING_STATUS';
    } else {
        // Only proceed with mapping if coordinates are valid
        switch (dbStatus) {
            // Compare against the DB enum string literal values
            case 'PLANNED':
            case 'BOOKED': // Treat BOOKED same as PLANNED/PENDING_PICKUP for sim start
            case 'AT_PICKUP': // PENDING_PICKUP maps here
                resolvedInitialStatus = 'Idle';
                break;
            case 'IN_TRANSIT': // EN_ROUTE maps here
                resolvedInitialStatus = 'En Route';
                break;
            case 'AT_DROPOFF': // PENDING_DELIVERY maps here
                resolvedInitialStatus = 'Pending Delivery Confirmation';
                break;
            case 'COMPLETED': // DELIVERED maps here
                resolvedInitialStatus = 'Completed';
                break;
            case 'EXCEPTION':
                resolvedInitialStatus = 'Error';
                break;
            case 'AWAITING_STATUS':
            case undefined: // Handle cases where status might be missing from DB/input
            case null: // Explicitly handle null, though type expects undefined
                resolvedInitialStatus = 'AWAITING_STATUS';
                break;
            case 'CANCELLED':
                 logger.warn(`[SimService] Shipment ${input.shipmentId} has status CANCELLED. Simulation may not be appropriate, but proceeding with AWAITING_STATUS.`);
                 resolvedInitialStatus = 'AWAITING_STATUS'; // Or maybe Error? Let's use AWAITING for now.
                 break;
            default:
                // Exhaustive check helper if needed in future: const _exhaustiveCheck: never = dbStatus;
                logger.warn(`[SimService] Unhandled DB status: '${dbStatus}'. Defaulting to AWAITING_STATUS.`);
                resolvedInitialStatus = 'AWAITING_STATUS';
        }
    }
    logger.info(`[SimService] Resolved initial VehicleStatus: ${resolvedInitialStatus} for shipment ${input.shipmentId}`);

    // --- Handle Route Geometry ---
    let routeGeometry: LineString | null = input.routeGeometry || null;
    // Always clear route if status ends up as AWAITING_STATUS or Error
    if (resolvedInitialStatus === 'AWAITING_STATUS' || resolvedInitialStatus === 'Error') {
         routeGeometry = null;
    }
    let routeFeature: Feature<LineString> | null = routeGeometry ? lineString(routeGeometry.coordinates) : null;
    let routeDistanceMeters: number = 0;

    // --- Determine if route fetching is needed ---
    // Fetch if:
    // 1. Status requires a route (Idle, En Route, Pending Confirmation, Completed)
    // 2. AND no valid route geometry is provided.
    // 3. AND coordinates are valid.
    const statusRequiresRoute = ['Idle', 'En Route', 'Pending Delivery Confirmation', 'Completed'].includes(resolvedInitialStatus);
    const shouldFetchRoute = statusRequiresRoute && !routeFeature && hasValidOrigin && hasValidDestination;

    if (shouldFetchRoute) {
        const fetchReason = `Status '${resolvedInitialStatus}' requires route, none provided`;
        logger.info(`[SimService] ${fetchReason}. Fetching route via internal API...`, { shipmentId: input.shipmentId });
        try {
            // Ensure coordinates are valid before fetching
            if (!input.originCoordinates || !input.destinationCoordinates) {
                 throw new Error("Cannot fetch route without valid origin/destination coordinates.");
            }
            const apiResponse = await fetch('/api/directions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: input.originCoordinates,
                    destination: input.destinationCoordinates,
                }),
            });

            if (!apiResponse.ok) {
                let errorDetails = `API responded with status ${apiResponse.status}`;
                try { const errorBody = await apiResponse.json(); errorDetails = errorBody.error || errorBody.message || errorDetails; } catch { /* Ignore */ }
                throw new Error(errorDetails);
            }

            const responseData = await apiResponse.json();

            if (responseData?.route) {
                const fetchedGeometry = responseData.route as LineString;
                if (fetchedGeometry?.type === 'LineString' && fetchedGeometry.coordinates?.length >= 2) {
                    routeGeometry = fetchedGeometry;
                    routeFeature = lineString(routeGeometry.coordinates);
                    logger.info(`[SimService] Successfully fetched route via internal API.`);
                } else {
                    logger.error('[SimService] Internal API returned route with invalid geometry.', { responseData });
                    resolvedInitialStatus = 'Error'; // Set to Error if fetched route is bad
                    routeGeometry = null; routeFeature = null;
                }
            } else {
                logger.warn(`[SimService] Internal API indicated no route found.`, { origin: input.originCoordinates, destination: input.destinationCoordinates });
                // If status *requires* a route, failure to find one is an error
                if (statusRequiresRoute) {
                     resolvedInitialStatus = 'Error';
                }
                routeGeometry = null; routeFeature = null;
            }
        } catch (fetchError) {
            logger.error(`[SimService] Error fetching route via internal API /api/directions:`, { /* ... error details ... */ });
            // If status *requires* a route, fetch failure is an error
            if (statusRequiresRoute) {
                 resolvedInitialStatus = 'Error';
            }
            routeGeometry = null; routeFeature = null;
        }
    }

    // Recalculate route distance if routeFeature was potentially updated
    if (routeFeature) {
        try {
            if (routeFeature.geometry?.coordinates?.length >= 2) {
                routeDistanceMeters = length(routeFeature, { units: 'kilometers' }) * 1000;
                logger.debug(`[SimService] Calculated route distance using Turf: ${routeDistanceMeters.toFixed(2)} meters`);
            } else {
                 logger.error(`[SimService] Route feature geometry invalid for distance calc for shipment ${input.shipmentId}`);
                 routeDistanceMeters = 0; resolvedInitialStatus = 'Error'; routeFeature = null; // Nullify feature if bad
            }
        } catch(distError) {
            logger.error(`[SimService] Error calculating route distance using Turf for shipment ${input.shipmentId}`, distError);
            routeDistanceMeters = 0; resolvedInitialStatus = 'Error'; routeFeature = null; // Nullify feature on error
        }
    }

    // --- Calculate Initial Position, Bearing, and Traveled Distance based on resolvedInitialStatus ---
    // Use validated coordinates, default to [0,0] only if invalid/missing AND status allows (not AWAITING_STATUS)
    const defaultOrigin: [number, number] = hasValidOrigin ? input.originCoordinates : [0, 0];
    const defaultDestination: [number, number] = hasValidDestination ? input.destinationCoordinates : [0, 0];

    let initialPositionCoords: [number, number] = defaultOrigin; // Default to origin
    let initialBearing = 0;
    // Use initialTraveledDistance from input ONLY if status is En Route, otherwise default/calculate
    let initialTraveledDistance = 0;

    const routeCoords = routeFeature?.geometry?.coordinates;

    try { // Wrap Turf calculations in try-catch
        if (resolvedInitialStatus === 'Idle') {
            logger.debug(`[SimService] Initializing state for 'Idle'.`);
            initialPositionCoords = defaultOrigin;
            initialTraveledDistance = 0;
            if (routeCoords && routeCoords.length >= 2) {
                initialBearing = bearing(point(routeCoords[0]), point(routeCoords[1]));
            }
        } else if (resolvedInitialStatus === 'En Route') {
            logger.debug(`[SimService] Initializing state for 'En Route'.`);
            // Use input distance if provided and valid, otherwise start at beginning? Or error? Let's start at beginning for now.
            const inputDistance = input.initialTraveledDistance !== undefined && input.initialTraveledDistance !== null ? input.initialTraveledDistance : 0;
            initialTraveledDistance = routeFeature ? Math.max(0, Math.min(inputDistance, routeDistanceMeters)) : 0;

            if (routeFeature && initialTraveledDistance > 0) {
                const distanceKm = initialTraveledDistance / 1000;
                const currentPointFeature = along(routeFeature, distanceKm, { units: 'kilometers' });
                initialPositionCoords = currentPointFeature.geometry.coordinates as [number, number];

                // Simplified bearing calculation: look towards next point if possible
                let bearingPoint2Coords: [number, number] | null = null;
                if(routeCoords && routeCoords.length >= 2) {
                    let cumulativeDist = 0;
                    for (let i = 0; i < routeCoords.length - 1; i++) {
                        const segStart = routeCoords[i];
                        const segEnd = routeCoords[i + 1];
                        const segDist = distance(point(segStart), point(segEnd), { units: 'meters' });
                        if (initialTraveledDistance >= cumulativeDist && initialTraveledDistance <= cumulativeDist + segDist + 0.001) {
                            bearingPoint2Coords = segEnd as [number, number];
                            break;
                        }
                        cumulativeDist += segDist;
                    }
                    // Fallback: if exactly at end or beyond, use last segment direction
                    if (!bearingPoint2Coords && routeCoords.length >= 2) {
                        bearingPoint2Coords = routeCoords[routeCoords.length - 1] as [number, number];
                    }
                }
                if (bearingPoint2Coords) {
                    initialBearing = bearing(point(initialPositionCoords), point(bearingPoint2Coords));
                }

            } else { // Starting En Route but at the origin (distance 0 or no route)
                 initialPositionCoords = defaultOrigin;
                 initialTraveledDistance = 0;
                 if (routeCoords && routeCoords.length >= 2) {
                     initialBearing = bearing(point(routeCoords[0]), point(routeCoords[1]));
                 }
            }
             logger.debug(`[SimService] Calculated En Route state: Pos=${initialPositionCoords}, Bearing=${initialBearing.toFixed(1)}, Dist=${initialTraveledDistance.toFixed(0)}m`);

        } else if (resolvedInitialStatus === 'Pending Delivery Confirmation') {
            logger.debug(`[SimService] Initializing state for 'Pending Delivery Confirmation'.`);
            initialPositionCoords = defaultDestination;
            initialTraveledDistance = routeDistanceMeters; // Full distance
             if (routeCoords && routeCoords.length >= 2) {
                 initialBearing = bearing(point(routeCoords[routeCoords.length - 2]), point(routeCoords[routeCoords.length - 1]));
             }
            logger.debug(`[SimService] Calculated Pending Delivery state: Pos=${initialPositionCoords}, Bearing=${initialBearing.toFixed(1)}, Dist=${initialTraveledDistance.toFixed(0)}m`);

        } else if (resolvedInitialStatus === 'Completed') {
            logger.debug(`[SimService] Initializing state for 'Completed'.`);
            initialPositionCoords = defaultDestination;
            initialTraveledDistance = routeDistanceMeters; // Full distance
             if (routeCoords && routeCoords.length >= 2) {
                 initialBearing = bearing(point(routeCoords[routeCoords.length - 2]), point(routeCoords[routeCoords.length - 1]));
             }
            logger.debug(`[SimService] Calculated Completed state: Pos=${initialPositionCoords}, Bearing=${initialBearing.toFixed(1)}, Dist=${initialTraveledDistance.toFixed(0)}m`);

        } else if (resolvedInitialStatus === 'Error') {
             logger.debug(`[SimService] Initializing state for 'Error'.`);
             // Place at origin, no distance/bearing seems safest.
             initialPositionCoords = defaultOrigin;
             initialTraveledDistance = 0;
             initialBearing = 0;

        } else if (resolvedInitialStatus === 'AWAITING_STATUS') {
            logger.debug(`[SimService] Initializing state for 'AWAITING_STATUS'.`);
            // Place at origin if valid, else default map center. No distance/bearing.
             initialPositionCoords = hasValidOrigin ? input.originCoordinates! : [101.6869, 3.1390]; // <<< ADD COMMENT: Fallback to map center (e.g., Kuala Lumpur) if origin coordinates are invalid/missing.
             initialTraveledDistance = 0;
             initialBearing = 0;
        }
    } catch (turfError) {
        logger.error(`[SimService] Error during initial state calculation (Turf) for shipment ${input.shipmentId}:`, turfError);
        resolvedInitialStatus = 'Error'; // Downgrade status on calculation error
        initialPositionCoords = hasValidOrigin ? input.originCoordinates! : [0, 0]; // Reset to origin or 0,0
        initialTraveledDistance = 0;
        initialBearing = 0;
    }

    // --- Final Vehicle Object Construction ---
    // Generate a unique ID for the vehicle simulation instance
    const vehicleId = uuidv4();

    const simulatedVehicle: SimulatedVehicle = {
      id: vehicleId,
      shipmentId: input.shipmentId, // Link back to original shipment
      vehicleType: 'Truck',
      // scenarioId: input.scenarioId || `sim-${input.shipmentId}`, // Removed - Not in SimulatedVehicle type

      // Vehicle/Driver Info
      truckId: input.truckId || 'TRUCK_UNKNOWN',
      driverName: input.driverName || 'Driver Unknown',
      driverPhone: input.driverPhone, // Optional
      driverIc: input.driverIc, // Optional

      // Shipment Info
      remarks: input.remarks,

      // Location Info
      originAddressString: input.originAddressString,
      destinationAddressString: input.destinationAddressString,
      originCoordinates: hasValidOrigin ? input.originCoordinates : [0, 0], 
      destinationCoordinates: hasValidDestination ? input.destinationCoordinates : [0, 0], 
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      requestedDeliveryDate: input.requestedDeliveryDate || undefined, // Use undefined if null/falsy

      // Route Info
      route: routeFeature, // Corrected property name (was routeGeometry)
      routeDistance: routeDistanceMeters, // Corrected property name (was routeDistanceMeters)

      // --- STATE ---
      status: resolvedInitialStatus, // Use the fully resolved status
      currentPosition: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: initialPositionCoords, // Use calculated initial position
        },
        properties: {
          bearing: initialBearing, // Use calculated initial bearing
          timestamp: Date.now(),
        },
      },
      bearing: initialBearing, // Corrected property name (was currentBearing)
      traveledDistance: initialTraveledDistance, // Corrected property name (was traveledDistanceMeters)
      lastUpdateTime: Date.now(),
      // statusHistory: [{ status: resolvedInitialStatus, timestamp: Date.now() }], // Removed - Not in Type

      // --- Configuration ---
      // (These could potentially come from input or global config later)
      // speedMultiplier: 1.0, // Removed - Not in Type
      // updateIntervalMs: 1000, // Removed - Not in Type
    };

    logger.info(`[SimService] Successfully created simulated vehicle ${vehicleId} for shipment ${input.shipmentId} with initial status ${resolvedInitialStatus}`);
    return simulatedVehicle;
  }
}

// Singleton pattern to ensure only one instance
let instance: SimulationFromShipmentService | null = null;

export function getSimulationFromShipmentServiceInstance(): SimulationFromShipmentService {
  if (!instance) {
    logger.info("[SimService] Initializing SimulationFromShipmentService instance.");
    instance = new SimulationFromShipmentService();
  }
  return instance;
}

// Optional: Export the class directly if needed elsewhere, but prefer singleton access
// export { SimulationFromShipmentService }; 