# Changelog

All notable changes to the LoadUp project will be documented in this file.

## [Unreleased]

### Added
- Comprehensive Sentry integration across all applications:
  - Admin Dashboard (Next.js)
  - Driver App (React Native)
  - API (Express)
- Error boundaries for Next.js admin dashboard
- Custom 404 page for admin dashboard
- Sentry middleware for API
- Sentry utility functions for driver app
- Environment variables for Sentry configuration
- Test scripts for verifying Sentry integration
- CI/CD workflow updates for Sentry deployment
- Detailed Sentry integration documentation

### Fixed
- Updated CI workflow to use `npm install` instead of `npm ci` for workspace dependencies
- Fixed TypeScript configuration for proper module resolution
- Added missing dependencies for UI components
- Resolved Sentry integration issues in all applications
- Fixed module system incompatibilities in API package

### Changed
- Updated environment variables example file with Sentry configuration
- Improved error handling in API middleware
- Enhanced driver app initialization with better error handling
- Reorganized documentation files for better clarity
- Updated progress tracking in planning documents

## [1.0.0] - 2023-03-15

### Added
- Initial release of LoadUp logistics application
- Admin dashboard for shipment management
- Driver app for mobile shipment tracking
- API for data processing and integration
- Database schema for logistics operations
- Authentication and authorization
- CI/CD pipeline for automated testing and deployment 