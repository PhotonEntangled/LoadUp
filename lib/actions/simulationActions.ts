"use server";

import { db } from '@/lib/database/drizzle';
import { eq, and } from 'drizzle-orm';
import { 
    shipmentsErd, 
    pickups, 
    dropoffs, 
    addresses, 
    customShipmentDetails,
    trips,
    shipmentStatusEnum
} from '@/lib/database/schema';
import type { SimulationInput } from '@/types/simulation';
import { logger } from '@/utils/logger';
import { MapDirectionsService } from '@/services/map/MapDirectionsService';
import type { LineString } from 'geojson';
import { getSimulationFromShipmentServiceInstance } from '@/services/shipment/SimulationFromShipmentService';
import { 
    setSimulationState, 
    addActiveSimulation 
} from '@/services/kv/simulationCacheService';
import type { SimulatedVehicle } from '@/types/vehicles';

// Helper to safely parse decimal string to float, returning undefined on error
// Essential for coordinate and potentially other numeric fields from DB
function safeParseFloat(value: string | null | undefined): number | undefined {
    if (value === null || value === undefined) return undefined;
    // Drizzle might return decimal as number already, but parsing ensures robustness
    if (typeof value === 'number') return !isNaN(value) ? value : undefined; 
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
}

// Helper to validate coordinate pairs
function areCoordinatesValid(coords: [number | undefined, number | undefined] | undefined): coords is [number, number] {
    if (!coords) return false;
    const [lon, lat] = coords;
    if (lon === undefined || lat === undefined) return false;
    // Basic range check - adjust if more specific validation needed
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Fetches shipment data from the database and transforms it into the
 * SimulationInput format required to start a simulation.
 * Performs necessary JOINs and validations following the pattern of fetching
 * core data then related data.
 *
 * @param shipmentId The UUID of the shipment to fetch data for.
 * @returns A Promise resolving to either the SimulationInput object on success,
 *          or an object containing an error message on failure.
 */
export async function getSimulationInputForShipment(
    shipmentId: string
): Promise<SimulationInput | { error: string }> {
    logger.info(`[Server Action] getSimulationInputForShipment called for ID: ${shipmentId}`);

    if (!shipmentId) {
        logger.error("[Server Action] Invalid shipmentId provided.");
        return { error: "Invalid Shipment ID provided." };
    }

    try {
        // 1. Fetch the core shipment record
        const coreShipmentResult = await db
            .select()
            .from(shipmentsErd)
            .where(eq(shipmentsErd.id, shipmentId))
            .limit(1);

        if (!coreShipmentResult || coreShipmentResult.length === 0) {
            logger.warn(`[Server Action] Shipment not found for ID: ${shipmentId}`);
            return { error: `Shipment not found: ${shipmentId}` };
        }
        const coreShipment = coreShipmentResult[0];
        logger.debug("[Server Action] Core shipment fetched:", coreShipment.id);

        // 2. Fetch associated pickup(s) with address (prioritize first if multiple)
        // Assuming relation is pickups.shipment_id -> shipmentsErd.id
        const pickupResult = await db
            .select()
            .from(pickups)
            .leftJoin(addresses, eq(pickups.addressId, addresses.id))
            .where(eq(pickups.shipmentId, shipmentId))
            .orderBy(pickups.pickup_position) // CORRECTED: snake_case based on linter
            .limit(1); 
            
        const originPickup = pickupResult?.[0]?.pickups;
        const originAddress = pickupResult?.[0]?.addresses;

        if (!originPickup || !originAddress) {
            logger.error(`[Server Action] Origin pickup or address data missing for shipment: ${shipmentId}`);
            return { error: "Missing mandatory origin data (Pickup or Address)." };
        }
        logger.debug("[Server Action] Origin pickup/address fetched:", originPickup.id, originAddress.id);

        // Validate Origin Coordinates (Mandatory)
        const originLon = safeParseFloat(originAddress.longitude);
        const originLat = safeParseFloat(originAddress.latitude);
        const originCoordinates: [number | undefined, number | undefined] = [originLon, originLat];

        if (!areCoordinatesValid(originCoordinates)) {
             logger.error(`[Server Action] Invalid origin coordinates for shipment: ${shipmentId}. Lat: ${originLat}, Lon: ${originLon}`);
             return { error: "Invalid or missing origin coordinates." };
        }
        logger.debug("[Server Action] Origin coordinates validated.");

        // 3. Fetch associated dropoff(s) with address (prioritize first if multiple)
         // Assuming relation is dropoffs.shipment_id -> shipmentsErd.id
        const dropoffResult = await db
            .select()
            .from(dropoffs)
            .leftJoin(addresses, eq(dropoffs.addressId, addresses.id))
            .where(eq(dropoffs.shipmentId, shipmentId))
            .orderBy(dropoffs.dropoff_position) // CORRECTED: snake_case based on linter
            .limit(1);

        const destinationDropoff = dropoffResult?.[0]?.dropoffs;
        const destinationAddress = dropoffResult?.[0]?.addresses;
        
        if (!destinationDropoff || !destinationAddress) {
            logger.error(`[Server Action] Destination dropoff or address data missing for shipment: ${shipmentId}`);
            return { error: "Missing mandatory destination data (Dropoff or Address)." };
        }
         logger.debug("[Server Action] Destination dropoff/address fetched:", destinationDropoff.id, destinationAddress.id);


        // Validate Destination Coordinates (Mandatory)
        const destLon = safeParseFloat(destinationAddress.longitude);
        const destLat = safeParseFloat(destinationAddress.latitude);
        const destinationCoordinates: [number | undefined, number | undefined] = [destLon, destLat];
        
        if (!areCoordinatesValid(destinationCoordinates)) {
             logger.error(`[Server Action] Invalid destination coordinates for shipment: ${shipmentId}. Lat: ${destLat}, Lon: ${destLon}`);
             return { error: "Invalid or missing destination coordinates." };
        }
        logger.debug("[Server Action] Destination coordinates validated.");

        // Determine and Validate RDD (Mandatory)
        // Neurotic choice: Prioritize dropoff_date as it seems more aligned with RDD intent based on context.
        const requestedDeliveryDateSource = destinationDropoff.dropoff_date; // CORRECTED: snake_case based on linter 
        if (!requestedDeliveryDateSource) {
             logger.error(`[Server Action] Missing Requested Delivery Date (dropoff_date) for shipment: ${shipmentId}`);
            return { error: "Missing mandatory Requested Delivery Date." };
        }
        // Attempt to create a Date object to ensure it's a valid timestamp
        const requestedDeliveryDate = new Date(requestedDeliveryDateSource);
         if (isNaN(requestedDeliveryDate.getTime())) {
            logger.error(`[Server Action] Invalid Requested Delivery Date format for shipment: ${shipmentId}. Value: ${requestedDeliveryDateSource}`);
             return { error: "Invalid Requested Delivery Date format." };
         }
        logger.debug("[Server Action] RDD validated.");

        // <<< ADD: Fetch Route Geometry >>>
        let routeGeometry: LineString | null = null;
        const directionsService = MapDirectionsService.getInstance();

        if (!directionsService) {
            // Log the error but allow simulation creation without a route for now?
            // OR return an error? Neurotic choice: Return error, as simulation needs route.
            logger.error(`[Server Action] Cannot fetch route for ${shipmentId}: MapDirectionsService failed to initialize (missing token?).`);
            return { error: "Route calculation service unavailable." };
        }

        try {
            const routeData = await directionsService.fetchRoute(
                originCoordinates, // Validated [lon, lat]
                destinationCoordinates // Validated [lon, lat]
            );
            if (routeData && routeData.routes && routeData.routes.length > 0 && routeData.routes[0].geometry) {
                routeGeometry = routeData.routes[0].geometry as LineString;
                 logger.debug(`[Server Action] Successfully fetched route geometry for shipment ${shipmentId}.`);
            } else {
                // Log warning but proceed with null geometry?
                // OR return error? Neurotic choice: Warn and proceed with null.
                // Caller (createVehicleFromShipment) should handle null routeGeometry.
                logger.warn(`[Server Action] Mapbox returned no valid route for shipment ${shipmentId}. Proceeding without route geometry.`);
                // routeGeometry remains null
            }
        } catch (routeError) {
            logger.error(`[Server Action] Error fetching route from Mapbox for shipment ${shipmentId}:`, routeError);
            // Proceed with null geometry after error?
            // Neurotic choice: Warn and proceed with null. Let downstream handle it.
            // routeGeometry remains null
        }
        // <<< END: Fetch Route Geometry >>>

        // 4. Fetch associated custom shipment details (Optional)
        const customDetailsResult = await db
            .select()
            .from(customShipmentDetails)
            .where(eq(customShipmentDetails.shipmentId, shipmentId))
            .limit(1);
        const customDetails = customDetailsResult?.[0];
        logger.debug("[Server Action] Custom details fetched (if available):", customDetails?.id);

        // 5. Fetch associated trip details (for driver/truck info)
        let tripDetails = null;
        if (coreShipment.tripId) {
            const tripResult = await db
                .select()
                .from(trips) // Import 'trips' schema
                .where(eq(trips.id, coreShipment.tripId))
                .limit(1);
            tripDetails = tripResult?.[0];
            logger.debug("[Server Action] Trip details fetched (if available):", tripDetails?.id);
        } else {
            logger.warn(`[Server Action] No tripId found on shipment ${shipmentId}, cannot fetch trip details.`);
        }

        // 6. Construct the SimulationInput object
        // Infer the type for the status enum values
        type ShipmentStatusType = (typeof shipmentStatusEnum.enumValues)[number];

        const simulationInput: SimulationInput = {
            scenarioId: `sim-${shipmentId}`, // Generate scenario ID
            shipmentId: coreShipment.id,
            originCoordinates: originCoordinates, // Already validated as [number, number]
            destinationCoordinates: destinationCoordinates, // Already validated as [number, number]
            requestedDeliveryDate: requestedDeliveryDate, // Validated Date object
            routeGeometry: routeGeometry as (LineString | null), // <<< ADDED: Explicit cast
            initialStatus: coreShipment.status as ShipmentStatusType, // <<< CORRECTED: Use inferred type

            // Optional fields - map carefully, using undefined if source is null/empty
            customerPoNumber: destinationDropoff.customerPoNumbers || undefined, // PO Number from dropoff
            customerShipmentNumber: customDetails?.customerShipmentNumber || undefined, // Customer's shipment# from custom details
            primaryItemDescription: coreShipment.shipmentDescription || undefined, // Core shipment description
            totalWeight: safeParseFloat(originPickup.shipmentWeight) ?? undefined, // Weight from pickup (verify if correct source) // REVERTED: camelCase
            remarks: customDetails?.remarks || undefined, // Remarks from custom details

            // Driver Info (from associated Trip record)
            driverName: tripDetails?.driverName || undefined, // Use camelCase from trips schema
            driverPhone: tripDetails?.driverPhone || undefined, // Use camelCase from trips schema
            driverIc: tripDetails?.driverIcNumber || undefined, // Use camelCase & correct name from trips schema

            // Truck Info (Using truckPlate from associated Trip record)
            // TODO: Confirm this mapping is correct long-term.
            truckId: tripDetails?.truckPlate || undefined, // Use camelCase from trips schema

            // Recipient Info (from dropoff)
            recipientName: destinationDropoff.recipientContactName || undefined, // Use camelCase
            recipientPhone: destinationDropoff.recipientContactPhone || undefined, // Use camelCase

             // Address Strings (from address rawInput)
             originAddressString: originAddress.rawInput || undefined, // Use camelCase
             destinationAddressString: destinationAddress.rawInput || undefined,
        };

        // <<< Removed Marker Comment >>>
        logger.debug(`[Server Action] Returning SimulationInput for ${shipmentId}`, { 
            hasRoute: !!simulationInput.routeGeometry, 
            coordCount: simulationInput.routeGeometry?.coordinates?.length 
        });
        // <<< Removed Marker Comment >>>

        logger.info(`[Server Action] Successfully created SimulationInput for shipment: ${shipmentId}`);
        return simulationInput;

    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred while preparing simulation data.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        logger.error(`[Server Action] Error fetching/transforming data for shipment ${shipmentId}:`, error);
        return { error: `Failed to prepare simulation data: ${errorMessage}` };
    }
}

/**
 * Server Action to initiate a vehicle simulation for a given shipment.
 * Fetches necessary data, creates the initial simulation state, 
 * saves it to KV cache, and marks the simulation as active.
 * 
 * @param shipmentId - The UUID of the shipment to simulate.
 * @returns A Promise resolving to an object with success status and optional message/error.
 */
export async function startSimulation(
    shipmentId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
    logger.info(`[Server Action] startSimulation called for ID: ${shipmentId}`);

    if (!shipmentId) {
        logger.error("[Server Action] Invalid shipmentId provided to startSimulation.");
        return { success: false, error: "Invalid Shipment ID provided." };
    }

    try {
        // 1. Get Simulation Input (includes fetching data and route)
        const simulationInputResult = await getSimulationInputForShipment(shipmentId);

        if ('error' in simulationInputResult) {
            logger.error(`[Server Action] Failed to get simulation input for ${shipmentId}: ${simulationInputResult.error}`);
            return { success: false, error: `Failed to prepare simulation data: ${simulationInputResult.error}` };
        }
        const simulationInput = simulationInputResult;
        logger.debug(`[Server Action] Successfully retrieved simulation input for ${shipmentId}.`);

        // 2. Create Initial Vehicle State using the service
        const simulationService = getSimulationFromShipmentServiceInstance();
        const initialVehicleState: SimulatedVehicle | null = await simulationService.createVehicleFromShipment(simulationInput);
        
        if (initialVehicleState === null) { 
             logger.error(`[Server Action] Failed to create initial vehicle state for ${shipmentId} (service returned null).`);
             return { success: false, error: "Failed to create simulation state (null returned from service)." };
        }
        logger.debug(`[Server Action] Successfully created initial vehicle state for ${shipmentId}. Status: ${initialVehicleState.status}`);
        
        // 3. Save Initial State to KV Cache
        const kvSaveSuccess = await setSimulationState(shipmentId, initialVehicleState);
        if (!kvSaveSuccess) {
            logger.error(`[Server Action] Failed to save initial state to KV for ${shipmentId}.`);
            return { success: false, error: "Failed to save initial simulation state to cache." };
        }
        logger.debug(`[Server Action] Successfully saved initial state to KV for ${shipmentId}.`);

        // 4. Mark Simulation as Active
        const markActiveSuccess = await addActiveSimulation(shipmentId);
        if (!markActiveSuccess) {
            logger.error(`[Server Action] Failed to mark simulation as active in KV for ${shipmentId}.`);
            return { success: false, error: "Failed to mark simulation as active." }; 
        }
         logger.info(`[Server Action] Successfully marked simulation as active for ${shipmentId}.`);

        // 5. Return Success
        return { success: true, message: `Simulation started successfully for ${shipmentId}.` };

    } catch (error: any) {
        logger.error(`[Server Action] Unexpected error during startSimulation for ${shipmentId}: ${error.message}`, { error });
        return { success: false, error: "An unexpected error occurred while starting the simulation." };
    }
} 