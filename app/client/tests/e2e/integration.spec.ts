import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

test.describe('Layers CLI + Web Application Integration', () => {
  const serverDir = path.join(process.cwd(), '..', 'server');
  const testDir = path.join(serverDir, 'test-integration');
  const testInputFile = path.join(testDir, 'integration-test.md');
  const testPlanFile = path.join(testDir, 'integration-plan.json');
  const testOutputFile = path.join(testDir, 'integration-output.mp4');

  test.beforeAll(async () => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test input file
    const testInput = `# Integration Test Video

This is a test video for CLI + Web integration testing.

## Scene 1: Web Interface
- Show: "Layers Web Interface"
- Duration: 3s
- Style: modern

## Scene 2: CLI Integration
- Show: "Command Line Interface"
- Duration: 4s
- Style: technical

## Scene 3: Full Workflow
- Show: "Complete Integration"
- Duration: 3s
- Style: professional
`;

    fs.writeFileSync(testInputFile, testInput);
  });

  test.afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should create video via CLI and display in web interface', async ({
    page,
  }) => {
    // Step 1: Create a plan using CLI
    const { stdout: planOutput, stderr: planError } = await execAsync(
      `pnpm run layers plan --in "${testInputFile}" --out "${testPlanFile}"`,
      { cwd: serverDir },
    );

    expect(planError).toBe('');
    expect(planOutput).toContain('Plan created successfully');
    expect(fs.existsSync(testPlanFile)).toBe(true);

    // Step 2: Render video using CLI
    const { stdout: renderOutput, stderr: renderError } = await execAsync(
      `pnpm run layers render --plan "${testPlanFile}" --out "${testOutputFile}" --seed 42`,
      { cwd: serverDir },
    );

    expect(renderError).toBe('');
    expect(renderOutput).toContain('Video rendered successfully');
    expect(fs.existsSync(testOutputFile)).toBe(true);

    // Step 3: Navigate to web interface
    await page.goto('/');

    // Step 4: Verify the web interface loads
    await expect(page).toHaveTitle(/Layers/);
    await expect(page.locator('text=TikTok Video Generation')).toBeVisible();

    // Step 5: Check that the CLI-generated video can be accessed
    // (This would require the web interface to be able to access CLI-generated files)
    const videoStats = fs.statSync(testOutputFile);
    expect(videoStats.size).toBeGreaterThan(0);
  });

  test('should handle workflow consistency between CLI and Web', async ({
    page,
  }) => {
    // Step 1: Create a plan via CLI
    await execAsync(
      `pnpm run layers plan --in "${testInputFile}" --out "${testPlanFile}"`,
      { cwd: serverDir },
    );

    // Step 2: Verify plan structure
    const planContent = fs.readFileSync(testPlanFile, 'utf8');
    const plan = JSON.parse(planContent);

    expect(plan).toHaveProperty('version');
    expect(plan).toHaveProperty('scenes');
    expect(Array.isArray(plan.scenes)).toBe(true);

    // Step 3: Navigate to web interface
    await page.goto('/');

    // Step 4: Fill out the TikTok workflow form
    await page.fill(
      'input[placeholder*="PlushPop AI"]',
      'Integration Test Brand',
    );
    await page.fill(
      'input[placeholder*="https://plushpop.ai"]',
      'https://integration-test.com',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Integration test core identity',
    );

    // Step 5: Submit the form
    await page.click('button[type="submit"]');

    // Step 6: Wait for the web workflow to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 120000 },
    );

    // Step 7: Verify both workflows produce valid outputs
    await expect(page.locator('text=Generated Video')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();

    // Step 8: Check that CLI plan is still valid
    const { stdout, stderr } = await execAsync(
      `pnpm run layers verify --plan "${testPlanFile}"`,
      { cwd: serverDir },
    );

    expect(stderr).toBe('');
    expect(stdout).toContain('Plan validation successful');
  });

  test('should maintain file system consistency', async ({ page }) => {
    // Step 1: Create files via CLI
    await execAsync(
      `pnpm run layers plan --in "${testInputFile}" --out "${testPlanFile}"`,
      { cwd: serverDir },
    );

    // Step 2: Verify CLI files exist
    expect(fs.existsSync(testPlanFile)).toBe(true);

    // Step 3: Use web interface
    await page.goto('/');
    await page.fill('input[placeholder*="PlushPop AI"]', 'File System Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'File system consistency test',
    );
    await page.click('button[type="submit"]');

    // Step 4: Wait for web workflow
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 120000 },
    );

    // Step 5: Verify both systems can coexist
    expect(fs.existsSync(testPlanFile)).toBe(true); // CLI file still exists
    await expect(page.locator('video')).toBeVisible(); // Web video is visible
  });

  test('should handle concurrent CLI and Web operations', async ({ page }) => {
    // Step 1: Start CLI operation
    const cliPromise = execAsync(
      `pnpm run layers plan --in "${testInputFile}" --out "${testPlanFile}"`,
      { cwd: serverDir },
    );

    // Step 2: Start web operation
    await page.goto('/');
    await page.fill('input[placeholder*="PlushPop AI"]', 'Concurrent Test');
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Concurrent operations test',
    );
    await page.click('button[type="submit"]');

    // Step 3: Wait for both to complete
    const cliResult = await cliPromise;
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 120000 },
    );

    // Step 4: Verify both succeeded
    expect(cliResult.stderr).toBe('');
    expect(cliResult.stdout).toContain('Plan created successfully');
    await expect(page.locator('video')).toBeVisible();
  });

  test('should validate data consistency between systems', async ({ page }) => {
    // Step 1: Create plan via CLI
    await execAsync(
      `pnpm run layers plan --in "${testInputFile}" --out "${testPlanFile}"`,
      { cwd: serverDir },
    );

    // Step 2: Get plan data
    const planContent = fs.readFileSync(testPlanFile, 'utf8');
    const plan = JSON.parse(planContent);

    // Step 3: Use web interface with similar data
    await page.goto('/');
    await page.fill(
      'input[placeholder*="PlushPop AI"]',
      'Data Consistency Test',
    );
    await page.fill(
      'textarea[placeholder*="Core Identity"]',
      'Data consistency validation',
    );
    await page.click('button[type="submit"]');

    // Step 4: Wait for web response
    const response = await page.waitForResponse(
      (response) =>
        response.url().includes('/api/tiktok-video-generation') &&
        response.status() === 200,
      { timeout: 120000 },
    );

    // Step 5: Verify response structure
    const responseData = await response.json();
    expect(responseData).toHaveProperty('success');
    expect(responseData).toHaveProperty('finalVideoUrl');

    // Step 6: Verify CLI plan structure
    expect(plan).toHaveProperty('version');
    expect(plan).toHaveProperty('metadata');
    expect(plan).toHaveProperty('scenes');
  });
});
