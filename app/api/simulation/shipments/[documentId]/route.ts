// Dedicated route for fetching shipments associated with a document for simulation purposes

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/drizzle';
import { 
    shipmentsErd as shipments, 
    items, 
    pickups, 
    dropoffs, 
    addresses,
    customShipmentDetails
} from '@/lib/database/schema';
import { eq, inArray, asc } from 'drizzle-orm';
import { logger } from '@/utils/logger';
import type { 
    ApiShipmentDetail, 
    ApiAddressDetail, 
    ApiShipmentItem, 
    ApiContact, 
    ApiCustomDetails, 
    ApiFinancialInfo, 
    ApiPickupDropoffInfo, 
    ApiShipmentCoreInfo,
    ApiShipmentMetadata,
    ApiStatusUpdate 
} from '@/types/api';

// --- Reusing the mapping function (Ideally move to a shared util) ---
function mapShipmentDataToApi(
    dbShipment: typeof shipments.$inferSelect,
    dbItems: (typeof items.$inferSelect)[],
    dbPickup: (typeof pickups.$inferSelect & { address: typeof addresses.$inferSelect | null }) | null,
    dbDropoff: (typeof dropoffs.$inferSelect & { address: typeof addresses.$inferSelect | null }) | null,
    dbCustomDetails: typeof customShipmentDetails.$inferSelect | null
): ApiShipmentDetail {
    
    const mapAddress = (dbAddress: typeof addresses.$inferSelect | null): ApiAddressDetail | null => {
        if (!dbAddress) return null;
        const addressParts = [dbAddress.street1, dbAddress.street2, dbAddress.city, dbAddress.state, dbAddress.postalCode, dbAddress.country].filter(Boolean);
        const constructedFullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
        const resolutionMethodValue = dbAddress.resolutionMethod as ApiAddressDetail['resolutionMethod'] ?? 'none';

        return {
            id: dbAddress.id,
            rawInput: dbAddress.rawInput ?? null,
            name: null, 
            street: dbAddress.street1 ?? null,
            city: dbAddress.city ?? null,
            stateProvince: dbAddress.state ?? null,
            postalCode: dbAddress.postalCode ?? null,
            country: dbAddress.country ?? null,
            fullAddress: constructedFullAddress, 
            latitude: dbAddress.latitude ? parseFloat(dbAddress.latitude) : null, 
            longitude: dbAddress.longitude ? parseFloat(dbAddress.longitude) : null, 
            resolutionMethod: resolutionMethodValue,
            resolutionConfidence: dbAddress.resolutionConfidence ? parseFloat(dbAddress.resolutionConfidence) : null,
            resolvedTimestamp: null, 
        };
    };

    const coreDocumentId = dbShipment.sourceDocumentId;
    if (!coreDocumentId) {
        logger.error(`[API Map Error] Shipment ${dbShipment.id} is missing sourceDocumentId.`);
    }

    // Helper to safely parse decimal string to float, returning undefined on error
    // ADDED from main shipments API
    function safeParseFloat(value: string | null | undefined): number | undefined {
        if (value === null || value === undefined) return undefined;
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num;
    }

    const coreInfo: ApiShipmentCoreInfo = {
        id: dbShipment.id,
        documentId: coreDocumentId ?? 'MISSING_DOC_ID',
        // --- CORRECTED Load Number Logic --- 
        // Prioritize from custom details, fallback to shipment record (like main API)
        loadNumber: dbCustomDetails?.customerShipmentNumber || null,
        orderNumber: dbCustomDetails?.customerDocumentNumber || dbShipment.shipmentDocumentNumber || null,
        poNumber: dbDropoff?.customerPoNumbers ?? null,
        status: dbShipment.status ?? 'UNKNOWN',
        totalWeight: null,
        totalWeightUnit: null,
        totalVolume: null,
        totalVolumeUnit: null,
        totalItems: dbItems.length,
        promisedShipDate: null,
        plannedDeliveryDate: dbDropoff?.dropoff_date?.toISOString() ?? null,
        actualPickupArrival: dbPickup?.actualDateTimeOfArrival?.toISOString() ?? null,
        actualPickupDeparture: dbPickup?.actualDateTimeOfDeparture?.toISOString() ?? null,
        actualDeliveryArrival: dbDropoff?.actualDateTimeOfArrival?.toISOString() ?? null,
        actualDeliveryDeparture: dbDropoff?.actualDateTimeOfDeparture?.toISOString() ?? null,
        // --- ADDED Missing Fields ---
        lastKnownLatitude: dbShipment.lastKnownLatitude ? parseFloat(dbShipment.lastKnownLatitude) : null,
        lastKnownLongitude: dbShipment.lastKnownLongitude ? parseFloat(dbShipment.lastKnownLongitude) : null,
        lastKnownTimestamp: dbShipment.lastKnownTimestamp?.toISOString() ?? null,
        lastKnownBearing: safeParseFloat(dbShipment.lastKnownBearing) ?? null
    };

    const originAddress: ApiAddressDetail | null = mapAddress(dbPickup?.address ?? null);
    const destinationAddress: ApiAddressDetail | null = mapAddress(dbDropoff?.address ?? null);

    const itemsMapped: ApiShipmentItem[] = dbItems.map(item => ({
        id: item.id,
        itemNumber: item.itemNumber ?? null,
        secondaryItemNumber: item.secondaryItemNumber ?? null,
        description: item.description ?? null,
        quantity: item.quantity ? parseFloat(item.quantity) : null, 
        sku: null, 
        weight: item.weight ? parseFloat(item.weight) : null, 
        weightUnit: item.weight ? 'kg' : null, 
        dimensions: null, 
        hsCode: null, 
        lotSerialNumber: item.lotSerialNumber ?? null,
        uom: null, 
        bin: null, 
    }));

    const shipper: ApiContact | null = null;
    const recipient: ApiContact | null = dbDropoff ? {
        id: undefined,
        contactName: dbDropoff.recipientContactName ?? null, 
        contactNumber: dbDropoff.recipientContactPhone ?? null, 
        contactEmail: null 
    } : null;
    const customDetails: ApiCustomDetails | null = dbCustomDetails ? {
        transporter: { // Placeholder - matching main API's placeholder
            carrierName: null, truckId: null, trailerId: null, driverName: null,
            driverCell: null, mcNumber: null, dotNumber: null,
        },
        tripRate: { // Mimic main API's mapping
            rate: safeParseFloat(dbCustomDetails.tripRate) ?? null,
            currency: 'MYR', // Placeholder like main API
            dropCharge: safeParseFloat(dbCustomDetails.dropCharge) ?? null,
            manpowerCharge: safeParseFloat(dbCustomDetails.manpowerCharge) ?? null, 
            fuelSurcharge: null, // Placeholder like main API
            detentionRate: null, // Placeholder like main API
            detentionCurrency: null, // Placeholder like main API
            otherCharges: [], // Placeholder like main API
        },
        billingInfo: { // Placeholder like main API
            billToAddressId: null, paymentTerms: null, 
        },
        totalCharge: safeParseFloat(dbCustomDetails.totalCharge) ?? null
    } : null;
    const metadata: ApiShipmentMetadata = {
        createdAt: dbShipment.shipmentDateCreated?.toISOString() ?? new Date().toISOString(), 
        updatedAt: dbShipment.shipmentDateModified?.toISOString() ?? new Date().toISOString(), 
        sourceFilename: null, 
        dataSource: null, 
        remarks: null 
    };
    const locationDetails: { pickups: ApiPickupDropoffInfo[]; dropoffs: ApiPickupDropoffInfo[]; } = {
        pickups: dbPickup ? [{
            locationType: 'Pickup',
            sequence: dbPickup.pickup_position ?? 1, 
            locationName: 'Pickup Location',
            address: originAddress,
            contact: null, 
            scheduledDateTimeUTC: dbPickup.pickup_date?.toISOString() ?? null, 
            actualDateTimeUTC: dbPickup.actualDateTimeOfArrival?.toISOString() ?? null, 
            notes: '', 
            resolutionStatus: 'Pending', 
            driverInstructions: '' 
        }] : [],
        dropoffs: dbDropoff ? [{
            locationType: 'Dropoff',
            sequence: dbDropoff.dropoff_position ?? 1, 
            locationName: 'Dropoff Location',
            address: destinationAddress,
            contact: recipient, 
            scheduledDateTimeUTC: dbDropoff.dropoff_date?.toISOString() ?? null, 
            actualDateTimeUTC: dbDropoff.actualDateTimeOfArrival?.toISOString() ?? null, 
            notes: '', 
            resolutionStatus: 'Pending', 
            driverInstructions: '' 
        }] : [],
    };
    const contacts: { primaryShipperContact: ApiContact | null; primaryConsigneeContact: ApiContact | null; primaryBillToContact: ApiContact | null; otherContacts: ApiContact[]; } = {
        primaryShipperContact: null, 
        primaryConsigneeContact: recipient,
        primaryBillToContact: null, 
        otherContacts: [] 
    };
    const financials: ApiFinancialInfo | null = null; 
    const tripAndCarrier: { carrierName: string | null; driverName: string | null; driverCell: string | null; driverIc: string | null; truckId: string | null; trailerId: string | null; modeOfTransport: string | null; estimatedTravelTimeHours: number | null; actualDistanceKm: number | null; } = {
        carrierName: null, 
        driverName: null, 
        driverCell: null,
        driverIc: null, 
        truckId: null,
        trailerId: null, 
        modeOfTransport: null, 
        estimatedTravelTimeHours: null, 
        actualDistanceKm: null 
    };
    const statusUpdates: ApiStatusUpdate[] = []; 

    // logger.warn("[API mapShipmentDataToApi] Mapping uses extensive placeholders and assumes single pickup/dropoff per shipment. Needs refinement.");
    return {
        coreInfo,
        originAddress,
        destinationAddress,
        shipper, 
        recipient,
        items: itemsMapped,
        customDetails, 
        metadata,
        locationDetails,
        contacts,
        financials: financials!, 
        tripAndCarrier,
        statusUpdates,
    };
}

