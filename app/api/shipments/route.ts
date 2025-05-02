import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/drizzle'; // Corrected path
import { eq, inArray, InferSelectModel, asc, type SQL, desc } from 'drizzle-orm';
import { documents, documentShipmentMap, shipmentsErd, customShipmentDetails, pickups, dropoffs, addresses, bookings, items, users /*... add other needed tables ...*/ } from '@/lib/database/schema'; // Corrected path - Ensure pickups/dropoffs are lowercase
import { auth } from '@/lib/auth'; // Corrected auth import path
import { z } from 'zod';
// Import the canonical ApiShipmentDetail and related types from the root types directory
import type { 
  ApiShipmentDetail, 
  ApiShipmentCoreInfo,
  ApiAddressDetail,
  ApiContact,
  ApiShipmentItem,
  ApiCustomDetails,
  ApiTransporterInfo,
  ApiTripRate,
  ApiBillingInfo,
  ApiOtherCharge,
  ApiShipmentMetadata,
  ApiShipmentItemDimension,
  ApiFinancialInfo,
  ApiStatusUpdate,
  ApiPickupDropoffInfo
} from '@/types/api'; 
import { logger } from '@/utils/logger'; // Import the logger
import { sql } from 'drizzle-orm';
import * as schema from '@/lib/database/schema'; // Ensure schema is imported

// Remove or comment out old Zod schemas if not applicable
// const createShipmentSchema = z.object({ ... });
// const shipmentFilterSchema = z.object({ ... });

// Remove old Mock Data
// const allMockShipments: { [documentId: string]: ShipmentData[] } = { ... };

// Define type for the shipment link query result
type ShipmentLink = { shipmentId: string | null };
// Define type for the main query result (adjust based on included relations)
// This is complex due to nesting; using 'any' temporarily, but ideally define a specific type
type FetchedShipment = any; 
// Example using InferSelectModel for the base and manually adding relations:
// type FetchedShipment = InferSelectModel<typeof shipmentsErd> & {
//   customShipmentDetails: InferSelectModel<typeof customShipmentDetails> | null;
//   pickups: (InferSelectModel<typeof pickups> & { address: InferSelectModel<typeof addresses> | null })[];
//   dropoffs: (InferSelectModel<typeof dropoffs> & { address: InferSelectModel<typeof addresses> | null })[];
//   booking: InferSelectModel<typeof bookings> | null;
//   // ... other relations
// };

// Define the type returned by the complex Drizzle query (adjust as needed)
type FetchedShipmentWithDetails = InferSelectModel<typeof shipmentsErd> & {
  booking: InferSelectModel<typeof bookings> | null;
  customShipmentDetails: InferSelectModel<typeof customShipmentDetails> | null; 
  pickups: (InferSelectModel<typeof pickups> & { address: InferSelectModel<typeof addresses> | null })[]; // Corrected: Lowercase
  dropoffs: (InferSelectModel<typeof dropoffs> & { address: InferSelectModel<typeof addresses> | null })[]; // Corrected: Lowercase
  items: InferSelectModel<typeof items>[]; // Include items
};

// Define types for intermediate query results
// Type for the explicit select result - MATCH DRIZZLE OUTPUT KEYS
type CoreShipmentWithTripQueryResult = {
    shipments_erd: InferSelectModel<typeof schema.shipmentsErd>; // Use lowercase table name as key
    trips: InferSelectModel<typeof schema.trips> | null;
};

// Keep other intermediate types...
type ShipmentCustomDetails = InferSelectModel<typeof schema.customShipmentDetails>;
type ShipmentPickup = InferSelectModel<typeof schema.pickups> & { address: InferSelectModel<typeof schema.addresses> | null };
type ShipmentDropoff = InferSelectModel<typeof schema.dropoffs> & { address: InferSelectModel<typeof schema.addresses> | null };
type ShipmentItem = InferSelectModel<typeof schema.items>;
type ShipmentBooking = InferSelectModel<typeof schema.bookings>;
type Trip = InferSelectModel<typeof schema.trips>; // Keep for clarity

// Helper to safely parse decimal string to float, returning undefined on error
function safeParseFloat(value: string | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
}

// Helper function to safely convert Date to ISO string, returning null if invalid/null
const safeToISOString = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null; // Check if date is valid
    return dateObj.toISOString();
  } catch (error) {
    console.error("Error converting date to ISO string:", error);
    return null;
  }
};

