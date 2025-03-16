# Sentry Integration Guide

This document provides detailed information about the Sentry integration in the LoadUp application.

## Overview

Sentry is used for error tracking and performance monitoring across all applications in the LoadUp ecosystem:

- **Admin Dashboard**: Next.js application with Sentry integration
- **Driver App**: React Native application with Sentry integration
- **API**: Express application with Sentry integration

## Setup Instructions

### 1. Create a Sentry Account and Projects

1. Sign up for a Sentry account at [sentry.io](https://sentry.io)
2. Create three projects:
   - `loadup-admin` (JavaScript/Next.js)
   - `loadup-driver` (React Native)
   - `loadup-api` (Node.js)
3. Obtain the DSN for each project from the project settings

### 2. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_organization
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

For CI/CD, add these variables to your GitHub repository secrets.

### 3. Verify Installation

Run the test scripts to verify Sentry is working correctly:

```bash
# Test admin dashboard Sentry integration
cd apps/admin-dashboard
npm run sentry:test

# Test driver app Sentry integration
cd apps/driver-app
npm run sentry:test

# Test API Sentry integration
cd packages/api
npm run sentry:test
```

## Implementation Details

### Admin Dashboard (Next.js)

The Next.js admin dashboard uses the official `@sentry/nextjs` package for integration.

#### Configuration Files

- `sentry.client.config.js`: Initializes Sentry on the client side
- `sentry.server.config.js`: Initializes Sentry on the server side
- `sentry.edge.config.js`: Initializes Sentry for edge runtimes
- `next.config.js`: Configures the Sentry webpack plugin

#### Error Boundaries

- `app/error.tsx`: Component-level error boundary
- `app/global-error.tsx`: Application-level error boundary
- `app/not-found.tsx`: Custom 404 page

### Driver App (React Native)

The React Native driver app uses the `@sentry/react-native` package for integration.

#### Configuration

- `app/utils/sentry.ts`: Contains utility functions for Sentry:
  - `initSentry()`: Initializes Sentry with app metadata
  - `setDriverContext()`: Sets user context when a driver logs in
  - `clearDriverContext()`: Clears user context when a driver logs out
  - `captureException()`: Captures and reports errors

- `app/_layout.tsx`: Initializes Sentry on app startup

### API (Express)

The Express API uses the `@sentry/node` and `@sentry/profiling-node` packages for integration.

#### Middleware

- `src/middleware/sentry.js`: Contains middleware functions:
  - `initSentry()`: Initializes Sentry and adds request handlers
  - `sentryErrorHandler()`: Adds Sentry error handler
  - `errorHandler()`: Custom error handler that captures errors with Sentry

- `src/index.ts`: Integrates Sentry middleware into the Express application

## Best Practices

1. **Error Boundaries**: Use error boundaries to catch and handle errors gracefully
2. **User Context**: Set user context when users log in to track errors by user
3. **Tags and Breadcrumbs**: Add tags and breadcrumbs to provide context for errors
4. **Performance Monitoring**: Use Sentry's performance monitoring to track slow requests
5. **Environment Separation**: Configure different DSNs for development, staging, and production

## Troubleshooting

### Common Issues

1. **Missing DSN**: Ensure the `SENTRY_DSN` environment variable is set
2. **Source Maps**: Verify source maps are being uploaded correctly
3. **Rate Limiting**: Check if you're hitting Sentry's rate limits
4. **Network Issues**: Ensure the application can reach Sentry's servers

### Debugging

1. Enable debug mode in Sentry configuration:
   ```javascript
   Sentry.init({
     debug: true,
     // other options
   });
   ```

2. Check the browser console or server logs for Sentry-related messages

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [React Native Integration Guide](https://docs.sentry.io/platforms/react-native/)
- [Node.js Integration Guide](https://docs.sentry.io/platforms/node/) 