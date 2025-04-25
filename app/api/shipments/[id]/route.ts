import { NextRequest, NextResponse } from 'next/server';
// import { ShipmentService } from '@loadup/database/services/shipmentService';
// import { auth } from '@/lib/auth'; // Keep if auth is needed later
import { z } from 'zod';

// --- ADDED IMPORTS --- 
import { db } from '@/lib/database/drizzle';
import { eq } from 'drizzle-orm';
import {
    shipmentsErd, 
    pickups, 
    dropoffs, 
    addresses, 
    customShipmentDetails,
    trips
    // Removed: shipmentItems, // Not found in schema
    // Removed: organizations // Not found in schema
} from '@/lib/database/schema';
import { logger } from '@/utils/logger';
// Removed: import { mapShipmentDataToApiDetail } from '@/utils/dataMapping/shipmentToApiMapper'; // Mapper doesn't exist yet
import type { ApiShipmentDetail, ApiAddressDetail } from '@/types/api'; // Import the expected return type AND ApiAddressDetail
// --- END ADDED IMPORTS --- 

// Initialize shipment service - Removed mock/old service
// const shipmentService = new ShipmentService();

// Schema for updating a shipment - Keep if PATCH uses it
const updateShipmentSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED']).optional(),
  driverId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().optional(),
  location: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

// --- ADDED HELPER FUNCTION ---
// Type guard to validate resolutionMethod against the allowed enum values
const VALID_RESOLUTION_METHODS: ReadonlySet<NonNullable<ApiAddressDetail['resolutionMethod']>> = new Set([
  'direct', 'geocode', 'manual', 'failed', 'partial', 'none'
]);

function isValidResolutionMethod(method: string | null): method is NonNullable<ApiAddressDetail['resolutionMethod']> {
  return method !== null && VALID_RESOLUTION_METHODS.has(method as any); // Cast needed as Set expects the specific types
}
// --- END ADDED HELPER FUNCTION ---

