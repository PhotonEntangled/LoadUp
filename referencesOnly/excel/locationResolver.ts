import { LocationDetail } from '../../types/shipment';
import { logger } from '../../utils/logger'; // Assuming logger is accessible like this

// TODO: Consider making this a class if it needs shared state or dependencies injected

/**
 * Placeholder function to resolve ambiguous location strings.
 * In a real implementation, this would first check an internal list of hubs,
 * then call a geocoding API (e.g., Mapbox Geocoding) as a fallback.
 * @param locationString The ambiguous string (e.g., "LOADUP JB", "Prai Hub")
 * @param context Optional context like state or full address for disambiguation
 * @returns A partial LocationDetail object with resolved info, or null if unresolvable.
 */
export async function resolveAmbiguousLocation(locationString: string, context?: any): Promise<Partial<LocationDetail> | null> {
  logger.info(`Attempting to resolve ambiguous location: "${locationString}"`, { context });

  // ** STUBBED IMPLEMENTATION **
  // TODO: Replace with actual internal lookup + geocoding API call

  // Simple keyword checking for simulation placeholders
  const upperLocationString = locationString?.toUpperCase() || ''; // Ensure check happens here

  if (upperLocationString.includes("LOADUP JB")) {
    logger.warn(`Using STUBBED coordinates for "${locationString}"`);
    return {
      resolvedAddress: "Loadup JB Hub (Estimated)",
      city: "Johor Bahru", // Best guess
      state: "Johor", // Assuming based on "JB"
      latitude: 1.4656, // Example coordinates for JB area
      longitude: 103.7578,
      resolutionMethod: 'estimated', // Mark as estimated
      resolutionConfidence: 0.5 // Low confidence for stub
    };
  }
  if (upperLocationString.includes("LOADUP PN") || upperLocationString.includes("PRAI HUB")) {
      logger.warn(`Using STUBBED coordinates for "${locationString}"`);
      return {
        resolvedAddress: "Loadup Prai Hub (Estimated)",
        city: "Perai", // Best guess
        state: "Penang", // Assuming based on "PN" or "Prai"
        latitude: 5.35, // Rough coordinates from previous search
        longitude: 100.40,
        resolutionMethod: 'estimated',
        resolutionConfidence: 0.5
      };
    }
  // Check for RETAIL OUTSTATION (Moved from ExcelParserService)
  if (upperLocationString.includes("RETAIL OUTSTATION") && upperLocationString.includes("PENANG")) {
      logger.info(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${locationString}" (Outstation)`);
      return {
          resolvedAddress: "Loadup Prai Hub (Estimated from Outstation)",
          city: "Perai",
          state: "Penang",
          latitude: 5.35, // Rough coordinates
          longitude: 100.40,
          resolutionMethod: 'estimated',
          resolutionConfidence: 0.6 // Slightly higher confidence due to specific pattern
      };
  }
  // **Refinement**: Add specific check for the Johor Outstation/Warehouse string
  if (upperLocationString.includes("WAREHOUSE: LOT 198 B JALAN BANFOO")) { // Check for unique part
      logger.info(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${locationString}" (Johor Outstation)`);
      return {
          resolvedAddress: "Ulu Tiram Hub (Estimated from Outstation)",
          city: "Ulu Tiram",
          state: "Johor",
          latitude: 1.5837, // Approx coordinates for Ulu Tiram
          longitude: 103.8242,
          resolutionMethod: 'estimated',
          resolutionConfidence: 0.6 // Slightly higher confidence due to specific pattern
      };
  }
  // Check for NIRO/XINWHA (Moved from ExcelParserService)
  if (upperLocationString.includes("NIRO") || upperLocationString.includes("XIN HWA") || upperLocationString.includes("XINWHA")) {
      const stateCtx = context?.stateContext?.toUpperCase();
      let estimatedLocation = "Central Logistics Hub (Estimated)";
      let lat = 2.5; 
      let lon = 101.5;

      if (stateCtx === 'JOHOR') {
          estimatedLocation = "NIRO/XINWHA JB Hub (Estimated)";
          lat = 1.4656; lon = 103.7578;
      } else if (stateCtx === 'PENANG') {
           estimatedLocation = "NIRO/XINWHA Prai Hub (Estimated)";
           lat = 5.35; lon = 100.40;
      } else if (stateCtx === 'MALACCA' || stateCtx === 'MELAKA') {
           estimatedLocation = "NIRO/XINWHA Melaka Hub (Estimated)";
           lat = 2.1896; lon = 102.2501;
      }

      logger.info(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${locationString}" based on context: ${stateCtx || 'N/A'}`);
      return {
          resolvedAddress: estimatedLocation,
          latitude: lat,
          longitude: lon,
          resolutionMethod: 'estimated', 
          resolutionConfidence: 0.4 
      };
  }
  // **Refinement**: Handle generic "RETAIL OUTSTATION - OTHER STATES" - Use context or return none
  if (upperLocationString.includes("RETAIL OUTSTATION - OTHER STATES")) {
      const stateCtx = context?.stateContext?.toUpperCase();
      const cityCtx = context?.cityContext?.toUpperCase(); // Future enhancement
      logger.warn(`[resolveAmbiguousLocation] Generic "OTHER STATES" outstation found. Destination context: State=${stateCtx || 'N/A'}, City=${cityCtx || 'N/A'}. Cannot reliably estimate origin.`);
      // Optionally, could try to guess based on destination state (e.g., if stateCtx is Negeri Sembilan for Rantau)
      // For now, return none as it's too ambiguous without a proper lookup table or geocoding
      return {
        resolutionMethod: 'none', 
        resolutionConfidence: 0
      };
  }

  logger.warn(`Could not resolve ambiguous location: "${locationString}" with stubbed logic.`);
  return {
    resolutionMethod: 'none', // Indicate failure to resolve with current stub
    resolutionConfidence: 0
  };
}

/**
 * Creates a LocationDetail object from standard address fields.
 * @param rowData Raw row data object.
 * @returns LocationDetail object or null.
 */
export function createLocationDetailFromAddressFields(rowData: Record<string, any>): LocationDetail | null {
  const address = rowData.shipToAddress;
  const city = rowData.shipToCity;
  const state = rowData.shipToState;
  const zip = rowData.shipToZip;
  const country = rowData.shipToCountry;

  if (!address && !city && !state && !zip && !country) {
    return null;
  }

  // Combine available fields into a formatted address (simple version)
  const parts = [address, city, state, zip, country].filter(Boolean);
  const resolvedAddress = parts.join(', ');

  // In a real scenario, you might geocode this combined address
  // to get lat/lon and verify components.
  // For now, we assume these directly mapped fields are correct.

  return {
    rawInput: address, // Assuming shipToAddress is the primary raw input here
    resolvedAddress: resolvedAddress || undefined,
    street: address || undefined, // Simplistic mapping
    city: city || undefined,
    state: state || undefined,
    postalCode: zip || undefined,
    country: country || undefined,
    // latitude, longitude would come from geocoding the address if needed
    resolutionMethod: 'direct', // Data came from directly mapped fields
    resolutionConfidence: 0.9 // High confidence for direct fields
  };
}

/**
 * Pre-scans the first few rows of a sheet for potential origin location strings.
 * Looks for keywords and address-like patterns.
 * @param jsonData The raw sheet data (array of arrays).
 * @param rowsToScan Number of rows from the top to scan.
 * @returns The most likely origin string found, or null.
 */
export function preScanForOrigin(jsonData: any[][], rowsToScan: number): string | null {
  logger.debug(`[preScanForOrigin] Scanning first ${rowsToScan} rows for potential origin.`);
  let bestCandidate: string | null = null;
  const maxRows = Math.min(rowsToScan, jsonData.length);

  const originKeywords = ['WAREHOUSE', 'PICKUP', 'ORIGIN', 'DEPOT', 'HUB', 'OUTSTATION', 'FROM'];
  // Simple pattern: looks for a number followed by a space, common in addresses
  const addressPattern = /\d+\s+/;

  for (let i = 0; i < maxRows; i++) {
    const row = jsonData[i];
    if (!row) continue;

    for (let j = 0; j < row.length; j++) {
      const cellValue = row[j];
      if (cellValue && typeof cellValue === 'string' && cellValue.trim().length > 5) { // Ignore short strings
        const upperCellValue = cellValue.toUpperCase();
        
        // Check for keywords
        const hasKeyword = originKeywords.some(keyword => upperCellValue.includes(keyword));
        // Check for address pattern
        const hasAddressPattern = addressPattern.test(cellValue);
        // Check specifically for the known problematic string
        const isKnownOutstation = upperCellValue.includes('RETAIL OUTSTATION');

        if (isKnownOutstation || (hasKeyword && hasAddressPattern)) {
           // Basic check: Is this cell potentially part of the header row content?
           // Avoid picking up headers like "Pickup Warehouse Address"
           // RELAXED CHECK: Only consider it a header if the immediate next row also has content in the same column.
           const isLikelyHeader = jsonData[i+1]?.[j] !== undefined && jsonData[i+1]?.[j] !== null && String(jsonData[i+1]?.[j]).trim() !== ''; 
           
           // PRIORITIZE known outstation string even if it looks like a header column based on relaxed check
           if (isKnownOutstation || !isLikelyHeader) { 
               logger.info(`[preScanForOrigin] Found candidate on row ${i}, col ${j}: "${cellValue}" (isKnownOutstation: ${isKnownOutstation}, isLikelyHeader: ${isLikelyHeader})`);
               // Simple logic: prioritize known patterns or longer strings
               if (isKnownOutstation || !bestCandidate || cellValue.length > bestCandidate.length) {
                   logger.info(`[preScanForOrigin] Selecting candidate: "${cellValue.trim()}"`); 
                   bestCandidate = cellValue.trim();
               }
           } else {
              logger.info(`[preScanForOrigin] Candidate "${cellValue}" on row ${i}, col ${j} skipped (likely header).`); 
           }
        } else {
          // Optional: Log why it wasn't a candidate (e.g., no keyword, no pattern)
           // if (cellValue && typeof cellValue === 'string' && cellValue.trim().length > 5) { 
           //    logger.trace(`[preScanForOrigin] Cell "${cellValue}" on row ${i}, col ${j} skipped (keyword=${hasKeyword}, pattern=${hasAddressPattern})`);
           // }
        }
      }
    }
  }
  return bestCandidate;
} 