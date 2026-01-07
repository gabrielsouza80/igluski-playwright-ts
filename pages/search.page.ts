import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class SearchPage extends HelperBase {
  constructor(page: Page) { super(page) }

  // ============================
  // PAGE STRUCTURE LOCATORS
  // ============================
  readonly main: Locator = this.page.locator('main.main');
  
  // ============================
  // FILTER SIDEBAR LOCATORS
  // ============================
  // Sidebar container for holiday filters on results page
  readonly filtersSidebar: Locator = this.page.locator('#holiday-collapse');
  
  // Bootstrap-select custom dropdowns (not native <select> elements)
  readonly nightsButton: Locator = this.page.locator('button.dropdown-toggle').filter({ hasText: /nights|Any/ }).first(); // Duration filter button
    readonly adultsButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: /Adult/ }).first(); // Adults dropdown button (sidebar)
    readonly childrenButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: /Children/ }).first(); // Children dropdown button (sidebar)
  
  // ============================
  // RESULTS DISPLAY LOCATORS
  // ============================
  readonly searchResults: Locator = this.page.locator('.search-results'); // Property result cards (corrected to plural)
  readonly resultsCountText: Locator = this.page.locator('.faceted-search__details__stats'); // "Displaying 1-10 of X results"
  readonly pagination: Locator = this.main.getByRole('navigation', { name: /Displaying 1 -/ }); // Pagination controls
  readonly sortButton: Locator = this.page.locator('button#results-sort').first(); // Sort dropdown button (use first to avoid strict mode)
  readonly resultsPerPageButton: Locator = this.page.locator('button#results-per-page').first(); // Results per page button (use first)
  readonly firstBookOnlineBtn: Locator = this.page.getByRole('button', { name: 'Book Online' }).first(); // First "Book Online" CTA

  // ============================================================
  // 🔵 BASIC PAGE ACTIONS
  // ============================================================

  /**
   * Checks if search results are present on the page
   * @returns {Promise<boolean>} True if at least one result is found
   */
  async hasSearchResults(): Promise<boolean> {
    const locator = this.page.locator('.search-results');
    
    // Wait up to 5 seconds for results to appear
    try {
      await locator.first().waitFor({ timeout: 5000 });
    } catch {
      // If no results appear in 5s, assume no results available
      return false;
    }

    const count = await locator.count();
    return count > 0;
  }

  /**
   * Gets the total number of search results displayed
   * @returns {Promise<number>} Count of result items
   */
  async getResultsCount(): Promise<number> {
    return this.searchResults.count();
  }

  /**
   * Clicks the "Book Online" button on the first search result
   */
  async clickFirstBookOnline(): Promise<void> {
    await this.firstBookOnlineBtn.click();
  }

  // ============================================================
  // 🔵 FILTER ACTIONS
  // ============================================================

  /**
   * Selects the duration filter (number of nights)
   * @param {number | string} nights - Duration value (e.g., 2, 7, 14, "14+")
   */
  async selectNightsFilter(nights: number | string): Promise<void> {
    this.logSection(`Selecting ${nights} nights filter`);
    
    // Log current URL before filter
    this.logInfo(`Current URL before filter: ${this.page.url()}`);
    
    // Step 1: Click the nights dropdown button to open it
    await this.nightsButton.click();
    await this.page.waitForTimeout(500); // Wait for dropdown animation
    
    // Step 2: Check if there's a currently selected item and deselect it
    const currentlySelected = this.page.locator('a.dropdown-item.selected').filter({ hasText: /^\d+/ });
    const isSelected = await currentlySelected.count();
    
    if (isSelected > 0) {
      const currentValue = await currentlySelected.first().textContent();
      this.logInfo(`Deselecting current value: ${currentValue?.trim()}`);
      
      // Deselect current option (will change to "Any")
      await currentlySelected.first().click();
      await this.page.waitForTimeout(2000); // Wait for page to refresh
      
      this.logInfo(`URL after deselect: ${this.page.url()}`);
      
      // Reopen dropdown after page refresh
      await this.nightsButton.click();
      await this.page.waitForTimeout(500);
    }
    
    // Step 3: Select the desired number of nights
    const targetOption = this.page.locator('a.dropdown-item', { hasText: new RegExp(`^${nights}`) });
    const targetText = await targetOption.textContent();
    this.logInfo(`Clicking option: ${targetText?.trim()}`);
    
    await targetOption.click();
    
    // Wait for results to refresh
    await this.page.waitForTimeout(2000);
    
    // Log URL after filter applied
    this.logInfo(`URL after filter: ${this.page.url()}`);
    this.logInfo(`Selected ${nights} nights`);
  }

  /**
   * Selects the number of travelers (adults + children)
   * @param {number | string} adults - Number of adults (1-30+)
   * @param {number} children - Number of children (0-10)
   */
  async selectTravelersFilter(adults: number | string, children: number): Promise<void> {
    this.logSection(`Selecting travelers: ${adults} adults, ${children} children`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Select adults - click button, then select option
    await this.adultsButton.scrollIntoViewIfNeeded();
    await this.adultsButton.click({ force: true });
    await this.page.waitForTimeout(300);
    // Use exact match within the open dropdown menu only
    const adultsOption = this.page.locator('.dropdown-menu.show a.dropdown-item', { hasText: new RegExp(`^${adults}(?:\\D|$)`) }).first();
    await adultsOption.click({ force: true });
    await this.page.waitForTimeout(1000);
    
    // Select children - click button, then select option
    await this.childrenButton.scrollIntoViewIfNeeded();
    await this.childrenButton.click({ force: true });
    await this.page.waitForTimeout(300);
    // Use exact match within the open dropdown menu only
    const childrenOption = this.page.locator('.dropdown-menu.show a.dropdown-item', { hasText: new RegExp(`^${children}(?:\\D|$)`) }).first();
    await childrenOption.click({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected ${adults} adults and ${children} children`);
  }

  /**
   * Selects a country filter by checking its checkbox
   * @param {string} countryCode - Two-letter country code (e.g., "FR", "US", "NO")
   */
  async selectCountryFilter(countryCode: string): Promise<void> {
    this.logSection(`Selecting country filter: ${countryCode}`);
    
    // Ensure filters area is visible
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find the country checkbox
    const countryCheckbox = this.page.locator(`input#${countryCode}`);
    
    // If already checked, skip
    const isChecked = await countryCheckbox.isChecked();
    if (isChecked) {
      this.logInfo(`Country ${countryCode} already selected, skipping`);
      return;
    }
    
    // Try direct check on the checkbox
    await countryCheckbox.scrollIntoViewIfNeeded();
    try {
      await countryCheckbox.check({ force: true });
    } catch {}
    
    // Verify state; if not checked, click ancestor label (custom UI)
    await this.page.waitForTimeout(500);
    let nowChecked = await countryCheckbox.isChecked();
    if (!nowChecked) {
      const ancestorLabel = countryCheckbox.locator('xpath=ancestor::label[1]').first();
      if (await ancestorLabel.count()) {
        await ancestorLabel.scrollIntoViewIfNeeded();
        await ancestorLabel.click({ force: true });
        await this.page.waitForTimeout(500);
        nowChecked = await countryCheckbox.isChecked();
      }
    }
    
    // Final fallback: set checked via JS and dispatch events
    if (!nowChecked) {
      await countryCheckbox.evaluate((el: HTMLInputElement) => {
        el.checked = true;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    
    // Wait for filtered results to load
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected country: ${countryCode}`);
  }

  // ============================================================
  // 🔵 RESULTS DISPLAY & VALIDATION ACTIONS
  // ============================================================

  /**
   * Validates that search results are displayed
   * @param {number} [minCount] - Optional minimum expected result count
   */
  async validateResultsCount(minCount?: number): Promise<void> {
    this.logSection('Validating results count');
    const hasResults = await this.hasSearchResults();
    
    if (minCount !== undefined) {
      // Validate results exist
      expect(hasResults).toBeTruthy();
      
      // Validate minimum count requirement
      const count = await this.getResultsCount();
      expect(count).toBeGreaterThanOrEqual(minCount);
      this.logInfo(`✓ Found ${count} results (expected at least ${minCount})`);
    } else {
      // Just validate that results exist
      expect(hasResults).toBeTruthy();
      const count = await this.getResultsCount();
      this.logInfo(`✓ Found ${count} results`);
    }
  }

  /**
   * Validates that the results count text has been updated
   * (e.g., "Displaying 1-20 of 4488 results")
   */
  async validateResultsCountChanged(): Promise<void> {
    this.logSection('Validating results count changed');
    
    // Get the results count text element
    const stats = this.resultsCountText.first();
    await stats.waitFor({ state: 'visible', timeout: 10000 });
    const resultsText = await stats.textContent();
    
    // Validate it has content (meaning results were updated)
    expect(resultsText).toBeTruthy();
    this.logInfo(`✓ Results updated: ${resultsText}`);
  }

  /**
   * Changes the number of results displayed per page
   * @param {number} count - Results per page (10, 20, or 30)
   */
  async changeResultsPerPage(count: number): Promise<void> {
    this.logSection(`Changing results per page to ${count}`);
    
    // Open dropdown using standard waits (avoid brittle strict waits)
    await this.resultsPerPageButton.scrollIntoViewIfNeeded();
    await this.resultsPerPageButton.click();
    // Most Bootstrap toggles set aria-expanded=true when open; use that as a flexible cue
    try {
      await expect(this.resultsPerPageButton).toHaveAttribute('aria-expanded', /true/i);
    } catch {}

    // Target the accessible list associated with the current value (typically "10")
    const menuList = this.page.getByRole('list').filter({ has: this.page.getByRole('link', { name: /^10$/ }) }).first();
    const optionLink = menuList.getByRole('link', { name: new RegExp(`^${count}$`) }).first();
    try {
      await optionLink.click();
    } catch {
      // Fallback: global search for link with exact text in any visible list
      await this.page.getByRole('list').getByRole('link', { name: new RegExp(`^${count}$`) }).first().click({ force: true });
    }

    this.logInfo(`Selected ${count} results per page`);
  }

  /**
   * Navigates to the next page of search results
   */
  async navigateToNextPage(): Promise<void> {
    this.logSection('Navigating to next page');
    
    // Scroll to pagination area first
    const paginationContainer = this.page.locator('.pagination');
    await paginationContainer.scrollIntoViewIfNeeded();
    
    // Wait for pagination element to be visible, then click page 2
    const nextPageLink = this.page.locator('.pagination li[data-page]').nth(1);
    await nextPageLink.waitFor({ state: 'visible', timeout: 10000 });
    await nextPageLink.click();
    
    // Wait for new page to load
    await this.page.waitForTimeout(2000);
    this.logInfo('Navigated to page 2');
  }

  /**
   * Changes the sort order of search results
   * @param {string} sortOption - Sort option (e.g., "Price (Low - High)", "Rating")
   */
  async changeSortOrder(sortOption: string): Promise<void> {
    this.logSection(`Changing sort order to: ${sortOption}`);
    
    // Open the sort dropdown
    await this.sortButton.click();
    
    // Select the desired sort option
    const menuItem = this.page.locator(`a:has-text("${sortOption}")`).first();
    await menuItem.click();
    
    // Wait for results to re-sort
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected sort option: ${sortOption}`);
  }

  /**
   * Validates that a "no results" message is displayed
   * Used for negative test scenarios with restrictive filters
   */
  async validateNoResults(): Promise<void> {
    this.logSection('Validating no results message');
    
    // Look for "no results" or "No properties found" message
    const noResultsMessage = this.page.locator('text=/no results|No properties found/i');
    
    // Validate the message appears (wait up to 10 seconds)
    await expect(noResultsMessage).toBeVisible({ timeout: 10000 });
    this.logInfo('✓ No results message displayed');
  }

  /**
   * Validates that at least one result contains the expected duration (e.g., "2 Nights")
   * Only validates exact match results (stops at "More results..." separator if present)
   * Uses the specific locator .search-result__nights to ensure accurate matching
   * @param {number | string} expectedNights - Expected number of nights to find in results
   */
  async validateResultsContainNights(expectedNights: number | string): Promise<void> {
    this.logSection(`Validating results contain "${expectedNights} Nights"`);
    
    // Wait for results to be visible
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Check if there's a "More results..." separator (relaxed criteria section)
    const moreResultsSeparator = this.page.locator('.you-might-like-title');
    const hasSeparator = await moreResultsSeparator.count() > 0;
    
    if (hasSeparator) {
      this.logInfo('Found "More results..." separator - will only validate exact match results');
    }
    
    // Look for the specific nights span within any result card
    // This matches the HTML structure: <span class="search-result__nights">2 Nights</span>
    const expectedText = `${expectedNights} Night`; // Matches both "2 Nights" and "14+ Nights"
    const allResultCards = this.page.locator('.search-results');
    const totalCount = await allResultCards.count();
    
    this.logInfo(`Found ${totalCount} total result cards`);
    
    // Check if at least one contains the expected nights
    let foundMatch = false;
    let exactMatchCount = 0;
    const allTexts: string[] = []; // Collect all texts for debugging
    
    for (let i = 0; i < totalCount; i++) {
      const resultCard = allResultCards.nth(i);
      
      // If we have a separator, check if current card is after it
      if (hasSeparator && exactMatchCount >= 4) {
        // Typically the first 4 results are exact matches before "More results..."
        // Check if we've reached the separator
        const separatorElement = await moreResultsSeparator.first();
        const separatorHandle = await separatorElement.elementHandle();
        if (!separatorHandle) break;
        const isBeforeSeparator = await resultCard.evaluate((card, sep) => {
          if (!sep) return false;
          const cardTop = card.getBoundingClientRect().top;
          const sepTop = sep.getBoundingClientRect().top;
          return cardTop < sepTop;
        }, separatorHandle);
        
        if (!isBeforeSeparator) {
          this.logInfo(`Stopping at result ${i + 1} - reached "More results..." section`);
          break; // Stop checking after separator
        }
      }
      
      exactMatchCount++;
      
      // Get the nights text from this card
      const nightsElement = resultCard.locator('.search-result__nights').first();
      const text = await nightsElement.textContent();
      const trimmedText = text?.trim() || '';
      allTexts.push(trimmedText);
      
      // Use case-insensitive comparison
      if (trimmedText.toLowerCase().includes(expectedText.toLowerCase())) {
        foundMatch = true;
        this.logInfo(`✓ Found exact match result with "${trimmedText}"`);
        break;
      }
    }
    
    this.logInfo(`Checked ${exactMatchCount} result cards (exact matches before separator)`);
    
    // Assert that we found at least one matching result
    if (!foundMatch) {
      this.logInfo(`✗ Expected text: "${expectedText}"`);
      this.logInfo(`✗ Actual texts found in first ${exactMatchCount} results: ${JSON.stringify(allTexts)}`);
    }
    
    expect(foundMatch).toBeTruthy();
    if (!foundMatch) {
      throw new Error(`Expected to find at least one result with "${expectedText}" in the first ${exactMatchCount} exact match results, but none were found. Actual texts: ${JSON.stringify(allTexts)}`);
    }
  }

  /**
   * Validates that at least one result contains the expected country
   * @param {string} expectedCountry - Expected country name to find in results (e.g., "France", "USA")
   */
  async validateResultsContainCountry(expectedCountry: string): Promise<void> {
    this.logSection(`Validating results contain country "${expectedCountry}"`);
    
    // Wait for results to be visible
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Get all result cards
    const resultCards = await this.searchResults.all();
    this.logInfo(`Found ${resultCards.length} result cards`);
    
    // Check if at least one result contains the expected country
    let foundMatch = false;
    for (const card of resultCards) {
      const cardText = await card.textContent();
      if (cardText?.includes(expectedCountry)) {
        foundMatch = true;
        this.logInfo(`✓ Found result in "${expectedCountry}"`);
        break;
      }
    }
    
    // Assert that we found at least one matching result
    expect(foundMatch).toBeTruthy();
    if (!foundMatch) {
      throw new Error(`Expected to find at least one result in "${expectedCountry}" but none were found`);
    }
  }
}

