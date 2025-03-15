import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mock data for shipments
const mockShipments = [
  {
    id: 'SHIP-001',
    status: 'In Transit',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    estimatedDelivery: '2025-03-20',
    items: [
      { id: 'ITEM-001', name: 'Furniture', weight: '150kg' },
      { id: 'ITEM-002', name: 'Electronics', weight: '50kg' }
    ]
  },
  {
    id: 'SHIP-002',
    status: 'Delivered',
    origin: 'Chicago, IL',
    destination: 'Miami, FL',
    estimatedDelivery: '2025-03-15',
    items: [
      { id: 'ITEM-003', name: 'Clothing', weight: '30kg' },
      { id: 'ITEM-004', name: 'Books', weight: '20kg' }
    ]
  },
  {
    id: 'SHIP-003',
    status: 'Processing',
    origin: 'Seattle, WA',
    destination: 'Boston, MA',
    estimatedDelivery: '2025-03-25',
    items: [
      { id: 'ITEM-005', name: 'Artwork', weight: '10kg' },
      { id: 'ITEM-006', name: 'Fragile Items', weight: '5kg' }
    ]
  }
];

// API endpoints
app.get('/api/shipments', (req: Request, res: Response) => {
  res.json(mockShipments);
});

app.get('/api/shipments/:id', (req: Request, res: Response) => {
  const shipment = mockShipments.find(s => s.id === req.params.id);
  if (shipment) {
    res.json(shipment);
  } else {
    res.status(404).json({ error: 'Shipment not found' });
  }
});

// Start server
const PORT = process.env.API_PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API_PORT from env: ${process.env.API_PORT || 'not set'}`);
});

export default app; 