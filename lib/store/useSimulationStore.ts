import { create, StoreApi } from 'zustand';
import { SimulatedVehicle, VehicleStatus } from '@/types/vehicles'; // Adjust path as needed
import { logger } from '../../utils/logger'; // Adjusted path
import { calculateNewPosition } from '../../utils/simulation/simulationUtils'; // Import the new utility
import type { SimulationInput } from '@/types/simulation'; // <<< ADD: Import SimulationInput type
import { getSimulationFromShipmentServiceInstance } from '@/services/shipment/SimulationFromShipmentService'; // <<< FIX: Import the getter function, not the class directly
import { updateShipmentLastPosition } from '@/lib/actions/shipmentUpdateActions'; // <<< ADDED: Import server action

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
  /** Potential error message related to simulation state */
  error: string | null;
  /** Flag indicating if the store is performing a background loading operation */
  isLoading: boolean;
  simulationIntervalId: NodeJS.Timeout | null; // To store the interval ID
  isFollowingVehicle: boolean; // <<< ADDED: Flag for follow mode
  isInitialized: boolean; // <<< ADDED: Flag to track client-side store readiness
  lastDbUpdateTime: Record<string, number>; // <<< ADDED: Track last DB update time per vehicle
}

// Define the actions available to modify the simulation state
export interface SimulationActions {
  /** Adds a new vehicle to the store or updates an existing one */
  addVehicle: (vehicle: SimulatedVehicle) => void;
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
  /** Sets or clears the simulation error message */
  setError: (message: string | null) => void;
  /** Sets the loading state flag */
  setLoading: (isLoading: boolean) => void;
  /** Resets the store to its initial state */
  resetStore: () => void;
  tickSimulation: () => void; // Action to advance simulation by one step
  /** Sets the selected vehicle status to 'En Route' */
  confirmPickup: (vehicleId: string) => void;
  /** Sets the vehicle status to Completed after delivery */
  confirmDelivery: (vehicleId: string) => void;
  toggleFollowVehicle: () => void; // <<< ADDED: Action to toggle follow mode
  /** Loads simulation state from a prepared SimulationInput object */ 
  loadSimulationFromInput: (input: SimulationInput) => Promise<void>; // <<< FIX: Make async
  /** Action triggered by UI to confirm pickup, targeting selected vehicle */
  confirmPickupAction: () => void; // <<< ADDED
  /** Action triggered by UI to confirm dropoff, targeting selected vehicle */
  confirmDropoffAction: () => void; // <<< ADDED
}

// Define the combined type for the store API
export type SimulationStoreApi = SimulationState & SimulationActions;

// Define the initial state
export const initialSimulationState: SimulationState = {
  vehicles: {},
  selectedVehicleId: null,
  isSimulationRunning: false,
  simulationSpeedMultiplier: 1,
  error: null,
  isLoading: false,
  simulationIntervalId: null, // Initialize interval ID as null
  isFollowingVehicle: false, // <<< ADDED: Initialize follow mode to false
  isInitialized: false, // <<< ADDED: Initialize as false
  lastDbUpdateTime: {}, // <<< ADDED: Initialize DB update tracker
};

// Interval duration in milliseconds
const SIMULATION_INTERVAL_MS = 1000 / 30; // Aim for ~30 FPS updates

