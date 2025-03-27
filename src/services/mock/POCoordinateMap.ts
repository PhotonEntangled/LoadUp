/**
 * POCoordinateMap Service
 * 
 * Provides mapping between post office names and their geographic coordinates.
 * Used for simulation and geocoding during the document-to-map flow.
 */

import { NamedLocation } from '../../types/ParsedShipment';

/**
 * Post office location mapping service
 */
export class POCoordinateMap {
  private static instance: POCoordinateMap | null = null;
  private locationMap: Map<string, NamedLocation>;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.locationMap = new Map<string, NamedLocation>();
    this.initializeLocations();
  }

  /**
   * Initialize with known post office locations
   */
  private initializeLocations(): void {
    // Major post offices in Malaysia (focused on Kuala Lumpur and Johor)
    const locations: NamedLocation[] = [
      {
        name: 'Kuala Lumpur General Post Office',
        latitude: 3.1493,
        longitude: 101.6953
      },
      {
        name: 'Damansara Heights Post Office',
        latitude: 3.1589, 
        longitude: 101.6502
      },
      {
        name: 'Bangsar Post Office',
        latitude: 3.1302,
        longitude: 101.6765
      },
      {
        name: 'Ampang Post Office',
        latitude: 3.1631,
        longitude: 101.7497
      },
      {
        name: 'Sentul Post Office',
        latitude: 3.1853,
        longitude: 101.6893
      },
      {
        name: 'Johor Bahru Post Office',
        latitude: 1.4655,
        longitude: 103.7578
      },
      {
        name: 'Johor Dropoff Location',
        latitude: 1.4927,
        longitude: 103.7414
      }
    ];

    // Populate the map
    locations.forEach(location => {
      this.locationMap.set(this.normalizeName(location.name), location);
    });
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): POCoordinateMap {
    if (!POCoordinateMap.instance) {
      POCoordinateMap.instance = new POCoordinateMap();
    }
    return POCoordinateMap.instance;
  }

  /**
   * Get coordinates for a post office by name
   * @param name Post office name
   * @returns Location with coordinates or null if not found
   */
  public getCoordinates(name: string): NamedLocation | null {
    const normalizedName = this.normalizeName(name);
    return this.locationMap.get(normalizedName) || this.findClosestMatch(normalizedName);
  }

  /**
   * Find closest match based on partial name
   * @param normalizedName Normalized post office name
   * @returns Best match location or null if none found
   */
  private findClosestMatch(normalizedName: string): NamedLocation | null {
    // Simple partial matching for now
    for (const [key, location] of this.locationMap.entries()) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return location;
      }
    }
    return null;
  }

  /**
   * Normalize post office name for consistent lookup
   * @param name Post office name
   * @returns Normalized name
   */
  private normalizeName(name: string): string {
    return name.toLowerCase().trim();
  }

  /**
   * Get all known post office locations
   * @returns Array of all post office locations
   */
  public getAllLocations(): NamedLocation[] {
    return Array.from(this.locationMap.values());
  }

  /**
   * Add a new location to the map
   * @param location Named location to add
   */
  public addLocation(location: NamedLocation): void {
    this.locationMap.set(this.normalizeName(location.name), location);
  }
}

/**
 * Helper function to get coordinates for a location name
 * @param name Location name (typically a post office)
 * @returns NamedLocation or null if not found
 */
export function getCoordinatesForLocation(name: string): NamedLocation | null {
  return POCoordinateMap.getInstance().getCoordinates(name);
}

/**
 * Helper function to get all registered locations
 * @returns Array of all registered locations
 */
export function getAllPostOfficeLocations(): NamedLocation[] {
  return POCoordinateMap.getInstance().getAllLocations();
} 