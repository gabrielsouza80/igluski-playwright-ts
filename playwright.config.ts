import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Set timeout */
  timeout: 60_000,


  // Number of attempts in case of failure.
  retries: 1,

  // Default Settings
  fullyParallel: true,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Screenshot e vídeo
    screenshot: 'on',
    video: 'retain-on-failure',

    // Trace for debugging
    trace: 'on-first-retry',

    // Base URL
    baseURL: 'https://www.igluski.com/',

    // Specific timeouts
    actionTimeout: 10_000,
    navigationTimeout: 90_000,
  },

  // Browsers
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Reports
  reporter: [
    ['html', { open: 'never' }]
  ],
});
