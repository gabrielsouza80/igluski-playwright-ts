import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Header & Navigation
  readonly logoLink: Locator;
  readonly skiHolidaysLink: Locator;
  readonly skiDestinationsLink: Locator;
  readonly skiDealsLink: Locator;
  readonly skiChaletsLink: Locator;
  readonly aboutUsLink: Locator;

  // Cookies Modal
  readonly acceptCookiesButton: Locator;
  readonly cookiesBanner: Locator;

  // Search Components
  readonly propertiesSearchInput: Locator;
  readonly countriesSearchInput: Locator;
  readonly resortsSearchInput: Locator;
  readonly searchButton: Locator;

  // Footer Links
  readonly footerFranceLink: Locator;
  readonly footerSkiChaletsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header & Navigation
    this.logoLink = page.locator('a[href="/"]').filter({ has: page.locator('img[alt*="Iglu Ski"]') }).first();
    this.skiHolidaysLink = page.locator('(//a[@href="/ski-holidays"])[2]');
    this.skiDestinationsLink = page.locator('a[href="/ski-resorts"]').first();
    this.skiDealsLink = page.locator('(//a[contains(@href, "/ski-deals")])[2]');
    this.skiChaletsLink = page.locator('(//a[contains(@href, "/ski-chalet")])[5]');
    this.aboutUsLink = page.locator('a[href="/about"]').first();

    // Cookies Modal - Múltiplas estratégias para encontrar o botão
    this.cookiesBanner = page.locator('//div[@aria-label="Cookie banner"]');
    this.acceptCookiesButton = page.locator('//button[text()="Accept Cookies & Close"]');

    // Search
    this.propertiesSearchInput = page.locator('input[aria-label*="Search properties"]');
    this.countriesSearchInput = page.locator('input[aria-label*="Search countries"]');
    this.resortsSearchInput = page.locator('input[aria-label*="Search resorts"]');
    this.searchButton = page.locator('button:has-text("Search")').first();

    // Footer
    this.footerFranceLink = page.locator('footer a[href*="/france"]').first();
    this.footerSkiChaletsLink = page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();
  }

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
