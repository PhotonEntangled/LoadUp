# LoadUp Beta Deployment Guide

This guide provides instructions for deploying and managing the LoadUp Beta Server, a simplified version of the LoadUp API designed for beta testing.

## Overview

The beta deployment uses a simplified server with mock data to facilitate testing without requiring a full production environment. The server runs in the background and logs its activity to files for easy monitoring.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Required npm packages: express, cors, helmet, dotenv

## Deployment Steps

1. **Install Dependencies**

   ```bash
   npm install express cors helmet dotenv
   ```

2. **Deploy the Beta Server**

   ```bash
   node deploy-beta.js
   ```

   This script:
   - Starts the beta server in the background
   - Redirects output to log files
   - Returns control to the terminal immediately

3. **Verify Deployment**

   Check if the server is running:

   ```bash
   curl http://localhost:3002/health
   ```

   You should receive a response like:
   ```json
   {"status":"ok"}
   ```

## Server Details

- **Port**: 3002
- **Standard Output Log**: `beta-server-out.log`
- **Error Log**: `beta-server-err.log`

## Available Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/db` - Database connection check (mocked for beta)

### Shipments API
- `GET /api/shipments` - List all shipments
- `GET /api/shipments/:id` - Get a specific shipment
- `POST /api/shipments` - Create a new shipment

### Drivers API
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get a specific driver
- `POST /api/drivers` - Create a new driver

## Mock Data

The beta server includes mock data for testing:
- 2 sample shipments with different statuses
- 2 sample drivers with different availability

## Monitoring

To check the server logs:

```bash
# View standard output
type beta-server-out.log

# View error log
type beta-server-err.log
```

## Stopping the Server

To stop the beta server:

1. Find the process ID:
   ```bash
   tasklist | findstr node
   ```

2. Kill the process:
   ```bash
   taskkill /F /PID <PID>
   ```

## Troubleshooting

### Server Not Responding
1. Check if the server process is running:
   ```bash
   tasklist | findstr node
   ```

2. Check the error log:
   ```bash
   type beta-server-err.log
   ```

3. Restart the server:
   ```bash
   taskkill /F /FI "IMAGENAME eq node.exe"
   node deploy-beta.js
   ```

### Port Conflict
If port 3002 is already in use:
1. Edit `packages/api/src/server-beta-cjs.cjs` to use a different port
2. Update the deployment script if necessary
3. Redeploy the server

## Notes for Beta Testers

- The beta server uses mock data and does not connect to a real database
- All changes made through the API are stored in memory and will be lost when the server restarts
- Report any issues or feedback to the development team

## Next Steps After Beta

1. Address any issues identified during beta testing
2. Implement full database connectivity
3. Deploy to staging environment
4. Conduct final testing
5. Deploy to production 