import { kv } from "@vercel/kv";
import { SimulatedVehicle } from "@/types/vehicles";
import { logger } from "@/utils/logger";

const SIMULATION_KEY_PREFIX = "simulation:state:";
const ACTIVE_SIMULATIONS_KEY = "simulations:active"; // Key for the Set of active IDs

/**
 * Retrieves the cached simulation state for a given shipment ID.
 * @param shipmentId - The ID of the shipment.
 * @returns A promise that resolves to the SimulatedVehicle state or null if not found or an error occurs.
 */
export const getSimulationState = async (shipmentId: string): Promise<SimulatedVehicle | null> => {
    const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
    try {
        logger.debug(`KV: Attempting to get state for key: ${key}`);
        const state = await kv.get<SimulatedVehicle>(key);
        if (!state) {
            logger.debug(`KV: No state found for key: ${key}`);
            return null;
        }
        logger.debug(`KV: Successfully retrieved state for key: ${key}`);
        // Basic validation - could be enhanced
        if (typeof state !== 'object' || state === null || !state.id) {
            logger.error(`KV: Retrieved invalid state data for key: ${key}`, { stateData: state });
            return null;
        }
        return state;
    } catch (error) {
        logger.error(`KV: Error getting simulation state for key ${key}`, { error });
        return null;
    }
};

/**
 * Sets the cached simulation state for a given shipment ID.
 * @param shipmentId - The ID of the shipment.
 * @param state - The SimulatedVehicle state to cache.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const setSimulationState = async (shipmentId: string, state: SimulatedVehicle): Promise<boolean> => {
    const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
    try {
        logger.debug(`KV: Attempting to set state for key: ${key}`, { stateData: state });
        // Consider adding expiry (ex option) if needed for transient data
        const result = await kv.set(key, state);
        if (result === "OK") {
            logger.debug(`KV: Successfully set state for key: ${key}`);
            return true;
        } else {
            logger.warn(`KV: Set operation did not return OK for key: ${key}`, { result });
            return false; // Or throw an error depending on required strictness
        }
    } catch (error) {
        logger.error(`KV: Error setting simulation state for key ${key}`, { error });
        return false;
    }
};

/**
 * Adds a shipment ID to the set of active simulations in KV.
 * @param shipmentId - The ID of the shipment simulation to mark as active.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const addActiveSimulation = async (shipmentId: string): Promise<boolean> => {
    try {
        logger.debug(`KV: Adding active simulation ID: ${shipmentId}`);
        const result = await kv.sadd(ACTIVE_SIMULATIONS_KEY, shipmentId);
        // sadd returns the number of elements added (1 if new, 0 if already exists)
        logger.debug(`KV: sadd result for ${shipmentId}: ${result}`);
        return result >= 0; // Consider success if added or already present
    } catch (error) {
        logger.error(`KV: Error adding active simulation ID ${shipmentId}`, { error });
        return false;
    }
};

/**
 * Removes a shipment ID from the set of active simulations in KV.
 * Typically called when a simulation completes or is explicitly stopped.
 * @param shipmentId - The ID of the shipment simulation to mark as inactive.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const removeActiveSimulation = async (shipmentId: string): Promise<boolean> => {
    try {
        logger.debug(`KV: Removing active simulation ID: ${shipmentId}`);
        const result = await kv.srem(ACTIVE_SIMULATIONS_KEY, shipmentId);
        // srem returns the number of elements removed (1 if removed, 0 if not found)
         logger.debug(`KV: srem result for ${shipmentId}: ${result}`);
        return result >= 0; // Consider success if removed or not found
    } catch (error) {
        logger.error(`KV: Error removing active simulation ID ${shipmentId}`, { error });
        return false;
    }
};

/**
 * Retrieves all shipment IDs from the set of active simulations in KV.
 * @returns A promise that resolves to an array of active shipment IDs, or an empty array on error.
 */
export const getActiveSimulations = async (): Promise<string[]> => {
    try {
        logger.debug(`KV: Getting all active simulation IDs from key: ${ACTIVE_SIMULATIONS_KEY}`);
        const activeIds = await kv.smembers(ACTIVE_SIMULATIONS_KEY);
        logger.debug(`KV: Found ${activeIds.length} active simulation IDs.`);
        return activeIds;
    } catch (error) {
        logger.error(`KV: Error getting active simulation IDs`, { error });
        return []; // Return empty array on error to prevent downstream failures
    }
}; 