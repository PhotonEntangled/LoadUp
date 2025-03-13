import { NextResponse } from 'next/server';
import { db } from '@loadup/database';
import { shipments, deliveryStops } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { canManageShipments } from '@loadup/shared/src/utils/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageShipments(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allShipments = await db.query.shipments.findMany({
      with: {
        deliveryStops: true,
        driver: true,
      },
    });
    return NextResponse.json(allShipments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageShipments(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trackingCode, status, assignedDriverId, deliveryStops: stops } = body;

    const newShipment = await db.insert(shipments).values({
      trackingCode,
      status,
      assignedDriverId,
    }).returning();

    if (stops && stops.length > 0) {
      await db.insert(deliveryStops).values(
        stops.map((stop: any) => ({
          shipmentId: newShipment[0].id,
          ...stop,
        }))
      );
    }

    return NextResponse.json(newShipment[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageShipments(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedShipment = await db
      .update(shipments)
      .set(updateData)
      .where(eq(shipments.id, id))
      .returning();

    return NextResponse.json(updatedShipment[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageShipments(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    await db.delete(shipments).where(eq(shipments.id, id));
    return NextResponse.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
} 