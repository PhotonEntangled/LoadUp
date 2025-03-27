import { LngLatLike } from 'mapbox-gl';

// Local implementation of the token utility
const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoibG9hZHVwIiwiYSI6ImNsbTUxcWVsajJnOXAzZG83cHo1bjB5dWYifQ.8Fh30KBunCj-FlP2E7hGUw';

const getMapboxPublicToken = (): string => {
  // Check all potential token environment variables
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const publicToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mappingToken = process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN;
  
  // Use the first available token with fallback
  return accessToken || publicToken || mappingToken || FALLBACK_PUBLIC_TOKEN;
};

// Mapbox access token - use utility function
const MAPBOX_ACCESS_TOKEN = getMapboxPublicToken();

export interface GeocodingResult {
  placeId: string;
  placeName: string;
  latitude: number;
  longitude: number;
  address: {
    street?: string;
    housenumber?: string;
    neighborhood?: string;
    locality?: string;
    city?: string;
    district?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    formattedAddress: string;
  };
  type: string;
  confidence: number;
}

export interface ReverseGeocodingResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeType: string;
  formattedAddress: string;
  distance: number;
}

export interface GeocodingOptions {
  country?: string;
  proximity?: LngLatLike;
  limit?: number;
  language?: string;
  types?: string[];
  autocomplete?: boolean;
}

// Modify the cache interface to accept any type of result
export interface GeocodingCache {
  [key: string]: {
    results: GeocodingResult[] | ReverseGeocodingResult[];
    timestamp: number;
    expiry: number;
  };
}

/**
 * Service for geocoding addresses and reverse geocoding coordinates using Mapbox
 */
class MapboxGeocodingService {
  private cache: GeocodingCache = {};
  private cacheExpiryMs: number;
  private accessToken: string;
  
  /**
   * Creates a new instance of MapboxGeocodingService
   * @param cacheExpiryMs Time in milliseconds after which cached results expire (default: 24 hours)
   */
  constructor(cacheExpiryMs = 24 * 60 * 60 * 1000) {
    this.cacheExpiryMs = cacheExpiryMs;
    this.accessToken = MAPBOX_ACCESS_TOKEN || '';
    
    if (!this.accessToken) {
      console.warn('Mapbox access token not provided. Geocoding service will not work.');
    }
  }

  /**
   * Geocodes an address to coordinates
   * @param address The address to geocode
   * @param options Geocoding options
   * @returns Promise resolving to an array of geocoding results
   * @throws Error if geocoding fails
   */
  async geocode(address: string, options: GeocodingOptions = {}): Promise<GeocodingResult[]> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not provided');
    }

    if (!address || address.trim() === '') {
      return [];
    }

    // Generate cache key based on address and options
    const cacheKey = `geocode:${address}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cachedResult = this.getFromCache<GeocodingResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Prepare query parameters
      const params = new URLSearchParams({
        access_token: this.accessToken,
        limit: options.limit?.toString() || '5',
      });

      // Add optional parameters
      if (options.country) params.append('country', options.country);
      if (options.language) params.append('language', options.language);
      if (options.types && options.types.length > 0) params.append('types', options.types.join(','));
      if (options.autocomplete !== undefined) params.append('autocomplete', options.autocomplete.toString());
      
      // Add proximity if provided
      if (options.proximity) {
        const proximity = options.proximity as { lng: number; lat: number } | [number, number];
        let proximityStr: string;
        
        if (Array.isArray(proximity)) {
          proximityStr = `${proximity[0]},${proximity[1]}`;
        } else {
          proximityStr = `${proximity.lng},${proximity.lat}`;
        }
        
        params.append('proximity', proximityStr);
      }

      // Encode the address for the URL
      const encodedAddress = encodeURIComponent(address);
      
      // Make the geocoding request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response into our GeocodingResult format
      const results: GeocodingResult[] = data.features.map((feature: any) => {
        // Extract address components
        const context = feature.context || [];
        const addressComponents = {
          street: this.findInContext(context, 'address') || '',
          housenumber: feature.address || '',
          neighborhood: this.findInContext(context, 'neighborhood') || '',
          locality: this.findInContext(context, 'locality') || '',
          city: this.findInContext(context, 'place') || '',
          district: this.findInContext(context, 'district') || '',
          region: this.findInContext(context, 'region') || '',
          country: this.findInContext(context, 'country') || '',
          postalCode: this.findInContext(context, 'postcode') || '',
          formattedAddress: feature.place_name || '',
        };

        return {
          placeId: feature.id,
          placeName: feature.place_name,
          latitude: feature.center[1],
          longitude: feature.center[0],
          address: addressComponents,
          type: feature.place_type[0],
          confidence: feature.relevance,
        };
      });

      // Cache the results
      this.addToCache(cacheKey, results);

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Geocoding failed: ${error.message}`);
      } else {
        throw new Error('Geocoding failed with unknown error');
      }
    }
  }

  /**
   * Performs reverse geocoding (coordinates to address)
   * @param latitude Latitude
   * @param longitude Longitude
   * @param options Geocoding options
   * @returns Promise resolving to reverse geocoding results
   * @throws Error if reverse geocoding fails
   */
  async reverseGeocode(
    latitude: number, 
    longitude: number, 
    options: Omit<GeocodingOptions, 'proximity' | 'autocomplete'> = {}
  ): Promise<ReverseGeocodingResult[]> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not provided');
    }

    // Generate cache key
    const cacheKey = `reverse:${longitude},${latitude}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cachedResult = this.getFromCache<ReverseGeocodingResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Prepare query parameters
      const params = new URLSearchParams({
        access_token: this.accessToken,
        limit: options.limit?.toString() || '5',
      });

      // Add optional parameters
      if (options.country) params.append('country', options.country);
      if (options.language) params.append('language', options.language);
      if (options.types && options.types.length > 0) params.append('types', options.types.join(','));

      // Make the reverse geocoding request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response into our ReverseGeocodingResult format
      const results: ReverseGeocodingResult[] = data.features.map((feature: any) => {
        return {
          name: feature.text || '',
          address: feature.place_name || '',
          latitude: feature.center[1],
          longitude: feature.center[0],
          placeType: feature.place_type[0],
          formattedAddress: feature.place_name || '',
          distance: 0, // Mapbox doesn't provide distance in geocoding responses
        };
      });

      // Cache the results
      this.addToCache(cacheKey, results);

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Reverse geocoding failed: ${error.message}`);
      } else {
        throw new Error('Reverse geocoding failed with unknown error');
      }
    }
  }

  /**
   * Gets an item from the cache if it exists and hasn't expired
   * @param key Cache key
   * @returns Cached results or null if not found or expired
   */
  private getFromCache<T>(key: string): T[] | null {
    const cached = this.cache[key];
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.expiry) {
      // Cache expired, remove it
      delete this.cache[key];
      return null;
    }

    return cached.results as T[];
  }

  /**
   * Adds results to the cache
   * @param key Cache key
   * @param results Results to cache
   * @param expiry Optional custom expiry time in ms
   */
  private addToCache<T>(key: string, results: T[], expiry?: number): void {
    this.cache[key] = {
      results: results as any,
      timestamp: Date.now(),
      expiry: expiry || this.cacheExpiryMs,
    };
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Helper function to find a specific property in Mapbox context array
   * @param context Context array from Mapbox response
   * @param type Type of context to find
   * @returns The text value if found, undefined otherwise
   */
  private findInContext(context: any[], type: string): string | undefined {
    const item = context.find((c: any) => c.id.startsWith(`${type}.`));
    return item?.text;
  }
}

export default MapboxGeocodingService; 