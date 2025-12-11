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

}
