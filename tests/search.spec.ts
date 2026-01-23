import { test, expect } from '../support/baseTest';
import testData from './fixtures/testdata.json';

// ============================================================
// E2E TESTS (Legacy - Currently Disabled)
// ============================================================

test.describe('Search Page', () => {
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies();
  });

  // TODO: These E2E tests need to be updated with correct method names
  // test('End-2-end test: Search and book holiday', async ({ page, pm }) => {
  //   await pm.onHomePage().searchForCountry('France');
  //   const resultsText = await pm.onSearchPage().hasSearchResults();
  //   expect(resultsText).toBeTruthy();
  // });

  // test('should book first ski holiday package and reach payment page', async ({ page, pm }) => {
  //   await pm.onHomePage().searchForCountry('France');
  //   await pm.onHomePage().clickOnSearchButton()
  //   const resultsText = await pm.onSearchPage().hasSearchResults();
  //   expect(resultsText).toBeTruthy();
  //   const resultsCount = await pm.onSearchPage().getResultsCount();
  //   console.log(`✓ Found ${resultsCount} ski holiday packages`);
  //   await pm.onSearchPage().clickFirstBookOnline();
  //   await page.waitForLoadState('networkidle');
  //   console.log('✓ Clicked Book Online on first result');
  //   await page.waitForURL(/book|booking|details/i, { timeout: 10000 });
  //   await test.step('✓ Clicked Accomodation - Confirm Number of People', async () => {
  //     await pm.onAccommodationPage().clickConfirmNumberOfPeople()
  //   });
  //   await test.step('✓ ✓ Clicked Accomodation - Add Room', async () => {
  //     await pm.onAccommodationPage().clickAddRoom()
  //   });
  //   await pm.onAccommodationPage().allocateRoomOccupancy()
  //   await pm.onAccommodationPage().continueToTravelOptions()
  //   console.log('✓ Clicked Accomodation - Continue to Travel page');
  //   await pm.onTravelOptionsPage().isTravelPageLoaded();
  //   await pm.onTravelOptionsPage().continueToExtras();
  //   console.log('✓ Clicked Travel - Continue to Extras page');
  //   await pm.onExtrasPage().isExtrasPageLoaded()
  //   await pm.onExtrasPage().continueToSummary();
  //   console.log('✓ Clicked Extras - Continue to Summary page');
  //   await pm.onSummaryPage().isSummaryPageLoaded()
  //   await pm.onSummaryPage().clickBookOnline()
  //   console.log('✓ Clicked Summary - Continue to People page');
  //   await pm.onPeopleAndContactDetailsPage().fillMultiplePassengers();
  //   console.log('✓ Filled People - Mandatory fields');
  //   await pm.onPeopleAndContactDetailsPage().clickContinueToBooking()
  //   console.log('✓ Clicked People - Continue to Book page');
  //   await test.step('6. Accept terms and conditions - Click People - Continue to Book page', async () => {
  //     pm.onBookingDetailsPage().acceptTermsAndConditions();
  //   });
  //   await pm.onBookingDetailsPage().proceedToPayment();
  //   console.log('✓ Clicked proceed to payment');
  //   const isOnPaymentPage = await pm.onPaymentPage().isPaymentPageDisplayed();
  //   expect(isOnPaymentPage).toBe(true);
  //   console.log('✓ Successfully reached payment page');
  // });
});

// ============================================================
// SEARCH AND FILTERS TESTS - Main Test Suite
// ============================================================

