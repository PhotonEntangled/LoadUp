"use server";

import { db } from "@/lib/database/drizzle";
import {
  shipmentsErd,
  shipmentStatusEnum,
  pickups, 
  dropoffs, 
  addresses, 
  customShipmentDetails,
  trips, 
  transporters, 
  vehicles,
  items as shipmentItems,
} from "@/lib/database/schema";
import type { 
    ApiShipmentDetail, 
    ApiAddressDetail, 
    ApiShipmentItem, 
    ApiOtherCharge, 
    ApiCustomDetails, 
    ApiShipmentCoreInfo, 
    ApiContact, 
    ApiPickupDropoffInfo, 
    ApiFinancialInfo,
    ApiStatusUpdate,
    ApiTransporterInfo,
    ApiTripRate,
    ApiBillingInfo,
    ApiShipmentMetadata
} from "@/types/api";
import type { StaticTrackingDetails } from '@/types/tracking';
import { logger } from "@/utils/logger";
import { eq, and, desc, inArray, sql, SQL } from "drizzle-orm";
import { type LineString } from 'geojson';
import { MapDirectionsService } from "@/services/map/MapDirectionsService";

// Type definition for explicitly selected address fields
type SelectedDbAddress = Pick<typeof addresses.$inferSelect, 'id' | 'rawInput' | 'street1' | 'city' | 'state' | 'postalCode' | 'country' | 'latitude' | 'longitude' | 'resolutionMethod' | 'resolutionConfidence' | 'updatedAt'>;

// Updated Helper Function: Map Explicitly Selected DB Address to ApiAddressDetail
const mapSelectedDbAddressToApi = (addr: SelectedDbAddress | undefined | null): ApiAddressDetail | null => {
    if (!addr) return null;
    return {
        id: addr.id,
        rawInput: addr.rawInput ?? null, 
        name: null, // No direct 'name' field in addresses schema
        street: addr.street1 ?? null, 
        city: addr.city ?? null,
        stateProvince: addr.state ?? null, 
        postalCode: addr.postalCode ?? null,
        country: addr.country ?? null,
        fullAddress: addr.rawInput ?? null, // Use rawInput as fallback
        latitude: addr.latitude ? parseFloat(addr.latitude) : null,
        longitude: addr.longitude ? parseFloat(addr.longitude) : null,
        resolutionMethod: addr.resolutionMethod as ApiAddressDetail['resolutionMethod'] ?? null, 
        resolutionConfidence: addr.resolutionConfidence ? parseFloat(addr.resolutionConfidence) : null,
        resolvedTimestamp: addr.updatedAt?.toISOString() ?? null, 
    };
};

// Type definition for explicitly selected pickup/dropoff fields
// Combined relevant fields from both pickups and dropoffs tables
type SelectedDbStop = Pick<
    typeof pickups.$inferSelect & typeof dropoffs.$inferSelect, // Combine types
    'id' | 'shipmentId' | 'addressId' | 'estimatedDateTimeOfArrival' | 'pickup_date' | 'actualDateTimeOfArrival' | 'pickup_position' | 'dropoff_date' | 'dropoff_position' | 'recipientContactName' | 'customerPoNumbers' | 'actualDateTimeOfDeparture'
>;

// Updated Helper Function: Map DB Pickup/Dropoff to ApiPickupDropoffInfo
const mapSelectedDbStopToApiLocation = (
    stop: SelectedDbStop | undefined | null,
    address: ApiAddressDetail | null, 
    type: 'Pickup' | 'Dropoff',
    sequence: number
): ApiPickupDropoffInfo | null => {
    if (!stop) return null;

    let scheduledDateTime: string | null = null;
    let actualDateTime: string | null = null;
    const notes: string | null = null;
    let locationName: string | null = address?.name ?? null;

    if (type === 'Pickup') {
        const p = stop; // No need to cast if type SelectedDbStop includes all fields
        scheduledDateTime = p.estimatedDateTimeOfArrival?.toISOString() ?? p.pickup_date?.toISOString() ?? null;
        actualDateTime = p.actualDateTimeOfArrival?.toISOString() ?? null;
    } else {
        const d = stop; // No need to cast
        scheduledDateTime = d.estimatedDateTimeOfArrival?.toISOString() ?? d.dropoff_date?.toISOString() ?? null;
        actualDateTime = d.actualDateTimeOfArrival?.toISOString() ?? null;
        locationName = locationName ?? d.recipientContactName ?? null;
    }

    return {
        locationType: type,
        sequence: sequence,
        locationName: locationName ?? `${type} Location (${address?.city ?? 'Unknown'})`, 
        address: address,
        contact: null, // TODO: Map contact
        scheduledDateTimeUTC: scheduledDateTime,
        actualDateTimeUTC: actualDateTime,
        notes: notes ?? '', 
        resolutionStatus: 'Pending', // Placeholder
        driverInstructions: '', // Placeholder
    };
};

