import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { getSimulationState, setSimulationState } from '@/services/kv/simulationCacheService';
import { SimulatedVehicle, VehicleStatus } from '@/types/vehicles'; // Import VehicleStatus type
import * as turf from '@turf/turf'; // Import Turf.js
import { Feature, Point, LineString } from 'geojson'; // Ensure GeoJSON types are available
import { db } from '@/lib/database/drizzle'; // Import Drizzle client
import { shipmentsErd } from '@/lib/database/schema'; // Import shipments table schema
import { eq } from 'drizzle-orm'; // Import eq operator

// TODO: Make speed configurable (e.g., via env var or KV state)
const DEFAULT_SIMULATION_SPEED_MPS = 15; // Approx 54 km/h or 34 mph
const MIN_DISTANCE_THRESHOLD_METERS = 5; // Threshold to consider destination reached

export async function POST(request: NextRequest) {
    logger.info('API: Simulation tick endpoint called.');

    let payload: any;
    try {
        payload = await request.json();
        logger.debug('API: Received simulation tick payload:', { payload }); // Log structured data
    } catch (error) {
        logger.error('API: Failed to parse request body', { error });
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // --- Payload Validation ---
    if (!payload || typeof payload !== 'object') {
        logger.warn('API: Invalid payload type.');
        return NextResponse.json({ message: 'Invalid payload type' }, { status: 400 });
    }

    const { shipmentId } = payload;

    if (typeof shipmentId !== 'string' || shipmentId.trim() === '') {
        logger.warn('API: Missing or invalid shipmentId in payload.', { receivedShipmentId: shipmentId });
        return NextResponse.json({ message: 'Missing or invalid shipmentId' }, { status: 400 });
    }
    // --- End Payload Validation ---

    logger.info(`API: Processing simulation tick for shipmentId: ${shipmentId}`);

    try {
        // --- Get Current State --- 
        const currentState = await getSimulationState(shipmentId);

        if (!currentState) {
            logger.warn(`API: No simulation state found in cache for shipmentId: ${shipmentId}. Stopping tick processing.`);
            // Consider if we should return an error or just success (job is done if state is gone)
            return NextResponse.json({ message: 'No active simulation found' }, { status: 200 }); // Returning 200 OK as the job is effectively done.
        }
        logger.debug(`API: Retrieved current state for ${shipmentId}`, { status: currentState.status });

        // --- Check Status --- 
        // Only process ticks for vehicles actively en route
        // TODO: Potentially handle 'Pending Pickup' if the first tick should trigger movement?
        if (currentState.status !== 'En Route') {
            logger.info(`API: Simulation for ${shipmentId} is not 'En Route' (status: ${currentState.status}). Skipping tick.`);
            return NextResponse.json({ message: `Simulation status ${currentState.status}, tick skipped` }, { status: 200 });
        }

        // --- Core Tick Logic --- 

        // 1. Calculate Time Delta
        const now = Date.now();
        const timeDeltaSeconds = (now - currentState.lastUpdateTime) / 1000;

        if (timeDeltaSeconds <= 0) {
            logger.warn(`API: Zero or negative time delta for ${shipmentId}. Skipping tick.`, { timeDeltaSeconds });
            return NextResponse.json({ message: 'Zero time delta, tick skipped' }, { status: 200 });
        }

        // Ensure route exists and is valid LineString for calculations
        if (!currentState.route || currentState.route.geometry.type !== 'LineString') {
             logger.error(`API: Invalid or missing route geometry for ${shipmentId}. Cannot calculate next position.`);
             // Consider setting state to Error?
             return NextResponse.json({ message: 'Invalid route data' }, { status: 500 }); 
        }

        // 2. Calculate New Position using Turf.js
        const distanceToTravel = DEFAULT_SIMULATION_SPEED_MPS * timeDeltaSeconds;
        const currentTraveledDistance = currentState.traveledDistance;
        let newTraveledDistance = currentTraveledDistance + distanceToTravel;
        let newPositionFeature: Feature<Point>;
        let newBearing: number = currentState.bearing;
        let newStatus: VehicleStatus = currentState.status;

        // Check if the new distance exceeds the total route distance
        if (newTraveledDistance >= currentState.routeDistance) {
            newTraveledDistance = currentState.routeDistance;
            const destinationCoords = currentState.destinationCoordinates;
            newPositionFeature = turf.feature({ type: 'Point', coordinates: destinationCoords });
            newStatus = 'Pending Delivery Confirmation';
            logger.info(`API: Simulation ${shipmentId} reached destination.`);
        } else {
            // Calculate new point along the route
            try {
                 newPositionFeature = turf.along(currentState.route, newTraveledDistance / 1000, { units: 'kilometers' }); // turf.along expects km
                 // Recalculate bearing from the previous point to the new point
                 // Use a small look-ahead on the line for smoother bearing
                 const lookAheadPoint = turf.along(currentState.route, (newTraveledDistance + 5) / 1000, { units: 'kilometers' });
                 newBearing = turf.bearing(newPositionFeature.geometry.coordinates, lookAheadPoint.geometry.coordinates);
            } catch (turfError) {
                logger.error(`API: Turf.js calculation failed for ${shipmentId}`, { turfError });
                // Consider setting state to Error?
                return NextResponse.json({ message: 'Failed to calculate new position' }, { status: 500 });
            }
           
        }

        // 3. Construct New State Object
        const newState: SimulatedVehicle = {
            ...currentState,
            currentPosition: newPositionFeature,
            bearing: newBearing,
            traveledDistance: newTraveledDistance,
            status: newStatus,
            lastUpdateTime: now, // Update timestamp
        };
        logger.debug(`API: Calculated new state for ${shipmentId}`, { newState: { status: newState.status, traveled: newState.traveledDistance } });

        // 4. Set New State in KV
        const setResult = await setSimulationState(shipmentId, newState);
        if (!setResult) {
            // Logged error within setSimulationState, but maybe add context here
            logger.error(`API: Failed to set new simulation state in KV for ${shipmentId}.`);
            // Return 500 as state update failed
            return NextResponse.json({ message: 'Failed to update simulation state cache' }, { status: 500 }); 
        }

        // 5. Persist Location to DB using Drizzle directly
        try {
            const [newLon, newLat] = newState.currentPosition.geometry.coordinates;
            const updateTimestamp = new Date(newState.lastUpdateTime);

            const result = await db.update(shipmentsErd)
                .set({
                    lastKnownLatitude: newLat.toString(), // Ensure string conversion for decimal
                    lastKnownLongitude: newLon.toString(), // Ensure string conversion for decimal
                    lastKnownTimestamp: updateTimestamp,
                    shipmentDateModified: new Date() 
                })
                .where(eq(shipmentsErd.id, shipmentId))
                .returning({ updatedId: shipmentsErd.id }); // Optional: return ID to confirm update

            if (result && result.length > 0) {
                 logger.info(`API: Successfully persisted location for ${shipmentId} to DB.`);
            } else {
                 logger.warn(`API: Failed to persist location to DB for ${shipmentId} (update returned no rows).`);
                 // Continue even if DB write fails for now, as cache was updated.
            }
        } catch (dbError) {
            logger.error(`API: Error updating shipment location in DB for ${shipmentId}`, { 
                message: dbError instanceof Error ? dbError.message : String(dbError),
                stack: dbError instanceof Error ? dbError.stack : undefined,
             });
            // Continue even if DB write fails for now, as cache was updated.
        }
        // --- End Core Tick Logic --- 

        return NextResponse.json({ message: `Tick processed successfully for ${shipmentId}` }, { status: 200 });

    } catch (error) {
        logger.error(`API: Unexpected error processing simulation tick for ${shipmentId}`, { error });
        // Return 500 for unexpected internal errors
        return NextResponse.json({ message: 'Internal server error during tick processing' }, { status: 500 });
    }
} 