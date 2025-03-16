"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/shared/Card";
import { Search, MapPin, Edit, Trash2, Plus } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";

// Define the Driver type based on the API response
type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licensePlate?: string;
  vehiclePlate?: string;
  status: string;
  currentLocation: string | { lat: number; lng: number; address: string };
  rating: number;
  totalDeliveries?: number;
  completedDeliveries?: number;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleType: "VAN",
    licensePlate: "",
  });

  // Fetch drivers from the API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/drivers");
        
        if (!response.ok) {
          throw new Error(`Error fetching drivers: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDrivers(data.drivers);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch drivers");
        console.error("Error fetching drivers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new driver
  const handleAddDriver = async () => {
    try {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDriver),
      });

      if (!response.ok) {
        throw new Error(`Error adding driver: ${response.statusText}`);
      }

      const data = await response.json();
      setDrivers([...drivers, data.driver]);
      setIsAddingDriver(false);
      setNewDriver({
        name: "",
        email: "",
        phone: "",
        vehicleType: "VAN",
        licensePlate: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add driver");
      console.error("Error adding driver:", err);
    }
  };

  // Handle deleting a driver
  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) {
      return;
    }

    try {
      const response = await fetch(`/api/drivers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error deleting driver: ${response.statusText}`);
      }

      setDrivers(drivers.filter(driver => driver.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete driver");
      console.error("Error deleting driver:", err);
    }
  };

  // Format the location string
  const formatLocation = (location: string | { lat: number; lng: number; address: string }): string => {
    if (typeof location === 'string') {
      return location;
    }
    return location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
        <button 
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
          onClick={() => setIsAddingDriver(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Driver
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isAddingDriver && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Add New Driver</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={newDriver.name}
                onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={newDriver.email}
                onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={newDriver.vehicleType}
                onChange={(e) => setNewDriver({...newDriver, vehicleType: e.target.value})}
              >
                <option value="VAN">Van</option>
                <option value="TRUCK">Truck</option>
                <option value="CAR">Car</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">License Plate</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={newDriver.licensePlate}
                onChange={(e) => setNewDriver({...newDriver, licensePlate: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              onClick={() => setIsAddingDriver(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              onClick={handleAddDriver}
            >
              Save Driver
            </button>
          </div>
        </Card>
      )}

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

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No drivers found. {searchQuery && "Try a different search term."}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map((driver) => (
              <Card key={driver.id} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar alt={driver.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {driver.name}
                        </h3>
                        <p className="text-sm text-gray-500">{driver.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            driver.status === "active" || driver.status === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {driver.status}
                        </span>
                        <button 
                          className="p-1 text-gray-500 hover:text-primary-500"
                          title="Edit driver"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-500 hover:text-red-500"
                          title="Delete driver"
                          onClick={() => handleDeleteDriver(driver.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Vehicle</p>
                        <p className="font-medium">
                          {driver.vehicleType} • {driver.licensePlate || driver.vehiclePlate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-medium">⭐ {driver.rating}/5.0</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deliveries</p>
                        <p className="font-medium">{driver.totalDeliveries || driver.completedDeliveries || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{driver.phone}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formatLocation(driver.currentLocation)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 