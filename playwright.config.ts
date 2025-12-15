import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Tempo máximo por teste
  timeout: 60_000,

  // Número de tentativas em caso de falha
  retries: 1,

  // Configurações padrão
  fullyParallel: true,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Screenshot e vídeo
    screenshot: 'on',
    video: 'retain-on-failure',

    // Trace para debugging
    trace: 'on-first-retry',

    // URL base
    baseURL: 'https://www.igluski.com/',

    // Timeouts específicos
    actionTimeout: 10_000,
    navigationTimeout: 90_000,
  },

  // Navegadores
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Relatórios
  reporter: [
    ['html', { open: 'never' }]
  ],
});
