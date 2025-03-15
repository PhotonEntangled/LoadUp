import { test, expect } from '@playwright/test';

test.describe('Shipment Management Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Login with test credentials
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@loadup.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'testpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Navigate to shipments page
    await page.goto('/shipments');
  });

  test('should display shipments list', async ({ page }) => {
    // Check if the page title is visible
    await expect(page.getByRole('heading', { name: /shipments/i })).toBeVisible();
    
    // Check if the create shipment button is visible
    await expect(page.getByRole('button', { name: /create shipment/i })).toBeVisible();
    
    // Check if the shipments table is visible
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should filter shipments', async ({ page }) => {
    // Enter search term
    await page.getByPlaceholder(/search shipments/i).fill('test');
    
    // Wait for the results to update
    await page.waitForResponse(response => 
      response.url().includes('/api/shipments') && 
      response.status() === 200
    );
    
    // Check if the filter was applied
    const url = page.url();
    expect(url).toContain('search=test');
  });

  test('should navigate to shipment details', async ({ page }) => {
    // Click on the first shipment in the list
    await page.getByRole('link', { name: /view/i }).first().click();
    
    // Check if we're on the shipment details page
    await expect(page.url()).toContain('/shipments/');
    
    // Check if the shipment details are displayed
    await expect(page.getByText(/shipment details/i)).toBeVisible();
  });

  test('should create a new shipment', async ({ page }) => {
    // Click on create shipment button
    await page.getByRole('button', { name: /create shipment/i }).click();
    
    // Check if we're on the create shipment page
    await expect(page.url()).toContain('/shipments/create');
    
    // Fill in the shipment form
    await page.getByLabel(/customer/i).fill('Test Customer');
    await page.getByLabel(/description/i).fill('Test Shipment Description');
    
    // Fill pickup location
    await page.getByLabel(/pickup street/i).fill('123 Main St');
    await page.getByLabel(/pickup city/i).fill('New York');
    await page.getByLabel(/pickup state/i).fill('NY');
    await page.getByLabel(/pickup zip/i).fill('10001');
    
    // Fill delivery location
    await page.getByLabel(/delivery street/i).fill('456 Elm St');
    await page.getByLabel(/delivery city/i).fill('Boston');
    await page.getByLabel(/delivery state/i).fill('MA');
    await page.getByLabel(/delivery zip/i).fill('02101');
    
    // Fill contact information
    await page.getByLabel(/pickup contact name/i).fill('John Doe');
    await page.getByLabel(/pickup contact phone/i).fill('555-1234');
    await page.getByLabel(/delivery contact name/i).fill('Jane Smith');
    await page.getByLabel(/delivery contact phone/i).fill('555-5678');
    
    // Submit the form
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Check if we're redirected to the shipments list
    await expect(page.url()).toContain('/shipments');
    
    // Check for success message
    await expect(page.getByText(/shipment created successfully/i)).toBeVisible();
  });

  test('should update shipment status', async ({ page }) => {
    // Click on the first shipment in the list
    await page.getByRole('link', { name: /view/i }).first().click();
    
    // Check if we're on the shipment details page
    await expect(page.url()).toContain('/shipments/');
    
    // Click on update status button
    await page.getByRole('button', { name: /update status/i }).click();
    
    // Select a new status
    await page.getByRole('combobox').selectOption('in_transit');
    
    // Save the status
    await page.getByRole('button', { name: /save/i }).click();
    
    // Check for success message
    await expect(page.getByText(/status updated successfully/i)).toBeVisible();
    
    // Verify the new status is displayed
    await expect(page.getByText(/in transit/i)).toBeVisible();
  });
}); 