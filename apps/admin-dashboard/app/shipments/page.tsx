"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/shared/Card";
import { Search } from "lucide-react";

// Add type definition for Shipment
type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  customerName?: string;
  customer?: string;
  origin?: string;
  destination?: string;
  driver?: string;
  scheduledDelivery?: string;
};

export default function ShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Add useEffect to fetch shipments from API
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3002/api/shipments');
        const data = await response.json();
        setShipments(data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Filter shipments based on search query
  const filteredShipments = shipments.filter(shipment => 
    shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shipment.customer || shipment.customerName || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shipment.origin || shipment.pickupAddress?.city || '')?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shipment.destination || shipment.deliveryAddress?.city || '')?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Shipments</h1>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          New Shipment
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-center space-x-2 border rounded-lg px-3 py-2">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shipments..."
            className="flex-1 outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="mt-6 text-center">Loading shipments...</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No shipments found
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-500">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            shipment.status === "IN_TRANSIT"
                              ? "bg-blue-100 text-blue-800"
                              : shipment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : shipment.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.pickupAddress?.city || shipment.origin || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.deliveryAddress?.city || shipment.destination || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.customerName || shipment.customer || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.driver || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.scheduledDelivery || "Not scheduled"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 