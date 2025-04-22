import { LocationDetail, RawRowData } from 'types/shipment';
import { logger } from 'utils/logger';
import type { HeaderMappingResultType } from 'services/excel/ExcelParserService';
import { findOrCreateMockAddress } from '../geolocation/mockAddressResolver'; // Import the mock resolver

// Define the new return type for location resolution
export interface ResolvedLocationInfo {
    street1?: string | null;
    street2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
    rawInput?: string | null; // Store the original input for geocoding
    name?: string | null;     // Store the resolved or original name
    // latitude?: string | null; // Explicitly exclude lat/lon, handled later
    // longitude?: string | null;
}

// Function to safely construct fullAddress from components - Keep for potential future use or debugging?
// function constructFullAddress(components: { ... }) { ... }
// This function isn't strictly needed for ResolvedLocationInfo but might be useful elsewhere.
// For now, let's comment it out to avoid unused code warnings.
/*
function constructFullAddress(components: {
  street?: string | null,
  city?: string | null,
  stateProvince?: string | null, // Note: Uses old field name
  postalCode?: string | null,
  country?: string | null
}): string | null {
  const parts = [
    components.street,
    components.city,
    `${components.stateProvince || ''} ${components.postalCode || ''}`.trim(), // Combine state & zip
    components.country
  ].filter(part => part && part.trim() !== ''); // Filter out null/empty parts
  
  return parts.length > 0 ? parts.join(', ') : null;
}
*/

// TODO: Consider making this a class if it needs shared state or dependencies injected

/**
 * Resolves ambiguous location strings, prioritizing mock keyword matching first,
 * then falling back to pattern matching (stubbed coordinates).
 * Based on referencesOnly/excel/locationResolver.ts
 * Renamed from resolveLocationString to match reference.
 * @param locationString The ambiguous string (e.g., "LOADUP JB", "Prai Hub")
 * @param context Optional context like state or full address for disambiguation
 * @returns A partial LocationDetail object with resolved info, or minimal object if unresolvable.
 */
