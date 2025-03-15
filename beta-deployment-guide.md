# LoadUp Beta Deployment Guide

This guide provides instructions for deploying and managing the LoadUp Beta Server, a simplified version of the LoadUp API designed for beta testing.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Steps](#deployment-steps)
4. [Server Details](#server-details)
5. [Authentication Configuration](#authentication-configuration)
6. [Available Endpoints](#available-endpoints)
7. [Mock Data](#mock-data)
8. [Monitoring](#monitoring)
9. [Stopping the Server](#stopping-the-server)
10. [Troubleshooting](#troubleshooting)
11. [Notes for Beta Testers](#notes-for-beta-testers)
12. [Next Steps After Beta](#next-steps-after-beta)

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

## Authentication Configuration

For the beta environment, we've implemented a simplified authentication approach to facilitate testing without requiring a full Clerk.js setup.

### Temporary Authentication Bypass

In the beta environment, authentication is temporarily bypassed to allow easier testing. This is implemented in two ways:

1. **Admin Dashboard Middleware**

   The middleware in the Admin Dashboard is configured to use the Clerk v6 API, which by default makes all routes public:

   ```typescript
   // apps/admin-dashboard/middleware.ts
   import { clerkMiddleware } from "@clerk/nextjs/server";

   // This middleware protects routes including api/trpc routes
   export default clerkMiddleware();

   export const config = {
     matcher: [
       // Skip Next.js internals
       "/((?!_next|static|favicon.ico).*)",
       // Always run for API routes
       "/(api|trpc)(.*)",
     ],
   };
   ```

2. **Environment Variable**

   The `NEXT_PUBLIC_BETA_MODE` environment variable is set to `true` in the `.env` file:

   ```
   # Admin Dashboard Environment Variables
   # ...other variables...
   
   # Beta Mode Configuration
   NEXT_PUBLIC_BETA_MODE="true"
   ```

3. **Providers Component**

   The Providers component is configured to bypass Clerk initialization in development/beta mode:

   ```typescript
   // apps/admin-dashboard/app/providers.tsx
   export function Providers({ children }: { children: React.ReactNode }) {
     // For beta testing or development, bypass Clerk initialization
     if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_BETA_MODE === 'true') {
       console.log("Development/Beta mode: bypassing Clerk initialization");
       return <>{children}</>;
     }
     
     // Regular Clerk initialization for production
     return (
       <ClerkProvider>
         {children}
       </ClerkProvider>
     );
   }
   ```

### Mock Authentication for API

The beta server includes mock authentication endpoints to simulate the authentication flow:

```javascript
// Mock authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // In beta, accept any credentials with basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Return a mock token
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: 'user-1',
      email,
      role: 'admin', // All beta users are admins for testing
    }
  });
});

// Mock current user endpoint
app.get('/api/auth', (req, res) => {
  // In beta, always return a mock admin user
  res.json({
    userId: 'user-1',
    role: 'admin',
  });
});
```

### Transitioning to Production Authentication

When moving from beta to production, you'll need to:

1. **Configure Clerk.js properly**:
   - Set up a Clerk application
   - Configure the necessary environment variables
   - Set up webhooks

2. **Remove the authentication bypass**:
   - Update the middleware to properly protect routes
   - Remove the Clerk initialization bypass in the Providers component

3. **Implement proper authentication in the API**:
   - Replace mock authentication endpoints with real authentication
   - Implement proper JWT validation

## Available Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/db` - Database connection check (mocked for beta)

### Authentication API
- `POST /api/auth/login` - Mock login endpoint
- `GET /api/auth` - Get current user (returns mock admin user)

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

### Authentication Issues
If you encounter authentication issues in the beta environment:

1. **Admin Dashboard Black Screen**:
   - Check that the authentication bypass is properly configured
   - Verify that the API server is running on port 3002
   - Check the browser console for specific errors

2. **API Authentication Errors**:
   - Verify that the mock authentication endpoints are working
   - Check that the API URL is correctly set in the Admin Dashboard

## Notes for Beta Testers

- The beta server uses mock data and does not connect to a real database
- All changes made through the API are stored in memory and will be lost when the server restarts
- Authentication is bypassed for easier testing
- Report any issues or feedback to the development team

## Next Steps After Beta

1. Address any issues identified during beta testing
2. Implement full database connectivity
3. Configure proper authentication with Clerk.js
4. Deploy to staging environment
5. Conduct final testing
6. Deploy to production

## Current Status (March 2025)

### Progress Update

We have made significant progress in setting up the beta environment:

1. **API Server**:
   - The API server is running on port 3002
   - Mock data is being served for shipments at http://localhost:3002/api/shipments
   - The health endpoint is accessible at http://localhost:3002/health

2. **Admin Dashboard**:
   - Updated Clerk dependencies to v6.12.5
   - Fixed middleware configuration to use a simpler matcher pattern
   - Added NEXT_PUBLIC_BETA_MODE environment variable
   - Enhanced providers component to bypass Clerk in beta mode

3. **Database Connection**:
   - Updated the pg module import in drizzle.ts to use the correct ESM syntax
   - Database connection is still being configured

### Known Issues

1. **Admin Dashboard Loading**:
   - The Admin Dashboard at localhost:3000 is not loading as a web page
   - There may be issues with the Next.js configuration

2. **Database Connection**:
   - There are issues with the pg module import in the API server
   - The database connection needs to be properly configured

### Next Steps

1. **Fix Admin Dashboard Loading**:
   - Check the Next.js server logs for any errors
   - Verify that all required dependencies are installed
   - Test with a simplified page component

2. **Complete API Server Setup**:
   - Fix the database connection issues
   - Add more mock endpoints for testing
   - Implement proper error handling

3. **Prepare for Production**:
   - Document the transition from beta to production
   - Configure proper authentication with Clerk.js
   - Set up the production database

By addressing these issues, we will have a fully functional beta environment for testing the LoadUp platform. 