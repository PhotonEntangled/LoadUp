import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import { Avatar } from '../shared/Avatar.js';

interface DriverCardProps {
  driver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'on_delivery';
    vehicle: {
      type: string;
      licensePlate: string;
    };
    deliveriesCompleted: number;
    rating: number;
  };
  onViewProfile: (id: string) => void;
  onAssignShipment: (id: string) => void;
}

export function DriverCard({ driver, onViewProfile, onAssignShipment }: DriverCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'on_delivery':
        return <Badge variant="warning">On Delivery</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          <Avatar 
            src="" 
            alt={driver.name} 
            fallback={driver.name} 
            size="md" 
          />
          <div>
            <CardTitle className="text-sm font-medium">{driver.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{driver.email}</p>
          </div>
        </div>
        {getStatusBadge(driver.status)}
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-xs text-muted-foreground">Phone</div>
            <div className="text-xs text-muted-foreground">Vehicle</div>
            <div className="text-sm">{driver.phone}</div>
            <div className="text-sm">{driver.vehicle.type} ({driver.vehicle.licensePlate})</div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Deliveries</div>
              <div className="text-sm font-medium">{driver.deliveriesCompleted}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Rating</div>
              <div className="text-sm">{renderStars(driver.rating)}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewProfile(driver.id)}
          >
            View Profile
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onAssignShipment(driver.id)}
            disabled={driver.status !== 'active'}
          >
            Assign Shipment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 