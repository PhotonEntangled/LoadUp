"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Truck, Package, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";

// Simplified Shipment type for driver view (MVP)
type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  pickupLocation?: {
    city?: string;
    state?: string;
  };
  deliveryLocation?: {
    city?: string;
    state?: string;
  };
  pickupDate?: string;
  deliveryDate?: string;
};

export default function DriverDashboardPage() {
  const [assignments, setAssignments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Simplified fetch function for MVP
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // For MVP, we'll use the same shipments endpoint
      // In a real app, we'd have a driver-specific endpoint
      const response = await fetch('/api/shipments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      // For MVP, we'll just pretend these are assigned to the driver
      setAssignments(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified address formatter for MVP
  const formatAddress = (location?: { city?: string; state?: string }) => {
    if (!location) return 'N/A';
    return [location.city, location.state].filter(Boolean).join(', ') || 'N/A';
  };

  // Simplified status class getter for MVP
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <button
          className="p-2 border rounded-lg hover:bg-gray-100"
          onClick={fetchAssignments}
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned Shipments</p>
              <p className="text-2xl font-semibold">{assignments.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Transit</p>
              <p className="text-2xl font-semibold">
                {assignments.filter(a => a.status.toLowerCase() === 'in_transit').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-semibold">
                {assignments.filter(a => a.status.toLowerCase() === 'delivered').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">My Assignments</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.trackingNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAddress(assignment.pickupLocation)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(assignment.pickupDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAddress(assignment.deliveryLocation)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(assignment.deliveryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/driver/shipments/${assignment.id}`}>
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </button>
                      </Link>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => alert('Update status feature will be implemented in the future')}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Map View</h2>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500 mb-4">
            Map integration will be available in a future update.
          </p>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      </Card>
    </div>
  );
} 