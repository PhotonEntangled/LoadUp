"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { logger } from "../../utils/logger"

interface StaticRouteMapProps {
  originCoordinates: [number, number]
  destinationCoordinates: [number, number]
  mapboxToken: string
  className?: string
  height?: string | number
  width?: string | number
}

export function StaticRouteMap({
  originCoordinates,
  destinationCoordinates,
  mapboxToken,
  className,
  height = 400,
  width = "100%",
}: StaticRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate a static map image URL using Mapbox Static Images API
  const generateStaticMapUrl = () => {
    try {
      // Format: origin longitude,latitude and destination longitude,latitude
      const originStr = `${originCoordinates[0]},${originCoordinates[1]}`
      const destStr = `${destinationCoordinates[0]},${destinationCoordinates[1]}`

      // Create markers for origin (blue) and destination (red)
      const originMarker = `pin-s+0000ff(${originStr})`
      const destMarker = `pin-s+ff0000(${destStr})`

      // Calculate center point and zoom level
      const centerLng = (originCoordinates[0] + destinationCoordinates[0]) / 2
      const centerLat = (originCoordinates[1] + destinationCoordinates[1]) / 2
      const zoom = 5 // Default zoom level

      // Create the static map URL
      const mapSize = "800x400" // Width x Height
      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${originMarker},${destMarker}/${centerLng},${centerLat},${zoom}/${mapSize}?access_token=${mapboxToken}`

      return url
    } catch (error) {
      logger.error("Error generating static map URL:", error)
      setMapError("Failed to generate map. Please check your coordinates.")
      return null
    }
  }

  useEffect(() => {
    setIsLoading(true)
    logger.info("Initializing static map")
  }, [originCoordinates, destinationCoordinates])

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
          <div className="text-muted-foreground text-center">Loading map...</div>
        </div>
      )}

      {mapUrl ? (
        <div className="relative w-full h-full">
          <img
            src={mapUrl || "/placeholder.svg"}
            alt="Route Map"
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setMapError("Failed to load map image. Please check your connection.")
            }}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between bg-white/80 dark:bg-gray-800/80 p-2 rounded-md text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>
                Origin: {originCoordinates[1].toFixed(4)}, {originCoordinates[0].toFixed(4)}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>
                Destination: {destinationCoordinates[1].toFixed(4)}, {destinationCoordinates[0].toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground text-center p-4">Map preview unavailable</div>
        </div>
      )}
    </div>
  )
}
