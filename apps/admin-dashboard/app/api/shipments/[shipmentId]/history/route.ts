import { NextResponse } from 'next/server';
import { useSession, signIn, signOut } from "next-auth/react";
import { db } from '@loadup/database';
import { shipmentHistory, users } from '@loadup/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { shipmentId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch shipment history with user details
    const history = await db.query.shipmentHistory.findMany({
      where: eq(shipmentHistory.shipmentId, params.shipmentId),
      with: {
        updatedBy: {
          columns: {
            email: true,
          },
        },
      },
      orderBy: (history, { desc }) => [desc(history.timestamp)],
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching shipment history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 