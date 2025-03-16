import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureSecurityMiddleware } from './config/security.js';
import { z } from 'zod';
import { PgTable } from 'drizzle-orm/pg-core';
import { errorHandler } from './middleware/errorHandler.js';
import { scheduleHealthChecks } from './utils/healthCheck.js';
import env from './config/env.js';
import { FEATURES } from './config/features.js';
import { SQL } from 'drizzle-orm';

dotenv.config();

// Mock database and logger if imports fail
let db: any;
let shipments: any;
let logger: any;
let eq: any;

try {
  const databaseModule = await import('@loadup/database');
  db = databaseModule.db;
  eq = databaseModule.eq;
  
  const schemaModule = await import('@loadup/database/schema');
  shipments = schemaModule.shipments;
  
  const loggerModule = await import('@loadup/shared/logger');
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
  eq = (a: any, b: any): SQL<unknown> => {
    return { type: 'custom', sql: `${a} = ${b}` } as unknown as SQL<unknown>;
  };
}

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Configure security middleware
configureSecurityMiddleware(app);

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
    const allShipments = await db.select().from(shipments as any);
    res.json({ data: allShipments });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const validatedData = shipmentSchema.parse(req.body);
    const result = await db.insert(shipments as any).values(validatedData).returning();
    // Handle different return types safely
    const newShipment = Array.isArray(result) ? result[0] : result;
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
    // Check if shipments.id is defined
    if (!shipments.id) {
      return res.status(500).json({ error: 'Database schema not properly loaded' });
    }
    
    const shipment = await db.query.shipments.findFirst({
      where: eq(shipments.id as any, req.params.id)
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
  res.json({ status: 'healthy' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

export { app }; 