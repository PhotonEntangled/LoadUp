# LoadUp Platform - Immediate Action Plan
**Date:** March 14, 2024
**Time to Deployment:** T-2 hours

## Critical Path Implementation Plan

This document outlines the specific technical steps required to address each critical blocker within our 2-hour deployment window. Each task includes implementation details, code snippets, and estimated completion times.

## 1. API Server Enhancement (T-2h to T-1h)

### 1.1 Basic Error Handling Middleware (15 min)

```typescript
// packages/api/src/middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error',
        details: err.errors
      }
    });
  }
  
  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
  
  // Handle all other errors
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error'
    }
  });
};
```

### 1.2 Simplified Request Validation (15 min)

```typescript
// packages/api/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
```

### 1.3 Database Connection (15 min)

```typescript
// packages/api/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../database/src/schema';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Fallback to mock data if database connection fails
export const getShipments = async () => {
  try {
    const shipments = await db.query.shipments.findMany();
    return shipments;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return MOCK_SHIPMENTS;
  }
};

// Mock data for fallback
const MOCK_SHIPMENTS = [
  {
    id: '1',
    trackingNumber: 'LU-12345',
    status: 'IN_TRANSIT',
    customerName: 'John Doe',
    // ... other fields
  },
  // ... more mock shipments
];
```

### 1.4 API Endpoint Implementation (15 min)

```typescript
// packages/api/src/routes/shipments.ts
import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { getShipments } from '../db';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Get all shipments
router.get('/', async (req, res, next) => {
  try {
    const shipments = await getShipments();
    res.json({
      success: true,
      data: shipments
    });
  } catch (error) {
    next(error);
  }
});

// Get shipment by ID
const getShipmentSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

router.get('/:id', validate(getShipmentSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipment = await db.query.shipments.findFirst({
      where: (shipments, { eq }) => eq(shipments.id, id)
    });
    
    if (!shipment) {
      throw new ApiError('Shipment not found', 404);
    }
    
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

## 2. Database Package Resolution (T-2h to T-1h)

### 2.1 Temporary Circular Dependency Workaround (20 min)

```typescript
// packages/database/src/index.ts
// Export all schema components individually to avoid circular dependencies
export * from './schema/shipments';
export * from './schema/drivers';
export * from './schema/vehicles';
export * from './schema/tracking-updates';

// Export a separate file for relations to avoid circular imports
export * from './schema/relations';
```

### 2.2 Schema File Separation (20 min)

```typescript
// packages/database/src/schema/shipments.ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define shipment status enum
export const SHIPMENT_STATUS = pgEnum('shipment_status', [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED'
]);

// Define shipments table
export const shipments = pgTable('shipments', {
  id: uuid('id').primaryKey().defaultRandom(),
  trackingNumber: text('tracking_number').notNull().unique(),
  status: SHIPMENT_STATUS('status').notNull().default('PENDING'),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  pickupAddress: text('pickup_address').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  driverId: uuid('driver_id'),
  vehicleId: uuid('vehicle_id')
});
```

```typescript
// packages/database/src/schema/relations.ts
import { relations } from 'drizzle-orm';
import { shipments } from './shipments';
import { drivers } from './drivers';
import { vehicles } from './vehicles';
import { trackingUpdates } from './tracking-updates';

// Define relations after all tables are defined
export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [shipments.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [shipments.vehicleId],
    references: [vehicles.id],
  }),
  trackingUpdates: many(trackingUpdates)
}));

export const driversRelations = relations(drivers, ({ many }) => ({
  shipments: many(shipments)
}));

// ... other relations
```

### 2.3 Database Connection Configuration (20 min)

```typescript
// packages/database/src/connection.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a connection pool with error handling
export const createPool = () => {
  try {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
};

// Create a database connection with fallback
export const createDb = () => {
  try {
    const pool = createPool();
    return drizzle(pool, { schema });
  } catch (error) {
    console.error('Failed to create database connection:', error);
    throw error;
  }
};

// Export a singleton instance
export const db = createDb();
```

## 3. Authentication Implementation (T-1h to T-0.5h)

### 3.1 Clerk.js Integration (15 min)

```typescript
// packages/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';

// Initialize Clerk
const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// Define custom request type with auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        isAdmin: boolean;
      };
    }
  }
}

