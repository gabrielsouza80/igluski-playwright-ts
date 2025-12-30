import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class SearchPage extends HelperBase {
  constructor(page: Page) { super(page) }

  // Header & Navigation
  readonly main: Locator = this.page.locator('.main.body-additional-bottom-margin');
  // Filters sidebar
  readonly filtersSidebar: Locator = this.main.getByText('Refine resort details', { exact: false });
  readonly searchResults: Locator = this.main.locator('a:has(h3)');
  readonly pagination: Locator = this.main.getByRole('navigation', { name: /Displaying 1 -/ }).or(this.main.getByText('Next', { exact: false }));
  readonly sortSelect: Locator = this.main.getByText('Sort by:', { exact: false }).locator('select');
  readonly resultsPerPageSelect: Locator = this.main.getByText('Results per page', { exact: false }).locator('select');
  readonly firstBookOnlineBtn: Locator = this.searchResults.locator('(//button[contains(@class,"book-online-btn")])[1]');
  readonly propertiesSearchInput = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly resortsSearchInput = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton = this.page.locator('button.search-item__cta , .search-bar__form-submit');


  // --------------------------
  // Page Actions
  // --------------------------

  async hasSearchResults(): Promise<boolean> {
    const locator = this.page.locator('.search-results');
    // Wait until at least 1 result can appear
    try {
      await locator.first().waitFor({ timeout: 5000 });
    } catch {
      // If no results appear in 5s, consider that there are no results
      return false;
    }

    const count = await locator.count();
    return count > 0;
  }

  async getResultsCount(): Promise<number> {
    return this.searchResults.count();
  }

  async clickFirstBookOnline(): Promise<void> {
    await this.firstBookOnlineBtn.click();
  }

    // ============================
  // SEARCH FUNCTIONS
  // ============================
  async searchForCountry(text: string) {
    try {
      await this.countriesSearchInput.fill(text, { timeout: 5000 });
      await this.page.waitForTimeout(500);
    } catch {
      console.warn('searchForCountry: fill failed, clicking search anyway');
    }

    try {
      await this.searchButton.click();
    } catch {
      console.error('searchForCountry: search button click failed');
    }
  }

  async searchForProperty(text: string) {
    await this.propertiesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(500);
    await this.propertiesSearchInput.press('Enter');
  }

  async clickOnSearchButton() {
    await this.searchButton.click();
  }

}