// Type definition for explicitly selected item fields
type SelectedDbItem = Pick<typeof shipmentItems.$inferSelect, 'id' | 'shipmentId' | 'itemNumber' | 'secondaryItemNumber' | 'description' | 'quantity' | 'weight' | 'lotSerialNumber'>;

// --- Main Helper Function: Map Full DB Data to ApiShipmentDetail --- 
const mapFullDbDataToApiShipmentDetail = (
    dbShipment: typeof shipmentsErd.$inferSelect,
    dbItems: SelectedDbItem[] | null, // Use selected type
    dbPickups: SelectedDbStop[] | null, // Use selected type
    dbDropoffs: SelectedDbStop[] | null, // Use selected type
    dbPickupAddresses: SelectedDbAddress[] | null, // Use selected type
    dbDropoffAddresses: SelectedDbAddress[] | null, // Use selected type
    dbCustomDetails: typeof customShipmentDetails.$inferSelect | null,
    dbTrip: typeof trips.$inferSelect | null, 
    dbVehicle: typeof vehicles.$inferSelect | null,
    dbTransporter: typeof transporters.$inferSelect | null
): ApiShipmentDetail => {

    // 1. Map Addresses first
    const originAddressMapped = mapSelectedDbAddressToApi(dbPickupAddresses?.[0]);
    const destinationAddressMapped = mapSelectedDbAddressToApi(dbDropoffAddresses?.[0]);

    // 2. Map Core Info - Strict to schema and ApiShipmentCoreInfo
    const coreInfo: ApiShipmentCoreInfo = {
        id: dbShipment.id,
        documentId: dbCustomDetails?.customerDocumentNumber ?? 'N/A', 
        loadNumber: dbCustomDetails?.customerShipmentNumber ?? null, 
        orderNumber: null, // Source unclear
        poNumber: dbDropoffs?.[0]?.customerPoNumbers ?? null, 
        status: dbShipment.status as ApiShipmentCoreInfo['status'] ?? 'AWAITING_STATUS', 
        totalWeight: null, // Corrected: Not directly available on shipment
        totalWeightUnit: null, // Corrected: Not directly available
        totalVolume: null, // Corrected: Not directly available
        totalVolumeUnit: null, // Corrected: Not directly available
        totalItems: dbItems?.length ?? null, 
        promisedShipDate: null, // Source unclear
        plannedDeliveryDate: dbDropoffs?.[0]?.dropoff_date?.toISOString() ?? null, 
        actualPickupArrival: dbPickups?.[0]?.actualDateTimeOfArrival?.toISOString() ?? null, 
        actualPickupDeparture: dbPickups?.[0]?.actualDateTimeOfDeparture?.toISOString() ?? null, 
        actualDeliveryArrival: dbDropoffs?.[0]?.actualDateTimeOfArrival?.toISOString() ?? null, 
        actualDeliveryDeparture: dbDropoffs?.[0]?.actualDateTimeOfDeparture?.toISOString() ?? null, 
        lastKnownLatitude: dbShipment.lastKnownLatitude ? parseFloat(dbShipment.lastKnownLatitude) : null,
        lastKnownLongitude: dbShipment.lastKnownLongitude ? parseFloat(dbShipment.lastKnownLongitude) : null,
        lastKnownTimestamp: dbShipment.lastKnownTimestamp?.toISOString() ?? null,
        lastKnownBearing: dbShipment.lastKnownBearing ? parseFloat(dbShipment.lastKnownBearing) : null,
    };

    // 3. Map Items - Strict to schema and ApiShipmentItem
    const itemsMapped: ApiShipmentItem[] = dbItems?.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber ?? null,
        secondaryItemNumber: item.secondaryItemNumber ?? null,
        description: item.description ?? null,
        quantity: item.quantity ? parseFloat(item.quantity) : null,
        sku: null, // Source unclear
        weight: item.weight ? parseFloat(item.weight) : null,
        weightUnit: 'kg', // Assume kg or check UOM field if available
        dimensions: null,
        hsCode: null,
        lotSerialNumber: item.lotSerialNumber ?? null,
    })) ?? [];

    // 4. Map Nested Custom Details
    const transporterInfo: ApiTransporterInfo | null = {
        carrierName: dbTransporter?.name ?? dbCustomDetails?.carrierName ?? null,
        truckId: dbTrip?.truckPlate ?? dbVehicle?.plateNumber ?? null,
        trailerId: null, // Corrected: No trailerNumber field identified
        driverName: dbTrip?.driverName ?? null,
        driverCell: dbTrip?.driverPhone ?? null,
        mcNumber: null,
        dotNumber: null,
    };

    const tripRateInfo: ApiTripRate | null = dbCustomDetails ? { 
        rate: dbCustomDetails.tripRate ? parseFloat(dbCustomDetails.tripRate) : null,
        currency: 'USD',
        dropCharge: dbCustomDetails.dropCharge ? parseFloat(dbCustomDetails.dropCharge) : null,
        manpowerCharge: dbCustomDetails.manpowerCharge ? parseFloat(dbCustomDetails.manpowerCharge) : null,
        fuelSurcharge: null,
        detentionRate: null,
        detentionCurrency: null,
        otherCharges: [], 
    } : null;

    const billingInfo: ApiBillingInfo | null = null; 

    const customDetailsMapped: ApiCustomDetails | null = (transporterInfo || tripRateInfo || billingInfo) ? {
        transporter: transporterInfo,
        tripRate: tripRateInfo,
        billingInfo: billingInfo,
        // totalCharge: Removed
    } : null;

    // 5. Map Metadata
    const metadata: ApiShipmentMetadata = {
        createdAt: dbShipment.shipmentDateCreated?.toISOString() ?? new Date().toISOString(),
        updatedAt: dbShipment.shipmentDateModified?.toISOString() ?? new Date().toISOString(),
        sourceFilename: null,
        dataSource: 'DB',
        remarks: dbCustomDetails?.remarks ?? null,
    };

    // 6. Map Location Details (Pickups/Dropoffs)
    const pickupsMapped: ApiPickupDropoffInfo[] = dbPickups?.map((p, index) => 
        mapSelectedDbStopToApiLocation(p, mapSelectedDbAddressToApi(dbPickupAddresses?.[index]), 'Pickup', p.pickup_position ?? index + 1)
    ).filter(Boolean) as ApiPickupDropoffInfo[] ?? [];

    const dropoffsMapped: ApiPickupDropoffInfo[] = dbDropoffs?.map((d, index) => 
        mapSelectedDbStopToApiLocation(d, mapSelectedDbAddressToApi(dbDropoffAddresses?.[index]), 'Dropoff', d.dropoff_position ?? index + 1)
    ).filter(Boolean) as ApiPickupDropoffInfo[] ?? [];

    // 7. Map Contacts (Placeholder)
    const shipperContact: ApiContact | null = null; 
    const recipientContact: ApiContact | null = null; 
    const primaryShipperContact: ApiContact | null = null; 
    const primaryConsigneeContact: ApiContact | null = null; 
    const primaryBillToContact: ApiContact | null = null; 
    const otherContacts: ApiContact[] = []; 

    // 8. Map Financials (Placeholder)
    const financialsMapped: ApiFinancialInfo = { 
        totalCharges: dbCustomDetails?.totalCharge ? parseFloat(dbCustomDetails.totalCharge) : 0, // Use totalCharge if exists
        currency: 'USD', // Corrected: Removed dbShipment.currency
        invoiceNumber: '', // Corrected: No sovylnvoiceNumber field
        paymentTerms: '', 
        rateDetails: [], 
        billingAddress: null, 
        taxInformation: { taxId: '', taxAmount: 0 },
    };

    // 9. Map Trip & Carrier Info
    const tripAndCarrierMapped = {
        carrierName: dbTransporter?.name ?? dbCustomDetails?.carrierName ?? null,
        driverName: dbTrip?.driverName ?? null,
        driverCell: dbTrip?.driverPhone ?? null,
        driverIc: dbTrip?.driverIcNumber ?? null, 
        truckId: dbTrip?.truckPlate ?? dbVehicle?.plateNumber ?? null,
        trailerId: null, // Corrected: trailerNumber removed
        modeOfTransport: null, // Corrected: No shipmentMode
        estimatedTravelTimeHours: null,
        actualDistanceKm: null,
    };

    // 10. Map Status Updates (Placeholder)
    const statusUpdatesMapped: ApiStatusUpdate[] = []; 

    // Assemble the final ApiShipmentDetail object
    return {
        coreInfo: coreInfo,
        originAddress: originAddressMapped,
        destinationAddress: destinationAddressMapped,
        shipper: shipperContact,
        recipient: recipientContact,
        items: itemsMapped,
        customDetails: customDetailsMapped,
        metadata: metadata,
        locationDetails: {
            pickups: pickupsMapped,
            dropoffs: dropoffsMapped,
        },
        contacts: {
            primaryShipperContact: primaryShipperContact,
            primaryConsigneeContact: primaryConsigneeContact,
            primaryBillToContact: primaryBillToContact,
            otherContacts: otherContacts,
        },
        financials: financialsMapped,
        tripAndCarrier: tripAndCarrierMapped,
        statusUpdates: statusUpdatesMapped,
    };
};


