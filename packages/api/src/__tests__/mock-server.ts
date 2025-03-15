import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Mock database and logger
const mockDb = {
  select: jest.fn().mockReturnValue({
    from: jest.fn().mockResolvedValue([])
  }),
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{}])
    })
  }),
  query: { shipments: { findFirst: jest.fn() } }
};

const mockShipments = {};

const mockLogger = {
  error: console.error,
  info: console.info,
  warn: console.warn
};

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Validation schemas
const shipmentSchema = z.object({
  trackingNumber: z.string(),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled']),
  customerName: z.string(),
  pickupAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }),
  location: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional()
});

// Routes
app.get('/api/shipments', async (req, res) => {
  try {
    // Use the mock function directly
    const allShipments = await mockDb.select().from();
    res.json({ data: allShipments });
  } catch (error) {
    mockLogger.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const validatedData = shipmentSchema.parse(req.body);
    // Use the mock function directly
    const [newShipment] = await mockDb.insert().values().returning();
    res.status(201).json({ data: newShipment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      mockLogger.error('Error creating shipment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/shipments/:id', async (req, res) => {
  try {
    // Mock implementation for testing
    if (req.params.id === '99999999-9999-9999-9999-999999999999') {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    // Return a mock shipment
    res.json({ 
      data: {
        id: req.params.id,
        trackingNumber: 'TEST456',
        status: 'pending',
        customerName: 'Jane Doe',
        pickupAddress: {
          street: '789 Pickup Blvd',
          city: 'Pickup Town',
          state: 'PT',
          zipCode: '13579'
        },
        deliveryAddress: {
          street: '012 Delivery Rd',
          city: 'Delivery Town',
          state: 'DT',
          zipCode: '24680'
        }
      }
    });
  } catch (error) {
    mockLogger.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export { app }; 