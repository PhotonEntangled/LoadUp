import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@loadup/database';
// import { shipmentHistory } from '@loadup/database/schema';

// Define types for our mock data
type HistoryEntry = {
  id: string;
  timestamp: string;
  status: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  notes: string;
  updatedBy: {
    id: string;
    name: string;
  };
};

// Mock shipment history data with index signature
const mockShipmentHistory: { [key: string]: HistoryEntry[] } = {
  "1": [
    {
      id: "h1",
      timestamp: "2023-10-15T08:30:00Z",
      status: "PICKED_UP",
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: "San Francisco, CA"
      },
      notes: "Package picked up from sender",
      updatedBy: {
        id: "u1",
        name: "John Driver"
      }
    },
    {
      id: "h2",
      timestamp: "2023-10-15T12:45:00Z",
      status: "IN_TRANSIT",
      location: {
        lat: 38.5816,
        lng: -121.4944,
        address: "Sacramento, CA"
      },
      notes: "Package in transit to destination",
      updatedBy: {
        id: "u1",
        name: "John Driver"
      }
    },
    {
      id: "h3",
      timestamp: "2023-10-16T09:15:00Z",
      status: "OUT_FOR_DELIVERY",
      location: {
        lat: 34.0522,
        lng: -118.2437,
        address: "Los Angeles, CA"
      },
      notes: "Package out for delivery",
      updatedBy: {
        id: "u2",
        name: "Jane Driver"
      }
    }
  ],
  "2": [
    {
      id: "h4",
      timestamp: "2023-10-14T10:00:00Z",
      status: "PICKED_UP",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "New York, NY"
      },
      notes: "Package picked up from sender",
      updatedBy: {
        id: "u3",
        name: "Mike Driver"
      }
    },
    {
      id: "h5",
      timestamp: "2023-10-14T15:30:00Z",
      status: "IN_TRANSIT",
      location: {
        lat: 39.9526,
        lng: -75.1652,
        address: "Philadelphia, PA"
      },
      notes: "Package in transit to destination",
      updatedBy: {
        id: "u3",
        name: "Mike Driver"
      }
    }
  ]
};

// GET shipment history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shipmentId = params.id;
  
  // Check if shipment exists
  if (!mockShipmentHistory[shipmentId]) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }
  
  // Get query parameters for filtering
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');
  
  let history = [...mockShipmentHistory[shipmentId]];
  
  // Apply date filters if provided
  if (fromDate) {
    const fromTimestamp = new Date(fromDate).getTime();
    history = history.filter(entry => 
      new Date(entry.timestamp).getTime() >= fromTimestamp
    );
  }
  
  if (toDate) {
    const toTimestamp = new Date(toDate).getTime();
    history = history.filter(entry => 
      new Date(entry.timestamp).getTime() <= toTimestamp
    );
  }
  
  // Sort by timestamp (newest first)
  history.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return NextResponse.json({
    shipmentId,
    history,
    total: history.length
  });
}

// POST to add history entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const shipmentId = params.id;
  
  // Check if shipment exists
  if (!mockShipmentHistory[shipmentId]) {
    return NextResponse.json(
      { error: "Shipment not found" },
      { status: 404 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.status || !body.location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create new history entry
    const newEntry: HistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: body.status,
      location: body.location,
      notes: body.notes || "",
      updatedBy: body.updatedBy || {
        id: "system",
        name: "System"
      }
    };
    
    // In a real implementation, save to database
    // mockShipmentHistory[shipmentId].push(newEntry);
    
    return NextResponse.json({
      success: true,
      entry: newEntry
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add history entry" },
      { status: 500 }
    );
  }
} 