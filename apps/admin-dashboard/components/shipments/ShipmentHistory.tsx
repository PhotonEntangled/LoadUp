import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ShipmentHistory } from '@loadup/shared/types';

interface ShipmentHistoryProps {
  shipmentId: string;
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  PICKED_UP: 'bg-green-100 text-green-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const ShipmentHistoryView: React.FC<ShipmentHistoryProps> = ({
  shipmentId,
}) => {
  const [history, setHistory] = useState<ShipmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [shipmentId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/shipments/${shipmentId}/history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch shipment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'timestamp',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.original.timestamp), 'PPpp'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[row.original.status as keyof typeof STATUS_COLORS]
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'updatedBy',
      header: 'Updated By',
      cell: ({ row }) => row.original.updatedBy?.email || 'System',
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => row.original.notes || '-',
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.original.location;
        return location
          ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          : '-';
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment History</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}; 