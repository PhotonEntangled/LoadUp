import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { SimulatedVehicle, VehicleStatus } from '@/types/vehicles'; // Import VehicleStatus type
import { simulationCacheService } from "@/services/kv/simulationCacheService"; 
import { VehicleTrackingService } from "@/services/VehicleTrackingService"; 
import { calculateNewPosition } from '@/utils/simulation/simulationUtils'; // Import position calculation utility

const LOG_PREFIX = "[API /simulation/tick-worker POST]";

// TODO: Make speed configurable (e.g., via env var or KV state)

// Disable edge runtime for DB access
export const runtime = "nodejs";
// Revalidate every 0 seconds (effectively disable caching for this dynamic route)
export const revalidate = 0; 

export async function POST(request: NextRequest): Promise<NextResponse> {
    logger.info(`${LOG_PREFIX} Received request.`);

    let requestBody;
    try {
        requestBody = await request.json();
        logger.debug(`${LOG_PREFIX} Parsed request body:`, requestBody);
    } catch (error) {
        logger.error(`${LOG_PREFIX} Error parsing request JSON:`, error);
        return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { shipmentId, timeDelta, speedMultiplier } = requestBody;
    const shortId = shipmentId?.substring(0, 4) || "INVALID";

    if (!shipmentId || typeof timeDelta !== "number" || typeof speedMultiplier !== "number") {
        logger.error(`${LOG_PREFIX} Invalid request body parameters.`, { shipmentId, timeDelta, speedMultiplier });
        return NextResponse.json(
            { message: "Missing or invalid parameters: shipmentId, timeDelta, speedMultiplier required." },
            { status: 400 }
        );
    }
    logger.info(`${LOG_PREFIX}(${shortId}) Processing tick...`);

    try {
        // 1. Get current state from KV
        logger.debug(`${LOG_PREFIX}(${shortId}) Getting simulation state from KV...`);
        const currentState = await simulationCacheService.getSimulationState(shipmentId);

        if (!currentState) {
            logger.warn(`${LOG_PREFIX}(${shortId}) No active simulation found in KV for shipment. Stopping.`);
            await simulationCacheService.setActiveSimulation(shipmentId, false);
            return NextResponse.json(
                { message: `Simulation state not found for shipment ${shipmentId}.` },
                { status: 404 } 
            );
        }
        logger.debug(`${LOG_PREFIX}(${shortId}) Current state retrieved:`, { status: currentState.status });

        // 2. Check if simulation should proceed based on status
        if (currentState.status !== 'En Route') {
            logger.info(`${LOG_PREFIX}(${shortId}) Simulation status is ${currentState.status}. No update needed. Removing from active list if terminal.`);
            if (currentState.status === "Completed" || currentState.status === "Error") {
                await simulationCacheService.setActiveSimulation(shipmentId, false);
            }
            return NextResponse.json({ message: `Simulation status is ${currentState.status}. No tick processed.` });
        }

        // 3. Calculate next state using the utility function
        logger.debug(`${LOG_PREFIX}(${shortId}) Calculating next state using utility...`);
        let nextStepData: Pick<SimulatedVehicle, 'currentPosition' | 'bearing' | 'traveledDistance'> | null = null;
        try {
             nextStepData = calculateNewPosition(currentState, timeDelta, speedMultiplier);
        } catch (calcError) {
             logger.error(`${LOG_PREFIX}(${shortId}) Critical error during calculateNewPosition:`, calcError);
             // Mark state as Error in KV and DB? For now, just return error response
             await simulationCacheService.updateSimulationState(shipmentId, { status: 'Error' }); // Update KV
             await simulationCacheService.setActiveSimulation(shipmentId, false); // Deactivate
             return NextResponse.json({ message: `Error calculating next position: ${calcError instanceof Error ? calcError.message : 'Unknown calculation error'}` }, { status: 500 });
        }

        if (!nextStepData) {
            logger.warn(`${LOG_PREFIX}(${shortId}) Calculation resulted in null/no change. Skipping further updates for this tick.`);
            // Still return success, as no error occurred, just no movement
             return NextResponse.json({ message: "Tick processed, no position change.", status: currentState.status });
        }

        // Determine new status based on calculated distance
        let newStatus: VehicleStatus = 'En Route';
        if (nextStepData.traveledDistance >= currentState.routeDistance) {
             newStatus = 'Pending Delivery Confirmation';
            logger.info(`${LOG_PREFIX}(${shortId}) Vehicle reached destination, status changing to Pending Delivery Confirmation.`);
            nextStepData.traveledDistance = currentState.routeDistance; // Cap distance
        }

        const nextState: SimulatedVehicle = {
            ...currentState,
            ...nextStepData,
            status: newStatus,
            lastUpdateTime: Date.now(), // Update timestamp
        };
        
        logger.debug(`${LOG_PREFIX}(${shortId}) Next state calculated:`, { status: nextState.status, position: nextState.currentPosition });

        // 4. Update state in KV
        logger.debug(`${LOG_PREFIX}(${shortId}) Updating simulation state in KV...`);
        await simulationCacheService.setSimulationState(shipmentId, nextState); 
        logger.debug(`${LOG_PREFIX}(${shortId}) KV state update successful.`);

        // 5. Persist last known location to primary database (shipments_erd)
        const trackingService = new VehicleTrackingService();
        
        logger.debug(`${LOG_PREFIX}(${shortId}) Proceeding to attempt database persistence...`);
        
        // Check if coordinates exist before accessing
        if (!nextState.currentPosition?.geometry?.coordinates || nextState.currentPosition.geometry.coordinates.length < 2) {
            logger.error(`${LOG_PREFIX}(${shortId}) Invalid coordinates in nextState for DB update. Skipping persistence.`, { position: nextState.currentPosition });
            // Decide if this is an error state or just skip DB update
        } else {
            const latitude = nextState.currentPosition.geometry.coordinates[1];
            const longitude = nextState.currentPosition.geometry.coordinates[0];
            const timestamp = new Date(nextState.lastUpdateTime);

            // --- Retry Logic for DB Update ---
            const MAX_RETRIES = 2; // Try the initial attempt + 1 retry
            const RETRY_DELAY_MS = 200; // Wait 200ms between attempts
            let success = false;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                logger.debug(`${LOG_PREFIX}(${shortId}) Attempting DB update (Attempt ${attempt}/${MAX_RETRIES}) for ${shipmentId}`, { latitude, longitude, timestamp });
                try {
                    await trackingService.updateShipmentLastKnownLocation({
                        shipmentId: shipmentId,
                        latitude: latitude,
                        longitude: longitude,
                        timestamp: timestamp, // Pass Date object
                        bearing: nextState.bearing ?? null // Pass the calculated bearing
                    });
                    logger.info(`${LOG_PREFIX}(${shortId}) Successfully updated DB for ${shipmentId} (Attempt ${attempt})`);
                    success = true;
                    break; // Exit loop on success
                } catch (dbError) {
                    logger.warn(`${LOG_PREFIX}(${shortId}) DB update attempt ${attempt} failed for ${shipmentId}`, { 
                        errorMessage: dbError instanceof Error ? dbError.message : JSON.stringify(dbError)
                    });
                    if (attempt === MAX_RETRIES) {
                        // <<< ENHANCED LOGGING on FINAL FAILURE >>>
                        logger.error(`${LOG_PREFIX}(${shortId}) CRITICAL: Database update failed after ${MAX_RETRIES} attempts for shipmentId=${shipmentId}`, {
                             errorMessage: dbError instanceof Error ? dbError.message : JSON.stringify(dbError),
                             errorStack: dbError instanceof Error ? dbError.stack : undefined,
                             errorObject: dbError, 
                             shipmentId: shipmentId, 
                             attemptedLatitude: latitude,
                             attemptedLongitude: longitude,
                             attemptedTimestamp: timestamp?.toISOString() 
                         });
                        // Still proceed without throwing, but log critical error
                    } else {
                        // Wait before retrying
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    }
                }
            } 
            // --- End Retry Logic ---
        }

        // 6. If the simulation just reached a terminal state, remove from active set
        if (nextState.status === "Completed" || nextState.status === "Pending Delivery Confirmation" || nextState.status === "Error") {
            logger.info(`${LOG_PREFIX}(${shortId}) Simulation reached terminal state: ${nextState.status}. Removing from active list.`);
            await simulationCacheService.setActiveSimulation(shipmentId, false);
        }

        // logger.debug(`${LOG_PREFIX}(${shortId}) Tick processed successfully.`); // <-- COMMENT OUT FOR LESS VERBOSE LOGS
        return NextResponse.json({ message: "Tick processed successfully", status: nextState.status });
    } catch (error) {
        logger.error(`${LOG_PREFIX}(${shortId}) CRITICAL Error processing simulation tick:`, error);
        try { 
            await simulationCacheService.setActiveSimulation(shipmentId, false); 
        } catch {
            // Attempt to deactivate simulation, but ignore errors if it fails
        } 
        return NextResponse.json(
            { message: `Error processing tick: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 }
        );
    }
} 