import { kv } from "@vercel/kv";
import { SimulatedVehicle } from "@/types/vehicles";
import { logger } from "@/utils/logger";

const SIMULATION_KEY_PREFIX = "simulation:state:";
const ACTIVE_SIMULATIONS_KEY = "simulations:active"; // Standardized key for the Set
const LOG_PREFIX = "[KV Service]";

export const simulationCacheService = {
    /**
     * Retrieves the cached simulation state for a given shipment ID.
     * @param shipmentId - The ID of the shipment.
     * @returns A promise that resolves to the SimulatedVehicle state or null if not found.
     * @throws Throws an error if the KV operation fails.
     */
    async getSimulationState(
        shipmentId: string
    ): Promise<SimulatedVehicle | null> {
        const funcId = `${LOG_PREFIX} getSimulationState`;
        const shortId = shipmentId.substring(0, 4);
        const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
        logger.debug(`${funcId}(${shortId}) - Attempting kv.get for key: ${key}`);
        try {
            // kv.get returns null if key doesn't exist or on error during parsing (if data is invalid JSON)
            const state = await kv.get<SimulatedVehicle>(key);
            if (!state) {
                logger.debug(`${funcId}(${shortId}) - No state found for key: ${key}`);
                return null;
            }
            // Basic validation
            if (typeof state !== 'object' || !state.id) {
                 logger.error(`${funcId}(${shortId}) - Retrieved invalid state data for key: ${key}`, { stateData: state });
                 // Treat invalid data as not found
                 await this.deleteSimulationState(shipmentId); // Clean up invalid state
                 await this.setActiveSimulation(shipmentId, false); // Ensure inactive
                 return null;
            }
            logger.debug(`${funcId}(${shortId}) - Successfully retrieved state for key: ${key}`);
            return state;
        } catch (error) {
            logger.error(`${funcId}(${shortId}) - Error getting simulation state for key ${key}:`, error);
            throw new Error(`KV Error getting state for ${shortId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

    /**
     * Sets the cached simulation state for a given shipment ID.
     * @param shipmentId - The ID of the shipment.
     * @param state - The SimulatedVehicle state to cache.
     * @returns A promise that resolves to true if successful.
     * @throws Throws an error if the KV operation fails.
     */
    async setSimulationState(
        shipmentId: string,
        state: SimulatedVehicle
    ): Promise<boolean> {
        const funcId = `${LOG_PREFIX} setSimulationState`;
        const shortId = shipmentId.substring(0, 4);
        const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
        logger.debug(`${funcId}(${shortId}) - Attempting kv.set for key: ${key}`, { status: state.status });
        try {
            const result = await kv.set(key, JSON.stringify(state)); // Ensure state is stringified
            logger.debug(`${funcId}(${shortId}) - KV set result: ${result}`);
            if (result !== 'OK') {
                 throw new Error(`KV set failed for key ${key}, result: ${result}`);
            }
            logger.info(`${funcId}(${shortId}) - Successfully set state for key: ${key}`);
            return true;
        } catch (error) {
            logger.error(`${funcId}(${shortId}) - Error setting simulation state for key ${key}:`, error);
            throw new Error(`KV Error setting state for ${shortId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

     /**
     * Updates specific fields of the cached simulation state.
     * Fetches existing state, merges updates, and saves back.
     * Ensures lastUpdateTime is always updated.
     * @param shipmentId - The ID of the shipment.
     * @param updates - An object containing fields to update.
     * @returns A promise that resolves to true if successful.
     * @throws Throws an error if fetch, merge, or save fails.
     */
    async updateSimulationState(
        shipmentId: string,
        updates: Partial<SimulatedVehicle>
    ): Promise<boolean> {
        const funcId = `${LOG_PREFIX} updateSimulationState`;
        const shortId = shipmentId.substring(0, 4);
        const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
        logger.debug(`${funcId}(${shortId}) - Attempting fetch and update for key: ${key}`, { updates });
        try {
            // Fetch existing state - use internal method to handle potential errors/nulls
            const existingState = await this.getSimulationState(shipmentId);
            if (!existingState) {
                 logger.warn(`${funcId}(${shortId}) - No existing state found for key ${key}. Cannot update.`);
                 // Optionally: could try to set a new state if appropriate
                 throw new Error(`Cannot update non-existent state for key ${key}`);
            }

            // Merge updates - ensure lastUpdateTime is always fresh
            const newState = { 
                ...existingState, 
                ...updates, 
                lastUpdateTime: Date.now() // Use timestamp number
            };
            logger.debug(`${funcId}(${shortId}) - Merged state for key: ${key}`, { newStateStatus: newState.status });

            // Set the updated state using internal method
            return await this.setSimulationState(shipmentId, newState);

        } catch (error) {
            // Errors from get/setSimulationState are already logged
            logger.error(`${funcId}(${shortId}) - Error during update process for key ${key}:`, error);
            // Re-throw a more specific error
            throw new Error(`KV Error updating state for ${shortId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

     /**
     * Deletes the state of a simulated vehicle from KV.
     * @param shipmentId The ID of the shipment.
     * @returns Promise<boolean> - True if deletion was successful (key deleted or didn't exist).
     * @throws Throws an error if the KV operation fails unexpectedly.
     */
    async deleteSimulationState(shipmentId: string): Promise<boolean> {
        const funcId = `${LOG_PREFIX} deleteSimulationState`;
        const shortId = shipmentId.substring(0, 4);
        const key = `${SIMULATION_KEY_PREFIX}${shipmentId}`;
        logger.debug(`${funcId}(${shortId}) - Attempting kv.del for key: ${key}`);
        try {
            const result = await kv.del(key);
            // kv.del returns the number of keys deleted (0 or 1)
            logger.info(`${funcId}(${shortId}) - Successfully deleted state (or key did not exist). KV del result: ${result}`);
            return true; // Consider deletion successful if result is 0 or 1
        } catch (error) {
            logger.error(`${funcId}(${shortId}) - Error deleting simulation state for key ${key}:`, error);
            throw new Error(`KV Error deleting state for ${shortId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

    /**
     * Retrieves all shipment IDs from the set of active simulations in KV.
     * @returns A promise that resolves to an array of active shipment IDs.
     * @throws Throws an error if the KV operation fails.
     */
    async getActiveSimulations(): Promise<string[]> {
        const funcId = `${LOG_PREFIX} getActiveSimulations`;
        logger.debug(`${funcId} - Attempting kv.smembers for key: ${ACTIVE_SIMULATIONS_KEY}`);
        try {
            const members = await kv.smembers(ACTIVE_SIMULATIONS_KEY);
            logger.debug(`${funcId} - Found ${members?.length ?? 0} active simulation IDs.`);
            return members ?? []; // Return empty array if null/undefined or key non-existent
        } catch (error) {
            logger.error(`${funcId} - Error getting active simulations from KV:`, error);
            throw new Error(`KV Error getting active simulations: ${error instanceof Error ? error.message : String(error)}`);
        }
    },

     /**
     * Adds or removes a shipment ID from the set of active simulations in KV.
     * @param shipmentId - The ID of the shipment simulation.
     * @param isActive - True to add to the set, false to remove.
     * @returns A promise that resolves to true if the operation was logically successful.
     * @throws Throws an error if the KV operation fails.
     */
    async setActiveSimulation(
        shipmentId: string,
        isActive: boolean
    ): Promise<boolean> {
        const funcId = `${LOG_PREFIX} setActiveSimulation`;
        const shortId = shipmentId.substring(0, 4);
        logger.debug(`${funcId}(${shortId}) - Called with isActive: ${isActive}`);
        try {
            if (isActive) {
                logger.debug(`${funcId}(${shortId}) - Attempting kv.sadd for key: ${ACTIVE_SIMULATIONS_KEY}, member: ${shipmentId}`);
                const result = await kv.sadd(ACTIVE_SIMULATIONS_KEY, shipmentId);
                // sadd returns number of elements added (0 if already present, 1 if new)
                logger.info(`${funcId}(${shortId}) - Result of kv.sadd: ${result} (Success if >= 0)`);
                return true; // Treat adding (even if already present) as success
            } else {
                logger.debug(`${funcId}(${shortId}) - Attempting kv.srem for key: ${ACTIVE_SIMULATIONS_KEY}, member: ${shipmentId}`);
                const result = await kv.srem(ACTIVE_SIMULATIONS_KEY, shipmentId);
                // srem returns number of elements removed (0 if not present, 1 if removed)
                logger.info(`${funcId}(${shortId}) - Result of kv.srem: ${result} (Success if >= 0)`);
                return true; // Treat removing (even if not found) as success in this context
            }
        } catch (error) {
            logger.error(`${funcId}(${shortId}) - Error updating active set (isActive=${isActive}) in KV:`, error);
            throw new Error(`KV Error updating active set for ${shortId}: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
}; 