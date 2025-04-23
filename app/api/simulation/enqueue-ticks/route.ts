import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash'; // Corrected Import: Use Client
import { logger } from '@/utils/logger';
import { getActiveSimulations, getSimulationState, removeActiveSimulation } from '@/services/kv/simulationCacheService';
import { VehicleStatus } from '@/types/vehicles'; // Import VehicleStatus type

// Use the standard QStash variables provided by the Vercel integration
const QSTASH_URL = process.env.loadupstorage_QSTASH_URL; 
const QSTASH_TOKEN = process.env.loadupstorage_QSTASH_TOKEN;

// Initialize the QStash client
let qstashClient: Client | null = null; // Changed variable name
if (QSTASH_URL && QSTASH_TOKEN) {
  qstashClient = new Client({
    baseUrl: QSTASH_URL, // Use the base URL
    token: QSTASH_TOKEN,   // Use the token
  });
} else {
  logger.error('API: Missing required QStash environment variables (loadupstorage_QSTASH_URL or loadupstorage_QSTASH_TOKEN) for Queue client initialization.');
}

// Helper type for the outcome of processing each ID
type ProcessingOutcome = 
    | { status: 'enqueued'; shipmentId: string } 
    | { status: 'skipped'; shipmentId: string; reason: string } 
    | { status: 'cleaned'; shipmentId: string; reason: string } 
    | { status: 'error'; shipmentId: string; error: string };

export async function GET(request: NextRequest) {
    logger.info('API: Enqueue ticks endpoint called (likely by Cron).');

    // Pre-flight checks for essential config
    if (!qstashClient) { // Check if client initialized
        logger.error('API: QStash Client not initialized due to missing environment variables.'); // Changed variable name in log
        return NextResponse.json({ message: 'Server configuration error: QStash client failed to initialize.' }, { status: 500 });
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
                        logger.debug(`API: Enqueueing tick job for ${shipmentId} via QStash SDK`);
                        
                        // Construct the absolute target URL using Vercel System Environment Variable
                        if (!process.env.VERCEL_URL) {
                            logger.error('API: VERCEL_URL system environment variable is not defined. Cannot construct target URL for QStash.');
                            // Decide how to handle this - skip, error out, use a fallback? Erroring out seems safest.
                             return { status: 'error', shipmentId, error: 'Server configuration error: VERCEL_URL not set.' };
                        }
                        const targetUrl = `https://${process.env.VERCEL_URL}/api/simulation/tick`; 
                        
                        logger.debug(`API: Target URL for QStash: ${targetUrl}`);

                        const messageResult = await qstashClient!.publishJSON({
                          url: targetUrl, // Use the constructed absolute URL
                          body: { shipmentId: shipmentId }, 
                        });

                        logger.debug(`API: Successfully enqueued tick job for ${shipmentId} with message ID: ${messageResult.messageId}`);
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
                    // If the error is from the SDK enqueue itself
                    if (err.message?.includes('QStash')) { 
                       return { status: 'error', shipmentId, error: `QStash SDK error: ${err.message}` };
                    }
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