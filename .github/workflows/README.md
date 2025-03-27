# LoadUp CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the LoadUp platform.

## Workflows

### Admin Dashboard (`admin-dashboard.yml`)

Handles the CI/CD pipeline for the admin dashboard web application.

- **Validate**: Lints the code to ensure quality standards
- **Test**: Runs unit and integration tests
- **Build**: Builds the application and creates a Sentry release
- **Deploy**: Deploys the application to Vercel

### Driver App (`driver-app.yml`)

Handles the CI/CD pipeline for the React Native driver application.

- **Validate**: Lints the code to ensure quality standards
- **Test**: Runs unit and integration tests
- **Build**: Builds the application and creates a Sentry release
- **Deploy**: Deploys the application to Expo

### API (`api.yml`)

Handles the CI/CD pipeline for the backend API.

- **Validate**: Lints the code to ensure quality standards
- **Test**: Sets up a test database and runs API tests
- **Build**: Builds the API and creates a Sentry release
- **Deploy**: Deploys the API to Railway (production and staging environments)

## Environment Variables

The following environment variables need to be set in GitHub repository secrets:

### Vercel Deployment (Admin Dashboard)
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Expo Deployment (Driver App)
- `EXPO_USERNAME`: Expo account username
- `EXPO_PASSWORD`: Expo account password

### Railway Deployment (API)
- `RAILWAY_TOKEN`: Railway API token

### Sentry Error Tracking (All Applications)
- `SENTRY_DSN`: Sentry DSN for error reporting
- `SENTRY_ORG`: Sentry organization name
- `SENTRY_PROJECT`: Sentry project name
- `SENTRY_AUTH_TOKEN`: Sentry authentication token

### Authentication
- `NEXTAUTH_SECRET`: Secret for NextAuth (Admin Dashboard)
- `JWT_SECRET`: Secret for JWT authentication (API)

## Deployment Environments

Each workflow supports multiple deployment environments:

- **Production**: Deployed when code is pushed to the `main` branch
- **Preview/Staging**: Deployed when code is pushed to the `develop` branch

## Manual Deployment

You can also trigger workflows manually using the GitHub Actions UI by selecting the "workflow_dispatch" event.

## Local Development

For local development and testing, each application has its own deployment script:

- Admin Dashboard: `cd apps/admin-dashboard && npm run deploy`
- Driver App: `cd apps/driver-app && npm run deploy`
- API: `cd apps/api && npm run deploy` 