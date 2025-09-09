import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');

  // Clean up any test artifacts
  console.log('🗑️ Cleaning up test artifacts...');

  // Add any cleanup logic here
  // - Remove test files
  // - Clean up databases
  // - Reset application state

  console.log('✅ E2E test global teardown completed');
}

export default globalTeardown;
