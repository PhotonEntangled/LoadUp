import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@upstash/qstash'; // Corrected Import: Use Client
import { logger } from '@/utils/logger';
import { simulationCacheService } from '@/services/kv/simulationCacheService';
import type { VehicleStatus } from '@/types/vehicles'; // Import if needed for status checks

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

const LOG_PREFIX = "[API /simulation/enqueue-ticks GET]";

// Triggered by Cron job or external scheduler
export async function GET(request: Request) {
  // Basic security: Check for a secret header/query param if needed
  // const secret = request.headers.get('Authorization') || new URL(request.url).searchParams.get('secret');
  // if (secret !== process.env.CRON_SECRET) {
  //   logger.warn(`${LOG_PREFIX} Unauthorized access attempt.`);
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  logger.info(`${LOG_PREFIX} Request received. Fetching active simulations...`);

  let activeSimulationIds: string[] = [];
  try {
    activeSimulationIds = await simulationCacheService.getActiveSimulations();
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to get active simulations from KV:`, error);
    return NextResponse.json({ message: "Error fetching active simulations" }, { status: 500 });
  }

  if (activeSimulationIds.length === 0) {
    logger.info(`${LOG_PREFIX} No active simulations found. Exiting.`);
    return NextResponse.json({ message: "No active simulations to enqueue." });
  }

  logger.info(`${LOG_PREFIX} Found ${activeSimulationIds.length} potentially active simulations. Checking status and enqueuing tick jobs...`);

  const enqueuePromises: Promise<any>[] = [];
  const inactiveIdsToClean: string[] = [];
  let enqueuedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const shipmentId of activeSimulationIds) {
    const shortId = shipmentId.substring(0, 4);
    try {
      // Check actual status from KV state, not just presence in active set
      logger.debug(`${LOG_PREFIX}(${shortId}) Checking state for shipment ID: ${shipmentId}`);
      const currentState = await simulationCacheService.getSimulationState(shipmentId);

      if (!currentState) {
        logger.warn(`${LOG_PREFIX}(${shortId}) State not found in KV for supposedly active simulation. Marking for cleanup.`);
        inactiveIdsToClean.push(shipmentId);
        skippedCount++;
        continue; // Skip to next ID
      }

      // Only enqueue tick if the status is En Route
      if (currentState.status === 'En Route') {
        logger.info(`${LOG_PREFIX}(${shortId}) Status is 'En Route'. Enqueuing tick job...`);
        // TODO: Replace fetch with actual Vercel Queue client if available/preferred
        // Simulating enqueue via fetch POST to queue endpoint
        const enqueuePromise = fetch(process.env.VERCEL_QUEUE_TICK_ENDPOINT || '/api/simulation/tick-worker', { // Use env var for endpoint
           method: 'POST',
           headers: {
              'Content-Type': 'application/json',
              // Add authorization if the target endpoint requires it
              // 'Authorization': `Bearer ${process.env.VERCEL_QUEUE_SECRET}` 
           },
           body: JSON.stringify({ 
             shipmentId: shipmentId,
             // Pass necessary parameters if needed by worker, though ideally worker fetches state
             timeDelta: 1, // Example fixed delta, worker should calculate based on lastUpdateTime
             speedMultiplier: 1 // Example speed, worker should ideally fetch from state
           }),
         }).then(async res => {
           if (!res.ok) {
             const errorText = await res.text();
             logger.error(`${LOG_PREFIX}(${shortId}) Failed to enqueue tick job. Status: ${res.status}. Error: ${errorText}`);
             errorCount++;
           } else {
             logger.info(`${LOG_PREFIX}(${shortId}) Successfully enqueued tick job.`);
             enqueuedCount++;
           }
         }).catch(err => {
             logger.error(`${LOG_PREFIX}(${shortId}) Network error enqueuing tick job:`, err);
             errorCount++;
         });
        enqueuePromises.push(enqueuePromise);

      } else {
        // If status is terminal (Completed, Error, Idle) or Awaiting/Pending, mark for cleanup from active list
        logger.info(`${LOG_PREFIX}(${shortId}) Status is ${currentState.status}. Skipping enqueue and marking for cleanup from active list.`);
        inactiveIdsToClean.push(shipmentId);
        skippedCount++;
      }
    } catch (error) {
      logger.error(`${LOG_PREFIX}(${shortId}) Error processing shipment ID ${shipmentId}:`, error);
      errorCount++;
      // Don't necessarily mark for cleanup on transient error fetching state
    }
  }

  // Wait for all enqueue attempts to finish (optional, depends on desired atomicity)
  await Promise.allSettled(enqueuePromises);
  logger.info(`${LOG_PREFIX} Enqueue loop finished. Enqueued: ${enqueuedCount}, Skipped/Inactive: ${skippedCount}, Errors: ${errorCount}.`);

  // Clean up inactive IDs from the active set
  if (inactiveIdsToClean.length > 0) {
    logger.info(`${LOG_PREFIX} Cleaning up ${inactiveIdsToClean.length} inactive simulation IDs from the active set...`);
    for (const idToClean of inactiveIdsToClean) {
      try {
        await simulationCacheService.setActiveSimulation(idToClean, false); 
        logger.debug(`${LOG_PREFIX} Successfully removed inactive ID ${idToClean.substring(0,4)} from active set.`);
      } catch (cleanupError) {
        logger.error(`${LOG_PREFIX} Failed to remove inactive ID ${idToClean.substring(0,4)} from active set:`, cleanupError);
      }
    }
    logger.info(`${LOG_PREFIX} Inactive ID cleanup finished.`);
  }

  return NextResponse.json({
    message: `Tick enqueue process completed. Enqueued: ${enqueuedCount}, Skipped/Inactive: ${skippedCount}, Errors: ${errorCount}, Cleaned: ${inactiveIdsToClean.length}`,
  });
} 