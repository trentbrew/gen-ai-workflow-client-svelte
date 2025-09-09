import { test, expect } from '@playwright/test';

test.describe('Layers Web Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should load the home page successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Layers/);

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();

    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display workflow categories correctly', async ({ page }) => {
    // Check that workflow categories are displayed
    await expect(page.locator('text=Workflows')).toBeVisible();
    await expect(page.locator('text=Tools')).toBeVisible();
    await expect(page.locator('text=Actions')).toBeVisible();
  });

  test('should have TikTok workflow selected by default', async ({ page }) => {
    // Check that TikTok workflow is selected by default
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();

    // Check that the form is visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display brand form fields', async ({ page }) => {
    // Check for brand name field
    await expect(
      page.locator('input[placeholder*="PlushPop AI"]'),
    ).toBeVisible();

    // Check for website field
    await expect(
      page.locator('input[placeholder*="https://plushpop.ai"]'),
    ).toBeVisible();

    // Check for core identity field
    await expect(
      page.locator('textarea[placeholder*="Core Identity"]'),
    ).toBeVisible();
  });

  test('should submit TikTok workflow form successfully', async ({ page }) => {
    // Fill in the form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Test Brand');
    await page.fill(
      'input[placeholder*="https://plushpop.ai"]',
      'https://testbrand.com',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test core identity for E2E testing',
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the API call to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 120000 }, // 2 minutes timeout for video generation
    );

    // Check that results are displayed in the third column
    await expect(page.locator('text=Generated Video')).toBeVisible();

    // Check that a video element is present
    await expect(page.locator('video')).toBeVisible();
  });

  test('should display breadcrumbs correctly', async ({ page }) => {
    // Check that breadcrumbs show the correct category
    await expect(page.locator('text=Workflows')).toBeVisible();
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check that validation errors are shown or form doesn't submit
    // (This depends on your validation implementation)
    await page.waitForTimeout(1000);

    // The form should either show validation errors or not submit
    // We'll check that the results section is not visible
    await expect(page.locator('text=Generated Video')).not.toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the page is still functional
    await expect(page.locator('form')).toBeVisible();

    // Check that form fields are accessible
    await expect(
      page.locator('input[placeholder*="PlushPop AI"]'),
    ).toBeVisible();
  });

  test('should load different workflows when selected', async ({ page }) => {
    // This test would need to be implemented based on your workflow selection UI
    // For now, we'll just check that the TikTok workflow is available
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();
  });
});

test.describe('Layers Web Application - Error Handling', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/tiktok-video-generation', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Fill and submit the form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Test Brand');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test core identity',
    );
    await page.click('button[type="submit"]');

    // Check that error is handled gracefully
    await expect(page.locator('text=error')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network timeouts', async ({ page }) => {
    // Mock a slow API response
    await page.route('**/api/tiktok-video-generation', (route) => {
      // Delay the response to simulate timeout
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }, 10000);
    });

    // Fill and submit the form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Test Brand');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test core identity',
    );
    await page.click('button[type="submit"]');

    // Check that loading state is shown
    await expect(page.locator('text=Loading')).toBeVisible({ timeout: 5000 });
  });
});
