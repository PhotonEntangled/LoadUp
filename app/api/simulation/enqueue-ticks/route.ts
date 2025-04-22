import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { getActiveSimulations, getSimulationState, removeActiveSimulation } from '@/services/kv/simulationCacheService';
import { VehicleStatus } from '@/types/vehicles'; // Import VehicleStatus type

// TODO: Get actual Queue HTTP Endpoint URL from Vercel deployment/env vars
const QUEUE_ENDPOINT_URL = process.env.SIMULATION_TICK_QUEUE_URL;
// TODO: Get actual Queue secret token from Vercel deployment/env vars
const QUEUE_AUTH_TOKEN = process.env.VERCEL_QUEUE_SECRET;

// Helper type for the outcome of processing each ID
type ProcessingOutcome = 
    | { status: 'enqueued'; shipmentId: string } 
    | { status: 'skipped'; shipmentId: string; reason: string } 
    | { status: 'cleaned'; shipmentId: string; reason: string } 
    | { status: 'error'; shipmentId: string; error: string };

export async function GET(request: NextRequest) {
    logger.info('API: Enqueue ticks endpoint called (likely by Cron).');

    // Pre-flight checks for essential config
    if (!QUEUE_ENDPOINT_URL) {
        logger.error('API: Missing SIMULATION_TICK_QUEUE_URL environment variable.');
        return NextResponse.json({ message: 'Server configuration error: Queue URL missing.' }, { status: 500 });
    }
    if (!QUEUE_AUTH_TOKEN) {
        logger.error('API: Missing VERCEL_QUEUE_SECRET environment variable.');
        return NextResponse.json({ message: 'Server configuration error: Queue Secret missing.' }, { status: 500 });
    }

    let enqueuedCount = 0;
    let skippedCount = 0;
    let cleanupCount = 0;
    let errorCount = 0;

    try {
        const activeIds = await getActiveSimulations();
        logger.info(`API: Found ${activeIds.length} potential simulations in active set.`);

        if (activeIds.length === 0) {
             return NextResponse.json({ message: 'No active simulations found to enqueue.', enqueuedCount, skippedCount, cleanupCount, errorCount }, { status: 200 });
        }

        const results = await Promise.allSettled<ProcessingOutcome>(
            activeIds.map(async (shipmentId): Promise<ProcessingOutcome> => {
                try {
                    const state = await getSimulationState(shipmentId);

                    if (!state) {
                        logger.warn(`API: Stale active simulation ID found: ${shipmentId}. Removing from active set.`);
                        await removeActiveSimulation(shipmentId); // Attempt cleanup
                        return { status: 'cleaned', shipmentId, reason: 'State not found' };
                    }

                    // Check if simulation should be ticked
                    if (state.status === 'En Route') {
                        // Enqueue job using fetch
                        logger.debug(`API: Enqueueing tick job for ${shipmentId}`);
                        const response = await fetch(QUEUE_ENDPOINT_URL, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${QUEUE_AUTH_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ shipmentId: shipmentId })
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            logger.error(`API: Failed to enqueue job for ${shipmentId}. Status: ${response.status}`, { errorText });
                            return { status: 'error', shipmentId, error: `Enqueue failed with status ${response.status}` };
                        }
                         logger.debug(`API: Successfully enqueued tick job for ${shipmentId}`);
                        return { status: 'enqueued', shipmentId };

                    } else if (state.status === 'Completed' || state.status === 'Error' || state.status === 'AWAITING_STATUS') {
                        // Cleanup inactive simulations
                        logger.info(`API: Simulation ${shipmentId} has status ${state.status}. Removing from active set.`);
                        await removeActiveSimulation(shipmentId); // Attempt cleanup
                        return { status: 'cleaned', shipmentId, reason: `Inactive status: ${state.status}` };
                    } else {
                        // Skip other statuses (Idle, Pending Delivery Confirmation, etc.)
                        logger.debug(`API: Skipping enqueue for ${shipmentId} with status ${state.status}.`);
                        return { status: 'skipped', shipmentId, reason: `Status: ${state.status}` };
                    }
                } catch (err: any) {
                    logger.error(`API: Error processing shipmentId ${shipmentId} during enqueue loop`, { error: err });
                    return { status: 'error', shipmentId, error: err.message || 'Unknown processing error' };
                }
            })
        );

        // Process results
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                const outcome = result.value;
                switch (outcome.status) {
                    case 'enqueued': enqueuedCount++; break;
                    case 'skipped': skippedCount++; break;
                    case 'cleaned': cleanupCount++; break;
                    case 'error': errorCount++; break;
                }
            } else {
                // Log errors from the Promise.allSettled itself (e.g., unhandled exception in map function)
                logger.error('API: Unhandled error processing an active simulation ID:', { reason: result.reason });
                errorCount++; // Count as error
            }
        });

        logger.info(`API: Enqueue ticks processing finished. Enqueued: ${enqueuedCount}, Skipped: ${skippedCount}, Cleaned: ${cleanupCount}, Errors: ${errorCount}`);
        return NextResponse.json({ 
            message: 'Enqueue processing finished.', 
            foundActive: activeIds.length,
            enqueuedCount, 
            skippedCount, 
            cleanupCount, 
            errorCount 
        }, { status: 200 });

    } catch (error) {
        logger.error(`API: Unexpected error in enqueue ticks endpoint`, { error });
        return NextResponse.json({ message: 'Internal server error during enqueue processing' }, { status: 500 });
    }
} 