// Revised function signature to accept the explicit query result type
function mapDbShipmentToApi(
  queryResult: CoreShipmentWithTripQueryResult, // Use the explicit type for the joined result
  customDetailsMap: Map<string, ShipmentCustomDetails>,
  pickupsMap: Map<string, ShipmentPickup[]>,
  dropoffsMap: Map<string, ShipmentDropoff[]>,
  itemsMap: Map<string, ShipmentItem[]>,
  bookingsMap: Map<string, ShipmentBooking>,
  sourceFilename: string | null, 
  documentId: string 
): ApiShipmentDetail | null { 
    const coreShipment = queryResult.shipments_erd;
    const relatedTrip = queryResult.trips;
    logger.debug(`Mapping DB shipment ID: ${coreShipment.id} from doc ID: ${documentId}`);

    const relatedCustomDetails = customDetailsMap.get(coreShipment.id);
    const relatedPickups = pickupsMap.get(coreShipment.id) || []; 
    const relatedDropoffs = dropoffsMap.get(coreShipment.id) || []; 
    const relatedItems = itemsMap.get(coreShipment.id) || []; 
    const relatedBooking = coreShipment.bookingId ? bookingsMap.get(coreShipment.bookingId) : null;

    // Find primary origin and destination based on position order from related data
    const originPickup = relatedPickups[0]; // Already sorted by query
    const destinationDropoff = relatedDropoffs[0]; // Already sorted by query

    // --- Status Calculation --- (REVISED: Prioritize DB status, then calculate)
    let calculatedStatus = coreShipment.status || 'UNKNOWN'; // Start with status from DB

    // Only recalculate based on dates if the DB status is missing or potentially basic like 'PENDING'/'UNKNOWN'
    if (!calculatedStatus || calculatedStatus === 'PENDING' || calculatedStatus === 'UNKNOWN') {
        logger.debug(`DB status is ${calculatedStatus}, attempting calculation based on dates...`);
    if (destinationDropoff?.actualDateTimeOfArrival) {
        calculatedStatus = 'COMPLETED';
    } else if (originPickup?.actualDateTimeOfDeparture) {
        calculatedStatus = 'IN_TRANSIT';
    } else if (originPickup?.actualDateTimeOfArrival) {
        calculatedStatus = 'AT_PICKUP';
        } else if (coreShipment.shipmentDateCreated) {
            // Only set to PENDING if we still don't have a better status
            if (calculatedStatus === 'UNKNOWN') {
        calculatedStatus = 'PENDING';
            }
        } else {
             // If even creation date is missing, keep as UNKNOWN
             calculatedStatus = 'UNKNOWN';
        }
         logger.debug(`Recalculated status based on dates: ${calculatedStatus}`);
    } else {
        logger.debug(`Using status directly from database: ${calculatedStatus}`);
    }

    // --- Build Core Info --- (Use coreShipment and looked-up data)
    const coreInfo: ApiShipmentCoreInfo = {
        id: coreShipment.id,
        documentId: documentId, // Use passed documentId
        loadNumber: relatedCustomDetails?.customerShipmentNumber || null, 
        orderNumber: relatedCustomDetails?.customerDocumentNumber || coreShipment.shipmentDocumentNumber || null, 
        poNumber: destinationDropoff?.customerPoNumbers || null, 
        status: calculatedStatus,
        totalWeight: safeParseFloat(relatedCustomDetails?.totalTransportWeight) ?? null, 
        totalWeightUnit: 'kg', // Better placeholder
        totalVolume: safeParseFloat(relatedCustomDetails?.totalTransportVolume) ?? null, 
        totalVolumeUnit: 'm3', // Better placeholder
        totalItems: relatedItems.length, 
        promisedShipDate: null, // TODO: Determine correct source for promised ship date (maybe customDetails or booking has another field?)
        plannedDeliveryDate: destinationDropoff?.dropoff_date?.toISOString() || null, 
        actualPickupArrival: originPickup?.actualDateTimeOfArrival?.toISOString() || null, 
        actualPickupDeparture: originPickup?.actualDateTimeOfDeparture?.toISOString() || null, 
        actualDeliveryArrival: destinationDropoff?.actualDateTimeOfArrival?.toISOString() || null, 
        actualDeliveryDeparture: destinationDropoff?.actualDateTimeOfDeparture?.toISOString() || null, 
        lastKnownLatitude: safeParseFloat(coreShipment.lastKnownLatitude) ?? null,
        lastKnownLongitude: safeParseFloat(coreShipment.lastKnownLongitude) ?? null,
        lastKnownTimestamp: safeToISOString(coreShipment.lastKnownTimestamp),
        lastKnownBearing: safeParseFloat(coreShipment.lastKnownBearing) ?? null,
    };

    // Helper to construct full address string
    const constructFullAddress = (addr: InferSelectModel<typeof addresses> | null): string | null => {
        if (!addr) return null;
        const parts = [addr.street1, addr.street2, addr.city, addr.state, addr.postalCode, addr.country].filter(p => !!p);
        return parts.join(', ') || addr.rawInput || null;
    }

    // --- Build Origin Address --- 
    const originAddress: ApiAddressDetail | null = originPickup?.address ? {
        id: originPickup.address.id,
        rawInput: originPickup.address.rawInput || null,
        name: null, 
        street: originPickup.address.street1 || null,
        city: originPickup.address.city || null,
        stateProvince: originPickup.address.state || null,
        postalCode: originPickup.address.postalCode || null,
        country: originPickup.address.country || null,
        fullAddress: constructFullAddress(originPickup.address), // Construct full address
        latitude: safeParseFloat(originPickup.address.latitude) ?? null,
        longitude: safeParseFloat(originPickup.address.longitude) ?? null,
        resolutionMethod: (originPickup.address.resolutionMethod || 'none') as ApiAddressDetail['resolutionMethod'], // CORRECT: camelCase from schema
        resolutionConfidence: safeParseFloat(originPickup.address.resolutionConfidence) ?? null, // CORRECT: camelCase from schema 
        resolvedTimestamp: originPickup.address.updatedAt?.toISOString() || null, // CORRECT: camelCase from schema
    } : null;

    // --- Build Destination Address --- 
    const destinationAddress: ApiAddressDetail | null = destinationDropoff?.address ? {
        id: destinationDropoff.address.id,
        rawInput: destinationDropoff.address.rawInput || null,
        name: null, 
        street: destinationDropoff.address.street1 || null,
        city: destinationDropoff.address.city || null,
        stateProvince: destinationDropoff.address.state || null,
        postalCode: destinationDropoff.address.postalCode || null,
        country: destinationDropoff.address.country || null,
        fullAddress: constructFullAddress(destinationDropoff.address), // Construct full address
        latitude: safeParseFloat(destinationDropoff.address.latitude) ?? null,
        longitude: safeParseFloat(destinationDropoff.address.longitude) ?? null,
        resolutionMethod: (destinationDropoff.address.resolutionMethod || 'none') as ApiAddressDetail['resolutionMethod'], // CORRECT: camelCase from schema
        resolutionConfidence: safeParseFloat(destinationDropoff.address.resolutionConfidence) ?? null, // CORRECT: camelCase from schema 
        resolvedTimestamp: destinationDropoff.address.updatedAt?.toISOString() || null, // CORRECT: camelCase from schema
    } : null;
    
    // --- Build Shipper/Recipient Contacts --- 
    const shipper: ApiContact | null = null; // TODO: Needs separate handling
    // CORRECTED: Populate recipient from primary dropoff data
    const recipient: ApiContact | null = destinationDropoff ? {
      id: undefined, // No separate contact ID available here
      contactName: destinationDropoff.recipientContactName || null, // Use DB field
      contactNumber: destinationDropoff.recipientContactPhone || null, // Use DB field
      contactEmail: null // No email in dropoff table
    } : null;

    // --- Build Custom Details --- 
    const customDetailsData: ApiCustomDetails | null = relatedCustomDetails ? {
        transporter: { // TODO: Needs separate handling / more joins (Trip -> Vehicle/Driver/Transporter)
            carrierName: null, truckId: null, trailerId: null, driverName: null,
            driverCell: null, mcNumber: null, dotNumber: null,
        },
        tripRate: { // Basic rates okay, others need more info
            rate: safeParseFloat(relatedCustomDetails.tripRate) ?? null,
            currency: 'MYR', // TODO: Needs DB source, using MYR placeholder
            dropCharge: safeParseFloat(relatedCustomDetails.dropCharge) ?? null,
            manpowerCharge: safeParseFloat(relatedCustomDetails.manpowerCharge) ?? null, 
            fuelSurcharge: null, // TODO: Needs DB source
            detentionRate: null, // TODO: Needs DB source
            detentionCurrency: null, // TODO: Needs DB source
            otherCharges: [], // TODO: Needs DB source
        },
        billingInfo: { // TODO: Needs separate handling / more joins
            billToAddressId: null, paymentTerms: null, 
        },
        totalCharge: safeParseFloat(relatedCustomDetails.totalCharge) ?? null
    } : null;

    // --- Build Metadata --- 
    const metadata: ApiShipmentMetadata = {
        createdAt: coreShipment.shipmentDateCreated?.toISOString() || new Date().toISOString(), 
        updatedAt: coreShipment.shipmentDateModified?.toISOString() || new Date().toISOString(), 
        sourceFilename: sourceFilename, // Use filename passed from GET handler
        dataSource: 'PARSED_DOCUMENT', // TODO: Needs DB source, using placeholder 
        remarks: relatedCustomDetails?.remarks || null,
    };

    // --- Build Items --- 
    // CORRECTED: Map itemNumber and secondaryItemNumber correctly
    const items: ApiShipmentItem[] = relatedItems.map((item): ApiShipmentItem => ({ 
        id: item.id,
        itemNumber: item.itemNumber || null, // Map DB item_number to API itemNumber
        secondaryItemNumber: item.secondaryItemNumber || null, // Map DB secondary_item_number to API secondaryItemNumber
        description: item.description || null,
        quantity: safeParseFloat(item.quantity) ?? null, 
        sku: item.itemNumber || null, // Keep sku mapped from itemNumber for now
        weight: safeParseFloat(item.weight) ?? null,
        weightUnit: item.uom ?? 'UNIT', // Use UOM from item if available, else placeholder
        dimensions: null, // TODO: Needs DB source
        hsCode: null, // TODO: Needs DB source 
        lotSerialNumber: item.lotSerialNumber || null,
        uom: item.uom || null, 
        bin: item.bin || null,
    }));

    // --- Build Placeholder Structures for Missing Fields ---
    const locationDetails = { // Placeholder
        pickups: relatedPickups.map((p, index) => ({ // Basic mapping from fetched pickups
          locationType: 'Pickup' as const,
          sequence: index + 1, // Simple sequence
          locationName: p.address?.rawInput || 'Unknown Pickup',
          address: p.address ? { // Map address fields
            id: p.address.id,
            rawInput: p.address.rawInput || null,
            name: null,
            street: p.address.street1 || null,
            city: p.address.city || null,
            stateProvince: p.address.state || null,
            postalCode: p.address.postalCode || null,
            country: p.address.country || null,
            fullAddress: constructFullAddress(p.address),
            latitude: safeParseFloat(p.address.latitude) ?? null,
            longitude: safeParseFloat(p.address.longitude) ?? null,
            resolutionMethod: (p.address.resolutionMethod || 'none') as ApiAddressDetail['resolutionMethod'],
            resolutionConfidence: safeParseFloat(p.address.resolutionConfidence) ?? null,
            resolvedTimestamp: p.address.updatedAt?.toISOString() || null,
          } : null,
          contact: null, // Placeholder
          scheduledDateTimeUTC: p.pickup_date?.toISOString() || null,
          actualDateTimeUTC: p.actualDateTimeOfArrival?.toISOString() || null,
          notes: '', // Placeholder, notes field not directly on pickup table
          resolutionStatus: 'Pending', // Placeholder
          driverInstructions: '', // Placeholder
        })),
        dropoffs: relatedDropoffs.map((d, index) => ({ // Basic mapping from fetched dropoffs
            locationType: 'Dropoff' as const,
            sequence: index + 1,
            locationName: d.address?.rawInput || 'Unknown Dropoff',
            address: d.address ? { // Map address fields
                id: d.address.id,
                rawInput: d.address.rawInput || null,
                name: null,
                street: d.address.street1 || null,
                city: d.address.city || null,
                stateProvince: d.address.state || null,
                postalCode: d.address.postalCode || null,
                country: d.address.country || null,
                fullAddress: constructFullAddress(d.address),
                latitude: safeParseFloat(d.address.latitude) ?? null,
                longitude: safeParseFloat(d.address.longitude) ?? null,
                resolutionMethod: (d.address.resolutionMethod || 'none') as ApiAddressDetail['resolutionMethod'],
                resolutionConfidence: safeParseFloat(d.address.resolutionConfidence) ?? null,
                resolvedTimestamp: d.address.updatedAt?.toISOString() || null,
            } : null,
            contact: null, // Placeholder
            scheduledDateTimeUTC: d.dropoff_date?.toISOString() || null,
            actualDateTimeUTC: d.actualDateTimeOfArrival?.toISOString() || null,
            notes: '', // Placeholder, notes field not directly on dropoff table
            resolutionStatus: 'Pending', // Placeholder
            driverInstructions: '', // Placeholder
        })),
    };

    const contacts = { // Placeholder
        primaryShipperContact: shipper, // Use existing placeholder
        primaryConsigneeContact: recipient, // Use existing placeholder
        primaryBillToContact: null, // Placeholder
        otherContacts: [], // Placeholder
    };

    const financials: ApiFinancialInfo = { // Placeholder
        totalCharges: 0, // Placeholder
        currency: 'USD', // Placeholder
        invoiceNumber: '', // Placeholder
        paymentTerms: '', // Placeholder
        rateDetails: [], // Placeholder
        billingAddress: null, // Placeholder
        taxInformation: { // Placeholder
            taxId: '',
            taxAmount: 0,
        },
    };

    // Define tripAndCarrier using relatedTrip
    const tripAndCarrier = { 
        carrierName: null, 
        driverName: relatedTrip?.driverName ?? null, 
        driverCell: relatedTrip?.driverPhone ?? null, 
        driverIc: relatedTrip?.driverIcNumber ?? null, 
        truckId: relatedTrip?.truckPlate ?? null, 
        trailerId: null, 
        modeOfTransport: null, 
        estimatedTravelTimeHours: null,
        actualDistanceKm: null, 
    };
    
    // Define statusUpdates ONCE
    const statusUpdates: ApiStatusUpdate[] = []; 

    // --- Construct Final Object --- 
    const apiDetail: ApiShipmentDetail = {
        coreInfo,
        originAddress,
        destinationAddress,
        shipper,
        recipient,
        items,
        customDetails: customDetailsData,
        metadata,
        locationDetails,
        contacts,
        financials,
        tripAndCarrier, // Assign the object
        statusUpdates, 
    };

    return apiDetail;
}

