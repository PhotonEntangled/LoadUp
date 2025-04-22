import { NextResponse } from 'next/server';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';
import { logger } from '@/utils/logger'; // Assuming logger path

// Input validation schema (optional but recommended)
// import { z } from 'zod';
// const DirectionsRequestSchema = z.object({
//   origin: z.array(z.number()).length(2),
//   destination: z.array(z.number()).length(2),
// });

export async function POST(request: Request) {
  const mapboxSecretToken = process.env.MAPBOX_SECRET_TOKEN;

  if (!mapboxSecretToken) {
    logger.error('[API /api/directions] MAPBOX_SECRET_TOKEN is not configured on the server.');
    return NextResponse.json({ error: 'Server configuration error: Missing Mapbox token.' }, { status: 500 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    logger.warn('[API /api/directions] Failed to parse request body as JSON.', { error });
    return NextResponse.json({ error: 'Invalid request body: Must be valid JSON.' }, { status: 400 });
  }

  // --- Basic Input Validation ---
  // You can add more robust validation using Zod or similar libraries
  if (!requestBody || !requestBody.origin || !requestBody.destination ||
      !Array.isArray(requestBody.origin) || requestBody.origin.length !== 2 ||
      !Array.isArray(requestBody.destination) || requestBody.destination.length !== 2 ||
      requestBody.origin.some((coord: any) => typeof coord !== 'number') ||
      requestBody.destination.some((coord: any) => typeof coord !== 'number')) {
    logger.warn('[API /api/directions] Invalid input format.', { body: requestBody });
    return NextResponse.json({ error: 'Invalid input: Requires origin and destination as [longitude, latitude] arrays.' }, { status: 400 });
  }

  const { origin, destination } = requestBody;

  try {
    const directionsClient = MapboxDirections({ accessToken: mapboxSecretToken });
    const response = await directionsClient
      .getDirections({
        profile: 'driving',
        waypoints: [
          { coordinates: origin },
          { coordinates: destination },
        ],
        geometries: 'geojson',
        overview: 'full',
      })
      .send();

    if (response && response.body && response.body.routes && response.body.routes.length > 0) {
      logger.info(`[API /api/directions] Route successfully fetched for origin: ${origin}`);
      const routeGeometry = response.body.routes[0].geometry;

      // <<< REVERTED: Remove temporary logging >>>
      // if (origin[0] === 101.711861 && origin[1] === 3.157764) { // Check if it's the NEW mid-trip coords
      //     console.log('--- BEGIN CORRECTED ROUTE GEOMETRY (Copy from Server Console) ---');
      //     console.log(JSON.stringify(routeGeometry, null, 2));
      //     console.log('--- END CORRECTED ROUTE GEOMETRY ---');
      // }
      // <<< END REVERTED >>>
      
      // Normal response for other requests
      return NextResponse.json({ route: routeGeometry });
    } else {
      logger.warn('[API /api/directions] No routes found by Mapbox.', { origin, destination, mapboxStatus: response?.statusCode });
      // Return a specific structure indicating no route found
      return NextResponse.json({ route: null, message: 'No route found between the specified points.' }, { status: 200 }); // Or 404 maybe? 200 with null route seems common.
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Mapbox SDK error';
    logger.error('[API /api/directions] Error fetching route from Mapbox SDK:', {
      message: errorMessage,
      origin,
      destination,
      sdkErrorBody: (error as any)?.body,
      statusCode: (error as any)?.statusCode,
      errorObject: error,
    });
    // Return a generic server error to the client
    return NextResponse.json({ error: 'Failed to fetch route due to server error.', details: errorMessage }, { status: 500 });
  }
} 