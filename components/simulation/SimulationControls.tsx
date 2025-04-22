"use client"

import { useState, useEffect, useMemo } from "react"
// import useSimulationStore from "@/lib/store/useSimulationStore" // REMOVED incorrect default import
import { useSimulationStoreContext } from "@/lib/store/useSimulationStoreContext" // ADDED context hook
import { SimulationStoreApi } from "@/lib/store/useSimulationStore" // ADDED type import
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, PackageCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { logger } from "@/utils/logger"
import { calculateEta } from "@/utils/simulation/etaUtils"
import { format, formatDistanceToNowStrict } from 'date-fns'
import { VehicleStatus } from "@/types/vehicles"

// Define props for the component
interface SimulationControlsProps {
  className?: string;
  // REMOVED selectedVehicleId?: string | null; // No longer needed as prop, use store directly
  // REMOVED onZoomToRoute?: () => void; // No longer needed as prop
}

export function SimulationControls({ 
  className, 
  // REMOVED propSelectedVehicleId, 
  // REMOVED onZoomToRoute 
}: SimulationControlsProps) {
  // --- Access STATE using context hook selectors --- 
  const isSimulationRunning = useSimulationStoreContext((state: SimulationStoreApi) => state.isSimulationRunning);
  const simulationSpeedMultiplier = useSimulationStoreContext((state: SimulationStoreApi) => state.simulationSpeedMultiplier);
  const vehicles = useSimulationStoreContext((state: SimulationStoreApi) => state.vehicles);
  const storeSelectedVehicleId = useSimulationStoreContext((state: SimulationStoreApi) => state.selectedVehicleId);
  const isFollowingVehicle = useSimulationStoreContext((state: SimulationStoreApi) => state.isFollowingVehicle);
  
  // --- Access ACTIONS using context hook selectors --- 
  const confirmPickupAction = useSimulationStoreContext((state: SimulationStoreApi) => state.confirmPickupAction);
  const startGlobalSimulation = useSimulationStoreContext((state: SimulationStoreApi) => state.startGlobalSimulation);
  const stopGlobalSimulation = useSimulationStoreContext((state: SimulationStoreApi) => state.stopGlobalSimulation);
  const confirmDropoffAction = useSimulationStoreContext((state: SimulationStoreApi) => state.confirmDropoffAction);
  const setSimulationSpeed = useSimulationStoreContext((state: SimulationStoreApi) => state.setSimulationSpeed);
  const resetStore = useSimulationStoreContext((state: SimulationStoreApi) => state.resetStore);
  const toggleFollowVehicle = useSimulationStoreContext((state: SimulationStoreApi) => state.toggleFollowVehicle);

  // Local state for slider
  const [speedValue, setSpeedValue] = useState(() => simulationSpeedMultiplier); 

  // Get selected vehicle details
  const selectedVehicle = useMemo(() => 
    storeSelectedVehicleId ? vehicles[storeSelectedVehicleId] : null, 
    [storeSelectedVehicleId, vehicles]
  );

  // Calculate ETA using the utility function
  const { etaDate, remainingDurationMs } = useMemo(() => {
    if (selectedVehicle && selectedVehicle.status === 'En Route') {
      return calculateEta(selectedVehicle, simulationSpeedMultiplier);
    }
    return { etaDate: null, remainingDurationMs: null }; 
  }, [selectedVehicle, simulationSpeedMultiplier]); 

  // Format ETA for display
  const formattedEta = useMemo(() => {
    if (etaDate && remainingDurationMs !== null) {
      try {
        const etaTime = format(etaDate, 'HH:mm');
        const relativeTime = remainingDurationMs > 0 
          ? formatDistanceToNowStrict(etaDate, { addSuffix: true })
          : 'now'; 
        return `${etaTime} (${relativeTime})`;
      } catch (error) {
        logger.error("Error formatting ETA date:", error, { etaDate });
        return "Invalid Date";
      }
    }
    if (selectedVehicle?.status === 'Completed') return "Arrived";
    if (selectedVehicle?.status === 'Pending Delivery Confirmation') return "At Destination";
    if (selectedVehicle && !selectedVehicle.route) return "Route unavailable";
    return "N/A"; 
  }, [etaDate, remainingDurationMs, selectedVehicle]);

  // Update local slider state when store speed changes
  useEffect(() => {
    setSpeedValue(simulationSpeedMultiplier)
  }, [simulationSpeedMultiplier])

  // Handle simulation toggle / confirm pickup
  const handleToggleSimulation = () => {
    if (isSimulationRunning) {
      stopGlobalSimulation();
    } else if (selectedVehicle?.status === 'Idle') {
      confirmPickupAction(); // This should eventually trigger startGlobalSimulation via the service/update
    } else if (selectedVehicle?.status === 'En Route' || selectedVehicle?.status === 'Delayed') { // Allow restarting if stopped mid-trip
      startGlobalSimulation();
    } else {
      logger.warn('[Controls] Toggle simulation called but vehicle status is not Idle, En Route, or Delayed.', { status: selectedVehicle?.status });
    }
  }

  // Handle Confirm Delivery
  const handleConfirmDelivery = () => {
    // Now use action obtained from context selector
    if (typeof confirmDropoffAction !== 'function') { 
        logger.error("[SimulationControls] Critical Error: confirmDropoffAction is not available via context!");
        return;
    }

    if (selectedVehicle && selectedVehicle.status === 'Pending Delivery Confirmation') {
      logger.info("[SimulationControls] Confirming delivery via button.");
      confirmDropoffAction();
    }
  };

  // Handle speed change
  const handleSpeedChange = (value: number[]) => {
    setSpeedValue(value[0])
  }

  // Commit speed change to store
  const handleSpeedChangeCommitted = (value: number[]) => {
    // Now use action obtained from context selector
    if (typeof setSimulationSpeed !== 'function') {
        logger.error("[SimulationControls] Critical Error: setSimulationSpeed action is not available via context!");
        return;
    }
    logger.debug("[SimulationControls] Committing speed change:", value[0]);
    setSimulationSpeed(value[0])
  }

  // Handle reset
  const handleReset = () => {
    // Now use action obtained from context selector
    if (typeof resetStore !== 'function') {
        logger.error("[SimulationControls] Critical Error: resetStore action is not available via context!");
        return;
    }
    logger.info("[SimulationControls] Resetting simulation store via button.");
    resetStore(); 
  }

  // Handle follow toggle
  const handleFollowToggle = () => {
    // Now use action obtained from context selector
    if (typeof toggleFollowVehicle !== 'function') {
        logger.error("[SimulationControls] Critical Error: toggleFollowVehicle action is not available via context!");
        return;
    }
    toggleFollowVehicle(); 
  }

  // Determine button states based on selected state/actions
  const isVehicleAwaitingStatus = selectedVehicle?.status === 'AWAITING_STATUS';
  const confirmPickupButtonDisabled = 
    !storeSelectedVehicleId || 
    !selectedVehicle || 
    selectedVehicle.status !== 'Idle' || // Base check
    isVehicleAwaitingStatus || // Explicitly disable if AWAITING_STATUS
    typeof confirmPickupAction !== 'function' || 
    typeof startGlobalSimulation !== 'function';
  const stopButtonDisabled = !isSimulationRunning || typeof stopGlobalSimulation !== 'function';
  const confirmDeliveryButtonVisible = selectedVehicle?.status === 'Pending Delivery Confirmation';
  const confirmDeliveryButtonDisabled = 
    !confirmDeliveryButtonVisible || // Implicitly handled by visibility, but explicit check is safer
    isVehicleAwaitingStatus || // Disable if AWAITING_STATUS
    typeof confirmDropoffAction !== 'function';
  const resetButtonDisabled = typeof resetStore !== 'function';
  // Disable speed/follow if no vehicle, if awaiting status, or if action not available
  const speedSliderDisabled = 
    !selectedVehicle || 
    isVehicleAwaitingStatus || // Disable if AWAITING_STATUS
    typeof setSimulationSpeed !== 'function';
  const followSwitchDisabled = 
    !selectedVehicle || 
    isVehicleAwaitingStatus || // Disable if AWAITING_STATUS
    typeof toggleFollowVehicle !== 'function';

  // --- REVISED JSX STRUCTURE FOR COMPACTNESS ---
  return (
    // Removed Card, using a simple div with padding
    <div className={`p-3 border rounded-md ${className}`}> 
      {/* Main Controls Row - Use flex-wrap for responsiveness */}
      <div className="flex items-center space-x-3 flex-wrap gap-y-3"> 
        
        {/* Start/Stop/Reset Buttons */} 
        <div className="flex items-center space-x-2">
          {/* Show Confirm Pickup & Start OR Stop button */}
          {!isSimulationRunning && (
            <Button 
              onClick={handleToggleSimulation} 
              disabled={confirmPickupButtonDisabled} 
              size="sm" // Smaller button
            >
              <Play className="mr-1.5 h-4 w-4" /> Confirm & Start
            </Button>
          )}
          {isSimulationRunning && (
            <Button 
              onClick={handleToggleSimulation} 
              disabled={stopButtonDisabled}
              variant="destructive"
              size="sm" // Smaller button
            >
              <Pause className="mr-1.5 h-4 w-4" /> Stop
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" size="icon" disabled={resetButtonDisabled} aria-label="Reset Simulation">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Confirm Delivery Button (Conditional) */} 
        {confirmDeliveryButtonVisible && (
          <Button 
            onClick={handleConfirmDelivery} 
            disabled={confirmDeliveryButtonDisabled}
            size="sm" // Smaller button
          >
            <PackageCheck className="mr-1.5 h-4 w-4" /> Confirm Delivery
          </Button>
        )}

        {/* Speed Control - Takes up remaining space */} 
        <div className="flex items-center space-x-2 flex-grow min-w-[150px]">
          <Label htmlFor="speed" className="text-xs whitespace-nowrap">Speed: {speedValue.toFixed(1)}x</Label>
          <Slider
            id="speed"
            min={0.1}
            max={500} // Increased max speed
            step={0.1}
            value={[speedValue]}
            onValueChange={handleSpeedChange}
            onValueCommit={handleSpeedChangeCommitted}
            disabled={speedSliderDisabled}
            aria-label="Simulation Speed"
            className="flex-grow"
          />
        </div>

        {/* Follow Vehicle Control */} 
        <div className="flex items-center space-x-2">
          <Label htmlFor="follow-vehicle" className="text-xs whitespace-nowrap">
            Follow
          </Label>
          <Switch 
            id="follow-vehicle" 
            checked={isFollowingVehicle} 
            onCheckedChange={handleFollowToggle} 
            disabled={followSwitchDisabled}
            aria-label="Follow selected vehicle"
            // Consider using smaller switch if available/needed
          />
        </div>
      </div>

      {/* Selected Vehicle Info - Compact horizontal display below controls */}
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        {selectedVehicle ? (
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <span className="whitespace-nowrap"><span className="font-medium text-foreground">ID:</span> {selectedVehicle.id.substring(0, 8)}...</span>
            <span className="whitespace-nowrap"><span className="font-medium text-foreground">Status:</span> {selectedVehicle.status}</span>
            <span className="whitespace-nowrap"><span className="font-medium text-foreground">ETA:</span> {formattedEta}</span>
            {/* --- ADDED: Optional Driver/Truck Info --- */}
            {selectedVehicle.driverName && 
              <span className="whitespace-nowrap"><span className="font-medium text-foreground">Driver:</span> {selectedVehicle.driverName}</span>
            }
            {selectedVehicle.truckId && 
              <span className="whitespace-nowrap"><span className="font-medium text-foreground">Truck:</span> {selectedVehicle.truckId}</span>
            }
             {/* --- ADDED: Optional Phone/IC Info --- */}
             {selectedVehicle.driverPhone && 
               <span className="whitespace-nowrap"><span className="font-medium text-foreground">Phone:</span> {selectedVehicle.driverPhone}</span>
             } 
             {selectedVehicle.driverIc && 
               <span className="whitespace-nowrap"><span className="font-medium text-foreground">IC:</span> {selectedVehicle.driverIc}</span>
             } 
          </div>
        ) : (
          <span className="italic">No vehicle selected</span>
        )}
      </div>

    </div>
  )
} 