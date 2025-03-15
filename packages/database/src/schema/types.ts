export enum ShipmentStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface Shipment {
  id?: string;
  trackingNumber: string;
  status: ShipmentStatus;
  customerName: string;
  customerPhone?: string | null;
  pickupAddress: Address;
  deliveryAddress: Address;
  weight: number;
  dimensions: Dimensions;
  scheduledDate: Date;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date | null;
  notes?: string | null;
  driverId?: string | null;
  paymentStatus?: string | null;
  paymentAmount?: number | null;
  paymentDate?: Date | null;
} 