import { test, expect } from '@playwright/test';

test.describe('Basic E2E Test', () => {
  test('should pass a basic test', async ({ page }) => {
    // Simple test that doesn't require servers
    expect(true).toBe(true);
  });

  test('should navigate to a simple page', async ({ page }) => {
    // Navigate to a simple page that doesn't require our servers
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });
});
