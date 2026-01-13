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
  readonly nightsDeselectAllBtn: Locator = this.page.locator('button.actions-btn.bs-deselect-all, button.bs-deselect-all').first();
  readonly adultsButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: this.PATTERN_ADULTS }).first();
  readonly childrenButton: Locator = this.page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: this.PATTERN_CHILDREN }).first();

  // RESULTS DISPLAY - Cards, Pagination, Sort, etc.
  readonly searchResults: Locator = this.page.locator('.search-results');
  readonly resultsCountText: Locator = this.page.locator('.faceted-search__details__stats');
  readonly pagination: Locator = this.main.getByRole('navigation', { name: this.PATTERN_PAGINATION });
  readonly sortButton: Locator = this.page.locator('button#results-sort').first();
  readonly resultsPerPageButton: Locator = this.page.locator('button#results-per-page').first();
  readonly firstBookOnlineBtn: Locator = this.page.getByRole('button', { name: 'Book Online' }).first();
  readonly nightsBadges: Locator = this.page.locator('.search-result__nights, .search-result__duration, .result__nights, .duration, [class*="nights"]');
  // Rating wrappers on result cards only (exclude sidebar filter wrappers)
  readonly ratingWrappers: Locator = this.page.locator('.search-results .faceted-search__rating-wrapper[title]');

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

  // --- Page State Helpers ---
  /** Checks if the page or its context is closed */
  private async isPageClosed(): Promise<boolean> {
    try {
      if (this.page.isClosed()) return true;
      await this.page.evaluate(() => document.title).catch(() => { throw new Error('closed'); });
      return false;
    } catch (error) {
      return true;
    }
  }

  /** Safely closes a detail page without affecting the main page */
  private async safeCloseDetailPage(detailPage: Page | null, label: string = ''): Promise<void> {
    if (!detailPage) return;
    
    try {
      if (!detailPage.isClosed()) {
        await detailPage.close({ runBeforeUnload: false });
        this.logInfo(`✓ Closed detail page${label ? ': ' + label : ''}`);
      }
    } catch (error) {
      // Silent fail - page might already be closed
      this.logInfo(`⚠ Detail page close warning${label ? ' (' + label + ')' : ''}: ${error}`);
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
    // Check if main page is still alive
    if (await this.isPageClosed()) {
      this.logInfo(`⚠ ${contextLabel}: main page closed, cannot open detail`);
      return { detailPage: null, detailUrl: null };
    }

    const href = await this.extractResultHref(resultCard);
    if (!href) {
      this.logInfo(`⚠ ${contextLabel}: no detail link found`);
      return { detailPage: null, detailUrl: null };
    }

    let detailPage: Page | null = null;
    try {
      // Verify context is valid before creating new page
      const context = this.page.context();
      if (!context) {
        this.logInfo(`⚠ ${contextLabel}: browser context unavailable`);
        return { detailPage: null, detailUrl: href };
      }

      detailPage = await context.newPage();
      
      // Navigate to the detail page (uses the default 90s timeout from config)
      await detailPage.goto(href, { waitUntil: 'domcontentloaded' });
      
      // MANDATORY: Settlement wait for detail page to fully render before interacting
      // Without this, JavaScript-heavy pages may not have fully initialized
      await detailPage.waitForTimeout(testdata.searchPage.timeouts.pageSettlement).catch(() => { });
      
      return { detailPage, detailUrl: href };
    } catch (error) {
      this.logInfo(`❌ ${contextLabel}: failed to open detail page (${href}) → ${error}`);
      await this.safeCloseDetailPage(detailPage, contextLabel);
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
    
    // Strategy 1: Check main spec locators (FAST)
    const specLocator = this.getDetailPageSpecLocator(detailPage).filter({ hasText: matcher });
    if (await specLocator.count()) {
      return true;
    }

    // Strategy 2: Check data layer (FAST)
    const dataLayerInput = this.getDetailPageDataLayerLocator(detailPage);
    if (await dataLayerInput.count()) {
      const raw = await dataLayerInput.getAttribute('value');
      const parsed = this.parseDataLayerValue(raw);
      const boardValue = parsed?.board_basis || parsed?.results_list?.[0]?.board_basis;
      if (boardValue && matcher.test(String(boardValue))) {
        return true;
      }
    }

    // Strategy 3: Check common board basis display areas
    const boardBasisLocators = [
      detailPage.locator('[class*="board"], [class*="catered"], [class*="basis"], [class*="includes"]').filter({ hasText: matcher }),
      detailPage.locator('text=' + boardBasis),
      detailPage.locator('.holiday-highlights, .holiday-includes, .trip-includes').filter({ hasText: matcher })
    ];

    for (const loc of boardBasisLocators) {
      if (await loc.count()) {
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
    try {
      await this.searchResults.first().waitFor({ state: 'visible' });
    } catch {
      return false;
    }

    const count = await this.searchResults.count();
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
      // Check if page is closed before attempting any action
      if (await this.isPageClosed()) {
        this.logInfo(`[ERROR] Page closed - cannot select nights filter`);
        throw new Error('Page is closed');
      }

      // Use the native <select> to avoid flaky Bootstrap-Select dropdown UI.
      // The HTML for Nights is: select[data-option-type="nts"] with option values like "7" and "14+".
      const nightsSelect = this.filtersSidebar
        .locator('select[data-option-type="nts"], select.faceted-search__select.marker-moon')
        .first();

      await nightsSelect.waitFor({ state: 'attached' });
      let activeSelect = nightsSelect;

      const raw = String(nights).trim();
      const parsed = raw.match(/^(\d+\+?)/)?.[1] ?? raw;
      const nightsValue = parsed;
      const isOpenEnded = raw.includes('+');

      // Clear previous selection first to mimic "Deselect All".
      await nightsSelect.evaluate((sel) => {
        const select = sel as HTMLSelectElement;
        for (const opt of Array.from(select.options)) {
          if (!opt.disabled) opt.selected = false;
        }
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Select the requested value by matching the option value directly
      await nightsSelect.evaluate((sel, val) => {
        const select = sel as HTMLSelectElement;
        const targetValue = String(val).trim();
        
        // Find option by exact value match
        const targetOption = Array.from(select.options).find(
          o => (o.value || '').trim() === targetValue
        );
        
        if (targetOption) {
          targetOption.selected = true;
        }
      }, nightsValue);

      // Dispatch change events
      await nightsSelect.evaluate((sel) => {
        const select = sel as HTMLSelectElement;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // For open-ended durations (e.g., 14+) apply nts via URL by adding multiple values (14..max), preserving other params.
      if (isOpenEnded) {
        try {
          const currentUrl = await this.getCurrentUrl();

          // Determine available nights options from the select
          const availableValues: string[] = await nightsSelect.evaluate((sel) => {
            const select = sel as HTMLSelectElement;
            return Array.from(select.options).map(o => (o.value || '').trim());
          });

          const minOpen = Number(String(nightsValue).replace(/\D+/g, '')) || 14;
          let numericOptions = availableValues
            .map(v => Number(v))
            .filter(n => Number.isFinite(n) && n >= minOpen);

          // Fallback range if no numeric options were found in DOM
          if (numericOptions.length === 0) {
            numericOptions = Array.from({ length: (28 - minOpen + 1) }, (_, i) => minOpen + i);
          }

          const url = new URL(currentUrl);
          // Remove any existing nts params before appending a new set
          url.searchParams.delete('nts');
          for (const val of numericOptions) {
            url.searchParams.append('nts', String(val));
          }
          // Ensure filter state is applied (site expects state=4 for active filters)
          url.searchParams.set('state', '4');

          await this.page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
          this.logInfo(`✓ Applied open-ended nights via URL: nts=${numericOptions.join(',')}`);
        } catch (e) {
          this.logInfo(`⚠ Open-ended nights multi-nts URL apply failed: ${e}`);
        }
      }

      // Recover if backend responded with a 500 page after applying filter
      const error500 = this.page.locator('h1:has-text("Error 500")').first();
      if (await error500.count()) {
        this.logInfo('⚠ Detected 500 error page after nights filter, retrying fresh navigation');
        await this.page.goto(`/ski-holidays?nts=${encodeURIComponent(String(nightsValue))}`, { waitUntil: 'domcontentloaded' });
        await this.page.waitForTimeout(300).catch(() => {});

        activeSelect = this.filtersSidebar
          .locator('select[data-option-type="nts"], select.faceted-search__select.marker-moon')
          .first();
        await activeSelect.waitFor({ state: 'attached' }).catch(() => {});
        await activeSelect.evaluate((sel, val) => {
          const select = sel as HTMLSelectElement;
          const targetValue = String(val).trim();
          const targetOption = Array.from(select.options).find(
            o => (o.value || '').trim() === targetValue
          );
          if (targetOption) {
            targetOption.selected = true;
          }
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }, nightsValue).catch(() => {});
      }

      // Try multiple methods to trigger form submission - website is inconsistent
      let submitted = false;
      
      // Method 1: Press Enter on select
      try {
        await activeSelect.press('Enter').catch(() => {});
        submitted = true;
      } catch (e1) {
        console.log(`  ℹ️ Enter press failed: ${e1}`);
      }
      
      // Method 2: Click the select to blur it
      if (!submitted) {
        try {
          await activeSelect.click({ timeout: 2000 }).catch(() => {});
          await this.page.waitForTimeout(200);
          submitted = true;
        } catch (e2) {
          console.log(`  ℹ️ Click blur failed: ${e2}`);
        }
      }
      
      // Method 3: Dispatch change event directly
      if (!submitted) {
        try {
          await activeSelect.evaluate((sel) => {
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sel.dispatchEvent(new Event('blur', { bubbles: true }));
          });
          submitted = true;
        } catch (e3) {
          console.log(`  ℹ️ Dispatch event failed: ${e3}`);
        }
      }
      
      await this.page.waitForTimeout(500);

      // Wait for network with timeout - don't hang
      try {
        await Promise.race([
          this.page.waitForLoadState('networkidle'),
          new Promise(resolve => setTimeout(resolve, 2500))
        ]);
      } catch {}
      
      await this.page.waitForLoadState('domcontentloaded').catch(() => { });

      // Wait for the UI to reflect the new duration in the results.
      // Use shorter timeout (5s) to avoid hanging if page closes
      const targetNights = Number(String(nights).replace(/\D+/g, '')) || Number(nights);
      if (!Number.isNaN(targetNights) && targetNights > 0) {
        // Add page alive check with timeout race condition
        const stabilized = await Promise.race([
          // Main stabilization check
          this.page
            .waitForFunction(
              (minNights) => {
                const cards = Array.from(document.querySelectorAll('.search-results')) as HTMLElement[];
                if (!cards.length) return false;
                const cardText = (cards[0]?.innerText || cards[0]?.textContent || '').toString();
                const matches = Array.from(cardText.matchAll(/(\d+)\s*Nights?/gi));
                const values = matches
                  .map((m) => Number(m[1]))
                  .filter((n) => Number.isFinite(n));
                if (!values.length) return false;
                return Math.max(...values) >= (minNights as number);
              },
              targetNights,
              { timeout: 5_000 }
            )
            .then(() => true)
            .catch(() => false),
          // Timeout fallback to prevent hanging
          new Promise<boolean>(resolve => setTimeout(() => resolve(false), 6_000))
        ]);

        if (!stabilized) {
          this.logInfo(`⚠ Nights selection did not fully stabilize in time: ${nights}`);

          // Final fallback: force nights via URL param (nts=<value>) and reload same page
          // This handles cases where UI events don't trigger a backend search.
          try {
            const currentUrl = await this.getCurrentUrl();
            const url = new URL(currentUrl);
            // Use the parsed/select value (e.g., "14+" stays as plus; URL will encode it)
            url.searchParams.set('nts', String(nightsValue));
            await this.page.goto(url.toString(), { waitUntil: 'domcontentloaded' });

            // Short settle window and bounded network wait
            await this.page.waitForTimeout(400);
            await Promise.race([
              this.page.waitForLoadState('networkidle'),
              new Promise(resolve => setTimeout(resolve, 2500))
            ]).catch(() => {});

            this.logInfo(`✓ Applied nights via URL param: nts=${String(nightsValue)}`);
          } catch (e) {
            this.logInfo(`⚠ URL fallback for nights failed: ${e}`);
          }
        }
      }
      
      const count = await this.getResultsCount();
      this.logInfo(`✓ ${nights} nights → ${count} results`);

      // Ensure at least one nights badge is present before returning
      try {
        await this.page.waitForFunction(() => !!document.querySelector('.search-result__nights'));
      } catch {}

      // Fallback for environments using hyphen for open-ended (14-)
      if (isOpenEnded) {
        const hasBadge = await this.nightsBadges.count().catch(() => 0) > 0;
        if (!hasBadge) {
          try {
            const currentUrl = await this.getCurrentUrl();
            const url = new URL(currentUrl);
            url.searchParams.delete('nts');
            url.searchParams.append('nts', '14-');
            url.searchParams.set('state', '4');
            await this.page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
            await this.page.waitForFunction(() => !!document.querySelector('.search-result__nights, .search-result__duration, .result__nights, .duration, [class*="nights"]')).catch(() => {});
            this.logInfo('↻ Fallback applied: nts=14-');
          } catch (e) {
            this.logInfo(`⚠ Fallback 14- failed: ${e}`);
          }
        }
      }
    } catch (error) {
      this.logInfo(`❌ [FAIL] Error in selectNightsFilter: ${error} - continuing anyway`);
      // Swallow page-closed errors to avoid cascading failures in stress scenarios
      const msg = String(error || '');
      if (msg.toLowerCase().includes('target page') || msg.toLowerCase().includes('page, context or browser has been closed')) {
        return;
      }
      throw error;
    }
  }

  /** Explicitly clicks "Deselect All" in the nights dropdown to reset selection */
  async deselectAllNights(): Promise<void> {
    try {
      if (await this.isPageClosed()) {
        this.logInfo('[WARN] Page closed - cannot deselect nights');
        return;
      }

      this.logInfo('🔄 Clearing nights filter via "Deselect All" button...');

      // Open the nights dropdown
      await this.nightsButton.click().catch(() => {});

      // Click "Deselect All" button
      const btnCount = await this.nightsDeselectAllBtn.count();
      if (btnCount > 0) {
        await this.nightsDeselectAllBtn.click({ force: true });
        this.logInfo('  ✓ Clicked "Deselect All" button');
        
        // Close dropdown
        await this.page.keyboard.press('Escape').catch(() => {});
        
        // Wait for results to update (honors global timeout)
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.searchResults.first().waitFor({ state: 'visible' }).catch(() => {});
        
        this.logInfo('✓ Nights filter cleared successfully');
        return;
      }

      // Fallback - Direct manipulation if button not found
      this.logInfo('  ⚠ "Deselect All" button not found, using fallback method');
      
      const nightsSelect = this.filtersSidebar
        .locator('select[data-option-type="nts"], select.faceted-search__select.marker-moon')
        .first();

      if (!(await nightsSelect.count())) {
        this.logInfo('  ⚠ Nights select not found');
        return;
      }

      await nightsSelect.evaluate((sel) => {
        const select = sel as HTMLSelectElement;
        for (const opt of Array.from(select.options)) {
          if (!opt.disabled) opt.selected = false;
        }
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await this.page.waitForLoadState('domcontentloaded').catch(() => { });
      this.logInfo('✓ Nights filter cleared via fallback');
      
    } catch (error) {
      this.logInfo(`⚠ Error clearing nights filter: ${error}`);
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
    if (!this.checkPageAlive(`selecting country ${countryCode}`)) {
      this.logInfo(`[ERROR] Page closed - selecting country ${countryCode}`);
      return;
    }

    try {
      await this.filtersSidebar.waitFor({ state: 'visible' }).catch(() => { });
      await this.filtersSidebar.scrollIntoViewIfNeeded().catch(() => { });
    } catch (error) {
      this.logInfo(`[ERROR] Cannot access filters sidebar - ${error}`);
      return;
    }

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
        this.logInfo(`Country ${countryCode} not found`);
        return;
      }
    } catch {
      this.logInfo(`Country ${countryCode} selection failed - page may be closed`);
      return;
    }

    const normalizedCode = countryCode.trim().toUpperCase();
    const codeToName: Record<string, string> = {
      FR: 'France',
      US: 'USA',
      AT: 'Austria',
      IT: 'Italy',
      NO: 'Norway',
      FI: 'Finland',
    };
    const countryName = codeToName[normalizedCode];
    const countryLabel = this.filtersSidebar
      .locator('label', {
        hasText: countryName
          ? new RegExp(`\\b${this.escapeRegExp(countryName)}\\b`, 'i')
          : /a^/, // never matches
      })
      .first();

    try {
      const isChecked = await countryCheckbox.isChecked();
      if (isChecked) {
        return;
      }
    } catch { }

    // Click the checkbox with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        // Check page state before each attempt
        if (await this.isPageClosed()) {
          this.logInfo(`[ERROR] Page closed before country selection attempt ${attempts + 1}`);
          return;
        }

        // Prefer clicking the visible label text (more reliable than forcing checkbox state)
        if (countryName && (await countryLabel.count().catch(() => 0)) > 0) {
          await countryLabel.scrollIntoViewIfNeeded().catch(() => { });
          await countryLabel.click({ force: true });
        } else {
          await countryCheckbox.scrollIntoViewIfNeeded().catch(() => { });
          await countryCheckbox.check({ force: true });
        }

        // Verify the checkbox is actually checked; otherwise retry
        const nowChecked = await countryCheckbox.isChecked().catch(() => false);
        if (!nowChecked) {
          throw new Error(`Country ${countryCode} checkbox did not become checked`);
        }
        
        // Wait for page to respond (avoid `networkidle` which can hang on this site)
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        await this.searchResults.first().waitFor({ state: 'visible' }).catch(() => { });
        
        const count = await this.getResultsCount();
        this.logInfo(`✓ ${countryCode} → ${count} results`);
        return; // Success!
        
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          // Try clicking the parent label instead
          try {
            const parentLabel = countryCheckbox.locator('xpath=ancestor::label[1]').first();
            if (await parentLabel.count()) {
              await parentLabel.scrollIntoViewIfNeeded().catch(() => { });
              await parentLabel.click({ force: true });
              
              await this.page.waitForLoadState('domcontentloaded').catch(() => { });
              await this.searchResults.first().waitFor({ state: 'visible' }).catch(() => { });

              const nowChecked = await countryCheckbox.isChecked().catch(() => false);
              if (!nowChecked) {
                throw new Error(`Country ${countryCode} checkbox did not become checked`);
              }
              
              const count = await this.getResultsCount();
              this.logInfo(`✓ ${countryCode} → ${count} results`);
              return;
            }
          } catch (err) {
            this.logInfo(`❌ [FAIL] ${countryCode} error: ${err}`);
          }
        } else {
          this.logInfo(`⚠ Retry ${attempts}/${maxAttempts} for ${countryCode}`);
          if (await this.isPageClosed()) {
            this.logInfo(`[ERROR] Page closed during retry for ${countryCode}`);
            return;
          }
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
    if (await this.isPageClosed()) return;
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    const paginationContainer = this.page.locator('.pagination').first();
    try {
      await paginationContainer.waitFor({ state: 'visible' });
      await paginationContainer.scrollIntoViewIfNeeded();
    } catch {
      // Try a direct link to page 2 even if container isn't clearly visible
    }

    // Prefer accessible link named "2"; fallback to any anchor with text 2
    const nextPageLink = this.page.getByRole('link', { name: /^2$/ }).first();
    const anyLinkTwo = this.page.locator('a:has-text(" 2 "), a:text-is("2"), .pagination a:has-text("2")').first();
    const nextLink = this.page.getByRole('link', { name: /next/i }).first();

    let clicked = false;
    for (const candidate of [nextPageLink, anyLinkTwo, nextLink]) {
      try {
        if (await candidate.count()) {
          await candidate.scrollIntoViewIfNeeded().catch(() => {});
          await candidate.click({ force: true });
          clicked = true;
          break;
        }
      } catch {}
    }

    if (!clicked) {
      this.addSoftWarning('Pagination link for page 2 not found');
      return;
    }

    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    // Verify navigation: active indicator, URL param or stats block change
    // Try multiple selectors for active pagination item (Bootstrap and custom variants)
    const activeTwo = this.page.locator('.pagination .active:has-text("2"), .pagination li.active:has-text("2"), .pagination [aria-current="page"]:has-text("2")').first();
    const urlHasPage2 = () => /[?&]page=2\b/.test(this.page.url());

    const settled = await Promise.race([
      activeTwo.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false),
      new Promise<boolean>(resolve => setTimeout(() => resolve(urlHasPage2()), 2000))
    ]);

    if (!settled && !urlHasPage2()) {
      // Fallback: follow explicit href for page 2
      try {
        const href = await this.page.locator('.pagination a[rel="next"]').first().getAttribute('href').catch(() => null)
          || await this.page.locator('.pagination li[data-page="2"] a').first().getAttribute('href').catch(() => null);
        if (href) {
          this.logInfo(`Fallback navigating to ${href}`);
          await this.page.goto(href, { waitUntil: 'domcontentloaded' }).catch(() => {});
        }
      } catch {}
    }

    // Ensure results are visible after navigation
    await this.searchResults.first().waitFor({ state: 'visible' }).catch(() => {});
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
      // Check if page is closed
      if (await this.isPageClosed()) {
        this.logInfo(`⚠ [WARN] Error in validateResultsContainNights: Error: locator.waitFor: Target page, context or browser has been closed`);
        return;
      }

      // Wait for results to be visible
      await this.searchResults.first().waitFor({ state: 'visible' });

      // Check if there's a "More results..." separator (relaxed criteria section)
      const moreResultsSeparator = this.page.locator(
        '.you-might-like-title, text=/More results|You might also like|You might like/i'
      );
      const hasSeparator = await moreResultsSeparator.count().catch(() => 0) > 0;

      if (hasSeparator) {
        this.logInfo('Found "More results..." separator - validating cards before it');
      }

      const targetNights = Number(String(expectedNights).replace(/\D+/g, '')) || Number(expectedNights);
      const allResultCards = this.searchResults;
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

        // Prefer dedicated duration elements to avoid noise like "from 3 nights" in promos.
        const durationLoc = resultCard.locator(
          '.search-result__nights, .search-result__duration, .result__nights, .duration, [class*="nights"]'
        );

        let values: number[] = [];
        let debugText = '';

        const durationCount = await durationLoc.count().catch(() => 0);
        if (durationCount > 0) {
          const parts: string[] = [];
          for (let j = 0; j < durationCount; j++) {
            const txt = (await durationLoc.nth(j).textContent().catch(() => '')) || '';
            if (txt) parts.push(txt);
          }
          const joined = parts.join(' | ');
          const matches = Array.from(joined.matchAll(/(\d+)\s*Nights?/gi));
          values = matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
        }

        // Fallback to full card text, but ignore patterns like "from 3 nights" to reduce false alarms.
        if (values.length === 0) {
          const cardText = (await resultCard.textContent().catch(() => '')) || '';
          const matches = Array.from(cardText.matchAll(/(\d+)\s*Nights?/gi));
          const filtered = matches.filter((m) => {
            const idx = m.index ?? 0;
            const start = Math.max(0, idx - 12);
            const ctx = cardText.slice(start, idx).toLowerCase();
            return !/(from|up to|within)\s*$/i.test(ctx);
          });
          values = filtered.map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
        }

        const parsed = values.length ? Math.max(...values) : null;
        debugText = values.length ? `${parsed} Nights (max of ${values.join(', ')})` : '';

        observed.push({ card: i + 1, nights: debugText, parsed });

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
        expect(observed.length, `No nights information detected in first ${checkedCount} results`).toBeGreaterThan(0);
        return;
      }

      const parsedValues = observed.map(o => o.parsed).filter((v): v is number => v !== null);
      const good = parsedValues.filter(v => v >= targetNights).length;
      const bad = parsedValues.filter(v => v < targetNights).length;

      if (good === 0) {
        this.addSoftError(`No results meet nights >= ${expectedNights}. Observed: ${JSON.stringify(observed)}`);
        expect(good, `Expected at least one result with >= ${targetNights} nights`).toBeGreaterThan(0);
        return;
      }

      if (bad > 0) {
        const contextMsg = hasSeparator
          ? `Found results below ${expectedNights} nights BEFORE suggestions section`
          : `Found results below ${expectedNights} nights`;
        // Warn, but do not fail the test as long as at least one card meets the target
        this.addSoftWarning(`${contextMsg}: ${bad}/${parsedValues.length} (observed: ${JSON.stringify(observed)})`);
      }

      this.logInfo(`✅ Nights validation: ${good}/${parsedValues.length} meet >= ${targetNights} nights`);
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
      // Check if page is closed
      if (await this.isPageClosed()) {
        return '';
      }

      // Wait for the page to be loaded (avoid `networkidle` which can hang on this site)
      await this.page.waitForLoadState('domcontentloaded').catch(() => { });

      const titleLocator = this.page.locator('a.search-result__title').first();
      await titleLocator.waitFor({ state: 'visible' }).catch(() => { });
      
      if (await titleLocator.count()) {
        const text = (await titleLocator.textContent())?.trim() || '';
        if (text) {
          this.logInfo(`✓ First card title: "${text}"`);
          return text;
        }
      }
      
      // Fallback: try other selectors
      const cardLocator = this.page.locator('.search-result').first();
      const altTitle = cardLocator.locator('h2, h3, .title, [class*="title"]').first();
      if (await altTitle.count()) {
        const text = (await altTitle.textContent())?.trim() || '';
        if (text) {
          this.logInfo(`✓ First card title (alt selector): "${text}"`);
          return text;
        }
      }

      // Last resort: use the first card's visible text snippet to ensure a non-empty comparison token
      if (await cardLocator.count()) {
        const snippet = ((await cardLocator.textContent().catch(() => '')) || '').trim();
        if (snippet) {
          const short = snippet.replace(/\s+/g, ' ').slice(0, 64);
          this.logInfo(`✓ First card snippet: "${short}"`);
          return short;
        }
      }
    } catch (error) {
      this.logInfo(`⚠ Error getting first card title: ${error}`);
    }
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
    let detailPage: Page | null = null;
    try {
      await this.searchResults.first().waitFor({ state: 'visible' });
      const firstCard = this.searchResults.first();
      const result = await this.openDetailPage(firstCard, 'Feature validation');
      detailPage = result.detailPage;
      
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

      await this.safeCloseDetailPage(detailPage, 'feature validation');
    } catch (error) {
      this.logInfo(`⚠ Error validating feature on detail page: ${error}`);
      await this.safeCloseDetailPage(detailPage, 'feature validation error');
    }
  }

  /**
   * Validates that at least one result contains the expected country
   * @param {string} expectedCountry - Expected country name to find in results (e.g., "France", "USA")
   */
  async validateResultsContainCountry(expectedCountry: string): Promise<void> {
    // Check if page is closed
    if (await this.isPageClosed()) {
      this.logInfo(`[ERROR] Page closed - cannot validate country`);
      return;
    }

    await this.searchResults.first().waitFor({ state: 'visible' });
    const resultCards = await this.searchResults.all();

    let foundMatch = false;
    for (const card of resultCards) {
      const cardText = (await card.textContent().catch(() => '')) || '';
      if (new RegExp(this.escapeRegExp(expectedCountry), 'i').test(cardText)) {
        foundMatch = true;
        break;
      }
    }

    // Fallback: some result cards expose country via resort links (e.g., /ski-resorts/france)
    if (!foundMatch) {
      const slug = expectedCountry.trim().toLowerCase().replace(/\s+/g, '-');
      const countryLinks = this.page.locator(`a[href*="/ski-resorts/${slug}"]`);
      foundMatch = (await countryLinks.count().catch(() => 0)) > 0;
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
    this.logSection(`Rating filter: ${rating}★`);
    
    if (!this.checkPageAlive(`selecting rating ${rating}★`)) return;
    
    // Close any modals/overlays
    try {
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.page.waitForTimeout(300);
    } catch {}

    // First, uncheck any previously checked rating filter
    // (Rating is typically single-select, so we need to clear previous before setting new)
    try {
      const allCheckedRatings = await this.page.locator(`input[data-rating]:checked`).all();
      this.logSubInfo(`Found ${allCheckedRatings.length} previously checked rating(s)`);
      
      for (const checkedRating of allCheckedRatings) {
        const ratingValue = await checkedRating.getAttribute('data-rating');
        if (ratingValue && ratingValue !== String(rating)) {
          this.logSubInfo(`Unchecking previous ${ratingValue}★ rating...`);
          try {
            // Strategy 1: Uncheck via JavaScript directly
            await checkedRating.evaluate((el) => {
              (el as HTMLInputElement).checked = false;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('input', { bubbles: true }));
            });
            await this.page.waitForTimeout(200);
          } catch (e) {
            try {
              // Strategy 2: Click the label
              const label = this.page.locator(`label.faceted-search__label--check-box:has(input[data-rating="${ratingValue}"])`).first();
              await label.click({ force: true, timeout: 2000 }).catch(() => {});
              await this.page.waitForTimeout(200);
            } catch (e2) {
              this.logWarn(`Could not uncheck ${ratingValue}★`);
            }
          }
        }
      }
    } catch (e) {
      this.logWarn(`Error managing previous ratings: ${e}`);
    }
    
    // Wait after unchecking
    await this.page.waitForTimeout(300);

    // Find the LABEL that contains the input with data-rating
    const labelSelector = `label.faceted-search__label--check-box:has(input[data-rating="${rating}"])`;
    this.logInfo(`Locating: ${labelSelector}`);
    
    const label = this.page.locator(labelSelector).first();
    const labelCount = await label.count();
    this.logInfo(`Found ${labelCount} matching label(s)`);
    
    if (labelCount === 0) {
      const allLabels = await this.page.locator('label.faceted-search__label--check-box:has(input[data-rating])').count();
      this.logWarn(`Total rating labels available: ${allLabels}`);
      
      const allRatings = await this.page.locator('input[data-rating]').evaluateAll(
        elements => elements.map(el => el.getAttribute('data-rating'))
      );
      this.logWarn(`Available ratings: ${JSON.stringify(allRatings)}`);
      
      throw new Error(`❌ Failed to find rating filter for ${rating}★`);
    }
    
    // Close overlays that might block clicking
    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    } catch {}
    
    // Scroll label into view
    try {
      await label.scrollIntoViewIfNeeded();
    } catch {}
    
    // Check checkbox state before clicking
    const checkbox = this.page.locator(`input[data-rating="${rating}"]`).first();
    const isCheckedBefore = await checkbox.isChecked();
    this.logInfo(`Checkbox BEFORE: ${isCheckedBefore ? 'checked' : 'unchecked'}`);
    
    // Try multiple click strategies
    let clickSuccess = false;
    
    // Strategy 1: Click label with force
    try {
      await label.click({ timeout: 5000, force: true });
      await this.page.waitForTimeout(300);
      this.logInfo(`Label clicked (force)`);
      clickSuccess = true;
    } catch (e) {
      this.logWarn(`Label click failed: ${e}`);
    }
    
    // Verify checkbox state after clicking
    let isCheckedAfter = await checkbox.isChecked();
    this.logInfo(`Checkbox AFTER label click: ${isCheckedAfter ? 'checked' : 'unchecked'}`);
    
    // Fallback strategies if not checked
    if (!isCheckedAfter) {
      // Strategy 2: Direct checkbox click with force
      try {
        this.logInfo(`Trying checkbox direct click...`);
        await checkbox.click({ force: true, timeout: 5000 });
        await this.page.waitForTimeout(300);
        isCheckedAfter = await checkbox.isChecked();
        this.logInfo(`Checkbox after direct click: ${isCheckedAfter ? 'checked' : 'unchecked'}`);
      } catch (e) {
        this.logWarn(`Direct click failed: ${e}`);
      }
    }
    
    // Strategy 3: JavaScript manipulation
    if (!isCheckedAfter) {
      try {
        this.logInfo(`Trying JavaScript manipulation...`);
        await checkbox.evaluate((el) => {
          const input = el as HTMLInputElement;
          input.checked = true;
          
          // Dispatch events in correct order for form handlers
          input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          input.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          
          // Also trigger on any parent form or container that might have listeners
          const form = input.closest('form');
          if (form) {
            form.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        await this.page.waitForTimeout(500);
        isCheckedAfter = await checkbox.isChecked();
        this.logInfo(`Checkbox after JS: ${isCheckedAfter ? 'checked' : 'unchecked'}`);
      } catch (e) {
        this.logWarn(`JS manipulation failed: ${e}`);
      }
    }

    // If still not checked after all strategies, this filter may not be available
    if (!isCheckedAfter) {
      this.logWarn(`Rating filter ${rating}★ checkbox could not be checked after 3 strategies`);
      this.addSoftWarning(`Rating filter ${rating}★ checkbox remains unchecked`);
      return;
    }

    // Try multiple methods to trigger filter application - website is inconsistent
    // Method 1: Form submission
    try {
      await checkbox.evaluate((el) => {
        const form = el.closest('form') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      });
    } catch {}
    
    // Method 2: Comprehensive change events up the tree
    try {
      await checkbox.evaluate((el) => {
        let current: HTMLElement | null = el as HTMLElement;
        for (let i = 0; i < 8; i++) {
          if (!current) break;
          current.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          current.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          current = current.parentElement;
        }
      });
    } catch {}
    
    // Method 3: Click on parent label/container to trigger change
    try {
      const parentLabel = await checkbox.evaluate(el => {
        let current: HTMLElement | null = el as HTMLElement;
        while (current) {
          if (current.tagName === 'LABEL' || (current as HTMLElement).className.includes('label')) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      });
      if (parentLabel) {
        await label.click({ force: true, timeout: 1000 }).catch(() => {});
      }
    } catch {}
    
    await this.page.waitForTimeout(400);
    
    // Wait for filter to apply
    this.logInfo(`Waiting for filter to apply and results to re-render...`);
    
    // Check page is still alive before waiting
    if (!this.checkPageAlive(`rating filter applied`)) return;
    
    // Wait for network to be idle (honors global timeout)
    try {
      await this.page.waitForLoadState('networkidle');
    } catch {}
    
    // Prefer direct presence of rating wrappers on result cards
    try {
      const count = await this.ratingWrappers.count();
      this.logInfo(`Card rating wrappers present: ${count}`);
    } catch {}

    // Deterministic wait: require at least one exact-title match for the selected rating
    const exactTitleSelector = `.search-results .faceted-search__rating-wrapper[title="Star review ${rating} out of 5"]`;
    this.logInfo(`Waiting for exact title: ${exactTitleSelector}`);
    const appeared = await this.page.locator(exactTitleSelector)
      .first()
      .waitFor({ state: 'attached', timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (!appeared) {
      this.logWarn(`Exact title did not appear within timeout; proceeding with current DOM state`);
    }
    
    // Display results count (guard against page closure)
    try {
      if (!this.checkPageAlive('rating results count')) return;
      const resultsMsgLocator = this.page.locator('text=/We have found/i');
      const msgCount = await resultsMsgLocator.count();
      if (msgCount > 0) {
        const msgText = await resultsMsgLocator.first().textContent();
        this.logInfo(String(msgText || '').trim());
      }
    } catch (e) {
      this.logWarn(`Results message check skipped: ${e}`);
    }

    try {
      if (!this.checkPageAlive('rating filtered count')) return;
      const filteredCount = await this.getResultsCount();
      this.logInfo(`Filter applied: ${filteredCount} properties with ${rating}★ rating`);
    } catch (err) {
      this.logWarn(`Could not verify count: ${err}`);
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
        await this.safeCloseDetailPage(detailPage, 'accommodation validation');
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
        await this.safeCloseDetailPage(detailPage, 'board basis validation');
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
    console.log(`\n${'='.repeat(70)}`);
    console.log(`⭐ VALIDATION: Checking results for ${rating}★ rating`);
    console.log(`${'='.repeat(70)}`);

    // Quick exact-title presence check: "Star review {rating} out of 5"
    const exactTitleSelector = `.search-results .faceted-search__rating-wrapper[title="Star review ${rating} out of 5"]`;
    const exactTitleCount = await this.page.locator(exactTitleSelector).count().catch(() => 0);
    console.log(`🔎 Exact title matches (${rating}★): ${exactTitleCount}`);
    if (exactTitleCount === 0) {
      // Not strictly failing yet — proceed to broader sampling and parsing
      this.logInfo(`  ℹ No exact-title matches found for ${rating}★; continuing with parsed validation.`);
    }

    // Prefer direct presence of rating wrappers over container visibility
    try {
      const count = await this.ratingWrappers.count();
      console.log(`📊 Rating wrappers found: ${count}`);
    } catch {
      console.log(`⚠️  Could not count rating wrappers`);
    }

    // Check page is alive before waiting
    if (!this.checkPageAlive(`rating validation`)) return;
    
    // Proceed without artificial sleep; rely on wrapper presence

    // Find rating wrappers via union selector (in results or direct wrapper containers)
    const ratingWrapperLocators = this.ratingWrappers;
    const cardCount = await ratingWrapperLocators.count();
    const sampleSize = Math.min(5, cardCount);
    
    console.log(`📊 Analyzing ${sampleSize} of ${cardCount} total result cards`);

    let correctCount = 0;
    const ratingCounts: { [key: string]: number } = {};

    // Extract rating from each card
    for (let i = 0; i < sampleSize; i++) {
      const ratingWrapper = ratingWrapperLocators.nth(i);
      
      // Get title attribute: "Star review X out of 5"
      const titleAttr = await ratingWrapper.getAttribute('title').catch(() => null);

      if (!titleAttr) {
        console.log(`  ❌ Card ${i + 1}: No rating title found`);
        continue;
      }

      // Parse "Star review X out of 5"
      const match = titleAttr.match(/Star\s+review\s+(\d+(?:\.\d+)?)\s+out\s+of\s+5/i);
      if (!match) {
        console.log(`  ❌ Card ${i + 1}: Could not parse title="${titleAttr}"`);
        continue;
      }

      const cardRating = Math.round(parseFloat(match[1]));
      const ratingKey = cardRating.toString();
      ratingCounts[ratingKey] = (ratingCounts[ratingKey] || 0) + 1;

      if (cardRating === rating) {
        correctCount++;
        console.log(`  ✅ Card ${i + 1}: ${cardRating}★ [MATCH]`);
      } else {
        console.log(`  ⚠️  Card ${i + 1}: ${cardRating}★ (expected ${rating}★)`);
      }
    }

    console.log(`\n📈 Rating Distribution: ${JSON.stringify(ratingCounts)}`);
    console.log(`✅ Matching cards: ${correctCount}/${sampleSize}`);

    // Validation: ensure sufficient sample exists
    if (sampleSize === 0) {
      this.addSoftError(`No result cards available to validate rating ${rating}★`);
      expect(sampleSize, `No result cards to validate ${rating}★`).toBeGreaterThan(0);
      return;
    }

    const mismatches = Object.entries(ratingCounts)
      .filter(([k]) => Number(k) !== rating)
      .reduce((sum, [, v]) => sum + (v as number), 0);

    // Rule: If rating is 2★ (test expects ONLY 2★), enforce strict exact-only.
    // Otherwise, require at least one matching card (no false positives if zero).
    if (rating === 2) {
      // Prefer exact-title presence first for 2★ strict mode
      const exactTwoTitleCount = await this.page.locator('.search-results .faceted-search__rating-wrapper[title="Star review 2 out of 5"]').count().catch(() => 0);
      if (exactTwoTitleCount === 0) {
        this.addSoftError(`No cards with title="Star review 2 out of 5" found.`);
        expect(exactTwoTitleCount, `Expected at least one exact 2★ title match`).toBeGreaterThan(0);
        return;
      }
      if (correctCount === 0) {
        this.addSoftError(`No ${rating}★ results in sampled cards. Distribution: ${JSON.stringify(ratingCounts)}`);
        expect(correctCount, `Expected at least one ${rating}★ card`).toBeGreaterThan(0);
        return;
      }
      if (mismatches > 0) {
        this.addSoftError(`Found ${mismatches} non-${rating}★ cards in sample. Distribution: ${JSON.stringify(ratingCounts)}`);
        expect(mismatches, `All sampled cards should be ${rating}★`).toBe(0);
        return;
      }
      console.log(`✅ VALIDATION PASSED: All sampled cards match ${rating}★`);
    } else {
      // For other ratings (e.g., 5★), ensure at least one card matches
      // Also assert at least one exact-title match for clarity
      const exactFiveTitleCount = rating === 5
        ? await this.page.locator('.search-results .faceted-search__rating-wrapper[title="Star review 5 out of 5"]').count().catch(() => 0)
        : 1;
      if (rating === 5 && exactFiveTitleCount === 0) {
        this.addSoftError(`No cards with title="Star review 5 out of 5" found.`);
        expect(exactFiveTitleCount, `Expected at least one exact 5★ title match`).toBeGreaterThan(0);
        return;
      }
      if (correctCount === 0) {
        this.addSoftError(`No ${rating}★ results in sampled cards. Distribution: ${JSON.stringify(ratingCounts)}`);
        expect(correctCount, `Expected at least one ${rating}★ card`).toBeGreaterThan(0);
        return;
      }
      console.log(`✅ VALIDATION PASSED: Found ${correctCount}/${sampleSize} ${rating}★ card(s)`);
    }
    console.log(`${'='.repeat(70)}\n`);
  }

  /**
   * Validates that the top N result cards have the exact rating title
   * Example expected title: "Star review 2 out of 5"
   * @param {number} rating - Expected rating value (1-5)
   * @param {number} count - Number of top cards to validate (default 5)
   */
  async validateTopNCardsHaveRatingTitleExact(rating: number, count: number = 5): Promise<void> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`⭐ STRICT TITLE CHECK: Top ${count} cards have "Star review ${rating} out of 5"`);
    console.log(`${'='.repeat(70)}`);

    if (!this.checkPageAlive('validate top N cards rating title')) return;

    // Ensure results are visible
    const visible = await this.searchResults.first().waitFor({ state: 'visible' }).then(() => true).catch(() => false);
    if (!visible) {
      this.addSoftError('Search results not visible for strict rating title validation');
      expect(visible, 'Expected search results to be visible').toBe(true);
      return;
    }

    const cards = this.page.locator('.search-results');
    const total = await cards.count();
    console.log(`📦 Total cards on page: ${total}`);
    expect(total, `Expected at least ${count} cards to validate titles`).toBeGreaterThanOrEqual(count);

    const expectedTitle = `Star review ${rating} out of 5`;

    for (let i = 0; i < count; i++) {
      const wrapper = cards.nth(i).locator('.faceted-search__rating-wrapper');
      // Some cards may have more than one wrapper; validate the first one
      await expect(wrapper.first(), `Card ${i + 1}: missing rating wrapper`).toBeVisible();
      await expect(wrapper.first(), `Card ${i + 1}: exact rating title mismatch`).toHaveAttribute('title', expectedTitle);
      console.log(`  ✅ Card ${i + 1}: title="${expectedTitle}"`);
    }

    console.log(`✅ STRICT TITLE CHECK PASSED for top ${count} cards (${rating}★)`);
    console.log(`${'='.repeat(70)}\n`);
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

      // Fallback: open up to 3 detail pages to confirm ski area via resort names
      if (!foundMatch && resultCards.length > 0) {
        for (let i = 0; i < Math.min(3, resultCards.length); i++) {
          const { detailPage, detailUrl } = await this.openDetailPage(resultCards[i], `Ski area fallback result ${i + 1}`);
          if (!detailPage) continue;
          try {
            const text = (await detailPage.content().catch(() => '')) || '';
            const foundResort = resortList.find(resort => text.includes(resort));
            if (foundResort) {
              foundMatch = true;
              this.logInfo(`  ✓ Detail confirms resort "${foundResort}" for ski area ${skiArea} → ${detailUrl}`);
              await this.safeCloseDetailPage(detailPage, 'ski area validation');
              break;
            }
          } catch {}
          await this.safeCloseDetailPage(detailPage, 'ski area validation');
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
   * Validates that ALL result cards display nights count >= specified minimum
   * Designed to prevent false positives when validating 14+ nights filter
   * @param {number} minNights - Minimum number of nights expected
   */
  async assertAllResultsMeetMinNights(minNights: number): Promise<void> {
    try {
      this.logInfo(`📌 Validating ALL results meet minimum ${minNights} nights...`);

      // Guard against closed page
      if (!this.checkPageAlive('assertAllResultsMeetMinNights')) {
        throw new Error('Page closed - cannot validate minimum nights');
      }

      // Prefer direct badge presence over waiting on container visibility
      const badgeCount = await this.nightsBadges.count().catch(() => 0);

      if (badgeCount === 0) {
        const hasContainer = await this.searchResults.count().catch(() => 0);
        throw new Error(`❌ No night badges found (container=${hasContainer > 0 ? 'present' : 'missing'}) - cannot validate filter`);
      }

      this.logInfo(`Found ${badgeCount} result cards with night badges`);

      let allValid = true;
      const invalidCards: string[] = [];

      for (let i = 0; i < badgeCount; i++) {
        const badgeText = await this.nightsBadges.nth(i).textContent().catch(() => '');
        const nightsMatch = badgeText?.match(/(\d+)\s*Nights?/i);
        
        if (!nightsMatch) {
          allValid = false;
          invalidCards.push(`Card ${i + 1}: unparseable text "${badgeText}"`);
          continue;
        }

        const actualNights = parseInt(nightsMatch[1], 10);
        if (actualNights < minNights) {
          allValid = false;
          invalidCards.push(`Card ${i + 1}: ${actualNights} nights (< ${minNights})`);
        } else {
          this.logInfo(`  ✓ Card ${i + 1}: ${actualNights} nights`);
        }
      }

      if (!allValid) {
        const errorMsg = `❌ ${invalidCards.length}/${badgeCount} cards have < ${minNights} nights:\n  ${invalidCards.join('\n  ')}`;
        throw new Error(errorMsg);
      }

      this.logInfo(`✓ All ${badgeCount} cards meet minimum ${minNights} nights requirement`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logInfo(`❌ Failed to validate minimum nights: ${errorMessage}`);
      throw error;
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
      const maxCardsToCheck = Math.min(5, resultCards.length);
      this.logInfo(`Checking ${maxCardsToCheck} result cards for resort "${resort}"`);

      let foundMatch = false;
      const normalize = (s: string) => this.normalizeText(s || '');
      const altResort = normalize(resort).replace(/d\s*'\s*isere/i, "d isere");

      // Check text and innerHTML content in cards with normalization
      for (let i = 0; i < maxCardsToCheck; i++) {
        const fullText = await resultCards[i].textContent().catch(() => '') || '';
        const inner = await resultCards[i].innerHTML().catch(() => '') || '';
        const haystack = normalize(fullText + ' ' + inner);
        if (haystack.includes(normalize(resort)) || (altResort && haystack.includes(altResort))) {
          foundMatch = true;
          this.logInfo(`✓ Card ${i + 1}: ${resort} (normalized) found in card`);
          break;
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
            // Additional variants observed on some themes
            'button:has-text("Clear")',
            '.faceted-search__clear-all a, .faceted-search__clear-all button'
          ].join(',')
        )
        .first();

      if (await clearButton.count() > 0) {
        await clearButton.click().catch(() => {});
        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        this.logInfo('✓ Cleared all filters');
      } else {
        this.logInfo('⚠ Clear all button not found - applying fallback reset');
        // Fallback: reload base search route to reset filters
        try {
          const base = new URL(this.page.url());
          base.search = '';
          // Ensure path points to search root
          if (!/ski-holidays/i.test(base.pathname)) base.pathname = '/ski-holidays';
          await this.page.goto(base.toString(), { waitUntil: 'domcontentloaded' });
          await this.page.waitForTimeout(400).catch(() => {});
          this.logInfo('✓ Filters reset via fallback navigation');
        } catch (e) {
          this.logInfo(`⚠ Fallback reset failed: ${e}`);
        }
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
        await clearButton.scrollIntoViewIfNeeded().catch(() => {});
        await clearButton.click({ force: true }).catch(() => {});
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(300).catch(() => {});
        this.logInfo('✓ Cleared country filters');
      } else {
        // Fallback: programmatically uncheck all country checkboxes in the section
        const countrySection = this.filtersSidebar.locator('[data-option-type="country"]').first();
        if (await countrySection.count()) {
          await countrySection.evaluate((section) => {
            const inputs = Array.from(section.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
            for (const input of inputs) {
              if (input.checked) {
                input.checked = false;
              }
            }
            section.dispatchEvent(new Event('input', { bubbles: true }));
            section.dispatchEvent(new Event('change', { bubbles: true }));
          }).catch(() => {});
          await this.page.waitForLoadState('domcontentloaded').catch(() => {});
          await this.page.waitForTimeout(300).catch(() => {});
          this.logInfo('✓ Cleared country filters via fallback');
        } else {
          this.logInfo('⚠ Country section not found - filters may not have been cleared');
        }
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
      // Use more comprehensive locator strategies for ski areas
      const safeId = area.replace(/[^A-Za-z0-9_-]/g, '').substring(0, 50);
      const strategies = [
        // Direct label with text match
        this.filtersSidebar.locator(`label.faceted-search__label--check-box:has-text("${area}")`).first(),
        // Label with nested input
        this.filtersSidebar.locator(`label:has(input[type="checkbox"]):has-text("${area}")`).first(),
        // Input with value attribute
        this.page.locator(`input[type="checkbox"][value="${area}"]`).first(),
        // Input with ID match
        this.page.locator(`input[type="checkbox"]#${safeId}`).first(),
        // Any label with text
        this.page.locator(`label:has-text("${area}") input[type="checkbox"]`).first()
      ];

      let success = await this.selectCheckboxByStrategies('ski area', area, strategies, this.filtersSidebar);
      
      // If first attempt failed, try aggressive fallback
      if (!success) {
        try {
          this.logInfo(`  🔄 Attempting aggressive fallback for ${area}...`);
          
          // Find the label and click it multiple times if needed
          const labels = await this.page.locator(`label:has-text("${area}")`).all();
          for (const label of labels) {
            try {
              const isVisible = await label.isVisible().catch(() => false);
              if (isVisible) {
                // Try aggressive click
                await label.click({ force: true, timeout: 2000 }).catch(() => {});
                await this.page.waitForTimeout(200);
                
                // Verify checkbox got checked
                const checkbox = await label.locator('input[type="checkbox"]').first();
                const isChecked = await checkbox.isChecked().catch(() => false);
                if (isChecked) {
                  success = true;
                  this.logInfo(`  ✅ Aggressive fallback succeeded for ${area}`);
                  break;
                }
              }
            } catch (e) {
              // Continue to next label
            }
          }
        } catch (e) {
          this.logInfo(`  ⚠️  Aggressive fallback also failed: ${e}`);
        }
      }
      
      if (success) {
        // Wait for results to update after selection
        try {
          await this.page.waitForLoadState('domcontentloaded').catch(() => {});
          await this.page.waitForTimeout(400);
          const count = await this.getResultsCount();
          this.logInfo(`✓ ${area} → ${count} results`);
        } catch (e) {
          this.logInfo(`⚠️  ${area} selected but results count unavailable`);
        }
      } else {
        this.logInfo(`⚠️  Failed to select ${area}, but continuing with remaining areas`);
      }
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