export async function resolveAmbiguousLocation(locationString: string | null | undefined, context?: any): Promise<Partial<LocationDetail>> {
  if (!locationString || typeof locationString !== 'string' || locationString.trim() === '') {
    logger.warn(`[resolveAmbiguousLocation] Received null, undefined, or empty input. Cannot resolve.`);
    return { rawInput: null, resolutionMethod: 'none', resolutionConfidence: 0 };
  }

  const trimmedLocationString = locationString.trim();
  logger.info(`[resolveAmbiguousLocation] Attempting to resolve location: "${trimmedLocationString}"`, { context });

  // --- STEP 1: Attempt Mock Keyword Resolution FIRST ---
  try {
    // We need a transaction object here. This function is called outside a transaction context currently.
    // For now, we'll skip the DB lookup/creation part of findOrCreateMockAddress
    // and focus *only* on the keyword matching part using findMockEntryByKeywords.
    // This requires refactoring findOrCreateMockAddress or importing findMockEntryByKeywords directly.
    // TEMPORARY WORKAROUND: Simulate calling findMockEntryByKeywords directly.
    // We need to import findMockEntryByKeywords from mockAddressData
    const { findMockEntryByKeywords, MOCK_MALAYSIAN_ADDRESSES } = await import('../geolocation/mockAddressData');
    const mockEntry = findMockEntryByKeywords(trimmedLocationString);

    if (mockEntry && mockEntry.mockId !== 'MOCK-UNKNOWN-MY') {
      logger.info(`[resolveAmbiguousLocation] High-confidence match found via mock keywords: ${mockEntry.mockId} for "${trimmedLocationString}"`);
      // Construct partial LocationDetail from mock entry
      return {
        rawInput: trimmedLocationString,
        resolvedAddress: `${mockEntry.street1 || ''}${mockEntry.street2 ? ', ' + mockEntry.street2 : ''}, ${mockEntry.city || ''}, ${mockEntry.state || ''}`.trim().replace(/^, |, $/g, ''), // Basic address construction
        city: mockEntry.city || undefined,
        state: mockEntry.state || undefined,
        postalCode: mockEntry.postalCode || undefined,
        country: mockEntry.country || undefined,
        latitude: mockEntry.latitude ? parseFloat(mockEntry.latitude) : null, // Convert string coords
        longitude: mockEntry.longitude ? parseFloat(mockEntry.longitude) : null,
        resolutionMethod: 'mock-keyword', // Indicate keyword method used
        resolutionConfidence: 1.0, // High confidence for direct mock match
      };
    }
    logger.info(`[resolveAmbiguousLocation] Mock keyword resolution did not find a specific match for "${trimmedLocationString}". Proceeding to pattern matching.`);

  } catch (error) {
    logger.error(`[resolveAmbiguousLocation] Error during mock keyword resolution attempt for "${trimmedLocationString}":`, error);
    // Fall through to pattern matching if mock lookup fails
  }

  // --- STEP 2: Fallback to Pattern Matching Logic (if mock failed) ---
  const upperLocationString = trimmedLocationString.toUpperCase();

  // --- Pattern Matching Logic (Copied/Verified from reference) ---
  if (upperLocationString.includes("LOADUP JB")) {
    logger.warn(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${trimmedLocationString}" (LOADUP JB)`);
    return {
      rawInput: trimmedLocationString,
      resolvedAddress: "Loadup JB Hub (Estimated)",
      city: "Johor Bahru",
      state: "Johor",
      latitude: 1.4656,
      longitude: 103.7578,
      resolutionMethod: 'estimated-pattern', // Consistent naming
      resolutionConfidence: 0.5
    };
  }
  if (upperLocationString.includes("LOADUP PN") || upperLocationString.includes("PRAI HUB")) {
    logger.warn(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${trimmedLocationString}" (LOADUP PN/PRAI)`);
    return {
      rawInput: trimmedLocationString,
      resolvedAddress: "Loadup Prai Hub (Estimated)",
      city: "Perai",
      state: "Penang",
      latitude: 5.35,
      longitude: 100.40,
      resolutionMethod: 'estimated-pattern',
      resolutionConfidence: 0.5
    };
  }
  if (upperLocationString.includes("RETAIL OUTSTATION") && upperLocationString.includes("PENANG")) {
    logger.warn(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${trimmedLocationString}" (Outstation Penang)`);
    return {
      rawInput: trimmedLocationString,
      resolvedAddress: "Loadup Prai Hub (Estimated from Outstation)",
      city: "Perai",
      state: "Penang",
      latitude: 5.35,
      longitude: 100.40,
      resolutionMethod: 'estimated-pattern',
      resolutionConfidence: 0.6
    };
  }
  if (upperLocationString.includes("WAREHOUSE: LOT 198 B JALAN BANFOO")) {
    logger.warn(`[resolveAmbiguousLocation] Using STUBBED coordinates for "${trimmedLocationString}" (Johor Outstation)`);
    return {
      rawInput: trimmedLocationString,
      resolvedAddress: "Ulu Tiram Hub (Estimated from Outstation)",
      city: "Ulu Tiram",
      state: "Johor",
      latitude: 1.5837,
      longitude: 103.8242,
      resolutionMethod: 'estimated-pattern',
      resolutionConfidence: 0.6
    };
  }
  if (upperLocationString.includes("NIRO") || upperLocationString.includes("XIN HWA") || upperLocationString.includes("XINWHA")) {
    const stateCtx = context?.stateContext?.toUpperCase();
    let estimatedLocation = "NIRO/XINWHA Central Hub (Estimated - Fallback)"; // Indicate fallback
    let city = undefined;
    let state = undefined;
    let lat = 2.5;
    let lon = 101.5;

    if (stateCtx === 'JOHOR') {
        estimatedLocation = "NIRO/XINWHA JB Hub (Estimated - Fallback)";
        city = "Johor Bahru"; state = "Johor"; lat = 1.4656; lon = 103.7578;
    } else if (stateCtx === 'PENANG') {
        estimatedLocation = "NIRO/XINWHA Prai Hub (Estimated - Fallback)";
        city = "Perai"; state = "Penang"; lat = 5.35; lon = 100.40;
    } else if (stateCtx === 'MALACCA' || stateCtx === 'MELAKA') {
        estimatedLocation = "NIRO/XINWHA Melaka Hub (Estimated - Fallback)";
        city = "Melaka"; state = "Melaka"; lat = 2.1896; lon = 102.2501;
    } else if (stateCtx === 'NEGERI SEMBILAN' || stateCtx === 'SELANGOR' || stateCtx === 'TERENGGANU'){
        // Assuming NIRO/XIN HWA in these states refers to Shah Alam hub
        estimatedLocation = "NIRO/XINWHA Shah Alam Hub (Estimated - Fallback)";
        city = "Shah Alam"; state = "Selangor"; lat = 3.0520; lon = 101.5270; // Use Shah Alam coords
    }

    logger.warn(`[resolveAmbiguousLocation] Using FALLBACK STUBBED coordinates for "${trimmedLocationString}" based on NIRO/XINWHA pattern and context: ${stateCtx || 'N/A'}`);
    return {
      rawInput: trimmedLocationString,
      resolvedAddress: estimatedLocation,
      city: city,
      state: state,
      latitude: lat,
      longitude: lon,
      resolutionMethod: 'estimated-pattern-context', // Keep method name
      resolutionConfidence: 0.4 // Keep low confidence
    };
  }
  if (upperLocationString.includes("RETAIL OUTSTATION - OTHER STATES")) {
    logger.warn(`[resolveAmbiguousLocation] Generic "OTHER STATES" outstation found: "${trimmedLocationString}". Cannot reliably estimate origin.`);
    return {
      rawInput: trimmedLocationString,
      resolutionMethod: 'none',
      resolutionConfidence: 0
    };
  }

  // --- Final Fallback --- 
  logger.warn(`[resolveAmbiguousLocation] No mock match or pattern match found for "${trimmedLocationString}". Returning as unresolved.`);
  return {
    rawInput: trimmedLocationString,
    resolvedAddress: trimmedLocationString,
    resolutionMethod: 'none',
    resolutionConfidence: 0.1
  };
}

// Helper to safely extract and trim string fields from rowData
function getString(rowData: Record<string, any>, key: string): string | undefined {
    const value = rowData[key];
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    // Convert to string, replace newlines with spaces, then trim
    const trimmed = String(value).replace(/\r?\n/g, ' ').trim();
    return trimmed === '' ? undefined : trimmed;
  }

/**
 * Creates a LocationDetail object from standard address fields (mapped directly).
 * Attempts basic parsing of shipToAddress if individual components are missing.
 * @param rowData Raw row data object expected to contain shipToAddress, shipToCity, etc.
 * @returns LocationDetail object or null if no relevant address fields found.
 */
export function createLocationDetailFromAddressFields(rowData: Record<string, any>): LocationDetail | null {
  // 1. Extract Raw Fields using helper
  const rawAddress = getString(rowData, 'shipToAddress');
  const rawCity = getString(rowData, 'shipToCity');
  const rawState = getString(rowData, 'shipToState');
  const rawPostalCode = getString(rowData, 'shipToPostalCode');
  const rawCountry = getString(rowData, 'shipToCountry');

  // Combine for logging / initial raw input check
  const rawInputCombinedForCheck = [rawAddress, rawCity, rawState, rawPostalCode, rawCountry].filter(Boolean).join(' | ');

  if (!rawInputCombinedForCheck) {
    logger.debug('[createLocationDetailFromAddressFields] No direct address fields found in rowData');
    return null;
  }

  // 2. Initialize output fields
  let street1: string | undefined = undefined;
  let city: string | undefined = rawCity;
  let state: string | undefined = rawState;
  let postalCode: string | undefined = rawPostalCode;
  let country: string | undefined = rawCountry;

  // 3. Process Raw Address String
  if (rawAddress) {
    let processedAddress = rawAddress; // Start with the raw address

    // 3a. Attempt Postal Code Extraction (if not already present)
    if (!postalCode) {
      const postalCodeMatch = processedAddress.match(/\b(\d{5})\b/); // Basic 5-digit postal code
      if (postalCodeMatch && postalCodeMatch[1]) {
        postalCode = postalCodeMatch[1];
        // Attempt to remove the found postal code from the string to help isolate street
        processedAddress = processedAddress.replace(postalCodeMatch[0], '').trim();
        logger.debug(`[createLocationDetailFromAddressFields] Extracted postal code ${postalCode} from rawAddress.`);
      }
    }

    // 3b. Attempt to isolate street (heuristic) - Remove known city/state if they appear
    // This is imperfect but better than nothing. Remove trailing commas/spaces after cleaning.
    if (city && processedAddress.toUpperCase().includes(city.toUpperCase())) {
         // Find the last occurrence to handle cases like "Street, City Name, City"
        const cityIndex = processedAddress.toUpperCase().lastIndexOf(city.toUpperCase());
        // Simple heuristic: assume street is before city if city is near the end
        if (cityIndex > processedAddress.length / 2) {
             processedAddress = processedAddress.substring(0, cityIndex).trim().replace(/,$/, '').trim();
        }
    }
     if (state && processedAddress.toUpperCase().includes(state.toUpperCase())) {
        const stateIndex = processedAddress.toUpperCase().lastIndexOf(state.toUpperCase());
         if (stateIndex > processedAddress.length / 2) {
            processedAddress = processedAddress.substring(0, stateIndex).trim().replace(/,$/, '').trim();
        }
    }

    street1 = processedAddress; // Assign the potentially cleaned address part as street1
  }

  // 4. Default Country if needed
  if (!country && state) {
    country = "Malaysia";
  }

  // 5. Construct Clean rawInput for Geocoder
  // Use the refined/extracted parts for a better geocoding query
  const finalRawInput = [
    street1,
    city,
    state,
    postalCode,
    country
  ].filter(Boolean).join(', '); // Use comma separation for standard geocoding

  logger.info(`[createLocationDetailFromAddressFields] Creating destination detail. Input Fields: addr='${rawAddress}', city='${rawCity}', state='${rawState}', zip='${rawPostalCode}'. Output Fields: street1='${street1}', city='${city}', state='${state}', zip='${postalCode}', country='${country}'. Constructed RawInput: "${finalRawInput}"`);

  // 6. Return the structured LocationDetail object
  return {
    // --- Fields primarily for Geocoding / DB Storage ---
    rawInput: finalRawInput || rawAddress || undefined, // Best effort geocodable string, fallback to original raw
    street: street1 || undefined, // Use 'street' as defined in LocationDetail, assign the parsed street1 value
    city: city || undefined,
    state: state || undefined,
    postalCode: postalCode || undefined,
    country: country || undefined,
    latitude: null, // Geocoding happens later
    longitude: null, // Geocoding happens later

    // --- Fields for Display / Context (can be slightly different) ---
    name: undefined, // Not typically parsed here
    resolvedAddress: finalRawInput || rawAddress || undefined, // Use the constructed string for display consistency

    // --- Resolution Metadata ---
    resolutionMethod: 'direct-fields', // Indicate these came from direct field mapping/parsing
    resolutionConfidence: 0.8, // Default confidence, geocoding might increase this later
  };
}

/**
 * Creates a LocationDetail object from standard address fields found in rowData.
 * Primarily used for destination addresses where fields are often separate.
 * @param rowData Raw row data object containing fields like destinationAddressRaw, destinationCity, etc.
 * @returns LocationDetail object or null if no relevant fields found.
 */
export function createLocationDetailFromFields(rowData: Record<string, any>): Partial<LocationDetail> | null {
  logger.debug('[createLocationDetailFromFields] Received rowData:', { rowData });

  const address = rowData.destinationAddressRaw;
  const city = rowData.destinationCity;
  const state = rowData.destinationState;
  const zip = rowData.destinationPostalCode;
  const country = rowData.destinationCountry; // Assuming country might exist
  const area = rowData.destinationArea;

  // Combine raw inputs for logging/reference
  const rawInputCombined = [address, city, state, zip, country, area].filter(Boolean).join(' | ');

  if (!rawInputCombined) {
    return null; // No relevant data found
  }

  // Combine available fields into a formatted address (simple version)
  // Prioritize specific fields over the potentially combined raw address field
  const parts = [
      address, 
      city, 
      state, 
      zip, 
      country ? country : (state ? "Malaysia" : null) // Default to Malaysia if state exists
  ].filter(Boolean);
  const resolvedAddress = parts.join(', ');

  logger.info(`[createLocationDetailFromFields] Creating destination detail from fields. Raw: \"${rawInputCombined}\". Resolved: \"${resolvedAddress}\"`);

  // In a real scenario, you might geocode this combined address
  // to get lat/lon and verify components.
  // For now, we assume these directly mapped fields are correct.

  const locationDetail: Partial<LocationDetail> | null = {
    rawInput: rawInputCombined,
    resolvedAddress: resolvedAddress || undefined,
    street: address || undefined,
    city: city || undefined,
    state: state || undefined,
    postalCode: zip || undefined,
    country: country || (state ? "Malaysia" : undefined),
    // area: area || undefined, // Removed: Property 'area' does not exist on type 'LocationDetail'
    // latitude, longitude would come from geocoding the address if needed
    resolutionMethod: 'direct-fields', // Data came from directly mapped fields
    resolutionConfidence: 0.8 // Reasonably high confidence for direct fields
  };

  logger.debug('[createLocationDetailFromFields] Returning locationDetail:', { locationDetail });
  return locationDetail;
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