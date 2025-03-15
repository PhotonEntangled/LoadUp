# LoadUp Demo Data Setup Guide

This document provides instructions for setting up demo data for the LoadUp application. This data is essential for demonstrating the application's features during presentations and testing.

## Overview

The demo data includes:

1. User accounts with different roles
2. Sample shipments in various statuses
3. Sample documents for OCR processing
4. Sample Excel files for batch processing
5. Test environment configuration

## Prerequisites

- Access to the staging or demo environment database
- Admin privileges in the LoadUp application
- Access to the application's file storage

## User Accounts Setup

### Admin User

```sql
INSERT INTO users (email, name, role, password_hash, created_at, updated_at)
VALUES (
  'admin@loadup.com',
  'Demo Admin',
  'admin',
  -- Password: demo-admin-password (hashed)
  '$2a$12$1tKL.ZcQUj9t1XFJfOsRteYwsW5HJXAKEgYfLYdcgvLEJDPFrsdmW',
  NOW(),
  NOW()
);
```

### Driver User

```sql
INSERT INTO users (email, name, role, password_hash, created_at, updated_at)
VALUES (
  'driver@loadup.com',
  'Demo Driver',
  'driver',
  -- Password: demo-driver-password (hashed)
  '$2a$12$pK7xrHC5vFXUBiVhUFVyQOxTXFXQ5q1WZ7yYJ9JGiJ3JaLtqYhBXe',
  NOW(),
  NOW()
);
```

### Customer User

```sql
INSERT INTO users (email, name, role, password_hash, created_at, updated_at)
VALUES (
  'customer@loadup.com',
  'Demo Customer',
  'customer',
  -- Password: demo-customer-password (hashed)
  '$2a$12$8KJh.d5LfNlUXgFbGq1dieJl9DJkR.uVOcjPD6YRGgfzJEN9soIyS',
  NOW(),
  NOW()
);
```

## Sample Shipments Setup

### Pending Shipments

```sql
INSERT INTO shipments (
  tracking_number,
  status,
  customer_id,
  description,
  pickup_location,
  pickup_contact,
  delivery_location,
  delivery_contact,
  pickup_date,
  delivery_date,
  created_at,
  updated_at
)
VALUES (
  'TRACK-001-DEMO',
  'pending',
  (SELECT id FROM users WHERE email = 'customer@loadup.com'),
  'Demo Shipment - Office Supplies',
  '{"street": "123 Main St", "city": "New York", "state": "NY", "zipCode": "10001", "country": "USA"}',
  '{"name": "John Office", "phone": "555-1234", "email": "john@example.com"}',
  '{"street": "456 Market St", "city": "San Francisco", "state": "CA", "zipCode": "94103", "country": "USA"}',
  '{"name": "Jane Office", "phone": "555-5678", "email": "jane@example.com"}',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '5 days',
  NOW(),
  NOW()
);
```

### In Transit Shipments

```sql
INSERT INTO shipments (
  tracking_number,
  status,
  customer_id,
  description,
  pickup_location,
  pickup_contact,
  delivery_location,
  delivery_contact,
  pickup_date,
  delivery_date,
  created_at,
  updated_at,
  driver_id
)
VALUES (
  'TRACK-002-DEMO',
  'in_transit',
  (SELECT id FROM users WHERE email = 'customer@loadup.com'),
  'Demo Shipment - Electronics',
  '{"street": "789 Tech Blvd", "city": "Boston", "state": "MA", "zipCode": "02110", "country": "USA"}',
  '{"name": "Tech Sender", "phone": "555-2468", "email": "sender@tech.com"}',
  '{"street": "101 Innovation Way", "city": "Austin", "state": "TX", "zipCode": "78701", "country": "USA"}',
  '{"name": "Tech Receiver", "phone": "555-1357", "email": "receiver@tech.com"}',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  (SELECT id FROM users WHERE email = 'driver@loadup.com')
);
```

### Delivered Shipments

```sql
INSERT INTO shipments (
  tracking_number,
  status,
  customer_id,
  description,
  pickup_location,
  pickup_contact,
  delivery_location,
  delivery_contact,
  pickup_date,
  delivery_date,
  created_at,
  updated_at,
  driver_id
)
VALUES (
  'TRACK-003-DEMO',
  'delivered',
  (SELECT id FROM users WHERE email = 'customer@loadup.com'),
  'Demo Shipment - Furniture',
  '{"street": "222 Warehouse Rd", "city": "Chicago", "state": "IL", "zipCode": "60607", "country": "USA"}',
  '{"name": "Furniture Store", "phone": "555-9876", "email": "store@furniture.com"}',
  '{"street": "333 Home Ave", "city": "Denver", "state": "CO", "zipCode": "80202", "country": "USA"}',
  '{"name": "Home Owner", "phone": "555-5432", "email": "owner@home.com"}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM users WHERE email = 'driver@loadup.com')
);
```

## Sample Documents Setup

### OCR Test Documents

Place the following files in the application's storage:

1. `demo-document-1.jpg` - A clear image of a shipping label
2. `demo-document-2.jpg` - A bill of lading with shipment details
3. `demo-document-3.jpg` - A commercial invoice

These files should be placed in:
```
/storage/demo/ocr/
```

### Excel Test Files

Place the following files in the application's storage:

1. `demo-shipments.xlsx` - An Excel file with multiple shipment entries
2. `demo-customers.xlsx` - An Excel file with customer data

These files should be placed in:
```
/storage/demo/excel/
```

## Environment Configuration

### Environment Variables

Set the following environment variables in the staging environment:

```
DEMO_MODE=true
DEMO_ADMIN_EMAIL=admin@loadup.com
DEMO_DRIVER_EMAIL=driver@loadup.com
DEMO_CUSTOMER_EMAIL=customer@loadup.com
DEMO_OCR_PATH=/storage/demo/ocr/
DEMO_EXCEL_PATH=/storage/demo/excel/
```

### Feature Flags

Enable the following feature flags in the staging environment:

```
ENABLE_DEMO_LOGIN=true
SKIP_EMAIL_VERIFICATION=true
ENABLE_MOCK_LOCATION=true
ENABLE_DEMO_NOTIFICATIONS=true
```

## Running the Demo Setup Script

A script is available to automate the setup process:

```bash
npm run setup:demo
```

This script will:

1. Create the demo user accounts
2. Generate sample shipments
3. Copy the demo documents to the appropriate locations
4. Configure the environment variables

## Verifying the Setup

After running the setup script, verify that:

1. You can log in with each demo account
2. Sample shipments are visible in the shipments list
3. OCR test documents are available for processing
4. Excel test files can be uploaded and processed

## Resetting Demo Data

To reset the demo data to its initial state:

```bash
npm run reset:demo
```

This will remove all demo data and set up fresh data for the next demonstration.

## Troubleshooting

### Common Issues

1. **Login Issues**: Ensure the password hashes are correctly generated
2. **Missing Shipments**: Check the SQL insert statements for errors
3. **Document Processing Failures**: Verify the file paths and permissions

### Support

For assistance with demo setup, contact:

- Email: devops@loadup.com
- Slack: #demo-support channel 