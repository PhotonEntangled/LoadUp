import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Mock auth hook until the shared package is properly set up
// import { useAuth } from '@loadup/shared/src/hooks/useAuth';
import { formatDistance } from 'date-fns';

type Shipment = {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  customerName: string;
  origin: string;
  destination: string;
  createdAt: string;
  estimatedDelivery?: string;
};

// Mock auth hook
const useAuth = () => {
  return {
    user: { id: '1', name: 'Admin User', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    isAdmin: () => true // Add isAdmin function
  };
};

export function ShipmentsTable() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      // Mock data for development
      const mockShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'TRK12345',
          status: 'pending',
          customerName: 'John Doe',
          origin: 'Chicago, IL',
          destination: 'New York, NY',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString() // 3 days from now
        },
        {
          id: '2',
          trackingNumber: 'TRK67890',
          status: 'in_transit',
          customerName: 'Jane Smith',
          origin: 'Los Angeles, CA',
          destination: 'Seattle, WA',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          estimatedDelivery: new Date(Date.now() + 86400000).toISOString() // 1 day from now
        },
        {
          id: '3',
          trackingNumber: 'TRK54321',
          status: 'delivered',
          customerName: 'Bob Johnson',
          origin: 'Miami, FL',
          destination: 'Atlanta, GA',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          estimatedDelivery: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];

      // Simulate API call
      setTimeout(() => {
        setShipments(mockShipments);
        setTotalPages(1);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [page, searchTerm, statusFilter]);

  const getStatusBadge = (status: Shipment['status']) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleAssignDriver = (shipmentId: string, driverId: string) => {
    console.log(`Assigning driver ${driverId} to shipment ${shipmentId}`);
    // Implement driver assignment logic here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipments</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search shipments..."
            value={searchTerm}
            onChange={handleSearch}
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="p-2 border rounded max-w-xs"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No shipments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    shipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">
                          {shipment.trackingNumber}
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>{shipment.customerName}</TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>
                          {formatDistance(new Date(shipment.createdAt), new Date(), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          {shipment.estimatedDelivery
                            ? formatDistance(new Date(shipment.estimatedDelivery), new Date(), {
                                addSuffix: true,
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/shipments/${shipment.id}`}
                            >
                              View
                            </Button>
                            {isAdmin() && shipment.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignDriver(shipment.id, 'driver-1')}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 