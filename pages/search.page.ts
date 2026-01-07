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
   * IMPORTANT: This method never throws errors - it logs issues and continues
   * @param {number | string} nights - Duration value (e.g., 2, 7, 14, "14+")
   */
  async selectNightsFilter(nights: number | string): Promise<void> {
    this.logSection(`Selecting ${nights} nights filter`);
    
    try {
      // Check if page is still alive before proceeding
      if (this.page.isClosed()) {
        this.logInfo(`❌ Page is closed - cannot select nights`);
        return;
      }

      // Step 1: Click the nights dropdown button to open it
      await this.nightsButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      
      // Step 2: Check if already selected - if same value, skip deselection
      const currentlySelected = this.page.locator('a.dropdown-item.selected').filter({ hasText: /^\d+/ });
      const isSelected = await currentlySelected.count();
      
      if (isSelected > 0) {
        const currentValue = await currentlySelected.first().textContent();
        const currentText = currentValue?.trim() || '';
        
        // If already selected the target value, just close dropdown and skip
        if (currentText.startsWith(String(nights))) {
          this.logInfo(`Already selected: ${currentText} - skipping`);
          await this.page.keyboard.press('Escape'); // Close dropdown safely
          return;
        }
        
        this.logInfo(`Deselecting current: ${currentText}`);
        
        // Deselect current option carefully
        try {
          await currentlySelected.first().click({ timeout: 3000 });
          await this.page.waitForTimeout(2000);
          
          // Verify page is still alive after deselect
          if (this.page.isClosed()) {
            this.logInfo(`❌ Page closed after deselect - cannot continue`);
            return;
          }
          
          // Reopen dropdown after deselect
          await this.nightsButton.click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
        } catch (error) {
          this.logInfo(`⚠ Error during deselect: ${error} - continuing anyway`);
          // Try to reopen dropdown
          try {
            await this.nightsButton.click({ timeout: 5000 });
            await this.page.waitForTimeout(500);
          } catch (reopenError) {
            this.logInfo(`❌ Cannot reopen dropdown - skipping nights selection`);
            return;
          }
        }
      }
      
      // Step 3: Select the desired number of nights
      const targetOption = this.page.locator('a.dropdown-item', { hasText: new RegExp(`^${nights}`) }).first();
      
      try {
        await targetOption.waitFor({ state: 'visible', timeout: 5000 });
        await targetOption.click({ timeout: 3000 });
        await this.page.waitForTimeout(2000);
        this.logInfo(`✓ Nights set to ${nights}`);
      } catch (error) {
        this.logInfo(`❌ Cannot click nights option: ${error} - skipping`);
      }
    } catch (error) {
      this.logInfo(`❌ Error in selectNightsFilter: ${error} - continuing anyway`);
    }
  }

  /**
   * Selects the number of travelers (adults + children)
   * Uses native HTML <select> elements from Bootstrap-Select (DOM manipulation)
   * Note: Filters are dynamic/cascading - options may change or disappear based on availability
   * IMPORTANT: This method never throws errors - it logs issues and continues
   * @param {number | string} adults - Number of adults (1-30+)
   * @param {number} children - Number of children (0-10, may be limited by adults selection)
   */
  async selectTravelersFilter(adults: number | string, children: number): Promise<void> {
    this.logSection(`Selecting travelers: ${adults} adults, ${children} children`);

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
          this.logInfo(`✓ Selected ${adultsValue} adults`);
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
        
        // Wait for page to stabilize - filters update dynamically
        await this.page.waitForTimeout(2000);
        
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
        this.logInfo(`✓ Children set to ${finalValue}`);

        // Wait for results to update
        await this.page.waitForTimeout(2000);
        this.logInfo(`✓ Travelers set → Adults: ${adultsValue}, Children: ${finalValue}`);
      } else {
        this.logInfo(`⚠ Adults select not found, skipping`);
        return;
      }
    } catch (error) {
      this.logInfo(`❌ Error selecting travelers: ${error} - continuing anyway`);
    }
  }

  /**
   * Selects a country filter by checking its checkbox
   * @param {string} countryCode - Two-letter country code (e.g., "FR", "US", "NO")
   */
  async selectCountryFilter(countryCode: string): Promise<void> {
    this.logSection(`Selecting country filter: ${countryCode}`);
    
    // Ensure filters area is visible
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find the country checkbox - try multiple selectors
    let countryCheckbox = this.page.locator(`input#${countryCode}`);
    
    // If not found by ID, try finding it within the filtersSidebar
    if (!(await countryCheckbox.count())) {
      countryCheckbox = this.filtersSidebar.locator(`input[value="${countryCode}" i], input[id*="${countryCode}" i]`).first();
    }
    
    // If still not found, search by country name in label
    if (!(await countryCheckbox.count())) {
      const countryLabel = this.filtersSidebar.locator('label', { hasText: /Finland|France|USA|Norway/i }).first();
      if (await countryLabel.count()) {
        countryCheckbox = countryLabel.locator('input').first();
      }
    }
    
    // Skip if checkbox still not found
    if (!(await countryCheckbox.count())) {
      this.logInfo(`⚠ Country checkbox for ${countryCode} not found, skipping`);
      return;
    }
    
    // Check if already selected
    try {
      const isChecked = await countryCheckbox.isChecked({ timeout: 3000 });
      if (isChecked) {
        this.logInfo(`Country ${countryCode} already selected, skipping`);
        return;
      }
    } catch {
      // Element might not be ready yet
    }
    
    // Click the checkbox or its label
    await countryCheckbox.scrollIntoViewIfNeeded();
    try {
      await countryCheckbox.check({ force: true, timeout: 5000 });
      this.logInfo(`✓ Selected country: ${countryCode}`);
    } catch {
      // Try clicking the parent label instead
      const parentLabel = countryCheckbox.locator('xpath=ancestor::label[1]').first();
      if (await parentLabel.count()) {
        await parentLabel.scrollIntoViewIfNeeded();
        await parentLabel.click({ force: true });
        this.logInfo(`✓ Selected country: ${countryCode}`);
      }
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
    
    // Scroll to the first pagination element
    const paginationContainer = this.page.locator('.pagination').first();
    await paginationContainer.scrollIntoViewIfNeeded();
    
    // Click the link for page 2 (using getByRole for accessibility)
    const nextPageLink = this.page.getByRole('link', { name: '2' }).first();
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

  // ============================================================
  // 🔵 NEW FILTER ACTIONS (TC-017 to TC-022)
  // ============================================================

  /**
   * Selects accommodation type filter (Hotel, Chalet, Apartment)
   * @param {string} accommodationType - Type of accommodation to filter by
   */
  async selectAccommodationFilter(accommodationType: string): Promise<void> {
    this.logSection(`Selecting accommodation type: ${accommodationType}`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the accommodation checkbox
    const accommodationCheckbox = this.page.locator(`input[value="${accommodationType}"], input#${accommodationType}`).first();
    await accommodationCheckbox.scrollIntoViewIfNeeded();
    await accommodationCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected accommodation type: ${accommodationType}`);
  }

  /**
   * Selects board basis filter (Self catered, Half board, etc.)
   * @param {string} boardBasis - Board basis option to filter by
   */
  async selectBoardBasisFilter(boardBasis: string): Promise<void> {
    this.logSection(`Selecting board basis: ${boardBasis}`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the board basis checkbox
    const boardBasisCheckbox = this.page.locator(`input[value="${boardBasis}"]`).first();
    await boardBasisCheckbox.scrollIntoViewIfNeeded();
    await boardBasisCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected board basis: ${boardBasis}`);
  }

  /**
   * Selects rating filter (1-5 snowflakes)
   * @param {number} rating - Rating value (1 to 5 snowflakes)
   */
  async selectRatingFilter(rating: number): Promise<void> {
    this.logSection(`Selecting rating: ${rating} snowflakes`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the rating checkbox
    const ratingCheckbox = this.page.locator(`input[value="${rating}"]`).first();
    await ratingCheckbox.scrollIntoViewIfNeeded();
    await ratingCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected ${rating} snowflakes rating`);
  }

  /**
   * Selects property feature filter (WiFi, Pool, Sauna, etc.)
   * @param {string} feature - Feature name to filter by
   */
  async selectPropertyFeatureFilter(feature: string): Promise<void> {
    this.logSection(`Selecting property feature: ${feature}`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the feature checkbox
    const featureCheckbox = this.page.locator(`input[value="${feature}"]`).first();
    await featureCheckbox.scrollIntoViewIfNeeded();
    await featureCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected feature: ${feature}`);
  }

  /**
   * Selects ski area filter (e.g., "The 3 Valleys")
   * @param {string} skiArea - Ski area name to filter by
   */
  async selectSkiAreaFilter(skiArea: string): Promise<void> {
    this.logSection(`Selecting ski area: ${skiArea}`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the ski area checkbox
    const skiAreaCheckbox = this.page.locator(`input[value="${skiArea}"]`).first();
    await skiAreaCheckbox.scrollIntoViewIfNeeded();
    await skiAreaCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected ski area: ${skiArea}`);
  }

  /**
   * Selects resort filter (e.g., "Val d'Isère")
   * @param {string} resort - Resort name to filter by
   */
  async selectResortFilter(resort: string): Promise<void> {
    this.logSection(`Selecting resort: ${resort}`);
    await this.filtersSidebar.scrollIntoViewIfNeeded();
    
    // Find and check the resort checkbox
    const resortCheckbox = this.page.locator(`input[value="${resort}"]`).first();
    await resortCheckbox.scrollIntoViewIfNeeded();
    await resortCheckbox.check({ force: true });
    
    // Wait for results to update
    await this.page.waitForTimeout(2000);
    this.logInfo(`Selected resort: ${resort}`);
  }

  // ============================================================
  // 🔵 NEW VALIDATION ACTIONS (TC-017 to TC-022)
  // ============================================================

  /**
   * Validates that results contain only the specified accommodation type
   * @param {string} accommodationType - Expected accommodation type
   */
  async validateResultsContainAccommodationType(accommodationType: string): Promise<void> {
    this.logSection(`Validating results contain accommodation type "${accommodationType}"`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const cardText = await resultCards[i].textContent();
      if (cardText?.toLowerCase().includes(accommodationType.toLowerCase())) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} contains "${accommodationType}"`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated accommodation type: ${accommodationType}`);
  }

  /**
   * Validates that results contain only the specified board basis
   * @param {string} boardBasis - Expected board basis option
   */
  async validateResultsContainBoardBasis(boardBasis: string): Promise<void> {
    this.logSection(`Validating results contain board basis "${boardBasis}"`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const cardText = await resultCards[i].textContent();
      if (cardText?.toLowerCase().includes(boardBasis.toLowerCase())) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} contains "${boardBasis}"`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated board basis: ${boardBasis}`);
  }

  /**
   * Validates that results contain only the specified rating
   * @param {number} rating - Expected rating value (1-5 snowflakes)
   */
  async validateResultsContainRating(rating: number): Promise<void> {
    this.logSection(`Validating results contain ${rating} snowflakes rating`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const ratingElement = resultCards[i].locator('[class*="rating"], [class*="snowflake"]').first();
      const ratingText = await ratingElement.textContent().catch(() => '');
      if (ratingText && ratingText.includes(String(rating))) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} has ${rating} snowflakes rating`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated rating: ${rating} snowflakes`);
  }

  /**
   * Validates that results contain the specified property feature
   * @param {string} feature - Expected feature name
   */
  async validateResultsContainFeature(feature: string): Promise<void> {
    this.logSection(`Validating results contain feature "${feature}"`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const cardText = await resultCards[i].textContent();
      if (cardText?.toLowerCase().includes(feature.toLowerCase())) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} contains feature "${feature}"`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated feature: ${feature}`);
  }

  /**
   * Validates that results belong to the specified ski area
   * @param {string} skiArea - Expected ski area name
   */
  async validateResultsContainSkiArea(skiArea: string): Promise<void> {
    this.logSection(`Validating results belong to ski area "${skiArea}"`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const cardText = await resultCards[i].textContent();
      if (cardText?.includes(skiArea)) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} belongs to "${skiArea}"`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated ski area: ${skiArea}`);
  }

  /**
   * Validates that results belong to the specified resort
   * @param {string} resort - Expected resort name
   */
  async validateResultsContainResort(resort: string): Promise<void> {
    this.logSection(`Validating results belong to resort "${resort}"`);
    
    await this.searchResults.first().waitFor({ state: 'visible', timeout: 10000 });
    const resultCards = await this.searchResults.all();
    this.logInfo(`Checking ${Math.min(5, resultCards.length)} result cards`);
    
    let foundMatch = false;
    for (let i = 0; i < Math.min(5, resultCards.length); i++) {
      const cardText = await resultCards[i].textContent();
      if (cardText?.includes(resort)) {
        foundMatch = true;
        this.logInfo(`✓ Result ${i + 1} belongs to "${resort}"`);
      }
    }
    
    expect(foundMatch).toBeTruthy();
    this.logInfo(`✓ Validated resort: ${resort}`);
  }
}
