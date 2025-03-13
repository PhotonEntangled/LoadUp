const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mock auth endpoint
app.get('/api/auth', (req, res) => {
  // In a real app, this would verify the token from the Authorization header
  // For testing, we'll just return a mock user
  res.json({
    userId: '123e4567-e89b-12d3-a456-426614174000',
    role: 'admin',
  });
});

// Mock shipments endpoint
app.get('/api/shipments', (req, res) => {
  res.json({ 
    data: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        trackingNumber: 'SHIP123456',
        status: 'in_transit',
        customerName: 'John Doe',
        pickupAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        },
        deliveryAddress: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        }
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        trackingNumber: 'SHIP123457',
        status: 'delivered',
        customerName: 'Jane Smith',
        pickupAddress: {
          street: '789 Oak St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        },
        deliveryAddress: {
          street: '101 Pine St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105'
        }
      }
    ] 
  });
});

// Mock shipment detail endpoint
app.get('/api/shipments/:id', (req, res) => {
  const shipmentId = req.params.id;
  
  // Return a mock shipment based on the ID
  res.json({
    data: {
      id: shipmentId,
      trackingNumber: `SHIP${shipmentId.substring(0, 6)}`,
      status: 'in_transit',
      customerName: 'John Doe',
      pickupAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105'
      },
      deliveryAddress: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105'
      }
    }
  });
});

// Mock drivers endpoint
app.get('/api/drivers', (req, res) => {
  res.json({
    data: [
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Driver One',
        phone: '555-123-4567',
        vehicle: 'Truck 1',
        status: 'active',
        location: {
          lat: 37.7749,
          lng: -122.4194
        }
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174003',
        name: 'Driver Two',
        phone: '555-987-6543',
        vehicle: 'Truck 2',
        status: 'inactive',
        location: {
          lat: 37.7833,
          lng: -122.4167
        }
      }
    ]
  });
});

// Mock driver current endpoint
app.get('/api/drivers/current', (req, res) => {
  res.json({
    data: {
      id: '323e4567-e89b-12d3-a456-426614174002',
      name: 'Driver One',
      phone: '555-123-4567',
      vehicle: 'Truck 1',
      status: 'active',
      location: {
        lat: 37.7749,
        lng: -122.4194
      }
    }
  });
});

// Mock driver location update endpoint
app.post('/api/drivers/location', (req, res) => {
  const { latitude, longitude } = req.body;
  
  // In a real app, this would update the driver's location in the database
  console.log(`Driver location updated: ${latitude}, ${longitude}`);
  
  res.json({
    success: true
  });
});

// Mock driver status update endpoint
app.patch('/api/drivers/status', (req, res) => {
  const { status } = req.body;
  
  // In a real app, this would update the driver's status in the database
  console.log(`Driver status updated: ${status}`);
  
  res.json({
    success: true
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 