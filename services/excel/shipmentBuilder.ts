import { ShipmentData, ShipmentItem, LocationDetail, AIMappedField, FieldMappingResult, RawRowData, SourceInfo } from 'types/shipment';
import { resolveAmbiguousLocation, createLocationDetailFromAddressFields } from 'services/excel/locationResolver';
import { logger } from 'utils/logger';
import { extractDateField } from '@/services/excel/parserUtils';
import { parseContactString } from './contactUtils';
import type {
    ParsedShipmentBundle,
    AddressInsertData,
    ShipmentItemInsertData,
    ShipmentBaseInsertData,
    CustomDetailsInsertData,
    PickupInsertData,
    DropoffInsertData,
    ParserProcessingMetadata
} from 'types/parser.types';
import type { HeaderMappingResultType, InternalMappingDetail } from 'services/excel/ExcelParserService';
import { getDefaultMockOriginDetail, getDefaultMockDestinationDetail } from 'services/geolocation/mockAddressData';

// Helper to find the key used in RawRowData based on the standard field name and mapping result
function findMappedKey(
    standardFieldName: string, // The standard field name we're looking for (e.g., 'pickupWarehouse')
    headerMappingResult: HeaderMappingResultType
): string | undefined {
    // Find the mapping detail where the mappedField matches the standard field name
    const mappingDetail = headerMappingResult.detailedMapping?.find(
        (mapping) => mapping.mappedField === standardFieldName
    );
    // Return the mappedField itself (which is used as the key in RawRowData)
    return mappingDetail?.mappedField;
}

