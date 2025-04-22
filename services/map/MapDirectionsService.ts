import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { logger } from '../../utils/logger'; // Import logger
// import { getMapboxToken } from '@/utils/mapbox-token'; // Removed incorrect import

/**
 * Service to interact with the Mapbox Directions API.
 * NOTE: Handles basic fetch logic. Callers are responsible for handling 
 * a null return value (indicating fetch failure or no routes found) and 
 * presenting appropriate user-facing errors.
 */
class MapDirectionsService {
  private directionsClient: ReturnType<typeof MapboxDirections>;
  private static instance: MapDirectionsService | null = null;
  private static isInitialized = false;

  private constructor(accessToken: string) {
    this.directionsClient = MapboxDirections({ accessToken });
  }

  /**
   * Get the singleton instance of the MapDirectionsService.
   * Initializes the service on first call.
   * Returns null if the Mapbox token is not configured.
   */
  public static getInstance(): MapDirectionsService | null {
    if (!this.isInitialized) {
      // Use the SECRET token for backend services like Directions API
      const mapboxSecretToken = process.env.MAPBOX_SECRET_TOKEN;
      if (!mapboxSecretToken) {
        logger.error('[MapDirectionsService] MAPBOX_SECRET_TOKEN is not available in environment variables. Directions service cannot be initialized.');
      } else {
        this.instance = new MapDirectionsService(mapboxSecretToken);
        logger.info('MapDirectionsService initialized successfully.');
      }
      this.isInitialized = true;
    }
    // Return the instance (which might be null if token was missing)
    if (!this.instance) {
        logger.error('[MapDirectionsService] Attempted to get instance, but it failed initialization (likely missing token).');
    }
    return this.instance;
  }

  /**
   * Fetches a route between two points using the Mapbox Directions API.
   *
   * @param origin - The starting coordinates [longitude, latitude].
   * @param destination - The ending coordinates [longitude, latitude].
   * @returns A Promise resolving to the Mapbox Directions API response body (type: any due to SDK type limitations),
   *          or null if an error occurs during fetch or no routes are found.
   */
  async fetchRoute(origin: [number, number], destination: [number, number]): Promise<any | null> {
    // SPECIFICATION FOR V0: UI should handle cases where this returns null 
    // (e.g., display "Route calculation failed", disable simulation start).
    try {
      logger.debug('Fetching route from Mapbox', { origin, destination });
      const response = await this.directionsClient
        .getDirections({
          profile: 'driving', // or 'walking', 'cycling'
          waypoints: [
            { coordinates: origin },
            { coordinates: destination },
          ],
          geometries: 'geojson', // Get the route geometry as GeoJSON
          overview: 'full', // Get the full overview geometry
        })
        .send();

      if (response && response.body && response.body.routes && response.body.routes.length > 0) {
        logger.debug('Route fetched successfully', { routeCount: response.body.routes.length });
        return response.body; // Return the full response body
      } else {
        logger.warn('No routes found in Mapbox response', { origin, destination, responseStatus: response?.statusCode });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during route fetch';
      logger.error('Error fetching route from Mapbox:', { 
          message: errorMessage,
          origin, 
          destination,
          sdkErrorBody: (error as any)?.body, // Include Mapbox SDK specific error details if available
          statusCode: (error as any)?.statusCode
      });
      // Returning null signifies failure to the caller
      return null;
    }
  }
}

// Export the class directly for consumers to call getInstance()
export { MapDirectionsService };

// --- Removed previous initialization logic ---
// const mapboxToken = getMapboxToken();
// if (!mapboxToken) {
//   console.error('Mapbox token is not available. Directions service cannot be initialized.');
// }
// const mapDirectionsService = mapboxToken ? new MapDirectionsService(mapboxToken) : null;
// export default mapDirectionsService; 