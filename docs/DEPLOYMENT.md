# LoadUp Project - Deployment Guide

## Overview

This document provides instructions for deploying the LoadUp application to Vercel. The deployment process includes setting up environment variables, configuring the Vercel project, and deploying the application.

## Prerequisites

Before deploying the LoadUp application, ensure you have the following:

1. **Node.js**: Version 18 or higher
2. **npm**: Version 8 or higher
3. **Git**: For version control
4. **Vercel Account**: A Vercel account with access to deploy projects
5. **Environment Variables**: Access to all required environment variables

## Required Environment Variables

The following environment variables are required for the LoadUp application:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for the database |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js authentication |
| `NEXTAUTH_URL` | URL for NextAuth.js callbacks |
| `SENTRY_DSN` | Sentry Data Source Name for error tracking |
| `SENTRY_ORG` | Sentry organization name |
| `SENTRY_PROJECT` | Sentry project name |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token |
| `GOOGLE_CLOUD_VISION_API_KEY` | API key for Google Cloud Vision OCR |
| `MAPBOX_ACCESS_TOKEN` | Access token for Mapbox integration |
| `STRIPE_SECRET_KEY` | Secret key for Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret for Stripe events |
| `STRIPE_PUBLISHABLE_KEY` | Publishable key for Stripe integration |

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/PhotonEntangled/LoadUp.git
cd LoadUp
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Set Up Vercel Deployment

We've created a script to automate the Vercel deployment setup process. This script will:

- Check for Vercel CLI installation
- Verify authentication with Vercel
- Prompt for environment variables
- Create a Vercel configuration file
- Import environment variables to Vercel
- Optionally deploy the application

Run the script with:

```bash
node scripts/setup-vercel-env.js
```

Follow the prompts to set up your environment variables. For each variable, you can:
1. Enter a value to set it
2. Leave it empty to skip it

### 4. Deploy to Vercel

If you chose not to deploy during the setup process, you can deploy the application to Vercel with:

```bash
npx vercel --prod
```

This will deploy the application to Vercel using the production environment.

## Vercel Configuration

The LoadUp application uses the following Vercel configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "apps/admin-dashboard/.next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/apps/admin-dashboard/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "/api"
  }
}
```

This configuration:
- Uses Next.js as the framework
- Builds the admin dashboard application
- Sets up rewrites to route all requests to the admin dashboard
- Configures the API URL for the frontend

## CI/CD Pipeline

The LoadUp project includes a CI/CD pipeline configured with GitHub Actions. The pipeline includes:

1. **Continuous Integration (CI)**:
   - Code validation
   - Automated testing
   - Test coverage reporting
   - Build verification

2. **Continuous Deployment (CD)**:
   - Automated deployment to staging environment (develop branch)
   - Automated deployment to production environment (main branch)

The CI/CD pipeline is configured in the following files:
- `.github/workflows/ci.yml`: Continuous Integration workflow
- `.github/workflows/cd.yml`: Continuous Deployment workflow

## Troubleshooting

### Common Issues

1. **Environment Variable Errors**:
   - Ensure all required environment variables are set in Vercel
   - Check for typos in environment variable names
   - Verify that environment variable values are correct

2. **Build Errors**:
   - Check the build logs for specific error messages
   - Ensure all dependencies are installed correctly
   - Verify that the build command is correct

3. **Deployment Errors**:
   - Check the Vercel deployment logs for specific error messages
   - Ensure the Vercel project is configured correctly
   - Verify that the deployment command is correct

### Getting Help

If you encounter issues during deployment, please:

1. Check the error messages in the logs
2. Refer to the Vercel documentation: https://vercel.com/docs
3. Contact the LoadUp development team for assistance

## Post-Deployment Verification

After deploying the application, verify that:

1. The application is accessible at the deployed URL
2. Authentication works correctly
3. Document processing functions properly
4. Shipment management features are working
5. The driver view is accessible and functional

## Conclusion

Following these steps should result in a successful deployment of the LoadUp application to Vercel. If you encounter any issues, refer to the troubleshooting section or contact the development team for assistance. 