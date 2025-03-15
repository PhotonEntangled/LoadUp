import { NextRequest, NextResponse } from 'next/server';
import { ShipmentService } from '@loadup/database/services/shipmentService';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Initialize shipment service
const shipmentService = new ShipmentService();

// Schema for updating a shipment
const updateShipmentSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED']).optional(),
  driverId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().optional(),
  location: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

/**
 * GET /api/shipments/[id]
 * Get a specific shipment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Get shipment
    const shipment = await shipmentService.getShipmentById(id);
    
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    // Check if user has permission to view this shipment
    if (session.user.role === 'customer' && shipment.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (session.user.role === 'driver' && shipment.driverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}

/**
 * PATCH /api/shipments/[id]
 * Update a shipment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Get existing shipment
    const existingShipment = await shipmentService.getShipmentById(id);
    
    if (!existingShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    // Check permissions based on role
    if (session.user.role === 'customer' && existingShipment.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (session.user.role === 'driver' && existingShipment.driverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const data = updateShipmentSchema.parse(body);
    
    // Apply role-based restrictions
    if (session.user.role === 'driver') {
      // Drivers can only update status and add notes/location
      const { status, notes, location } = data;
      
      if (Object.keys(data).some(key => !['status', 'notes', 'location'].includes(key))) {
        return NextResponse.json({ error: 'Drivers can only update status, notes, and location' }, { status: 403 });
      }
      
      // Update shipment status
      if (status) {
        const updatedShipment = await shipmentService.updateShipmentStatus(
          id, 
          status, 
          session.user.id, 
          notes, 
          location
        );
        
        return NextResponse.json(updatedShipment);
      }
    } else if (session.user.role === 'customer') {
      // Customers can only cancel their shipments if they're still pending
      if (data.status && data.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers can only cancel shipments' }, { status: 403 });
      }
      
      if (existingShipment.status !== 'PENDING' && existingShipment.status !== 'ASSIGNED') {
        return NextResponse.json({ error: 'Shipments can only be cancelled when pending or assigned' }, { status: 403 });
      }
      
      // Cancel shipment
      if (data.status === 'CANCELLED') {
        const updatedShipment = await shipmentService.updateShipmentStatus(
          id, 
          'CANCELLED', 
          session.user.id, 
          data.notes
        );
        
        return NextResponse.json(updatedShipment);
      }
    } else if (session.user.role === 'admin') {
      // Admins can update any field
      
      // Handle driver assignment
      if (data.driverId && data.driverId !== existingShipment.driverId) {
        const updatedShipment = await shipmentService.assignDriver(
          id,
          data.driverId,
          session.user.id
        );
        
        // If there are other fields to update, continue with status update
        if (data.status) {
          await shipmentService.updateShipmentStatus(
            id,
            data.status,
            session.user.id,
            data.notes,
            data.location
          );
        }
        
        return NextResponse.json(updatedShipment);
      }
      
      // Handle status update
      if (data.status) {
        const updatedShipment = await shipmentService.updateShipmentStatus(
          id,
          data.status,
          session.user.id,
          data.notes,
          data.location
        );
        
        return NextResponse.json(updatedShipment);
      }
    }
    
    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  } catch (error) {
    console.error('Error updating shipment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins can delete shipments
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    
    // Delete shipment
    const deletedShipment = await shipmentService.deleteShipment(id);
    
    if (!deletedShipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
} 