import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Document Processing Flow', () => {
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
    
    // Navigate to document processing page
    await page.goto('/documents');
  });

  test('should display document upload interface', async ({ page }) => {
    // Check if the page title is visible
    await expect(page.getByRole('heading', { name: /document processing/i })).toBeVisible();
    
    // Check if the upload button is visible
    await expect(page.getByText(/upload document/i)).toBeVisible();
    
    // Check if the file input is available
    await expect(page.getByLabel(/choose file/i)).toBeVisible();
  });

  test('should upload and process an image document', async ({ page }) => {
    // Prepare the file input for upload
    const fileInput = page.getByLabel(/choose file/i);
    
    // Upload a test image file
    const testImagePath = path.join(__dirname, 'fixtures', 'test-document.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // Click the upload button
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Wait for processing to complete
    await page.waitForSelector('text=Processing complete');
    
    // Check if OCR results are displayed
    await expect(page.getByText(/ocr results/i)).toBeVisible();
    
    // Verify extracted data is displayed
    await expect(page.getByText(/extracted data/i)).toBeVisible();
  });

  test('should upload and process an Excel file', async ({ page }) => {
    // Click on Excel upload tab
    await page.getByRole('tab', { name: /excel upload/i }).click();
    
    // Prepare the file input for upload
    const fileInput = page.getByLabel(/choose file/i);
    
    // Upload a test Excel file
    const testExcelPath = path.join(__dirname, 'fixtures', 'test-shipments.xlsx');
    await fileInput.setInputFiles(testExcelPath);
    
    // Click the upload button
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Wait for processing to complete
    await page.waitForSelector('text=Processing complete');
    
    // Check if Excel processing results are displayed
    await expect(page.getByText(/excel processing results/i)).toBeVisible();
    
    // Verify extracted shipments are displayed
    await expect(page.getByText(/extracted shipments/i)).toBeVisible();
  });

  test('should validate and correct extracted data', async ({ page }) => {
    // Upload a test image file
    const fileInput = page.getByLabel(/choose file/i);
    const testImagePath = path.join(__dirname, 'fixtures', 'test-document.jpg');
    await fileInput.setInputFiles(testImagePath);
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Wait for processing to complete
    await page.waitForSelector('text=Processing complete');
    
    // Click on validate button
    await page.getByRole('button', { name: /validate/i }).click();
    
    // Check if validation interface is displayed
    await expect(page.getByText(/validation interface/i)).toBeVisible();
    
    // Correct some data
    await page.getByLabel(/customer name/i).fill('Corrected Customer Name');
    
    // Save the corrections
    await page.getByRole('button', { name: /save corrections/i }).click();
    
    // Check for success message
    await expect(page.getByText(/data saved successfully/i)).toBeVisible();
  });

  test('should create shipments from processed documents', async ({ page }) => {
    // Upload a test image file
    const fileInput = page.getByLabel(/choose file/i);
    const testImagePath = path.join(__dirname, 'fixtures', 'test-document.jpg');
    await fileInput.setInputFiles(testImagePath);
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Wait for processing to complete
    await page.waitForSelector('text=Processing complete');
    
    // Validate the data
    await page.getByRole('button', { name: /validate/i }).click();
    await page.getByRole('button', { name: /save corrections/i }).click();
    
    // Create shipment from the processed document
    await page.getByRole('button', { name: /create shipment/i }).click();
    
    // Check for success message
    await expect(page.getByText(/shipment created successfully/i)).toBeVisible();
    
    // Verify we're redirected to the shipment details page
    await expect(page.url()).toContain('/shipments/');
  });

  test('should handle processing errors gracefully', async ({ page }) => {
    // Prepare the file input for upload
    const fileInput = page.getByLabel(/choose file/i);
    
    // Upload an invalid file
    const invalidFilePath = path.join(__dirname, 'fixtures', 'invalid-file.txt');
    await fileInput.setInputFiles(invalidFilePath);
    
    // Click the upload button
    await page.getByRole('button', { name: /upload/i }).click();
    
    // Check for error message
    await expect(page.getByText(/error processing document/i)).toBeVisible();
    
    // Verify helpful error details are displayed
    await expect(page.getByText(/unsupported file format/i)).toBeVisible();
  });
}); 