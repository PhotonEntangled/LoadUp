import { db } from '@/lib/database/drizzle';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '@/lib/database/schema';
import { type ParsedShipmentBundle } from '@/types/parser.types';
import { eq, and, SQL } from 'drizzle-orm';
import { logger } from '@/utils/logger';
// ***** ADDED IMPORT for mock address resolver *****
import { findOrCreateMockAddress } from '@/services/geolocation/mockAddressResolver'; 
import { geocodeAddress } from '@/services/geolocation/geocodingService'; // <-- IMPORT GEOCODING SERVICE
import type { ApiAddressDetail } from '@/types/api'; // <-- Import ApiAddressDetail for type hints

// Import the enum type itself for mapping
import { shipmentStatusEnum } from '@/lib/database/schema';

// Explicitly define the return type using the enum's values
type ShipmentStatusEnumType = typeof shipmentStatusEnum.enumValues[number];

// --- Helper Function for Status Mapping ---
function mapParserStatusToDbEnum(parserStatus: string | null | undefined): ShipmentStatusEnumType {
  const upperStatus = parserStatus?.toUpperCase();
  switch (upperStatus) {
    case 'DELIVERED':
    case 'COMPLETED':
    case 'FINISHED': 
      return 'COMPLETED'; 
    case 'PLANNED':
      return 'PLANNED';
    case 'BOOKED':
      return 'BOOKED';
    case 'IN_TRANSIT':
    case 'EN_ROUTE': 
      return 'IN_TRANSIT';
    case 'AT_PICKUP':
      return 'AT_PICKUP';
    case 'AT_DROPOFF':
    case 'PENDING_DELIVERY': 
      return 'AT_DROPOFF';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'EXCEPTION':
    case 'ERROR': 
      return 'EXCEPTION';
    case 'AWAITING_STATUS':
       return 'AWAITING_STATUS';
    case 'PENDING': 
    case 'PENDING_PICKUP': 
        return 'PLANNED';
    default:
      logger.warn(`[mapParserStatusToDbEnum] Unmapped status received: "${parserStatus}". Defaulting to AWAITING_STATUS.`);
      return 'AWAITING_STATUS'; 
  }
}

// Infer the insert type from the schema table
// Added locally as it wasn't imported before
import type { InferInsertModel } from 'drizzle-orm';
type AddressInsertData = InferInsertModel<typeof schema.addresses>;

interface InsertionResult {
  success: boolean;
  shipmentId?: string; // Return the new shipment ID on success
  error?: string;
}

// Helper to safely convert string/number to decimal string format for DB
// Drizzle expects strings for decimal types
function toDbDecimal(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num)) return null;
    // Basic formatting, might need adjustment based on DB precision needs
    return num.toFixed(2); // Example: 2 decimal places
}

/**
 * Inserts a complete ParsedShipmentBundle into the database within a single transaction.
 * Handles finding/creating related entities like addresses, trucks, drivers.
 *
 * @param bundle The parsed shipment data bundle.
 * @returns InsertionResult indicating success or failure.
 */
