export interface DeliveryStop {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedArrival?: Date;
  actualArrival?: Date;
  notes?: string;
}

export interface Shipment {
  id: string;
  trackingCode: string;
  stops: DeliveryStop[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedDriver?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TruckDriver {
  id: string;
  firstName: string;
  lastName: string;
  truckType: 'box_truck' | 'semi' | 'van';
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  currentShipment?: string;
  status: 'available' | 'on_delivery' | 'offline';
}

export interface MapMarker {
  latitude: number;
  longitude: number;
  title: string;
  type: 'delivery' | 'truck';
  status?: DeliveryStop['status'];
  estimatedArrival?: Date;
  truckType?: TruckDriver['truckType'];
  currentShipment?: string;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} 