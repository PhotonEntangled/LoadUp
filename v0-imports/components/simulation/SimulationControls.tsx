"use client"

import { useState, useEffect } from "react"
import { useSimulationStore } from "@/lib/store/useSimulationStore"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Truck } from "lucide-react"

export function SimulationControls() {
  const {
    isSimulationRunning,
    simulationSpeedMultiplier,
    vehicles,
    selectedVehicleId,
    startGlobalSimulation,
    stopGlobalSimulation,
    setSimulationSpeed,
    resetStore,
  } = useSimulationStore()

  // Local state to handle slider value before committing to store
  const [speedValue, setSpeedValue] = useState(simulationSpeedMultiplier)

  // Update local state when store value changes
  useEffect(() => {
    setSpeedValue(simulationSpeedMultiplier)
  }, [simulationSpeedMultiplier])

  // Handle simulation toggle
  const handleToggleSimulation = () => {
    if (isSimulationRunning) {
      stopGlobalSimulation()
    } else {
      startGlobalSimulation()
    }
  }

  // Handle speed change
  const handleSpeedChange = (value: number[]) => {
    setSpeedValue(value[0])
  }

  // Commit speed change to store
  const handleSpeedChangeCommitted = (value: number[]) => {
    setSimulationSpeed(value[0])
  }

  // Handle reset
  const handleReset = () => {
    resetStore()
  }

  // Get selected vehicle details
  const selectedVehicle = selectedVehicleId ? vehicles[selectedVehicleId] : null

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Simulation Controls
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Start/Stop Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleToggleSimulation}
            className="flex-1"
            variant={isSimulationRunning ? "destructive" : "default"}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Simulation
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant="outline" title="Reset Simulation">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Simulation Speed</span>
            <span className="text-sm text-muted-foreground">{speedValue}x</span>
          </div>

          <Slider
            value={[speedValue]}
            min={0.5}
            max={10}
            step={0.5}
            onValueChange={handleSpeedChange}
            onValueCommit={handleSpeedChangeCommitted}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Status Display */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Selected Vehicle:</span>
            <span className="font-medium">{selectedVehicleId || "None"}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">{selectedVehicle?.status || "N/A"}</span>
          </div>
        </div>

        {/* Details Panel Placeholder */}
        <div className="mt-4 p-4 border border-dashed border-border rounded-md bg-muted/50 min-h-[100px] flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            {/* Selected vehicle details will be rendered here */}
            {selectedVehicle ? "Selected vehicle details would be displayed here" : "Select a vehicle to view details"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
