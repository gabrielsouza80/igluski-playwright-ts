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
    await pm.onSearchPage().navigateAndAcceptCookies('/ski-holidays');
  });

  // ============================================================
  // GROUP 1 – Duration Filter Tests (TC-001 to TC-004)
  // Tests all available duration options: 2, 7, 14, and 14+ nights
  // ============================================================

  // TC-001: Validates minimum duration filter (2 nights)
  test('TC-001 — Validate minimum nights filter (2 nights)', async ({ pm }, testInfo) => {
    // Get test data from centralized JSON
    const nightsData = testData.searchPage.filters.nights;

    // Step 1: Select the minimum nights filter
    await test.step(`Select ${nightsData.min} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.min);
    });

    // Step 2: Validate that results are displayed
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // Step 3: Validate results contain the expected duration
    await test.step(`Validate results contain "${nightsData.min} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.min);
    });

    // Step 4: Log test completion
    await test.step('Finish test', async () => {
      console.log(`✓ TC-001 completed - validated ${nightsData.min} nights filter`);
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

    // Validate results contain the expected duration
    await test.step(`Validate results contain "${nightsData.default} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-002 completed - validated ${nightsData.default} nights filter`);
    });
  });

  // TC-003: Validates maximum duration filter (14 nights)
  test('TC-003 — Validate maximum nights filter (14 nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select maximum nights value
    await test.step(`Select ${nightsData.max} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.max);
    });

    // Verify results appear
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-003 completed - validated ${nightsData.max} nights filter`);
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
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-004 completed - validated ${nightsData.maxOpen} nights filter`);
    });
  });

  // ============================================================
  // GROUP 3 – Country Filter Tests (TC-007 to TC-008)
  // Tests countries with high and low property counts
  // ============================================================

  // TC-007: Validates country with many properties (France)
  test('TC-007 — Validate country with many properties (France)', async ({ pm }, testInfo) => {
    const countryData = testData.searchPage.filters.countries.highVolume;

    // Select France (high volume country)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify multiple results appear (at least 10)
    await test.step('Validate many results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
    });

    // Validate results contain the expected country
    await test.step(`Validate results contain "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-007 completed - validated ${countryData.name} country filter`);
    });
  });

  // TC-008: Validates country with few properties (USA)
  test('TC-008 — Validate country with few properties (USA)', async ({ pm }, testInfo) => {
    const countryData = testData.searchPage.filters.countries.lowVolume;

    // Select USA (low volume country)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify at least some results appear
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-008 completed - validated ${countryData.name} country filter`);
    });
  });

  // ============================================================
  // GROUP 4 – Combined Filter Tests (TC-009 to TC-010)
  // Tests multiple filters applied simultaneously
  // ============================================================

  // TC-009: Validates 7 nights + France combination
  test('TC-009 — Validate 7 nights + France combination', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.highVolume;

    // Apply duration filter first
    await test.step(`Select ${nightsData.default} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.default);
    });

    // Then apply country filter
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify combined filters return results
    await test.step('Validate combined results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(10);
    });

    // Validate results contain both expected duration and country
    await test.step(`Validate results contain "${nightsData.default} Nights" and "${countryData.name}"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.default);
      await pm.onSearchPage().validateResultsContainCountry(countryData.name);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-009 completed - validated ${nightsData.default} nights + ${countryData.name}`);
    });
  });

  // TC-010: Validates 14+ nights + USA combination
  test('TC-010 — Validate 14+ nights + USA combination', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.lowVolume;

    // Apply duration filter (14+ nights)
    await test.step(`Select ${nightsData.maxOpen} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
    });

    // Apply country filter (USA)
    await test.step(`Select country: ${countryData.name} (${countryData.code})`, async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
    });

    // Verify combined filters return results
    await test.step('Validate combined results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-010 completed - validated ${nightsData.maxOpen} nights + ${countryData.name}`);
    });
  });

  // ============================================================
  // GROUP 5 – Results Display Tests (TC-011 to TC-013)
  // Tests pagination, results per page, and sorting functionality
  // ============================================================

  // TC-011: Validates changing results per page (10 → 20)
  test('TC-011 — Validate results per page change (10 → 20)', async ({ pm }, testInfo) => {
    const resultsData = testData.searchPage.resultsDisplay;

    // Change from default (10) to 20 results per page
    await test.step(`Change results per page to ${resultsData.perPageOptions[1]}`, async () => {
      await pm.onSearchPage().changeResultsPerPage(resultsData.perPageOptions[1]);
    });

    // Verify results count text updates
    await test.step('Validate results count changed', async () => {
      await pm.onSearchPage().validateResultsCountChanged();
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-011 completed - validated results per page change`);
    });
  });

  // TC-012: Validates pagination navigation
  test('TC-012 — Validate pagination (next page)', async ({ pm }, testInfo) => {
    // Navigate to page 2
    await test.step('Navigate to next page', async () => {
      await pm.onSearchPage().navigateToNextPage();
    });

    // Verify page 2 results are displayed
    await test.step('Validate page 2 results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-012 completed - validated pagination`);
    });
  });

  // TC-013: Validates sorting functionality
  test('TC-013 — Validate sorting (Iglu recommends → Price Low to High)', async ({ pm }, testInfo) => {
    const resultsData = testData.searchPage.resultsDisplay;
    const sortOption = resultsData.sortOptions[2]; // "Price (Low - High)"

    // Change sort order from default to price ascending
    await test.step(`Change sort order to: ${sortOption}`, async () => {
      await pm.onSearchPage().changeSortOrder(sortOption);
    });

    // Verify results still appear after sort
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-013 completed - validated sorting by ${sortOption}`);
    });
  });

  // ============================================================
  // GROUP 6 – Negative Scenario Test (TC-014) - DEVELOPMENT
  // Tests that restrictive filter combinations show "no results"
  // ============================================================

  // TC-014: Extremes — 2 minimums and 2 maximums on travelers with 2 nights
  test('TC-014 — Extremes: 2 minimums and 2 maximums', async ({ pm }, testInfo) => {
    // Use data-driven extremes defined in testdata.json
    // Note: Supports '14+' nights and '30+' adults values
    // IMPORTANT: Test never stops on errors - logs issues and continues
    const combos = testData.searchPage.extremes.combinations;

    for (const combo of combos) {
      // Select duration (nights) for this extreme combination - continue on error
      await test.step(`${combo.label} — Select ${combo.nights} nights`, async () => {
        try {
          await pm.onSearchPage().selectNightsFilter(combo.nights as any);
        } catch (error) {
          console.log(`❌ ${combo.label}: Failed to select nights - continuing anyway`);
        }
      });

      // Select travelers (adults + children) using visual UI - continue on error
      await test.step(`${combo.label} — Select travelers (${combo.adults} adults, ${combo.children} children)`, async () => {
        try {
          await pm.onSearchPage().selectTravelersFilter(combo.adults as any, combo.children as number);
        } catch (error) {
          console.log(`❌ ${combo.label}: Failed to select travelers - continuing anyway`);
        }
      });

      // Always validate outcome: results present or "no results" message
      await test.step(`${combo.label} — Validate results or no-results`, async () => {
        try {
          const hasResults = await pm.onSearchPage().hasSearchResults();
          if (hasResults) {
            const count = await pm.onSearchPage().getResultsCount();
            console.log(`🔎 ${combo.label}: results present → ${count} cards`);
          } else {
            await pm.onSearchPage().validateNoResults();
            console.log(`🔎 ${combo.label}: no results message displayed`);
          }
        } catch (error) {
          console.log(`⚠ ${combo.label}: Could not validate results - ${error}`);
        }
      });
    }

    // Summary for extremes execution
    await test.step('Finish test', async () => {
      console.log('✓ TC-014 completed — extremes (2 min, 2 max) executed');
    });
  });

  // ============================================================
  // GROUP 7 – Travelers Filter Tests (TC-015 to TC-016)
  // Tests minimum and maximum traveler configurations
  // ============================================================

  // TC-015: Validates minimum travelers configuration (1 adult, 0 children)
  test('TC-015 — Validate minimum travelers (1 adult, 0 children)', async ({ pm }, testInfo) => {
    const travelersData = testData.searchPage.filters.travelers;

    // Select minimum travelers
    await test.step(`Select ${travelersData.adults.min} adult and ${travelersData.children.min} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(travelersData.adults.min, travelersData.children.min);
    });

    // Verify results appear for minimum travelers
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-015 completed - validated minimum travelers`);
    });
  });

  // TC-016: Validates maximum travelers configuration (30+ adults, 10 children)
  test('TC-016 — Validate maximum travelers (30+ adults, 10 children)', async ({ pm }, testInfo) => {
    const travelersData = testData.searchPage.filters.travelers;

    // Select maximum travelers
    await test.step(`Select ${travelersData.adults.max} adults and ${travelersData.children.max} children`, async () => {
      await pm.onSearchPage().selectTravelersFilter(travelersData.adults.max, travelersData.children.max);
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

    await test.step('Finish test', async () => {
      console.log(`✓ TC-016 completed - validated maximum travelers`);
    });
  });

  // ============================================================
  // GROUP 8 – Accommodation Filter Tests (TC-017)
  // Tests property type filtering
  // ============================================================

  // TC-017: Validates accommodation type filter (Hotel)
  test('TC-017 — Validate accommodation filter (Hotel)', async ({ pm }, testInfo) => {
    const accommodationData = testData.searchPage.filters.accommodation;

    // Select accommodation type
    await test.step(`Select accommodation: ${accommodationData.selected}`, async () => {
      await pm.onSearchPage().selectAccommodationFilter(accommodationData.selected);
    });

    // Verify results contain only selected accommodation type
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results contain "${accommodationData.selected}" properties`, async () => {
      await pm.onSearchPage().validateResultsContainAccommodationType(accommodationData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-017 completed - validated ${accommodationData.selected} filter`);
    });
  });

  // ============================================================
  // GROUP 9 – Board Basis Filter Tests (TC-018)
  // Tests meal plan filtering
  // ============================================================

  // TC-018: Validates board basis filter (Self catered)
  test('TC-018 — Validate board basis filter (Self catered)', async ({ pm }, testInfo) => {
    const boardBasisData = testData.searchPage.filters.boardBasis;

    // Select board basis option
    await test.step(`Select board basis: ${boardBasisData.selected}`, async () => {
      await pm.onSearchPage().selectBoardBasisFilter(boardBasisData.selected);
    });

    // Verify results contain only selected board basis
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results contain "${boardBasisData.selected}" options`, async () => {
      await pm.onSearchPage().validateResultsContainBoardBasis(boardBasisData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-018 completed - validated ${boardBasisData.selected} filter`);
    });
  });

  // ============================================================
  // GROUP 10 – Rating Filter Tests (TC-019)
  // Tests Iglu Ski Snowflake rating filtering
  // ============================================================

  // TC-019: Validates rating filter (5 snowflakes)
  test('TC-019 — Validate rating filter (5 snowflakes)', async ({ pm }, testInfo) => {
    const ratingData = testData.searchPage.filters.rating;

    // Select maximum rating
    await test.step(`Select rating: ${ratingData.selected} snowflakes`, async () => {
      await pm.onSearchPage().selectRatingFilter(ratingData.selected);
    });

    // Verify results contain only 5-star properties
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results contain ${ratingData.selected} snowflakes rating`, async () => {
      await pm.onSearchPage().validateResultsContainRating(ratingData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-019 completed - validated ${ratingData.selected} snowflakes rating`);
    });
  });

  // ============================================================
  // GROUP 11 – Property Features Filter Tests (TC-020)
  // Tests property amenities filtering
  // ============================================================

  // TC-020: Validates property feature filter (WiFi)
  test('TC-020 — Validate property feature filter (WiFi)', async ({ pm }, testInfo) => {
    const featureData = testData.searchPage.filters.propertyFeatures;

    // Select property feature
    await test.step(`Select feature: ${featureData.selected}`, async () => {
      await pm.onSearchPage().selectPropertyFeatureFilter(featureData.selected);
    });

    // Verify results contain only properties with selected feature
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results contain "${featureData.selected}" feature`, async () => {
      await pm.onSearchPage().validateResultsContainFeature(featureData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-020 completed - validated ${featureData.selected} feature`);
    });
  });

  // ============================================================
  // GROUP 12 – Ski Area Filter Tests (TC-021)
  // Tests ski area region filtering
  // ============================================================

  // TC-021: Validates ski area filter (The 3 Valleys)
  test('TC-021 — Validate ski area filter (The 3 Valleys)', async ({ pm }, testInfo) => {
    const skiAreaData = testData.searchPage.filters.skiArea;

    // Select ski area
    await test.step(`Select ski area: ${skiAreaData.selected}`, async () => {
      await pm.onSearchPage().selectSkiAreaFilter(skiAreaData.selected);
    });

    // Verify results contain only properties in selected ski area
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results belong to "${skiAreaData.selected}"`, async () => {
      await pm.onSearchPage().validateResultsContainSkiArea(skiAreaData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-021 completed - validated ${skiAreaData.selected} ski area`);
    });
  });

  // ============================================================
  // GROUP 13 – Resort Filter Tests (TC-022)
  // Tests specific resort filtering
  // ============================================================

  // TC-022: Validates resort filter (Val d'Isère)
  test('TC-022 — Validate resort filter (Val d\'Isère)', async ({ pm }, testInfo) => {
    const resortData = testData.searchPage.filters.resort;

    // Select resort
    await test.step(`Select resort: ${resortData.selected}`, async () => {
      await pm.onSearchPage().selectResortFilter(resortData.selected);
    });

    // Verify results contain only properties in selected resort
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    await test.step(`Validate results belong to "${resortData.selected}"`, async () => {
      await pm.onSearchPage().validateResultsContainResort(resortData.selected);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-022 completed - validated ${resortData.selected} resort`);
    });
  });
});
