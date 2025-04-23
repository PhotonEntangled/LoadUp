"use client"

import type { SimulatedVehicle } from "@/types/vehicles"

interface VehiclePopupProps {
  vehicle: SimulatedVehicle
}

export function VehiclePopup({ vehicle }: VehiclePopupProps) {
  // This is a simplified version that won't be used in the static map approach
  // but we keep it to avoid breaking imports
  return (
    <div className="p-2">
      <h3 className="font-medium text-sm mb-2">Vehicle Details</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>ID:</span>
          <span className="font-medium">{vehicle.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-medium">{vehicle.status}</span>
        </div>
      </div>
    </div>
  )
}
