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
        logger.debug(`${LOG_PREFIX}(${shortId}) Attempting to update shipments_erd in DB...`);
        try {
            // Access coordinates correctly from GeoJSON structure
            const longitude = nextState.currentPosition.geometry.coordinates[0];
            const latitude = nextState.currentPosition.geometry.coordinates[1];
            
            if (latitude == null || longitude == null) {
                throw new Error("Calculated position coordinates are null or undefined.");
            }

            const dbUpdateSuccess = await trackingService.updateShipmentLastKnownLocation({
                shipmentId: shipmentId, 
                latitude: latitude, // Use extracted latitude
                longitude: longitude, // Use extracted longitude
                timestamp: new Date(nextState.lastUpdateTime) 
            });
            if (dbUpdateSuccess) {
                logger.info(`${LOG_PREFIX}(${shortId}) Successfully updated shipments_erd.`);
            } else {
                logger.warn(`${LOG_PREFIX}(${shortId}) DB update function returned false.`);
            }
        } catch (dbError) {
            logger.error(`${LOG_PREFIX}(${shortId}) Error during DB update:`, dbError);
        }

        // 6. If the simulation just reached a terminal state, remove from active set
        if (nextState.status === "Completed" || nextState.status === "Pending Delivery Confirmation" || nextState.status === "Error") {
            logger.info(`${LOG_PREFIX}(${shortId}) Simulation reached terminal state: ${nextState.status}. Removing from active list.`);
            await simulationCacheService.setActiveSimulation(shipmentId, false);
        }

        logger.info(`${LOG_PREFIX}(${shortId}) Tick processed successfully.`);
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