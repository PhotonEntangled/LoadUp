"use client"

import { useEffect, useRef, useState } from "react"

interface CanvasRouteVisualizationProps {
  routeCoordinates: [number, number][]
}

export function CanvasRouteVisualization({ routeCoordinates }: CanvasRouteVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)

  // Convert geo coordinates to canvas coordinates (simplified for demo)
  const normalizeCoordinates = (coords: [number, number][]) => {
    // Find min/max to scale properly
    const lngs = coords.map((c) => c[0])
    const lats = coords.map((c) => c[1])
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    // Add padding
    const padding = 50

    return coords.map(([lng, lat]) => {
      // Invert lat because canvas y increases downward
      return [
        padding + ((lng - minLng) / (maxLng - minLng)) * (800 - padding * 2),
        padding + ((maxLat - lat) / (maxLat - minLat)) * (600 - padding * 2),
      ]
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 800
    canvas.height = 600

    // Normalize coordinates for canvas
    const points = normalizeCoordinates(routeCoordinates)

    // Animation loop
    let animationId: number
    let lastTime = 0
    let dashOffset = 0

    const animate = (time: number) => {
      if (!lastTime) lastTime = time
      const deltaTime = time - lastTime
      lastTime = time

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.fillStyle = "#1e293b"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw base route
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.strokeStyle = "#334155"
      ctx.lineWidth = 8
      ctx.stroke()

      // Update progress (smoother animation)
      setProgress((prev) => (prev + deltaTime * 0.00003) % 1)

      // Draw animated route
      const progressDistance = progress * points.length
      const progressIndex = Math.min(Math.floor(progressDistance), points.length - 1)
      const progressRemainder = progressDistance - progressIndex

      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])

      for (let i = 1; i <= progressIndex; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }

      if (progressIndex < points.length - 1) {
        const nextX =
          points[progressIndex][0] + (points[progressIndex + 1][0] - points[progressIndex][0]) * progressRemainder
        const nextY =
          points[progressIndex][1] + (points[progressIndex + 1][1] - points[progressIndex][1]) * progressRemainder
        ctx.lineTo(nextX, nextY)
      }

      // Create gradient for the route
      const gradient = ctx.createLinearGradient(
        points[0][0],
        points[0][1],
        points[points.length - 1][0],
        points[points.length - 1][1],
      )
      gradient.addColorStop(0, "#64748b")
      gradient.addColorStop(1, "#10b981")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 6
      ctx.stroke()

      // Draw strobe effect (dashed line)
      dashOffset = (dashOffset + deltaTime * 0.05) % 20

      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }

      ctx.setLineDash([4, 8])
      ctx.lineDashOffset = -dashOffset
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.setLineDash([])

      // Draw wind lines
      const truckIndex = Math.min(Math.floor(progressDistance), points.length - 1)
      const truckRemainder = progressDistance - truckIndex

      let truckX = points[truckIndex][0]
      let truckY = points[truckIndex][1]

      if (truckIndex < points.length - 1) {
        truckX += (points[truckIndex + 1][0] - points[truckIndex][0]) * truckRemainder
        truckY += (points[truckIndex + 1][1] - points[truckIndex][1]) * truckRemainder
      }

      // Draw wind lines ahead of the truck
      for (let i = 0; i < 8; i++) {
        const linePosition = (progress + i * 0.05) % 1
        if (linePosition >= 1) continue

        const lineIndex = Math.min(Math.floor(linePosition * points.length), points.length - 1)
        const lineRemainder = linePosition * points.length - lineIndex

        let lineX = points[lineIndex][0]
        let lineY = points[lineIndex][1]

        if (lineIndex < points.length - 1) {
          lineX += (points[lineIndex + 1][0] - points[lineIndex][0]) * lineRemainder
          lineY += (points[lineIndex + 1][1] - points[lineIndex][1]) * lineRemainder
        }

        // Calculate angle for the wind line
        let angle = 0
        if (lineIndex < points.length - 1) {
          const dx = points[lineIndex + 1][0] - points[lineIndex][0]
          const dy = points[lineIndex + 1][1] - points[lineIndex][1]
          angle = Math.atan2(dy, dx)
        }

        // Draw the wind line
        ctx.save()
        ctx.translate(lineX, lineY)
        ctx.rotate(angle)

        ctx.beginPath()
        ctx.moveTo(-10, 0)
        ctx.lineTo(10, 0)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.restore()
      }

      // Draw truck at current position
      // Draw truck circle background
      ctx.beginPath()
      ctx.arc(truckX, truckY, 15, 0, Math.PI * 2)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()

      // Draw simplified truck icon
      ctx.fillStyle = "white"
      ctx.fillRect(truckX - 7, truckY - 5, 14, 10)
      ctx.fillRect(truckX - 10, truckY, 6, 5)

      // Draw start and end points
      ctx.beginPath()
      ctx.arc(points[0][0], points[0][1], 8, 0, Math.PI * 2)
      ctx.fillStyle = "#64748b"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(points[points.length - 1][0], points[points.length - 1][1], 8, 0, Math.PI * 2)
      ctx.fillStyle = "#10b981"
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [routeCoordinates, progress])

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Delivery Route Visualization</h2>
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        <canvas ref={canvasRef} width={800} height={600} className="w-full h-auto" />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md text-sm">
          Delivery Progress: {Math.round(progress * 100)}%
        </div>
      </div>
      <p className="mt-4 text-gray-600 text-sm">
        Note: This is a fallback visualization as the Mapbox map could not be loaded.
      </p>
    </div>
  )
}
