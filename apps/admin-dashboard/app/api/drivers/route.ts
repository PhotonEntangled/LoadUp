import { NextResponse } from 'next/server';
import { db } from '@loadup/database';
import { drivers } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { canManageDrivers } from '@loadup/shared/src/utils/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageDrivers(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allDrivers = await db.query.drivers.findMany({
      with: {
        user: true,
        assignedShipments: true,
      },
    });
    return NextResponse.json(allDrivers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageDrivers(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      truckType,
      licenseNumber,
      licenseExpiry,
      capacity,
    } = body;

    const newDriver = await db.insert(drivers).values({
      firstName,
      lastName,
      email,
      phoneNumber,
      truckType,
      status: 'available',
      licenseNumber,
      licenseExpiry,
      capacity,
    }).returning();

    return NextResponse.json(newDriver[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageDrivers(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, id))
      .returning();

    return NextResponse.json(updatedDriver[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageDrivers(session.user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
    }

    await db.delete(drivers).where(eq(drivers.id, id));
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete driver' }, { status: 500 });
  }
} 