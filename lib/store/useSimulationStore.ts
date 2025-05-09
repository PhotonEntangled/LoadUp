import { create, StoreApi } from 'zustand';
import { SimulatedVehicle, VehicleStatus } from '@/types/vehicles'; // Adjust path as needed
import { logger } from '../../utils/logger'; // Adjusted path
import { calculateNewPosition } from '../../utils/simulation/simulationUtils'; // Import the new utility
import type { SimulationInput } from '@/types/simulation'; // <<< ADD: Import SimulationInput type
import { getSimulationFromShipmentServiceInstance } from '@/services/shipment/SimulationFromShipmentService'; // <<< FIX: Import the getter function, not the class directly
import { stopSimulation as stopSimulationServerAction } from "@/lib/actions/simulationActions"; // Import the server action
import { confirmShipmentDelivery } from '@/lib/actions/simulationActions'; // Import the server action

// Define the state structure for the simulation store
export interface SimulationState {
  /** Record of all active simulated vehicles, keyed by their simulation ID */
  vehicles: Record<string, SimulatedVehicle>;
  /** The ID of the currently selected vehicle for detailed view/focus */
  selectedVehicleId: string | null;
  /** Flag indicating if the global simulation loop is running */
  isSimulationRunning: boolean;
  /** Multiplier for simulation speed (e.g., 1, 2, 5, 10) */
  simulationSpeedMultiplier: number;
  simulationIntervalId: NodeJS.Timeout | null; // To store the interval ID
  isFollowingVehicle: boolean; // <<< ADDED: Flag for follow mode
  isInitialized: boolean; // <<< ADDED: Flag to track client-side store readiness
  /** 
   * Tracks the timestamp of the frontend tick that triggered the last backend update request via the tick worker for each vehicle.
   * Used for potential throttling or debugging, not necessarily the actual DB update time.
   */
  lastDbUpdateTime: Record<string, number>; // <<< ADDED: Track last DB update time per vehicle. CLARIFIED COMMENT.
  loadingState: Record<string, boolean>; // <<< ADDED: Track loading state for actions (keyed by action/vehicle ID)
  errorState: Record<string, string | null>; // <<< ADDED: Track error state for actions (keyed by action/vehicle ID)
}

// Define the actions available to modify the simulation state
export interface SimulationActions {
  /** Removes a vehicle from the store by its ID */
  removeVehicle: (vehicleId: string) => void;
  /** Updates specific fields of an existing vehicle */
  updateVehicleState: (vehicleId: string, updates: Partial<SimulatedVehicle>) => void;
  /** Sets the currently selected vehicle ID */
  setSelectedVehicleId: (vehicleId: string | null) => void;
  /** Starts the global simulation loop */
  startGlobalSimulation: () => void;
  /** Stops the global simulation loop */
  stopGlobalSimulation: () => void;
  /** Sets the simulation speed multiplier */
  setSimulationSpeed: (speed: number) => void;
  /** Resets the store to its initial state */
  resetStore: () => void;
  tickSimulation: () => void; // Action to advance simulation by one step
  /** Sets the selected vehicle status to 'En Route' */
  confirmPickup: (vehicleId: string) => void;
  /** Sets the vehicle status to Completed after delivery */
  confirmDelivery: (vehicleId: string) => Promise<void>;
  toggleFollowVehicle: () => void; // <<< ADDED: Action to toggle follow mode
  /** Directly sets/updates a vehicle state and selects it, usually from server data */
  setVehicleFromServer: (vehicleData: SimulatedVehicle) => void; // <<< NEW ACTION
  /** Clears a specific error state */
  clearActionError: (actionKey: string) => void;
  /** Loads simulation state from a SimulationInput object */
  loadSimulationFromInput: (input: SimulationInput) => Promise<void>; // <<< ADDED MISSING ACTION
}

// Define the combined type for the store API
export type SimulationStoreApi = SimulationState & SimulationActions;

// Define the initial state
export const initialSimulationState: SimulationState = {
  vehicles: {},
  selectedVehicleId: null,
  isSimulationRunning: false,
  simulationSpeedMultiplier: 1,
  simulationIntervalId: null, // Initialize interval ID as null
  isFollowingVehicle: false, // <<< ADDED: Initialize follow mode to false
  isInitialized: false, // <<< ADDED: Initialize as false
  lastDbUpdateTime: {}, // <<< ADDED: Initialize DB update tracker
  loadingState: {}, // <<< ADDED: Initialize loading state tracker
  errorState: {}, // <<< ADDED: Initialize error state map
};

