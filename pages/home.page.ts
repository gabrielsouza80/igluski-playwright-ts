import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Header & Navigation
  readonly logoLink: Locator;
  readonly buyLink: Locator;
  readonly rentLink: Locator;
  readonly newDevelopmentsLink: Locator;
  readonly relocationLink: Locator;
  readonly commercialLink: Locator;
  readonly aboutUsLink: Locator;
  readonly servicesLink: Locator;

  // Promo Message
  readonly promoCloseButton: Locator;
  readonly promoMessage: Locator;

  // Search Components
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resultsCountLabel: Locator;

  // Footer Links
  readonly footerFranceLink: Locator;
  readonly skiChaletsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header & Navigation
    this.logoLink = page.locator('a[href="/"]').first();
    this.buyLink = page.locator('a[href="/en/buy"]').first();
    this.rentLink = page.locator('a[href="/en/rent"]').first();
    this.newDevelopmentsLink = page.locator('a[href="/en/new-developments"]').first();
    this.relocationLink = page.locator('a[href="/en/expertise/relocation-service"]').first();
    this.commercialLink = page.locator('a[href="/en/commercial"]').first();
    this.aboutUsLink = page.locator('a[href="/en/about-us"]').first();
    this.servicesLink = page.locator('a[href="/en/expertise"]').first();

    // Promo Message
    this.promoMessage = page.locator('.promo-message');
    this.promoCloseButton = page.locator('.promo-message button.close');

    // Search
    this.searchInput = page.locator('#homepage-search-input');
    this.searchButton = page.locator('#homepage-search-button');
    this.resultsCountLabel = page.locator('text=properties found');

    // Footer
    this.footerFranceLink = page.locator('//a[title()="France"]');
    this.skiChaletsLink = page.locator('//a[contains(text(),"Ski chalets")]');
  }

  // --------------------------
  // Page Actions
  // --------------------------

  async navigate() {
    await this.page.goto('/');
  }

  async closePromoIfVisible() {
    if (await this.promoMessage.isVisible().catch(() => false)) {
      await this.promoCloseButton.click();
    }
  }

  async searchFor(text: string) {
    await this.searchInput.fill(text);
    await this.searchButton.click();
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
      await this.page.waitForURL(expectedUrl, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

  async getSearchResults(): Promise<string> {
    try {
      const resultText = await this.resultsCountLabel.textContent({ timeout: 5000 });
      return resultText || '';
    } catch {
      return '';
    }
  }
}
