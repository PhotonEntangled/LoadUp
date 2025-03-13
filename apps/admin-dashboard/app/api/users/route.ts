import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@loadup/database';
import { users } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema for role update
const roleUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'DRIVER', 'READ_ONLY']),
});

// Schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Fetch all users
    const allUsers = await db.query.users.findMany({
      orderBy: users.createdAt,
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/users/[userId]/role
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { role } = roleUpdateSchema.parse(body);

    // Update user role
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, params.userId));

    return new NextResponse('Role updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating user role:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/users/[userId]/status
export async function updateStatus(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { status } = statusUpdateSchema.parse(body);

    // Update user status
    await db
      .update(users)
      .set({ status })
      .where(eq(users.id, params.userId));

    return new NextResponse('Status updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error updating user status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 