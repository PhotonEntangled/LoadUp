"use client"

import { useEffect, useRef, useState } from "react"
import { useSimulationStore } from "@/lib/store/useSimulationStore"
import { logger } from "../../utils/logger"
import { cn } from "@/lib/utils"

interface SimulationMapProps {
  mapboxToken: string
  className?: string
  height?: string | number
  width?: string | number
}

export function SimulationMap({ mapboxToken, className, height = "100%", width = "100%" }: SimulationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Connect to simulation store
  const { vehicles, selectedVehicleId, setSelectedVehicleId } = useSimulationStore()

  // Get the selected vehicle
  const selectedVehicle = selectedVehicleId ? vehicles[selectedVehicleId] : null

  // Generate a static map image URL using Mapbox Static Images API
  const generateStaticMapUrl = () => {
    try {
      // Create markers for all vehicles
      const markers = Object.values(vehicles)
        .map((vehicle) => {
          const coords = vehicle.currentPosition.geometry.coordinates
          const color = vehicle.id === selectedVehicleId ? "ff0000" : "000000"
          return `pin-s+${color}(${coords[0]},${coords[1]})`
        })
        .join(",")

      // Center on US by default, or on selected vehicle if available
      let centerLng = -95.7129 // Center of US
      let centerLat = 37.0902
      let zoom = 3

      if (selectedVehicle) {
        const coords = selectedVehicle.currentPosition.geometry.coordinates
        centerLng = coords[0]
        centerLat = coords[1]
        zoom = 5
      }

      // Create the static map URL
      const mapSize = "800x600" // Width x Height
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${markers}/${centerLng},${centerLat},${zoom}/${mapSize}?access_token=${mapboxToken}`

      return url
    } catch (error) {
      logger.error("Error generating simulation map URL:", error)
      setMapError("Failed to generate map. Please check vehicle data.")
      return null
    }
  }

  useEffect(() => {
    setIsLoading(true)
    logger.info("Initializing simulation map")
  }, [vehicles, selectedVehicleId])

  const mapUrl = generateStaticMapUrl()

  return (
    <div
      className={cn("relative rounded-lg overflow-hidden border border-border", className)}
      style={{ height, width }}
      ref={mapContainerRef}
    >
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-destructive text-center p-4">
            <p>{mapError}</p>
            <button
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => setMapError(null)}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-5">
          <div className="text-muted-foreground text-center">Loading simulation map...</div>
        </div>
      )}

      {mapUrl ? (
        <div className="relative w-full h-full">
          <img
            src={mapUrl || "/placeholder.svg"}
            alt="Simulation Map"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setMapError("Failed to load map image. Please check your connection.")
            }}
          />

          {/* Vehicle list overlay */}
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-md text-xs max-w-[200px] max-h-[300px] overflow-auto">
            <h3 className="font-medium mb-2">Vehicles ({Object.keys(vehicles).length})</h3>
            <ul className="space-y-1">
              {Object.values(vehicles).map((vehicle) => (
                <li
                  key={vehicle.id}
                  className={cn(
                    "p-1 rounded cursor-pointer",
                    vehicle.id === selectedVehicleId ? "bg-primary/20" : "hover:bg-muted",
                  )}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="font-medium">{vehicle.id}</div>
                  <div className="text-muted-foreground">{vehicle.status}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-center p-4">Simulation map preview unavailable</div>
        </div>
      )}
    </div>
  )
}
