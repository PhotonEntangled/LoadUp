import { NextRequest, NextResponse } from 'next/server';
import { ShipmentService } from '@loadup/database/services/shipmentService';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Initialize shipment service
const shipmentService = new ShipmentService();

// Simplified schema for creating a shipment (MVP)
const createShipmentSchema = z.object({
  customerId: z.string().uuid(),
  description: z.string().optional(),
  pickupLocation: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  pickupContact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
  }),
  deliveryLocation: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  deliveryContact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
  }),
  pickupDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  deliveryDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

// Simplified schema for filtering shipments (MVP)
const shipmentFilterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
});

/**
 * GET /api/shipments
 * Get all shipments with basic filtering (MVP)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    
    // Convert searchParams to object (simplified for MVP)
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
    
    // Parse and validate filters
    const filters = shipmentFilterSchema.parse(queryParams);
    
    // Apply role-based filtering
    if (session.user.role === 'customer') {
      // Customers can only see their own shipments
      filters.customerId = session.user.id;
    } else if (session.user.role === 'driver') {
      // Drivers can only see shipments assigned to them
      filters.driverId = session.user.id;
    }
    // Admins can see all shipments (no additional filtering)
    
    // Get shipments with filters
    const shipments = await shipmentService.getShipments(filters);
    
    return NextResponse.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

/**
 * POST /api/shipments
 * Create a new shipment (simplified for MVP)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins and customers can create shipments
    if (!['admin', 'customer'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const data = createShipmentSchema.parse(body);
    
    // If customer is creating shipment, force customerId to be their own ID
    if (session.user.role === 'customer') {
      data.customerId = session.user.id;
    }
    
    // Create shipment with default status
    const shipmentData = {
      ...data,
      status: 'pending',
    };
    
    // Create shipment
    const shipment = await shipmentService.createShipment(shipmentData);
    
    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
} 