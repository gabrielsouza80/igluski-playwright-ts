import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Tempo máximo por teste */
  timeout: 30_000,

  /* Número de tentativas */
  retries: 0,

  /* Configurações padrão para todos os testes */
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    /* Screenshot e vídeo apenas quando necessário */
    screenshot: 'on',
    video: 'retain-on-failure',

    /* Habilita trace para facilitar debugging no UI Mode */
    trace: 'on-first-retry',

    /* URL base para seus testes */
    baseURL: 'https://www.igluski.com/',
  },

  /* Navegadores e dispositivos */
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  //   {
  //     name: 'firefox',
  //     use: { ...devices['Desktop Firefox'] },
  //   },
  // ],

  /* Opcional: caminho dos relatórios */
  reporter: [
    ['html', { open: 'never' }]
  ],
});
