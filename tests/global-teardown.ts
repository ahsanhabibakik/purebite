import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  // Clean up test data if needed
  // await cleanupTestDatabase();

  console.log('✅ Global teardown completed');
}

export default globalTeardown;