"use client"

import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SimulatedVehicle } from "@/types/vehicles"

interface VehicleMarkerProps {
  vehicle: SimulatedVehicle
  isSelected: boolean
  onClick: (vehicle: SimulatedVehicle) => void
}

export function VehicleMarker({ vehicle, isSelected, onClick }: VehicleMarkerProps) {
  // This is a simplified version that won't be used in the static map approach
  // but we keep it to avoid breaking imports
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 shadow-md cursor-pointer",
        isSelected ? "border-primary" : "border-gray-400",
      )}
      onClick={() => onClick(vehicle)}
    >
      <Truck className="h-4 w-4" />
    </div>
  )
}
