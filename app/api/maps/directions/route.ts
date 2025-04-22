import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger'; // Assuming logger is accessible

// Environment variable for the Mapbox Secret Token
const MAPBOX_SECRET_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

export async function GET(request: NextRequest) {
  // Ensure the secret token is configured
  if (!MAPBOX_SECRET_TOKEN) {
    logger.error('[API /maps/directions] MAPBOX_SECRET_TOKEN is not configured.');
    return NextResponse.json(
      { error: 'Map service configuration error.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  // Extract and validate coordinates from query parameters
  const originLon = searchParams.get('originLon');
  const originLat = searchParams.get('originLat');
  const destLon = searchParams.get('destLon');
  const destLat = searchParams.get('destLat');

  if (!originLon || !originLat || !destLon || !destLat) {
    return NextResponse.json(
      { error: 'Missing required coordinate parameters (originLon, originLat, destLon, destLat).' },
      { status: 400 }
    );
  }

  // Further validate if they are numbers
  const oLon = parseFloat(originLon);
  const oLat = parseFloat(originLat);
  const dLon = parseFloat(destLon);
  const dLat = parseFloat(destLat);

  if (isNaN(oLon) || isNaN(oLat) || isNaN(dLon) || isNaN(dLat)) {
    return NextResponse.json(
      { error: 'Invalid coordinate parameters. Coordinates must be numbers.' },
      { status: 400 }
    );
  }

  // Construct the Mapbox Directions API URL
  // Coordinates format: longitude,latitude;longitude,latitude
  const coordinates = `${oLon},${oLat};${dLon},${dLat}`;
  const mapboxApiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_SECRET_TOKEN}`;

  logger.debug(`[API /maps/directions] Requesting route for: ${coordinates}`);
  // logger.debug(`[API /maps/directions] Mapbox URL: ${mapboxApiUrl}`); // Be careful logging URLs with tokens

  try {
    const response = await fetch(mapboxApiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
      // Try to get error details from Mapbox response body if possible
      let errorBody = 'Unknown Mapbox API error';
      try {
        const errorJson = await response.json();
        errorBody = errorJson.message || JSON.stringify(errorJson);
      } catch (parseError) {
        // Ignore if response body isn't valid JSON
        errorBody = await response.text();
      }
      logger.error(`[API /maps/directions] Mapbox API error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
      return NextResponse.json(
        { error: `Failed to fetch route from map service. Status: ${response.status}` },
        { status: response.status === 401 ? 401 : 502 } // 401 for invalid token, 502 otherwise
      );
    }

    const data = await response.json();

    // Validate the Mapbox response
    if (data.code !== 'Ok') {
        logger.error(`[API /maps/directions] Mapbox API returned non-Ok code: ${data.code}`, data);
        return NextResponse.json(
          { error: `Map service returned error: ${data.code}` },
          { status: 500 }
        );
    }
    
    if (!data.routes || data.routes.length === 0) {
      logger.warn(`[API /maps/directions] No routes found for coordinates: ${coordinates}`);
      return NextResponse.json(
        { error: 'No route found between the specified coordinates.' },
        { status: 404 } // Not Found seems appropriate if no route exists
      );
    }
    
    // Extract the geometry of the first route
    const routeGeometry = data.routes[0].geometry;

    if (!routeGeometry || routeGeometry.type !== 'LineString') {
        logger.error('[API /maps/directions] Invalid or missing route geometry in Mapbox response.', data.routes[0]);
         return NextResponse.json(
           { error: 'Invalid route data received from map service.' },
           { status: 500 }
         );
    }

    logger.debug(`[API /maps/directions] Successfully fetched route geometry for: ${coordinates}`);
    
    // Return the GeoJSON geometry
    return NextResponse.json(routeGeometry);

  } catch (error) {
    logger.error('[API /maps/directions] Error fetching or processing Mapbox directions:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching map directions.' },
      { status: 500 }
    );
  }
} 