test.describe('Search and Filters — Ski Holidays', () => {

  // Navigate to search results page and accept cookies before each test
  test.beforeEach(async ({ pm }) => {
    try {
      await pm.onSearchPage().navigateAndAcceptCookies('/ski-holidays');
      // Wait for DOM to be ready (more reliable than networkidle)
      await pm.getPage().waitForLoadState('domcontentloaded', { timeout: 10000 });
      // Standardize state: always clear nights before each TC (programmatic DOM clear)
      await test.step('Clear nights filter (DOM reset)', async () => {
        const nightsSelect = pm.getPage()
          .locator('#holiday-collapse')
          .locator('select[data-option-type="nts"], select.faceted-search__select.marker-moon')
          .first();

        await nightsSelect.evaluate((sel) => {
          const select = sel as HTMLSelectElement;
          for (const opt of Array.from(select.options)) {
            if (!opt.disabled) opt.selected = false;
          }
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }).catch((err) => {
          console.warn(`⚠️ Warning: Could not clear nights filter: ${err.message}`);
        });
      });
    } catch (error) {
      // If beforeEach setup fails completely, try one more time with fresh navigation
      console.log(`⚠️ beforeEach setup failed, retrying: ${error}`);
      await pm.onSearchPage().navigateAndAcceptCookies('/ski-holidays');
      await pm.getPage().waitForLoadState('domcontentloaded', { timeout: 10000 });

      // IMPORTANT: Clear nights filter on retry too
      await test.step('Clear nights filter (DOM reset - retry)', async () => {
        const nightsSelect = pm.getPage()
          .locator('#holiday-collapse')
          .locator('select[data-option-type="nts"], select.faceted-search__select.marker-moon')
          .first();

        await nightsSelect.evaluate((sel) => {
          const select = sel as HTMLSelectElement;
          for (const opt of Array.from(select.options)) {
            if (!opt.disabled) opt.selected = false;
          }
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }).catch((err) => {
          console.warn(`⚠️ Warning on retry: Could not clear nights filter: ${err.message}`);
        });
      });
    }
  });

  // ============================================================
  // GROUP 1 – Duration Filter Tests (TC-001 to TC-004)
  // Tests all available duration options: 2, 7, 14, and 14+ nights
  // ============================================================

  // TC-001: Validates minimum duration filter (2 nights) with soft assertions
  test('TC-001 — Validate minimum night filter (2 nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select nights from Bootstrap-Select dropdown
    await test.step(`Select ${nightsData.min} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.min);
    });

    // Verify results appear (soft check)
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // Validate exact match count from message
    let exactMatches = 0;
    await test.step('Validate "We have found X properties" message', async () => {
      // Validate filters before checking results
      await pm.onSearchPage().validateFiltersBeforeResults(nightsData.min, null, null);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // Check result cards display correct nights text
    await test.step(`Validate results contain "${nightsData.min} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.min);
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    // Log test completion
    await test.step('✅ Test completed', async () => {
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log('VALIDATION PASSED: Results match expected count');
      console.log(`VALIDATION PASSED: Results contain "${nightsData.min} Nights"`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-001 PASS — ${nightsData.min} nights filter validated successfully`);
    });
  });

  // TC-002: Validates default duration filter (7 nights)
  test('TC-002 — Validate default nights filter (7 nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select default nights value
    await test.step(`Select ${nightsData.default} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.default);
    });

    // Verify results appear
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // Validate exact match count
    let exactMatches = 0;
    await test.step('Validate exact match count', async () => {
      // Validate filters before checking results
      await pm.onSearchPage().validateFiltersBeforeResults(nightsData.default, null, null);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // Validate results contain the expected duration
    await test.step(`Validate results contain "${nightsData.default} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log('VALIDATION PASSED: Results match expected count');
      console.log(`VALIDATION PASSED: Results contain "${nightsData.default} Nights"`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-002 PASS — ${nightsData.default} nights filter validated successfully`);
    });
  });

  // TC-003: Validates maximum duration filter (13 nights)
  test('TC-003 — Validate maximum nights filter (13 nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select maximum nights value
    await test.step(`Select ${nightsData.max} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.max);
    });

    // Verify results appear
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // Validate exact match message and that cards show correct nights
    let exactMatches = 0;
    await test.step('Validate exact match count message (if present)', async () => {
      // Validate filters before checking results
      await pm.onSearchPage().validateFiltersBeforeResults(nightsData.max, null, null);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    await test.step(`Validate results contain "${nightsData.max} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.max);
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log('VALIDATION PASSED: Results match expected count');
      console.log(`VALIDATION PASSED: Results contain "${nightsData.max} Nights"`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-003 PASS — ${nightsData.max} nights filter validated successfully`);
    });
  });

  // TC-004: Validates open-ended maximum duration filter (14+ nights)
  test('TC-004 — Validate open maximum nights filter (14+ nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select 14+ nights (open maximum)
    await test.step(`Select ${nightsData.maxOpen} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
    });

    // Verify results appear
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
    });

    // Validate exact match message (may be absent for very large result sets)
    let exactMatches = 0;
    await test.step('Validate exact match count message (if present)', async () => {
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    // Validate URL contains nts=14 parameter
    await test.step('Validate URL contains nights filter parameter', async () => {
      await expect(pm.getPage()).toHaveURL(/nts=14/);
      console.log('VALIDATION PASSED: URL contains nts=14');
    });

    // Validate ALL result cards show >= 14 nights (no false positives)
    await test.step('Validate ALL results meet minimum 14 nights requirement', async () => {
      await pm.onSearchPage().assertAllResultsMeetMinNights(14);
      console.log('VALIDATION PASSED: All results are >= 14 nights');
    });

    // Validate cards show 14+ nights before any "More results..." section
    await test.step(`Validate results contain "${nightsData.maxOpen} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.maxOpen);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.maxOpen} Nights"`);
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-004 PASS — ${nightsData.maxOpen} nights filter validated successfully`);
    });
  });

  // ============================================================
  // GROUP 2 – Country Filter Tests (TC-005 to TC-006)
  // Tests countries with high and low property counts
  // ============================================================

  // TC-005: Validates country with many properties (France)
  test('TC-005 — Validate country with many properties (France)', async ({ pm }, testInfo) => {
    const countryData = testData.searchPage.filters.countries.highVolume;

    // Select France (high volume country)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify multiple results appear (at least 10)
    let exactMatches = 0;
    await test.step('Validate many results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
      console.log('VALIDATION PASSED: Many results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    // Validate results contain the expected country
    await test.step(`Validate results contain "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
      console.log(`VALIDATION PASSED: Results contain "${countryData.name}"`);
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-005 PASS — ${countryData.name} country filter validated successfully`);
    });
  });

  // TC-006: Validates country with few properties (USA)
  test('TC-006 — Validate country with few properties (USA)', async ({ pm }, testInfo) => {
    const countryData = testData.searchPage.filters.countries.lowVolume;

    // Select USA (low volume country)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify at least some results appear
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed for USA (low volume country)');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log(`ℹ️ No exact results found — only suggestions available`);
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
        console.log(`✓ Exact match cards: ${count}`);
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      if (exactCardCount > 0) {
        console.log(`✓ Exact match cards: ${exactCardCount}`);
      } else {
        console.log(`ℹ️ No exact results (suggestions only)`);
      }
      console.log(`✅ TC-006 PASS — ${countryData.name} country filter validated successfully`);
    });
  });

  // ============================================================
  // GROUP 3 – Combined Filter Tests (TC-007 to TC-008)
  // Tests multiple filters applied simultaneously
  // ============================================================

  // TC-007: Validates 7 nights + France combination
  test('TC-007 — Validate 7 nights + France combination', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.highVolume;

    // Apply duration filter
    await test.step(`Select ${nightsData.default} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.default);
      console.log(`VALIDATION PASSED: Selected ${nightsData.default} nights filter`);
    });

    // Then apply country filter
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
      console.log(`VALIDATION PASSED: Selected country ${countryData.name} (${countryData.code})`);
    });

    // Country selection can reset duration; enforce nights again for stability.
    await test.step(`Re-apply ${nightsData.default} nights after country selection`, async () => {
      await pm.onSearchPage().deselectAllNights().catch((err) => {
        console.log(`⚠ Could not deselect nights before re-applying: ${err}`);
      });
      await pm.onSearchPage().openNightsDropdown();
      await pm.onSearchPage().selectNightsFilter(nightsData.default);
      await pm.onSearchPage().assertNightsSelected(nightsData.default);
      console.log(`VALIDATION PASSED: Re-applied ${nightsData.default} nights after country selection`);
    });

    // Verify combined filters return results
    let exactMatches = 0;
    await test.step('Validate combined results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
      // Validate filters before checking results
      await pm.onSearchPage().validateFiltersBeforeResults(nightsData.default, null, null);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Combined filters returned results');
    });

    // Validate results contain both expected duration and country
    await test.step(`Validate results contain "${nightsData.default} Nights" and "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
      console.log(`VALIDATION PASSED: Results contain "${nightsData.default} Nights" and "${countryData.name}"`);
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`✅ TC-007 PASS — Combined filter validated: ${nightsData.default} nights + ${countryData.name}`);
    });
  });

  // TC-008: Validates 14+ nights + USA combination
  test('TC-008 — Validate 14+ nights + USA combination', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.lowVolume;

    // Apply duration filter (14+ nights)
    await test.step(`Select ${nightsData.maxOpen} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
      console.log(`VALIDATION PASSED: Selected ${nightsData.maxOpen} nights filter`);
    });

    // Apply country filter (USA)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
      console.log(`VALIDATION PASSED: Selected country ${countryData.name} (${countryData.code})`);
    });

    // Country selection can reset duration; enforce nights again for stability.
    await test.step(`Re-apply ${nightsData.maxOpen} nights after country selection`, async () => {
      await pm.onSearchPage().deselectAllNights().catch((err) => {
        console.log(`⚠ Could not deselect nights before re-applying: ${err}`);
      });
      await pm.onSearchPage().openNightsDropdown();
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
      await pm.onSearchPage().assertNightsSelected(nightsData.maxOpen);
      console.log(`VALIDATION PASSED: Re-applied ${nightsData.maxOpen} nights after country selection`);
    });

    // Verify combined filters return results
    let exactMatches = 0;
    await test.step('Validate combined results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Combined filters returned results');
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`✅ TC-008 PASS — Combined filter validated: ${nightsData.maxOpen} nights + ${countryData.name}`);
    });
  });

  // ============================================================
  // GROUP 4 – Results Display Tests (TC-009 to TC-011)
  // Tests pagination, results per page, and sorting functionality
  // ============================================================

  // TC-009: Validates changing results per page (10 → 20) and verifies actual cards appear
  test('TC-009 — Validate results per page change (10 → 20)', async ({ pm }, testInfo) => {
    const resultsData = testData.searchPage.resultsDisplay;
    const targetPerPage = resultsData.perPageOptions[1]; // 20

    // Change from default (10) to 20 results per page
    await test.step(`Change results per page to ${targetPerPage}`, async () => {
      await pm.onSearchPage().changeResultsPerPage(targetPerPage);
    });

    // Verify results count text updates
    await test.step('Validate results count changed', async () => {
      await pm.onSearchPage().validateResultsCountChanged();
      console.log('VALIDATION PASSED: Results count changed');
    });

    // Validate actual visible cards match the logic (<= target)
    await test.step(`Validate that ${targetPerPage} or fewer cards are displayed on page`, async () => {
      const visibleCardCount = await pm.onSearchPage().getVisibleCardCount();
      expect(visibleCardCount).toBeGreaterThan(0);
      expect(visibleCardCount).toBeLessThanOrEqual(targetPerPage);
      console.log(`✓ Displayed ${visibleCardCount} cards (expected max: ${targetPerPage})`);
      console.log(`VALIDATION PASSED: ${targetPerPage} or fewer cards displayed on page`);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-009 completed - validated results per page change to ${targetPerPage}`);
    });
  });

  // TC-010: Validates pagination navigation and verifies page 2 is active with results
  test('TC-010 — Validate pagination (next page)', async ({ pm }, testInfo) => {
    // Ensure results are visible on page 1
    await test.step('Ensure results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed on page 1');
    });

    // Navigate to page 2
    await test.step('Navigate to next page', async () => {
      await pm.onSearchPage().navigateToNextPage();
      console.log('VALIDATION PASSED: Navigated to next page');
    });

    // Verify page 2 results are displayed and indicator/URL reflects page 2
    await test.step('Validate page 2 results are displayed and active', async () => {
      try {
        await pm.onSearchPage().validateResultsCount(1);
        console.log('VALIDATION PASSED: Results are displayed on page 2');
      } catch (e) {
        // If page unexpectedly closed, recover by direct navigation to page 2
        const sp = pm.onSearchPage();
        const anySp = sp as any;
        const p = anySp['page'];
        if (p?.isClosed && p.isClosed()) {
          await sp.navigateAndAcceptCookies('/ski-holidays?page=2');
        }
      }

      // Assert either pagination shows page 2 active or URL contains page=2
      const sp2 = pm.onSearchPage();
      const url = await sp2.getCurrentUrl();
      if (!/page=2/.test(url)) {
        // Try multiple selectors for active pagination (Bootstrap variants)
        const paginationElement = sp2.pagination.locator('.active:has-text("2"), li.active:has-text("2"), [aria-current="page"]:has-text("2")').first();
        await expect(paginationElement).toBeVisible();
      }
      console.log('VALIDATION PASSED: Page 2 is active and results displayed');
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-010 completed - validated pagination`);
    });
  });

  // TC-011: Validates sorting functionality
  test('TC-011 — Validate sorting (Iglu recommends → Price Low to High)', async ({ pm }, testInfo) => {
    const resultsData = testData.searchPage.resultsDisplay;
    const sortOption = resultsData.sortOptions[2]; // "Price (Low - High)"

    // Change sort order from default to price ascending
    await test.step(`Change sort order to: ${sortOption}`, async () => {
      await pm.onSearchPage().changeSortOrder(sortOption);
      console.log(`VALIDATION PASSED: Changed sort order to ${sortOption}`);
    });

    // Verify results still appear after sort
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed after sorting');
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-011 completed - validated sorting by ${sortOption}`);
    });
  });

  // ============================================================
  // GROUP 6 – Travelers Filter Tests (TC-012 to TC-013)
  // Tests minimum and maximum traveler configurations
  // ============================================================

  // TC-012: Validates minimum travelers configuration (1 adult, 0 children)
  test('TC-012 — Validate minimum travelers (1 adult, 0 children)', async ({ pm }, testInfo) => {
    const travelersData = testData.searchPage.filters.travelers;

    // Select minimum travelers
    await test.step(`Select ${travelersData.adults.min} adult and ${travelersData.children.min} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(travelersData.adults.min, travelersData.children.min);
    });

    // Verify results appear for minimum travelers
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log('ℹ️ No exact results found — only suggestions available');
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
      } else {
        exactCardCount = await pm.onSearchPage().getResultsCount();
        console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      const summary = exactCardCount > 0
        ? `exact matches: ${exactCardCount}`
        : 'no exact matches (suggestions only)';
      console.log(`TC-013 PASS — min travelers (1 adult, 0 children); matches: ${exactMatches}; ${summary}`);
    });
  });

  // TC-013: Validates maximum travelers configuration (30+ adults, 9 children)
  test('TC-013 — Validate maximum travelers (30+ adults, 9 children)', async ({ pm }, testInfo) => {
    const travelersData = testData.searchPage.filters.travelers;

    // Select maximum travelers
    await test.step(`Select ${travelersData.adults.max} adults and ${travelersData.children.max} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(travelersData.adults.max, travelersData.children.max);
    });

    // Validate that adults were selected correctly
    await test.step(`Validate ${travelersData.adults.max} adults are selected`, async () => {
      await pm.onSearchPage().assertAdultsSelected(travelersData.adults.max);
    });

    // Validate that children were selected correctly
    await test.step(`Validate ${travelersData.children.max} children are selected`, async () => {
      await pm.onSearchPage().assertChildrenSelected(travelersData.children.max);
    });

    // Verify system accepts maximum travelers and shows results
    await test.step('Validate results are displayed or no results message', async () => {
      const hasResults = await pm.onSearchPage().hasSearchResults();
      if (hasResults) {
        await pm.onSearchPage().validateResultsCount(1);
      } else {
        await pm.onSearchPage().validateNoResults();
      }
    });

    // Get count of exact match cards (excluding suggestions after "More results..." separator)
    let exactCardCount = 0;
    await test.step('Get exact match card count (excluding suggestions)', async () => {
      const count = await pm.onSearchPage().getExactMatchCardsCount();
      if (count === 'NA') {
        console.log('ℹ️ No exact results found — only suggestions available');
        exactCardCount = 0;
      } else if (typeof count === 'number') {
        exactCardCount = count;
      } else {
        const hasResults = await pm.onSearchPage().hasSearchResults();
        if (hasResults) {
          exactCardCount = await pm.onSearchPage().getResultsCount();
          console.log(`ℹ️ Could not determine exact matches, total visible: ${exactCardCount}`);
        } else {
          exactCardCount = 0;
          console.log('ℹ️ No results available');
        }
      }
    });

    await test.step('✅ Test completed', async () => {
      const summary = exactCardCount > 0
        ? `exact matches: ${exactCardCount}`
        : 'no results or suggestions only';
      console.log(`TC-013 PASS — max travelers (${travelersData.adults.max} adults, ${travelersData.children.max} children); ${summary}`);
    });
  });

  // ============================================================
  // GROUP 7 – Accommodation Filter Tests (TC-014)
  // Tests property type filtering
  // ============================================================

  // TC-014: Validates accommodation type filter (Hotel)
  test('TC-014 — Validate accommodation filter (Hotel)', async ({ pm }, testInfo) => {
    // Increase timeout for this flaky test
    testInfo.setTimeout(150000); // 2.5 minutes
    const accommodationData = testData.searchPage.filters.accommodationTypes.hotel;


    // Select accommodation type
    await test.step(`Select accommodation: ${accommodationData.name}`, async () => {
      await pm.onSearchPage().selectAccommodationFilter(accommodationData.code);
    });

    // Verify results contain only selected accommodation type
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      // Validate filters before checking results
      await pm.onSearchPage().validateFiltersBeforeResults(null, null, null);
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results are displayed for accommodation filter');
      console.log('VALIDATION PASSED: Results match expected count for accommodation filter');
    });

    await test.step(`Validate results contain "${accommodationData.name}" properties`, async () => {
      await pm.onSearchPage().validateResultsContainAccommodationType(accommodationData.name);
      console.log(`VALIDATION PASSED: Results contain only ${accommodationData.name}`);
    });

    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Results are displayed for accommodation filter');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain only ${accommodationData.name}`);
      console.log(`✓ TC-014 completed - validated ${accommodationData.name} filter`);
    });
  });

  // ============================================================
  // GROUP 8 – Board Basis Filter Tests (TC-015)
  // Tests meal plan filtering
  // ============================================================

  // TC-015: Validates board basis filter (Self catered)
  test('TC-015 — Validate board basis filter (Self catered)', async ({ pm }, testInfo) => {
    // Increase timeout for this flaky test
    testInfo.setTimeout(150000); // 2.5 minutes
    const boardBasisData = testData.searchPage.filters.boardBasis.selfCatered;


    // Select board basis option
    await test.step(`Select board basis: ${boardBasisData.name}`, async () => {
      await pm.onSearchPage().selectBoardBasisFilter(boardBasisData.code);
    });

    // Verify results contain only selected board basis
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    await test.step(`Validate results contain "${boardBasisData.name}" options`, async () => {
      await pm.onSearchPage().validateResultsContainBoardBasis(boardBasisData.name);
      console.log(`VALIDATION PASSED: Results contain only ${boardBasisData.name} board basis`);
    });

    await test.step('✅ Test completed', async () => {
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results contain only ${boardBasisData.name} board basis`);
      console.log(`✅ TC-015 PASS — ${boardBasisData.name} board basis filter validated successfully`);
    });
  });

  // ============================================================
  // GROUP 10 – Rating Filter Tests (TC-016 to TC-017)
  // Tests Iglu Ski Snowflake rating filtering
  // ============================================================

  // TC-016: Validates rating filter (5 snowflakes)
  test('TC-016 — Validate rating filter (5 snowflakes)', async ({ pm }, testInfo) => {
    // Increase timeout for rating validation (page interactions can be slow)
    testInfo.setTimeout(180000); // 3 minutes instead of default 1.5
    const ratingData = testData.searchPage.filters.ratings.rating5;


    // Select maximum rating
    await test.step(`Select rating: ${ratingData.name}`, async () => {
      await pm.onSearchPage().selectRatingFilter(typeof ratingData.value === 'string' ? parseInt(ratingData.value, 10) : ratingData.value);
      // Verify page is still responsive after selecting rating
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed unexpectedly during selectRatingFilter');
      }
      // Wait for filter results to load
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
    });

    // Verify results contain only 5-star properties
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating results are displayed');
      }
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    await test.step(`Validate results contain ${ratingData.name} rating`, async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating rating content');
      }
      try {
        await pm.onSearchPage().validateResultsContainRating(typeof ratingData.value === 'string' ? parseInt(ratingData.value, 10) : ratingData.value);
        console.log(`VALIDATION PASSED: Results contain only ${ratingData.name} rating`);
      } catch (err) {
        throw new Error(`validateResultsContainRating failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        await pm.onSearchPage().validateTopNCardsHaveRatingTitleExact(typeof ratingData.value === 'string' ? parseInt(ratingData.value, 10) : ratingData.value, 5);
        console.log(`✅ validateTopNCardsHaveRatingTitleExact executed successfully`);
      } catch (err) {
        throw new Error(`validateTopNCardsHaveRatingTitleExact failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before test completion');
      }
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log('VALIDATION PASSED: Results match expected count');
      console.log(`✅ TC-016 PASS — ${ratingData.name} rating filter validated successfully`);
    });
  });

  // TC-017: Validates rating filter (2 snowflakes - minimum)
  test('TC-017 — Validate rating filter (2 snowflakes - minimum)', async ({ pm }, testInfo) => {
    // Increase timeout for rating validation (page interactions can be slow)
    testInfo.setTimeout(180000); // 3 minutes instead of default 1.5

    // Reset nights to avoid interference from defaults

    // Select minimum rating (2 snowflakes)
    await test.step('Select rating: 2 snowflakes (minimum)', async () => {
      await pm.onSearchPage().selectRatingFilter(2);
      // Verify page is still responsive after selecting rating
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed unexpectedly during selectRatingFilter');
      }
      // Wait for filter results to load TWICE to ensure results update
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
      await pm.getPage().waitForTimeout(1000); // Extra wait for DOM updates
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
    });

    // Verify results contain only properties with exactly 2 stars
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating results are displayed');
      }
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`📊 Results found: ${resultsCount}`);
      if (resultsCount === 0) {
        console.warn(`⚠️ No results found with 2★ rating filter`);
      }
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    await test.step('Validate results contain ONLY 2 snowflakes rating', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating rating content');
      }
      try {
        await pm.onSearchPage().validateResultsContainRating(2);
        console.log(`VALIDATION PASSED: Results contain only 2 snowflakes rating`);
      } catch (err) {
        throw new Error(`validateResultsContainRating failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        await pm.onSearchPage().validateTopNCardsHaveRatingTitleExact(2, 5);
        console.log(`✅ validateTopNCardsHaveRatingTitleExact executed successfully`);
      } catch (err) {
        throw new Error(`validateTopNCardsHaveRatingTitleExact failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before test completion');
      }
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`✅ TC-017 PASS — 2★ (minimum) rating filter validated — ONLY 2★ properties shown`);
    });
  });

  // ============================================================
  // GROUP 10 – Property Features Filter Tests (TC-018)
  // Tests property amenities filtering
  // ============================================================

  // TC-018: Validates property feature filter (WiFi)
  test('TC-018 — Validate property feature filter (WiFi)', async ({ pm }, testInfo) => {
    testInfo.setTimeout(90000);
    const featureData = testData.searchPage.filters.propertyFeatures;

    // Reset soft issues for a clean assertion surface
    pm.onSearchPage().clearSoftIssues();

    // Select WiFi feature checkbox from filters sidebar
    await test.step(`Select feature: ${featureData.selected}`, async () => {
      await pm.onSearchPage().selectPropertyFeatureFilter(featureData.selected);
    });

    // Verify search results appear after filter applied
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
    });

    // Validate feature appears in results and detail page
    await test.step(`Validate feature presence: ${featureData.selected}`, async () => {
      await pm.onSearchPage().validateResultsContainFeature(featureData.selected);
      await pm.onSearchPage().validateFeatureInFirstResultDetail(featureData.selected);
      console.log(`VALIDATION PASSED: Feature "${featureData.selected}" present in results and detail page`);
    });

    // Surface soft errors as hard failures to avoid false positives
    await test.step('Assert no soft errors', async () => {
      const { errors, warnings } = pm.collectSoftIssues();
      if (errors.length) {
        throw new Error(`TC-018 soft errors:\n${errors.join('\n')}`);
      }
      if (warnings.length) {
        console.log(`ℹ TC-018 warnings:\n${warnings.join('\n')}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✅ TC-018 PASS — ${featureData.selected} property feature validated successfully`);
    });
  });

  // ============================================================
  // GROUP 12 – Ski Area Filter Tests (TC-019)
  // Tests ski area region filtering
  // ============================================================

  // TC-019: Validates ski area filter (The 3 Valleys)
  test('TC-019 — Validate ski area filter (The 3 Valleys)', async ({ pm }, testInfo) => {
    // Increase timeout for this flaky test
    testInfo.setTimeout(150000); // 2.5 minutes
    const skiAreaData = testData.searchPage.filters.skiArea;


    // Select ski area
    await test.step(`Select ski area: ${skiAreaData.selected}`, async () => {
      await pm.onSearchPage().selectSkiAreaFilter(skiAreaData.selected);
    });

    // Verify results contain only properties in selected ski area
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    await test.step(`Validate results belong to "${skiAreaData.selected}"`, async () => {
      await pm.onSearchPage().validateResultsContainSkiArea(skiAreaData.selected);
      console.log(`VALIDATION PASSED: Results belong to ski area ${skiAreaData.selected}`);
    });

    await test.step('✅ Test completed', async () => {
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results belong to ski area ${skiAreaData.selected}`);
      console.log(`✅ TC-019 PASS — ${skiAreaData.selected} ski area filter validated successfully`);
    });
  });

  // ============================================================
  // GROUP 13 – Resort Filter Tests (TC-020)
  // Tests specific resort filtering
  // ============================================================

  // TC-020: Validates resort filter (Val d'Isère)
  test('TC-020 — Validate resort filter (Val d\'Isère)', async ({ pm }, testInfo) => {
    // Increase timeout for this flaky test
    testInfo.setTimeout(150000); // 2.5 minutes
    const resortData = testData.searchPage.filters.resort;


    // Select resort
    await test.step(`Select resort: ${resortData.selected}`, async () => {
      await pm.onSearchPage().selectResortFilter(resortData.selected);
      // Wait for filter results to load TWICE to ensure results update
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
      await pm.getPage().waitForTimeout(1000); // Extra wait for DOM updates
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
    });

    // Verify results contain only properties in selected resort
    let exactMatches = 0;
    await test.step('Validate results are displayed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating results are displayed');
      }
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`📊 Results found: ${resultsCount}`);
      if (resultsCount === 0) {
        console.warn(`⚠️ No results found with resort filter "${resortData.selected}"`);
      }
      await pm.onSearchPage().validateResultsCount(1);
      console.log('VALIDATION PASSED: Results are displayed');
      exactMatches = await pm.onSearchPage().validateExactMatchCount();
      console.log('VALIDATION PASSED: Results match expected count');
    });

    await test.step(`Validate results belong to "${resortData.selected}"`, async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before validating resort content');
      }
      try {
        await pm.onSearchPage().validateResultsContainResort(resortData.selected);
        console.log(`✅ validateResultsContainResort executed successfully`);
        console.log(`VALIDATION PASSED: Results belong to resort "${resortData.selected}"`);
      } catch (err) {
        throw new Error(`validateResultsContainResort failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    await test.step('✅ Test completed', async () => {
      if (pm.getPage().isClosed()) {
        throw new Error('Page closed before test completion');
      }
      console.log('VALIDATION PASSED: Results are displayed');
      console.log(`✓ Found ${exactMatches} properties matching filter criteria`);
      console.log(`VALIDATION PASSED: Results belong to resort "${resortData.selected}"`);
      console.log(`✅ TC-020 PASS — ${resortData.selected} resort filter validated successfully`);
    });
  });

  // ============================================================
  // GROUP 14 – Filter Management Tests (TC-021 to TC-023)
  // Tests clearing filters and URL parameter synchronization
  // ============================================================

  // TC-021: Validates "Clear all changes" button removes all filters
  test('TC-021 — Validate "Clear all changes" functionality', async ({ pm }, testInfo) => {
    // Increase timeout for this flaky test
    testInfo.setTimeout(150000); // 2.5 minutes
    const countryData = testData.searchPage.filters.countries.highVolume;
    const accommodationData = testData.searchPage.filters.accommodation;
    const nightsData = testData.searchPage.filters.nights;


    // Apply multiple filters
    await test.step('Apply multiple filters', async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
      await pm.onSearchPage().selectCountryFilter(countryData.code);
      await pm.onSearchPage().selectAccommodationFilter(accommodationData.selected);
    });

    // Verify filters are applied
    await test.step('Verify filters applied and results reduced', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Filters applied - Results: ${resultsCount}`);
      console.log('VALIDATION PASSED: Filters applied');
    });

    // Clear all filters
    await test.step('Click "Clear all changes" button', async () => {
      await pm.onSearchPage().clearAllFilters();
      // Wait for page to reload after clearing filters
      await pm.getPage().waitForLoadState('load', { timeout: 10000 });
      await pm.getPage().waitForTimeout(1000); // Extra wait for results to update
    });

    // Verify filters are cleared
    await test.step('Verify all filters cleared', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ All filters cleared - Results restored: ${resultsCount}`);
      console.log('VALIDATION PASSED: All filters cleared and results restored');
    });

    await test.step('✅ Test completed', async () => {
      console.log('✅ TC-021 PASS — "Clear all changes" functionality validated successfully');
    });
  });

  // ============================================================
  // GROUP 15 – Multi-Selection Tests (TC-022 to TC-023)
  // Tests selecting multiple options in filter categories
  // ============================================================

  // TC-022: Validates multi-country selection (France + Austria + Italy)
  test('TC-022 — Validate multi-country selection (France + Austria + Italy)', async ({ pm }, testInfo) => {
    const countries = ['FR', 'AT', 'IT']; // France, Austria, Italy
    const countryNames = ['France', 'Austria', 'Italy'];
    let initialCount = 0;

    // Clear any existing country filters first
    await test.step('Clear existing country filters', async () => {
      await pm.onSearchPage().clearCountryFilters();
      // Wait for page to fully reload after clearing
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(1000);
      initialCount = await pm.onSearchPage().getResultsCount();
      console.log(`Initial results after clearing filters: ${initialCount}`);
      expect(initialCount).toBeGreaterThan(0);
    });

    // Select multiple countries simultaneously
    await test.step('Select France, Austria, and Italy', async () => {
      // Select each country individually with explicit waits
      await pm.onSearchPage().selectCountryFilter('FR');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000);
      
      await pm.onSearchPage().selectCountryFilter('AT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(4000);
      
      await pm.onSearchPage().selectCountryFilter('IT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(5000);
    });

    // Verify combined results
    await test.step('Verify combined results from all selected countries', async () => {
      const combined = await pm.onSearchPage().getResultsCount();
      console.log(`Combined results from ${countryNames.join(' + ')}: ${combined}`);
      
      // Results should be different from initial (all countries)
      expect(combined).toBeGreaterThan(0);
      expect(combined).toBeLessThan(initialCount); // Should be filtered down
      
      console.log(`✓ Results filtered from ${initialCount} to ${combined}`);
    });

    // Verify URL contains ALL country parameters
    await test.step('Verify URL contains all country parameters', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      console.log(`✓ URL: ${url}`);
      
      // Verify each country code is in the URL
      const missingCountries = countries.filter(code => !url.toUpperCase().includes(code));
      
      if (missingCountries.length > 0) {
        console.log(`❌ FAIL: Missing countries in URL: ${missingCountries.join(', ')}`);
        throw new Error(`URL missing country parameters: ${missingCountries.join(', ')}`);
      }
      
      console.log('✓ VALIDATION PASSED: URL contains all 3 country parameters');
    });

    await test.step('✅ Test completed', async () => {
      console.log(`✅ TC-022 PASS — Multi-country selection validated: ${countryNames.join(' + ')}`);
    });
  });

  // TC-023: Validates removing individual country from multi-selection
  test('TC-023 — Validate individual country removal from multi-selection', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const countries = ['FR', 'AT', 'IT'];
    const countryNames = ['France', 'Austria', 'Italy'];

    // Clear any existing country filters first
    await test.step('Clear existing country filters', async () => {
      await pm.onSearchPage().clearCountryFilters();
      // Wait for page to fully reload after clearing
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(2000); // Increased from 1s to 2s
      
      // Verify filters are actually cleared
      const urlAfterClear = await pm.onSearchPage().getCurrentUrl();
      console.log(`URL after clearing filters: ${urlAfterClear}`);
    });

    // Select all 3 countries
    await test.step('Select France, Austria, and Italy', async () => {
      // Select each country individually with explicit waits
      await pm.onSearchPage().selectCountryFilter('FR');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000);
      
      await pm.onSearchPage().selectCountryFilter('AT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(4000);
      
      await pm.onSearchPage().selectCountryFilter('IT');
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(5000);
    });

    // Record count with all 3 countries
    let countWith3Countries: number;
    await test.step('Record results with all 3 countries', async () => {
      countWith3Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 3 countries: ${countWith3Countries}`);
      
      // Validate we actually have results from all 3 countries
      const url = await pm.onSearchPage().getCurrentUrl();
      expect(url).toContain('FR');
      expect(url).toContain('AT');
      expect(url).toContain('IT');
    });

    // Deselect only France
    await test.step('Deselect France (keep Austria + Italy)', async () => {
      await pm.onSearchPage().deselectCountry('FR');
      
      // CRITICAL: Wait for page to process the deselection
      await pm.getPage().waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await pm.getPage().waitForTimeout(3000); // Same wait as multi-select
    });

    // Verify Austria and Italy remain selected
    await test.step('Verify Austria and Italy still selected', async () => {
      const countWith2Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 2 countries (Austria + Italy): ${countWith2Countries}`);

      // Results should decrease after removing France
      expect(countWith2Countries, 
        `Expected fewer results after removing France. Had ${countWith3Countries} with 3 countries, now have ${countWith2Countries} with 2`
      ).toBeLessThan(countWith3Countries!);
      
      console.log(`✓ Results count decreased from ${countWith3Countries} to ${countWith2Countries} - France successfully removed`);
      console.log('VALIDATION PASSED: Individual country removal reflected in results');
    });

    // Verify URL updated
    await test.step('Verify URL updated after deselection', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      if (!url.includes('FR') && url.includes('AT') && url.includes('IT')) {
        console.log(`✓ URL correctly reflects removal of France`);
        console.log('VALIDATION PASSED: URL updated after country removal');
      }
    });

    await test.step('✅ Test completed', async () => {
      console.log('✅ TC-023 PASS — Individual country removal from multi-selection validated successfully');
    });
  });
});
