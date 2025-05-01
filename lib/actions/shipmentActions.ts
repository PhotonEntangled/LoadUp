"use server";

import { logger } from '@/utils/logger';

// Existing simulation actions...

// --- NEW SERVER ACTION --- 
import { db } from '@/lib/database/drizzle';
import { eq } from 'drizzle-orm';
import { shipmentsErd } from '@/lib/database/schema';
import { Feature, Point } from 'geojson';

interface LastKnownLocation {
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null; // ISO string
}

/**
 * Fetches the last known location details for a specific shipment.
 */
export async function getShipmentLastKnownLocation(
  shipmentId: string
): Promise<{ position: Feature<Point> | null; timestamp: string | null; bearing: number | null; error?: string }> {
  // --- ADDED: Entry Log ---
  logger.info(`
-------
[Server Action getShipmentLastKnownLocation] INVOKED for shipment: ${shipmentId}
-------
`);
  // --- END ADDED --- 

  if (!shipmentId) {
    logger.error("[Server Action getShipmentLastKnownLocation] Failed: Shipment ID is required.")
    return { position: null, timestamp: null, bearing: null, error: 'Shipment ID is required.' };
  }

  try {
    logger.debug(`[Server Action getShipmentLastKnownLocation] Executing DB query for ${shipmentId}...`);
    const result = await db
      .select({
        latitude: shipmentsErd.lastKnownLatitude,
        longitude: shipmentsErd.lastKnownLongitude,
        timestamp: shipmentsErd.lastKnownTimestamp,
        bearing: shipmentsErd.lastKnownBearing
      })
      .from(shipmentsErd)
      .where(eq(shipmentsErd.id, shipmentId))
      .limit(1);
      
    // --- ADDED: Log DB Result ---
    logger.debug(`[Server Action getShipmentLastKnownLocation] DB Query Result for ${shipmentId}:`, JSON.stringify(result, null, 2));
    // --- END ADDED --- 

    if (!result || result.length === 0) {
      logger.warn(`[Server Action getShipmentLastKnownLocation] No shipment found in DB with ID: ${shipmentId}`);
      return { position: null, timestamp: null, bearing: null, error: 'Shipment not found.' }; // Keep error for frontend clarity
    }

    const locationData = result[0];
    // --- ADDED: Log Raw Data --- 
    logger.debug(`[Server Action getShipmentLastKnownLocation] Raw locationData:`, JSON.stringify(locationData, null, 2));
    // --- END ADDED --- 
    
    const lat = locationData.latitude ? parseFloat(locationData.latitude) : null;
    const lon = locationData.longitude ? parseFloat(locationData.longitude) : null;
    const timestamp = locationData.timestamp ? locationData.timestamp.toISOString() : null;
    
    // --- ADDED: Log Parsed Data ---
    logger.debug(`[Server Action getShipmentLastKnownLocation] Parsed lat: ${lat} (type: ${typeof lat}), lon: ${lon} (type: ${typeof lon}), timestamp: ${timestamp}`);
    // --- END ADDED ---

    let positionFeature: Feature<Point> | null = null;
    if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
      positionFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties: { timestamp: timestamp },
      };
      logger.info(`[Server Action getShipmentLastKnownLocation] SUCCESS: Found and formatted position for ${shipmentId}.`);
    } else {
      logger.warn(`[Server Action getShipmentLastKnownLocation] No valid coordinates after parsing for ${shipmentId}. Lat: ${locationData.latitude}, Lon: ${locationData.longitude}`);
    }

    const bearing = locationData.bearing ? parseFloat(locationData.bearing) : null;
    logger.debug(`[Server Action getShipmentLastKnownLocation] Parsed bearing: ${bearing}`);

    return { position: positionFeature, timestamp: timestamp, bearing: bearing };
  } catch (error) {
    logger.error(`[Server Action getShipmentLastKnownLocation] CRITICAL ERROR fetching location for ${shipmentId}:`, error);
    // Ensure the error is propagated
    const errorMessage = error instanceof Error ? error.message : 'Database error fetching location.';
    return { position: null, timestamp: null, bearing: null, error: errorMessage };
  }
} 