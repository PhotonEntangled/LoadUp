import { ShipmentData, ShipmentItem, LocationDetail, AIMappedField, FieldMappingResult, RawRowData, SourceInfo, ParsingMetadata, ShipmentConfidenceResult } from '../../types/shipment';
import { resolveAmbiguousLocation, createLocationDetailFromAddressFields } from './locationResolver';
import { logger } from '../../utils/logger';
import { convertExcelDateToJSDate } from '../../utils/excel-helper';

// Helper function to safely extract and convert date fields
function extractDateField(rowData: RawRowData, fieldName: string): string {
    const value = rowData[fieldName];
    if (value === null || value === undefined || value === '') {
        return '';
    }
    if (typeof value === 'number' && value > 0) {
        try {
            const jsDate = convertExcelDateToJSDate(value);
            // TODO: Revisit this type assertion. Linter struggles with instanceof check,
            // possibly due to the inferred type of convertExcelDateToJSDate.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((jsDate as any) instanceof Date && !isNaN((jsDate as unknown as Date).getTime())) {
                return (jsDate as unknown as Date).toISOString().split('T')[0];
            } else {
                // Handle cases where conversion didn't return a valid Date
                logger.warn(`[ShipmentBuilder] Date conversion for number ${value} did not yield a valid Date object.`);
                return String(value);
            }
        } catch (error) {
            logger.warn(`[ShipmentBuilder] Error processing date number ${value} for field ${fieldName}. Error: ${error}`);
            return String(value);
        }
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        // Basic check for common formats like DD/MM/YYYY or MM/DD/YYYY
        if (/^(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})$/.test(trimmedValue)) {
            try {
                // Attempt to parse common date formats
                const parsedDate = new Date(trimmedValue);
                // Check if the date is valid after parsing
                if (!isNaN(parsedDate.getTime())) {
                    // Return the original string if it was parsable as a basic date format
                    return trimmedValue;
                } else {
                     logger.warn(`[ShipmentBuilder] Could not parse date string "${trimmedValue}" for field ${fieldName}. Returning original string.`);
                     return trimmedValue;
                }
            } catch(e) {
                 logger.warn(`[ShipmentBuilder] Error parsing date string "${trimmedValue}" for field ${fieldName}. Error: ${e}. Returning original string.`);
                 return trimmedValue;
            }
        }
         // Return trimmed string if not a recognized date number or common format
        return trimmedValue;
    }

    // For other types, convert to string
    return String(value);
}

// Helper function to safely extract string fields
function extractStringField(rowData: RawRowData, fieldName: string): string {
  const value = rowData[fieldName];
  if (value === null || value === undefined) {
    return '';
  }
  // Convert to string, replace newlines with spaces, then trim
  return String(value).replace(/\r?\n/g, ' ').trim();
}

// Helper function to safely extract numeric fields
function extractNumericField(rowData: RawRowData, fieldName: string): number | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

// Helper function to safely extract boolean fields
function extractBooleanField(rowData: RawRowData, fieldName: string): boolean | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const lowerCaseValue = String(value).toLowerCase().trim();
  if (lowerCaseValue === 'true' || lowerCaseValue === 'yes' || lowerCaseValue === '1') {
    return true;
  }
  if (lowerCaseValue === 'false' || lowerCaseValue === 'no' || lowerCaseValue === '0') {
    return false;
  }
  return undefined;
}

// NEW: Helper function dedicated to creating a ShipmentItem
export function buildShipmentItem(rowData: RawRowData): ShipmentItem | null {
    const itemNumber = extractStringField(rowData, 'itemNumber');
    const quantity = extractNumericField(rowData, 'quantity');
    const weight = extractNumericField(rowData, 'weight');
    const description = extractStringField(rowData, 'description');
    const lotSerialNumber = extractStringField(rowData, 'lotSerialNumber');
    const uom = extractStringField(rowData, 'uom');
    const bin = extractStringField(rowData, 'bin');

    // Check if *any* essential item identifiers are present.
    // If all are empty/null/undefined, then we can't create an item.
    if (!itemNumber && !description && !quantity && !lotSerialNumber) { // Added quantity/lot# check
        logger.debug(`[ShipmentBuilder] Skipping item creation: No identifiable item data found (item#, desc, qty, lot#).`);
        return null; // Not enough info to create an item
    }

    // You might add more checks here, e.g., if quantity is required for a valid item line.
    // if (quantity === undefined || quantity <= 0) { ... return null; }

    const item: ShipmentItem = {
      itemNumber: itemNumber || undefined,
      description: description || undefined,
      lotSerialNumber: lotSerialNumber || undefined,
      quantity: quantity, 
      uom: uom || undefined,
      weight: weight,
      bin: bin || undefined,
    };

    return item;
}


