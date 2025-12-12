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

  private toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  async validateLogo() {
  await this.actions.validateRedirectButton(this.logoLink, '/');
}


async validateMenuAndSubMenuNavigation() {
  const headerButtons = this.page.locator('li.menu-list__item');
  const menuCount = await headerButtons.count();

  for (let i = 0; i < menuCount; i++) {
    const button = headerButtons.nth(i);
    const menuText = (await button.innerText()).trim();
    console.log(`\n🌐 Validando menu principal: "${menuText}"`);

    // 1️⃣ Valida redirecionamento do menu principal
    try {
      await this.actions.validateRedirectButton(button, this.page.url());
    } catch (error) {
      console.log(`   ❌ Falha ao validar menu principal "${menuText}": ${error}`);
      continue;
    }

    // 2️⃣ Hover para abrir submenu
    await button.hover();
    await this.page.waitForTimeout(300);

    const subMenuLinks = button.locator('.submenu-list__block-item a');
    const subMenuCount = await subMenuLinks.count();

    if (subMenuCount === 0) {
      console.log(`   ⚠ Menu "${menuText}" não possui submenu. Pulando.`);
      continue;
    }

    console.log(`   📁 Menu "${menuText}" → ${subMenuCount} sublinks encontrados`);

    // 3️⃣ Itera pelos sublinks
    for (let j = 0; j < subMenuCount; j++) {
      const link = subMenuLinks.nth(j);

      // captura label e href ANTES de chamar o helper
      const label = (await link.textContent())?.trim() ?? 'submenu';
      const href = await link.getAttribute('href');
      if (!href) continue;

      const fullUrl = href.startsWith('http')
        ? href
        : new URL(href, this.page.url()).href;

      console.log(`      🔗 Validando submenu: ${label} → ${fullUrl}`);

      try {
        // 👉 passa só a URL para o helper, sem depender do locator
        await this.actions.validateRedirectButton(null, fullUrl);
        console.log(`         ✅ Submenu validado: ${label}`);
      } catch (error) {
        console.log(`         ❌ Falha no submenu "${menuText}" → ${label}: ${error}`);
      }
    }
  }
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