/**
 * Server Action: Fetches all shipments associated with the GIVEN document ID.
 * Returns FULL ApiShipmentDetail for each.
 * 
 * @param documentId - The sourceDocumentId identifying the document.
 * @returns A promise resolving to an array of ApiShipmentDetail or null if not found/error.
 */
export async function getShipmentsForDocumentContaining(
  documentId: string
): Promise<ApiShipmentDetail[] | null> {
  if (!documentId) {
    logger.warn("[Action getShipmentsForDocumentContaining] Received null or empty documentId.");
    return null;
  }

  logger.info(`[Action getShipmentsForDocumentContaining] Fetching shipments for documentId (sourceDocumentId): ${documentId}`);

  try {
    // Fetch shipments matching the sourceDocumentId, joining necessary tables
    const dbShipmentsWithDetails = await db
        .select({
            shipment: shipmentsErd,
            customDetails: customShipmentDetails,
            trip: trips, 
            vehicle: vehicles,
            transporter: transporters
        })
        .from(shipmentsErd)
        // Join custom details ON shipmentsErd.id = customShipmentDetails.shipmentId
        .leftJoin(customShipmentDetails, eq(shipmentsErd.id, customShipmentDetails.shipmentId))
        // Join trip ON shipmentsErd.tripId = trips.id
        .leftJoin(trips, eq(shipmentsErd.tripId, trips.id)) 
        // Join vehicles ON trips.truckId = vehicles.id
        .leftJoin(vehicles, eq(trips.truckId, vehicles.id))
        // Join transporters ON trips.materialTransporter = transporters.id
        .leftJoin(transporters, eq(trips.materialTransporter, transporters.id))
        // FILTER based on the documentId corresponding to the sourceDocumentId field
        .where(eq(shipmentsErd.sourceDocumentId, documentId)) // CORRECTED FIELD
        .orderBy(desc(shipmentsErd.shipmentDateCreated)); 

    if (!dbShipmentsWithDetails || dbShipmentsWithDetails.length === 0) {
        // Corrected log message to reflect the field used
        logger.warn(`[Action getShipmentsForDocumentContaining] No shipments found matching sourceDocumentId: ${documentId}`);
        return []; 
    }

    const shipmentIds = dbShipmentsWithDetails.map(s => s.shipment.id);

    // Fetch related data (Pickups, Dropoffs, Addresses, Items) efficiently using explicit selects
    const [dbPrimaryPickups, dbPrimaryDropoffs, dbAllItems] = await Promise.all([
        db.select({
            id: pickups.id,
            shipmentId: pickups.shipmentId,
            addressId: pickups.addressId,
            estimatedDateTimeOfArrival: pickups.estimatedDateTimeOfArrival,
            pickup_date: pickups.pickup_date,
            actualDateTimeOfArrival: pickups.actualDateTimeOfArrival,
            pickup_position: pickups.pickup_position,
            actualDateTimeOfDeparture: pickups.actualDateTimeOfDeparture,
            dropoff_date: sql<Date | null>`null`, // Explicitly null
            dropoff_position: sql<number | null>`null`,
            recipientContactName: sql<string | null>`null`, // Use sql null
            customerPoNumbers: sql<string | null>`null`, // Use sql null
        }).from(pickups).where(and(inArray(pickups.shipmentId, shipmentIds), eq(pickups.pickup_position, 1))).orderBy(pickups.shipmentId),
        db.select({
            id: dropoffs.id,
            shipmentId: dropoffs.shipmentId,
            addressId: dropoffs.addressId,
            estimatedDateTimeOfArrival: dropoffs.estimatedDateTimeOfArrival,
            dropoff_date: dropoffs.dropoff_date,
            actualDateTimeOfArrival: dropoffs.actualDateTimeOfArrival,
            dropoff_position: dropoffs.dropoff_position,
            recipientContactName: dropoffs.recipientContactName,
            customerPoNumbers: dropoffs.customerPoNumbers,
            actualDateTimeOfDeparture: dropoffs.actualDateTimeOfDeparture,
            pickup_date: sql<Date | null>`null`,
            pickup_position: sql<number | null>`null`,
        }).from(dropoffs).where(and(inArray(dropoffs.shipmentId, shipmentIds), eq(dropoffs.dropoff_position, 1))).orderBy(dropoffs.shipmentId),
        db.select({
            id: shipmentItems.id,
            shipmentId: shipmentItems.shipmentId,
            itemNumber: shipmentItems.itemNumber,
            secondaryItemNumber: shipmentItems.secondaryItemNumber,
            description: shipmentItems.description,
            quantity: shipmentItems.quantity,
            weight: shipmentItems.weight,
            lotSerialNumber: shipmentItems.lotSerialNumber,
        }).from(shipmentItems).where(inArray(shipmentItems.shipmentId, shipmentIds)).orderBy(shipmentItems.shipmentId),
    ]);

    const pickupLocationIds = dbPrimaryPickups.map(p => p.addressId).filter(Boolean) as string[];
    const dropoffLocationIds = dbPrimaryDropoffs.map(d => d.addressId).filter(Boolean) as string[];
    const locationIds = [...new Set([...pickupLocationIds, ...dropoffLocationIds])];
    const dbAddresses = locationIds.length > 0 ? await db.select({
        id: addresses.id,
        rawInput: addresses.rawInput,
        street1: addresses.street1,
        city: addresses.city,
        state: addresses.state,
        postalCode: addresses.postalCode,
        country: addresses.country,
        latitude: addresses.latitude,
        longitude: addresses.longitude,
        resolutionMethod: addresses.resolutionMethod,
        resolutionConfidence: addresses.resolutionConfidence,
        updatedAt: addresses.updatedAt,
    }).from(addresses).where(inArray(addresses.id, locationIds)) : [];

    // Organize related data by shipmentId
    const itemsByShipmentId = dbAllItems.reduce((acc, item) => {
        if (item.shipmentId) {
           (acc[item.shipmentId] = acc[item.shipmentId] || []).push(item);
        }
        return acc;
    }, {} as Record<string, SelectedDbItem[]>);

    const pickupsByShipmentId = dbPrimaryPickups.reduce((acc, pickup) => {
        if (pickup.shipmentId) {
           (acc[pickup.shipmentId] = acc[pickup.shipmentId] || []).push(pickup);
        }
        return acc;
    }, {} as Record<string, SelectedDbStop[]>);

    const dropoffsByShipmentId = dbPrimaryDropoffs.reduce((acc, dropoff) => {
        if (dropoff.shipmentId) {
            (acc[dropoff.shipmentId] = acc[dropoff.shipmentId] || []).push(dropoff);
        }
        return acc;
    }, {} as Record<string, SelectedDbStop[]>);

    const addressesById = dbAddresses.reduce((acc, addr) => {
        acc[addr.id] = addr;
        return acc;
    }, {} as Record<string, SelectedDbAddress>);

    // Map the results using the comprehensive mapping function
    const result = dbShipmentsWithDetails.map(data => {
        const shipmentId = data.shipment.id;
        const shipmentPickups = pickupsByShipmentId[shipmentId] ?? [];
        const shipmentDropoffs = dropoffsByShipmentId[shipmentId] ?? [];
        
        const pickupAddresses = shipmentPickups
            .map(p => p.addressId ? addressesById[p.addressId] : null)
            .filter(Boolean) as SelectedDbAddress[];
        const dropoffAddresses = shipmentDropoffs
            .map(d => d.addressId ? addressesById[d.addressId] : null)
            .filter(Boolean) as SelectedDbAddress[];
        
        // Call the main mapping function with all fetched related data
        return mapFullDbDataToApiShipmentDetail(
            data.shipment,
            itemsByShipmentId[shipmentId] ?? [],
            shipmentPickups,
            shipmentDropoffs,
            pickupAddresses, 
            dropoffAddresses, 
            data.customDetails,
            data.trip,
            data.vehicle, 
            data.transporter 
        );
    });

    logger.info(`[Action getShipmentsForDocumentContaining] Successfully fetched ${result.length} shipment details for sourceDocumentId: ${documentId}`);
    return result;

  } catch (error: any) {
    logger.error("[Action getShipmentsForDocumentContaining] Error fetching shipments:", {
      documentId, 
      errorMessage: error.message,
      errorStack: error.stack,
    });
    return null; 
  }
}

