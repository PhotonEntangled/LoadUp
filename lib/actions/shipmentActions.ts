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
): Promise<{ position: Feature<Point> | null; timestamp: string | null; error?: string }> {
  logger.info(`[Server Action] Fetching last known location for shipment: ${shipmentId}`);
  if (!shipmentId) {
    return { position: null, timestamp: null, error: 'Shipment ID is required.' };
  }

  try {
    const result = await db
      .select({
        latitude: shipmentsErd.lastKnownLatitude,
        longitude: shipmentsErd.lastKnownLongitude,
        timestamp: shipmentsErd.lastKnownTimestamp,
      })
      .from(shipmentsErd)
      .where(eq(shipmentsErd.id, shipmentId))
      .limit(1);

    if (!result || result.length === 0) {
      logger.warn(`[Server Action] No shipment found with ID: ${shipmentId}`);
      return { position: null, timestamp: null, error: 'Shipment not found.' };
    }

    const locationData = result[0];
    const lat = locationData.latitude ? parseFloat(locationData.latitude) : null;
    const lon = locationData.longitude ? parseFloat(locationData.longitude) : null;
    const timestamp = locationData.timestamp ? locationData.timestamp.toISOString() : null;

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
      logger.info(`[Server Action] Found last known location for ${shipmentId}: [${lon}, ${lat}] at ${timestamp}`);
    } else {
      logger.info(`[Server Action] No valid last known location coordinates found for ${shipmentId}`);
    }

    return { position: positionFeature, timestamp: timestamp };
  } catch (error) {
    logger.error(`[Server Action] Error fetching last known location for ${shipmentId}:`, error);
    return { position: null, timestamp: null, error: 'Database error fetching location.' };
  }
} 