import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@loadup/database';
import { and, eq } from 'drizzle-orm';
import { shipments, drivers } from '@loadup/database/schema';
import { z } from 'zod';

// Validation schemas
const createShipmentSchema = z.object({
  pickupAddress: z.string(),
  deliveryAddress: z.string(),
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED']),
  driverId: z.string().optional(),
});

const updateShipmentSchema = createShipmentSchema.partial();

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const userId = session.user.id;
    const role = session.user.role;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let query = db.select().from(shipments);

    // Filter by role
    if (role === 'driver') {
      query = query.where(eq(shipments.driverId, userId));
    }

    // Filter by status if provided
    if (status) {
      query = query.where(eq(shipments.status, status));
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    
    const userId = session.user.id;
    const role = session.user.role;
    
    if (role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const validatedData = createShipmentSchema.parse(body);

    const result = await db.insert(shipments).values({
      ...validatedData,
      createdBy: userId,
      updatedAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error creating shipment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    
    const userId = session.user.id;
    const role = session.user.role;

    const url = new URL(req.url);
    const shipmentId = url.searchParams.get('id');
    if (!shipmentId) {
      return new NextResponse('Shipment ID is required', { status: 400 });
    }

    const body = await req.json();
    const validatedData = updateShipmentSchema.parse(body);

    // Check if user has permission to update
    const shipment = await db.query.shipments.findFirst({
      where: eq(shipments.id, shipmentId),
    });

    if (!shipment) {
      return new NextResponse('Shipment not found', { status: 404 });
    }

    if (role !== 'admin' && shipment.driverId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // If driver is updating, they can only update status
    if (role === 'driver') {
      const { status } = validatedData;
      if (!status) {
        return new NextResponse('Status is required', { status: 400 });
      }
      await db.update(shipments)
        .set({ 
          status,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(shipments.id, shipmentId));
    } else {
      // Admins can update all fields
      await db.update(shipments)
        .set({ 
          ...validatedData,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(shipments.id, shipmentId));
    }

    // Log the update in shipment history
    await db.insert(shipments.history).values({
      shipmentId,
      status: validatedData.status || shipment.status,
      updatedBy: userId,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    console.error('Error updating shipment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    
    const userId = session.user.id;
    const role = session.user.role;
    
    if (role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const url = new URL(req.url);
    const shipmentId = url.searchParams.get('id');
    if (!shipmentId) {
      return new NextResponse('Shipment ID is required', { status: 400 });
    }

    await db.delete(shipments)
      .where(eq(shipments.id, shipmentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 