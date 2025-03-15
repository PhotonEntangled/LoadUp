# LoadUp Deployment Guide

This guide provides comprehensive instructions for deploying the LoadUp platform, including environment setup, deployment procedures, and troubleshooting tips.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [API Deployment](#api-deployment)
4. [Admin Dashboard Deployment](#admin-dashboard-deployment)
5. [Driver App Deployment](#driver-app-deployment)
6. [Database Setup](#database-setup)
7. [Clerk Authentication Configuration](#clerk-authentication-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the LoadUp platform, ensure you have the following:

- Node.js v18 or higher
- npm v8 or higher
- PostgreSQL database
- Access to deployment platforms (Vercel, Heroku, AWS, etc.)
- Required API keys and credentials

## Environment Variables

The LoadUp platform requires several environment variables for proper operation. Create a `.env` file in each app directory with the following variables:

### API Environment Variables

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/loadup
DATABASE_SSL=false

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Services
MAPBOX_API_KEY=your_mapbox_api_key
GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
API_PORT=3004
NODE_ENV=production
API_URL=https://api.loadup.example.com
CORS_ORIGIN=https://admin.loadup.example.com,https://loadup.example.com
```

### Admin Dashboard Environment Variables

```
# API
NEXT_PUBLIC_API_URL=https://api.loadup.example.com

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Services
NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_api_key
```

### Driver App Environment Variables

```
# API
EXPO_PUBLIC_API_URL=https://api.loadup.example.com

# Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Services
EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_api_key
```

## API Deployment

The LoadUp API is built with Express.js and can be deployed to various platforms.

### Deployment to Heroku

1. **Create a Heroku app**

   ```bash
   heroku create loadup-api
   ```

2. **Set environment variables**

   ```bash
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set CLERK_SECRET_KEY=your_clerk_secret_key
   # Set other environment variables as needed
   ```

3. **Deploy the API**

   ```bash
   git subtree push --prefix packages/api heroku main
   ```

### Deployment to AWS Elastic Beanstalk

1. **Initialize Elastic Beanstalk**

   ```bash
   eb init loadup-api --platform node.js --region us-east-1
   ```

2. **Create an environment**

   ```bash
   eb create production
   ```

3. **Set environment variables**

   ```bash
   eb setenv DATABASE_URL=your_database_url CLERK_SECRET_KEY=your_clerk_secret_key
   # Set other environment variables as needed
   ```

4. **Deploy the API**

   ```bash
   eb deploy
   ```

### Deployment to Docker

1. **Build the Docker image**

   ```bash
   docker build -t loadup-api -f packages/api/Dockerfile .
   ```

2. **Run the Docker container**

   ```bash
   docker run -p 3001:3001 \
     -e DATABASE_URL=your_database_url \
     -e CLERK_SECRET_KEY=your_clerk_secret_key \
     # Set other environment variables as needed
     loadup-api
   ```

## Admin Dashboard Deployment

The LoadUp Admin Dashboard is built with Next.js and can be deployed to Vercel or other platforms.

### Deployment to Vercel

1. **Connect your GitHub repository to Vercel**

2. **Set environment variables in the Vercel dashboard**

3. **Deploy the Admin Dashboard**

   ```bash
   cd apps/admin-dashboard
   vercel --prod
   ```

### Deployment to Netlify

1. **Connect your GitHub repository to Netlify**

2. **Set environment variables in the Netlify dashboard**

3. **Configure build settings**

   - Build command: `cd ../.. && npm run build --filter=admin-dashboard`
   - Publish directory: `apps/admin-dashboard/.next`

4. **Deploy the Admin Dashboard**

   ```bash
   cd apps/admin-dashboard
   netlify deploy --prod
   ```

## Driver App Deployment

The LoadUp Driver App is built with Expo React Native and can be deployed to app stores or as a web app.

### Building for iOS

1. **Configure app.json**

   Update the `app.json` file with your app's information:

   ```json
   {
     "expo": {
       "name": "LoadUp Driver",
       "slug": "loadup-driver",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "ios": {
         "bundleIdentifier": "com.yourcompany.loadupdriver",
         "buildNumber": "1"
       }
     }
   }
   ```

2. **Build the iOS app**

   ```bash
   cd apps/driver-app
   eas build --platform ios
   ```

3. **Submit to the App Store**

   ```bash
   eas submit --platform ios
   ```

### Building for Android

1. **Configure app.json**

   Update the `app.json` file with your app's information:

   ```json
   {
     "expo": {
       "name": "LoadUp Driver",
       "slug": "loadup-driver",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "android": {
         "package": "com.yourcompany.loadupdriver",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build the Android app**

   ```bash
   cd apps/driver-app
   eas build --platform android
   ```

3. **Submit to the Google Play Store**

   ```bash
   eas submit --platform android
   ```

## Database Setup

The LoadUp platform uses PostgreSQL with Drizzle ORM for database operations.

### Setting Up a PostgreSQL Database

1. **Create a PostgreSQL database**

   ```sql
   CREATE DATABASE loadup;
   ```

2. **Create a database user**

   ```sql
   CREATE USER loadup_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE loadup TO loadup_user;
   ```

### Running Migrations

1. **Generate migrations**

   ```bash
   cd packages/database
   npm run drizzle:generate
   ```

2. **Apply migrations**

   ```bash
   npm run drizzle:migrate
   ```

## Clerk Authentication Configuration

The LoadUp platform uses Clerk.js for authentication. Proper configuration is essential for a successful deployment.

### Setting Up Clerk

1. **Create a Clerk Application**

   Sign up for a Clerk account at [clerk.com](https://clerk.com) and create a new application.

2. **Configure Authentication Settings**

   In the Clerk dashboard:
   - Set up sign-in and sign-up methods (email, social providers, etc.)
   - Configure user roles and permissions
   - Set up webhooks for user events

3. **Get API Keys**

   Obtain the following API keys from the Clerk dashboard:
   - Publishable Key (for frontend)
   - Secret Key (for backend)

4. **Set Environment Variables**

   Add the following environment variables to your deployment:

   ```
   # Admin Dashboard
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # Driver App
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   ```

5. **Configure Webhooks**

   Set up webhooks to sync user data with your backend:

   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

   Create a webhook endpoint in your API:

   ```typescript
   // packages/api/src/routes/webhooks.ts
   import express from 'express';
   import { Webhook } from 'svix';
   import { WebhookEvent } from '@clerk/nextjs/server';

   const router = express.Router();

   router.post('/clerk', async (req, res) => {
     // Verify webhook
     const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
     if (!webhookSecret) {
       return res.status(500).json({ error: 'Webhook secret not configured' });
     }

     // Get the headers
     const svix_id = req.headers['svix-id'] as string;
     const svix_timestamp = req.headers['svix-timestamp'] as string;
     const svix_signature = req.headers['svix-signature'] as string;

     if (!svix_id || !svix_timestamp || !svix_signature) {
       return res.status(400).json({ error: 'Missing svix headers' });
     }

     // Create a new Svix instance with your secret
     const wh = new Webhook(webhookSecret);

     let evt: WebhookEvent;
     try {
       evt = wh.verify(JSON.stringify(req.body), {
         'svix-id': svix_id,
         'svix-timestamp': svix_timestamp,
         'svix-signature': svix_signature,
       }) as WebhookEvent;
     } catch (err) {
       return res.status(400).json({ error: 'Invalid webhook' });
     }

     // Handle the webhook event
     const { type, data } = evt;
     
     switch (type) {
       case 'user.created':
         // Handle user creation
         break;
       case 'user.updated':
         // Handle user update
         break;
       // Handle other event types
     }

     return res.status(200).json({ success: true });
   });

   export default router;
   ```

### Version Compatibility

Ensure all Clerk-related packages are on compatible versions:

```bash
# Check current versions
npm list @clerk/nextjs
npm list @clerk/clerk-react

# Update to consistent versions
npm update @clerk/nextjs
npm update @clerk/clerk-react
```

### Testing Authentication

Before deploying to production, test the authentication flow:

1. **Test Sign-In and Sign-Up**
   - Verify that users can sign in and sign up
   - Test with different authentication methods

2. **Test Role-Based Access**
   - Verify that users with different roles have appropriate access
   - Test admin-only routes

3. **Test Error Scenarios**
   - Test with invalid credentials
   - Test with expired tokens
   - Test when Clerk service is unavailable

## Monitoring & Logging

Proper monitoring and logging are essential for maintaining a healthy production environment.

### Setting Up Logging

1. **Configure structured logging**

   ```typescript
   // packages/api/src/utils/logger.ts
   import pino from 'pino';

   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     transport: {
       target: 'pino-pretty',
       options: {
         colorize: true,
       },
     },
   });
   ```

2. **Use the logger throughout the application**

   ```typescript
   import { logger } from '../utils/logger';

   logger.info('Server started on port 3001');
   logger.error({ err }, 'An error occurred');
   ```

### Setting Up Monitoring

1. **Configure health check endpoints**

   ```typescript
   // packages/api/src/routes/health.ts
   import express from 'express';
   import { db } from '@loadup/database';

   const router = express.Router();

   router.get('/health', async (req, res) => {
     try {
       // Check database connection
       await db.execute(sql`SELECT 1`);
       
       res.status(200).json({
         status: 'ok',
         timestamp: new Date().toISOString(),
         services: {
           database: 'up',
         },
       });
     } catch (error) {
       res.status(500).json({
         status: 'error',
         timestamp: new Date().toISOString(),
         services: {
           database: 'down',
         },
         error: error.message,
       });
     }
   });

   export default router;
   ```

2. **Set up external monitoring services**

   - Configure uptime monitoring with services like Uptime Robot or Pingdom
   - Set up error tracking with services like Sentry
   - Configure performance monitoring with services like New Relic or Datadog

## Troubleshooting

### Common Issues and Solutions

#### API Connection Issues

**Issue**: Admin Dashboard or Driver App cannot connect to the API.

**Solution**:
1. Verify that the API is running and accessible
2. Check that the API URL is correctly set in environment variables
3. Ensure CORS is properly configured on the API server
4. Check for network issues or firewall restrictions

#### Database Connection Issues

**Issue**: API cannot connect to the database.

**Solution**:
1. Verify that the database is running and accessible
2. Check that the DATABASE_URL is correctly set
3. Ensure the database user has the necessary permissions
4. Check for network issues or firewall restrictions

#### Authentication Issues

**Issue**: Users cannot log in or authentication fails.

**Solution**:
1. Verify that the Clerk API keys are correctly set in environment variables
2. Check that the Clerk publishable key matches the environment (development/production)
3. Ensure the webhook endpoints are properly configured
4. Check for version mismatches in Clerk dependencies
5. Look for CORS issues if authentication is cross-origin
6. Check browser console for specific error messages
7. Verify that the middleware is properly configured

**Specific Clerk Errors**:

- **400 Bad Request on dev_browser endpoint**:
  This is often caused by a version mismatch between Clerk JS libraries. Ensure all Clerk packages are on compatible versions.

- **401 Unauthorized**:
  Check that the Clerk API keys are correct and that the user has the necessary permissions.

- **CORS Errors**:
  Ensure that the Clerk domain is properly configured to allow requests from your application domain.

#### Deployment Failures

**Issue**: Deployment to a platform fails.

**Solution**:
1. Check the deployment logs for specific errors
2. Verify that all environment variables are correctly set
3. Ensure the build process completes successfully locally
4. Check for platform-specific requirements or limitations

---

This deployment guide provides comprehensive instructions for deploying the LoadUp platform. By following these guidelines, you'll ensure a smooth deployment process and a stable production environment. 