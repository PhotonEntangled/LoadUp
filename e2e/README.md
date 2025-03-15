# End-to-End Tests for LoadUp

This directory contains end-to-end tests for the LoadUp application using Playwright.

## Test Structure

- `auth.spec.ts`: Tests for authentication flows (login, logout)
- `auth/login.spec.ts`: Detailed tests for the login page
- `shipments.spec.ts`: Tests for shipment management flows
- `document-processing.spec.ts`: Tests for document processing flows

## Test Fixtures

The `fixtures` directory contains test files used by the end-to-end tests:

- `test-document.jpg`: A sample shipping document image for OCR testing
- `test-shipments.xlsx`: A sample Excel file with shipment data
- `invalid-file.txt`: An invalid file format for testing error handling

**Note**: The fixture files in this repository are placeholders. Before running the tests, replace them with actual test files:

1. Replace `test-document.jpg` with a real image of a shipping document
2. Replace `test-shipments.xlsx` with a real Excel file containing sample shipment data
3. Keep `invalid-file.txt` as is for testing error handling

## Running the Tests

### Prerequisites

1. Make sure the application is running locally:
   ```bash
   npm run dev
   ```

2. Set up test environment variables in `.env.test`

### Running All Tests

```bash
npm run test:e2e
```

### Running Specific Tests

```bash
npx playwright test e2e/auth.spec.ts
```

### Running Tests with UI Mode

```bash
npx playwright test --ui
```

## Test User

The tests use a test user account with the following credentials:

- Email: `test@loadup.com`
- Password: `testpassword`

You can override these credentials by setting the following environment variables:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

## Debugging Tests

To debug tests:

1. Run with the `--debug` flag:
   ```bash
   npx playwright test --debug
   ```

2. Use the Playwright Inspector to step through the tests

## Generating Test Reports

```bash
npx playwright test --reporter=html
```

The report will be available in the `playwright-report` directory. 