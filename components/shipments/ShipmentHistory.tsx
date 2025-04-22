import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

// Define the type locally instead of importing from shared package
interface ShipmentHistoryEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

interface ShipmentHistoryProps {
  shipmentId: string;
}

export default function ShipmentHistoryComponent({ shipmentId }: ShipmentHistoryProps) {
  const [history, setHistory] = useState<ShipmentHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for development
    const mockHistory: ShipmentHistoryEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        status: 'ORDER_PLACED',
        location: 'Online',
        description: 'Order was placed by customer'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        status: 'PROCESSING',
        location: 'Warehouse',
        description: 'Order is being processed at the warehouse'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'SHIPPED',
        location: 'Distribution Center',
        description: 'Package has been shipped'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        status: 'IN_TRANSIT',
        location: 'Chicago, IL',
        description: 'Package is in transit to the destination'
      },
      {
        id: '5',
        timestamp: new Date().toISOString(), // Now
        status: 'OUT_FOR_DELIVERY',
        location: 'Local Delivery Center',
        description: 'Package is out for delivery'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  }, [shipmentId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ORDER_PLACED: 'bg-blue-500',
      PROCESSING: 'bg-yellow-500',
      SHIPPED: 'bg-purple-500',
      IN_TRANSIT: 'bg-indigo-500',
      OUT_FOR_DELIVERY: 'bg-green-500',
      DELIVERED: 'bg-green-700',
      FAILED_DELIVERY: 'bg-red-500',
      RETURNED: 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((event, index) => (
            <div key={event.id} className="relative pl-6 pb-6">
              {/* Timeline connector line */}
              {index < history.length - 1 && (
                <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              {/* Timeline icon */}
              <div className={`absolute left-0 top-1 w-5 h-5 rounded-full ${getStatusColor(event.status)} flex items-center justify-center`}>
                <span className="text-white text-xs">•</span>
              </div>
              
              {/* Content */}
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{event.status.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="mb-1">
                    <span className="text-xs font-semibold">Location: </span>
                    <span className="text-xs">{event.location}</span>
                  </div>
                  <p className="text-sm">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 