export async function insertShipmentBundle(
  bundle: ParsedShipmentBundle
): Promise<InsertionResult> {
  logger.debug(
    `[insertShipmentBundle] Received bundle for Row ${bundle.metadata?.originalRowIndex} with pickupAddressRaw: '${bundle.metadata?.rawOriginInput}', destinationAddressRaw: '${bundle.metadata?.rawDestinationInput}'`
  );

  const sourceDocId = bundle.metadata?.sourceDocumentId ?? '[Unknown Document]';
  const identifier = `Row ${bundle.metadata?.originalRowIndex ?? '?'}`;

  // Input Validation (Neurotic Check)
  if (!bundle || !bundle.shipmentBaseData || !bundle.metadata) { // Check core parts
    console.error('Invalid ParsedShipmentBundle received (missing core data): ', bundle);
    return { success: false, error: 'Invalid bundle data provided.' };
  }

  try {
    // Revert transaction parameter type back to any
    const result = await db.transaction(async (tx: any): Promise<InsertionResult> => {
      console.log(`Starting transaction for ${identifier} from doc ${sourceDocId}`);
      logger.debug(`[TX ${identifier}] START`);

      // Declare IDs higher up in scope
      let originDbId: string | null = null;
      let destinationDbId: string | null = null;
      let truckId: string | null = null;
      let driverId: string | null = null;
      let tripId: string;
      let shipmentId: string;
      let pickupId: string | null = null;
      let dropoffId: string | null = null;
      logger.debug(`[TX ${identifier}] Checkpoint: Variable declaration complete.`); // <-- CHECKPOINT 1

      // --- 1. Insert/Find Addresses (using bundle data) ---
      // ***** MODIFIED ORIGIN ADDRESS LOGIC *****
      const rawOriginInput = bundle.metadata?.rawOriginInput;
      logger.debug(`[TX ${identifier}] Processing Origin Address. Raw Input: '${rawOriginInput}'`);

      if (rawOriginInput) { // Priority 1: Use raw input for mock resolution
        try {
          originDbId = await findOrCreateMockAddress(tx, rawOriginInput);
          if (originDbId) {
            logger.info(`[TX ${identifier}] Resolved origin via mock lookup. Address ID: ${originDbId}`);
          } else {
            logger.warn(`[TX ${identifier}] Mock address resolution failed or returned null for raw input: '${rawOriginInput}'. Will check bundle.originAddressData.`);
          }
        } catch (mockError: any) {
           logger.error(`[TX ${identifier}] Error during findOrCreateMockAddress call: ${mockError.message}. Proceeding without mock resolution.`, mockError);
           originDbId = null; // Ensure null if mock call throws error
        }
      }

      // Priority 2: If mock resolution failed OR no raw input, use bundle.originAddressData (if valid)
      if (!originDbId && bundle.originAddressData && bundle.originAddressData.resolutionMethod !== 'none') { 
        logger.debug(`[TX ${identifier}] Attempting fallback using bundle.originAddressData.`);
        try {
          // Build conditions array, filtering out undefineds
          const originConditions: (SQL<unknown> | undefined)[] = [
            bundle.originAddressData.street1 ? eq(schema.addresses.street1, bundle.originAddressData.street1) : undefined,
            bundle.originAddressData.city ? eq(schema.addresses.city, bundle.originAddressData.city) : undefined,
            bundle.originAddressData.postalCode ? eq(schema.addresses.postalCode, bundle.originAddressData.postalCode) : undefined,
            bundle.originAddressData.country ? eq(schema.addresses.country, bundle.originAddressData.country) : undefined
          ];
          const validOriginConditions = originConditions.filter((c): c is SQL<unknown> => c !== undefined);

          let existingOrigin: { id: string } | undefined = undefined;
          if (validOriginConditions.length > 0) { // Only query if there are conditions
            existingOrigin = await tx.query.addresses.findFirst({
              where: and(...validOriginConditions), // Spread the valid conditions
              columns: { id: true }
            });
          }

          if (existingOrigin) {
            originDbId = existingOrigin.id;
            logger.debug(`[TX ${identifier}] Found existing origin address ID via fallback data: ${originDbId}`);
          } else {
            logger.debug(`[TX ${identifier}] Attempting to insert origin address using fallback data: ${JSON.stringify(bundle.originAddressData)}`);
            const insertedOrigin = await tx.insert(schema.addresses)
              .values(bundle.originAddressData)
              .returning({ id: schema.addresses.id });
            if (!insertedOrigin || insertedOrigin.length === 0 || !insertedOrigin[0]?.id) {
              throw new Error('Failed to insert fallback origin address or retrieve ID.');
            }
            originDbId = insertedOrigin[0].id;
            logger.debug(`[TX ${identifier}] Inserted new origin address ID via fallback data: ${originDbId}`);
          }
        } catch (fallbackError: any) {
          logger.error(`[TX ${identifier}] CATCH during Fallback Origin Address processing: ${fallbackError.message}`, fallbackError);
          originDbId = null; // Ensure null if fallback fails
        }
      }

      // Handle case where neither mock lookup nor fallback data yielded an ID
      if (!originDbId) {
         logger.warn(`[TX ${identifier}] Could not determine a valid Origin Address ID from mock lookup or bundle data. Origin address will be null for associated pickup.`);
         // originDbId remains null
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Origin address processing complete. Origin ID: ${originDbId}`); // <-- CHECKPOINT 2

      // ***** END MODIFIED ORIGIN LOGIC *****

      // --- Destination Address (Keep existing logic, seems okay for now) --- 
      logger.debug(`[TX ${identifier}] Processing Destination Address. Data provided: ${!!bundle.destinationAddressData}`);
      if (bundle.destinationAddressData) { // Check if address data exists first
           try {
                // Build conditions array, filtering out undefineds
                const destConditions: (SQL<unknown> | undefined)[] = [
                    bundle.destinationAddressData.street1 ? eq(schema.addresses.street1, bundle.destinationAddressData.street1) : undefined,
                    bundle.destinationAddressData.city ? eq(schema.addresses.city, bundle.destinationAddressData.city) : undefined,
                    bundle.destinationAddressData.postalCode ? eq(schema.addresses.postalCode, bundle.destinationAddressData.postalCode) : undefined,
                    bundle.destinationAddressData.country ? eq(schema.addresses.country, bundle.destinationAddressData.country) : undefined
                ];
                const validDestConditions = destConditions.filter((c): c is SQL<unknown> => c !== undefined);

                let existingDest: { id: string, latitude?: number | string | null, longitude?: number | string | null } | undefined = undefined; // Added lat/lon optional types
                 if (validDestConditions.length > 0) { // Only query if there are conditions
                     existingDest = await tx.query.addresses.findFirst({
                         where: and(...validDestConditions), // Spread the valid conditions
                         columns: { id: true, latitude: true, longitude: true } // Fetch lat/lon as well
                     });
                }

                if (existingDest) {
                    destinationDbId = existingDest.id;
                    logger.debug(`[TX ${identifier}] Found existing destination address ID: ${destinationDbId}`);

                    // --- NEW BLOCK: Check and geocode if existing address lacks coordinates --- 
                    const needsGeocoding = !existingDest.latitude || !existingDest.longitude;
                    logger.debug(`[TX ${identifier}] Existing address needs geocoding? ${needsGeocoding} (Lat: ${existingDest.latitude}, Lon: ${existingDest.longitude})`);

                    if (needsGeocoding) {
                        logger.info(`[TX ${identifier}] Existing destination address ${destinationDbId} lacks coordinates. Attempting geocode...`);
                        // Reuse the geocoding logic from the 'insert new' block
                        const addressStringToGeocode = bundle.destinationAddressData.rawInput || 
                            [bundle.destinationAddressData.street1, bundle.destinationAddressData.city, bundle.destinationAddressData.state, bundle.destinationAddressData.postalCode]
                                .filter(Boolean).join(', ');
                        
                        if (addressStringToGeocode) {
                            logger.debug(`[TX ${identifier}] Geocoding existing address using string: "${addressStringToGeocode}"`);
                            try {
                                const geocodeResult = await geocodeAddress(addressStringToGeocode);
                                if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
                                    logger.info(`[TX ${identifier}] Geocoding successful for existing address ${destinationDbId}. Updating record.`);
                                    await tx.update(schema.addresses)
                                        .set({
                                            latitude: toDbDecimal(geocodeResult.latitude),
                                            longitude: toDbDecimal(geocodeResult.longitude),
                                            resolutionMethod: geocodeResult.resolutionMethod || 'mapbox-api-update', // Indicate update
                                            resolutionConfidence: toDbDecimal(geocodeResult.resolutionConfidence) || '0.9',
                                            // Optionally update other fields if geocode provides better ones?
                                            // street1: geocodeResult.street || existingDest.street1? (Careful)
                                            // city: geocodeResult.city || existingDest.city? (Careful)
                                            // state: geocodeResult.stateProvince || existingDest.state? (Careful)
                                            // postalCode: geocodeResult.postalCode || existingDest.postalCode? (Careful)
                                        })
                                        .where(eq(schema.addresses.id, destinationDbId));
                                     logger.debug(`[TX ${identifier}] Successfully updated address ${destinationDbId} with new coordinates.`);
                                } else {
                                    logger.warn(`[TX ${identifier}] Geocoding attempt for existing address ${destinationDbId} failed or yielded no coordinates.`);
                                }
                            } catch (geocodeError: any) {
                                logger.error(`[TX ${identifier}] CATCH during Geocoding for existing address ${destinationDbId}: ${geocodeError.message}`, geocodeError);
                                // Don't throw error here, just log it. Allow transaction to continue with null coords.
                            }
                        } else {
                            logger.warn(`[TX ${identifier}] Cannot attempt geocoding for existing address ${destinationDbId}: No usable address string could be constructed.`);
                        }
                    } // End if(needsGeocoding)
                    // --- END NEW BLOCK ---

                } else {
                   logger.debug(`[TX ${identifier}] No existing destination address found. Preparing to insert...`);
                   // 2. Prepare data for potential insertion (start with bundle data)
                   // Use AddressInsertData type for stricter checking
                   const addressDataToInsert: AddressInsertData = {
                       // Start with values from the bundle, ensure nulls where appropriate
                       rawInput: bundle.destinationAddressData.rawInput || null,
                       street1: bundle.destinationAddressData.street1 || null,
                       street2: bundle.destinationAddressData.street2 || null,
                       city: bundle.destinationAddressData.city || null,
                       state: bundle.destinationAddressData.state || null,
                       postalCode: bundle.destinationAddressData.postalCode || null,
                       country: bundle.destinationAddressData.country || null,
                       // Initialize coordinates as null, attempt geocoding below
                       latitude: null,
                       longitude: null,
                       // Default resolution based on bundle data (likely direct fields initially)
                       resolutionMethod: bundle.destinationAddressData.resolutionMethod || 'direct-fields',
                       resolutionConfidence: toDbDecimal(bundle.destinationAddressData.resolutionConfidence) || '0.8', // Default confidence
                   };

                   // 3. Attempt Geocoding if coordinates are missing
                   logger.debug(`[TX ${identifier}] Preparing for Destination Geocoding. Bundle Data: ${JSON.stringify(bundle.destinationAddressData)}`);
                   const addressStringToGeocode = bundle.destinationAddressData.rawInput || 
                       // Construct if rawInput is missing (remove fullAddress dependency)
                       [bundle.destinationAddressData.street1, bundle.destinationAddressData.city, bundle.destinationAddressData.state, bundle.destinationAddressData.postalCode]
                           .filter(Boolean).join(', ');
                   logger.debug(`[TX ${identifier}] Constructed address string for geocoding: "${addressStringToGeocode}"`);

                   if (!addressDataToInsert.latitude && !addressDataToInsert.longitude && addressStringToGeocode) {
                       logger.debug(`[TX ${identifier}] Attempting geocoding for destination: ${addressStringToGeocode}`);
                       try {
                           const geocodeResult = await geocodeAddress(addressStringToGeocode);

                           if (geocodeResult && geocodeResult.latitude && geocodeResult.longitude) {
                               logger.info(`[TX ${identifier}] Geocoding successful for destination.`);
                               // Merge geocoded data into the insert object
                               addressDataToInsert.latitude = toDbDecimal(geocodeResult.latitude);
                               addressDataToInsert.longitude = toDbDecimal(geocodeResult.longitude);
                               addressDataToInsert.resolutionMethod = geocodeResult.resolutionMethod || 'mapbox-api';
                               addressDataToInsert.resolutionConfidence = toDbDecimal(geocodeResult.resolutionConfidence) || '0.9'; // Higher confidence for API result
                               // Update other fields if available and potentially more accurate
                               if (geocodeResult.street) addressDataToInsert.street1 = geocodeResult.street;
                               if (geocodeResult.city) addressDataToInsert.city = geocodeResult.city;
                               if (geocodeResult.stateProvince) addressDataToInsert.state = geocodeResult.stateProvince;
                               if (geocodeResult.postalCode) addressDataToInsert.postalCode = geocodeResult.postalCode;
                               if (geocodeResult.country) addressDataToInsert.country = geocodeResult.country;
                               // if (geocodeResult.fullAddress) addressDataToInsert.fullAddress = geocodeResult.fullAddress; // <-- REMOVE: Schema doesn't have 'fullAddress'

                           } else {
                               logger.warn(`[TX ${identifier}] Geocoding failed or yielded no coordinates for destination. Inserting address with null coordinates.`);
                               // Keep resolution method/confidence from original bundle data if geocoding failed
                           }
                       } catch (geocodeError: any) {
                           logger.error(`[TX ${identifier}] CATCH during Geocoding: ${geocodeError.message}`, geocodeError);
                           throw new Error(`Geocoding error: ${geocodeError.message}`);
                       }
                   }

                   // 5. Insert the new address record (with or without geocoded coords)
                   logger.debug(`[TX ${identifier}] Inserting destination address with data: ${JSON.stringify(addressDataToInsert)}`);
                   const insertedDest = await tx.insert(schema.addresses)
                        .values(addressDataToInsert)
                        .returning({ id: schema.addresses.id });
                   if (!insertedDest || insertedDest.length === 0 || !insertedDest[0]?.id) {
                        throw new Error('Failed to insert destination address or retrieve ID.');
                   }
                   destinationDbId = insertedDest[0].id;
                   logger.debug(`[TX ${identifier}] Inserted new destination address ID: ${destinationDbId}`);
                }
            } catch (addrError: any) {
                logger.error(`[TX ${identifier}] CATCH during Destination Address processing: ${addrError.message}`, addrError);
                throw new Error(`Database error processing destination address: ${addrError.message}`);
            }
      } else {
          logger.warn(`[insertShipmentBundle] No destination address data provided in bundle for ${identifier}. Destination Address ID will be null.`);
          destinationDbId = null;
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Destination address processing complete. Dest ID: ${destinationDbId}`); // <-- CHECKPOINT (AFTER Dest)
      
      // --- 2. Find Truck (Insert deferred) --- 
      logger.debug(`[TX ${identifier}] Finding Truck. Identifier: ${bundle.parsedTruckIdentifier}`);
      if (bundle.parsedTruckIdentifier) {
        try {
          const existingVehicle = await tx.query.vehicles.findFirst({
            where: eq(schema.vehicles.plateNumber, bundle.parsedTruckIdentifier),
            columns: { id: true } // Only fetch the ID
          });
          if (existingVehicle) {
            truckId = existingVehicle.id;
            console.log(`Found existing vehicle with plate ${bundle.parsedTruckIdentifier}, ID: ${truckId}`);
          } else {
            console.log(`Vehicle with plate ${bundle.parsedTruckIdentifier} not found in DB. Proceeding without linking truck.`);
            // TODO: Optionally log this or handle differently (e.g., create with defaults if schema allows)
          }
        } catch (error) {
            console.error(`Error querying vehicles for plate ${bundle.parsedTruckIdentifier}:`, error);
            // Potentially throw to rollback, or just proceed with truckId = null?
            // For now, proceed with null to allow insertion to continue.
            // throw new Error('Database error during vehicle lookup.'); 
        }
      } else {
        console.log('No truck identifier provided in the bundle.');
      }
      logger.debug(`[TX ${identifier}] Found Truck ID: ${truckId}`);
      logger.debug(`[TX ${identifier}] Checkpoint: Truck lookup complete. Truck ID: ${truckId}`); // <-- CHECKPOINT 3

      // --- 3. Find Driver (Insert deferred) --- 
      let foundDriver = null;

      logger.debug(`[TX ${identifier}] Finding Driver. Phone: ${bundle.parsedDriverPhone}, Name: ${bundle.parsedDriverName}`);
      try {
        // Prioritize lookup by phone if available
        if (bundle.parsedDriverPhone) {
          const driversByPhone = await tx.query.drivers.findMany({ // Use findMany in case phone isn't unique
            where: eq(schema.drivers.phone, bundle.parsedDriverPhone),
            columns: { id: true }
          });
          if (driversByPhone.length === 1) {
            foundDriver = driversByPhone[0];
            console.log(`Found unique driver by phone ${bundle.parsedDriverPhone}, ID: ${foundDriver.id}`);
          } else if (driversByPhone.length > 1) {
            console.warn(`Multiple drivers found with phone ${bundle.parsedDriverPhone}. Cannot reliably link driver.`);
          }
        }

        // If not found by phone, try by name (less reliable)
        if (!foundDriver && bundle.parsedDriverName) {
           const driversByName = await tx.query.drivers.findMany({ // Use findMany in case name isn't unique
            where: eq(schema.drivers.name, bundle.parsedDriverName),
            columns: { id: true }
          });
           if (driversByName.length === 1) {
            foundDriver = driversByName[0];
            console.log(`Found unique driver by name "${bundle.parsedDriverName}", ID: ${foundDriver.id}`);
          } else if (driversByName.length > 1) {
            console.warn(`Multiple drivers found with name "${bundle.parsedDriverName}". Cannot reliably link driver.`);
          }
        }

        // Assign ID if a unique driver was found
        if (foundDriver) {
          driverId = foundDriver.id;
        } else {
          console.log(`Driver not found or not uniquely identified by phone ('${bundle.parsedDriverPhone || 'N/A'}') or name ('${bundle.parsedDriverName || 'N/A'}'). Proceeding without linking driver.`);
          // TODO: Optionally log this or handle differently
        }

      } catch (error) {
        console.error(`Error querying drivers for phone ${bundle.parsedDriverPhone} or name ${bundle.parsedDriverName}:`, error);
        // Proceeding with driverId = null
      }
      logger.debug(`[TX ${identifier}] Found Driver ID: ${driverId}`);
      logger.debug(`[TX ${identifier}] Checkpoint: Driver lookup complete. Driver ID: ${driverId}`); // <-- CHECKPOINT 4

      // --- 4. Create Trip --- 
      try {
        // Prepare data for trip insertion
        // Most fields are nullable or have defaults, include the ones we have
        const tripInsertData = {
          truckId: truckId, // Link to looked-up vehicle ID (can be null)
          driverId: driverId, // Link to looked-up driver ID (can be null)
          // Store direct parsed values for this trip instance
          driverName: bundle.parsedDriverName, // Parsed name
          driverPhone: bundle.parsedDriverPhone, // Parsed phone
          driverIcNumber: bundle.parsedDriverIc, // CORRECTED: Map to driverIcNumber column
          truckPlate: bundle.parsedTruckIdentifier, // Parsed plate number
          // -- End direct parsed values --
          remarks: bundle.customDetailsData?.remarks, // Potentially null
          // tripConfigId and materialTransporter are omitted, allowing DB default or null
          // TODO: Populate other fields like material, materialType, status etc. if available/needed
          tripStatus: 'PENDING', // Example default status
        };

        logger.debug(`[TX ${identifier}] Attempting to insert Trip: ${JSON.stringify(tripInsertData)}`);
        const insertedTrips = await tx.insert(schema.trips)
          .values(tripInsertData)
          .returning({ id: schema.trips.id });

        if (!insertedTrips || insertedTrips.length === 0 || !insertedTrips[0].id) {
          throw new Error('Failed to insert trip or retrieve its ID.');
        }
        tripId = insertedTrips[0].id;
        logger.info(`[TX ${identifier}] Created Trip record with ID: ${tripId}`);

      } catch (error:any) {
        logger.error(`[TX ${identifier}] CATCH during Trip insertion: ${error.message}`, error);
        throw new Error(`Failed to create Trip record: ${error.message}`); 
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Trip insertion complete. Trip ID: ${tripId}`); // <-- CHECKPOINT 5

      // --- 3. Insert Main Shipment Record ---
      // Create the base shipment insert data object
      const initialShipmentInsertData = {
        ...bundle.shipmentBaseData, // Spread the base data from the bundle
        // Explicitly set potentially missing or overridden fields:
        tripId: tripId, // Link to the trip ID created earlier
        originAddressId: originDbId, // Link to the resolved origin address ID
        destinationAddressId: destinationDbId, // Link to the resolved destination address ID
        truckId: truckId, // Link to the resolved truck ID
        driverId: driverId, // Link to the resolved driver ID
        sourceDocumentId: bundle.metadata.sourceDocumentId, // Ensure sourceDocumentId is set from metadata
        // Reset pickup/dropoff IDs initially, they are linked later
        pickupId: null,
        dropoffId: null,
      };

      // --- Map and Assign Status --- 
      const dbStatus = mapParserStatusToDbEnum(bundle.parsedStatusString); // Get status string from bundle
      logger.debug(`[TX ${identifier}] Mapping status. Input: "${bundle.parsedStatusString}", Mapped Enum: "${dbStatus}"`);
      // Safely assign the mapped status, preventing potential type conflicts from spread
      // Use type assertion to allow modification after spread
      (initialShipmentInsertData as any).status = dbStatus; 
      // --- End Status Mapping ---

      logger.debug(`[TX ${identifier}] Preparing to insert shipment_erd with data: ${JSON.stringify(initialShipmentInsertData)}`); // Log before insert
      const insertedShipment = await tx
        .insert(schema.shipmentsErd)
        .values(initialShipmentInsertData)
        .returning({ id: schema.shipmentsErd.id });
      if (!insertedShipment || insertedShipment.length === 0 || !insertedShipment[0].id) {
        throw new Error('Failed to insert shipment or retrieve ID.');
      }
      shipmentId = insertedShipment[0].id;
      logger.info(`[TX ${identifier}] Inserted Shipment record with ID: ${shipmentId}`);
      logger.debug(`[TX ${identifier}] Checkpoint: Main Shipment insertion complete. Shipment ID: ${shipmentId}`); // <-- CHECKPOINT 7

      // --- REORDERED: 6. Insert Pickup --- 
      logger.debug(`[TX ${identifier}] Processing Pickup. Data provided: ${!!bundle.pickupData}`);
      if (bundle.pickupData) {
        try {
          // Now include shipmentId and the resolved originDbId
          const pickupInsertData = { 
            ...bundle.pickupData, 
            tripId: tripId, 
            addressId: originDbId, // Use the determined originDbId
            shipmentId: shipmentId // ADDED shipmentId
          }; 
          logger.debug(`[TX ${identifier}] Attempting to insert Pickup: ${JSON.stringify(pickupInsertData)}`);
          const insertedPickups = await tx.insert(schema.pickups)
            .values(pickupInsertData)
            .returning({ id: schema.pickups.id });
          if (!insertedPickups || insertedPickups.length === 0 || !insertedPickups[0].id) {
            throw new Error('Failed to insert pickup or retrieve ID.');
          }
          pickupId = insertedPickups[0].id;
          logger.info(`[TX ${identifier}] Inserted Pickup record with ID: ${pickupId}`);
        } catch (error: any) {
          logger.error(`[TX ${identifier}] CATCH during Pickup insertion: ${error.message}`, error);
          throw new Error(`Failed to create Pickup record: ${error.message}`);
        }
      } else {
        logger.warn(`[TX ${identifier}] No pickup data provided.`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Pickup insertion complete. Pickup ID: ${pickupId}`); // <-- CHECKPOINT 7

      // --- REORDERED: 7. Insert Dropoff --- 
      logger.debug(`[TX ${identifier}] Processing Dropoff. Data provided: ${!!bundle.dropoffData}`);
      if (bundle.dropoffData) {
        try {
          // Now include shipmentId
          const dropoffInsertData = { 
            ...bundle.dropoffData, 
            tripId: tripId, 
            addressId: destinationDbId,
            shipmentId: shipmentId // ADDED shipmentId
           };
          logger.debug(`[TX ${identifier}] Attempting to insert Dropoff: ${JSON.stringify(dropoffInsertData)}`);
          const insertedDropoffs = await tx.insert(schema.dropoffs)
            .values(dropoffInsertData)
            .returning({ id: schema.dropoffs.id });
          if (!insertedDropoffs || insertedDropoffs.length === 0 || !insertedDropoffs[0].id) {
            throw new Error('Failed to insert dropoff or retrieve ID.');
          }
          dropoffId = insertedDropoffs[0].id;
          logger.info(`[TX ${identifier}] Inserted Dropoff record with ID: ${dropoffId}`);
        } catch (error: any) {
          logger.error(`[TX ${identifier}] CATCH during Dropoff insertion: ${error.message}`, error);
          throw new Error(`Failed to create Dropoff record: ${error.message}`);
        }
      } else {
         logger.warn(`[TX ${identifier}] No dropoff data provided.`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Dropoff insertion complete. Dropoff ID: ${dropoffId}`); // <-- CHECKPOINT 8

      // --- NEW STEP: 8. Update Shipment with Pickup/Dropoff IDs ---
      try {
          if (pickupId || dropoffId) { // Only update if there's something to link
              logger.debug(`[TX ${identifier}] Attempting to update Shipment ${shipmentId} with Pickup ID: ${pickupId}, Dropoff ID: ${dropoffId}`);
              await tx.update(schema.shipmentsErd)
                  .set({
                      pickupId: pickupId,
                      dropoffId: dropoffId,
                  })
                  .where(eq(schema.shipmentsErd.id, shipmentId));
              logger.info(`[TX ${identifier}] Updated Shipment ${shipmentId} with Pickup/Dropoff links.`);
          } else {
               logger.debug(`[TX ${identifier}] Skipping Shipment update as no Pickup/Dropoff IDs were generated.`);
          }
      } catch (error: any) {
          logger.error(`[TX ${identifier}] CATCH during Shipment update with Pickup/Dropoff IDs: ${error.message}`, error);
          throw new Error(`Failed to update Shipment ${shipmentId} with Pickup/Dropoff IDs: ${error.message}`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Shipment Update (P/D IDs) complete.`); // <-- CHECKPOINT 9 Corrected

      // --- REORDERED: 9. Insert Custom Details --- 
      if (bundle.customDetailsData) {
        try {
          const customDetailInsertData = {
            ...bundle.customDetailsData,
            shipmentId: shipmentId, // Link to the created shipment
          };
          logger.debug(`[TX ${identifier}] Attempting to insert Custom Details: ${JSON.stringify(customDetailInsertData)}`);
          await tx.insert(schema.customShipmentDetails).values(customDetailInsertData);
          logger.info(`[TX ${identifier}] Inserted Custom Shipment Details for Shipment ID: ${shipmentId}`);
        } catch (error: any) {
          logger.error(`[TX ${identifier}] CATCH during Custom Details insertion: ${error.message}`, error);
          throw new Error(`Failed to create Custom Details record: ${error.message}`);
        }
      } else {
         logger.warn(`[TX ${identifier}] No custom details data provided.`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Custom Details insertion complete.`); // <-- CHECKPOINT 10 Corrected

      // --- REORDERED: 10. Insert Items --- 
      logger.debug(`[TX ${identifier}] Processing ${bundle.itemsData?.length || 0} items.`);
      if (bundle.itemsData && bundle.itemsData.length > 0) {
        for (const item of bundle.itemsData) {
          try {
            const itemInsertData = { ...item, shipmentId: shipmentId };
            logger.debug(`[TX ${identifier}] Attempting to insert Item: ${JSON.stringify(itemInsertData)}`);
            await tx.insert(schema.items).values(itemInsertData);
            logger.debug(`[TX ${identifier}] Inserted Item: ${item.itemNumber || 'No item number'}`);
          } catch (error: any) {
            logger.error(`[TX ${identifier}] CATCH during Item insertion (Item: ${item.itemNumber}): ${error.message}`, error);
            throw new Error(`Failed to insert Item ${item.itemNumber}: ${error.message}`);
          }
        }
        logger.info(`[TX ${identifier}] Finished inserting ${bundle.itemsData.length} items for Shipment ID: ${shipmentId}`);
      } else {
        logger.warn(`[TX ${identifier}] No items provided in bundle.`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Items insertion complete.`); // <-- CHECKPOINT 11 Corrected

      // --- 11. Insert into document_shipment_map ---
      logger.debug(`[TX ${identifier}] Processing Document Map. Source Doc ID: ${sourceDocId}`);
      if (sourceDocId && sourceDocId !== '[Unknown Document]') {
        try { 
          const valuesToInsert = { documentId: sourceDocId, shipmentId: shipmentId };
          logger.debug(`[TX ${identifier}] Attempting to insert Document Map: ${JSON.stringify(valuesToInsert)}`); 
          await tx.insert(schema.documentShipmentMap).values(valuesToInsert); 
          logger.debug(`[TX ${identifier}] Created Document-Shipment map for Doc ${valuesToInsert.documentId} and Shipment ${valuesToInsert.shipmentId}`);
        } catch (mapError: any) { 
          logger.error(`[TX ${identifier}] CATCH during Document Map insertion: ${mapError.message}`, mapError);
          throw new Error(`Database error inserting document map: ${mapError.message}`); 
        }
      } else {
        logger.warn(`[TX ${identifier}] Skipping document map insertion due to missing source document ID.`);
      }
      logger.debug(`[TX ${identifier}] Checkpoint: Document Map insertion complete.`); // <-- CHECKPOINT 12 Corrected

      // --- Transaction Success --- 
      logger.info(`[TX ${identifier}] COMMIT: Successfully completed transaction for ${identifier} (Shipment ID: ${shipmentId})`);
      return { success: true, shipmentId: shipmentId };

    });
    return result; 

  } catch (error: any) {
    // Log the error that caused rollback from the outer catch
    logger.error(`[TX ${identifier}] ROLLBACK: Transaction failed for ${identifier} from doc ${sourceDocId}: ${error.message}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
} // End of insertShipmentBundle function