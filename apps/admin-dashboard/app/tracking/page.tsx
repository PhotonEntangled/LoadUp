"use client";

import { Card } from "@/components/shared/Card";
import { MapPin, Package, Truck } from "lucide-react";

const mockActiveShipments = [
  {
    id: "1",
    trackingNumber: "SHIP-001",
    status: "IN_TRANSIT",
    driver: {
      name: "Mike Smith",
      vehicleType: "VAN",
      location: "Manhattan, NY",
    },
    destination: "Los Angeles, CA",
    estimatedArrival: "2024-03-15T15:30:00",
  },
  {
    id: "2",
    trackingNumber: "SHIP-002",
    status: "PICKED_UP",
    driver: {
      name: "Sarah Johnson",
      vehicleType: "TRUCK",
      location: "Chicago, IL",
    },
    destination: "Houston, TX",
    estimatedArrival: "2024-03-16T14:00:00",
  },
];

export default function TrackingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockActiveShipments.length} active shipments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Shipments */}
        <div className="lg:col-span-1 space-y-4">
          {mockActiveShipments.map((shipment) => (
            <Card key={shipment.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-primary-500">
                    {shipment.trackingNumber}
                  </span>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Truck className="h-4 w-4 mr-1" />
                    {shipment.driver.name}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {shipment.driver.location}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    shipment.status === "IN_TRANSIT"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {shipment.status}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Package className="h-4 w-4 mr-1" />
                  {shipment.destination}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ETA: {new Date(shipment.estimatedArrival).toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Map View */}
        <Card className="lg:col-span-2 p-4 min-h-[600px]">
          <div className="h-full rounded-lg bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Map view will be integrated with Mapbox</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 