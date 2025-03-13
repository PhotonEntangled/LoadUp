import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error',
      requestId: (req as any).id
    }
  });
});

// Mock data for beta testing
const mockShipments = [
  {
    id: '1',
    trackingNumber: 'SHIP-1001',
    status: 'PENDING',
    customerName: 'John Doe',
    pickupAddress: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02108'
    },
    deliveryAddress: {
      street: '456 Park Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10022'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    trackingNumber: 'SHIP-1002',
    status: 'IN_TRANSIT',
    customerName: 'Jane Smith',
    pickupAddress: {
      street: '789 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10003'
    },
    deliveryAddress: {
      street: '101 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    driverId: '1'
  }
];

const mockDrivers = [
  {
    id: '1',
    name: 'Mike Johnson',
    phone: '555-123-4567',
    email: 'mike@example.com',
    status: 'BUSY',
    location: '40.7128,-74.0060',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Williams',
    phone: '555-987-6543',
    email: 'sarah@example.com',
    status: 'AVAILABLE',
    location: '42.3601,-71.0589',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database health check endpoint
app.get('/health/db', async (req, res) => {
  // For beta, we'll just return a mock response
  res.json({ success: true, database: 'connected' });
});

// API routes
// Shipments endpoints
app.get('/api/shipments', (req, res) => {
  res.json({ success: true, data: mockShipments });
});

app.get('/api/shipments/:id', (req, res) => {
  const shipment = mockShipments.find(s => s.id === req.params.id);
  if (!shipment) {
    return res.status(404).json({ 
      success: false, 
      error: { code: 'NOT_FOUND', message: 'Shipment not found' } 
    });
  }
  res.json({ success: true, data: shipment });
});

app.post('/api/shipments', (req, res) => {
  const newShipment = {
    id: String(mockShipments.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockShipments.push(newShipment);
  res.status(201).json({ success: true, data: newShipment });
});

// Drivers endpoints
app.get('/api/drivers', (req, res) => {
  res.json({ success: true, data: mockDrivers });
});

app.get('/api/drivers/:id', (req, res) => {
  const driver = mockDrivers.find(d => d.id === req.params.id);
  if (!driver) {
    return res.status(404).json({ 
      success: false, 
      error: { code: 'NOT_FOUND', message: 'Driver not found' } 
    });
  }
  res.json({ success: true, data: driver });
});

app.post('/api/drivers', (req, res) => {
  const newDriver = {
    id: String(mockDrivers.length + 1),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockDrivers.push(newDriver);
  res.status(201).json({ success: true, data: newDriver });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
=================================================
🚀 LoadUp API Beta Server running!
=================================================
- Environment: ${NODE_ENV}
- Port: ${PORT}
- Time: ${new Date().toISOString()}
=================================================
`);
  });
}

export default app; 