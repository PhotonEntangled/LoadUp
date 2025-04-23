"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

interface AnimatedRouteProps {
  map: mapboxgl.Map | null
  routeCoordinates: [number, number][]
}

export function AnimatedRoute({ map, routeCoordinates }: AnimatedRouteProps) {
  const animationRef = useRef<number | null>(null)
  const truckRef = useRef<mapboxgl.Marker | null>(null)
  const windLinesRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!map) return

    // Add the animated gradient route layer
    map.addLayer({
      id: "route-animated",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          "#64748b", // Start color (slate)
          1,
          "#10b981", // End color (emerald)
        ],
        "line-width": 6,
        "line-gradient": ["interpolate", ["linear"], ["line-progress"], 0, "#64748b", 1, "#10b981"],
      },
    })

    // Add the strobing effect layer
    map.addLayer({
      id: "route-strobe",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "white",
        "line-width": 2,
        "line-opacity": 0.6,
        "line-dasharray": [0.5, 4],
      },
    })

    // Create truck marker for animation
    const el = document.createElement("div")
    el.className = "animated-truck-marker"
    el.innerHTML =
      '<div class="animated-truck-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-truck"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>'

    truckRef.current = new mapboxgl.Marker(el).setLngLat(routeCoordinates[0]).addTo(map)

    // Create initial wind lines
    createWindLines(map, routeCoordinates)

    // Start the animation
    let progress = 0
    let lastTime = 0
    let dashOffset = 0

    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = time - lastTime
      lastTime = time

      // Update progress (smoother animation with smaller increment)
      progress += deltaTime * 0.00003
      if (progress > 1) progress = 0

      // Update dash animation for strobing effect
      dashOffset = (dashOffset + deltaTime * 0.01) % 8
      map.setPaintProperty("route-strobe", "line-dasharray", [0.5, 4])
      map.setPaintProperty("route-strobe", "line-dash-offset", dashOffset)

      // Update route progress
      map.setPaintProperty("route-animated", "line-progress", progress)

      // Update truck position
      const currentPoint = getPointAlongLine(routeCoordinates, progress)
      if (truckRef.current) {
        truckRef.current.setLngLat(currentPoint)
      }

      // Update wind lines
      updateWindLines(map, routeCoordinates, progress)

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Clean up layers and markers
      if (map) {
        if (map.getLayer("route-animated")) map.removeLayer("route-animated")
        if (map.getLayer("route-strobe")) map.removeLayer("route-strobe")
      }

      if (truckRef.current) {
        truckRef.current.remove()
      }

      // Remove all wind line markers
      windLinesRef.current.forEach((marker) => {
        marker.remove()
      })
      windLinesRef.current = []
    }
  }, [map, routeCoordinates])

  // Function to create wind lines
  const createWindLines = (map: mapboxgl.Map, routeCoordinates: [number, number][]) => {
    // Create 8 wind lines distributed along the route
    for (let i = 0; i < 8; i++) {
      const position = i / 8
      const point = getPointAlongLine(routeCoordinates, position)

      const lineEl = document.createElement("div")
      lineEl.className = "wind-line"

      const marker = new mapboxgl.Marker({
        element: lineEl,
        anchor: "center",
        rotationAlignment: "map",
      })
        .setLngLat(point)
        .addTo(map)

      windLinesRef.current.push(marker)
    }
  }

  // Function to update wind lines
  const updateWindLines = (map: mapboxgl.Map, routeCoordinates: [number, number][], progress: number) => {
    windLinesRef.current.forEach((marker, index) => {
      // Calculate position for this wind line
      // Distribute wind lines ahead of the truck
      const linePosition = (progress + index * 0.05) % 1
      const point = getPointAlongLine(routeCoordinates, linePosition)

      // Update marker position
      marker.setLngLat(point)

      // Calculate bearing for rotation
      if (linePosition < 0.99) {
        const nextPoint = getPointAlongLine(routeCoordinates, linePosition + 0.01)
        const bearing = getBearing(point, nextPoint)

        // Update rotation
        const el = marker.getElement()
        if (el) {
          el.style.transform = `${el.style.transform.split("rotate")[0]} rotate(${bearing}deg)`
        }
      }
    })
  }

  // Function to get a point along a line at a specific percentage
  const getPointAlongLine = (coordinates: [number, number][], percentage: number): [number, number] => {
    if (percentage <= 0) return coordinates[0]
    if (percentage >= 1) return coordinates[coordinates.length - 1]

    // Calculate total distance
    let totalDistance = 0
    const distances = []

    for (let i = 1; i < coordinates.length; i++) {
      const segment = calculateDistance(coordinates[i - 1], coordinates[i])
      distances.push(segment)
      totalDistance += segment
    }

    // Find the target distance
    const targetDistance = totalDistance * percentage

    // Find the segment that contains the target point
    let currentDistance = 0
    for (let i = 0; i < distances.length; i++) {
      if (currentDistance + distances[i] >= targetDistance) {
        // Calculate how far along this segment the point is
        const segmentPercentage = (targetDistance - currentDistance) / distances[i]

        // Interpolate between the two points
        return [
          coordinates[i][0] + segmentPercentage * (coordinates[i + 1][0] - coordinates[i][0]),
          coordinates[i][1] + segmentPercentage * (coordinates[i + 1][1] - coordinates[i][1]),
        ]
      }
      currentDistance += distances[i]
    }

    // Fallback
    return coordinates[coordinates.length - 1]
  }

  // Calculate distance between two points
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const dx = point2[0] - point1[0]
    const dy = point2[1] - point1[1]
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Calculate bearing between two points (for wind line rotation)
  const getBearing = (start: [number, number], end: [number, number]): number => {
    const startLat = (start[1] * Math.PI) / 180
    const startLng = (start[0] * Math.PI) / 180
    const endLat = (end[1] * Math.PI) / 180
    const endLng = (end[0] * Math.PI) / 180

    const y = Math.sin(endLng - startLng) * Math.cos(endLat)
    const x =
      Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)

    const bearing = (Math.atan2(y, x) * 180) / Math.PI
    return bearing
  }

  return (
    <>
      <style jsx global>{`
        .animated-truck-marker {
          width: 40px;
          height: 40px;
          z-index: 10;
        }
        
        .animated-truck-icon {
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
        }
        
        .wind-line {
          width: 20px;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 1.5px;
        }
      `}</style>
    </>
  )
}
