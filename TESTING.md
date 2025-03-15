# LoadUp Project - Testing Documentation

## Overview

This document provides information about the testing infrastructure and how to run tests for the LoadUp project.

## Testing Infrastructure

The LoadUp project uses the following testing tools:

- **Jest**: For unit and integration tests
- **Testing Library**: For React component testing
- **Playwright**: For end-to-end tests

## Test Types

### Unit Tests

Unit tests focus on testing individual functions, components, or modules in isolation. These tests are located in the `__tests__` directory and follow the naming convention `*.test.ts` or `*.test.tsx`.

### Integration Tests

Integration tests verify that different parts of the application work together correctly. These tests are located in the `__tests__` directory and follow the naming convention `*.integration.ts` or `*.integration.tsx`.

### End-to-End Tests

End-to-end tests simulate user interactions with the application to ensure that the entire application works as expected. These tests are located in the `e2e` directory and use Playwright.

## Running Tests

### Prerequisites

Before running tests, make sure you have:

1. Installed all dependencies:
   ```bash
   npm install
   ```

2. Set up the test database:
   ```bash
   npm run db:setup-test
   ```

3. Created a `.env.test` file with the necessary environment variables (see `.env.example` for reference).

### Running All Tests

To run all tests:

```bash
npm test
```

### Running Tests with Watch Mode

To run tests in watch mode (tests will automatically re-run when files change):

```bash
npm run test:watch
```

### Running Unit Tests Only

To run only unit tests:

```bash
npm run test:unit
```

### Running Integration Tests Only

To run only integration tests:

```bash
npm run test:integration
```

### Running End-to-End Tests

To run end-to-end tests:

```bash
npm run test:e2e
```

### Generating Test Coverage Report

To generate a test coverage report:

```bash
npm run test:coverage
```

The coverage report will be available in the `coverage` directory.

## CI/CD Integration

The project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline runs all tests automatically on each push to the `main` and `develop` branches, as well as on pull requests to these branches.

The CI/CD configuration is located in `.github/workflows/ci.yml`.

## Writing Tests

### Unit Tests

When writing unit tests:

1. Place test files in the `__tests__` directory
2. Follow the naming convention `*.test.ts` or `*.test.tsx`
3. Use Jest and Testing Library for testing React components
4. Mock external dependencies

Example:

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../path/to/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Integration Tests

When writing integration tests:

1. Place test files in the `__tests__` directory
2. Follow the naming convention `*.integration.ts` or `*.integration.tsx`
3. Test interactions between multiple components or modules
4. Use real dependencies when possible, mock only when necessary

### End-to-End Tests

When writing end-to-end tests:

1. Place test files in the `e2e` directory
2. Use Playwright for browser automation
3. Test complete user flows

Example:

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Mock External Services**: Use mocks for external services like APIs, databases, etc.
3. **Test Coverage**: Aim for high test coverage, especially for critical paths.
4. **Descriptive Test Names**: Use descriptive names for test cases to make it clear what is being tested.
5. **Arrange-Act-Assert**: Follow the AAA pattern (Arrange, Act, Assert) for structuring tests.

## Troubleshooting

### Common Issues

1. **Tests failing due to database connection issues**:
   - Make sure the test database is set up correctly
   - Check that the `.env.test` file has the correct database connection string

2. **Tests failing due to authentication issues**:
   - Ensure that the authentication mocks are set up correctly
   - Check that the `.env.test` file has the necessary authentication variables

3. **Tests timing out**:
   - Increase the timeout value in the test configuration
   - Check for infinite loops or long-running operations

### Getting Help

If you encounter issues with tests, please:

1. Check the error messages and logs
2. Review the test documentation
3. Consult with the team for assistance 