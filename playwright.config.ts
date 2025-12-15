import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Set timeout */
  timeout: 90_000,


  // Número de tentativas em caso de falha
  retries: 1,

  // Configurações padrão para todos os testes
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

    // URL base para simplificar navegação
    baseURL: 'https://www.igluski.com/',

    // Timeouts adicionais
    actionTimeout: 10_000,       // tempo máximo para ações (click, fill, etc.)
    navigationTimeout: 30_000,   // tempo máximo para navegação
  },

  // Navegadores e dispositivos
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // Se quiser rodar também em Firefox ou Safari, basta descomentar:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Relatórios
  reporter: [
    ['html', { open: 'never' }]
  ],
});
