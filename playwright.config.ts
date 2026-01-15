import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Set timeout */
  timeout: 90_000,


  // Number of attempts in case of failure.
  retries: 1,

  // Default Settings
  fullyParallel: true,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'off',

    // Trace for debugging
    trace: 'on-first-retry',

    // Base URL
    baseURL: 'https://www.igluski.com/',

    // Specific timeouts
    actionTimeout: 90_000,
    navigationTimeout: 90_000,
  },

  // Browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chromium'] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 812 },
      },
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 812 },
      },
      testMatch: /.*\.mobile\.spec\.ts$/,
    },
  ],

  // Reports
  reporter: [
    ['list'],
    ['allure-playwright'],
    ['junit', { outputFile: 'results.xml' }],
    ['html', { outputFolder: 'my-report', open: 'never' }]
  ],

  outputDir: 'test-results/',
});
