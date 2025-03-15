import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should show login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    await page.getByLabel('Email').fill('test@loadup.com');
    await page.getByLabel('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should handle logout', async ({ page }) => {
    // First login
    await page.getByLabel('Email').fill('test@loadup.com');
    await page.getByLabel('Password').fill('testpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Then logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });
}); 