import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';

interface ShipmentCardProps {
  shipment: {
    id: string;
    trackingNumber: string;
    status: 'pending' | 'in_transit' | 'delivered' | 'failed';
    origin: string;
    destination: string;
    estimatedDelivery: string;
    customer: {
      name: string;
      email: string;
    };
  };
  onViewDetails: (id: string) => void;
}

export function ShipmentCard({ shipment, onViewDetails }: ShipmentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_transit':
        return <Badge variant="secondary">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          #{shipment.trackingNumber}
        </CardTitle>
        {getStatusBadge(shipment.status)}
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-xs text-muted-foreground">From</div>
            <div className="text-xs text-muted-foreground">To</div>
            <div className="text-sm font-medium">{shipment.origin}</div>
            <div className="text-sm font-medium">{shipment.destination}</div>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">Customer</div>
          <div className="text-sm font-medium">{shipment.customer.name}</div>
          <div className="text-xs">{shipment.customer.email}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Est. Delivery: <span className="font-medium">{shipment.estimatedDelivery}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(shipment.id)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 