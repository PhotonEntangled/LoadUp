"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/shared/Card";
import { Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Simplified Shipment type for MVP
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
  pickupContact?: {
    name?: string;
  };
  deliveryContact?: {
    name?: string;
  };
  createdAt?: string;
  pickupDate?: string;
  deliveryDate?: string;
};

// Simplified filter state for MVP
type FilterState = {
  status: string;
  search: string;
  page: number;
};

export default function ShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simplified filter state for MVP
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    search: '',
    page: 1,
  });

  useEffect(() => {
    fetchShipments();
  }, [filters]);

  // Simplified fetch function for MVP
  const fetchShipments = async () => {
    try {
      setLoading(true);
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      queryParams.append('page', filters.page.toString());
      
      // Fetch shipments
      const response = await fetch(`/api/shipments?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      
      const data = await response.json();
      setShipments(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError('Failed to load shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified filter change handler for MVP
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  // Simplified address formatter for MVP
  const formatAddress = (location?: { city?: string; state?: string }) => {
    if (!location) return 'N/A';
    return [location.city, location.state].filter(Boolean).join(', ') || 'N/A';
  };

  // Simplified date formatter for MVP
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
        <h1 className="text-2xl font-bold">Shipments</h1>
        <Link href="/shipments/create">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Create Shipment
          </button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search shipments..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <select
              className="ml-4 px-4 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              className="ml-4 p-2 border rounded-lg hover:bg-gray-100"
              onClick={() => fetchShipments()}
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading shipments...</p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No shipments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.trackingNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAddress(shipment.pickupLocation)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.pickupContact?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAddress(shipment.deliveryLocation)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.deliveryContact?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(shipment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/shipments/${shipment.id}`}>
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="px-6 py-4 flex justify-between items-center border-t">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={filters.page === 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {filters.page}
            </span>
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={shipments.length < 50}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 