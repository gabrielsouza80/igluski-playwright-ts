import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';

export class HomePage extends HelperBase {
  private actions: Actions;

  constructor(page: Page) {
    super(page);
    this.actions = new Actions(page);
  }

  // Header & Navigation
  readonly logoLink: Locator = this.page.locator('a[title="Iglu Ski logo"]')
  readonly skiHolidaysLink: Locator = this.page.locator('(//a[@href="/ski-holidays"])[2]');
  readonly skiDestinationsLink: Locator = this.page.locator('a[href="/ski-resorts"]').first();
  readonly skiDealsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
  readonly snowReportsLink: Locator = this.page.locator('(//a[@href="/snow-reports"])[1]');
  readonly skiblogguidesLink: Locator = this.page.locator('(//a[@href="/blog"])[1]');
  readonly enquireLink: Locator = this.page.locator('(//a[contains(@href, "/enquire")])[1]');
  readonly contactusLink: Locator = this.page.locator('(//a[@href="/contact-us"])[1]');

  readonly skiChaletsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-chalet")])[4]');
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

  async validateLogo() {
    await this.actions.validateRedirectButton(this.logoLink, '/' /*URL esperada ao clicar no logo*/);
  }

  async validateMenuNavigation() {
    await this.actions.validateRedirectButton(this.skiHolidaysLink, '/ski-holidays' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.skiDestinationsLink, '/ski-resorts' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.skiDealsLink, '/ski-deals' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.snowReportsLink, '/snow-reports' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.skiblogguidesLink, '/blog' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.enquireLink, '/enquire' /*URL esperada ao clicar no link*/);
    await this.actions.validateRedirectButton(this.contactusLink, '/contact-us' /*URL esperada ao clicar no link*/);
  }

  async validateSubMenuNavigation() {
    await this.skiHolidaysLink.hover();
    await this.actions.validateRedirectButton(this.skiHolidaysLink, '/ski-holidays' /*URL esperada ao clicar no link*/);
   
  }

  async navigate() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });

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