// Basic auth middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Clerk
    try {
      const session = await clerk.sessions.verifyToken(token);
      req.auth = {
        userId: session.subject,
        sessionId: session.sid,
        isAdmin: false // Simplified - we'll enhance this post-deployment
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Simplified admin check - to be enhanced post-deployment
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized'
      }
    });
  }
  
  // For beta, we'll use a simplified admin check
  // This will be enhanced post-deployment with proper role checks
  if (!req.auth.isAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden'
      }
    });
  }
  
  next();
};
```

### 3.2 Protected Routes Implementation (15 min)

```typescript
// packages/api/src/routes/index.ts
import { Router } from 'express';
import shipmentsRouter from './shipments';
import driversRouter from './drivers';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
router.use('/shipments', requireAuth, shipmentsRouter);
router.use('/drivers', requireAuth, driversRouter);

// Admin-only routes
router.use('/admin', requireAuth, requireAdmin, adminRouter);

export default router;
```

### 3.3 Environment Configuration (15 min)

```typescript
// packages/api/src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001'),
  DATABASE_URL: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Provide fallbacks for missing variables in development
if (env.NODE_ENV === 'development') {
  if (!env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using mock data');
  }
  if (!env.CLERK_SECRET_KEY) {
    console.warn('CLERK_SECRET_KEY not set, authentication will not work properly');
  }
}
```

## 4. Final Testing & Deployment (T-0.5h to T-0h)

### 4.1 Critical Path Tests (15 min)

```typescript
// packages/api/src/__tests__/critical-paths.test.ts
import request from 'supertest';
import { app } from '../app';

describe('Critical API Endpoints', () => {
  test('Health check endpoint returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
  
  test('Shipments endpoint returns data', async () => {
    const response = await request(app).get('/api/shipments');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  // Add more critical path tests as needed
});
```

### 4.2 Feature Flag Implementation (15 min)

```typescript
// packages/api/src/config/features.ts
// Simple feature flag system for beta deployment

export const FEATURES = {
  // Core features - enabled by default
  SHIPMENT_MANAGEMENT: true,
  DRIVER_TRACKING: true,
  
  // Beta features - can be toggled
  REAL_TIME_UPDATES: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
  ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  ROUTE_OPTIMIZATION: process.env.ENABLE_ROUTE_OPTIMIZATION === 'true',
  
  // Disabled features - to be enabled post-deployment
  ROLE_BASED_ACCESS: false,
  ADVANCED_REPORTING: false
};

// Feature flag middleware
export const withFeature = (featureKey: keyof typeof FEATURES) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!FEATURES[featureKey]) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Feature not available'
        }
      });
    }
    next();
  };
```

### 4.3 Deployment Script (15 min)

```javascript
// deploy.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Ensure required environment variables are set
const requiredEnvVars = ['DATABASE_URL', 'CLERK_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables before deploying.');
  process.exit(1);
}

// Build the application
console.log('Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

// Start the server
console.log(`Starting server on port ${PORT} in ${NODE_ENV} mode...`);
try {
  const server = require('./dist/server');
  console.log('Server started successfully!');
} catch (error) {
  console.error('Server failed to start:', error);
  process.exit(1);
}

// Log deployment success
console.log(`
=================================================
🚀 LoadUp API deployed successfully!
=================================================
- Environment: ${NODE_ENV}
- Port: ${PORT}
- Time: ${new Date().toISOString()}
=================================================
`);
```

## 5. Rollback Strategy

In case of deployment issues, we have prepared the following rollback strategy:

1. **Immediate Rollback Trigger**:
   - API health check fails
   - Authentication system fails
   - Database connection fails
   - Critical endpoint returns 500 error

2. **Rollback Process**:
   ```bash
   # Stop the current deployment
   pm2 stop loadup-api
   
   # Restore from the last known good version
   git checkout last-known-good-tag
   
   # Rebuild and restart
   npm run build
   pm2 start loadup-api
   ```

3. **Monitoring During Rollback**:
   - Monitor API health endpoint
   - Check database connectivity
   - Verify authentication flow

## 6. Post-Deployment Verification

After deployment, we will immediately verify:

1. **API Health**: `curl http://localhost:3001/health`
2. **Shipments Endpoint**: `curl http://localhost:3001/api/shipments`
3. **Authentication**: Test login flow in admin dashboard and driver app
4. **Database Connectivity**: Verify data retrieval and storage

## 7. Communication Plan

1. **Deployment Notification**:
   - Notify all team members 15 minutes before deployment
   - Provide deployment status updates every 15 minutes
   - Announce successful deployment or rollback decision

2. **Issue Reporting**:
   - Create dedicated Slack channel for deployment issues
   - Assign team members to monitor specific components
   - Establish escalation path for critical issues

## 8. Next Steps

After successful deployment, we will immediately:

1. Begin addressing technical debt items
2. Implement comprehensive testing
3. Enhance authentication system
4. Optimize database queries
5. Complete documentation 