/**
 * GET /api/shipments
 * Supports fetching all shipments for a documentId OR a paginated list of all shipments.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  logger.debug(`GET /api/shipments - documentId: ${documentId}, page: ${page}, limit: ${limit}`);

  try {
    if (documentId) {
      // --- Fetch ALL Shipments by documentId ---
      logger.debug(`Fetching all shipment links for documentId: ${documentId}`);
      const shipmentLinks = await db.query.documentShipmentMap.findMany({
        where: eq(documentShipmentMap.documentId, documentId),
        columns: { shipmentId: true }
      });

      if (!shipmentLinks || shipmentLinks.length === 0) {
        logger.warn(`No shipment links found for documentId: ${documentId}`);
        return NextResponse.json([]); // Return empty array if no links found
      }

      const shipmentIds = shipmentLinks.map(link => link.shipmentId).filter(id => id !== null) as string[];

      if (shipmentIds.length === 0) {
        logger.warn(`Shipment links found for documentId: ${documentId}, but all shipmentIds were null.`);
        return NextResponse.json([]); // Return empty array if no valid IDs
      }
      logger.debug(`Found ${shipmentIds.length} shipmentIds for documentId ${documentId}: ${shipmentIds.join(', ')}`);

      // 1. Fetch Core Shipments using explicit join
      logger.debug(`Fetching core shipment data with trip join for shipmentIds: ${shipmentIds.join(', ')}`);
      const coreShipmentsAndTrips: CoreShipmentWithTripQueryResult[] = await db
        .select()
        .from(schema.shipmentsErd)
        .leftJoin(schema.trips, eq(schema.shipmentsErd.tripId, schema.trips.id))
        .where(inArray(schema.shipmentsErd.id, shipmentIds));

      if (!coreShipmentsAndTrips || coreShipmentsAndTrips.length === 0) {
        logger.error(`No shipment core data found for any shipmentIds linked to doc ${documentId}`);
        return NextResponse.json([]);
      }
      logger.debug(`Fetched ${coreShipmentsAndTrips.length} core shipment/trip records.`);

      // 2. Fetch Other Related Data (using correct key for shipment IDs)
      const actualShipmentIds = coreShipmentsAndTrips.map(item => item.shipments_erd.id); // Use lowercase key
      const bookingIds = coreShipmentsAndTrips.map(item => item.shipments_erd.bookingId).filter(id => id !== null) as string[]; // Use lowercase key

      const [ relatedCustomDetailsList, relatedPickups, relatedDropoffs, relatedItemsList, relatedDocument, relatedBookings ] = await Promise.all([
        db.query.customShipmentDetails.findMany({ where: inArray(schema.customShipmentDetails.shipmentId, actualShipmentIds) }),
        db.query.pickups.findMany({ where: inArray(schema.pickups.shipmentId, actualShipmentIds), with: { address: true } }),
        db.query.dropoffs.findMany({ where: inArray(schema.dropoffs.shipmentId, actualShipmentIds), with: { address: true } }),
        db.query.items.findMany({ where: inArray(schema.items.shipmentId, actualShipmentIds) }),
        db.query.documents.findFirst({ where: eq(schema.documents.id, documentId), columns: { filename: true } }), 
        bookingIds.length > 0 ? db.query.bookings.findMany({ where: inArray(schema.bookings.id, bookingIds) }) : Promise.resolve([]) 
      ]);
      
      // 3. Prepare Data Maps 
      logger.debug(`Preparing data maps for multiple shipments`);
      const customDetailsMap = relatedCustomDetailsList.reduce((map, detail) => {
          if (detail.shipmentId) map.set(detail.shipmentId, detail); // Assuming one custom detail per shipment
          return map;
      }, new Map<string, ShipmentCustomDetails>());

      const pickupsMap = relatedPickups.reduce((map, pickup) => {
          if (pickup.shipmentId) {
              if (!map.has(pickup.shipmentId)) map.set(pickup.shipmentId, []);
              map.get(pickup.shipmentId)!.push(pickup);
          }
          return map;
      }, new Map<string, ShipmentPickup[]>());

      const dropoffsMap = relatedDropoffs.reduce((map, dropoff) => {
          if (dropoff.shipmentId) {
              if (!map.has(dropoff.shipmentId)) map.set(dropoff.shipmentId, []);
              map.get(dropoff.shipmentId)!.push(dropoff);
          }
          return map;
      }, new Map<string, ShipmentDropoff[]>());

      const itemsMap = relatedItemsList.reduce((map, item) => {
          if (item.shipmentId) {
              if (!map.has(item.shipmentId)) map.set(item.shipmentId, []);
              map.get(item.shipmentId)!.push(item);
          }
          return map;
      }, new Map<string, ShipmentItem[]>());

      const bookingsMap = relatedBookings.reduce((map, booking) => {
          map.set(booking.id, booking);
          return map;
      }, new Map<string, ShipmentBooking>());

      const sourceFilename = relatedDocument?.filename ?? null; 

      // 4. Map each shipment to API format
      logger.debug(`Mapping ${coreShipmentsAndTrips.length} results to API format for document ${documentId}`);
      const apiShipmentDetails = coreShipmentsAndTrips.map(queryResult => {
          // Pass the entire joined result object to the mapper
          return mapDbShipmentToApi(
              queryResult, 
              customDetailsMap, 
              pickupsMap, 
              dropoffsMap, 
              itemsMap, 
              bookingsMap, 
              sourceFilename, 
              documentId
          );
      }).filter(detail => detail !== null) as ApiShipmentDetail[]; 

      logger.debug(`Returning ${apiShipmentDetails.length} mapped shipment details for documentId: ${documentId}`);
      return NextResponse.json(apiShipmentDetails); 

    } else {
      // --- Paginated List of ALL Shipments ---
      logger.debug(`Fetching paginated list of all shipments - page: ${page}, limit: ${limit}`);
      // This part remains the same, fetching a general list, not tied to a documentId
      // It likely needs its own, more complex fetching logic if full details are needed per shipment in the list.
      // For now, assume it fetches a simpler list or adapt as needed.
      
      // TODO: Implement proper fetching and mapping for the general paginated list.
      // The previous implementation was incorrect as shipmentsErd lacks necessary fields.
      // Returning an empty array or an error for now until this is implemented.
      logger.warn("Paginated shipment list endpoint (/api/shipments without documentId) is not fully implemented.");
      return NextResponse.json({ data: [], message: "Paginated endpoint not fully implemented." }, { status: 501 }); // 501 Not Implemented

    }
  } catch (error) {
    logger.error("Error fetching shipments:", error);
    // Check if error is an instance of Error to safely access message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch shipments: ${errorMessage}` }, { status: 500 });
  }
}

// DELETE or Comment out the POST handler
// export async function POST(request: NextRequest) { ... } 