import { logger } from '@/utils/logger'; // Assuming logger is accessible via alias
import type { ApiAddressDetail } from '../../types/api'; // Adjust path as needed

// Environment variable for the Mapbox Secret Token
const MAPBOX_SECRET_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

// Define a structure for the relevant parts of the Mapbox Geocoding API response
// See: https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
interface MapboxFeature {
    id: string;
    type: 'Feature';
    place_type: string[];
    relevance: number;
    properties: Record<string, any>; // Can contain various properties
    text: string;
    place_name: string; // Full address string
    center: [number, number]; // [longitude, latitude]
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    address?: string; // Sometimes present (house number)
    context?: Array<{
        id: string;
        text: string;
        wikidata?: string;
        short_code?: string; // e.g., "MY-10" for state, "MY" for country
    }>;
}

interface MapboxGeocodingResponse {
    type: 'FeatureCollection';
    query: string[];
    features: MapboxFeature[];
    attribution: string;
}

/**
 * Geocodes a raw address string using the Mapbox Geocoding API.
 * 
 * @param addressString The raw address string to geocode.
 * @returns A promise that resolves to a partial ApiAddressDetail containing geocoded information, or null if geocoding fails or yields no results.
 */
export async function geocodeAddress(addressString: string | null | undefined): Promise<Partial<ApiAddressDetail> | null> {
    const functionName = '[geocodeAddress]';
    if (!addressString || !addressString.trim()) {
        logger.warn(`${functionName} Received null or empty address string.`);
        return null;
    }

    const trimmedAddress = addressString.trim();
    logger.info(`${functionName} Attempting to geocode address: "${trimmedAddress}"`);

    if (!MAPBOX_SECRET_TOKEN) {
        logger.error(`${functionName} MAPBOX_SECRET_TOKEN is not configured. Cannot geocode.`);
        // Avoid throwing an error that might break the whole process, just return null.
        // The caller should handle the missing coordinates.
        return null; 
    }

    try {
        // Encode the address string for the URL
        const encodedAddress = encodeURIComponent(trimmedAddress);
        // Construct the Mapbox Geocoding API URL (v5 endpoint)
        // Prioritize results in Malaysia, limit to 1 result
        const mapboxApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?country=MY&limit=1&access_token=${MAPBOX_SECRET_TOKEN}`;

        // logger.debug(`${functionName} Calling Mapbox Geocoding API: ${mapboxApiUrl}`); // Careful with token

        const response = await fetch(mapboxApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            let errorBody = 'Unknown Mapbox API error';
            try {
                const errorJson = await response.json();
                errorBody = errorJson.message || JSON.stringify(errorJson);
            } catch { errorBody = await response.text(); }
            logger.error(`${functionName} Mapbox Geocoding API error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            // Return null on API error, let caller handle missing coords
            return null;
        }

        const data: MapboxGeocodingResponse = await response.json();

        // Validate the response structure
        if (!data || !Array.isArray(data.features) || data.features.length === 0) {
            logger.warn(`${functionName} No geocoding features found for address: "${trimmedAddress}"`);
            return null; // No results found
        }

        const bestMatch = data.features[0];
        logger.info(`${functionName} Geocoding successful for "${trimmedAddress}". Best match: "${bestMatch.place_name}", Relevance: ${bestMatch.relevance}`);

        // Extract coordinates
        const longitude = bestMatch.center?.[0] ?? bestMatch.geometry?.coordinates?.[0] ?? null;
        const latitude = bestMatch.center?.[1] ?? bestMatch.geometry?.coordinates?.[1] ?? null;

        if (latitude === null || longitude === null) {
            logger.warn(`${functionName} Could not extract valid coordinates from best match for "${trimmedAddress}".`);
            return null; // Return null if essential coordinates are missing
        }

        // Extract other details from context (more robust extraction)
        let city: string | null = null;
        let stateProvince: string | null = null;
        let postalCode: string | null = null;
        let country: string | null = null;
        let street: string | null = bestMatch.address ? `${bestMatch.address} ${bestMatch.text}` : bestMatch.text; // Combine number + street name if available
        
        // Refine street extraction: if place_type includes 'address', text is likely the street name.
        // If place_type is broader (like 'poi'), text might be the POI name, not the street.
        if (!bestMatch.place_type.includes('address') && !bestMatch.place_type.includes('neighborhood')) {
            // If it's not granular enough, street might be less certain. Maybe nullify or use properties if available.
             // For now, keep bestMatch.text as a fallback street info
        } else if (bestMatch.address && bestMatch.text && bestMatch.text.includes(bestMatch.address)) {
             // Avoid duplicating street number if already in text
             street = bestMatch.text;
        }


        if (bestMatch.context) {
            for (const ctx of bestMatch.context) {
                const type = ctx.id.split('.')[0]; // e.g., postcode, place, region, country
                if (type === 'postcode') postalCode = ctx.text;
                else if (type === 'locality' || type === 'place') city = ctx.text; // 'place' often represents city
                else if (type === 'region') stateProvince = ctx.text;
                else if (type === 'country') country = ctx.text;
            }
        }

        // Construct the partial ApiAddressDetail object
        const geocodedDetail: Partial<ApiAddressDetail> = {
            rawInput: trimmedAddress,
            fullAddress: bestMatch.place_name, // Use Mapbox formatted place_name
            street: street,
            city: city,
            stateProvince: stateProvince,
            postalCode: postalCode,
            country: country,
            latitude: latitude,
            longitude: longitude,
            resolutionMethod: 'geocode',
            resolutionConfidence: bestMatch.relevance, // Use Mapbox relevance score
            resolvedTimestamp: new Date().toISOString(),
            // We don't typically get a structured name (like company name) from geocoding
            name: null, 
        };

        logger.debug(`${functionName} Geocoded result:`, geocodedDetail);
        return geocodedDetail;

    } catch (error) {
        logger.error(`${functionName} Error during geocoding process for "${trimmedAddress}":`, error);
        return null; // Return null on unexpected errors
    }
} 