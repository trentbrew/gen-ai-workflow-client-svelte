import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  // Check if servers are running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check frontend server
    console.log('🔍 Checking frontend server...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    console.log('✅ Frontend server is running');

    // Check backend server
    console.log('🔍 Checking backend server...');
    const response = await page.request.get('http://localhost:5050/health', {
      timeout: 10000,
    });
    if (response.ok()) {
      console.log('✅ Backend server is running');
    } else {
      console.log('⚠️ Backend server health check failed, but continuing...');
    }
  } catch (error) {
    console.error('❌ Server check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ E2E test global setup completed');
}

export default globalSetup;
