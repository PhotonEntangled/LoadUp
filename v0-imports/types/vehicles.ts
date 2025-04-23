import type { Feature, LineString, Point } from "geojson"

export type VehicleStatus = "Idle" | "En Route" | "At Pickup" | "At Dropoff" | "Error"

export interface SimulatedVehicle {
  id: string
  shipmentId?: string
  status: VehicleStatus | string
  driverName?: string
  truckId?: string
  bearing?: number
  currentPosition: Feature<Point>
  route?: Feature<LineString>
}
