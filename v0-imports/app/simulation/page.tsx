"use client"

import { SimulationMap } from "@/components/map/SimulationMap"
import { SimulationControls } from "@/components/simulation/SimulationControls"

export default function SimulationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Vehicle Simulation</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and control simulated vehicles across their delivery routes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SimulationMap mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""} height={600} className="shadow-sm" />
        </div>
        <div className="lg:col-span-1">
          <SimulationControls />
        </div>
      </div>
    </div>
  )
}
