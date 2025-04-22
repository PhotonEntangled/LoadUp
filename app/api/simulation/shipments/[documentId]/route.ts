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
            // Should not happen if shipmentRecords > 0, but good practice
            return NextResponse.json([], { status: 200 }); 
        }

        const [itemsData, pickupsData, dropoffsData, customDetailsData] = await Promise.all([
            // Fetch Items for all relevant shipments
            db.select().from(items).where(inArray(items.shipmentId, shipmentIds)),
            // Fetch Pickups + Addresses for all relevant shipments, ordered by position
            db.select().from(pickups)
              .leftJoin(addresses, eq(pickups.addressId, addresses.id))
              .where(inArray(pickups.shipmentId, shipmentIds))
              .orderBy(pickups.shipmentId, asc(pickups.pickup_position)), // Order for easy grouping
            // Fetch Dropoffs + Addresses for all relevant shipments, ordered by position
            db.select().from(dropoffs)
              .leftJoin(addresses, eq(dropoffs.addressId, addresses.id))
              .where(inArray(dropoffs.shipmentId, shipmentIds))
              .orderBy(dropoffs.shipmentId, asc(dropoffs.dropoff_position)), // Order for easy grouping
            // Fetch Custom Details for all relevant shipments (NEWLY ADDED)
            db.select().from(customShipmentDetails).where(inArray(customShipmentDetails.shipmentId, shipmentIds))
        ]);

        // --- Organize fetched data into Maps for efficient lookup --- 
        const itemsMap = new Map<string, (typeof items.$inferSelect)[]>();
        itemsData.forEach(item => {
            const list = itemsMap.get(item.shipmentId) || [];
            list.push(item);
            itemsMap.set(item.shipmentId, list);
        });

        const pickupsMap = new Map<string, (typeof pickups.$inferSelect & { address: typeof addresses.$inferSelect | null })[]>();
        pickupsData.forEach(p => {
            const pickupRecord = { ...p.pickups, address: p.addresses };
            const list = pickupsMap.get(pickupRecord.shipmentId) || [];
            list.push(pickupRecord);
            pickupsMap.set(pickupRecord.shipmentId, list);
        });

        const dropoffsMap = new Map<string, (typeof dropoffs.$inferSelect & { address: typeof addresses.$inferSelect | null })[]>();
        dropoffsData.forEach(d => {
            const dropoffRecord = { ...d.dropoffs, address: d.addresses };
            const list = dropoffsMap.get(dropoffRecord.shipmentId) || [];
            list.push(dropoffRecord);
            dropoffsMap.set(dropoffRecord.shipmentId, list);
        });
        
        const customDetailsMap = new Map<string, typeof customShipmentDetails.$inferSelect>();
        customDetailsData.forEach(detail => {
             if (detail.shipmentId) { // Ensure shipmentId is not null
                 customDetailsMap.set(detail.shipmentId, detail);
             }
        });

        // --- Map results --- 
        const results: ApiShipmentDetail[] = shipmentRecords.map(shipmentRecord => {
            const relatedItems = itemsMap.get(shipmentRecord.id) || [];
            const relatedPickup = (pickupsMap.get(shipmentRecord.id) || [])[0] || null; // Get first pickup
            const relatedDropoff = (dropoffsMap.get(shipmentRecord.id) || [])[0] || null; // Get first dropoff
            const relatedCustomDetails = customDetailsMap.get(shipmentRecord.id) || null; // Get custom details
            
            // Call mapping function with all necessary data
            return mapShipmentDataToApi(
                shipmentRecord, 
                relatedItems, 
                relatedPickup, 
                relatedDropoff,
                relatedCustomDetails // Pass custom details
            );
        });

        logger.info(`[API /sim/shipments GET] Successfully fetched and mapped ${results.length} shipments.`);
        return NextResponse.json(results);

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