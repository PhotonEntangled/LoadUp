import { NextRequest, NextResponse } from 'next/server';
import { ShipmentService } from '@loadup/database/services/shipmentService';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Initialize shipment service
const shipmentService = new ShipmentService();

// Schema for document upload
const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.string().min(1, 'Document type is required'),
  url: z.string().url('Valid document URL is required'),
});

/**
 * GET /api/shipments/[id]/documents
 * Get all documents for a shipment
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
    
    // Get shipment to check permissions
    const shipment = await shipmentService.getShipmentById(id);
    
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    // Check if user has permission to view this shipment's documents
    if (session.user.role === 'customer' && shipment.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (session.user.role === 'driver' && shipment.driverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Return documents
    return NextResponse.json(shipment.documents || []);
  } catch (error) {
    console.error('Error fetching shipment documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

/**
 * POST /api/shipments/[id]/documents
 * Upload a document for a shipment
 */
export async function POST(
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
    
    // Get shipment to check permissions
    const shipment = await shipmentService.getShipmentById(id);
    
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    // Check if user has permission to add documents to this shipment
    if (session.user.role === 'customer' && shipment.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    if (session.user.role === 'driver' && shipment.driverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const data = documentUploadSchema.parse(body);
    
    // Upload document
    const document = await shipmentService.uploadDocument(
      id,
      data.name,
      data.type,
      data.url,
      session.user.id
    );
    
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error uploading document:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid document data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
} 