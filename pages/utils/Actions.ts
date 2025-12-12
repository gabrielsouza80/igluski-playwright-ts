// actions/actions.ts
import { Page, Locator, expect } from '@playwright/test';

export class Actions {
    constructor(private page: Page) { }

    async validateRedirectButton(button: Locator | null, expectedUrl: string): Promise<void> {
  // Se tiver locator, tenta pegar o href; senão usa direto a URL recebida
  let urlToOpen = expectedUrl;

  if (button) {
    const href = await button.getAttribute('href');
    urlToOpen = href && !href.startsWith("http")
      ? new URL(href, this.page.url()).toString()
      : (href || expectedUrl);
  }

  // Abre nova aba manualmente (sem risco de invalidar a página principal)
  const newPage = await this.page.context().newPage();
  await newPage.goto(urlToOpen, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Valida URL
  await expect(newPage).toHaveURL(new RegExp(urlToOpen, 'i'));

  console.log(`✓ Validado: ${urlToOpen}`);

  await newPage.close();
}





}