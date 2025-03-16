# LoadUp Simple Deployment Guide

## Overview

This guide provides instructions for deploying the LoadUp API using the simplified deployment process. This approach focuses on running only the tests that are currently working and deploying the core functionality of the application.

## Current Limitations

Before proceeding with deployment, be aware of the following limitations:

1. **Limited Test Coverage**: Only simple tests are run during deployment, which include:
   - Utility functions
   - API client
   - Middleware
   - Services
   - Basic UI components (Button)
   - Authentication service

2. **Incomplete Features**: Some features may not be fully implemented or tested:
   - End-to-end tests are not included
   - Some API endpoints may not be fully tested
   - Complex component interactions may not be tested

3. **Path Resolution Issues**: There are known issues with path resolution in some test files, which have been temporarily addressed by creating simplified versions.

## Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- Git
- Access to the LoadUp repository
- PostgreSQL database

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
```

### 4. Run the Simple Deployment Script

```bash
npm run deploy:simple
```

This script will:
1. Run all simple tests to ensure basic functionality is working
2. Build the API server
3. Build the admin dashboard and driver app (if available)
4. Start the API server on the specified port (default: 3001)
5. Log all server output to the console
6. Handle graceful shutdown on SIGINT and SIGTERM signals

### 5. Verify Deployment

Check that the API is running correctly by making a request to the health endpoint:

```bash
curl http://localhost:3001/health
```

You should receive a response like:

```json
{"status":"ok"}
```

## Troubleshooting

### Tests Failing

If the simple tests fail during deployment:

1. Run the tests manually to see detailed error messages:
   ```bash
   npm run test:simple
   ```

2. Fix any failing tests before attempting deployment again.

### Build Errors

If you encounter build errors:

1. Check that all dependencies are installed:
   ```bash
   npm install
   ```

2. Verify that the path to the build scripts is correct in package.json.

3. Try building each package individually:
   ```bash
   cd packages/api && npm run build
   cd ../../apps/admin-dashboard && npm run build
   cd ../../apps/driver-app && npm run build
   ```

### Database Connection Issues

If you encounter database connection issues:

1. Verify that the DATABASE_URL in your .env file is correct.
2. Ensure that the database server is running and accessible.
3. Check that the database user has the necessary permissions.

## Monitoring

For production deployments, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start deploy-simple.js --name loadup-api
```

## Next Steps

After successful deployment, consider:

1. Implementing the remaining tests
2. Fixing path resolution issues
3. Setting up end-to-end tests
4. Implementing a more comprehensive deployment process

## Support

For deployment issues, contact the LoadUp DevOps team at devops@loadup.app. 