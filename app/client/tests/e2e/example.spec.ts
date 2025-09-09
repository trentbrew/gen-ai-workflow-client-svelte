import { test, expect } from '@playwright/test';
import { createTestUtils, testData } from './test-utils';

test.describe('Layers E2E Example Tests', () => {
  test('should demonstrate basic E2E testing workflow', async ({ page }) => {
    const utils = createTestUtils(page);

    // Step 1: Navigate to home page
    await utils.navigateToHome();

    // Step 2: Verify page elements
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();

    // Step 3: Fill out form with test data
    await utils.fillTikTokForm(testData.validBrand);

    // Step 4: Verify form is filled correctly
    await expect(page.locator('input[placeholder*="PlushPop AI"]')).toHaveValue(
      'Test Brand',
    );
    await expect(
      page.locator('input[placeholder*="https://plushpop.ai"]'),
    ).toHaveValue('https://testbrand.com');

    // Step 5: Take a screenshot for documentation
    await utils.takeScreenshot('form-filled');

    // Note: We don't submit the form in this example to avoid long video generation
    // In real tests, you would call: await utils.submitTikTokForm()
  });

  test('should handle responsive design', async ({ page }) => {
    const utils = createTestUtils(page);

    // Test different viewport sizes
    await utils.verifyResponsiveDesign();

    // Navigate and verify functionality on mobile
    await utils.navigateToHome();
    await utils.setViewportSize({ width: 375, height: 667 });

    // Verify form is still functional on mobile
    await expect(page.locator('form')).toBeVisible();
    await expect(
      page.locator('input[placeholder*="PlushPop AI"]'),
    ).toBeVisible();
  });

  test('should demonstrate error handling', async ({ page }) => {
    const utils = createTestUtils(page);

    // Navigate to home page
    await utils.navigateToHome();

    // Mock API error
    await utils.mockApiError(500, 'Test error message');

    // Fill and submit form
    await utils.fillTikTokForm(testData.minimalBrand);
    await page.click('button[type="submit"]');

    // Wait for error response
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 500,
      { timeout: 10000 },
    );

    // Verify error is handled gracefully
    await expect(page.locator('text=error')).toBeVisible({ timeout: 10000 });
  });

  test('should demonstrate loading state handling', async ({ page }) => {
    const utils = createTestUtils(page);

    // Navigate to home page
    await utils.navigateToHome();

    // Mock slow API response
    await utils.mockSlowApiResponse(3000); // 3 second delay

    // Fill and submit form
    await utils.fillTikTokForm(testData.validBrand);
    await page.click('button[type="submit"]');

    // Wait for loading state
    await utils.waitForLoadingState();

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 10000 },
    );

    // Verify results are displayed
    await expect(page.locator('text=Generated Video')).toBeVisible();
  });
});
