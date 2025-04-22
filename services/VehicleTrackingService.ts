import { db } from '@/lib/database/drizzle';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/database/schema';
import { logger } from '@/utils/logger';

interface UpdateLocationParams {
  shipmentId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
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
    const { shipmentId, latitude, longitude, timestamp } = params;
    const functionName = 'updateShipmentLastKnownLocation';
    logger.debug(`[${functionName}] Attempting update for shipment ID: ${shipmentId}`);

    try {
      // Basic validation
      if (!shipmentId || latitude == null || longitude == null || !timestamp) {
         logger.warn(`[${functionName}] Invalid parameters received for shipment ${shipmentId}. Aborting update.`);
         return false;
      }
       
      // Convert numbers to strings for decimal fields, as expected by Drizzle for numeric/decimal types
      const latString = String(latitude);
      const lonString = String(longitude);

      // Perform the database update using Drizzle
      const result = await db.update(schema.shipmentsErd)
        .set({ 
          lastKnownLatitude: latString, 
          lastKnownLongitude: lonString, 
          lastKnownTimestamp: timestamp 
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

  // Add other tracking-related methods here if needed...
}

// Optional: Export an instance if it's intended to be a singleton
// export const vehicleTrackingService = new VehicleTrackingService(); 