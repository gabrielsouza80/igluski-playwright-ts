import { Page, Locator } from '@playwright/test';

export class HomePage {
  constructor(page: Page){super(page)}

  // Header & Navigation
  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();
  readonly skiHolidaysLink: Locator = this.page.locator('(//a[@href="/ski-holidays"])[2]');
  readonly skiDestinationsLink: Locator = this.page.locator('a[href="/ski-resorts"]').first();
  readonly skiDealsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
  readonly skiChaletsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-chalet")])[5]');
  readonly aboutUsLink: Locator = this.page.locator('a[href="/about"]').first();

  // Cookies Modal
  readonly acceptCookiesButton: Locator = this.page.locator('button:has-text("Accept Cookies & Close")').first();
  readonly cookiesBanner: Locator = this.page.locator('//div[@aria-label="Cookie banner"]');

  // Search Components
  readonly propertiesSearchInput: Locator = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput: Locator = this.page.locator('input[aria-label*="Search countries"]');
  readonly resortsSearchInput: Locator = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton: Locator = this.page.locator('button:has-text("Search")').first();

  // Footer Links
  readonly footerFranceLink: Locator = this.page.locator('footer a[href*="/france"]').first();
  readonly footerSkiChaletsLink: Locator = this.page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();


  // --------------------------
  // Page Actions
  // --------------------------

  async navigate() {
    await this.page.goto('https://www.igluski.com/', { waitUntil: 'domcontentloaded' });
    
    // Aguarda um pouco para o modal de cookies aparecer
    await this.page.waitForTimeout(3000);
    
    // Fecha o modal de cookies
    await this.acceptCookies();
  }

  async acceptCookies() {
    try {
      // Tenta múltiplas formas de encontrar e clicar o botão
      const button = await this.page.locator('button:has-text("Accept Cookies & Close")').first();
      
      if (await button.isVisible({ timeout: 5000 })) {
        await button.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // Se não encontrou de uma forma, tenta de outras
      try {
        const altButton = await this.page.locator('button:has-text("Accept")').first();
        if (await altButton.isVisible({ timeout: 3000 })) {
          await altButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch (e2) {
        // Cookie banner pode não existir ou já foi fechado
        console.log('Cookie banner não encontrado ou já foi fechado');
      }
    }
  }

  async searchFor(text: string) {
    await this.resortsSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.resortsSearchInput.press('Enter');
  }

  // --------------------------
  // Assertions & Validations
  // --------------------------

  async verifyElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    try {
      await this.page.waitForURL(`**${expectedUrl}*`, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

  async getSearchResults(): Promise<string> {
    try {
      const resultsText = await this.page.locator('text=/results? found/i').first().textContent({ timeout: 5000 });
      return resultsText || '';
    } catch {
      return '';
    }
  }
}