// Helper function to safely extract string fields
function extractStringField(rowData: RawRowData, fieldName: string): string | undefined {
  const value = rowData[fieldName];
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  // Convert to string, replace newlines with spaces, then trim
  const trimmed = String(value).replace(/\r?\n/g, ' ').trim();
  return trimmed === '' ? undefined : trimmed;
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

// Helper function dedicated to creating a ShipmentItem
export function buildShipmentItem(rowData: RawRowData): ShipmentItemInsertData | null {
    const itemNumber = extractStringField(rowData, 'itemNumber');
    const secondaryItemNumber = extractStringField(rowData, 'secondaryItemNumber');
    const quantity = extractNumericField(rowData, 'quantity');
    const weight = extractNumericField(rowData, 'weight');
    const description = extractStringField(rowData, 'description');
    const lotSerialNumber = extractStringField(rowData, 'lotSerialNumber');
    const uom = extractStringField(rowData, 'uom');
    const bin = extractStringField(rowData, 'bin');

    if (!itemNumber && !secondaryItemNumber && !description && !quantity && !lotSerialNumber) {
        logger.debug(`[ShipmentBuilder-Item] Skipping item creation: No identifiable item data found.`);
        return null;
    }

    // Map to ShipmentItemInsertData structure - Step-by-step assignment
    const item: Partial<ShipmentItemInsertData> = {}; // Start with Partial

    item.itemNumber = itemNumber;
    item.secondaryItemNumber = secondaryItemNumber;
    item.description = description;
    item.lotSerialNumber = lotSerialNumber;
    item.quantity = quantity;
    item.uom = uom;
    item.weight = weight;
    item.bin = bin;
    // item.sku = itemNumber ?? secondaryItemNumber; // Deferring extra fields for now
    // item.weightUnit = 'KG';
    // item.length = null;
    // item.width = null;
    // item.height = null;
    // item.dimensionUnit = 'CM';
    // item.hsCode = null;

    // Cast to final type after assignment
    return item as ShipmentItemInsertData;
}

// Internal helper to resolve destination address information
// Returns LocationDetail | null
async function _resolveDestinationInfo(
    rowData: RawRowData,
    customerName?: string | undefined,
    headerMappingResult?: HeaderMappingResultType
): Promise<LocationDetail | null> { // Changed return type
    // Directly use createLocationDetailFromAddressFields which returns LocationDetail | null
    const resolvedLocationDetail = createLocationDetailFromAddressFields(
        rowData,
        // customerName, // customerName not used by this function in its current form
        // headerMappingResult // headerMappingResult not used by this function
    );
    return resolvedLocationDetail;
}

// Internal helper to resolve origin address information
// Returns Partial<LocationDetail>
async function _resolveOriginInfo(
    rowData: RawRowData,
    potentialSheetOrigin: string | null | undefined,
    headerMappingResult: HeaderMappingResultType,
    destinationStateContext?: string | undefined
): Promise<Partial<LocationDetail>> { // Changed return type, can be partial
    const pickupWarehouseKey = findMappedKey('pickupWarehouseRaw', headerMappingResult);
    const rawOriginString = pickupWarehouseKey ? extractStringField(rowData, pickupWarehouseKey) : undefined;
    const finalRawOrigin = rawOriginString || potentialSheetOrigin || '';

    // resolveAmbiguousLocation now returns Partial<LocationDetail>
    const resolvedLocationDetail = await resolveAmbiguousLocation(
        finalRawOrigin,
        { stateContext: destinationStateContext }
    );
    return resolvedLocationDetail;
}

// Helper function to parse the multi-line TRUCK DETAILS string
// REFACTORED: Use Regex Matching for robustness
function parseTruckDetails(details: string | undefined): { driverName?: string; driverPhone?: string; truckId?: string; driverIc?: string } {
    const functionId = 'parseTruckDetails';
    logger.debug(`[${functionId}] Received input: "${details?.replace(/\r?\n/g, ' | ')}"`);

    if (!details) {
        logger.debug(`[${functionId}] No details provided, returning empty object.`);
        return {};
    }

    const result: { driverName?: string; driverPhone?: string; truckId?: string; driverIc?: string } = {};
    const lines = details.split(/\r?\n/); // Split into lines

    lines.forEach(line => {
        line = line.trim(); // Trim each line
        if (!line) return; // Skip empty lines

        const nameMatch = line.match(/^NAME:\s*(.*)/i);
        const icMatch = line.match(/^IC:\s*(.*)/i);
        const phoneMatch = line.match(/^PHONE:\s*(.*)/i);
        const truckMatch = line.match(/^TRUCK:\s*(.*)/i);

        if (nameMatch && nameMatch[1]) {
            result.driverName = nameMatch[1].trim();
            logger.debug(`[${functionId}] Matched Name: "${result.driverName}" from line: "${line}"`);
        } else if (icMatch && icMatch[1]) {
            result.driverIc = icMatch[1].trim();
            logger.debug(`[${functionId}] Matched IC: "${result.driverIc}" from line: "${line}"`);
        } else if (phoneMatch && phoneMatch[1]) {
            result.driverPhone = phoneMatch[1].trim();
            logger.debug(`[${functionId}] Matched Phone: "${result.driverPhone}" from line: "${line}"`);
        } else if (truckMatch && truckMatch[1]) {
            result.truckId = truckMatch[1].trim();
            logger.debug(`[${functionId}] Matched Truck: "${result.truckId}" from line: "${line}"`);
        }
    });

    logger.debug(`[${functionId}] Returning result object: ${JSON.stringify(result)}`);

    // Warning if input had content but nothing was extracted
    if (Object.keys(result).length === 0 && details.trim().length > 0) {
        logger.warn(`[${functionId}] Failed to extract any key-value pairs from input: "${details.replace(/\r?\n/g, ' | ')}"`);
    }

    return result;
}

// Define known synonyms for completed statuses (uppercase)
const COMPLETED_STATUS_SYNONYMS = new Set([
    'DELIVERED',
    'COMPLETED',
    'PROCESSED',
    'DONE',
    'SHIPPED'
]);

// Main internal function to build the structured data parts for the bundle
function _buildShipmentBundleParts(params: {
    rowData: RawRowData;
    loadNumber: string | undefined;
    orderNumberStr: string | undefined;
    requestDate: Date | undefined;
    promisedShipDate: Date | undefined;
    originResolvedDetail: Partial<LocationDetail>;
    destinationResolvedDetail: LocationDetail | null;
    normalizedStatus: string; // ADDED BACK: Accept normalized status
}) {
    const {
        rowData,
        loadNumber,
        orderNumberStr,
        requestDate,
        promisedShipDate,
        originResolvedDetail,
        destinationResolvedDetail,
        normalizedStatus, // ADDED BACK: Destructure normalized status
    } = params;

    // Utility for safe conversion
    const safeNumToString = (val: number | null | undefined): string | null =>
        (val === null || val === undefined || isNaN(val)) ? null : String(val);

    // 1. Build ShipmentBaseInsertData
    const shipmentBaseData: Partial<ShipmentBaseInsertData> = {}; // Use Partial<>
    // shipmentBaseData.status = normalizedStatus; // REMOVE THIS LINE - Cannot assign string to enum here
    // shipmentBaseData.tenantId = // Set if multi-tenant needed
    // shipmentBaseData.dateCreated = // Handled by DB default
    // shipmentBaseData.dateModified = // Handled by DB default
    // shipmentBaseData.createdBy = // Link to user ID if available
    // shipmentBaseData.modifiedBy = // Link to user ID if available
    // shipmentBaseData.bookingId = // Link if booking context is available
    // shipmentBaseData.tripId = // Will be linked when assigned to a trip

    // 2. Build CustomDetailsInsertData
    const customDetailsData: Partial<CustomDetailsInsertData> = {};
    customDetailsData.customerShipmentNumber = loadNumber;
    customDetailsData.customerDocumentNumber = orderNumberStr;
    customDetailsData.remarks = extractStringField(rowData, 'remarks');
    customDetailsData.totalTransportWeight = extractNumericField(rowData, 'weight'); // Often item weight used here
    customDetailsData.totalTransportVolume = undefined; // Not typically in basic sheets
    customDetailsData.stackable = undefined; // Not typically in basic sheets
    customDetailsData.manpower = undefined; // Maybe from remarks?
    customDetailsData.specialRequirement = undefined; // Maybe from remarks?

    // Extract Rate/Charge Fields (using Raw Input for potential non-numeric source data)
    customDetailsData.rawTripRateInput = extractStringField(rowData, 'tripRate');
    customDetailsData.rawDropChargeInput = extractStringField(rowData, 'dropCharge');
    customDetailsData.rawManpowerChargeInput = extractStringField(rowData, 'manpowerCharge');
    customDetailsData.rawTotalChargeInput = extractStringField(rowData, 'totalCharge');
    // Attempt conversion to numeric if possible
    customDetailsData.tripRate = extractNumericField(rowData, 'tripRate');
    customDetailsData.dropCharge = extractNumericField(rowData, 'dropCharge');
    customDetailsData.manpowerCharge = extractNumericField(rowData, 'manpowerCharge');
    customDetailsData.totalCharge = extractNumericField(rowData, 'totalCharge');

    // Truck details parsing
    // --- MODIFIED: Get RAW value directly, don't use extractStringField which replaces newlines ---
    const truckDetailsRawValue = rowData['truckDetails']; // Access raw value
    const truckDetailsString = (truckDetailsRawValue === null || truckDetailsRawValue === undefined) ? undefined : String(truckDetailsRawValue);
    logger.debug(`[ShipmentBuilder] Raw truckDetailsString input: "${truckDetailsString?.replace(/\r?\n/g, ' | ')}"`);
    // Pass the raw (potentially multi-line) string to the parser
    const { driverName, driverPhone, truckId, driverIc } = parseTruckDetails(truckDetailsString); 
    logger.debug(`[ShipmentBuilder] Destructured from parseTruckDetails: Name=${driverName}, Phone=${driverPhone}, Truck=${truckId}, IC=${driverIc}`);

    // 3. Build Origin AddressInsertData (using resolved detail)
    const originAddressData: AddressInsertData | null = originResolvedDetail
        ? { // Build AddressInsertData if resolved detail exists
              // id: originResolvedDetail.id, // ID DOES NOT EXIST ON LocationDetail
              street1: originResolvedDetail.street, // Map street to street1
              street2: null, // Assuming street2 is null for now
              city: originResolvedDetail.city,
              state: originResolvedDetail.state,
              postalCode: originResolvedDetail.postalCode,
              country: originResolvedDetail.country,
              latitude: safeNumToString(originResolvedDetail.latitude), // Convert numbers to string for decimal
              longitude: safeNumToString(originResolvedDetail.longitude),
              rawInput: originResolvedDetail.rawInput,
              resolutionMethod: originResolvedDetail.resolutionMethod,
              resolutionConfidence: safeNumToString(originResolvedDetail.resolutionConfidence), // Convert numbers to string for decimal
              // createdAt, updatedAt handled by DB
          }
        : null; // Keep null if no resolved detail

    // 4. Build Destination AddressInsertData (using resolved detail)
    const destinationAddressData: AddressInsertData | null = destinationResolvedDetail
        ? {
              // id: destinationResolvedDetail.id, // ID DOES NOT EXIST ON LocationDetail
              street1: destinationResolvedDetail.street, // Map street to street1
              street2: null, // Assuming street2 is null for now
              city: destinationResolvedDetail.city,
              state: destinationResolvedDetail.state,
              postalCode: destinationResolvedDetail.postalCode,
              country: destinationResolvedDetail.country,
              latitude: safeNumToString(destinationResolvedDetail.latitude),
              longitude: safeNumToString(destinationResolvedDetail.longitude),
              rawInput: destinationResolvedDetail.rawInput,
              resolutionMethod: destinationResolvedDetail.resolutionMethod,
              resolutionConfidence: safeNumToString(destinationResolvedDetail.resolutionConfidence),
              // createdAt, updatedAt handled by DB
          }
        : null; // Keep null if no resolved detail

    // 5. Build PickupInsertData
    const pickupData: Partial<PickupInsertData> = {};
    pickupData.addressId = originAddressData?.id; // Link to origin address ID if available
    // pickupData.shipmentId = // Set during transaction
    pickupData.pickup_date = requestDate; // Map Request Date to pickup_date? Verify business logic.
    // pickupData.pickupConfigId = // Set if applicable
    // pickupData.pickup_position = // Set if applicable
    // Add other pickup fields...

    // 6. Build DropoffInsertData
    const dropoffData: Partial<DropoffInsertData> = {};
    dropoffData.addressId = destinationAddressData?.id; // Link to destination address ID if available
    // dropoffData.shipmentId = // Set during transaction
    dropoffData.dropoff_date = promisedShipDate; // Assign promisedShipDate to dropoff_date
    dropoffData.customerPoNumbers = extractStringField(rowData, 'poNumber'); // Assuming 'poNumber' is mapped

    // --- CONTACT PARSING INTEGRATION ---
    const rawContactString = extractStringField(rowData, 'contactNumber'); // Assuming 'contactNumber' is mapped
    if (rawContactString) { // Only parse if there's input
        try {
            const parsedContact = parseContactString(rawContactString);
            dropoffData.recipientContactName = parsedContact.names;
            dropoffData.recipientContactPhone = parsedContact.phones;
             logger.debug(`[ShipmentBuilder] Parsed contacts for row: Name='${parsedContact.names}', Phone='${parsedContact.phones}'`);
        } catch (error: any) {
            logger.error(`[ShipmentBuilder] Error calling parseContactString for input "${rawContactString}": ${error.message}`);
            // Decide if raw string should be stored elsewhere on error, or just log
        }
    } else {
        logger.debug('[ShipmentBuilder] No raw contact string found to parse.');
        dropoffData.recipientContactName = undefined;
        dropoffData.recipientContactPhone = undefined;
    }
    // --- END CONTACT PARSING INTEGRATION ---

    // Add other dropoff fields...
    // dropoffData.dropoffConfigId = // Set if applicable
    // dropoffData.dropoff_position = // Set if applicable
    // dropoffData.actualDateTimeOfArrival = // Set on actual event
    // ...

    // 7. Build Items Data (Handled separately by buildShipmentItem, aggregated later)

    // 8. Parsed Truck/Driver Details (returned separately)

    // Log BEFORE returning from _buildShipmentBundleParts
    logger.debug(`[_buildShipmentBundleParts] Values BEFORE return: pDriverName=${driverName}, pDriverPhone=${driverPhone}, pTruckId=${truckId}, pDriverIc=${driverIc}`);

    // REVERTED: Return flat properties directly
    return {
        shipmentBaseData: shipmentBaseData as ShipmentBaseInsertData,
        customDetailsData: Object.keys(customDetailsData).length > 0 ? customDetailsData as CustomDetailsInsertData : null,
        originAddressData,
        destinationAddressData,
        pickupData: pickupData as PickupInsertData,
        dropoffData: dropoffData as DropoffInsertData,
        // Return flat properties again
        parsedDriverName: driverName,
        parsedDriverPhone: driverPhone,
        parsedTruckIdentifier: truckId,
        parsedDriverIc: driverIc,
        parsedStatusString: normalizedStatus, // ADD THIS LINE: Return the normalized status string
    };
}

// Internal helper to build the processing metadata
function _buildProcessingMetadata(params: {
    rowData: RawRowData;
    sourceInfoInput: Partial<SourceInfo>; // Use Partial<SourceInfo> from caller
    sourceDocumentId: string | null;
    resolvedOriginDetail: Partial<LocationDetail>;
    resolvedDestinationDetail: LocationDetail | null;
    headerMappingResult: HeaderMappingResultType;
    potentialSheetOrigin: string | null | undefined;
}): ParserProcessingMetadata {
    const functionId = `_buildProcessingMetadata`;
    logger.debug(`[${functionId}] Entering function.`); // Log Entry
    const {
        rowData, sourceInfoInput, sourceDocumentId,
        resolvedOriginDetail, resolvedDestinationDetail,
        headerMappingResult, potentialSheetOrigin
    } = params;

    // Use the full headerMappingResult here
    const pickupWarehouseKey = findMappedKey('pickupWarehouse', headerMappingResult);
    
    // ***** MODIFIED: Use groupOriginRawInput from sourceInfoInput as fallback *****
    const rawOriginInputActual = (pickupWarehouseKey ? extractStringField(rowData, pickupWarehouseKey) : null) // Value from current row
                                   || sourceInfoInput.groupOriginRawInput // Fallback to group origin from options
                                   || potentialSheetOrigin // Fallback to sheet origin
                                   || null; // Final fallback

    const destinationAddressKey = findMappedKey('shipToAddress', headerMappingResult);
    const rawDestinationInputActual = destinationAddressKey ? extractStringField(rowData, destinationAddressKey) : null;

    // Confidence calculation
    const originConf = resolvedOriginDetail?.resolutionConfidence ?? 0;
    const destConf = resolvedDestinationDetail?.resolutionConfidence ?? 0;
    const numResolved = (originConf > 0 ? 1 : 0) + (destConf > 0 ? 1 : 0);
    const avgConfidence = numResolved > 0 ? (originConf + destConf) / numResolved : 0;

    // Assign confidenceScore as number | null
    const finalConfidenceScore = (isNaN(avgConfidence)) ? null : parseFloat(avgConfidence.toFixed(2)); // Keep as number or null

    const needsReview = (avgConfidence < 0.6 && numResolved > 0) ||
                         (resolvedOriginDetail?.resolutionMethod === 'none' && !!rawOriginInputActual) ||
                         (resolvedDestinationDetail?.resolutionMethod === 'none' && !!rawDestinationInputActual);

    // Construct SourceInfo correctly
    const finalSourceInfo: SourceInfo = {
      fileName: sourceInfoInput.fileName ?? null,
      sheetName: sourceInfoInput.sheetName ?? null,
      rowIndex: sourceInfoInput.rowIndex ?? null, // Keep as potentially null here
      groupOriginRawInput: sourceInfoInput.groupOriginRawInput ?? null // Carry this through if needed elsewhere
    }

    logger.debug(`[${functionId}] Calculating confidence.`); // Log Step
    logger.debug(`[${functionId}] Constructing source info.`); // Log Step
    logger.debug(`[${functionId}] Exiting function.`); // Log Exit
    return {
        originalRowData: rowData,
        originalRowIndex: finalSourceInfo.rowIndex ?? -1, // CORRECTED: Default null/undefined to -1
        confidenceScore: finalConfidenceScore, // Assign number | null
        processingErrors: [],
        needsReview: needsReview,
        sourceDocumentId: sourceDocumentId,
        rawOriginInput: rawOriginInputActual ?? null, // Use the calculated value
        rawDestinationInput: rawDestinationInputActual ?? null,
    };
}

/**
 * Creates a complete ParsedShipmentBundle from raw row data, resolving locations.
 * Orchestrates calls to helper functions.
 */
export async function createShipmentFromRowData(
    rowData: RawRowData,
    rowIndex: number,
    potentialSheetOrigin: string | null | undefined,
    sourceDocumentId: string | null,
    headerMappingResult: HeaderMappingResultType,
    // ***** MODIFIED: Accept new groupOriginRawInput in options (SourceInfo) *****
    options: Partial<SourceInfo> = {} // Use Partial<SourceInfo> to make fields optional
): Promise<ParsedShipmentBundle | null> {
    const functionId = `createShipmentFromRowData`;
    logger.debug(`[${functionId}] Entering function for row index: ${rowIndex}`); // Log Entry

    // --- Robust Status Handling --- 
    // Initialize with the new default for missing status column
    let normalizedStatus: string = 'AWAITING_STATUS'; 
    const statusKey = findMappedKey('status', headerMappingResult);
    logger.debug(`[${functionId}] Status Key Check: Found key for 'status'? ${statusKey ? `'${statusKey}'` : 'No'}`); // More logging

    if (statusKey) {
        // Status column *is* mapped, try to extract and normalize
        const rawStatus = extractStringField(rowData, statusKey);
        logger.debug(`[${functionId}] Raw Status Extracted: '${rawStatus ?? '[Empty/Undefined]'}'`); // More logging

        if (rawStatus) {
            const upperStatus = rawStatus.toUpperCase(); // Normalize to uppercase for comparison
            logger.debug(`[${functionId}] Uppercase Status: '${upperStatus}'`); // More logging
            const isCompleted = COMPLETED_STATUS_SYNONYMS.has(upperStatus);
            logger.debug(`[${functionId}] Is in COMPLETED_STATUS_SYNONYMS? ${isCompleted}`); // More logging

            if (isCompleted) {
                normalizedStatus = 'COMPLETED'; // Use the final DB enum value string directly
                logger.debug(`[${functionId}] Recognized status "${rawStatus}" as completed. Setting normalizedStatus to COMPLETED.`);
            } else if (upperStatus === 'IDLE') {
                normalizedStatus = 'PLANNED'; // Map IDLE directly to PLANNED DB enum value string
                logger.debug(`[${functionId}] Recognized status "${rawStatus}" as IDLE. Setting normalizedStatus to PLANNED.`);
            } else {
                // Pass through other non-empty, non-completed statuses (uppercased)
                normalizedStatus = upperStatus;
                logger.debug(`[${functionId}] Passing through unrecognized status "${rawStatus}" as normalizedStatus: ${normalizedStatus}.`);
            }
        } else {
            // Status column mapped and exists, but the cell is empty - Treat as AWAITING_STATUS
            normalizedStatus = 'AWAITING_STATUS'; 
            logger.debug(`[${functionId}] Status column '${statusKey}' found but empty for row ${rowIndex}. Setting normalizedStatus to AWAITING_STATUS.`);
        }
    } 
    // If statusKey was not found, normalizedStatus remains 'AWAITING_STATUS' (the initial default)
    else {
        logger.debug(`[${functionId}] Standard field 'status' not found in header mapping for row ${rowIndex}. Setting default to AWAITING_STATUS.`);
    }
    
    logger.info(`[${functionId}] Final Normalized Status string for row ${rowIndex}: ${normalizedStatus}`); // Log final decision
    // --- End Status Handling ---

    // Resolve destination and origin addresses
    const [destinationResolvedDetail, originResolvedDetail] = await Promise.all([
        _resolveDestinationInfo(rowData, undefined, headerMappingResult), // Pass mapping result
        _resolveOriginInfo(rowData, potentialSheetOrigin, headerMappingResult) // Pass mapping result
    ]);
    logger.debug(`[${functionId}] Addresses resolved for row index: ${rowIndex}. Dest: ${!!destinationResolvedDetail}, Origin: ${!!originResolvedDetail}`);

    // Extract essential identifiers AFTER address resolution
    const loadNumber = extractStringField(rowData, 'loadNumber'); // Use mapped key if needed via findMappedKey
    const orderNumberStr = extractStringField(rowData, 'orderNumber'); // Use mapped key if needed

    // Basic validation (Can enhance later)
    if (!loadNumber && !orderNumberStr) {
        logger.warn(`[${functionId}] Skipping row ${rowIndex}: Missing both Load Number and Order Number.`);
        return null;
    }

    // Extract key dates AFTER validation
    const requestDate = extractDateField(rowData, 'requestDate'); // Use mapped key if needed
    const promisedShipDate = extractDateField(rowData, 'promisedShipDate'); // Use mapped key if needed

    // Build the core data parts using the internal helper
    // --- Pass normalizedStatus down ---
    const bundleParts = _buildShipmentBundleParts({
        rowData,
        loadNumber,
        orderNumberStr,
        requestDate,
        promisedShipDate,
        originResolvedDetail,
        destinationResolvedDetail,
        normalizedStatus: normalizedStatus, // Pass the result down
    });
    // --- END Pass normalizedStatus down ---
    logger.debug(`[${functionId}] Bundle parts built for row index: ${rowIndex}`);

    // Build the primary item from this row
    const primaryItem = buildShipmentItem(rowData);
    logger.debug(`[${functionId}] Primary item built for row index: ${rowIndex}. Item: ${!!primaryItem}`);

    // Build metadata
    const metadata = _buildProcessingMetadata({
        rowData,
        sourceInfoInput: options, // Pass the whole options object
        sourceDocumentId,
        resolvedOriginDetail: originResolvedDetail, // Explicitly pass the resolved variable
        resolvedDestinationDetail: destinationResolvedDetail, // Explicitly pass the resolved variable
        headerMappingResult, // Pass the mapping result
        potentialSheetOrigin
    });
     logger.debug(`[${functionId}] Metadata built for row index: ${rowIndex}`);

    // Construct the final bundle
    // Ensure ParsedShipmentBundle type definition includes 'items: ShipmentItemInsertData[]'
    const bundle: ParsedShipmentBundle = {
        metadata,
        shipmentBaseData: bundleParts.shipmentBaseData,
        customDetailsData: bundleParts.customDetailsData,
        originAddressData: bundleParts.originAddressData,
        destinationAddressData: bundleParts.destinationAddressData,
        pickupData: bundleParts.pickupData,
        dropoffData: bundleParts.dropoffData,
        itemsData: primaryItem ? [primaryItem] : [], // Correct property name to match type
        // --- MODIFIED: Use returned flat properties ---
        parsedDriverName: bundleParts.parsedDriverName,
        parsedDriverPhone: bundleParts.parsedDriverPhone,
        parsedTruckIdentifier: bundleParts.parsedTruckIdentifier,
        parsedDriverIc: bundleParts.parsedDriverIc,
        parsedStatusString: bundleParts.parsedStatusString,
        // --- END MODIFICATION ---
    };
    // Correctly access properties from customDetailsData for logging
    const displayLoadNumber = bundle.customDetailsData?.customerShipmentNumber ?? 'N/A';
    const displayOrderNumber = bundle.customDetailsData?.customerDocumentNumber ?? 'N/A';
    logger.debug(`[${functionId}] Final bundle constructed for row index: ${rowIndex}. Load: ${displayLoadNumber}, Order: ${displayOrderNumber}`);

    return bundle;
}

// Example Usage (Conceptual - actual usage depends on ExcelParserService)
/*
async function processRow(rowData: RawRowData, index: number) {
    const bundle = await createShipmentFromRowData(rowData, index, null, 'doc-123');
    if (bundle) {
        // Send bundle to database insertion service
        console.log('Generated Bundle:', JSON.stringify(bundle, null, 2));
    }
}
*/

// Helper function to parse carrier name (simplified example)
function parseCarrierNameFromTruckDetails(truckDetails: string | undefined): string | undefined {
    if (!truckDetails) return undefined;
    // Add logic to extract carrier if possible, e.g., based on known patterns in truckId
    return undefined; // Placeholder
}