// Export a function that creates the store
export const createSimulationStore = () => {
  logger.info(`[createSimulationStore] Creating new simulation store instance`);
  return create<SimulationStoreApi>((set, get) => ({
    ...initialSimulationState, // <<< Use the exported initial state

    // Actions Implementation
    addVehicle: (vehicle) => {
      logger.debug(`Adding/Updating vehicle via addVehicle`, { vehicleId: vehicle.id });
      set((state) => ({
        vehicles: { ...state.vehicles, [vehicle.id]: vehicle },
      }));
    },

    removeVehicle: (vehicleId) => {
      logger.debug('Removing vehicle from store', { vehicleId });
      set((state) => {
        const { [vehicleId]: _, ...remainingVehicles } = state.vehicles;
        return {
          vehicles: remainingVehicles,
          // Deselect if the removed vehicle was selected
          selectedVehicleId: state.selectedVehicleId === vehicleId ? null : state.selectedVehicleId,
          // <<< ADDED: Clear DB update time for removed vehicle
          lastDbUpdateTime: (({ [vehicleId]: removed, ...rest }) => rest)(state.lastDbUpdateTime),
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

    confirmDelivery: (vehicleId) => {
      const { vehicles } = get();
      const vehicle = vehicles[vehicleId];
      // Only confirm if pending
      if (vehicle && vehicle.status === 'Pending Delivery Confirmation') { 
        logger.info(`Confirming delivery for vehicle ${vehicleId}`);
        set((state) => ({
          vehicles: {
            ...state.vehicles,
            [vehicleId]: {
              ...state.vehicles[vehicleId],
              status: 'Completed', // Final status
              lastUpdateTime: Date.now(),
            },
          },
        }));
        // Optional: Stop the global simulation if this was the only active vehicle
        const remainingVehicles = Object.values(get().vehicles);
        const stillEnRoute = remainingVehicles.some(v => v.status === 'En Route' || v.status === 'Pending Delivery Confirmation');
        if (!stillEnRoute) {
          logger.info(`No more active vehicles, stopping global simulation after delivery confirmation.`);
          get().stopGlobalSimulation();
        }
      } else {
        logger.warn(`confirmDelivery called for vehicle ${vehicleId} but status was not 'Pending Delivery Confirmation' or vehicle not found`, { currentStatus: vehicle?.status });
      }
    },

    tickSimulation: () => {
      logger.debug('[Tick] ------ START tickSimulation ------'); // <<< ADDED: Entry Log
      const { vehicles, simulationSpeedMultiplier, isSimulationRunning, updateVehicleState, setError, lastDbUpdateTime } = get();
      
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

              // <<< ADDED: DB Update Logic (Throttled) >>>
              const DB_UPDATE_INTERVAL_MS = 10000; // Update DB every 10 seconds
              const lastUpdate = lastDbUpdateTime[vehicle.id] || 0;
              const shouldUpdateDb = (timeNow - lastUpdate > DB_UPDATE_INTERVAL_MS) && 
                                     newPositionData?.currentPosition?.geometry?.coordinates?.length === 2;

              if (shouldUpdateDb && newPositionData?.currentPosition?.geometry?.coordinates) {
                  logger.info(`[Tick] Throttled DB update triggered for ${vehicle.id}`);
                  // Update the lastDbUpdateTime immediately to prevent rapid retries
                  // even if the async call above hasn't finished/failed yet.
                  // We will rely on the backend tick handler for persistence.
                  set((state) => ({ lastDbUpdateTime: { ...state.lastDbUpdateTime, [vehicle.id]: timeNow } }));
              }
              // <<< END DB Update Logic >>>
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
          setError('A critical error occurred during simulation tick.');
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
          set({ isSimulationRunning: true, simulationIntervalId: newIntervalId, error: null });
      } else {
          logger.warn('[Store] startGlobalSimulation called but simulation is already running.');
      }
      logger.info('[Store] ###### END startGlobalSimulation ######'); // <<< ADDED: Exit Log
    },

    stopGlobalSimulation: () => {
      const { isSimulationRunning, simulationIntervalId } = get();
      logger.info('[Store] stopGlobalSimulation action called.', { currentState: isSimulationRunning, intervalId: simulationIntervalId });
      if (isSimulationRunning) {
        if (simulationIntervalId) {
          logger.info(`[Store] Clearing simulation interval ID: ${simulationIntervalId}`);
          clearInterval(simulationIntervalId);
        } else {
          logger.warn('[Store] Simulation was running but interval ID was missing.');
        }
        logger.info('[Store] Setting isSimulationRunning = false, simulationIntervalId = null.');
        set({ isSimulationRunning: false, simulationIntervalId: null });
      } else {
        logger.warn('[Store] stopGlobalSimulation called but simulation was not running.');
        if (simulationIntervalId) {
            logger.warn('[Store] Clearing lingering interval ID found while simulation was stopped.');
            clearInterval(simulationIntervalId);
            set({ simulationIntervalId: null }); 
        }
      }
    },

    setSimulationSpeed: (speed) => {
      logger.info('Setting simulation speed', { speed });
      // Adjust validation for new max speed
      const validSpeed = Math.max(0.1, Math.min(speed, 500)); // Updated bounds
      set({ simulationSpeedMultiplier: validSpeed });
    },

    setError: (message) => {
      logger.error(`Simulation store error set`, { message });
      set({ error: message });
    },

    setLoading: (isLoading) => {
      logger.debug('Setting simulation store loading state', { isLoading });
      set({ isLoading });
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
        logger.debug('Cleared simulation interval during reset');
      }
      // Reset state, ensuring lastDbUpdateTime is also cleared
      set({ ...initialSimulationState, simulationIntervalId: null });
    },

    loadSimulationFromInput: async (input: SimulationInput) => {
      logger.info('[loadSimulationFromInput] Attempting to load simulation from input', { shipmentId: input.shipmentId });
      
      // <<< STRENGTHENED RESET >>>
      logger.warn('[loadSimulationFromInput] Stopping any existing simulation and resetting store before loading new simulation.');
      get().stopGlobalSimulation(); // Explicitly stop interval
      set({
        vehicles: {},
        selectedVehicleId: null,
        isSimulationRunning: false, // Ensure simulation is stopped
        error: null,
        isLoading: true, // Set loading true
        simulationIntervalId: null, // Clear interval ID in state
        isFollowingVehicle: false, // Reset follow mode
        // isInitialized can remain true
      });
      logger.debug('[loadSimulationFromInput] Simulation state reset for new load.');

      let vehicle: SimulatedVehicle | null = null;
      try {
        const simService = getSimulationFromShipmentServiceInstance();
        if (!simService) {
            // This check might be redundant if the getter always returns or throws, but good for safety
            throw new Error('SimulationFromShipmentService instance could not be obtained.');
        }
        
        vehicle = await simService.createVehicleFromShipment(input);

        if (vehicle) {
          logger.info('[loadSimulationFromInput] Vehicle created successfully, adding to store.', { vehicleId: vehicle.id, shipmentId: vehicle.shipmentId });
          // Clear potentially conflicting existing state for this shipment ID if needed
          // (Consider if removing old vehicle with same shipmentId is desired)
          
          // Use existing addVehicle action
          get().addVehicle(vehicle);
          // Automatically select the newly loaded vehicle
          set({ selectedVehicleId: vehicle.id, isLoading: false }); 
          logger.info('[loadSimulationFromInput] Successfully loaded and selected vehicle.', { vehicleId: vehicle.id });

          // <<< ADDED: Log store state right before auto-start check >>>
          const currentState = get().vehicles;
          logger.debug('[loadSimulationFromInput] Vehicle state in store just before auto-start check:', { vehicleId: vehicle.id, statusInStore: currentState[vehicle.id]?.status });

          // <<< ADDED: Auto-start simulation if loaded vehicle is already En Route >>>
          // <<< ADDED: Log the status being checked >>>
          logger.info(`[loadSimulationFromInput] Checking vehicle status for auto-start. Vehicle ID: ${vehicle.id}, Status: ${vehicle.status}`);
          if (vehicle.status === 'En Route') {
            logger.info(`[loadSimulationFromInput] Vehicle ${vehicle.id} has status 'En Route'. Attempting to auto-start simulation.`); // <<< MODIFIED Log
            get().startGlobalSimulation();
            logger.info(`[loadSimulationFromInput] Call to startGlobalSimulation completed for vehicle ${vehicle.id}.`); // <<< ADDED: Log after call
          } else {
            // <<< ADDED: Log if status is NOT En Route >>>
            logger.warn(`[loadSimulationFromInput] Vehicle ${vehicle.id} status is '${vehicle.status}', not 'En Route'. Simulation will not auto-start.`);
          }
          // <<< END ADDED >>>

        } else {
          // Handle case where service returns null (e.g., invalid input, cancelled shipment handled internally)
          logger.warn('[loadSimulationFromInput] Simulation service returned null for vehicle creation.', { shipmentId: input.shipmentId });
          set({ isLoading: false, error: 'Failed to create vehicle simulation (Service returned null).' });
        }
      } catch (error: any) {
        logger.error('[loadSimulationFromInput] Critical error creating/adding vehicle from SimulationInput:', { 
            errorObject: error, 
            errorMessage: error?.message, 
            errorStack: error?.stack 
        });
        // <<< FIX: Call setError via get() >>>
        get().setError(`SimulationFromShipmentService failed: ${error.message || 'Unknown error'}`);
        set({ isLoading: false }); // Ensure loading is set to false on error
      }
    },

    confirmPickupAction: () => {
      const { selectedVehicleId, vehicles, confirmPickup } = get();
      if (!selectedVehicleId) {
          logger.warn('[confirmPickupAction] No vehicle selected.');
          return;
      }
      const selectedVehicle = vehicles[selectedVehicleId];
      if (selectedVehicle && selectedVehicle.status === 'AWAITING_STATUS') {
          logger.info(`[confirmPickupAction] Pickup confirmation skipped for vehicle ${selectedVehicleId} due to AWAITING_STATUS.`);
          get().setError('Cannot start simulation: Vehicle is awaiting initial status.');
          return;
      }
      confirmPickup(selectedVehicleId);
    },

    confirmDropoffAction: () => {
      const { selectedVehicleId, confirmDelivery } = get();
      if (!selectedVehicleId) {
          logger.warn('[confirmDropoffAction] No vehicle selected.');
          return;
      }
        confirmDelivery(selectedVehicleId);
    },
  }));
};

// Export the type of the store API for use in the context provider
export type SimulationStoreType = StoreApi<SimulationStoreApi>; 