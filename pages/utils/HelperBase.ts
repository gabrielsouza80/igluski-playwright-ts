import { Page } from '@playwright/test';

export class HelperBase {
    protected readonly page: Page;

  constructor(protected page: Page) {
    this.page = page;
  }

  /**
   * Faz scroll para baixo na página
   * @param pixels - Número de pixels para scrollar (padrão: 500)
   */
  async scrollDown(pixels: number = 500): Promise<void> {
    await this.page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, pixels);
  }

  /**
   * Faz scroll até o final da página
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Faz scroll até o topo da página
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }
}