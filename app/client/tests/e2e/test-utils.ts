import { Page, expect } from '@playwright/test';

/**
 * E2E Test Utilities for Layers Project
 * Common functions and helpers for end-to-end testing
 */

export class LayersTestUtils {
  constructor(private page: Page) {}

  /**
   * Navigate to the home page and wait for it to load
   */
  async navigateToHome() {
    await this.page.goto('/');
    await expect(this.page).toHaveTitle(/Layers/);
    await expect(
      this.page.locator('text=TikTok Video Generation'),
    ).toBeVisible();
  }

  /**
   * Fill out the TikTok workflow form with test data
   */
  async fillTikTokForm(
    data: {
      brandName?: string;
      website?: string;
      coreIdentity?: string;
      targetAudience?: string;
      brandVoice?: string;
      keyMessages?: string;
    } = {},
  ) {
    const defaults = {
      brandName: 'E2E Test Brand',
      website: 'https://e2etest.com',
      coreIdentity: 'E2E testing brand for automated video generation',
      targetAudience: 'Tech-savvy professionals and developers',
      brandVoice: 'Professional yet approachable',
      keyMessages: 'Innovation, quality, and user experience',
    };

    const formData = { ...defaults, ...data };

    if (formData.brandName) {
      await this.page.fill(
        'input[placeholder*="PlushPop AI"]',
        formData.brandName,
      );
    }

    if (formData.website) {
      await this.page.fill(
        'input[placeholder*="https://plushpop.ai"]',
        formData.website,
      );
    }

    if (formData.coreIdentity) {
      await this.page.fill(
        'textarea[placeholder*="Core Identity"]',
        formData.coreIdentity,
      );
    }

    if (formData.targetAudience) {
      await this.page.fill(
        'textarea[placeholder*="Target Audience"]',
        formData.targetAudience,
      );
    }

    if (formData.brandVoice) {
      await this.page.fill(
        'textarea[placeholder*="Brand Voice"]',
        formData.brandVoice,
      );
    }

    if (formData.keyMessages) {
      await this.page.fill(
        'textarea[placeholder*="Key Messages"]',
        formData.keyMessages,
      );
    }
  }