/**
 * Server Action: Fetches static details required for initializing live tracking.
 * Conforms strictly to StaticTrackingDetails type.
 * 
 * @param shipmentId - The ID of the shipment to track.
 * @returns A promise resolving to StaticTrackingDetails or null if not found/error.
 */
export async function getStaticTrackingDetails(
    shipmentId: string
): Promise<StaticTrackingDetails | null> {
    if (!shipmentId) {
        logger.warn("[Action getStaticTrackingDetails] Received null or empty shipmentId.");
        return null;
    }

    logger.info(`[Action getStaticTrackingDetails] Fetching static details for shipmentId: ${shipmentId}`);

    try {
        // Fetch required data: shipment ID, primary pickup/dropoff address IDs, custom doc num, trip driver name, transporter name
        const shipmentDataResult = await db
            .select({
                shipmentId: shipmentsErd.id, // Select only ID
                pickupAddressId: pickups.addressId,
                dropoffAddressId: dropoffs.addressId,
                customDocNum: customShipmentDetails.customerDocumentNumber,
                driverNameTrip: trips.driverName,
                transporterName: transporters.name,
            })
            .from(shipmentsErd)
            .leftJoin(pickups, and(eq(shipmentsErd.id, pickups.shipmentId), eq(pickups.pickup_position, 1)))
            .leftJoin(dropoffs, and(eq(shipmentsErd.id, dropoffs.shipmentId), eq(dropoffs.dropoff_position, 1)))
            .leftJoin(customShipmentDetails, eq(shipmentsErd.id, customShipmentDetails.shipmentId))
            .leftJoin(trips, eq(shipmentsErd.tripId, trips.id)) 
            .leftJoin(transporters, eq(trips.materialTransporter, transporters.id)) // VERIFY FK: materialTransporter
            .where(eq(shipmentsErd.id, shipmentId))
            .limit(1);

        if (!shipmentDataResult || shipmentDataResult.length === 0) {
            logger.warn(`[Action getStaticTrackingDetails] Shipment base data not found for id: ${shipmentId}`);
            return null;
        }
        
        const data = shipmentDataResult[0];

        // Fetch addresses separately using the IDs obtained
        const pickupAddrId = data.pickupAddressId;
        const dropoffAddrId = data.dropoffAddressId;
        let pickupAddress: typeof addresses.$inferSelect | null = null;
        let dropoffAddress: typeof addresses.$inferSelect | null = null;

        const addressIdsToFetch = [pickupAddrId, dropoffAddrId].filter(Boolean) as string[];
        if (addressIdsToFetch.length > 0) {
            const addressesResult = await db.select().from(addresses).where(inArray(addresses.id, addressIdsToFetch));
            const addressesMap = addressesResult.reduce((map, addr) => {
                map[addr.id] = addr;
                return map;
            }, {} as Record<string, typeof addresses.$inferSelect>);
            if (pickupAddrId) pickupAddress = addressesMap[pickupAddrId] ?? null;
            if (dropoffAddrId) dropoffAddress = addressesMap[dropoffAddrId] ?? null;
        }

        // TODO: Implement route geometry fetching (keep placeholder)
        const plannedRouteGeometry = null; // Changed let to const (safe as assigned once)
        const originCoordsForRoute = pickupAddress?.latitude && pickupAddress?.longitude
            ? [parseFloat(pickupAddress.longitude), parseFloat(pickupAddress.latitude)] // [lon, lat]
            : null;
        const destCoordsForRoute = dropoffAddress?.latitude && dropoffAddress?.longitude
            ? [parseFloat(dropoffAddress.longitude), parseFloat(dropoffAddress.latitude)] // [lon, lat]
            : null;

        if (originCoordsForRoute && destCoordsForRoute) {
            try {
                // Assuming MapDirectionsService is available and initialized correctly
                // const directionsService = MapDirectionsService.getInstance(); 
                // if (directionsService) {
                //     const routeData = await directionsService.fetchRoute(originCoordsForRoute, destCoordsForRoute);
                //     if (routeData?.routes?.[0]?.geometry) {
                //         plannedRouteGeometry = routeData.routes[0].geometry as LineString;
                //         logger.info(`[Action getStaticTrackingDetails] Fetched route geometry for ${shipmentId}`);
                //     } else {
                //         logger.warn(`[Action getStaticTrackingDetails] Mapbox returned no route for ${shipmentId}`);
                //     }
                // } else {
                //     logger.warn(`[Action getStaticTrackingDetails] MapDirectionsService not available, cannot fetch route.`);
                // }
                 logger.warn(`[Action getStaticTrackingDetails] Route geometry fetching is currently commented out.`);
            } catch (routeError) {
                logger.error(`[Action getStaticTrackingDetails] Error fetching route geometry for ${shipmentId}:`, routeError);
                // plannedRouteGeometry remains null
            }
        }

        const driverName = data.driverNameTrip ?? data.transporterName ?? 'Unknown Driver';

        const details: StaticTrackingDetails = {
            shipmentId: shipmentId, 
            documentId: data.customDocNum ?? 'N/A', 
            originCoords: originCoordsForRoute ? { lat: originCoordsForRoute[1], lon: originCoordsForRoute[0] } : null,
            destinationCoords: destCoordsForRoute ? { lat: destCoordsForRoute[1], lon: destCoordsForRoute[0] } : null,
            originAddress: pickupAddress?.rawInput ?? pickupAddress?.street1 ?? null, 
            destinationAddress: dropoffAddress?.rawInput ?? dropoffAddress?.street1 ?? null, 
            driverName: driverName, 
            plannedRouteGeometry: plannedRouteGeometry, 
        };

        logger.info(`[Action getStaticTrackingDetails] Successfully fetched static details for shipmentId: ${shipmentId}`);
        return details;

    } catch (error: any) {
        logger.error("[Action getStaticTrackingDetails] Error fetching details:", {
            shipmentId,
            errorMessage: error.message,
            errorStack: error.stack,
        });
        return null; // Return null on error
    }
}

/**
 * Server Action to fetch route geometry from Mapbox Directions API.
 *
 * @param origin - Origin coordinates [longitude, latitude]
 * @param destination - Destination coordinates [longitude, latitude]
 * @returns A Promise resolving to the LineString geometry or null on error.
 */
export async function getRouteGeometryAction(
    origin: [number, number],
    destination: [number, number]
): Promise<LineString | null> {
    logger.info(`[Server Action] getRouteGeometryAction called for origin: ${origin}, destination: ${destination}`);
    try {
        // Use singleton instance
        const directionsService = MapDirectionsService.getInstance(); 
        if (!directionsService) {
            logger.error('[Server Action getRouteGeometryAction] MapDirectionsService failed to initialize.');
            return null;
        }
        const routeData = await directionsService.fetchRoute(origin, destination);
        if (routeData?.routes?.[0]?.geometry) {
            logger.info(`[Server Action] Successfully fetched route geometry.`);
            return routeData.routes[0].geometry as LineString;
        }
        logger.warn('[Server Action getRouteGeometryAction] No route geometry found in Mapbox response.');
        return null;
    } catch (error) {
        logger.error('[Server Action getRouteGeometryAction] Error fetching route:', error);
        return null;
    }
}