/**
 * GET /api/shipments/[id]
 * Get a specific shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shipmentId = params.id;
  logger.info(`[API /shipments/${shipmentId} GET] Request received.`);

  if (!shipmentId) {
    logger.warn(`[API /shipments/...] GET Invalid request: Missing shipment ID.`);
    return NextResponse.json({ error: 'Missing shipment ID' }, { status: 400 });
  }

  try {
    // --- Fetch the core shipment --- 
    logger.info(`[API /shipments/${shipmentId} GET] Fetching core shipment...`);
    const coreShipmentResult = await db
        .select({
            // Select core fields using correct schema names
            id: shipmentsErd.id,
            sourceDocumentId: shipmentsErd.sourceDocumentId,
            status: shipmentsErd.status,
            shipmentDateCreated: shipmentsErd.shipmentDateCreated,
            shipmentDateModified: shipmentsErd.shipmentDateModified,
            lastKnownLatitude: shipmentsErd.lastKnownLatitude,
            lastKnownLongitude: shipmentsErd.lastKnownLongitude,
            lastKnownTimestamp: shipmentsErd.lastKnownTimestamp, // Corrected name
            tripId: shipmentsErd.tripId,
            // pickupId: shipmentsErd.pickupId, // Not needed directly if fetching pickups separately
            // dropoffId: shipmentsErd.dropoffId, // Not needed directly if fetching dropoffs separately
            shipmentDescription: shipmentsErd.shipmentDescription, // Keep for mapping
            isActive: shipmentsErd.isActive // Keep if needed
            // Missing: loadNumber, bolNumber, poNumber, organizationId - likely in related tables
        })
        .from(shipmentsErd)
        .where(eq(shipmentsErd.id, shipmentId))
        .limit(1);

    if (!coreShipmentResult || coreShipmentResult.length === 0) {
      logger.warn(`[API /shipments/${shipmentId} GET] Shipment not found.`);
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    const coreShipment = coreShipmentResult[0];
    logger.debug(`[API /shipments/${shipmentId} GET] Core shipment fetched.`);

    // --- Fetch ALL related data concurrently for efficiency --- 
    logger.debug(`[API /shipments/${shipmentId} GET] Fetching related data...`);
    const [pickupData, dropoffData, customData, tripData] = await Promise.all([
        // Pickup(s) + Address
        db.select().from(pickups).leftJoin(addresses, eq(pickups.addressId, addresses.id)).where(eq(pickups.shipmentId, shipmentId)).orderBy(pickups.pickup_position),
        // Dropoff(s) + Address
        db.select().from(dropoffs).leftJoin(addresses, eq(dropoffs.addressId, addresses.id)).where(eq(dropoffs.shipmentId, shipmentId)).orderBy(dropoffs.dropoff_position),
        // Custom Details
        db.select().from(customShipmentDetails).where(eq(customShipmentDetails.shipmentId, shipmentId)).limit(1),
        // Trip (if linked)
        coreShipment.tripId ? db.select().from(trips).where(eq(trips.id, coreShipment.tripId)).limit(1) : Promise.resolve([]),
        // Removed items/orgs fetch as imports were removed
    ]);
    logger.debug(`[API /shipments/${shipmentId} GET] Fetched related data.`);

    // --- Map to API Structure (Inline Mapping - Corrected) --- 
    logger.debug(`[API /shipments/${shipmentId} GET] Mapping data...`);
    const originInfo = pickupData?.[0]; 
    const destinationInfo = dropoffData?.[0];
    const customDetails = customData?.[0];
    const tripDetails = tripData?.[0];

    // Helper to safely convert Date or null to ISO string or null
    const toISOStringOrNull = (date: Date | null | undefined): string | null => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return null;
        }
        try {
            return date.toISOString();
        } catch (e) {
            logger.warn("Failed to convert date to ISO string:", date, e);
            return null;
        }
    };
    
    // Helper to safely convert decimal string or null to number or null
    const toFloatOrNull = (value: string | null | undefined): number | null => {
        if (value === null || value === undefined) return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    };

    // --- Check for null sourceDocumentId and log warning ---
    if (coreShipment.sourceDocumentId === null) {
        logger.warn(`[API /shipments/${shipmentId} GET] Core shipment record has a null sourceDocumentId. Mapping to empty string.`);
    }
    // --- End Check ---

    const apiShipmentDetail: ApiShipmentDetail = {
        coreInfo: {
            id: coreShipment.id,
            documentId: coreShipment.sourceDocumentId ?? '', // Use empty string if null to satisfy string type
            status: coreShipment.status,
            loadNumber: customDetails?.sovyJobNo ?? null,
            poNumber: destinationInfo?.dropoffs?.customerPoNumbers ?? null,
            plannedDeliveryDate: toISOStringOrNull(destinationInfo?.dropoffs?.dropoff_date) ?? toISOStringOrNull(coreShipment.shipmentDateCreated) ?? new Date(0).toISOString(),
            lastKnownLatitude: toFloatOrNull(coreShipment.lastKnownLatitude),
            lastKnownLongitude: toFloatOrNull(coreShipment.lastKnownLongitude),
            lastKnownTimestamp: toISOStringOrNull(coreShipment.lastKnownTimestamp), // CORRECTED Field Name
        },
        originAddress: originInfo?.addresses ? {
            id: originInfo.addresses.id,
            fullAddress: originInfo.addresses.rawInput ?? null,
            street: originInfo.addresses.street1 ?? null,
            city: originInfo.addresses.city ?? null,
            stateProvince: originInfo.addresses.state ?? null,
            postalCode: originInfo.addresses.postalCode ?? null,
            latitude: toFloatOrNull(originInfo.addresses.latitude),
            longitude: toFloatOrNull(originInfo.addresses.longitude),
            rawInput: originInfo.addresses.rawInput ?? null,
            name: originInfo.addresses.rawInput ?? 'Origin Address',
            country: originInfo.addresses.country ?? null,
            resolutionMethod: isValidResolutionMethod(originInfo.addresses.resolutionMethod) ? originInfo.addresses.resolutionMethod : null, // VALIDATED resolutionMethod
            resolutionConfidence: toFloatOrNull(originInfo.addresses.resolutionConfidence),
            resolvedTimestamp: null // Assuming this is not available directly or needs separate logic
        } : null,
        destinationAddress: destinationInfo?.addresses ? {
            id: destinationInfo.addresses.id,
             fullAddress: destinationInfo.addresses.rawInput ?? null,
            street: destinationInfo.addresses.street1 ?? null,
            city: destinationInfo.addresses.city ?? null,
            stateProvince: destinationInfo.addresses.state ?? null,
            postalCode: destinationInfo.addresses.postalCode ?? null,
            latitude: toFloatOrNull(destinationInfo.addresses.latitude),
            longitude: toFloatOrNull(destinationInfo.addresses.longitude),
            rawInput: destinationInfo.addresses.rawInput ?? null,
            name: destinationInfo.addresses.rawInput ?? 'Destination Address',
            country: destinationInfo.addresses.country ?? null,
            resolutionMethod: isValidResolutionMethod(destinationInfo.addresses.resolutionMethod) ? destinationInfo.addresses.resolutionMethod : null, // VALIDATED resolutionMethod
            resolutionConfidence: toFloatOrNull(destinationInfo.addresses.resolutionConfidence),
            resolvedTimestamp: null // Assuming this is not available directly or needs separate logic
        } : null,
        pickupDetails: {
            actualPickupTime: toISOStringOrNull(originInfo?.pickups?.actualDateTimeOfArrival),
            pickupInstructions: null, 
            scheduledPickupTime: toISOStringOrNull(originInfo?.pickups?.pickup_date),
        },
        dropoffDetails: {
            actualDeliveryTime: toISOStringOrNull(destinationInfo?.dropoffs?.actualDateTimeOfArrival),
            deliveryInstructions: null, 
            recipientContactName: destinationInfo?.dropoffs?.recipientContactName ?? null,
            recipientContactPhone: destinationInfo?.dropoffs?.recipientContactPhone ?? null,
            scheduledDeliveryTime: toISOStringOrNull(destinationInfo?.dropoffs?.dropoff_date),
        },
        customDetails: customDetails ? {
            
        } : null,
        tripInfo: tripDetails ? {
            driverName: tripDetails.driverName ?? null,
            driverPhone: tripDetails.driverPhone ?? null,
            truckPlate: tripDetails.truckPlate ?? null,
            driverIc: tripDetails.driverIcNumber ?? null,
        } : null,
        items: [], 
        history: [],
        metadata: {
             createdAt: toISOStringOrNull(coreShipment.shipmentDateCreated) ?? new Date(0).toISOString(), // Use fallback if null
             updatedAt: toISOStringOrNull(coreShipment.shipmentDateModified) ?? new Date(0).toISOString(), // Use fallback if null
             sourceFilename: null, // Placeholder - needs data source
             dataSource: null, // Placeholder - needs data source
             remarks: customDetails?.remarks ?? null, // Example mapping from customDetails
        },
        locationDetails: { pickups: [], dropoffs: [] }, // Placeholder
        contacts: { primaryShipperContact: null, primaryConsigneeContact: null, primaryBillToContact: null, otherContacts: [] }, // Placeholder
        financials: { totalCharges: 0, currency: 'USD', invoiceNumber: '', paymentTerms: '', rateDetails: [], billingAddress: null, taxInformation: { taxId: '', taxAmount: 0 } }, // Placeholder
        tripAndCarrier: { carrierName: null, driverName: null, driverCell: null, driverIc: null, truckId: null, trailerId: null, modeOfTransport: null, estimatedTravelTimeHours: null, actualDistanceKm: null }, // Placeholder
        statusUpdates: [] // Placeholder
    };

    if (!apiShipmentDetail) { // Should not happen with inline mapping unless core fails
        logger.error(`[API /shipments/${shipmentId} GET] Failed to map database data to API structure.`);
        return NextResponse.json({ error: 'Internal server error mapping data' }, { status: 500 });
    }

    logger.info(`[API /shipments/${shipmentId} GET] Successfully fetched and mapped shipment details.`);
    return NextResponse.json(apiShipmentDetail); // Return the single mapped object

  } catch (error) {
    // --- REAL ERROR HANDLING --- 
    logger.error(`[API /shipments/${shipmentId} GET] Error fetching shipment:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to fetch shipment: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/shipments/[id]
 * Update a shipment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Mock implementation
    const mockUpdatedShipment = {
      id,
      trackingNumber: `TRK-${id}`,
      status: body.status || "in_transit",
      origin: body.origin || {
        address: "123 Pickup St",
        city: "Origin City",
        state: "CA",
        zipCode: "90001",
        country: "USA"
      },
      destination: body.destination || {
        address: "456 Delivery Ave",
        city: "Destination City",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      customer: {
        id: "cust1",
        name: "Acme Corp",
        email: "contact@acmecorp.com",
        phone: "555-1234"
      },
      driver: body.driverId ? {
        id: body.driverId,
        name: "New Driver",
        phone: "555-9876",
        vehicle: "Van XL"
      } : {
        id: "driver1",
        name: "John Driver",
        phone: "555-5678",
        vehicle: "Truck XL"
      },
      items: [
        {
          id: "item1",
          description: "Furniture",
          quantity: 3,
          weight: 150,
          dimensions: "4x3x2"
        },
        {
          id: "item2",
          description: "Electronics",
          quantity: 5,
          weight: 75,
          dimensions: "2x2x1"
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: body.estimatedDelivery || new Date(Date.now() + 86400000 * 2).toISOString()
    };
    
    return NextResponse.json({ shipment: mockUpdatedShipment });
  } catch (error) {
    console.error(`Error updating shipment ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Mock implementation
    const mockDeletedShipment = {
      id: params.id,
      success: true,
      message: "Shipment deleted successfully"
    };
    
    return NextResponse.json(mockDeletedShipment);
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
} 