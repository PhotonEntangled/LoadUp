import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { SimulatedVehicle, VehicleStatus } from '@/types/vehicles'; // Import VehicleStatus type
import { db } from '@/lib/database/drizzle'; // Import Drizzle client
import { shipmentsErd } from '@/lib/database/schema'; // Import shipments table schema
import { eq } from 'drizzle-orm'; // Import eq operator
import { kv } from '@vercel/kv'; // Import Vercel KV client
import { calculateNewPosition as calculateVehiclePosition } from '@/utils/simulation/simulationUtils'; // Import position calculation utility

const LOG_PREFIX = "[API /simulation/tick-worker POST]";

// TODO: Make speed configurable (e.g., via env var or KV state)

export async function POST(request: NextRequest): Promise<NextResponse> {
    logger.info(`${LOG_PREFIX} Request received`);

    let requestBody;
    try {
        requestBody = await request.json();
        logger.info(`${LOG_PREFIX} Parsed request body`);
    } catch (error) {
        logger.error(`${LOG_PREFIX} Error parsing request body`, error);
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { shipmentId } = requestBody;

    if (!shipmentId || typeof shipmentId !== 'string') {
        logger.warn(`${LOG_PREFIX} Invalid or missing shipmentId`);
        return NextResponse.json({ error: 'Missing or invalid shipmentId.' }, { status: 400 });
    }

    logger.info(`${LOG_PREFIX} Processing tick for shipment: ${shipmentId}`);

    try {
        // Fetch current state from KV
        const currentStateJson = await kv.get<string>(`simulation:${shipmentId}`);
        if (!currentStateJson) {
            logger.warn(`${LOG_PREFIX} No active simulation found in KV for shipment: ${shipmentId}. Stopping.`);
            // Consider removing the key or setting an 'ended' flag if appropriate
            // await kv.del(`simulation:${shipmentId}`); 
            return NextResponse.json({ message: 'Simulation not found or already ended.' }, { status: 200 });
        }

        const currentState = JSON.parse(currentStateJson) as SimulatedVehicle;
        logger.debug(`${LOG_PREFIX} Current state fetched from KV for ${shipmentId}`, { status: currentState.status });

        // Check if simulation should proceed based on status
        if (currentState.status !== 'En Route') {
             logger.info(`${LOG_PREFIX} Simulation for ${shipmentId} is not 'En Route' (status: ${currentState.status}). Skipping database update.`);
             return NextResponse.json({ message: `Simulation status is ${currentState.status}, no update needed.` }, { status: 200 });
        }


        // Calculate the next state (reuse existing logic)
        const timeNow = Date.now();
        const timeDeltaSeconds = (timeNow - currentState.lastUpdateTime) / 1000;

        if (timeDeltaSeconds <= 0) {
             logger.warn(`${LOG_PREFIX} Skipping update for ${shipmentId}, timeDelta <= 0`, { timeDeltaSeconds });
             return NextResponse.json({ message: 'Time delta too small, skipping update.' }, { status: 200 });
        }
        
        // Assuming simulationSpeedMultiplier is constant or retrieved elsewhere if needed
        const simulationSpeedMultiplier = 1; // Or fetch from config/KV if dynamic
        
        let newStateData: Pick<SimulatedVehicle, 'currentPosition' | 'bearing' | 'traveledDistance'> | null = null;
        try {
            newStateData = calculateVehiclePosition(
                currentState,
                timeDeltaSeconds,
                simulationSpeedMultiplier
            );
        } catch (calcError) {
             logger.error(`${LOG_PREFIX} Critical error during calculateNewPosition:`, calcError, { shipmentId });
             // Decide how to handle - stop simulation? Mark vehicle as error?
             // For now, just prevent DB update and return error
             return NextResponse.json({ error: 'Failed to calculate next position.' }, { status: 500 });
        }


        if (!newStateData) {
             logger.warn(`${LOG_PREFIX} calculateNewPosition returned null for ${shipmentId}. Skipping database update.`);
             return NextResponse.json({ message: 'Position calculation resulted in no change.' }, { status: 200 });
        }

        let newStatus: VehicleStatus = currentState.status;
        if (newStateData.traveledDistance >= currentState.routeDistance) {
             newStatus = 'Pending Delivery Confirmation';
             logger.info(`${LOG_PREFIX} Vehicle ${shipmentId} reached destination, status changing to Pending Delivery Confirmation.`);
             newStateData.traveledDistance = currentState.routeDistance; // Cap distance
        }

        const updatedVehicleState: SimulatedVehicle = {
            ...currentState,
            ...newStateData,
            status: newStatus,
            lastUpdateTime: timeNow,
        };

        // Update KV store with the new state
        await kv.set(`simulation:${shipmentId}`, JSON.stringify(updatedVehicleState));
        logger.debug(`${LOG_PREFIX} Successfully updated KV state for ${shipmentId}`);

        // --- Persist to Database ---
        const lat = updatedVehicleState.currentPosition.geometry.coordinates[1];
        const lon = updatedVehicleState.currentPosition.geometry.coordinates[0];
        const timestamp = new Date(updatedVehicleState.lastUpdateTime);

        logger.info(`${LOG_PREFIX} Attempting to update shipments_erd for ${shipmentId}`, { lat, lon, timestamp });

        try {
            const updateResult = await db.update(shipmentsErd)
                .set({
                    lastKnownLatitude: lat.toString(), // Ensure conversion to string if DB expects decimal/string
                    lastKnownLongitude: lon.toString(),
                    lastKnownTimestamp: timestamp,
                    shipmentDateModified: new Date(), // Update modified timestamp
                })
                .where(eq(shipmentsErd.id, shipmentId));
            
            // Add log for successful update, potentially including result info if useful
            logger.info(`${LOG_PREFIX} Successfully updated shipments_erd for ${shipmentId}.`, { updateResult }); 

        } catch (dbError) {
            // Log the specific database error
            logger.error(`${LOG_PREFIX} Database update failed for ${shipmentId}:`, { 
                error: dbError,
                errorMessage: (dbError as Error)?.message, // Type assertion for message
                errorStack: (dbError as Error)?.stack    // Type assertion for stack
            });
            // Decide if this should be a fatal error for the tick request
            // return Response.json({ error: 'Failed to update database.' }, { status: 500 }); 
        }
        // --- End Persist ---


        return NextResponse.json({ message: 'Tick processed successfully.', newState: updatedVehicleState }, { status: 200 });

    } catch (error) {
        logger.error(`${LOG_PREFIX} General error processing tick for shipment: ${shipmentId}`, error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
} 