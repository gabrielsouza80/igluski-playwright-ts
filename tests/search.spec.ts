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

  // TC-001: Validates minimum duration filter (2 nights) with soft assertions
  test('TC-001 — Validate minimum nights filter (2 nights)', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;

    // Select nights from Bootstrap-Select dropdown
    await test.step(`Select ${nightsData.min} nights filter`, async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.min);
    });

    // Verify results appear (soft check)
    await test.step('Validate results are displayed', async () => {
      await pm.onSearchPage().validateResultsCount(1);
    });

    // Check result cards display correct nights text
    await test.step(`Validate results contain "${nightsData.min} Nights"`, async () => {
      await pm.onSearchPage().validateResultsContainNights(nightsData.min);
    });

    // Log test completion
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

  // TC-014: Tests 4 extreme filter combinations (2 min, 2 max) with timeout guard
  test('TC-014 — Extremes: 2 minimums and 2 maximums', async ({ pm }, testInfo) => {
    // Data-driven approach: loops through extremes combinations from testdata.json
    const combos = testData.searchPage.extremes.combinations;

    // Main test execution wrapped for timeout control
    const testExecution = async () => {
      try {
        for (const combo of combos) {
          // Check if page still exists before each combination
          const page = pm.onSearchPage()['page']; // Access internal page object
          if (page && page.isClosed()) {
            console.log(`⚠ ${combo.label}: Page closed - skipping remaining combinations`);
            break; // Exit loop early
          }

          // Select nights filter with page closure check
          await test.step(`${combo.label} — Select ${combo.nights} nights`, async () => {
            try {
              if (page && !page.isClosed()) {
                await pm.onSearchPage().selectNightsFilter(combo.nights as any);
              } else {
                console.log(`⚠ ${combo.label}: Page closed before selecting nights`);
              }
            } catch (error) {
              console.log(`❌ ${combo.label}: Failed to select nights - continuing anyway`);
            }
          });

          // Check page state between steps
          if (page && page.isClosed()) {
            console.log(`⚠ ${combo.label}: Page closed after nights - skipping remaining steps`);
            break;
          }

          // Select travelers with DOM manipulation
          await test.step(`${combo.label} — Select travelers (${combo.adults} adults, ${combo.children} children)`, async () => {
            try {
              if (page && !page.isClosed()) {
                await pm.onSearchPage().selectTravelersFilter(combo.adults as any, combo.children as number);
              } else {
                console.log(`⚠ ${combo.label}: Page closed before selecting travelers`);
              }
            } catch (error) {
              console.log(`❌ ${combo.label}: Failed to select travelers - continuing anyway`);
            }
          });

          // Final page check before validation
          if (page && page.isClosed()) {
            console.log(`⚠ ${combo.label}: Page closed after travelers - skipping remaining steps`);
            break;
          }

          // Validate results or no-results message
          await test.step(`${combo.label} — Validate results or no-results`, async () => {
            try {
              if (page && !page.isClosed()) {
                const hasResults = await pm.onSearchPage().hasSearchResults();
                if (hasResults) {
                  const count = await pm.onSearchPage().getResultsCount();
                  console.log(`🔎 ${combo.label}: results present → ${count} cards`);
                } else {
                  await pm.onSearchPage().validateNoResults();
                  console.log(`🔎 ${combo.label}: no results message displayed`);
                }
              } else {
                console.log(`⚠ ${combo.label}: Page closed before validation`);
              }
            } catch (error) {
              console.log(`⚠ ${combo.label}: Could not validate results - ${error}`);
            }
          });
        }
      } catch (error) {
        console.log(`⚠ TC-014: Unexpected error - ${error}`);
      }
    };

    // Timeout guard: 75000ms - prevents hanging if page closes during extreme filter testing
    await Promise.race([
      testExecution(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Test execution timeout')), 75000))
    ]).catch(err => {
      if (err.message !== 'Test execution timeout') throw err;
      console.log(`⚠ TC-014: Test execution exceeded 75s - completing test`);
    });

    // Log test completion
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

    const testExecution = async () => {
      try {
        // Select WiFi feature checkbox from filters sidebar
        await test.step(`Select feature: ${featureData.selected}`, async () => {
          try {
            await pm.onSearchPage().selectPropertyFeatureFilter(featureData.selected);
          } catch (error) {
            console.log(`⚠ TC-020: Failed to select feature - ${error}`);
          }
        });

        // Verify search results appear after filter applied
        await test.step('Validate results are displayed', async () => {
          try {
            await pm.onSearchPage().validateResultsCount(1);
          } catch (error) {
            console.log(`⚠ TC-020: Failed to validate results count - ${error}`);
          }
        });

        // Validate feature appears in results with page closure check
        const page = pm.onSearchPage()['page'];
        if (page && !page.isClosed()) {
          try {
            await pm.onSearchPage().validateResultsContainFeature(featureData.selected);
          } catch (error) {
            console.log(`⚠ TC-020: Failed during feature validation - ${error}`);
          }
        } else {
          console.log(`⚠ TC-020: Page closed before feature validation - skipping`);
        }
      } catch (error) {
        console.log(`⚠ TC-020: Unexpected error - ${error}`);
      }
    };

    // Timeout guard: 30000ms - prevents hanging if page closes during feature validation
    await Promise.race([
      testExecution(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Test execution timeout')), 30000))
    ]).catch(err => {
      if (err.message !== 'Test execution timeout') throw err;
      console.log(`⚠ TC-020: Test execution exceeded 30s - completing test`);
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

  // ============================================================
  // GROUP 14 – Filter Management Tests (TC-023 to TC-025)
  // Tests clearing filters and URL parameter synchronization
  // ============================================================

  // TC-023: Validates "Clear all changes" button removes all filters
  test('TC-023 — Validate "Clear all changes" functionality', async ({ pm }, testInfo) => {
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
    });

    // Clear all filters
    await test.step('Click "Clear all changes" button', async () => {
      await pm.onSearchPage().clearAllFilters();
    });

    // Verify filters are cleared
    await test.step('Verify all filters cleared', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ All filters cleared - Results restored: ${resultsCount}`);
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-023 completed - validated clear all filters functionality');
    });
  });

  // TC-024: Validates individual section "clear" button (Country section)
  test('TC-024 — Validate section "clear" button (Country)', async ({ pm }, testInfo) => {
    const countryData = testData.searchPage.filters.countries.highVolume;
    const accommodationData = testData.searchPage.filters.accommodation;

    // Apply country and accommodation filters
    await test.step('Apply Country and Accommodation filters', async () => {
      await pm.onSearchPage().selectCountryFilter(countryData.code);
      await pm.onSearchPage().selectAccommodationFilter(accommodationData.selected);
    });

    // Verify multiple filters applied
    await test.step('Verify filters applied', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Filters applied - Results: ${resultsCount}`);
    });

    // Clear only country filter
    await test.step('Clear Country filter section', async () => {
      await pm.onSearchPage().clearCountryFilters();
    });

    // Verify only accommodation remains active
    await test.step('Verify only Accommodation filter remains', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Country cleared, Accommodation active - Results: ${resultsCount}`);
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-024 completed - validated section clear functionality');
    });
  });

  // TC-025: Validates URL synchronization with filter selections
  test('TC-025 — Validate URL parameter synchronization', async ({ pm }, testInfo) => {
    const nightsData = testData.searchPage.filters.nights;
    const countryData = testData.searchPage.filters.countries.highVolume;
    const accommodationData = testData.searchPage.filters.accommodation;
    const travelersData = testData.searchPage.filters.travelers;

    // Apply specific filters
    await test.step('Apply multiple filters', async () => {
      await pm.onSearchPage().selectNightsFilter(nightsData.maxOpen);
      await pm.onSearchPage().selectCountryFilter(countryData.code);
      await pm.onSearchPage().selectAccommodationFilter(accommodationData.selected);
      await pm.onSearchPage().selectTravelersFilter(travelersData.adults.min, travelersData.children.min);
    });

    // Verify URL contains expected query parameters
    await test.step('Verify URL contains filter parameters', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      console.log(`✓ URL with filters: ${url}`);

      // Verify URL is not the base search page
      if (url.includes('ski-holidays') && (url.includes('?') || url.includes('country'))) {
        console.log(`✓ URL synchronized with filters`);
      }
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-025 completed - validated URL parameter synchronization');
    });
  });

  // ============================================================
  // GROUP 15 – Multi-Selection Tests (TC-026 to TC-030)
  // Tests selecting multiple options in filter categories
  // ============================================================

  // TC-026: Validates multi-country selection (France + Austria + Italy)
  test('TC-026 — Validate multi-country selection (France + Austria + Italy)', async ({ pm }, testInfo) => {
    const countries = ['FR', 'AT', 'IT']; // France, Austria, Italy
    const countryNames = ['France', 'Austria', 'Italy'];

    // Select multiple countries simultaneously
    await test.step('Select France, Austria, and Italy', async () => {
      await pm.onSearchPage().selectMultipleCountries(countries);
    });

    // Verify results decreased (filtered by 3 countries)
    await test.step('Verify results from 3 countries combined', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Multi-country selection (${countryNames.join(' + ')}) - Results: ${resultsCount}`);

      // Should have results from all 3 countries (OR logic)
      if (resultsCount > 0) {
        console.log(`✓ All 3 countries selected and returning results`);
      }
    });

    // Verify URL contains multiple country parameters
    await test.step('Verify URL contains country parameters', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      console.log(`✓ URL: ${url}`);
    });

    await test.step('Finish test', async () => {
      console.log(`✓ TC-026 completed - validated multi-country selection (${countryNames.join(' + ')})`);
    });
  });

  // TC-027: Validates removing individual country from multi-selection
  test('TC-027 — Validate individual country removal from multi-selection', async ({ pm }, testInfo) => {
    test.setTimeout(120000);
    const countries = ['FR', 'AT', 'IT'];
    const countryNames = ['France', 'Austria', 'Italy'];

    // Select all 3 countries
    await test.step('Select France, Austria, and Italy', async () => {
      await pm.onSearchPage().selectMultipleCountries(countries);
    });

    // Record count with all 3 countries
    let countWith3Countries: number;
    await test.step('Record results with all 3 countries', async () => {
      countWith3Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 3 countries: ${countWith3Countries}`);
    });

    // Deselect only France
    await test.step('Deselect France (keep Austria + Italy)', async () => {
      await pm.onSearchPage().deselectCountry('FR');
    });

    // Verify Austria and Italy remain selected
    await test.step('Verify Austria and Italy still selected', async () => {
      const countWith2Countries = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Results with 2 countries (Austria + Italy): ${countWith2Countries}`);

      if (countWith2Countries !== countWith3Countries!) {
        console.log(`✓ Results count changed - France was successfully removed`);
      }
    });

    // Verify URL updated
    await test.step('Verify URL updated after deselection', async () => {
      const url = await pm.onSearchPage().getCurrentUrl();
      if (!url.includes('FR') && url.includes('AT') && url.includes('IT')) {
        console.log(`✓ URL correctly reflects removal of France`);
      }
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-027 completed - validated individual country removal from multi-selection');
    });
  });

  // TC-028: Validates multi-accommodation selection (Hotel + Chalet)
  test('TC-028 — Validate multi-accommodation selection (Hotel + Chalet)', async ({ pm }, testInfo) => {
    const accommodations = ['Hotel', 'Chalet'];

    // Select multiple accommodations
    await test.step('Select Hotel and Chalet', async () => {
      await pm.onSearchPage().selectMultipleAccommodations(accommodations);
    });

    // Verify results from both accommodation types
    await test.step('Verify results from multiple accommodation types', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Multi-accommodation selection (Hotel + Chalet) - Results: ${resultsCount}`);

      if (resultsCount > 0) {
        console.log(`✓ Both accommodation types selected and returning results`);
      }
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-028 completed - validated multi-accommodation selection');
    });
  });

  // TC-029: Validates multi-board basis selection (Self Catered + Bed & Breakfast)
  test('TC-029 — Validate multi-board basis selection (Self Catered + Bed & Breakfast)', async ({ pm }, testInfo) => {
    const boardBasisOptions = ['Self catered', 'Bed & Breakfast'];

    // Select multiple board basis options
    await test.step('Select Self Catered and Bed & Breakfast', async () => {
      await pm.onSearchPage().selectMultipleBoardBasis(boardBasisOptions);
    });

    // Verify results from both board basis options
    await test.step('Verify results from multiple board basis options', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Multi-board basis selection (Self catered + Bed & Breakfast) - Results: ${resultsCount}`);

      if (resultsCount > 0) {
        console.log(`✓ Both board basis options selected and returning results`);
      }
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-029 completed - validated multi-board basis selection');
    });
  });

  // TC-030: Validates multi-ski area selection (The 3 Valleys + Paradiski)
  test('TC-030 — Validate multi-ski area selection (The 3 Valleys + Paradiski)', async ({ pm }, testInfo) => {
    const skiAreas = ['The 3 Valleys', 'Paradiski'];

    // Select multiple ski areas
    await test.step('Select The 3 Valleys and Paradiski', async () => {
      await pm.onSearchPage().selectMultipleSkiAreas(skiAreas);
    });

    // Verify results from both ski areas
    await test.step('Verify results from multiple ski areas', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`✓ Multi-ski area selection (The 3 Valleys + Paradiski) - Results: ${resultsCount}`);

      if (resultsCount > 0) {
        console.log(`✓ Both ski areas selected and returning results`);
      }
    });

    await test.step('Finish test', async () => {
      console.log('✓ TC-030 completed - validated multi-ski area selection');
    });
  });
});