/**
 * Creates a standard ShipmentData object from processed row data,
 * applying mappings and handling data types.
 * Includes basic location resolution logic.
 *
 * @param rowData - The mapped data for a single row (key: standard field name, value: original value).
 * @param headers - Original headers from the sheet/file.
 * @param sourceInfo - Information about the source file/sheet/row.
 * @param headerMappingInfo - Detailed results of header mapping (including confidence).
 * @param mappingMetadata - Metadata about how each field in rowData was mapped.
 * @param potentialSheetOrigin - Pre-scanned potential origin from sheet context.
 * @returns A ShipmentData object.
 */
export async function createShipmentFromRowData(
  rowData: RawRowData,
  headers: string[],
  sourceInfo: SourceInfo,
  headerMappingInfo: FieldMappingResult[],
  mappingMetadata: Record<string, { originalHeader: string; isAIMapped: boolean; confidence: number }>,
  potentialSheetOrigin?: string | null
): Promise<ShipmentData | null> {
  logger.debug(`[ShipmentBuilder] Creating shipment from rowData keys: ${Object.keys(rowData).join(', ')}`);

  // --- Validate Essential Fields ---
  const loadNumber = extractStringField(rowData, 'loadNumber');
  const orderNumber = extractStringField(rowData, 'orderNumber');
  const promisedShipDate = extractDateField(rowData, 'promisedShipDate');
  const shipToCustomer = extractStringField(rowData, 'shipToCustomer');
  const shipToAddress = extractStringField(rowData, 'shipToAddress');

  // Stricter check: ensure Load#, ShipDate, ShipToAddr are non-empty. Order# is desirable but not strictly blocking.
  if (!loadNumber || !promisedShipDate || !shipToAddress) {
      logger.error(`[ShipmentBuilder] Skipping row ${sourceInfo.rowIndex}: Missing essential field(s) (Load#, ShipDate, ShipToAddr must be non-empty). Load: ${loadNumber || 'MISSING'}, Date: ${promisedShipDate || 'MISSING'}, Addr: ${shipToAddress || 'MISSING'}.`);
      return null; // Cannot create shipment without these core fields
  }

  // Log a warning if Order Number is missing, as it's usually expected
  if (!orderNumber) {
      logger.warn(`[ShipmentBuilder] Row ${sourceInfo.rowIndex} (Load: ${loadNumber}): Order Number is missing or empty. Proceeding, but this might indicate incomplete data.`);
  }

  // --- Initialize Metadata & Defaults ---
  const parsingMetadata: ParsingMetadata = {
      originalHeaders: headers,
      fieldMappingsUsed: headerMappingInfo,
      aiMappedFields: headerMappingInfo
          .filter(m => m.aiMapped)
          .map(m => ({
              originalField: m.originalField || 'Unknown',
              field: m.fieldName, // Corrected: use 'field' to match AIMappedField type
              confidence: m.confidence,
              // value: rowData[m.fieldName], // Removed: 'value' is not part of AIMappedField type
          })),
      needsReview: headerMappingInfo.some(m => m.needsReview),
      parserVersion: '1.1.0-shipmentBuilder',
  };

  const initialConfidence: ShipmentConfidenceResult = {
      confidence: 0, // Default, calculated later
      needsReview: false, // Default, calculated later
      message: 'Confidence not yet calculated',
  };

  // --- Initialize ShipmentData --- 
  const shipment: ShipmentData = {
    // id: `shipment-${Date.now()}-...`, // Removed ID
    // Required fields (validated above, orderNumber might be empty)
    loadNumber: loadNumber,
    orderNumber: orderNumber || '', // Use empty string if missing, consistent with extractStringField
    promisedShipDate: promisedShipDate,
    shipToCustomer: shipToCustomer,
    shipToAddress: shipToAddress,

    // Optional fields
    poNumber: extractStringField(rowData, 'poNumber') || undefined,
    requestDate: extractDateField(rowData, 'requestDate') || undefined,
    actualDeliveryDate: extractDateField(rowData, 'actualDeliveryDate') || undefined,
    shipToState: extractStringField(rowData, 'shipToState') || undefined,
    shipToArea: extractStringField(rowData, 'shipToArea') || undefined,
    contactNumber: extractStringField(rowData, 'contactNumber') || undefined,
    pickupWarehouse: extractStringField(rowData, 'pickupWarehouse') || undefined,
    remarks: extractStringField(rowData, 'remarks') || undefined,
    status: extractStringField(rowData, 'status') || 'Pending',
    orderType: extractStringField(rowData, 'orderType') || undefined,
    
    items: [], // Initialize empty

    // Location Details (initialize with raw, resolve later)
    pickupLocationDetails: {
        rawInput: extractStringField(rowData, 'pickupWarehouse'),
        resolutionMethod: 'none', // Other fields initially undefined
    },
    destinationLocation: {
        rawInput: extractStringField(rowData, 'shipToAddress'),
        resolutionMethod: 'none', // Other fields initially undefined
    },

    // Metadata & other fields
    sourceInfo: sourceInfo,
    parsingMetadata: parsingMetadata,
    confidenceScore: initialConfidence,
    miscellaneousFields: {},
    totalWeight: undefined,
    processingErrors: [],
    needsReview: parsingMetadata.needsReview, // Start with mapping review status
  };

  // Populate Miscellaneous Fields
  shipment.miscellaneousFields = headerMappingInfo
    .filter(mapping => mapping.isMiscellaneous)
    .reduce((acc, mapping) => {
        const value = rowData[mapping.fieldName];
        const originalHeader = mapping.originalField || mapping.fieldName;
        if (value !== undefined && value !== null && String(value).trim() !== '') {
             acc[originalHeader] = String(value);
        }
       return acc;
     }, {} as Record<string, string>);

  // Create and Add Shipment Item from the *current* row's data
  // Uses the new dedicated function
  const itemFromCurrentRow = buildShipmentItem(rowData);
  if (itemFromCurrentRow) {
    shipment.items.push(itemFromCurrentRow);
    // Initialize totalWeight with the first item's weight if available
    // Check for null/undefined before assignment/addition
    const itemWeight = itemFromCurrentRow.weight;
    if (itemWeight !== undefined && itemWeight !== null) {
      if (shipment.totalWeight === undefined || shipment.totalWeight === null) {
         shipment.totalWeight = itemWeight;
      } else {
          // If other items are added later (in ExcelParserService), this might need recalculation there.
          // For now, it only considers the item from the main shipment row.
          shipment.totalWeight += itemWeight; 
      }
    }
  }

  // Resolve Destination Location
  try {
      const destLocation = createLocationDetailFromAddressFields({
          customerName: shipment.shipToCustomer,
          address: shipment.shipToAddress,
          state: shipment.shipToState,
          area: shipment.shipToArea,
          contact: shipment.contactNumber,
      });
      shipment.destinationLocation = destLocation; // Assign resolved location
      logger.debug(`[ShipmentBuilder] Resolved destination for row ${sourceInfo.rowIndex}:`, shipment.destinationLocation);
  } catch (error) {
      logger.error(`[ShipmentBuilder] Error resolving destination location for row ${sourceInfo.rowIndex}: ${error}`);
      shipment.processingErrors?.push(`Destination resolution failed: ${error instanceof Error ? error.message : String(error)}`);
      // Keep the initial raw input which is already set in destinationLocation
  }

  // Resolve Pickup Location
  try {
      // Use rawInput from the initialized details OR the potential sheet origin
      const pickupInput = shipment.pickupLocationDetails?.rawInput || potentialSheetOrigin;
      if (pickupInput) {
         const pickupLocDetails = await resolveAmbiguousLocation(pickupInput);
         shipment.pickupLocationDetails = pickupLocDetails; // Assign resolved location
          logger.debug(`[ShipmentBuilder] Resolved pickup for row ${sourceInfo.rowIndex} (Input: "${pickupInput}"):`, shipment.pickupLocationDetails);
      } else {
          logger.warn(`[ShipmentBuilder] No pickup warehouse information found for row ${sourceInfo.rowIndex}. Cannot resolve pickup location.`);
          // Keep initial 'none' status, rawInput might be empty or undefined
          if (shipment.pickupLocationDetails) {
              shipment.pickupLocationDetails.rawInput = '';
          }
      }
  } catch (error) {
      logger.error(`[ShipmentBuilder] Error resolving pickup location for row ${sourceInfo.rowIndex}: ${error}`);
      shipment.processingErrors?.push(`Pickup resolution failed: ${error instanceof Error ? error.message : String(error)}`);
      // Keep initial details, rawInput is already preserved
  }

  // --- Final Checks & Return ---
  // Update needsReview based on processing errors added during location resolution etc.
  // Use double negation (!!) to ensure the result is strictly boolean
  shipment.needsReview = !!(shipment.needsReview || (shipment.processingErrors && shipment.processingErrors.length > 0));

  logger.info(`[ShipmentBuilder] Successfully created shipment (Load: ${shipment.loadNumber}, Order: ${shipment.orderNumber || 'N/A'}) from row ${sourceInfo.rowIndex}`);
  return shipment;
} 