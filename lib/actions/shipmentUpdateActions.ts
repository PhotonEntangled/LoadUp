'use server';

import { db } from '@/lib/database/drizzle';
import { shipmentsErd } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/utils/logger';

/**
 * Server Action to update the last known position and timestamp for a specific shipment.
 * Intended to be called periodically by the simulation store.
 *
 * @param shipmentId The UUID of the shipment to update.
 * @param latitude The last known latitude.
 * @param longitude The last known longitude.
 * @param timestamp The timestamp of the last known position.
 * @returns Object indicating success or failure with an error message.
 */
export async function updateShipmentLastPosition(
  shipmentId: string,
  latitude: number,
  longitude: number,
  timestamp: Date
): Promise<{ success: boolean; error?: string }> {
  logger.info(`[Server Action] updateShipmentLastPosition called for shipmentId: ${shipmentId}`);

  if (!shipmentId || latitude === undefined || longitude === undefined || !timestamp) {
    logger.error('[Server Action] updateShipmentLastPosition: Missing required parameters.', { shipmentId, latitude, longitude, timestamp });
    return { success: false, error: 'Missing required parameters.' };
  }

  try {
    const result = await db
      .update(shipmentsErd)
      .set({
        lastKnownLatitude: latitude.toString(), // Drizzle expects string for decimal
        lastKnownLongitude: longitude.toString(), // Drizzle expects string for decimal
        lastKnownTimestamp: timestamp,
        // Optionally update shipmentDateModified as well?
        // shipmentDateModified: new Date(),
      })
      .where(eq(shipmentsErd.id, shipmentId));

    // Drizzle update doesn't throw an error if no rows match the WHERE clause by default.
    // We might want to check if a row was actually updated if required, 
    // but for frequent updates, maybe it's okay if it occasionally targets a non-existent ID briefly.
    // const affectedRows = result.rowCount; // Example check if using pg driver directly, Drizzle ORM might return differently
    // logger.debug(`[Server Action] updateShipmentLastPosition affected rows: ${affectedRows}`);

    logger.info(`[Server Action] Successfully updated last known position for shipmentId: ${shipmentId}`);
    return { success: true };

  } catch (error) {
    logger.error(`[Server Action] Error updating last known position for shipment ${shipmentId}:`, error);
    return { success: false, error: 'Database error occurred while updating position.' };
  }
} 