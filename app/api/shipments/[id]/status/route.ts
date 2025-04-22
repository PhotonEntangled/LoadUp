import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@loadup/database';
// import { shipments } from '@loadup/database/schema';

// Define types for our mock data
type ShipmentLocation = {
  lat: number;
  lng: number;
  address: string;
};

type StatusEvent = {
  id: string;
  timestamp: string;
  status: string;
  location: ShipmentLocation;
  notes: string;
};

type ShipmentStatus = {
  id: string;
  status: string;
  lastUpdated: string;
  location: ShipmentLocation;
  estimatedDelivery: string;
  events: StatusEvent[];
};

// Mock shipment status data with index signature
const mockShipmentStatuses: { [key: string]: ShipmentStatus } = {
  "1": {
    id: "1",
    status: "IN_TRANSIT",
    lastUpdated: "2023-10-15T12:45:00Z",
    location: {
      lat: 38.5816,
      lng: -121.4944,
      address: "Sacramento, CA"
    },
    estimatedDelivery: "2023-10-17T18:00:00Z",
    events: [
      {
        id: "e1",
        timestamp: "2023-10-15T08:30:00Z",
        status: "PICKED_UP",
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: "San Francisco, CA"
        },
        notes: "Package picked up from sender"
      },
      {
        id: "e2",
        timestamp: "2023-10-15T12:45:00Z",
        status: "IN_TRANSIT",
        location: {
          lat: 38.5816,
          lng: -121.4944,
          address: "Sacramento, CA"
        },
        notes: "Package in transit to destination"
      }
    ]
  },
  "2": {
    id: "2",
    status: "OUT_FOR_DELIVERY",
    lastUpdated: "2023-10-16T09:15:00Z",
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: "Los Angeles, CA"
    },
    estimatedDelivery: "2023-10-16T17:00:00Z",
    events: [
      {
        id: "e3",
        timestamp: "2023-10-14T10:00:00Z",
        status: "PICKED_UP",
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: "New York, NY"
        },
        notes: "Package picked up from sender"
      },
      {
        id: "e4",
        timestamp: "2023-10-14T15:30:00Z",
        status: "IN_TRANSIT",
        location: {
          lat: 39.9526,
          lng: -75.1652,
          address: "Philadelphia, PA"
        },
        notes: "Package in transit to destination"
      },
      {
        id: "e5",
        timestamp: "2023-10-16T09:15:00Z",
        status: "OUT_FOR_DELIVERY",
        location: {
          lat: 34.0522,
          lng: -118.2437,
          address: "Los Angeles, CA"
        },
        notes: "Package out for delivery"
      }
    ]
  }
};

// GET shipment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shipmentId = params.id;
  
  // Check if shipment exists
  if (!mockShipmentStatuses[shipmentId]) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(mockShipmentStatuses[shipmentId]);
}

// PATCH to update shipment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shipmentId = params.id;
  
  // Check if shipment exists
  if (!mockShipmentStatuses[shipmentId]) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    // Create new status event
    const newEvent: StatusEvent = {
      id: `e${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: body.status,
      location: body.location || mockShipmentStatuses[shipmentId].location,
      notes: body.notes || ""
    };
    
    // In a real implementation, update the database
    // Update the mock data for demonstration
    const updatedStatus: ShipmentStatus = {
      ...mockShipmentStatuses[shipmentId],
      status: body.status,
      lastUpdated: newEvent.timestamp,
      location: newEvent.location,
      events: [newEvent, ...mockShipmentStatuses[shipmentId].events]
    };
    
    // In a real implementation, save to database
    // mockShipmentStatuses[shipmentId] = updatedStatus;
    
    return NextResponse.json({
      success: true,
      status: updatedStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update shipment status" },
      { status: 500 }
    );
  }
} 