// Interval duration in milliseconds
const SIMULATION_INTERVAL_MS = 1000 / 30; // Aim for ~30 FPS updates

// Export a function that creates the store
export const createSimulationStore = () => {
  logger.info(`[createSimulationStore] Creating new simulation store instance`);
  return create<SimulationStoreApi>((set, get) => ({
    ...initialSimulationState, // <<< Use the exported initial state

    // Actions Implementation
    removeVehicle: (vehicleId) => {
      logger.debug('Removing vehicle from store', { vehicleId });
      set((state) => {
        const { [vehicleId]: _, ...remainingVehicles } = state.vehicles;
        const newLoadingState = { ...state.loadingState };
        delete newLoadingState[`confirm_${vehicleId}`];
        delete newLoadingState[`stop_${vehicleId}`];
        delete newLoadingState[`setVehicle_${vehicleId}`];
        const newErrorState = { ...state.errorState };
        delete newErrorState[`confirm_${vehicleId}`];
        delete newErrorState[`stop_${vehicleId}`];
        delete newErrorState[`setVehicle_${vehicleId}`];
        const newLastDbUpdateTime = { ...state.lastDbUpdateTime };
        delete newLastDbUpdateTime[vehicleId];

        return {
          vehicles: remainingVehicles,
          // Deselect if the removed vehicle was selected
          selectedVehicleId: state.selectedVehicleId === vehicleId ? null : state.selectedVehicleId,
          lastDbUpdateTime: newLastDbUpdateTime,
          loadingState: newLoadingState,
          errorState: newErrorState,
        };
      });
    },

    updateVehicleState: (vehicleId, updates) => {
      // Minimal logging here as this might be called frequently in the simulation loop
      set((state) => {
        const vehicleToUpdate = state.vehicles[vehicleId];
        if (!vehicleToUpdate) {
          logger.warn('Attempted to update non-existent vehicle', { vehicleId });
          return {}; // No change
        }
        return {
          vehicles: {
            ...state.vehicles,
            [vehicleId]: { ...vehicleToUpdate, ...updates, lastUpdateTime: Date.now() },
          },
        };
      });
    },

    setSelectedVehicleId: (vehicleId) => {
      logger.debug('Setting selected vehicle ID', { vehicleId });
      set({ selectedVehicleId: vehicleId });
    },

    confirmPickup: (vehicleId) => {
      const { vehicles } = get();
      const vehicle = vehicles[vehicleId];
      if (vehicle && vehicle.status === 'Idle') { // Only confirm if Idle
        logger.info(`Confirming pickup for vehicle ${vehicleId}`);
        set((state) => ({
          vehicles: {
            ...state.vehicles,
            [vehicleId]: {
              ...state.vehicles[vehicleId],
              status: 'En Route',
              traveledDistance: 0,
              lastUpdateTime: Date.now(),
            },
          },
        }));
        logger.info(`[Store Action] Pickup confirmed for ${vehicleId}, attempting to start global simulation.`);
        get().startGlobalSimulation();
      } else {
        logger.warn(`confirmPickup called for vehicle ${vehicleId} but status was not 'Idle' or vehicle not found`, { currentStatus: vehicle?.status });
      }
    },

    confirmDelivery: async (vehicleId: string) => {
      const vehicle = get().vehicles[vehicleId];
      const actionKey = `confirm_${vehicleId}`;
      logger.info(`[Store] confirmDelivery action called for vehicle: ${vehicleId}`);

      if (!vehicle || vehicle.status !== 'Pending Delivery Confirmation') {
        logger.warn(`[Store] confirmDelivery: Vehicle not found or not in correct state: ${vehicleId}`, { status: vehicle?.status });
        set(state => ({ errorState: { ...(state.errorState || {}), [actionKey]: 'Vehicle not in Pending Delivery Confirmation state.' }}));
        return;
      }

      const originalStatus = vehicle.status;

      // Optimistic UI update
      set((state: SimulationState) => ({
        vehicles: {
          ...state.vehicles,
          [vehicleId]: {
            ...state.vehicles[vehicleId],
            status: 'Completed',
            lastUpdateTime: Date.now(),
          },
        },
        loadingState: { ...(state.loadingState || {}), [actionKey]: true },
        errorState: { ...(state.errorState || {}), [actionKey]: null },
      }));
      logger.debug(`[Store] Optimistically updated vehicle ${vehicleId} status to Completed.`);

      // Call Server Action
      try {
        const shipmentId = vehicle.shipmentId;
        if (!shipmentId) {
          throw new Error(`Cannot confirm delivery for vehicle ${vehicleId}: Missing shipmentId.`);
        }

        logger.info(`[Store] Calling confirmShipmentDelivery Server Action for shipment: ${shipmentId}`);
        const result = await confirmShipmentDelivery(shipmentId);

        if (!result.success) {
          throw new Error(result.error || 'Server action failed to confirm delivery.');
        }

        logger.info(`[Store] Server Action confirmShipmentDelivery successful for shipment ${shipmentId}.`);
        set((state: SimulationState) => ({
          loadingState: { ...(state.loadingState || {}), [actionKey]: false },
        }));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`[Store] Error during confirmDelivery for vehicle ${vehicleId}: ${errorMessage}`, error);
        set((state: SimulationState) => ({
          vehicles: {
            ...state.vehicles,
            [vehicleId]: {
              ...state.vehicles[vehicleId],
              status: originalStatus,
            },
          },
          errorState: { ...(state.errorState || {}), [actionKey]: `Failed to confirm delivery: ${errorMessage}` },
          loadingState: { ...(state.loadingState || {}), [actionKey]: false },
        }));
      }
    },

    tickSimulation: () => {
      logger.debug('[Tick] ------ START tickSimulation ------'); // <<< ADDED: Entry Log
      const { vehicles, simulationSpeedMultiplier, isSimulationRunning, updateVehicleState, lastDbUpdateTime } = get();
      
      logger.debug(`[Tick] current isSimulationRunning state: ${isSimulationRunning}`);
      if (!isSimulationRunning) return;

      const timeNow = Date.now();
      const vehiclesToUpdate: { [key: string]: Partial<SimulatedVehicle> } = {};
      let criticalErrorOccurred = false;
      let vehiclesProcessed = 0;

      Object.values(vehicles).forEach((vehicle) => {
        if (vehicle.status !== 'En Route') {
            if (vehicle.status === 'AWAITING_STATUS') {
              // Explicitly do nothing for vehicles awaiting status
            } else if (vehicle.status !== 'Idle' && vehicle.status !== 'Pending Delivery Confirmation' && vehicle.status !== 'Completed' && vehicle.status !== 'Error') {
                logger.debug(`[Tick] Skipping vehicle ${vehicle.id}, status is ${vehicle.status}`);
            }
            return; // Skip this vehicle
        }

            vehiclesProcessed++;
            const timeDeltaSeconds = (timeNow - vehicle.lastUpdateTime) / 1000;
            if (timeDeltaSeconds <= 0) {
              logger.warn(`[Tick] Skipping vehicle ${vehicle.id}, timeDelta <= 0`, { timeDeltaSeconds });
              return;
            }
            
            let newPositionData: Pick<SimulatedVehicle, 'currentPosition' | 'bearing' | 'traveledDistance'> | null = null;
            try {
              newPositionData = calculateNewPosition(
                vehicle,
                timeDeltaSeconds,
                simulationSpeedMultiplier
              );
            } catch (calcError) {
              logger.error('Critical error during calculateNewPosition:', calcError, { vehicleId: vehicle.id });
              newPositionData = null;
              criticalErrorOccurred = true;
              vehiclesToUpdate[vehicle.id] = { status: 'Error', lastUpdateTime: timeNow };
              // No need to set global error here, handled after loop
              return;
            }

            if (newPositionData) {
              let newStatus: VehicleStatus = vehicle.status;
              if (newPositionData.traveledDistance >= vehicle.routeDistance) {
                  newStatus = 'Pending Delivery Confirmation';
                  logger.info(`Vehicle ${vehicle.id} reached destination, pending confirmation.`);
              newPositionData.traveledDistance = vehicle.routeDistance; // Cap distance
              }
              vehiclesToUpdate[vehicle.id] = {
                  ...(vehiclesToUpdate[vehicle.id] || {}),
                  ...newPositionData,
              status: vehiclesToUpdate[vehicle.id]?.status || newStatus, // Preserve error status if already set
                  lastUpdateTime: timeNow,
              };

              // --- CORRECTED: Send Tick Payload to Worker --- 
              // Get necessary parameters from store state
              const { simulationSpeedMultiplier } = get(); 
              // Ensure timeDelta is calculated (assuming it's available from the outer scope of tickSimulation)
              // const timeDelta = timeNow - lastTickTime; // Example: Make sure this is correctly scoped

              // CONSTRUCT THE CORRECT PAYLOAD for the tick-worker
              const tickWorkerPayload = {
                shipmentId: vehicle.shipmentId, // Use the correct shipment ID associated with the vehicle
                timeDelta: timeDeltaSeconds, // Pass the calculated time difference
                speedMultiplier: simulationSpeedMultiplier // Get from store
              };

              logger.debug(`[Tick] Sending payload to /api/simulation/tick-worker for ${vehicle.shipmentId}:`, tickWorkerPayload);
              
              fetch('/api/simulation/tick-worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tickWorkerPayload), // SEND THE CORRECT PAYLOAD
              })
              .then(response => {
                if (!response.ok) {
                  // Log an error but don't crash the frontend simulation
                  logger.error(`[Tick] Backend API call failed for ${vehicle.id}`, { status: response.status, statusText: response.statusText });
                      }
                    })
              .catch(error => {
                logger.error(`[Tick] Network error during backend API call for ${vehicle.id}`, { error });
                    });

              // Update the last DB update time locally
                  set(state => ({
                      lastDbUpdateTime: { ...state.lastDbUpdateTime, [vehicle.id]: timeNow }
                  }));
        } else if (!vehiclesToUpdate[vehicle.id]) { // Only warn if not already marked for Error status update
                logger.warn(`[Tick] calculateNewPosition returned null for ${vehicle.id}`);
        }
      });

      // Batch update vehicle states
      if (Object.keys(vehiclesToUpdate).length > 0) {
          set((state) => ({
              vehicles: {
                  ...state.vehicles,
                  ...Object.entries(vehiclesToUpdate).reduce((acc, [id, updates]) => {
                      if (state.vehicles[id]) {
                         acc[id] = { ...state.vehicles[id], ...updates };
                      } else {
                         logger.warn('Attempting to update a vehicle not currently in state during batch update', { id });
                      }
                      return acc;
                  }, {} as Record<string, SimulatedVehicle>)
              }
          }));
      }
      
      if (criticalErrorOccurred) {
          logger.error('Stopping simulation due to critical error during tick calculation.');
          get().stopGlobalSimulation();
          set(state => ({
              errorState: { ...(state.errorState || {}), tickError: 'Simulation stopped due to a critical error during position calculation.' }
          }));
      }

      // Check if all active vehicles have completed or errored
      if (isSimulationRunning && vehiclesProcessed > 0) {
        const remainingActive = Object.values(get().vehicles).some(v => v.status === 'En Route');
        if (!remainingActive) {
           logger.info('[Tick] No more vehicles \'En Route\'. Stopping global simulation.');
           get().stopGlobalSimulation();
        }
      }
      logger.debug('[Tick] ------ END tickSimulation ------'); // <<< ADDED: Exit Log
    },

    startGlobalSimulation: () => {
      const { isSimulationRunning, simulationIntervalId, tickSimulation } = get();
      logger.info('[Store] ###### START startGlobalSimulation ######', { currentState: isSimulationRunning }); // <<< ADDED: Entry Log
      if (!isSimulationRunning) {
          if (simulationIntervalId) {
              logger.warn('[Store] Simulation interval ID existed while simulation was not running. Clearing.');
              clearInterval(simulationIntervalId);
          }
          logger.info(`[Store] Setting up new simulation interval (${SIMULATION_INTERVAL_MS}ms)...`);
          const newIntervalId = setInterval(tickSimulation, SIMULATION_INTERVAL_MS);
          logger.info(`[Store] Interval created with ID: ${newIntervalId}. Setting isSimulationRunning = true.`);
          set({ isSimulationRunning: true, simulationIntervalId: newIntervalId }); 
      } else {
          logger.warn('[Store] startGlobalSimulation called but simulation is already running.');
      }
      logger.info('[Store] ###### END startGlobalSimulation ######'); // <<< ADDED: Exit Log
    },

    stopGlobalSimulation: () => {
      const { isSimulationRunning, simulationIntervalId, selectedVehicleId, updateVehicleState } = get(); // Get updateVehicleState action
      logger.info('[Store] stopGlobalSimulation action called.', { currentState: isSimulationRunning, selectedId: selectedVehicleId });
      
      // --- Stop local interval FIRST ---
      if (isSimulationRunning) {
        if (simulationIntervalId) {
          logger.info(`[Store] Clearing simulation interval ID: ${simulationIntervalId}`);
          clearInterval(simulationIntervalId);
        } else {
          logger.warn('[Store] Simulation was running but interval ID was missing.');
        }
        logger.info('[Store] Setting local state: isSimulationRunning = false, simulationIntervalId = null.');
        set({ isSimulationRunning: false, simulationIntervalId: null });
      } else {
         logger.warn('[Store] stopGlobalSimulation called but simulation was not running locally.');
         if (simulationIntervalId) {
             logger.warn('[Store] Clearing lingering interval ID found while simulation was stopped locally.');
             clearInterval(simulationIntervalId);
             set({ simulationIntervalId: null });
         }
      }
      
      // --- Trigger Backend Cleanup --- 
      // TODO: If multiple simulations are allowed, this needs rethinking.
      // Currently assumes only the selectedVehicle needs stopping.
      if (selectedVehicleId) {
           const vehicleIdToStop = selectedVehicleId; // Capture ID for async context
           const actionKey = `stop_${vehicleIdToStop}`;
           logger.info(`[Store] Triggering backend stopSimulation Server Action for shipment ID associated with vehicle: ${vehicleIdToStop}`);
           set(state => ({ 
               loadingState: { ...(state.loadingState || {}), [actionKey]: true },
               errorState: { ...(state.errorState || {}), [actionKey]: null },
            }));
           stopSimulationServerAction(vehicleIdToStop) // Assuming this stops based on vehicle/shipment ID
             .then((result) => {
               if (result?.success) {
                     logger.info(`[Store] Backend stopSimulation succeeded for ${vehicleIdToStop}.`);
                     // <<< ADDED: Update local state on success >>>
                     // Ideally, use status from result if provided, otherwise assume 'Idle'
                     const finalStatus = result?.updatedState?.status === 'Idle' ? 'Idle' : 'Idle'; // Default to Idle on success
                     logger.info(`[Store] Updating local vehicle ${vehicleIdToStop} status to ${finalStatus} after successful backend stop.`);
                     updateVehicleState(vehicleIdToStop, { status: finalStatus, lastUpdateTime: Date.now() });
                 } else {
                 // Handle potential error from server action
                 logger.error(`[Store] Backend stopSimulation failed for ${vehicleIdToStop}.`, { error: result?.error });
                 set(state => ({ errorState: { ...(state.errorState || {}), [actionKey]: `Backend stop failed: ${result?.error || 'Unknown error'}` }}));
                 }
             })
             .catch((error) => {
                 const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                 logger.error(`[Store] CRITICAL error calling stopSimulation Server Action for ${vehicleIdToStop}:`, error);
                 set(state => ({ errorState: { ...(state.errorState || {}), [actionKey]: `Error communicating with backend: ${errorMessage}` }}));
             })
             .finally(() => {
                 set(state => ({ loadingState: { ...(state.loadingState || {}), [actionKey]: false }}));
             });
      } else {
          logger.warn('[Store] Cannot trigger backend stopSimulation: No vehicle is selected.');
      }
    },

    setSimulationSpeed: (speed) => {
      logger.info('Setting simulation speed', { speed });
      // Adjust validation for new max speed
      const validSpeed = Math.max(0.1, Math.min(speed, 500)); // Updated bounds
      set({ simulationSpeedMultiplier: validSpeed });
    },

    toggleFollowVehicle: () => {
      set((state) => {
        const newFollowingState = !state.isFollowingVehicle;
        logger.debug(`toggleFollowVehicle action called. Changing from ${state.isFollowingVehicle} to ${newFollowingState}`);
        return { isFollowingVehicle: newFollowingState };
      });
    },

    resetStore: () => {
      logger.warn('Resetting simulation store to initial state');
      const { simulationIntervalId } = get();
      if (simulationIntervalId) {
        clearInterval(simulationIntervalId);
      }
      // Reset state using initialSimulationState (which no longer has global isLoading/error)
      set(initialSimulationState);
      // Explicitly ensure isInitialized remains true if reset happens after init
      set({ isInitialized: true }); 
    },

    loadSimulationFromInput: async (input: SimulationInput) => {
      const actionKey = 'loadSimulation'; // Key for loading/error state
      logger.info('[loadSimulationFromInput] Attempting to load simulation from input', { shipmentId: input.shipmentId });
      
      // Set loading state using keyed state
      set(state => ({ 
          loadingState: { ...(state.loadingState || {}), [actionKey]: true },
          errorState: { ...(state.errorState || {}), [actionKey]: null } // Clear previous error for this action
      })); 

      let vehicle: SimulatedVehicle | null = null;
      try {
        const simService = getSimulationFromShipmentServiceInstance();
        if (!simService) {
            throw new Error('SimulationFromShipmentService instance could not be obtained.');
        }
        
        vehicle = await simService.createVehicleFromShipment(input);

        if (vehicle) {
          logger.info('[loadSimulationFromInput] Vehicle created successfully, preparing to add/update in store.', { vehicleId: vehicle.id, shipmentId: vehicle.shipmentId });

          const vehicleToAdd = vehicle; // Assign to a const within the non-null scope
          set((state) => ({
            vehicles: {
              ...state.vehicles,
              [vehicleToAdd.id]: vehicleToAdd // Add or overwrite the vehicle
            },
            selectedVehicleId: vehicleToAdd.id, // Automatically select the newly loaded vehicle
            loadingState: { ...(state.loadingState || {}), [actionKey]: false }, // Set loading false on success
            errorState: { ...(state.errorState || {}), [actionKey]: null } // Clear any previous error for this action
          }));
          
          logger.info('[loadSimulationFromInput] Successfully loaded and selected vehicle.', { vehicleId: vehicle.id });

        } else {
          logger.warn('[loadSimulationFromInput] Simulation service returned null for vehicle creation.', { shipmentId: input.shipmentId });
           set(state => ({ 
              loadingState: { ...(state.loadingState || {}), [actionKey]: false },
              errorState: { ...(state.errorState || {}), [actionKey]: 'Failed to create vehicle simulation (Service returned null).' } 
          }));
        }
      } catch (error: any) {
        logger.error('[loadSimulationFromInput] Critical error creating/adding vehicle from SimulationInput:', {
            errorObject: error,
            errorMessage: error?.message,
            errorStack: error?.stack
        });
        set(state => ({
            errorState: { ...(state.errorState || {}), [actionKey]: `Simulation service failed: ${error.message || 'Unknown error'}` },
            loadingState: { ...(state.loadingState || {}), [actionKey]: false } // Ensure loading is set to false on error
        }));
      }
    },

    // <<< NEW ACTION IMPLEMENTATION >>>
    setVehicleFromServer: (vehicleData) => {
      const actionKey = `setVehicle_${vehicleData?.id || 'unknown'}`;
      if (!vehicleData || !vehicleData.id) {
        logger.error('[setVehicleFromServer] Received invalid vehicle data. Aborting.', { vehicleData });
        set(state => ({ 
            errorState: { ...(state.errorState || {}), [actionKey]: 'Received invalid vehicle data from server.' } // Ensure errorState is object
        }));
          return;
      }
      
      const vehicleId = vehicleData.id;

      set((state) => ({
        vehicles: {
          ...state.vehicles,
          [vehicleId]: vehicleData
        },
        selectedVehicleId: vehicleId,
        errorState: { ...(state.errorState || {}), [actionKey]: null, global: null } // Ensure errorState is object & clear errors
      }));
    },
    // <<< END NEW ACTION IMPLEMENTATION >>>

    clearActionError: (actionKey: string) => {
      set(state => {
        const newErrorState = { ...(state.errorState || {}) }; // Ensure errorState is object
        delete newErrorState[actionKey];
        // Optionally clear global error too
        // delete newErrorState.global; 
        return { errorState: newErrorState };
      });
    },
  }));
};

// Export the type of the store API for use in the context provider
export type SimulationStoreType = StoreApi<SimulationStoreApi>; 