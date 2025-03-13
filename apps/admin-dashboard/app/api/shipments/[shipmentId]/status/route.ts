import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@loadup/database';
import { shipments, shipmentHistory } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { shipmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { status, notes, location } = statusUpdateSchema.parse(body);

    // Start a transaction
    await db.transaction(async (tx) => {
      // Update shipment status
      await tx
        .update(shipments)
        .set({ 
          status,
          updatedAt: new Date(),
        })
        .where(eq(shipments.id, params.shipmentId));

      // Create history log
      await tx.insert(shipmentHistory).values({
        shipmentId: params.shipmentId,
        status,
        updatedById: userId,
        notes,
        location,
        timestamp: new Date(),
      });
    });

    return new NextResponse('Status updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating shipment status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 