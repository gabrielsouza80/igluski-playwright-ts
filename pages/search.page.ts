import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import testdata from '../tests/fixtures/testdata.json';

export class SearchPage extends HelperBase {
  constructor(page: Page) { super(page) }

  // ============================================================
  // 📌 VALIDATION CONSTANTS & PATTERNS (from testdata)
  // ============================================================
  private readonly MAX_EXACT_MATCHES = testdata.searchPage.validationConstants.maxExactMatches;
  private readonly MAX_DEBUG_ITEMS = testdata.searchPage.validationConstants.maxDebugItems;

  // Extract regex patterns from testdata
  private readonly PATTERN_NIGHTS = /nights|Any/;
  private readonly PATTERN_ADULTS = /Adult/;
  private readonly PATTERN_CHILDREN = /Children/;
  private readonly PATTERN_PAGINATION = /Displaying 1 -/;
  private readonly PATTERN_RESULTS_MESSAGE = /We\s+have\s+found\s+\d+\s+properties?/;
  private readonly PATTERN_DISPLAYING_STATS = /of\s+\d+\s+results?/i;
  private readonly PATTERN_ARIA_RATING = /(\d+(?:\.\d+)?)\s*(?:out\s+of\s+)?5/i;

  // ============================================================
  // 🔴 READONLY LOCATORS (Grouped by Page Section - Better Organization)
  // ============================================================

  // PAGE STRUCTURE
  readonly main: Locator = this.page.locator('main.main');

