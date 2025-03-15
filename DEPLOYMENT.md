# LoadUp API Deployment Guide

## Overview

This guide provides instructions for deploying the LoadUp API to production. The deployment process has been simplified to ensure a smooth transition from development to production.

## Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- Git
- Access to the LoadUp repository

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/loadup.git
cd loadup
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# API Configuration
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=your-secure-jwt-secret

# NextAuth Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-app-url.com
EXPO_PUBLIC_NEXTAUTH_URL=https://your-app-url.com
```

### 4. Run the Deployment Script

```bash
node deploy.js
```

This script will:
- Start the API server on the specified port (default: 3001)
- Log all server output to the console
- Handle graceful shutdown on SIGINT and SIGTERM signals

### 5. Verify Deployment

Check that the API is running correctly by making a request to the health endpoint:

```bash
curl http://localhost:3001/health
```

You should receive a response like:

```json
{"status":"ok"}
```

### 6. Test API Endpoints

Test the authentication endpoint:

```bash
curl http://localhost:3001/api/auth
```

Test the shipments endpoint:

```bash
curl http://localhost:3001/api/shipments
```

Test the drivers endpoint:

```bash
curl http://localhost:3001/api/drivers
```

## API Endpoints

The LoadUp API provides the following endpoints:

### Health Check
- `GET /health` - Returns the health status of the API

### Authentication
- `GET /api/auth` - Returns mock authentication data

### Shipments
- `GET /api/shipments` - Returns a list of shipments
- `GET /api/shipments/:id` - Returns details for a specific shipment

### Drivers
- `GET /api/drivers` - Returns a list of drivers
- `GET /api/drivers/current` - Returns the current driver's information
- `POST /api/drivers/location` - Updates a driver's location
- `PATCH /api/drivers/status` - Updates a driver's status

## Troubleshooting

### Port Already in Use

If you see an error like `EADDRINUSE: address already in use`, change the PORT in your .env file or pass it as an environment variable:

```bash
PORT=3002 node deploy.js
```

### Database Connection Issues

If you encounter database connection issues, verify that:
- The DATABASE_URL is correct
- The database server is running
- The user has the necessary permissions

### Module Resolution Issues

If you encounter module resolution issues, try the following:
- Ensure all dependencies are installed: `npm install`
- Check that the path aliases in tsconfig.json are correct
- Verify that the import paths include file extensions for ESM modules

## Monitoring

The deployment script logs all server output to the console. For production deployments, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start deploy.js --name loadup-api
```

## Scaling

For high-traffic environments, consider:
- Using a load balancer
- Deploying multiple instances of the API
- Implementing a caching layer

## Frontend Integration

To connect the admin dashboard and driver app to the API:

1. Update the API URL in the frontend configuration:
   - For admin dashboard: Update `NEXT_PUBLIC_API_URL` in `.env`
   - For driver app: Update `EXPO_PUBLIC_API_URL` in `.env`

2. Verify connectivity by accessing the admin dashboard and driver app

## Support

For deployment issues, contact the LoadUp DevOps team at devops@loadup.app.