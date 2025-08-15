import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  
  // You can add database seeding here if needed
  // await seedTestDatabase();

  console.log('✅ Global setup completed');
}

export default globalSetup;