/**
 * GET /api/simulation/shipments/[documentId]
 * Get all shipments associated with a specific document ID, specifically for the simulation page.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { documentId: string } } 
) {
    const { documentId } = params; // Use documentId from params

    if (!documentId) {
        return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    logger.info(`[API /sim/shipments GET] Fetching shipments for documentId: ${documentId}`);

    try {
        // Fetch core shipment data
        try {
            const shipmentRecords = await db.select()
                .from(shipments)
                .where(eq(shipments.sourceDocumentId, documentId))
                .orderBy(shipments.shipmentDocumentNumber);

            if (!shipmentRecords || shipmentRecords.length === 0) {
                logger.warn(`[API /sim/shipments GET] No shipments found for documentId: ${documentId}`);
                return NextResponse.json([], { status: 200 });
            }

            logger.debug(`[API /sim/shipments GET] Found ${shipmentRecords.length} shipment records.`);

            // --- REVISED: Fetch related data for ALL shipments efficiently ---
            const shipmentIds = shipmentRecords.map(s => s.id);

            if (shipmentIds.length === 0) {
                // This should not happen if shipmentRecords is not empty, but good safety check
                logger.warn(`[API /sim/shipments GET] Extracted zero shipment IDs from records.`);
                 return NextResponse.json([], { status: 200 });
            }

            // Note: We now fetch all related data together AFTER getting all core shipments
             const [relatedPickups, relatedDropoffs, relatedItems, relatedCustomDetails] = await Promise.all([
                 db.query.pickups.findMany({
                     where: inArray(pickups.shipmentId, shipmentIds),
                     with: { address: true },
                     orderBy: [asc(pickups.shipmentId), asc(pickups.pickup_position)] // Order for predictable first pickup
                 }),
                 db.query.dropoffs.findMany({
                     where: inArray(dropoffs.shipmentId, shipmentIds),
                     with: { address: true },
                     orderBy: [asc(dropoffs.shipmentId), asc(dropoffs.dropoff_position)] // Order for predictable first dropoff
                 }),
                 db.query.items.findMany({
                     where: inArray(items.shipmentId, shipmentIds)
                 }),
                 db.query.customShipmentDetails.findMany({
                     where: inArray(customShipmentDetails.shipmentId, shipmentIds)
                 })
             ]);

             // --- Organize related data into maps for efficient lookup ---
             const pickupsMap = relatedPickups.reduce((map, p) => {
                 if (p.shipmentId) { 
                     if (!map.has(p.shipmentId)) map.set(p.shipmentId, []);
                     map.get(p.shipmentId)!.push(p);
                 }
                 return map;
             }, new Map<string, (typeof pickups.$inferSelect & { address: typeof addresses.$inferSelect | null })[]>());

             const dropoffsMap = relatedDropoffs.reduce((map, d) => {
                 if (d.shipmentId) {
                     if (!map.has(d.shipmentId)) map.set(d.shipmentId, []);
                     map.get(d.shipmentId)!.push(d);
                 }
                 return map;
             }, new Map<string, (typeof dropoffs.$inferSelect & { address: typeof addresses.$inferSelect | null })[]>());

             const itemsMap = relatedItems.reduce((map, i) => {
                 if (i.shipmentId) {
                     if (!map.has(i.shipmentId)) map.set(i.shipmentId, []);
                     map.get(i.shipmentId)!.push(i);
                 }
                 return map;
             }, new Map<string, (typeof items.$inferSelect)[]>());

             const customDetailsMap = relatedCustomDetails.reduce((map, cd) => {
                 if (cd.shipmentId) {
                    map.set(cd.shipmentId, cd);
                 }
                 return map;
             }, new Map<string, typeof customShipmentDetails.$inferSelect>());

            // Map each core shipment record using the prepared maps
            const apiShipments: ApiShipmentDetail[] = shipmentRecords.map(shipment => {
                 const shipmentPickups = pickupsMap.get(shipment.id) || [];
                 const shipmentDropoffs = dropoffsMap.get(shipment.id) || [];
                 const shipmentItems = itemsMap.get(shipment.id) || [];
                 const shipmentCustomDetails = customDetailsMap.get(shipment.id) || null;
                 
                 return mapShipmentDataToApi(
                     shipment, // Pass the core shipment record (includes bearing now)
                     shipmentItems,
                     shipmentPickups[0] || null, // Pass the primary pickup (first in sorted list)
                     shipmentDropoffs[0] || null, // Pass the primary dropoff (first in sorted list)
                     shipmentCustomDetails
                 );
             });

            logger.info(`[API /sim/shipments GET] Successfully fetched and mapped ${apiShipments.length} shipments for documentId: ${documentId}`);
            return NextResponse.json(apiShipments);
        } catch (error) {
            // Handle database column errors specifically
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
                logger.warn(`[API /sim/shipments GET] Database schema issue: ${errorMessage}`);
                logger.warn("[API /sim/shipments GET] Continuing with a fallback empty response");
                return NextResponse.json([], { status: 200 });
            }
            
            // Re-throw for other errors
            throw error;
        }
    } catch (error: any) {
        logger.error(`[API /sim/shipments GET] Error fetching shipments for document ${documentId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch shipments', details: error.message },
            { status: 500 }
        );
    }
}

// Add OPTIONS method for CORS preflight if needed
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 