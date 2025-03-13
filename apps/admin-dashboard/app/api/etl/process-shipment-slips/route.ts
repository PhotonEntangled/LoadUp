import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { ShipmentSlipProcessor } from '@loadup/api/services/etl/shipments-processor';

export async function POST(req: Request) {
  try {
    const { userId, sessionClaims } = auth();
    if (!userId || sessionClaims?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    if (!Array.isArray(data)) {
      return new NextResponse('Invalid input: Expected array of shipment slips', { 
        status: 400 
      });
    }

    const processor = new ShipmentSlipProcessor();
    
    // Process the batch
    const processResults = await processor.processBatch(data);
    
    // Transform staged shipments
    const transformResults = await processor.transformStagedShipments();

    return NextResponse.json({
      success: true,
      results: {
        processing: processResults,
        transformation: transformResults,
      },
    });
  } catch (error) {
    console.error('Error processing shipment slips:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 