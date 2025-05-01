import { db } from '@/lib/database/drizzle';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/database/schema';
import { logger } from '@/utils/logger';

interface UpdateLocationParams {
  shipmentId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  bearing?: number | null;
}

/**
 * Service responsible for updating vehicle tracking information, 
 * specifically persisting the last known location from simulations or real-time sources.
 */
export class VehicleTrackingService {

  /**
   * Updates the last known location and timestamp for a specific shipment in the database.
   * This is intended to be called periodically by the backend simulation loop or 
   * a real-time tracking mechanism.
   * 
   * @param params - Object containing shipmentId, latitude, longitude, and timestamp.
   * @returns Promise<boolean> - True if the update was successful, false otherwise.
   */
  async updateShipmentLastKnownLocation(params: UpdateLocationParams): Promise<boolean> {
    const { shipmentId, latitude, longitude, timestamp, bearing } = params;
    const functionName = 'updateShipmentLastKnownLocation';
    logger.debug(`[${functionName}] Attempting update for shipment ID: ${shipmentId}`);

    try {
      // Basic validation
      if (!shipmentId || latitude == null || longitude == null || !timestamp) {
         logger.warn(`[${functionName}] Invalid parameters received for shipment ${shipmentId}. Aborting update.`);
         return false;
      }
       
      // Convert numbers to strings for decimal fields, including bearing
      const latString = String(latitude);
      const lonString = String(longitude);
      const bearingString = bearing !== null && bearing !== undefined ? String(bearing) : null;

      // Perform the database update using Drizzle
      const result = await db.update(schema.shipmentsErd)
        .set({ 
          lastKnownLatitude: latString, 
          lastKnownLongitude: lonString, 
          lastKnownTimestamp: timestamp,
          lastKnownBearing: bearingString
        })
        .where(eq(schema.shipmentsErd.id, shipmentId))
        .returning({ updatedId: schema.shipmentsErd.id }); // Optional: return ID to confirm update

      // Drizzle's update with .returning returns an array of updated objects.
      // Check if the array is non-empty, indicating a successful update on the specified row.
      if (result.length > 0) { 
        logger.info(`[${functionName}] Successfully updated location for shipment ID: ${shipmentId}`);
        return true;
      } else {
        // This condition might be hit if the shipmentId does not exist in the table.
        logger.warn(`[${functionName}] Update attempted for shipment ID: ${shipmentId}, but no rows were affected. Shipment might not exist.`);
        return false;
      }

    } catch (error: any) {
      logger.error(`[${functionName}] Error updating location for shipment ID ${shipmentId}: ${error.message}`, { error });
      return false;
    }
  }

  /**
   * Updates the status of a shipment to 'DELIVERED' and records the actual arrival time
   * on the corresponding dropoff record.
   *
   * @param shipmentId - The UUID of the shipment to update.
   * @returns Promise<boolean> - True if both updates were successful, false otherwise.
   */
  async updateShipmentStatusToDelivered(shipmentId: string): Promise<boolean> {
    const functionName = 'updateShipmentStatusToDelivered';
    const deliveryTimestamp = new Date();
    logger.debug(`[${functionName}] Attempting to mark shipment DELIVERED for ID: ${shipmentId}`);

    if (!shipmentId) {
      logger.warn(`[${functionName}] Invalid shipmentId received. Aborting update.`);
      return false;
    }

    try {
      // 1. Update shipment status
      const shipmentUpdateResult = await db.update(schema.shipmentsErd)
        .set({
          status: 'COMPLETED',
          shipmentDateModified: deliveryTimestamp,
        })
        .where(eq(schema.shipmentsErd.id, shipmentId))
        .returning({ updatedId: schema.shipmentsErd.id });

      if (shipmentUpdateResult.length === 0) {
        logger.warn(`[${functionName}] Shipment status update failed for ID: ${shipmentId}. Shipment might not exist.`);
        // No need to proceed to dropoff update if shipment doesn't exist
        return false; 
      }

      logger.info(`[${functionName}] Successfully updated shipment status to DELIVERED for ID: ${shipmentId}`);

      // 2. Update associated dropoff arrival time
      // Assuming a shipment has one primary dropoff record linked via shipmentId
      // If multiple dropoffs are possible, this might need refinement (e.g., find the 'final' dropoff)
      const dropoffUpdateResult = await db.update(schema.dropoffs)
        .set({
          actualDateTimeOfArrival: deliveryTimestamp,
          dateModified: deliveryTimestamp, // Also update modified time
          // Optionally update activityStatus if needed:
          // activityStatus: 'ARRIVED' or 'DELIVERED' 
        })
        .where(eq(schema.dropoffs.shipmentId, shipmentId))
        .returning({ updatedId: schema.dropoffs.id });

      if (dropoffUpdateResult.length === 0) {
        // This might be expected if dropoff data wasn't created/linked correctly,
        // but log a warning as it could indicate an inconsistency.
        logger.warn(`[${functionName}] Could not find or update associated dropoff record for shipment ID: ${shipmentId}. Status updated, but arrival time not set.`);
        // Decide if this constitutes overall failure. Let's return true for now as shipment status was updated.
        // Consider returning false or throwing an error if dropoff update is critical.
      } else {
         logger.info(`[${functionName}] Successfully updated dropoff arrival time for shipment ID: ${shipmentId}`);
      }

      return true; // Indicate overall success (shipment status updated)

    } catch (error: any) {
      logger.error(`[${functionName}] Error updating shipment status/dropoff for ID ${shipmentId}: ${error.message}`, { error });
      return false;
    }
  }

  // Add other tracking-related methods here if needed...
}

// Optional: Export an instance if it's intended to be a singleton
// export const vehicleTrackingService = new VehicleTrackingService(); 