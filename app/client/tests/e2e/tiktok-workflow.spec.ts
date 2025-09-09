import { test, expect } from '@playwright/test';

test.describe('TikTok Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load and TikTok workflow to be selected by default
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();
  });

  test('should complete full TikTok workflow successfully', async ({
    page,
  }) => {
    // Step 1: Fill in brand information
    await page.fill('input[placeholder*="PlushPop AI"]', 'E2E Test Brand');
    await page.fill(
      'input[placeholder*="https://plushpop.ai"]',
      'https://e2etest.com',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'E2E testing brand for automated video generation',
    );

    // Step 2: Fill in additional brand details
    await page.fill(
      'textarea[placeholder*="Target Audience"]',
      'Tech-savvy professionals and developers',
    );
    await page.fill(
      'textarea[placeholder*="Brand Voice"]',
      'Professional yet approachable',
    );
    await page.fill(
      'textarea[placeholder*="Key Messages"]',
      'Innovation, quality, and user experience',
    );

    // Step 3: Submit the form
    await page.click('button[type="submit"]');

    // Step 4: Wait for the workflow to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 }, // 3 minutes timeout for video generation
    );

    // Step 5: Verify results are displayed
    await expect(page.locator('text=Generated Video')).toBeVisible();
    await expect(page.locator('text=Brand Profile Analysis')).toBeVisible();
    await expect(page.locator('text=Generated Text')).toBeVisible();

    // Step 6: Verify video element is present and functional
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // Step 7: Check video source is valid
    const videoSrc = await video.getAttribute('src');
    expect(videoSrc).toContain('http://localhost:5050/files/');
    expect(videoSrc).toContain('.mp4');

    // Step 8: Verify video can load
    await video.waitFor({ state: 'visible' });

    // Step 9: Check that video has proper attributes
    await expect(video).toHaveAttribute('controls');
  });

  test('should display brand analysis results', async ({ page }) => {
    // Fill and submit form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Brand Analysis Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'A brand focused on innovation and user experience',
    );
    await page.click('button[type="submit"]');

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 },
    );

    // Verify brand analysis is displayed
    await expect(page.locator('text=Brand Profile Analysis')).toBeVisible();

    // Check for key brand analysis elements
    await expect(page.locator('text=Brand Name')).toBeVisible();
    await expect(page.locator('text=Mission')).toBeVisible();
    await expect(page.locator('text=Search Terms')).toBeVisible();
  });

  test('should display generated text content', async ({ page }) => {
    // Fill and submit form
    await page.fill(
      'input[placeholder*="PlushPop AI"]',
      'Text Generation Test',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'A creative brand that tells compelling stories',
    );
    await page.click('button[type="submit"]');

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 },
    );

    // Verify generated text is displayed
    await expect(page.locator('text=Generated Text')).toBeVisible();

    // Check that text content is present and not empty
    const textContent = page
      .locator('text=Generated Text')
      .locator('..')
      .locator('pre, code, div');
    await expect(textContent).toBeVisible();
  });

  test('should handle form validation correctly', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Wait a moment for any validation to appear
    await page.waitForTimeout(2000);

    // Check that results are not displayed (form didn't submit)
    await expect(page.locator('text=Generated Video')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/tiktok-video-generation', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error',
          message: 'Video generation failed',
        }),
      });
    });

    // Fill and submit form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Error Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test for error handling',
    );
    await page.click('button[type="submit"]');

    // Wait for error response
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 500,
      { timeout: 10000 },
    );

    // Check that error is displayed
    await expect(page.locator('text=error')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during processing', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/tiktok-video-generation', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            finalVideoUrl: 'http://localhost:5050/files/test-video.mp4',
            brandProfile: { name: 'Test Brand' },
            generatedText: ['Test text'],
          }),
        });
      }, 5000); // 5 second delay
    });

    // Fill and submit form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Loading Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test for loading state',
    );
    await page.click('button[type="submit"]');

    // Check that loading state is shown
    await expect(page.locator('text=Loading')).toBeVisible({ timeout: 2000 });

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 10000 },
    );

    // Check that results are displayed
    await expect(page.locator('text=Generated Video')).toBeVisible();
  });

  test('should maintain form state during processing', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder*="PlushPop AI"]', 'State Test Brand');
    await page.fill(
      'input[placeholder*="https://plushpop.ai"]',
      'https://statetest.com',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test for form state maintenance',
    );

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for processing to start
    await page.waitForTimeout(1000);

    // Check that form values are still present
    await expect(page.locator('input[placeholder*="PlushPop AI"]')).toHaveValue(
      'State Test Brand',
    );
    await expect(
      page.locator('input[placeholder*="https://plushpop.ai"]'),
    ).toHaveValue('https://statetest.com');
    await expect(
      page.locator('textarea[placeholder*="Core Identity"]'),
    ).toHaveValue('Test for form state maintenance');
  });

  test('should handle video loading errors', async ({ page }) => {
    // Fill and submit form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Video Error Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test for video loading errors',
    );
    await page.click('button[type="submit"]');

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 },
    );

    // Mock video loading error
    await page.route('**/files/*.mp4', (route) => {
      route.fulfill({
        status: 404,
        body: 'Video not found',
      });
    });

    // Check that video element is present
    const video = page.locator('video');
    await expect(video).toBeVisible();

    // The video should handle the error gracefully
    // (This depends on your error handling implementation)
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify form is still functional
    await expect(
      page.locator('input[placeholder*="PlushPop AI"]'),
    ).toBeVisible();
    await expect(
      page.locator('textarea[placeholder*="Core Identity"]'),
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Fill and submit form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Mobile Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Mobile responsiveness test',
    );
    await page.click('button[type="submit"]');

    // Wait for completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 },
    );

    // Verify results are displayed on mobile
    await expect(page.locator('text=Generated Video')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify everything still works
    await expect(page.locator('video')).toBeVisible();
  });

  test('should handle multiple rapid submissions', async ({ page }) => {
    // Fill form
    await page.fill('input[placeholder*="PlushPop AI"]', 'Rapid Submit Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Test for rapid submissions',
    );

    // Submit multiple times rapidly
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');

    // Wait for at least one completion
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 180000 },
    );

    // Verify results are displayed
    await expect(page.locator('text=Generated Video')).toBeVisible();
  });
});
