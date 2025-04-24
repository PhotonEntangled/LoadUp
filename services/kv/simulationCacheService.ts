import { kv } from "@vercel/kv";
import { SimulatedVehicle } from "@/types/vehicles";
import { logger } from "@/utils/logger";

const SIMULATION_KEY_PREFIX = "simulation:state:";
const ACTIVE_SIMULATIONS_KEY = "simulations:active"; // Key for the Set of active IDs
const ACTIVE_SIM_LIST_KEY = "active_simulations";
const LOG_PREFIX = "[KV Service]";

/**
 * Retrieves the cached simulation state for a given shipment ID.
 * @param shipmentId - The ID of the shipment.
 * @returns A promise that resolves to the SimulatedVehicle state or null if not found or an error occurs.
 */
export const getSimulationState = async (shipmentId: string): Promise<SimulatedVehicle | null> => {
    const funcId = `${LOG_PREFIX} getSimulationState`;
    const shortId = shipmentId.substring(0, 4);
    const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
    logger.debug(`${funcId}(${shortId}) - Attempting to get state for key: ${key}`);
    try {
        const state = await kv.get<SimulatedVehicle>(key);
        if (!state) {
            logger.debug(`${funcId}(${shortId}) - No state found for key: ${key}`);
            return null;
        }
        logger.debug(`${funcId}(${shortId}) - Successfully retrieved state for key: ${key}`);
        // Basic validation - could be enhanced
        if (typeof state !== 'object' || state === null || !state.id) {
            logger.error(`${funcId}(${shortId}) - Retrieved invalid state data for key: ${key}`, { stateData: state });
            return null;
        }
        return state;
    } catch (error) {
        logger.error(`${funcId}(${shortId}) - Error getting simulation state for key ${key}:`, error);
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
    const funcId = `${LOG_PREFIX} setSimulationState`;
    const shortId = shipmentId.substring(0, 4);
    const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
    logger.debug(`${funcId}(${shortId}) - Attempting to set state for key: ${key}`, { status: state.status });
    try {
        // Consider adding expiry (ex option) if needed for transient data
        // const result = await kv.set(key, JSON.stringify(state), { ex: 3600 }); // Example: 1 hour TTL
        const result = await kv.set(key, JSON.stringify(state));
        logger.debug(`${funcId}(${shortId}) - Successfully set state. KV set result: ${result}`);
        return result === 'OK';
    } catch (error) {
        logger.error(`${funcId}(${shortId}) - Error setting simulation state for key ${key}:`, error);
        return false;
    }
};

/**
 * Adds a shipment ID to the set of active simulations in KV.
 * @param shipmentId - The ID of the shipment simulation to mark as active.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const addActiveSimulation = async (shipmentId: string): Promise<boolean> => {
    const funcId = `${LOG_PREFIX} addActiveSimulation`;
    const shortId = shipmentId.substring(0, 4);
    logger.debug(`${funcId}(${shortId}) - Attempting to add to set: ${ACTIVE_SIM_LIST_KEY}`);
    try {
        const result = await kv.sadd(ACTIVE_SIM_LIST_KEY, shipmentId);
        logger.info(`${funcId}(${shortId}) - Successfully added ID. KV sadd result: ${result}`);
        return result >= 0; // sadd returns the number of elements added (1 if new, 0 if already exists)
    } catch (error) {
        logger.error(`${funcId}(${shortId}) - Error adding active simulation ID:`, error);
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
    const funcId = `${LOG_PREFIX} removeActiveSimulation`;
    const shortId = shipmentId.substring(0, 4);
    logger.debug(`${funcId}(${shortId}) - Attempting to remove from set: ${ACTIVE_SIM_LIST_KEY}`);
    try {
        const result = await kv.srem(ACTIVE_SIM_LIST_KEY, shipmentId);
        logger.info(`${funcId}(${shortId}) - Successfully removed ID. KV srem result: ${result}`);
        return result > 0; // srem returns the number of elements removed (1 if removed, 0 if not found)
    } catch (error) {
        logger.error(`${funcId}(${shortId}) - Error removing active simulation ID:`, error);
        return false;
    }
};

/**
 * Retrieves all shipment IDs from the set of active simulations in KV.
 * @returns A promise that resolves to an array of active shipment IDs, or an empty array on error.
 */
export const getActiveSimulations = async (): Promise<string[]> => {
    const funcId = `${LOG_PREFIX} getActiveSimulations`;
    try {
        logger.debug(`${funcId} - Getting all active simulation IDs from key: ${ACTIVE_SIMULATIONS_KEY}`);
        const activeIds = await kv.smembers(ACTIVE_SIMULATIONS_KEY);
        logger.debug(`${funcId} - Found ${activeIds.length} active simulation IDs.`);
        return activeIds;
    } catch (error) {
        logger.error(`${funcId} - Error getting active simulation IDs:`, error);
        return []; // Return empty array on error to prevent downstream failures
    }
};

/**
 * Retrieves the list of active simulation IDs from KV.
 * @returns Promise<string[] | null> - Array of shipment IDs or null on error.
 */
export async function getActiveSimulationIds(): Promise<string[] | null> {
    const funcId = `${LOG_PREFIX} getActiveSimulationIds`;
    logger.debug(`${funcId} - Attempting to get list from key: ${ACTIVE_SIM_LIST_KEY}`);
    try {
        const activeIds = await kv.smembers(ACTIVE_SIM_LIST_KEY);
        logger.debug(`${funcId} - Successfully retrieved ${activeIds?.length ?? 0} IDs.`);
        return activeIds || []; // Return empty array if null/undefined
    } catch (error) {
        logger.error(`${funcId} - Error retrieving active simulation IDs:`, error);
        return null;
    }
}

/**
 * Deletes the state of a simulated vehicle from KV.
 * **Use with caution!** Ensure this is called at the appropriate time.
 * @param shipmentId The ID of the shipment.
 * @returns Promise<boolean> - True if deletion was successful or key didn't exist, false on error.
 */
export async function deleteSimulationState(shipmentId: string): Promise<boolean> {
    const funcId = `${LOG_PREFIX} deleteSimulationState`;
    const shortId = shipmentId.substring(0, 4);
    const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
    logger.debug(`${funcId}(${shortId}) - Attempting to DELETE KV key: ${key}`);
    try {
        const result = await kv.del(key);
        logger.info(`${funcId}(${shortId}) - Successfully deleted state. KV del result: ${result}`);
        return result >= 0; // del returns number of keys deleted (0 or 1)
    } catch (error) {
        logger.error(`${funcId}(${shortId}) - Error deleting simulation state for key ${key}:`, error);
        return false;
    }
} 