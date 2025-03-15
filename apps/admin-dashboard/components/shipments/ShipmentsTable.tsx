import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';
import { Select } from '../ui/select.js';
import { Badge } from '../ui/badge.js';
import { useAuth } from '@loadup/shared/src/hooks/useAuth';
import { formatDistance } from 'date-fns';

type Shipment = {
  id: string;
  trackingNumber: string;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';
  customerName: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
};

type Driver = {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
};

export function ShipmentsTable() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchShipments = async () => {
    try {
      const url = statusFilter 
        ? `http://localhost:3002/api/shipments?status=${statusFilter}`
        : 'http://localhost:3002/api/shipments';
      const res = await fetch(url);
      const data = await res.json();
      setShipments(data.data || data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/drivers');
      const data = await res.json();
      setDrivers(data.data || data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchShipments(), fetchDrivers()]);
      setLoading(false);
    };
    loadData();
  }, [statusFilter]);

  const handleAssignDriver = async (shipmentId: string, driverId: string) => {
    try {
      const res = await fetch(`http://localhost:3002/api/shipments?id=${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          status: 'ASSIGNED',
        }),
      });

      if (res.ok) {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const getStatusBadgeColor = (status: Shipment['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Shipments</span>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-48"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Last Update</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell>
                  {shipment.pickupAddress ? 
                    `${shipment.pickupAddress.street}, ${shipment.pickupAddress.city}, ${shipment.pickupAddress.state} ${shipment.pickupAddress.zipCode}` : 
                    'No address provided'}
                </TableCell>
                <TableCell>
                  {shipment.deliveryAddress ? 
                    `${shipment.deliveryAddress.street}, ${shipment.deliveryAddress.city}, ${shipment.deliveryAddress.state} ${shipment.deliveryAddress.zipCode}` : 
                    'No address provided'}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isAdmin && shipment.status === 'PENDING' ? (
                    <Select
                      value={shipment.driverId || ''}
                      onValueChange={(driverId) => handleAssignDriver(shipment.id, driverId)}
                    >
                      <option value="">Assign Driver</option>
                      {drivers
                        .filter((d) => d.status === 'AVAILABLE')
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    drivers.find((d) => d.id === shipment.driverId)?.name || 'Unassigned'
                  )}
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(shipment.updatedAt), new Date(), { addSuffix: true })}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open shipment details/edit modal
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 