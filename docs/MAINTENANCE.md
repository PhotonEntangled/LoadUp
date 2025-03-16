# LoadUp Codebase Maintenance Guide

This document provides guidance on maintaining the LoadUp codebase, including how to use the cleanup scripts, interpret their reports, and follow best practices for code quality.

## Table of Contents

- [Cleanup Scripts](#cleanup-scripts)
  - [Master Cleanup Script](#master-cleanup-script)
  - [Dependency Cleanup](#dependency-cleanup)
  - [Test Cleanup](#test-cleanup)
  - [Codebase Standardization](#codebase-standardization)
  - [Test Coverage Improvement](#test-coverage-improvement)
- [Reports](#reports)
  - [Cleanup Summary Report](#cleanup-summary-report)
  - [Test Status Report](#test-status-report)
  - [Standardization Report](#standardization-report)
  - [Test Coverage Report](#test-coverage-report)
- [Best Practices](#best-practices)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Dependency Management](#dependency-management)
  - [Code Standardization](#code-standardization)
- [Error Monitoring and Tracking](#error-monitoring-and-tracking)
  - [Sentry Integration](#sentry-integration)

## Cleanup Scripts

The LoadUp project includes several utility scripts to help maintain the codebase. These scripts are designed to be run periodically to keep the codebase clean, standardized, and well-tested.

### Master Cleanup Script

**Purpose:** Runs all cleanup scripts in sequence and provides a summary of changes.

**When to use:** Before major releases, after completing large features, or when the codebase needs a comprehensive cleanup.

**How to use:**
```bash
npm run cleanup
```

**Changes made:**
- Removes unused dependencies
- Fixes or skips failing tests
- Standardizes code style and structure
- Generates a summary report

### Dependency Cleanup

**Purpose:** Removes unused dependencies, particularly those related to Clerk after migration to NextAuth.

**When to use:** After migrating from one library to another, or periodically to keep dependencies lean.

**How to use:**
```bash
npm run cleanup:deps
```

**Changes made:**
- Removes specific dependencies from package.json files
- Physically removes Clerk directories from node_modules
- Suggests running npm-check or depcheck for further cleanup

### Test Cleanup

**Purpose:** Fixes or skips failing tests to ensure a clean test run.

**When to use:** When tests are failing and blocking CI/CD pipelines, or before improving test coverage.

**How to use:**
```bash
npm run cleanup:tests
```

**Changes made:**
- Identifies failing tests
- Skips known failing tests by adding `.skip` to test functions
- Updates jest.config.mjs to exclude failing tests
- Creates a test status report

### Codebase Standardization

**Purpose:** Standardizes code style, ensures consistent ES module usage, and removes deprecated files.

**When to use:** After major refactoring, when introducing new coding standards, or periodically to maintain consistency.

**How to use:**
```bash
npm run cleanup:standardize
```

**Changes made:**
- Removes deprecated files and directories
- Converts CommonJS requires to ES imports
- Adds .js extensions to local imports for ESM compatibility
- Converts CommonJS exports to ES exports
- Ensures consistent use of ES modules in package.json and tsconfig.json
- Runs ESLint to fix coding style issues

### Test Coverage Improvement

**Purpose:** Analyzes test coverage, identifies untested files, and generates test templates.

**When to use:** When test coverage is low, after adding new features, or as part of regular maintenance.

**How to use:**
```bash
npm run improve:coverage
```

**Changes made:**
- Runs tests with coverage
- Identifies untested files
- Prioritizes files based on importance (services, utilities, etc.)
- Generates test templates for high-priority files
- Creates a test coverage report

## Reports

Each cleanup script generates a report that provides information about the changes made and recommendations for further improvements.

### Cleanup Summary Report

**Location:** `cleanup-summary.md`

**Contents:**
- List of scripts run and their status (success/failure)
- Next steps for further cleanup
- Manual tasks that need to be performed

**How to interpret:**
- Review the status of each script to ensure they all ran successfully
- Follow the next steps to complete the cleanup process
- Address any manual tasks that couldn't be automated

### Test Status Report

**Location:** `test-status-report.md`

**Contents:**
- Summary of test status (passing, skipped, failing)
- List of passing tests
- List of skipped tests
- List of failing tests
- Next steps for improving tests

**How to interpret:**
- Focus on fixing failing tests first
- Review skipped tests to determine if they can be fixed
- Ensure passing tests remain passing after changes

### Standardization Report

**Location:** `standardization-report.md`

**Contents:**
- Summary of standardization changes
- List of removed deprecated files
- List of standardized files
- Next steps for further standardization

**How to interpret:**
- Review the list of removed files to ensure no important files were accidentally removed
- Check standardized files to ensure changes didn't break functionality
- Follow next steps to complete standardization

### Test Coverage Report

**Location:** `test-coverage-report.md`

**Contents:**
- Summary of test coverage
- List of untested files by priority
- List of generated test templates
- Next steps for improving coverage

**How to interpret:**
- Focus on high-priority untested files first
- Review and complete the generated test templates
- Run tests with coverage again to see improvements

## Best Practices

### Code Quality

1. **Follow the Style Guide**
   - Use ESLint and Prettier to enforce coding standards
   - Run `npm run lint` regularly to catch style issues
   - Fix lint errors before committing code

2. **Keep Functions Small and Focused**
   - Functions should do one thing and do it well
   - Aim for functions under 20 lines of code
   - Extract complex logic into separate functions

3. **Use Meaningful Names**
   - Variables, functions, and classes should have descriptive names
   - Avoid abbreviations unless they're widely understood
   - Use consistent naming conventions

4. **Comment Complex Logic**
   - Add comments to explain complex algorithms
   - Document why, not what (the code shows what, comments explain why)
   - Keep comments up-to-date with code changes

### Testing

1. **Write Tests First**
   - Follow Test-Driven Development (TDD) principles when possible
   - Write tests before implementing features
   - Use tests to define requirements

2. **Test Edge Cases**
   - Test boundary conditions
   - Test error handling
   - Test with invalid inputs

3. **Keep Tests Independent**
   - Tests should not depend on each other
   - Each test should set up its own state
   - Use mocks and stubs to isolate tests

4. **Aim for High Coverage**
   - Strive for at least 80% code coverage
   - Focus on testing business logic and critical paths
   - Use `npm run test:coverage` to identify untested code

### Dependency Management

1. **Keep Dependencies Updated**
   - Regularly run `npm outdated` to identify outdated packages
   - Update dependencies with `npm update` or manually
   - Test thoroughly after updating dependencies

2. **Minimize Dependencies**
   - Only add dependencies when necessary
   - Consider the size and maintenance status of packages
   - Use `npm run cleanup:deps` periodically to remove unused dependencies

3. **Use Exact Versions**
   - Use exact versions in package.json to ensure consistency
   - Update dependencies intentionally, not automatically
   - Document major dependency changes

### Code Standardization

1. **Use ES Modules**
   - Use ES modules (import/export) instead of CommonJS (require/module.exports)
   - Add .js extensions to local imports for ESM compatibility
   - Set "type": "module" in package.json

2. **Follow Project Structure**
   - Keep related files together
   - Use consistent directory naming
   - Follow the established project structure

3. **Standardize Error Handling**
   - Use consistent error handling patterns
   - Provide meaningful error messages
   - Log errors appropriately

4. **Run Standardization Regularly**
   - Use `npm run cleanup:standardize` periodically
   - Review standardization changes carefully
   - Ensure standardization doesn't break functionality

## Error Monitoring and Tracking

### Sentry Integration

The LoadUp application uses Sentry for error tracking and performance monitoring across all applications. Here's how to maintain the Sentry integration:

#### Environment Variables

Ensure the following environment variables are set in your `.env` file and in the CI/CD pipeline:

```
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_organization
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

#### Testing Sentry Integration

Each application includes a `sentry:test` script in its `package.json` to verify the Sentry integration:

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

#### Updating Sentry Configuration

If you need to update the Sentry configuration, you'll need to modify the following files:

- **Admin Dashboard**:
  - `apps/admin-dashboard/sentry.client.config.js`
  - `apps/admin-dashboard/sentry.server.config.js`
  - `apps/admin-dashboard/sentry.edge.config.js`
  - `apps/admin-dashboard/next.config.js`

- **Driver App**:
  - `apps/driver-app/app/utils/sentry.ts`

- **API**:
  - `packages/api/src/middleware/sentry.js`

#### Best Practices

1. **Error Boundaries**: Use error boundaries to catch and handle errors gracefully
2. **User Context**: Set user context when users log in to track errors by user
3. **Tags and Breadcrumbs**: Add tags and breadcrumbs to provide context for errors
4. **Performance Monitoring**: Use Sentry's performance monitoring to track slow requests
5. **Environment Separation**: Configure different DSNs for development, staging, and production

For more detailed information, refer to the [Sentry Integration Guide](./sentry-integration.md). 