  /**
   * Submit the TikTok workflow form and wait for completion
   */
  async submitTikTokForm(timeout: number = 180000) {
    await this.page.click('button[type="submit"]');

    // Wait for the API response
    await this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout },
    );
  }

  /**
   * Verify that the TikTok workflow results are displayed
   */
  async verifyTikTokResults() {
    await expect(this.page.locator('text=Generated Video')).toBeVisible();
    await expect(
      this.page.locator('text=Brand Profile Analysis'),
    ).toBeVisible();
    await expect(this.page.locator('text=Generated Text')).toBeVisible();

    // Verify video element
    const video = this.page.locator('video');
    await expect(video).toBeVisible();

    // Check video source
    const videoSrc = await video.getAttribute('src');
    expect(videoSrc).toContain('http://localhost:5050/files/');
    expect(videoSrc).toContain('.mp4');

    return video;
  }

  /**
   * Mock API response for testing error scenarios
   */
  async mockApiError(
    status: number = 500,
    errorMessage: string = 'Internal server error',
  ) {
    await this.page.route('**/api/tiktok-video-generation', (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: errorMessage,
          message: errorMessage,
        }),
      });
    });
  }

  /**
   * Mock slow API response for testing loading states
   */
  async mockSlowApiResponse(delay: number = 5000) {
    await this.page.route('**/api/tiktok-video-generation', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            finalVideoUrl: 'http://localhost:5050/files/test-video.mp4',
            brandProfile: {
              name: 'Test Brand',
              mission: 'Test mission',
              searchTerms: { video: ['test'], image: ['test'] },
            },
            generatedText: ['Test generated text'],
          }),
        });
      }, delay);
    });
  }

  /**
   * Mock successful API response
   */
  async mockSuccessfulApiResponse(data: any = {}) {
    const defaultData = {
      success: true,
      finalVideoUrl: 'http://localhost:5050/files/test-video.mp4',
      brandProfile: {
        name: 'Test Brand',
        mission: 'Test mission',
        searchTerms: { video: ['test'], image: ['test'] },
      },
      generatedText: ['Test generated text'],
    };

    await this.page.route('**/api/tiktok-video-generation', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...defaultData, ...data }),
      });
    });
  }

  /**
   * Wait for loading state to appear
   */
  async waitForLoadingState() {
    await expect(this.page.locator('text=Loading')).toBeVisible({
      timeout: 5000,
    });
  }

  /**
   * Wait for loading state to disappear
   */
  async waitForLoadingComplete() {
    await expect(this.page.locator('text=Loading')).not.toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Check that form validation is working
   */
  async verifyFormValidation() {
    // Try to submit empty form
    await this.page.click('button[type="submit"]');

    // Wait for validation to appear
    await this.page.waitForTimeout(2000);

    // Check that results are not displayed
    await expect(this.page.locator('text=Generated Video')).not.toBeVisible();
  }

  /**
   * Set viewport size for responsive testing
   */
  async setViewportSize(size: { width: number; height: number }) {
    await this.page.setViewportSize(size);
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.page.fill('input[placeholder*="PlushPop AI"]', '');
    await this.page.fill('input[placeholder*="https://plushpop.ai"]', '');
    await this.page.fill('textarea[placeholder*="Core Identity"]', '');
    await this.page.fill('textarea[placeholder*="Target Audience"]', '');
    await this.page.fill('textarea[placeholder*="Brand Voice"]', '');
    await this.page.fill('textarea[placeholder*="Key Messages"]', '');
  }

  /**
   * Verify that the page is responsive
   */
  async verifyResponsiveDesign() {
    // Test mobile viewport
    await this.setViewportSize({ width: 375, height: 667 });
    await expect(this.page.locator('form')).toBeVisible();

    // Test tablet viewport
    await this.setViewportSize({ width: 768, height: 1024 });
    await expect(this.page.locator('form')).toBeVisible();

    // Test desktop viewport
    await this.setViewportSize({ width: 1920, height: 1080 });
    await expect(this.page.locator('form')).toBeVisible();
  }

  /**
   * Complete full TikTok workflow test
   */
  async completeTikTokWorkflow(data: any = {}) {
    await this.navigateToHome();
    await this.fillTikTokForm(data);
    await this.submitTikTokForm();
    return await this.verifyTikTokResults();
  }
}

/**
 * Helper function to create test utils instance
 */
export function createTestUtils(page: any) {
  return new LayersTestUtils(page);
}

/**
 * Common test data
 */
export const testData = {
  validBrand: {
    brandName: 'Test Brand',
    website: 'https://testbrand.com',
    coreIdentity: 'A innovative brand focused on user experience',
    targetAudience: 'Tech professionals and developers',
    brandVoice: 'Professional and approachable',
    keyMessages: 'Innovation, quality, reliability',
  },

  minimalBrand: {
    brandName: 'Minimal Brand',
    coreIdentity: 'Simple test brand',
  },

  longContent: {
    brandName: 'Very Long Brand Name That Exceeds Normal Length',
    website: 'https://very-long-domain-name-that-exceeds-normal-length.com',
    coreIdentity:
      'This is a very long core identity description that contains multiple sentences and should test how the system handles longer content. It includes various details about the brand, its values, mission, and unique selling propositions.',
    targetAudience:
      'A very specific and detailed target audience description that includes demographics, psychographics, and behavioral characteristics',
    brandVoice:
      'A comprehensive brand voice description that outlines tone, style, and communication approach',
    keyMessages:
      'Multiple key messages that the brand wants to communicate to its audience, including value propositions and unique benefits',
  },
};
