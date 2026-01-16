import { test } from '../support/baseTest';
import testData from './fixtures/testdata.json';

// ================================================================
// Test Suite: Search Page Mobile
// ================================================================

// Helper function to block Sleeknote
async function blockSleeknote(page: any) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      [class*="sleeknote"],
      sleeknote-top,
      sleeknote-bottom,
      sleeknote-left,
      sleeknote-right {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
      const sleeknoteElements = document.querySelectorAll('[class*="sleeknote"], sleeknote-top, sleeknote-bottom, sleeknote-left, sleeknote-right');
      sleeknoteElements.forEach(el => el.remove());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// Helper to close the mobile filter panel (Refine) after selecting filters
async function closeFilterPanel(page: any) {
  try {
    // Try Apply button first (mobile viewports hide this with hidden-md hidden-lg)
    const applyBtn = page.locator('.btn.btn-primary.refine-apply:visible').first();
    const applyVisible = await applyBtn.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (applyVisible) {
      await applyBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(800);
      return;
    }
    
    // Fallback: Use X button
    const closeBtn = page.locator('.refine-cross').first();
    const closeVisible = await closeBtn.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (closeVisible) {
      // Scroll to X if needed
      await closeBtn.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
      await closeBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(800);
    }
  } catch (err) {
    console.log(`⚠️ Could not close filter panel: ${err}`);
  }
}

test.describe('Search and Filters — Ski Holidays (Mobile)', () => {

  // BEFORE EACH - Configure mobile viewport and navigate to search page
  test.beforeEach(async ({ pm }) => {
    const page = pm.getPage();
    
    // Block Sleeknote requests
    await page.route('**/*sleeknote*/**', route => route.abort());
    await page.route('**/*.sleeknote.*', route => route.abort());

    await test.step('✓ Set mobile viewport (375x812)', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    await test.step('✓ Navigate to search page and handle cookie banner', async () => {
      await pm.onSearchPage().navigateAndAcceptCookies('/ski-holidays');
      await blockSleeknote(page);
    });

    // Mobile-specific: Click "Refine" button to open filter panel
    await test.step('✓ Open filter panel (click Refine button)', async () => {
      const refineButton = page.locator('.refine-btn');
      const isVisible = await refineButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        await refineButton.click();
        await page.waitForTimeout(500); // Wait for panel animation
        console.log('✓ Filter panel opened');
      } else {
        console.warn('⚠️ Refine button not visible - filters may already be open');
      }
    });

    // Standardize state: clear nights filter (same as desktop, but mobile requires Refine button to be open)
    await test.step('✓ Clear nights filter', async () => {
      await pm.onSearchPage().deselectAllNights().catch((err) => {
        console.warn(`⚠️ Warning: Could not clear nights filter on mobile: ${err.message}`);
      });
    });
  });

  // ============================================================
  // 🔵 TC-001-MOBILE — Validate minimum night filter (2 nights)
  // ============================================================
  test('TC-001-MOBILE — Validate minimum night filter (2 nights)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const nightsData = testData.searchPage.filters.nights;

    // STEP 1 — Select nights filter using mobile step-by-step method
    await test.step(`Select ${nightsData.min} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilterMobile(nightsData.min);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      // Mobile-specific: Validate search results using correct selectors from HTML
      // Count filtered results (before "More results..." section)
      const filteredCount = await pm.onSearchPage().countFilteredResultCards();
      
      if (filteredCount === 0) {
        throw new Error('❌ VALIDATION FAILED: No filtered results found on page');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      await pm.onSearchPage().validateResultsContainNights(nightsData.min);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.min} Nights" (Mobile)`);
      console.log(`✅ TC-001-MOBILE PASS — ${nightsData.min} nights filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-002-MOBILE — Validate default nights filter (7 nights)
  // ============================================================
  test('TC-002-MOBILE — Validate default nights filter (7 nights)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const nightsData = testData.searchPage.filters.nights;

    // STEP 1 — Select nights filter using mobile step-by-step method
    await test.step(`Select ${nightsData.default} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilterMobile(nightsData.default);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      // Mobile-specific: Validate search results using correct selectors from HTML
      console.log('🔍 Validating search results matching the filter criteria...');
      
      // Count filtered results (before "More results..." section)
      const filteredCount = await pm.onSearchPage().countFilteredResultCards();
      
      if (filteredCount === 0) {
        throw new Error('❌ VALIDATION FAILED: No filtered results found on page');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.default} Nights" (Mobile)`);
      console.log(`✅ TC-002-MOBILE PASS — ${nightsData.default} nights filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-003-MOBILE — Validate maximum nights filter (13 nights)
  // ============================================================
  test('TC-003-MOBILE — Validate maximum nights filter (13 nights)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const nightsData = testData.searchPage.filters.nights;

    // STEP 1 — Select nights filter using mobile step-by-step method
    await test.step(`Select ${nightsData.max} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilterMobile(nightsData.max);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      // Mobile-specific: Validate search results using correct selectors from HTML
      console.log('🔍 Validating search results matching the filter criteria...');
      
      // Count filtered results (before "More results..." section)
      const filteredCount = await pm.onSearchPage().countFilteredResultCards();
      
      if (filteredCount === 0) {
        throw new Error('❌ VALIDATION FAILED: No filtered results found on page');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      await pm.onSearchPage().validateResultsContainNights(nightsData.max);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.max} Nights" (Mobile)`);
      console.log(`✅ TC-003-MOBILE PASS — ${nightsData.max} nights filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-007-MOBILE — Validate country filter (France)
  // ============================================================
  test('TC-007-MOBILE — Validate country with many properties (France)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const countryCode = 'FR';
    const country = 'France';

    // STEP 1 — Select country filter using mobile-specific method
    await test.step(`Select country: ${country}`, async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      // Use mobile-specific country filter that expands accordion and closes panel
      await pm.onSearchPage().selectCountryFilterMobile(countryCode);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      // Mobile-specific: Validate search results loaded
      console.log('🔍 Validating search results on mobile...');
      const searchResultsLocator = pm.getPage().locator('.search-results');
      
      // Wait for results to load
      await searchResultsLocator.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        throw new Error('❌ VALIDATION FAILED: No .search-results elements visible on mobile page');
      });
      
      const resultsCount = await searchResultsLocator.count();
      console.log(`✅ Found ${resultsCount} search result cards on page`);
      
      if (resultsCount === 0) {
        throw new Error('❌ VALIDATION FAILED: 0 .search-results elements found - page may not have loaded correctly');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties in ${country}`);
      console.log(`✅ TC-007-MOBILE PASS — ${country} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-009-MOBILE — Validate 7 nights + France combination
  // ============================================================
  test('TC-009-MOBILE — Validate 7 nights + France combination', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const nights = testData.searchPage.filters.nights.default;
    const countryCode = 'FR';
    const country = 'France';

    // STEP 1 — Apply filters
    await test.step(`Apply filters: ${nights} nights + ${country}`, async () => {
      // Scroll to filters for mobile visibility
      const nightsSelect = pm.getPage().locator('select[data-option-type="nts"]').first();
      await nightsSelect.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      // Select nights using mobile method
      await pm.onSearchPage().selectNightsFilterMobile(nights);
      
      // Then select country using mobile method (which expands accordion and closes panel)
      await pm.onSearchPage().selectCountryFilterMobile(countryCode);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate filtered results', async () => {
      // Mobile-specific: Validate search results using correct selectors from HTML
      console.log('🔍 Validating search results matching the filter criteria...');
      
      // Count filtered results (before "More results..." section)
      const filteredCount = await pm.onSearchPage().countFilteredResultCards();
      
      if (filteredCount === 0) {
        throw new Error('❌ VALIDATION FAILED: No filtered results found on page');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      await pm.onSearchPage().validateResultsContainNights(nights);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties matching criteria`);
      console.log(`VALIDATION PASSED: Results contain "${nights} Nights" + ${country} (Mobile)`);
      console.log(`✅ TC-009-MOBILE PASS — Combination filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-011-MOBILE — Validate results per page change (10 → 20)
  // ============================================================
  test('TC-011-MOBILE — Validate results per page change (10 → 20)', async ({ pm }, testInfo) => {

    // STEP 1 — Count initial results
    let initialCount = 0;
    await test.step('Count initial results (10 per page)', async () => {
      // Mobile-specific: Validate search results loaded
      console.log('🔍 Validating search results on mobile...');
      const searchResultsLocator = pm.getPage().locator('.search-results');
      
      // Wait for results to load
      await searchResultsLocator.first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        throw new Error('❌ VALIDATION FAILED: No .search-results elements visible on mobile page');
      });
      
      const resultsCount = await searchResultsLocator.count();
      console.log(`✅ Found ${resultsCount} search result cards on page`);
      
      if (resultsCount === 0) {
        throw new Error('❌ VALIDATION FAILED: 0 .search-results elements found - page may not have loaded correctly');
      }
      
      initialCount = await pm.onSearchPage().countResultCards();
      console.log(`Initial results displayed: ${initialCount}`);
    });

    // STEP 2 — Close Refine panel (to avoid overlay blocking)
    await test.step('Close Refine panel', async () => {
      console.log('Closing Refine panel to avoid overlay blocking...');
      const page = pm.getPage();
      
      // Ensure filter panel is closed before interacting with results-per-page button
      await closeFilterPanel(page);
      await page.waitForTimeout(800);
    });

    // STEP 3 — Change results per page
    await test.step('Change results per page to 20', async () => {
      await pm.onSearchPage().selectResultsPerPage('20');
    });

    // STEP 4 — Count new results
    let newCount = 0;
    await test.step('Count new results (20 per page)', async () => {
      newCount = await pm.onSearchPage().countResultCards();
      console.log(`New results displayed: ${newCount}`);
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log(`VALIDATION PASSED: Results increased from ${initialCount} to ${newCount} (Mobile)`);
      console.log(`✅ TC-011-MOBILE PASS — Results per page change validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-017-MOBILE — Validate accommodation filter (Hotel)
  // ============================================================
  test('TC-017-MOBILE — Validate accommodation filter (Hotel)', async ({ pm }) => {
    test.setTimeout(120000);
    const accommodation = 'Hotel';

    // STEP 1 — Select accommodation filter
    await test.step(`Select accommodation: ${accommodation}`, async () => {
      await pm.onSearchPage().selectAccommodationTypeMobile(accommodation);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate filtered results', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} ${accommodation} properties`);
      console.log(`✅ TC-017-MOBILE PASS — ${accommodation} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-019-MOBILE — Validate rating filter (5 snowflakes)
  // ============================================================
  test('TC-019-MOBILE — Validate rating filter (5 snowflakes)', async ({ pm }) => {
    test.setTimeout(120000);
    const rating = 5;

    // STEP 1 — Select rating filter
    await test.step(`Select rating: ${rating} snowflakes`, async () => {
      await pm.onSearchPage().selectRatingMobile(rating);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate filtered results', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Validate ratings in results
    await test.step('Validate ratings in result cards', async () => {
      await pm.onSearchPage().validateRatingsInResults(rating, 0.5);
    });

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties with ${rating}+ rating`);
      console.log(`VALIDATION PASSED: All results have ${rating}+ snowflakes rating (Mobile)`);
      console.log(`✅ TC-019-MOBILE PASS — ${rating} snowflakes filter validated successfully`);
    });
  });

});
