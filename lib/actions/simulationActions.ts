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
    addActiveSimulation, 
    getSimulationState
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

        logger.info(`[Server Action] Successfully prepared SimulationInput for shipment ${shipmentId}.`);
        return simulationInput;

    } catch (error) {
        logger.error(`[Server Action] CRITICAL ERROR in getSimulationInputForShipment for ID ${shipmentId}:`, error);
         const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while preparing simulation data.";
         return { error: errorMessage };
    }
}

// --- NEW SERVER ACTION: startSimulation ---
/**
 * Creates the initial simulation state, saves it to KV cache keyed by shipmentId,
 * and registers the simulation as active, *unless* an active simulation already exists.
 *
 * @param simulationInput The prepared input data for the simulation.
 * @returns Promise indicating success or failure.
 */
export async function startSimulation(
    simulationInput: SimulationInput
): Promise<{ success: boolean; message?: string; error?: string }> {
    const { shipmentId } = simulationInput;
    logger.info(`[Server Action startSimulation] INVOKED for shipment: ${shipmentId}`);

    if (!shipmentId) {
        logger.error("[Server Action startSimulation] Failed: simulationInput is missing shipmentId.");
        return { success: false, error: "Invalid input: Missing Shipment ID." };
    }

    try {
        // --- CHECK IF ALREADY ACTIVE using getSimulationState ---
        const existingState = await getSimulationState(shipmentId);
        if (existingState) { // If state exists, it's active
            logger.warn(`[Server Action startSimulation] SKIPPED: Simulation state for shipment ${shipmentId} already exists in KV.`);
            // Return success, but indicate it was skipped because it's running
            return { success: true, message: `Simulation for ${shipmentId} is already running.` };
        }
        logger.debug(`[Server Action startSimulation] No existing simulation state found for ${shipmentId}. Proceeding to create.`);
        // --- END CHECK ---

        // 1. Create the initial SimulatedVehicle state
        const simService = getSimulationFromShipmentServiceInstance();
        const initialVehicleState = await simService.createVehicleFromShipment(simulationInput);

        if (!initialVehicleState) {
            logger.error(`[Server Action startSimulation] Failed: SimulationFromShipmentService returned null for shipment ${shipmentId}.`);
            return { success: false, error: "Failed to create initial vehicle state." };
        }
        logger.debug(`[Server Action startSimulation] Initial vehicle state created for ${shipmentId}. Vehicle ID: ${initialVehicleState.id}`);

        // 2. Save the initial state to KV cache using shipmentId as the key
        logger.debug(`[Server Action startSimulation] Attempting to save initial state to KV for key (shipmentId): ${shipmentId}`);
        const setStateSuccess = await setSimulationState(shipmentId, initialVehicleState);

        if (!setStateSuccess) {
            logger.error(`[Server Action startSimulation] Failed: Could not save initial state to KV cache for shipment ${shipmentId}.`);
            return { success: false, error: "Failed to save initial simulation state to cache." };
        }
        logger.info(`[Server Action startSimulation] Successfully saved initial state to KV for shipment ${shipmentId}.`);

        // 3. Add the shipmentId to the list of active simulations
        logger.debug(`[Server Action startSimulation] Attempting to register shipment ${shipmentId} as active.`);
        const addActiveSuccess = await addActiveSimulation(shipmentId);

        if (!addActiveSuccess) {
            // Log error but maybe don't fail the whole process? 
            // The simulation state IS saved, but enqueue might miss it initially.
            // Neurotic choice: Return success with a warning message.
            logger.warn(`[Server Action startSimulation] WARNING: Failed to add shipment ${shipmentId} to the active simulation list in KV. Enqueue process might be delayed.`);
            return { success: true, message: `Simulation for ${shipmentId} started, but activation registration failed. Tracking might be delayed.` };
        }
        logger.info(`[Server Action startSimulation] Successfully registered shipment ${shipmentId} as active.`);

        return { success: true, message: `Simulation initiated successfully for ${shipmentId}.` };

    } catch (error) {
        logger.error(`[Server Action startSimulation] CRITICAL ERROR starting simulation for ${shipmentId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while starting the simulation.";
        return { success: false, error: errorMessage };
    }
}
// --- END NEW SERVER ACTION --- 