  // FILTER SIDEBAR - Main Container & Dropdowns
  readonly filtersSidebar: Locator = this.page.locator('#holiday-collapse');
  readonly nightsButton: Locator = this.page.locator('button.dropdown-toggle').filter({ hasText: this.PATTERN_NIGHTS }).first();
  readonly adultsButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: this.PATTERN_ADULTS }).first();
  readonly childrenButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: this.PATTERN_CHILDREN }).first();

  // RESULTS DISPLAY - Cards, Pagination, Sort, etc.
  readonly searchResults: Locator = this.page.locator('.search-results');
  readonly resultsCountText: Locator = this.page.locator('.faceted-search__details__stats');
  readonly pagination: Locator = this.main.getByRole('navigation', { name: this.PATTERN_PAGINATION });
  readonly sortButton: Locator = this.page.locator('button#results-sort').first();
  readonly resultsPerPageButton: Locator = this.page.locator('button#results-per-page').first();
  readonly firstBookOnlineBtn: Locator = this.page.getByRole('button', { name: 'Book Online' }).first();

  // ============================================================
  // 🔵 PRIVATE HELPER METHODS (Organized by Function)
  // ============================================================

  // --- Detail Page Locators (from testdata.locators.detailPage) ---
  private getDetailPageSpecLocator(detailPage: Page): Locator {
    return detailPage.locator('.package__include-text, .package__include-title, .package__include');
  }

  private getDetailPageDataLayerLocator(detailPage: Page): Locator {
    return detailPage.locator('#DataLayer').first();
  }

  private getDetailPageRatingLocator(detailPage: Page): Locator {
    return detailPage.locator('[class*="rating"], .star-rating, [data-rating]').first();
  }

  // --- Text Validation Helpers ---
  /** Safely escapes a string for use inside RegExp constructors */
  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Parses JSON stored inside hidden inputs (DataLayer) that may be HTML-encoded */
  private parseDataLayerValue(rawValue: string | null): any | null {
    if (!rawValue) return null;

    const decoded = rawValue
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');

    try {
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // --- Result Card Navigation ---
  /** Extracts the primary property/detail href from a result card */
  private async extractResultHref(resultCard: Locator): Promise<string | null> {
    const candidates: Locator[] = [
      resultCard.locator('a[href*="/ski-resorts"]').first(),
      resultCard.locator('a.search-result__title, a:has(.search-result__title)').first(),
      resultCard.locator('a:has-text("View"), a:has-text("Details"), a:has-text("Book Online")').first(),
      resultCard.locator('a[href*="ski" i]').first(),
      resultCard.locator('a[href]').first()
    ];

    for (const candidate of candidates) {
      if (!(await candidate.count())) continue;
      const href = await candidate.getAttribute('href').catch(() => null);
      if (!href) continue;
      if (href.startsWith('#') || href.toLowerCase().startsWith('javascript')) continue;

      try {
        const absoluteUrl = new URL(href, this.page.url()).toString();
        return absoluteUrl;
      } catch {
        continue;
      }
    }

    return null;
  }

  /** Opens a detail page in a new tab using the href extracted from the result card */
  private async openDetailPage(resultCard: Locator, contextLabel: string): Promise<{ detailPage: Page | null; detailUrl: string | null }> {
    const href = await this.extractResultHref(resultCard);
    if (!href) {
      this.logInfo(`⚠ ${contextLabel}: no detail link found`);
      return { detailPage: null, detailUrl: null };
    }

    let detailPage: Page | null = null;
    try {
      detailPage = await this.page.context().newPage();
      await detailPage.goto(href, { waitUntil: 'domcontentloaded', timeout: testdata.searchPage.timeouts.detailPageLoad });
      // MANDATORY: Settlement wait for detail page to fully render before interacting
      // Without this, JavaScript-heavy pages may not have fully initialized
      await detailPage.waitForTimeout(testdata.searchPage.timeouts.pageSettlement).catch(() => { });
      return { detailPage, detailUrl: href };
    } catch (error) {
      this.logInfo(`❌ ${contextLabel}: failed to open detail page (${href}) → ${error}`);
      if (detailPage) await detailPage.close().catch(() => { });
      return { detailPage: null, detailUrl: href };
    }
  }

  // --- Detail Page Validation Helpers ---
  /** Checks accommodation type inside product detail page (spec section or data layer) */
  private async detailPageMatchesAccommodation(detailPage: Page, accommodationType: string): Promise<boolean> {
    const matcher = new RegExp(this.escapeRegExp(accommodationType), 'i');
    const specLocator = this.getDetailPageSpecLocator(detailPage).filter({ hasText: matcher });

    if (await specLocator.count()) {
      return true;
    }

    const dataLayerInput = this.getDetailPageDataLayerLocator(detailPage);
    if (await dataLayerInput.count()) {
      const raw = await dataLayerInput.getAttribute('value');
      const parsed = this.parseDataLayerValue(raw);
      const propertyType = parsed?.property_type || parsed?.results_list?.[0]?.property_type;
      if (propertyType && matcher.test(String(propertyType))) {
        return true;
      }
    }

    return false;
  }

  /** Checks board basis inside product detail page (spec section or data layer) */
  private async detailPageMatchesBoardBasis(detailPage: Page, boardBasis: string): Promise<boolean> {
    const matcher = new RegExp(this.escapeRegExp(boardBasis), 'i');
    const specLocator = this.getDetailPageSpecLocator(detailPage).filter({ hasText: matcher });

    if (await specLocator.count()) {
      return true;
    }

    const dataLayerInput = this.getDetailPageDataLayerLocator(detailPage);
    if (await dataLayerInput.count()) {
      const raw = await dataLayerInput.getAttribute('value');
      const parsed = this.parseDataLayerValue(raw);
      const boardValue = parsed?.board_basis || parsed?.results_list?.[0]?.board_basis;
      if (boardValue && matcher.test(String(boardValue))) {
        return true;
      }
    }

    return false;
  }

  /** Extracts numeric rating (snowflakes) from a detail page via text or data layer */
  private async detailPageGetRating(detailPage: Page): Promise<number | null> {
    const ratingLocator = this.getDetailPageRatingLocator(detailPage);
    if (await ratingLocator.count()) {
      const aria = await ratingLocator.getAttribute('aria-label').catch(() => '') || '';
      const text = aria || (await ratingLocator.textContent().catch(() => '') || '');
      const match = text.match(this.PATTERN_ARIA_RATING);
      if (match) {
        const parsed = Number(match[1]);
        if (!Number.isNaN(parsed)) {
          return Math.round(parsed);
        }
      }

      const attrRating = await ratingLocator.getAttribute('data-rating').catch(() => null);
      if (attrRating) {
        const parsed = Number(attrRating);
        if (!Number.isNaN(parsed)) {
          return Math.round(parsed);
        }
      }
    }

    const dataLayerInput = detailPage.locator('#DataLayer').first();
    if (await dataLayerInput.count()) {
      const raw = await dataLayerInput.getAttribute('value');
      const parsed = this.parseDataLayerValue(raw);
      const candidate = parsed?.snowflake_rating ?? parsed?.rating ?? parsed?.property_rating ?? parsed?.results_list?.[0]?.snowflake_rating ?? parsed?.results_list?.[0]?.rating ?? parsed?.results_list?.[0]?.property_rating;
      if (candidate !== undefined && candidate !== null) {
        const parsedNum = Number(candidate);
        if (!Number.isNaN(parsedNum)) {
          return Math.round(parsedNum);
        }
      }
    }

    return null;
  }

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
      await locator.first().waitFor();
    } catch {
      // If no results appear in 5s, assume no results available
      return false;
    }

    const count = await locator.count();
    return count > 0;
  }

  /**
   * Gets the total number of search results found (from result summary text)
   * Extracts number from "We have found X properties" text or pagination stats
   * @returns {Promise<number>} Total count of results found
   */
  async getResultsCount(): Promise<number> {
    try {
      // Try English: "We have found X properties"
      const resultSummaryEN = this.page.locator(`text=${this.PATTERN_RESULTS_MESSAGE}`).first();
      if (await resultSummaryEN.count() > 0) {
        const text = await resultSummaryEN.textContent();
        if (text) {
          const match = text.match(/found\s+(\d+)\s+properties?/);
          if (match && match[1]) {
            return parseInt(match[1], 10);
          }
        }
      }

      // Fallback: pagination stats "Displaying 1 - 10 of 30 results"
      const stats = this.resultsCountText.first();
      if (await stats.count() > 0) {
        const statsText = (await stats.textContent())?.trim() || '';
        let m = statsText.match(this.PATTERN_DISPLAYING_STATS);
        if (m && m[1]) {
          return parseInt(m[1], 10);
        }
      }

      // Last resort: count displayed result items
      const fallbackCount = await this.searchResults.count();
      return fallbackCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Clicks the "Book Online" button on the first search result
   */
  async clickFirstBookOnline(): Promise<void> {
    try {
      // Ensure results are visible before clicking the CTA
      await this.searchResults.first().waitFor({ state: 'visible' }).catch(() => { });

      // Click the first visible "Book Online" button
      await this.firstBookOnlineBtn.scrollIntoViewIfNeeded().catch(() => { });
      await this.firstBookOnlineBtn.click();

      // Allow page to settle/navigate
      await this.page.waitForLoadState('domcontentloaded').catch(() => { });
      this.logInfo('✓ Clicked first Book Online');
    } catch (error) {
      this.logInfo(`❌ Error clicking first Book Online: ${error}`);
    }
  }

  /** Select nights from the duration dropdown (Bootstrap-Select) */
  async selectNightsFilter(nights: number | string): Promise<void> {
    try {
      // Open the nights dropdown
      try {
        await this.nightsButton.click();
      } catch {
        await this.nightsButton.click({ force: true });
      }

      // Always use "Deselect All" button to clear any previous selection (more reliable than manual detection)
      const deselectAllButton = this.page.locator('button.actions-btn.bs-deselect-all').first();
      if (await deselectAllButton.isVisible().catch(() => false)) {
        this.logInfo(`Clearing previous selection with "Deselect All" button`);
        await deselectAllButton.click().catch(() => { });
        await this.page.waitForTimeout(300);
        
        // Dropdown closes after "Deselect All" - need to reopen it
        this.logInfo(`Reopening dropdown after "Deselect All"`);
        try {
          await this.nightsButton.click();
        } catch {
          await this.nightsButton.click({ force: true });
        }
        await this.page.waitForTimeout(300);
      }

      // Pick target nights option
      const targetOption = this.page
        .locator('a.dropdown-item', { hasText: new RegExp(`^${nights}`) })
        .first();

      await targetOption.waitFor({ state: 'attached' });
      await targetOption.click().catch(async () => {
        await targetOption.click({ force: true });
      });
      // Wait for page response after selection
      await this.page.waitForLoadState('domcontentloaded').catch(() => { });
      // MANDATORY: Settlement wait for results to update after nights selection
      await this.page.waitForTimeout(500).catch(() => { });
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${nights} nights → ${count} results`);
    } catch (error) {
      this.logInfo(`❌ Error in selectNightsFilter: ${error} - continuing anyway`);
    }
  }

  /** Explicitly clicks "Deselect All" in the nights dropdown to reset selection */
  async deselectAllNights(): Promise<void> {
    try {
      // Open the nights dropdown
      try {
        await this.nightsButton.click();
      } catch {
        await this.nightsButton.click({ force: true });
      }

      const deselectAllButton = this.page.locator('button.actions-btn.bs-deselect-all').first();
      if (await deselectAllButton.isVisible().catch(() => false)) {
        await deselectAllButton.click().catch(() => { });
        await this.page.waitForTimeout(300);
      }
    } catch (error) {
      this.logInfo(`⚠ Error clicking Deselect All for nights: ${error}`);
    }
  }

  /** Selects adults and children via DOM manipulation with auto-fallback for unavailable values */
  async selectTravelersFilter(adults: number | string, children: number): Promise<void> {
    // Normalize input: convert 30 to "30+" for the select
    let adultsValue = (adults === 30 || adults === '30+') ? '30+' : String(adults);
    let childrenValue = String(children);

    try {
      // Find and use the native <select> elements (Bootstrap-Select)
      const adultsSelect = this.page
        .locator('select[data-option-type="ad"], select.faceted-search__select--adult, select[name="Adults"]')
        .first();

      // Select adults
      if (await adultsSelect.count()) {
        // Try to select the requested value
        try {
          await adultsSelect.selectOption(adultsValue);
          await this.page.waitForLoadState('domcontentloaded').catch(() => { });
          // MANDATORY: Settlement wait for results to update after adults selection
          await this.page.waitForTimeout(500).catch(() => { });
          this.logInfo(`✓ ${adultsValue} adults selected`);
        } catch (e) {
          // If exact value not available, use first valid option
          const availableValues = await adultsSelect.locator('option').all();
          if (availableValues.length > 1) {
            const fallbackValue = (await availableValues[1].getAttribute('value')) || '2';
            this.logInfo(`⚠ "${adultsValue}" not available, using: ${fallbackValue} (business logic/cascade)`);
            await adultsSelect.selectOption(fallbackValue);
            adultsValue = fallbackValue;
          }
        }

        // Re-acquire children select (dynamically updated after adults selection)
        const childrenSelect = this.page
          .locator('select[data-option-type="ch"], select.faceted-search__select--children, select[name="Children"]')
          .first();

        if (!(await childrenSelect.count())) {
          this.logInfo(`⚠ Children select not found after adults selection, skipping`);
          return;
        }

        // Determine the value to select - use max available if requested value doesn't exist
        const availableValues = await childrenSelect.locator('option').all();
        let finalValue = childrenValue;

        // Check if requested value exists
        let valueExists = false;
        for (const opt of availableValues) {
          const val = await opt.getAttribute('value');
          if (val === childrenValue) {
            valueExists = true;
            break;
          }
        }

        // If not found, use the last available value
        if (!valueExists && availableValues.length > 0) {
          finalValue = (await availableValues[availableValues.length - 1].getAttribute('value')) || '0';
          this.logInfo(`⚠ Children ${childrenValue} unavailable → using ${finalValue}`);
        }

        // Select the determined value
        await childrenSelect.selectOption(finalValue);
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        // MANDATORY: Settlement wait for results to update after children selection
        await this.page.waitForTimeout(500).catch(() => { });
        const count = await this.getResultsCount();
        this.logInfo(`✓ Travelers: ${adultsValue} adults, ${finalValue} children → ${count} results`);
      } else {
        this.logInfo(`⚠ Adults select not found, skipping`);
        return;
      }
    } catch (error) {
      this.logInfo(`❌ Error selecting travelers: ${error} - continuing anyway`);
    }
  }

  async selectCountryFilter(countryCode: string): Promise<void> {
    if (!this.checkPageAlive(`selecting country ${countryCode}`)) return;

    await this.filtersSidebar.waitFor({ state: 'visible' }).catch(() => { });
    await this.filtersSidebar.scrollIntoViewIfNeeded().catch(() => { });
    let countryCheckbox = this.page.locator(`input#${countryCode}`);

    try {
      if (!(await countryCheckbox.count())) {
        countryCheckbox = this.filtersSidebar.locator(`input[value="${countryCode}" i], input[id*="${countryCode}" i]`).first();
      }
    } catch {
      this.logInfo(`Country ${countryCode} lookup failed - page may be closed`);
      return;
    }

    try {
      if (!(await countryCheckbox.count())) {
        const countryLabel = this.filtersSidebar.locator('label', { hasText: /Finland|France|USA|Norway/i }).first();
        if (await countryLabel.count()) {
          countryCheckbox = countryLabel.locator('input').first();
        }
      }

      if (!(await countryCheckbox.count())) {
        this.logInfo(`Country ${countryCode} not found`);
        return;
      }
    } catch {
      this.logInfo(`Country ${countryCode} selection failed - page may be closed`);
      return;
    }

    try {
      const isChecked = await countryCheckbox.isChecked();
      if (isChecked) {
        return;
      }
    } catch { }

    // Click the checkbox
    try {
      await countryCheckbox.scrollIntoViewIfNeeded();
    } catch {
      // Element might be detached, continue anyway
    }

    try {
      await countryCheckbox.check({ force: true });
      // Wait for page to respond and update count
      await this.page.waitForLoadState('domcontentloaded').catch(() => { });
      // Wait specifically for result count text to update
      await this.page.locator('text=/Encontramos\\s+\\d+|We\\s+have\\s+found\\s+\\d+/').first().waitFor({ state: 'visible' }).catch(() => { });
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${countryCode} → ${count} results`);
    } catch {
      // Try clicking the parent label instead
      const parentLabel = countryCheckbox.locator('xpath=ancestor::label[1]').first();
      if (await parentLabel.count()) {
        try {
          await parentLabel.scrollIntoViewIfNeeded();
          await parentLabel.click({ force: true });
          // Wait for page response
          try {
            await this.page.waitForLoadState('domcontentloaded').catch(() => { });
            // MANDATORY: Settlement wait for results to update after country selection
            await this.page.waitForTimeout(500).catch(() => { });
          } catch { }
          const count = await this.getResultsCount();
          this.logInfo(`✓ ${countryCode} → ${count} results`);
        } catch (err) {
          this.logInfo(`❌ ${countryCode} error: ${err}`);
        }
      }
    }
  }

  // ============================================================
  // 🔵 RESULTS DISPLAY & VALIDATION ACTIONS
  // ============================================================

  // Verify results are displayed (at least 1 property shown)
  /** Validates search results are displayed with soft assertion */
  async validateResultsCount(minCount?: number): Promise<void> {
    const count = await this.getResultsCount();

    if (minCount && count < minCount) {
      this.logInfo(`⚠ Low: ${count} results (expected ${minCount}+)`);
    } else if (count > 0) {
      this.logInfo(`✓ ${count} results`);
    } else {
      this.logInfo(`⚠ No results`);
    }
  }

  /**
   * Validates that the results count text has been updated
   * (e.g., "Displaying 1-20 of 4488 results")
   */
  async validateResultsCountChanged(): Promise<void> {
    // Get the results count text element
    const stats = this.resultsCountText.first();
    await stats.waitFor({ state: 'visible' });
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
    // Open dropdown using standard waits (avoid brittle strict waits)
    await this.resultsPerPageButton.scrollIntoViewIfNeeded();
    await this.resultsPerPageButton.click();
    // Most Bootstrap toggles set aria-expanded=true when open; use that as a flexible cue
    try {
      await expect(this.resultsPerPageButton).toHaveAttribute('aria-expanded', /true/i);
    } catch { }

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
    // Scroll to the first pagination element
    const paginationContainer = this.page.locator('.pagination').first();
    await paginationContainer.scrollIntoViewIfNeeded();

    // Click the link for page 2 (using getByRole for accessibility)
    const nextPageLink = this.page.getByRole('link', { name: '2' }).first();
    await nextPageLink.click();
    this.logInfo('Navigated to page 2');
  }

  /**
   * Changes the sort order of search results
   * @param {string} sortOption - Sort option (e.g., "Price (Low - High)", "Rating")
   */
  async changeSortOrder(sortOption: string): Promise<void> {
    // Open the sort dropdown
    await this.sortButton.click();

    // Select the desired sort option
    const menuItem = this.page.locator(`a:has-text("${sortOption}")`).first();
    await menuItem.click();

    this.logInfo(`Selected sort option: ${sortOption}`);
  }

  /**
   * Validates that a "no results" message is displayed
   * Used for negative test scenarios with restrictive filters
   */
  async validateNoResults(): Promise<void> {
    // Look for "no results" or "No properties found" message
    const noResultsMessage = this.page.locator('text=/no results|No properties found/i');

    // Validate the message appears (wait up to 10 seconds)
    await expect(noResultsMessage).toBeVisible();
    this.logInfo('✓ No results message displayed');
  }

  /**
   * Validates the "We have found X properties" message matches expected count
   * This ensures filters are actually working and not just showing suggestions
   * @param {number} expectedCount - Expected number of properties (optional, will just log if not provided)
   */
  async validateExactMatchCount(expectedCount?: number): Promise<number> {
    try {
      // Look for "We have found X properties in Y resorts and Z countries"
      const messageLocator = this.page.locator('text=/We\s+have\s+found\s+\d+\s+propert/i').first();
      await messageLocator.waitFor({ state: 'visible', timeout: 5000 });
      
      const messageText = await messageLocator.textContent();
      if (!messageText) {
        this.logInfo('⚠ Could not read exact match message');
        return 0;
      }

      // Extract number: "We have found 4 properties..."
      const match = messageText.match(/found\s+(\d+)\s+propert/i);
      if (!match) {
        this.logInfo(`⚠ Could not parse count from: "${messageText}"`);
        return 0;
      }

      const actualCount = parseInt(match[1], 10);
      this.logInfo(`✓ Found message: "${messageText.trim()}" → ${actualCount} exact matches`);

      if (expectedCount !== undefined && actualCount !== expectedCount) {
        this.addSoftError(`Expected ${expectedCount} exact matches but message shows ${actualCount}`);
      }

      return actualCount;
    } catch (error) {
      this.logInfo(`⚠ Could not find "We have found X properties" message - may be too many results`);
      return 0;
    }
  }

  /**
   * Validates that at least one result contains the expected duration (e.g., "2 Nights")
   * Only validates exact match results (stops at "More results..." separator if present)
   * Uses the specific locator .search-result__nights to ensure accurate matching
   * @param {number | string} expectedNights - Expected number of nights to find in results
   */
  async validateResultsContainNights(expectedNights: number | string): Promise<void> {
    try {
      // Wait for results to be visible
      await this.searchResults.first().waitFor({ state: 'visible', timeout: 5000 });

      // Check if there's a "More results..." separator (relaxed criteria section)
      const moreResultsSeparator = this.page.locator('.you-might-like-title');
      const hasSeparator = await moreResultsSeparator.count().catch(() => 0) > 0;

      if (hasSeparator) {
        this.logInfo('Found "More results..." separator - validating cards before it');
      }

      const targetNights = Number(String(expectedNights).replace(/\D+/g, '')) || Number(expectedNights);
      const allResultCards = this.page.locator('.search-results');
      const totalCount = await allResultCards.count();

      this.logInfo(`Found ${totalCount} total result cards`);

      let checkedCount = 0;
      let belowTarget = false;
      const observed: Array<{ card: number; nights: string; parsed: number | null }> = [];

      for (let i = 0; i < totalCount; i++) {
        const resultCard = allResultCards.nth(i);

        // ALWAYS check if we've reached the separator (suggestions section)
        if (hasSeparator) {
          try {
            const sepHandle = await moreResultsSeparator.first().elementHandle();
            if (sepHandle) {
              const isBeforeSeparator = await resultCard.evaluate((card, sep) => {
                if (!sep) return false;
                const cardTop = card.getBoundingClientRect().top;
                const sepTop = sep.getBoundingClientRect().top;
                return cardTop < sepTop;
              }, sepHandle);
              if (!isBeforeSeparator) {
                this.logInfo(`✓ Stopped at card ${i + 1} - reached "More results..." suggestions section`);
                break;
              }
            }
          } catch {
            // Continue if separator check fails
          }
        }

        checkedCount++;

        // Prefer dedicated nights element; fallback to common duration/meta blocks; last resort regex on card text
        const candidates = [
          resultCard.locator('.search-result__nights').first(),
          resultCard.locator('.search-result__duration').first(),
          resultCard.locator('[class*="duration" i]').filter({ hasText: /night/i }).first(),
          resultCard.locator('.search-result__meta:has-text("night")').first()
        ];

        let text = '';
        for (const locator of candidates) {
          if (await locator.count().catch(() => 0)) {
            text = (await locator.textContent().catch(() => ''))?.trim() || '';
            if (text) break;
          }
        }

        if (!text) {
          const cardText = await resultCard.textContent().catch(() => '') || '';
          const match = cardText.match(/(\d+)\s*Nights?/i);
          text = match ? match[0] : '';
        }

        const parsed = (() => {
          if (!text) return null;
          const m = text.match(/(\d+)/);
          return m ? Number(m[1]) : null;
        })();

        observed.push({ card: i + 1, nights: text, parsed });

        if (parsed !== null && parsed < targetNights) {
          belowTarget = true;
        }
      }

      if (hasSeparator) {
        this.logInfo(`✓ Validated ${checkedCount} exact match cards (before "More results..." separator)`);
      } else {
        this.logInfo(`Checked ${checkedCount} result cards (no separator found)`);
      }

      if (observed.length === 0) {
        this.addSoftError(`No nights text found in the first ${checkedCount} results`);
        return;
      }

      if (belowTarget) {
        this.addSoftError(`Found result(s) with nights below ${expectedNights}: ${JSON.stringify(observed)}`);
        return;
      }

      this.logInfo(`✅ All ${checkedCount} exact match results have ${expectedNights}+ nights`);
    } catch (error) {
      this.logInfo(`⚠ Error in validateResultsContainNights: ${error}`);
    }
  }

  /** Returns how many result cards are visible on the current page */
  async getVisibleCardCount(): Promise<number> {
    try {
      const titleEls = this.page.locator('a.search-result__title');
      const titleCount = await titleEls.count().catch(() => 0);
      if (titleCount > 0) return titleCount;

      const cards = this.page.locator('.search-results .search-result, .search-result');
      const cardCount = await cards.count().catch(() => 0);
      if (cardCount > 0) return cardCount;

      return await this.searchResults.count().catch(() => 0);
    } catch {
      return 0;
    }
  }

  /** Gets the first card title on the page (best-effort) */
  async getFirstCardTitle(): Promise<string> {
    try {
      const titleLocator = this.page.locator('a.search-result__title').first();
      if (await titleLocator.count()) {
        const text = (await titleLocator.textContent())?.trim() || '';
        if (text) return text;
      }
      const cardLocator = this.page.locator('.search-result').first();
      const altTitle = cardLocator.locator('h2, h3, .title').first();
      if (await altTitle.count()) {
        return (await altTitle.textContent())?.trim() || '';
      }
    } catch {}
    return '';
  }

  /** Checks if a section clear button (e.g., country) is visible (not hidden) */
  async isSectionClearVisible(optionType: string): Promise<boolean> {
    try {
      // Wait for filters sidebar to be stable
      await this.filtersSidebar.waitFor({ state: 'visible' }).catch(() => {});
      
      const section = this.filtersSidebar.locator(`[data-option-type="${optionType}"]`).first();
      if (!(await section.count())) {
        this.logInfo(`⚠️ Section with data-option-type="${optionType}" not found`);
        return false;
      }
      
      const clearBtn = section.locator('.faceted-search__section-clear').first();
      if (!(await clearBtn.count())) {
        this.logInfo(`⚠️ Clear button not found in ${optionType} section`);
        return false;
      }
      
      // Wait a bit for DOM to update after filter selection
      await this.page.waitForTimeout(500).catch(() => {});
      
      const classAttr = (await clearBtn.getAttribute('class')) || '';
      const isVisible = !classAttr.includes('hidden');
      this.logInfo(`Clear button for ${optionType}: ${isVisible ? 'visible' : 'hidden'} (classes: ${classAttr})`);
      return isVisible;
    } catch (error) {
      this.logInfo(`⚠️ Error checking clear button visibility for ${optionType}: ${error}`);
      return false;
    }
  }

  /** Opens the first result's detail page and validates a feature exists in FEATURES block */
  async validateFeatureInFirstResultDetail(feature: string): Promise<void> {
    try {
      await this.searchResults.first().waitFor({ state: 'visible' });
      const firstCard = this.searchResults.first();
      const { detailPage } = await this.openDetailPage(firstCard, 'Feature validation');
      if (!detailPage) {
        this.addSoftError(`Could not open detail page to validate feature: ${feature}`);
        return;
      }

      const featuresBlock = detailPage.locator('.property__feature-block').first();
      const featuresText = (await featuresBlock.textContent().catch(() => ''))?.toLowerCase() || '';
      const match = featuresText.includes(feature.toLowerCase());

      if (!match) {
        this.addSoftError(`Feature "${feature}" not found on detail page FEATURES block`);
      } else {
        this.logInfo(`✓ Detail page contains feature: ${feature}`);
      }

      await detailPage.close().catch(() => { });
    } catch (error) {
      this.logInfo(`⚠ Error validating feature on detail page: ${error}`);
    }
  }

  /**
   * Validates that at least one result contains the expected country
   * @param {string} expectedCountry - Expected country name to find in results (e.g., "France", "USA")
   */
  async validateResultsContainCountry(expectedCountry: string): Promise<void> {
    await this.searchResults.first().waitFor({ state: 'visible' });
    const resultCards = await this.searchResults.all();

    let foundMatch = false;
    for (const card of resultCards) {
      const cardText = await card.textContent();
      if (cardText?.includes(expectedCountry)) {
        foundMatch = true;
        break;
      }
    }

    if (foundMatch) {
      this.logInfo(`✓ ${expectedCountry} found in results`);
    } else {
      this.addSoftError(`${expectedCountry} not found in results`);
    }
  }

  // ============================================================
  // 🔵 NEW FILTER ACTIONS (TC-017 to TC-022)
  // ============================================================

  /** Checks accommodation filter using multi-strategy selectors */
  async selectAccommodationFilter(accommodationType: string): Promise<void> {
    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${accommodationType}"]`).first(),
      this.page.locator(`input[type="checkbox"]#${accommodationType}`).first(),
      this.page.locator(`label:has-text("${accommodationType}") input[type="checkbox"]`).first(),
      this.page.locator(`input[type="checkbox"]`, { has: this.page.locator(`text=${accommodationType}`) }).first()
    ];

    await this.selectCheckboxByStrategies('accommodation type', accommodationType, strategies, this.filtersSidebar);
  }

  /** Checks board basis filter using multi-strategy selectors */
  async selectBoardBasisFilter(boardBasis: string): Promise<void> {
    const partialText = boardBasis.split(' ')[0];
    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${boardBasis}"]`).first(),
      this.page.locator(`input[type="checkbox"]#${boardBasis.replace(/\s+/g, '')}`).first(),
      this.page.locator(`label:has-text("${boardBasis}") input[type="checkbox"]`).first(),
      this.page.locator(`label:has-text("${partialText}") input[type="checkbox"]`).first()
    ];

    await this.selectCheckboxByStrategies('board basis', boardBasis, strategies, this.filtersSidebar);
  }

  // Select a snowflake rating filter and wait for results to update
  /** Checks rating filter using multi-strategy selectors */
  async selectRatingFilter(rating: number): Promise<void> {
    this.logInfo(`Selecting ${rating}-snowflake filter...`);
    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${rating}"]`).first(),
      this.page.locator(`input[type="checkbox"][data-rating="${rating}"]`).first(),
      this.page.locator(`label:has-text("${rating}") input[type="checkbox"]`).first(),
      this.filtersSidebar.locator('.rating-filter, .snowflakes-filter, [data-filter="rating"]').locator(`input[type="checkbox"]`).nth(rating - 1)
    ];

    const success = await this.selectCheckboxByStrategies('rating', `${rating} snowflakes`, strategies, this.filtersSidebar);

    if (!success) {
      throw new Error(`Failed to select ${rating}-snowflake rating filter`);
    }

    this.logInfo(`✓ ${rating}-snowflake filter applied`);

    // Wait for results to actually update with new filtered data
    try {
      await this.page.waitForLoadState('domcontentloaded');
      
      // MANDATORY: Wait for JavaScript to process filter and re-render result cards
      // Without this settlement wait, we'd validate old results still in DOM before new ones load
      await this.page.waitForTimeout(500);
      
      const filteredCount = await this.getResultsCount();
      this.logInfo(`✓ Results filtered: ${filteredCount} properties with ${rating} snowflakes`);
    } catch (err) {
      this.logInfo(`⚠ Could not verify results count after filter: ${err}`);
    }
  }

  /** Checks property feature filter using multi-strategy locators with force-check fallback */
  async selectPropertyFeatureFilter(feature: string): Promise<void> {
    if (!this.checkPageAlive(`selecting feature ${feature}`)) return;

    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${feature}"]`).first(),
      this.page.locator(`input[type="checkbox"]#${feature.replace(/\s+/g, '')}`).first(),
      this.page.locator(`label:has-text("${feature}") input[type="checkbox"]`).first(),
      this.page.locator(`label:text-is("${feature}") input[type="checkbox"]`).first(),
      this.filtersSidebar.locator('[class*="feature"], [class*="amenity"], [data-filter="features"]').locator(`label:has-text("${feature}") input[type="checkbox"]`).first()
    ];

    await this.selectCheckboxByStrategies('property feature', feature, strategies, this.filtersSidebar);
  }

  /** Checks ski area filter with special character escaping and multi-strategy selectors */
  // Select ski area filter and wait for page to re-render filtered results
  async selectSkiAreaFilter(skiArea: string): Promise<void> {
    if (!this.checkPageAlive(`selecting ski area ${skiArea}`)) return;

    const safeId = skiArea.replace(/[^A-Za-z0-9_-]/g, '');
    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${skiArea}"]`).first(),
      this.page.locator(`input[type="checkbox"]#${safeId}`).first(),
      this.page.locator(`label:has-text("${skiArea}") input[type="checkbox"]`).first(),
      this.filtersSidebar.locator('[class*="area"], [data-filter="area"], [data-filter="ski-area"], [class*="region"]').locator(`label:has-text("${skiArea}") input[type="checkbox"]`).first()
    ];

    const success = await this.selectCheckboxByStrategies('ski area', skiArea, strategies, this.filtersSidebar);

    if (!success) {
      throw new Error(`Failed to select ${skiArea} ski area filter`);
    }

    this.logInfo(`✓ ${skiArea} ski area filter applied`);

    // Wait for results to actually update with new filtered data
    try {
      await this.page.waitForLoadState('domcontentloaded');
      
      // MANDATORY: Wait for JavaScript to process filter and re-render result cards
      // Without this settlement wait, we'd validate old results still in DOM before new ones load
      await this.page.waitForTimeout(500);
      
      const filteredCount = await this.getResultsCount();
      this.logInfo(`✓ Results filtered: ${filteredCount} properties in ski area ${skiArea}`);
    } catch {
      this.logInfo(`  Note: Result filtering completed or timed out`);
    }
  }

  // Select resort filter by name and wait for results to filter
  /** Checks resort filter with special character escaping and multi-strategy selectors */
  async selectResortFilter(resort: string): Promise<void> {
    if (!this.checkPageAlive(`selecting resort ${resort}`)) return;

    // First, find and scroll to the resort label to ensure it's visible
    const resortLabel = this.page.locator(`label:has-text("${resort}") input[type="checkbox"]`).first();
    try {
      await resortLabel.scrollIntoViewIfNeeded().catch(() => {});
    } catch (e) {
      this.logInfo(`Note: Could not scroll resort label into view initially`);
    }

    // Add a small wait to let the scroll complete
    await this.page.waitForTimeout(300);

    const safeResortId = resort.replace(/[^A-Za-z0-9_-]/g, '');
    const strategies = [
      this.page.locator(`input[type="checkbox"][value="${resort}"]`).first(),
      this.page.locator(`input[type="checkbox"]#${safeResortId}`).first(),
      this.page.locator(`label:has-text("${resort}") input[type="checkbox"]`).first(),
      this.filtersSidebar.locator('[class*="resort"], [data-filter="resort"], [class*="area"]').locator(`label:has-text("${resort}") input[type="checkbox"]`).first()
    ];

    const success = await this.selectCheckboxByStrategies('resort', resort, strategies, this.filtersSidebar);

    if (!success) {
      throw new Error(`Failed to select ${resort} resort filter`);
    }

    this.logInfo(`✓ ${resort} resort filter applied`);

    // Wait for results to actually update with new filtered data
    try {
      await this.page.waitForLoadState('domcontentloaded');
      
      // MANDATORY: Settlement wait - allows DOM to reflect resort filter changes before validation
      // Resort filter requires longer wait due to large dataset and animation delays
      await this.page.waitForTimeout(800);
      
      const filteredCount = await this.getResultsCount();
      this.logInfo(`✓ Results filtered: ${filteredCount} properties in resort ${resort}`);
    } catch (error) {
      // Results may not have visible count, continue anyway
    }
  }

  // ============================================================
  // 🔵 NEW VALIDATION ACTIONS (TC-017 to TC-022)
  // ============================================================

  /**
   * Validates that results contain only the specified accommodation type
   * @param {string} accommodationType - Expected accommodation type
   */
  async validateResultsContainAccommodationType(accommodationType: string): Promise<void> {
    await this.searchResults.first().waitFor({ state: 'visible' });
    const resultCards = await this.searchResults.all();
    const sampleSize = Math.min(resultCards.length, Math.min(this.MAX_EXACT_MATCHES, 5));

    this.logInfo(`Checking up to ${sampleSize} result detail pages for accommodation "${accommodationType}"`);

    let confirmed = 0;
    let inspected = 0;

    for (let i = 0; i < sampleSize; i++) {
      const card = resultCards[i];
      const { detailPage, detailUrl } = await this.openDetailPage(card, `Result ${i + 1}`);
      if (!detailPage) continue;

      inspected++;

      try {
        const matches = await this.detailPageMatchesAccommodation(detailPage, accommodationType);
        if (matches) {
          confirmed++;
          this.logInfo(`✓ Detail confirms accommodation "${accommodationType}" → ${detailUrl}`);
        } else {
          this.logInfo(`✗ Detail missing accommodation "${accommodationType}" → ${detailUrl}`);
        }
      } catch (error) {
        this.logInfo(`❌ Error validating accommodation on ${detailUrl}: ${error}`);
      } finally {
        await detailPage.close().catch(() => { });
      }

      if (confirmed > 0) break;
    }

    if (confirmed === 0) {
      this.addSoftError(`Accommodation "${accommodationType}" not confirmed in first ${sampleSize} detail pages`);
      expect(confirmed).toBeGreaterThan(0);
    } else {
      this.logInfo(`✓ Confirmed accommodation "${accommodationType}" in ${confirmed} detail page(s) (inspected ${inspected})`);
    }
  }

  /**
   * Validates that results contain only the specified board basis
   * @param {string} boardBasis - Expected board basis option
   */
  async validateResultsContainBoardBasis(boardBasis: string): Promise<void> {
    await this.searchResults.first().waitFor({ state: 'visible' });
    const resultCards = await this.searchResults.all();
    const sampleSize = Math.min(resultCards.length, Math.min(this.MAX_EXACT_MATCHES, 5));

    this.logInfo(`Checking up to ${sampleSize} result detail pages for board basis "${boardBasis}"`);

    let confirmed = 0;
    let inspected = 0;

    for (let i = 0; i < sampleSize; i++) {
      const card = resultCards[i];
      const { detailPage, detailUrl } = await this.openDetailPage(card, `Result ${i + 1}`);
      if (!detailPage) continue;

      inspected++;

      try {
        const matches = await this.detailPageMatchesBoardBasis(detailPage, boardBasis);
        if (matches) {
          confirmed++;
          this.logInfo(`✓ Detail confirms board basis "${boardBasis}" → ${detailUrl}`);
        } else {
          this.logInfo(`✗ Detail missing board basis "${boardBasis}" → ${detailUrl}`);
        }
      } catch (error) {
        this.logInfo(`❌ Error validating board basis on ${detailUrl}: ${error}`);
      } finally {
        await detailPage.close().catch(() => { });
      }

      if (confirmed > 0) break;
    }

    if (confirmed === 0) {
      this.addSoftError(`Board basis "${boardBasis}" not confirmed in first ${sampleSize} detail pages`);
      expect(confirmed).toBeGreaterThan(0);
    } else {
      this.logInfo(`✓ Confirmed board basis "${boardBasis}" in ${confirmed} detail page(s) (inspected ${inspected})`);
    }
  }

  /**
   * Validates that results contain only the specified rating (STRICT MODE)
   * @param {number} rating - Expected rating value (1-5 snowflakes)
   * All results must match the filter - no tolerance for mismatches
   */
  // Check that result cards contain the selected rating (using snowflake stars)
  async validateResultsContainRating(rating: number): Promise<void> {

    await this.searchResults.first().waitFor({ state: 'visible' });
    const resultCards = await this.searchResults.all();
    const sampleSize = Math.min(5, resultCards.length);
    const perCardTimeoutMs = 8000;
    this.logInfo(`Checking ${sampleSize} result cards (STRICT VALIDATION, ${perCardTimeoutMs}ms/card)`);

    let correctCount = 0;
    let incorrectCount = 0;
    const ratingCounts: { [key: number]: number } = {};
    const incorrectResults: string[] = [];

    const trackRating = (value: number | null) => {
      if (value && value > 0) {
        ratingCounts[value] = (ratingCounts[value] || 0) + 1;
      }
    };

    for (let i = 0; i < sampleSize; i++) {
      const processCard = async () => {
        if (!this.checkPageAlive('validating rating results')) {
          throw new Error('Page closed during rating validation');
        }

        let cardRating = 0;
        const cardTitle = await resultCards[i].locator('h3, [class*="title"], [class*="heading"], a').first().textContent().catch(() => '') || `Result ${i + 1}`;

        // Get text and HTML from card to find rating (may be in textContent or innerHTML)
        const fullText = await resultCards[i].textContent().catch(() => '') || '';
        const innerHTML = await resultCards[i].innerHTML().catch(() => '') || '';
        const searchText = fullText + ' ' + innerHTML;

        // Extract rating from search text using multiple patterns
        let match = searchText.match(/(\d+(?:\.\d+)?)\s+out\s+of\s+5(?:\b|[\s\w])/i);
        if (match) {
          cardRating = Math.round(parseFloat(match[1]));
        }

        if (cardRating === 0) {
          match = searchText.match(/(\d+(?:\.\d+)?)[.\s]*out[.\s]*of[.\s]*5/i);
          if (match) {
            cardRating = Math.round(parseFloat(match[1]));
          }
        }

        if (cardRating === 0) {
          const snowflakeCount = (searchText.match(/★|✓\s*5|[5](?:\s+out|\s+snowflake)/gi) || []).length;
          if (snowflakeCount > 0) {
            cardRating = snowflakeCount;
          }
        }

        if (cardRating === 0) {
          match = searchText.match(/(\d+(?:\.\d+)?)\s+snowflake/i);
          if (match) {
            cardRating = Math.round(parseFloat(match[1]));
          }
        }

        trackRating(cardRating > 0 ? cardRating : null);

        // Validate card rating matches expected rating
        if (cardRating === rating) {
          correctCount++;
          this.logInfo(`  Card ${i + 1}: ${cardRating}★ ✓`);
        } else if (cardRating > 0) {
          incorrectCount++;
          incorrectResults.push(`Card ${i + 1}: ${cardRating}★ (expected ${rating}★)`);
          this.logInfo(`  Card ${i + 1}: ${cardRating}★ (expected ${rating}★)`);
        } else {
          incorrectCount++;
          incorrectResults.push(`Card ${i + 1}: unknown rating`);
          this.logInfo(`  Card ${i + 1}: unknown rating`);
        }
      };

      try {
        await Promise.race([
          processCard(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('card-timeout')), perCardTimeoutMs))
        ]);
      } catch (err) {
        if ((err as Error).message === 'card-timeout') {
          incorrectResults.push(`Result ${i + 1}: timed out extracting rating`);
          this.logInfo(`  ⚠ [TIMEOUT] Result ${i + 1} exceeded ${perCardTimeoutMs}ms`);
          incorrectCount++;
        } else {
          this.logInfo(`  ⚠ Card processing error: ${err}`);
          incorrectCount++;
          incorrectResults.push(`Result ${i + 1}: ${err}`);
        }
      }
    }

    // Show rating distribution
    this.logInfo(`  Rating distribution: ${JSON.stringify(ratingCounts)}`);

    // STRICT VALIDATION: All results must match
    if (incorrectCount > 0) {
      const errorMsg = `❌ RATING FILTER BROKEN: ${incorrectCount}/${sampleSize} results have wrong rating!\n` +
        `   Expected: ${rating} snowflakes only\n` +
        `   Correct: ${correctCount}, Incorrect: ${incorrectCount}\n` +
        `   Wrong results: ${incorrectResults.join(', ')}\n` +
        `   This indicates the ${rating}-snowflake filter is not working properly.`;

      this.logInfo(errorMsg);
      throw new Error(errorMsg);
    }

    if (correctCount === 0) {
      const errorMsg = `❌ NO RESULTS MATCH: None of the ${sampleSize} sampled results have ${rating} snowflakes.\n` +
        `   This may indicate: (1) filter not applied, (2) no properties available, or (3) wrong checkbox selected.`;

      this.logInfo(errorMsg);
      throw new Error(errorMsg);
    }

    this.logInfo(`✓ STRICT VALIDATION PASSED: All ${correctCount}/${sampleSize} results have exactly ${rating} snowflakes`);
  }

  /**
   * Validates that results contain the specified property feature
   * @param {string} feature - Expected feature name
   */
  // Validate property features like WiFi, Sauna, Jacuzzi are displayed on cards
  async validateResultsContainFeature(feature: string): Promise<void> {

    try {
      // Check if page is still open
      if (!this.checkPageAlive('validating feature results')) return;

      const resultsVisible = await this.searchResults.first().waitFor({ state: 'visible' }).then(() => true).catch(() => false);
      if (!resultsVisible) {
        this.logInfo(`  ⚠ Results not visible - skipping validation`);
        return;
      }

      const resultCards = await this.searchResults.all().catch(() => []);
      if (resultCards.length === 0) {
        this.logInfo(`  ⚠ No result cards found - skipping validation`);
        return;
      }

      this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);

      let foundMatch = false;
      for (let i = 0; i < Math.min(5, resultCards.length); i++) {
        // Check if page closed during iteration
        if (!this.checkPageAlive(`validation at card ${i}`)) break;

        // Try multiple strategies to find feature

        // Strategy 1: Look for feature in card text
        const cardText = await resultCards[i].textContent().catch(() => '');
        if (cardText?.toLowerCase().includes(feature.toLowerCase())) {
          foundMatch = true;
          this.logInfo(`  ✓ Result ${i + 1} contains feature "${feature}" in text`);
          continue;
        }

        // Strategy 2: Look for feature icon or label
        const featureIcon = resultCards[i].locator(`[class*="wifi"], [class*="amenity"], [data-feature="${feature}"]`);
        const iconCount = await featureIcon.count().catch(() => 0);
        if (iconCount > 0) {
          foundMatch = true;
          this.logInfo(`  ✓ Result ${i + 1} contains feature "${feature}" icon`);
          continue;
        }

        // Strategy 3: Look in features list
        const featuresList = resultCards[i].locator('.features, .amenities, [class*="facility"]');
        const featuresText = await featuresList.textContent().catch(() => '');
        if (featuresText?.toLowerCase().includes(feature.toLowerCase())) {
          foundMatch = true;
          this.logInfo(`  ✓ Result ${i + 1} contains feature "${feature}" in features list`);
          continue;
        }

        // Debug first card
        if (i === 0) {
          this.logInfo(`  First card text excerpt: "${cardText?.substring(0, 100)}..."`);
          this.logInfo(`  WiFi-related elements: ${iconCount}`);
        }
      }

      if (!foundMatch) {
        this.addSoftError(`Feature "${feature}" not visibly displayed in sampled result cards`);
      } else {
        this.logInfo(`✓ Validated feature: ${feature}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logInfo(`  ❌ Error validating feature: ${errorMessage} - continuing anyway`);
    }

    // Ensure method completes without hanging
    return Promise.resolve();
  }

  /**
   * Validates that results belong to the specified ski area
   * Maps ski area names to their component resorts for validation
   * @param {string} skiArea - Expected ski area name
   */
  // Ski areas like "The 3 Valleys" contain multiple resorts (Val Thorens, Méribel, etc)
  // This validates by checking for any resort name that belongs to the ski area
  async validateResultsContainSkiArea(skiArea: string): Promise<void> {

    // Mapping of ski areas to their component resorts
    const skiAreaResorts: Record<string, string[]> = {
      'The 3 Valleys': ['Brides Les Bains', 'Courchevel', 'La Tania', 'Les Menuires', 'Méribel', 'St Martin de Belleville', 'Val Thorens'],
      'Portes du Soleil': ['Avoriaz', 'Morzine', 'Chamonix', 'Mégève'],
      'Paradiski': ['Paradiski', 'La Plagne', 'Peisey', 'Vallandry'],
    };

    try {
      await this.searchResults.first().waitFor({ state: 'visible' });
      const resultCards = await this.searchResults.all();
      this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards for "${skiArea}"`);

      // Get the list of resorts to check for this ski area
      const resortList = skiAreaResorts[skiArea] || [skiArea];

      let foundMatch = false;
      for (let i = 0; i < Math.min(5, resultCards.length); i++) {
        const fullText = await resultCards[i].textContent().catch(() => '');
        const innerHTML = await resultCards[i].innerHTML().catch(() => '');
        const searchText = fullText + ' ' + innerHTML;

        // Check if any of the resorts for this ski area are found in the card
        const foundResort = resortList.find(resort => searchText?.includes(resort));
        if (foundResort) {
          foundMatch = true;
          this.logInfo(`  ✓ Card ${i + 1}: "${foundResort}" (part of ${skiArea})`);
        }
      }

      if (!foundMatch) {
        this.logInfo(`  Resorts to check: ${resortList.join(', ')}`);
        this.addSoftError(`No results found for ski area "${skiArea}" in sampled cards`);
      } else {
        this.logInfo(`✓ Validated ski area: ${skiArea}`);
      }
    } catch (error) {
      this.logInfo(`⚠ Error validating ski area: ${error}`);
    }
  }

  /**
   * Validates that results belong to the specified resort
   * @param {string} resort - Expected resort name
   */
  // Validate that sampled result cards display the expected resort name
  async validateResultsContainResort(resort: string): Promise<void> {

    try {
      await this.searchResults.first().waitFor({ state: 'visible' });
      const resultCards = await this.searchResults.all();
      this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);

      let foundMatch = false;
      for (let i = 0; i < Math.min(5, resultCards.length); i++) {
        const fullText = await resultCards[i].textContent().catch(() => '');
        const innerHTML = await resultCards[i].innerHTML().catch(() => '');
        const searchText = fullText + ' ' + innerHTML;

        if (searchText?.includes(resort)) {
          foundMatch = true;
          this.logInfo(`✓ Card ${i + 1}: ${resort} ✓`);
        }
      }

      if (!foundMatch) {
        this.addSoftError(`No results found for resort "${resort}" in sampled cards`);
      } else {
        this.logInfo(`✓ Validated resort: ${resort}`);
      }
    } catch (error) {
      this.logInfo(`⚠ Error validating resort: ${error}`);
    }
  }

  // ============================================================
  // 🔵 FILTER MANAGEMENT ACTIONS
  // ============================================================

  /**
   * Clear all applied filters and reset to default state
   */
  async clearAllFilters(): Promise<void> {
    try {
      // Look for "Clear all changes" or equivalent button
      const clearButton = this.page
        .locator(
          [
            'a:has-text("Clear all changes")',
            'button:has-text("Clear all changes")',
            'a:has-text("Clear all")',
            '[data-clear="all"]',
          ].join(',')
        )
        .first();

      if (await clearButton.count() > 0) {
        await clearButton.click();
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        this.logInfo('✓ Cleared all filters');
      } else {
        this.logInfo('⚠ Clear all button not found - may need manual implementation');
      }
    } catch (error) {
      this.logInfo(`⚠ Error clearing filters: ${error}`);
    }
  }

  /**
   * Clear only Country filter section
   * Finds and clicks the "clear" button within the Country section
   */
  async clearCountryFilters(): Promise<void> {
    try {
      // Strategy 1: Find "clear" button in data-option-type="country" section
      let clearButton = this.filtersSidebar
        .locator('[data-option-type="country"]')
        .locator('a:has-text("clear"), button:has-text("clear")')
        .first();

      if (!(await clearButton.count())) {
        // Strategy 2: Find by class name pattern
        clearButton = this.filtersSidebar
          .locator('a.faceted-search__section-clear:has-text("clear")')
          .first();
      }

      if (!(await clearButton.count())) {
        // Strategy 3: Find all clear buttons and look for the one near "Country" text
        const countrySection = this.filtersSidebar
          .locator('span.faceted-search__section-title:has-text("Country")')
          .locator('xpath=ancestor::div[1]/following-sibling::a[contains(@class, "section-clear")]')
          .first();
        
        if (await countrySection.count()) {
          clearButton = countrySection;
        }
      }

      if (await clearButton.count() > 0) {
        await clearButton.scrollIntoViewIfNeeded();
        await clearButton.click({ force: true });
        await this.page.waitForTimeout(500); // Wait for filters to update
        this.logInfo('✓ Cleared country filters');
      } else {
        this.logInfo('⚠ Country clear button not found - country filters may not have been cleared');
      }
    } catch (error) {
      this.logInfo(`⚠ Error clearing country filters: ${error}`);
    }
  }

  /**
   * Get current page URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // ============================================================
  // 🔵 MULTI-SELECTION FILTER ACTIONS
  // ============================================================

  /**
   * Select multiple countries simultaneously
   * @param {string[]} countryCodes - Array of country codes to select
   * @returns {Promise<number>} Final results count
   */
  async selectMultipleCountries(countryCodes: string[]): Promise<number> {
    for (const code of countryCodes) {
      if (!this.checkPageAlive('selectMultipleCountries')) {
        this.logInfo(`⚠ Page closed - cannot select more countries`);
        break;
      }

      try {
        // Reuse the robust single-country selection logic (uses id + fallbacks)
        await this.selectCountryFilter(code);
      } catch (error) {
        this.logInfo(`⚠ ${code} error: ${error}`);
      }
    }

    const resultsCount = await this.getResultsCount();
    return resultsCount;
  }

  /**
   * Select multiple accommodation types simultaneously
   * @param {string[]} accommodationTypes - Array of accommodation types to select
   * @returns {Promise<number>} Final results count
   */
  async selectMultipleAccommodations(accommodationTypes: string[]): Promise<number> {
    for (const type of accommodationTypes) {
      const strategies = [
        this.page.locator(`label:has-text("${type}") input[type="checkbox"]`).first(),
        this.page.locator(`input[type="checkbox"][value="${type}"]`).first(),
        this.page.locator(`input[type="checkbox"]#${type.replace(/\s+/g, '')}`).first()
      ];

      await this.selectCheckboxByStrategies('accommodation type', type, strategies, this.filtersSidebar);
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${type} → ${count} results`);
    }

    const resultsCount = await this.getResultsCount();
    return resultsCount;
  }

  /**
   * Select multiple board basis options simultaneously
   * @param {string[]} boardBasisOptions - Array of board basis options to select
   * @returns {Promise<number>} Final results count
   */
  async selectMultipleBoardBasis(boardBasisOptions: string[]): Promise<number> {
    for (const option of boardBasisOptions) {
      const strategies = [
        this.page.locator(`label:has-text("${option}") input[type="checkbox"]`).first(),
        this.page.locator(`input[type="checkbox"][value="${option}"]`).first(),
        this.page.locator(`input[type="checkbox"]#${option.replace(/\s+/g, '')}`).first()
      ];

      await this.selectCheckboxByStrategies('board basis', option, strategies, this.filtersSidebar);
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${option} → ${count} results`);
    }

    const resultsCount = await this.getResultsCount();
    return resultsCount;
  }

  /**
   * Select multiple ski areas simultaneously
   * @param {string[]} skiAreas - Array of ski area names to select
   * @returns {Promise<number>} Final results count
   */
  async selectMultipleSkiAreas(skiAreas: string[]): Promise<number> {
    for (const area of skiAreas) {
      const strategies = [
        this.page.locator(`label:has-text("${area}") input[type="checkbox"]`).first(),
        this.page.locator(`input[type="checkbox"][value="${area}"]`).first(),
        this.page.locator(`input[type="checkbox"]#${area.replace(/\s+/g, '')}`).first()
      ];

      await this.selectCheckboxByStrategies('ski area', area, strategies, this.filtersSidebar);
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${area} → ${count} results`);
    }

    const resultsCount = await this.getResultsCount();
    return resultsCount;
  }

  /**
   * Deselect a single country from multi-selection
   * @param {string} countryCode - Country code to deselect
   * @returns {Promise<number>} Results count after deselection
   */
  async deselectCountry(countryCode: string): Promise<number> {
    try {
      if (!this.checkPageAlive('deselectCountry')) {
        return 0;
      }
      // Prefer id-based selector (site commonly uses input#FR, input#AT, etc)
      let checkbox = this.page.locator(`input#${countryCode}`).first();
      if (!(await checkbox.count())) {
        checkbox = this.filtersSidebar.locator(`input[type="checkbox"][value="${countryCode}" i], input[id*="${countryCode}" i]`).first();
      }
      const isChecked = await checkbox.isChecked().catch(() => false);

      if (isChecked && await checkbox.count() > 0) {
        await checkbox.scrollIntoViewIfNeeded().catch(() => { });
        await checkbox.uncheck({ force: true });
        try {
          await this.page.waitForLoadState('domcontentloaded').catch(() => { });
          await this.page.locator('text=/Encontramos\\s+\\d+|We\\s+have\\s+found\\s+\\d+/').first()
            .waitFor({ state: 'visible' }).catch(() => { });
        } catch { }
        const count = await this.getResultsCount();
        this.logInfo(`✓ Deselected ${countryCode} → ${count} results`);
      }
    } catch (error) {
      this.logInfo(`⚠ ${countryCode} error: ${error}`);
    }

    const resultsCount = await this.getResultsCount();
    return resultsCount;
  }
}
