import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { PgTable } from 'drizzle-orm/pg-core';
import { errorHandler } from './middleware/errorHandler.js';
import { scheduleHealthChecks } from './utils/healthCheck.js';
import env from './config/env.js';
import { FEATURES } from './config/features.js';

// Mock database and logger if imports fail
let db;
let shipments;
let logger;

try {
  const databaseModule = await import('../../database/dist/index.js');
  db = databaseModule.db;
  
  const schemaModule = await import('../../database/dist/schema/shipments.js');
  shipments = schemaModule.shipments;
  
  const loggerModule = await import('../../shared/dist/logger.js');
  logger = loggerModule.logger;
} catch (error) {
  console.error('Error importing modules:', error);
  // Fallback implementations
  db = {
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [{}] }) }),
    query: { shipments: { findFirst: () => null } }
  };
  shipments = {};
  logger = {
    error: console.error,
    info: console.info,
    warn: console.warn
  };
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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
    const allShipments = await db.select().from(shipments as unknown as PgTable<any>);
    res.json({ data: allShipments });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const validatedData = shipmentSchema.parse(req.body);
    const [newShipment] = await db.insert(shipments as unknown as PgTable<any>).values(validatedData).returning();
    res.status(201).json({ data: newShipment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      logger.error('Error creating shipment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/shipments/:id', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    
    // Check if shipments.id is defined
    if (!shipments.id) {
      return res.status(500).json({ error: 'Database schema not properly loaded' });
    }
    
    const shipment = await db.query.shipments.findFirst({
      where: eq(shipments.id, req.params.id)
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json({ data: shipment });
  } catch (error) {
    logger.error('Error fetching shipment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export { app }; 