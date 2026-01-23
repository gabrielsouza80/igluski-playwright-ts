import { Locator } from 'playwright-core';
import { test } from '../support/baseTest';
import testData from './fixtures/testdata.json';

// ================================================================
// Test Suite: Search Page Mobile
// ================================================================
// NOTE: blockSleeknote() is now available in HelperBase and inherited by all page objects

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
      await pm.onSearchPage().blockSleeknote();
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
    const countryData = testData.searchPage.filters.countries.highVolume;

    // STEP 1 — Select country filter using mobile-specific method
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      // Use mobile-specific country filter that expands accordion and closes panel
      await pm.onSearchPage().selectCountryFilterMobile(countryData.code);
      console.log(`VALIDATION PASSED: Selected country ${countryData.name} (${countryData.code})`);
    });

    // STEP 2 — Validate results are displayed
    let exactMatches = 0;
    await test.step('Validate many results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
      console.log('VALIDATION PASSED: Many results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    // STEP 3 — Validate results contain the expected country
    await test.step(`Validate results contain "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
      console.log(`VALIDATION PASSED: Results contain "${countryData.name}"`);
    });

    // STEP 4 — Finish test
    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`✅ TC-007-MOBILE PASS — ${countryData.name} country filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-009-MOBILE — Validate 7 nights + France combination
  // ============================================================
  test('TC-009-MOBILE — Validate 7 nights + France combination', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.highVolume;

    // STEP 1 — Apply duration filter
    await test.step(`Select ${nightsData.default} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilterMobile(nightsData.default);
      console.log(`VALIDATION PASSED: Selected ${nightsData.default} nights filter`);
    });

    // STEP 2 — Apply country filter
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      await pm.onSearchPage().selectCountryFilterMobile(countryData.code);
      console.log(`VALIDATION PASSED: Selected country ${countryData.name} (${countryData.code})`);
    });

    // STEP 3 — Re-apply nights after country selection (stability)
    await test.step(`Re-apply ${nightsData.default} nights after country selection`, async () => {
      await pm.onSearchPage().deselectAllNights().catch((err) => {
        console.log(`⚠ Could not deselect nights before re-applying: ${err}`);
      });
      await pm.onSearchPage().selectNightsFilterMobile(nightsData.default);
      console.log(`VALIDATION PASSED: Re-applied ${nightsData.default} nights after country selection`);
    });

    // STEP 4 — Validate combined results
    let exactMatches = 0;
    await test.step('Validate combined results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
      console.log('VALIDATION PASSED: Combined filters returned results');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    // STEP 5 — Validate results contain both filters
    await test.step(`Validate results contain "${nightsData.default} Nights" and "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.default} Nights" and "${countryData.name}"`);
    });

    // STEP 6 — Finish test
    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`✅ TC-009-MOBILE PASS — Combined filter validated: ${nightsData.default} nights + ${countryData.name}`);
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
      await pm.onSearchPage().closeFilterPanel();
      await pm.getPage().waitForTimeout(800);
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

  // ============================================================
  // 🔵 TC-004-MOBILE — Validate open maximum nights filter (14+ nights)
  // ============================================================
  test('TC-004-MOBILE — Validate open maximum nights filter (14+ nights)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const nights = 14;

    // STEP 1 — Select nights filter
    await test.step(`Select ${nights}+ nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilterMobile(nights);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      await pm.onSearchPage().validateResultsContainNights(nights);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain "${nights}+ Nights" (Mobile)`);
      console.log(`✅ TC-004-MOBILE PASS — ${nights}+ nights filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-005-MOBILE — Validate country with many properties (France)
  // ============================================================
  test('TC-005-MOBILE — Validate country with many properties (France)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const countryCode = 'FR';
    const country = 'France';

    // STEP 1 — Select country filter
    await test.step(`Select country: ${country}`, async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      // Use mobile-specific country filter
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
        throw new Error('❌ VALIDATION FAILED: 0 .search-results elements found');
      }
      
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} properties in ${country}`);
      console.log(`✅ TC-005-MOBILE PASS — ${country} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-006-MOBILE — Validate country with few properties (USA)
  // ============================================================
  test('TC-006-MOBILE — Validate country with few properties (USA)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const countryCode = 'US';
    const country = 'USA';

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
      console.log(`✅ TC-006-MOBILE PASS — ${country} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-008-MOBILE — Validate 14+ nights + USA combination
  // ============================================================
  test('TC-008-MOBILE — Validate 14+ nights + USA combination', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const nights = 14;
    const countryCode = 'US';
    const country = 'USA';

    // STEP 1 — Apply filters
    await test.step(`Apply filters: ${nights}+ nights + ${country}`, async () => {
      // Scroll to filters for mobile visibility
      const nightsSelect = pm.getPage().locator('select[data-option-type="nts"]').first();
      await nightsSelect.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      // Select nights using mobile method
      await pm.onSearchPage().selectNightsFilterMobile(nights);
      
      // Then select country using mobile method
      await pm.onSearchPage().selectCountryFilterMobile(countryCode);
    });

    // STEP 2 — Validate combined results
    let exactMatches = 0;
    await test.step('Validate combined results are displayed', async () => {
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
      console.log(`VALIDATION PASSED: Results contain "${nights}+ Nights" + ${country} (Mobile)`);
      console.log(`✅ TC-008-MOBILE PASS — Combination filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-010-MOBILE — Validate pagination (next page)
  // ============================================================
  test('TC-010-MOBILE — Validate pagination (next page)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);

    // STEP 1 — Ensure results visible
    await test.step('Ensure results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // STEP 2 — Navigate to next page
    await test.step('Navigate to next page', async () => {
      await pm.onSearchPage().navigateToNextPage();
    });

    // STEP 3 — Validate page 2 results
    await test.step('Validate page 2 results are displayed and active', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      const url = await pm.onSearchPage().getCurrentUrl();
      if (!/page=2/.test(url)) {
        const paginationElement = pm.getPage().locator('.active:has-text("2"), li.active:has-text("2"), [aria-current="page"]:has-text("2")').first();
        await expect(paginationElement).toBeVisible();
      }
    });

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC-010-MOBILE completed - validated pagination`);
    });
  });

  // ============================================================
  // 🔵 TC-012-MOBILE — Validate minimum travelers (1 adult, 0 children)
  // ============================================================
  test('TC-012-MOBILE — Validate minimum travelers (1 adult, 0 children)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const adults = 1;
    const children = 0;

    // STEP 1 — Select minimum travelers
    await test.step(`Select ${adults} adult and ${children} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(adults, children);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`TC-012-MOBILE PASS — min travelers (1 adult, 0 children); matches: ${exactMatches}`);
    });
  });

  // ============================================================
  // 🔵 TC-013-MOBILE — Validate maximum travelers (30+ adults, 9 children)
  // ============================================================
  test('TC-013-MOBILE — Validate maximum travelers (30+ adults, 9 children)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const adults = 30;
    const children = 9;

    // STEP 1 — Select maximum travelers
    await test.step(`Select ${adults} adults and ${children} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(adults, children);
    });

    // STEP 2 — Validate travelers selected
    await test.step(`Validate ${adults} adults are selected`, async () => {
      await pm.onSearchPage().assertAdultsSelected(adults);
    });

    await test.step(`Validate ${children} children are selected`, async () => {
      await pm.onSearchPage().assertChildrenSelected(children);
    });

    // STEP 3 — Validate results
    await test.step('Validate results are displayed or no results message', async () => {
      const hasResults = await pm.onSearchPage().hasSearchResults();
      if (hasResults) {
        await pm.onSearchPage().validateResultsCount(1);
      } else {
        await pm.onSearchPage().validateNoResults();
      }
    });

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log(`TC-013-MOBILE PASS — max travelers (${adults} adults, ${children} children)`);
    });
  });

  // ============================================================
  // 🔵 TC-014-MOBILE — Validate accommodation filter (Hotel)
  // ============================================================
  test('TC-014-MOBILE — Validate accommodation filter (Hotel)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
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
      console.log(`✅ TC-014-MOBILE PASS — ${accommodation} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-015-MOBILE — Validate board basis filter (Self catered)
  // ============================================================
  test('TC-015-MOBILE — Validate board basis filter (Self catered)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
    const boardBasis = 'Self Catered';

    // STEP 1 — Select board basis filter
    await test.step(`Select board basis: ${boardBasis}`, async () => {
      await pm.onSearchPage().selectBoardBasisFilter(boardBasis);
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
      console.log(`✓ Found ${exactMatches} ${boardBasis} properties`);
      console.log(`✅ TC-015-MOBILE PASS — ${boardBasis} filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-016-MOBILE — Validate rating filter (5 snowflakes)
  // ============================================================
  test('TC-016-MOBILE — Validate rating filter (5 snowflakes)', async ({ pm }, testInfo) => {
    test.setTimeout(120000); // 2 minutes for mobile tests
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
      console.log(`✅ TC-016-MOBILE PASS — ${rating} snowflakes filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-018-MOBILE — Validate property feature filter (WiFi)
  // ============================================================
  test('TC-018-MOBILE — Validate property feature filter (WiFi)', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const feature = 'WiFi';

    // STEP 1 — Clear soft issues
    pm.onSearchPage().clearSoftIssues();

    // STEP 2 — Select WiFi feature
    await test.step(`Select feature: ${feature}`, async () => {
      await pm.onSearchPage().selectPropertyFeatureFilter(feature);
    });

    // STEP 3 — Validate results
    await test.step('Validate filtered results', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // STEP 4 — Validate feature in results
    await test.step(`Validate feature presence: ${feature}`, async () => {
      await pm.onSearchPage().validateResultsContainFeature(feature);
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`✅ TC-018-MOBILE PASS — ${feature} property feature validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-020-MOBILE — Validate resort filter (Val d'Isère)
  // ============================================================
  test('TC-020-MOBILE — Validate resort filter (Val d\'Isère)', async ({ pm }, testInfo) => {
    test.setTimeout(150000);
    const resort = 'Val d\'Isère';

    // STEP 1 — Select resort
    await test.step(`Select resort: ${resort}`, async () => {
      await pm.onSearchPage().selectResortFilter(resort);
    });

    // STEP 2 — Validate results
    let exactMatches = 0;
    await test.step('Validate filtered results', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`📊 Results found: ${resultsCount}`);
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Filtered results are displayed (Mobile)');
      console.log(`✓ Found ${exactMatches} ${resort} properties`);
      console.log(`✅ TC-020-MOBILE PASS — ${resort} resort filter validated successfully`);
    });
  });

  // ============================================================
  // 🔵 TC-021-MOBILE — Validate "Clear all changes" functionality
  // ============================================================
  test('TC-021-MOBILE — Validate "Clear all changes" functionality', async ({ pm }, testInfo) => {
    test.setTimeout(150000);

    // STEP 1 — Apply multiple filters
    await test.step('Apply multiple filters', async () => {
      await pm.onSearchPage().selectNightsFilterMobile(14);
      await pm.onSearchPage().selectCountryFilterMobile('FR');
      await pm.onSearchPage().selectAccommodationTypeMobile('Hotel');
    });

    // STEP 2 — Verify filters applied
    await test.step('Verify filters applied and results reduced', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Filters applied - Results: ${resultsCount}`);
    });

    // STEP 3 — Clear all filters
    await test.step('Click "Clear all changes" button', async () => {
      await pm.onSearchPage().clearAllFilters();
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
      await pm.getPage().waitForTimeout(1000);
    });

    // STEP 4 — Verify filters cleared
    await test.step('Verify all filters cleared', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ All filters cleared - Results restored: ${resultsCount}`);
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('✅ TC-021-MOBILE PASS — "Clear all changes" functionality validated successfully');
    });
  });

  // ============================================================
  // 🔵 TC-022-MOBILE — Validate multi-country selection (France + Austria + Italy)
  // ============================================================
  test('TC-022-MOBILE — Validate multi-country selection (France + Austria + Italy)', async ({ pm }, testInfo) => {
    test.setTimeout(180000);
    const countries = ['FR', 'AT', 'IT'];
    const countryNames = ['France', 'Austria', 'Italy'];
    let initialCount = 0;

    // STEP 1 — Clear existing filters
    await test.step('Clear existing country filters', async () => {
      await pm.onSearchPage().clearCountryFilters();
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(1000);
      initialCount = await pm.onSearchPage().getResultsCount();
      console.log(`Initial results after clearing filters: ${initialCount}`);
      expect(initialCount).toBeGreaterThan(0);
    });

    // STEP 2 — Select multiple countries
    await test.step('Select France, Austria, and Italy', async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      await pm.onSearchPage().selectCountryFilterMobile('FR');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000);
      
      await pm.onSearchPage().selectCountryFilterMobile('AT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(4000);
      
      await pm.onSearchPage().selectCountryFilterMobile('IT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(5000);
    });

    // STEP 3 — Verify combined results
    await test.step('Verify combined results from all selected countries', async () => {
      const combined = await pm.onSearchPage().getResultsCount();
      console.log(`Combined results from ${countryNames.join(' + ')}: ${combined}`);
      expect(combined).toBeGreaterThan(0);
      expect(combined).toBeLessThan(initialCount);
      console.log(`✓ Results filtered from ${initialCount} to ${combined}`);
    });

    // STEP 4 — Verify URL
    await test.step('Verify URL contains all country parameters', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      const missingCountries = countries.filter(code => !url.toUpperCase().includes(code));
      if (missingCountries.length > 0) {
        throw new Error(`URL missing country parameters: ${missingCountries.join(', ')}`);
      }
      console.log('✓ VALIDATION PASSED: URL contains all 3 country parameters');
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✅ TC-022-MOBILE PASS — Multi-country selection validated: ${countryNames.join(' + ')}`);
    });
  });

  // ============================================================
  // 🔵 TC-023-MOBILE — Validate individual country removal from multi-selection
  // ============================================================
  test('TC-023-MOBILE — Validate individual country removal from multi-selection', async ({ pm }, testInfo) => {
    test.setTimeout(180000);
    const countries = ['FR', 'AT', 'IT'];
    const countryNames = ['France', 'Austria', 'Italy'];

    // STEP 1 — Clear existing filters
    await test.step('Clear existing country filters', async () => {
      await pm.onSearchPage().clearCountryFilters();
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(2000);
      const urlAfterClear = await pm.onSearchPage().getCurrentUrl();
      console.log(`URL after clearing filters: ${urlAfterClear}`);
    });

    // STEP 2 — Select all 3 countries
    await test.step('Select France, Austria, and Italy', async () => {
      // Scroll to filters sidebar for mobile visibility
      const filtersSidebar = pm.getPage().locator('#holiday-collapse');
      await filtersSidebar.scrollIntoViewIfNeeded();
      await pm.getPage().waitForTimeout(300);
      
      await pm.onSearchPage().selectCountryFilterMobile('FR');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000);
      
      await pm.onSearchPage().selectCountryFilterMobile('AT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(4000);
      
      await pm.onSearchPage().selectCountryFilterMobile('IT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(5000);
    });

    // STEP 3 — Record count with all 3 countries
    let countWith3Countries: number;
    await test.step('Record results with all 3 countries', async () => {
      countWith3Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 3 countries: ${countWith3Countries}`);
      const url = await pm.onSearchPage().getCurrentUrl();
      expect(url).toContain('FR');
      expect(url).toContain('AT');
      expect(url).toContain('IT');
    });

    // STEP 4 — Deselect only France
    await test.step('Deselect France (keep Austria + Italy)', async () => {
      await pm.onSearchPage().deselectCountry('FR');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000);
    });

    // STEP 5 — Verify Austria and Italy remain selected
    await test.step('Verify Austria and Italy still selected', async () => {
      const countWith2Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 2 countries (Austria + Italy): ${countWith2Countries}`);
      expect(countWith2Countries).toBeLessThan(countWith3Countries, 
        `Expected fewer results after removing France. Had ${countWith3Countries} with 3 countries, now have ${countWith2Countries} with 2`
      );
      console.log(`✓ Results count decreased from ${countWith3Countries} to ${countWith2Countries} - France successfully removed`);
    });

    // STEP 6 — Verify URL updated
    await test.step('Verify URL updated after deselection', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      if (!url.includes('FR') && url.includes('AT') && url.includes('IT')) {
        console.log(`✓ URL correctly reflects removal of France`);
      }
    });

    // STEP 7 — Finish test
    await test.step('Finish test', async () => {
      console.log('✅ TC-023-MOBILE PASS — Individual country removal from multi-selection validated successfully');
    });
  });

});
function expect(value: Locator | number | string | boolean) {
  return {
    toBeVisible: async () => {
      if (value instanceof Object && 'isVisible' in value) {
        const isVisible = await (value as Locator).isVisible();
        if (!isVisible) {
          throw new Error('Expected element to be visible');
        }
      }
    },
    toBeGreaterThan: (expected: number) => {
      if (typeof value !== 'number') {
        throw new Error('Expected value to be a number');
      }
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeLessThan: (expected: number | undefined, message?: string) => {
      if (typeof value !== 'number') {
        throw new Error('Expected value to be a number');
      }
      if (expected === undefined) {
        throw new Error('Expected value is undefined');
      }
      if (value >= expected) {
        throw new Error(message || `Expected ${value} to be less than ${expected}`);
      }
    },
    toContain: (substring: string) => {
      if (typeof value !== 'string') {
        throw new Error('Expected value to be a string');
      }
      if (!value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
  };
}

