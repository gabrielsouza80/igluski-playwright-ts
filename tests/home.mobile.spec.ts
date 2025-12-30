import { test } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page Mobile
// ================================================================

test.describe('Home Page Mobile', () => {

  // BEFORE EACH
  test.beforeEach(async ({ pm }) => {
    await test.step('✓ Navigate to the homepage and handle cookie banner', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
    });
  });

});