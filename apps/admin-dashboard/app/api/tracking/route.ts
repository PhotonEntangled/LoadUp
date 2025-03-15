import { NextRequest, NextResponse } from 'next/server';
import { ShipmentService } from '@loadup/database/services/shipmentService';
import { isValidTrackingNumber } from '@loadup/database/utils/tracking';
import { z } from 'zod';

// Initialize shipment service
const shipmentService = new ShipmentService();

// Schema for tracking request
const trackingSchema = z.object({
  trackingNumber: z.string().refine(isValidTrackingNumber, {
    message: 'Invalid tracking number format. Expected format: LU-YYYYMMDD-XXXXX'
  })
});

/**
 * GET /api/tracking?trackingNumber=LU-YYYYMMDD-XXXXX
 * Public API to track a shipment by tracking number
 * This endpoint is public and does not require authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get tracking number from query params
    const searchParams = request.nextUrl.searchParams;
    const trackingNumber = searchParams.get('trackingNumber');
    
    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 });
    }
    
    // Validate tracking number
    try {
      trackingSchema.parse({ trackingNumber });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
      }
      throw error;
    }
    
    // Get shipment by tracking number
    const shipment = await shipmentService.getShipmentByTrackingNumber(trackingNumber);
    
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }
    
    // Return limited public information
    return NextResponse.json({
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      priority: shipment.priority,
      scheduledPickupTime: shipment.scheduledPickupTime,
      estimatedDeliveryTime: shipment.estimatedDeliveryTime,
      actualPickupTime: shipment.actualPickupTime,
      actualDeliveryTime: shipment.actualDeliveryTime,
      // Only return city, state, country for privacy
      pickupLocation: shipment.pickupAddress ? {
        city: shipment.pickupAddress.city,
        state: shipment.pickupAddress.state,
        country: shipment.pickupAddress.country
      } : null,
      deliveryLocation: shipment.deliveryAddress ? {
        city: shipment.deliveryAddress.city,
        state: shipment.deliveryAddress.state,
        country: shipment.deliveryAddress.country
      } : null,
      // Include shipment events with limited information
      events: shipment.events?.map(event => ({
        status: event.status,
        timestamp: event.createdAt,
        location: event.location ? {
          city: event.location.city,
          state: event.location.state,
          country: event.location.country
        } : null
      })) || []
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json({ error: 'Failed to track shipment' }, { status: 500 });
  }
} 