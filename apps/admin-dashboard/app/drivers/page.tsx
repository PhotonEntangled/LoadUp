"use client";

import { useState } from "react";
import { Card } from "@/components/shared/Card";
import { Search, MapPin } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";

const mockDrivers = [
  {
    id: "1",
    name: "Mike Smith",
    email: "mike.smith@loadup.com",
    phone: "+1 (555) 123-4567",
    vehicleType: "VAN",
    licensePlate: "XYZ-123",
    status: "AVAILABLE",
    currentLocation: "Brooklyn, NY",
    rating: 4.8,
    totalDeliveries: 156,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@loadup.com",
    phone: "+1 (555) 987-6543",
    vehicleType: "TRUCK",
    licensePlate: "ABC-789",
    status: "ON_DELIVERY",
    currentLocation: "Queens, NY",
    rating: 4.9,
    totalDeliveries: 203,
  },
];

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          Add Driver
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            className="flex-1 outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockDrivers.map((driver) => (
            <Card key={driver.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar name={driver.name} size="lg" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {driver.name}
                      </h3>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.status === "AVAILABLE"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Vehicle</p>
                      <p className="font-medium">
                        {driver.vehicleType} • {driver.licensePlate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-medium">⭐ {driver.rating}/5.0</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deliveries</p>
                      <p className="font-medium">{driver.totalDeliveries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{driver.phone}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {driver.currentLocation}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
} 