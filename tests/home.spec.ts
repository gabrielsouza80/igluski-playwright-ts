import { test, expect } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH
  test.beforeEach(async ({ pm }) => {
    await test.step('✓ Navigate to the Home Page and handle cookie banner', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
    });
  });

  // ============================================================
  // 🔵 TC1 — Validate Header Logo Navigation
  // ============================================================
  // This test validates the header logo: visibility, click action, and redirect.
  test('TC1 — Validate Logo Navigation', async ({ pm }, testInfo) => {
    
    test.setTimeout(60000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate header logo visibility
    await test.step('Validate header logo visibility', async () => {
      await pm.onHomePage().validateHeaderLogo();
    });

    // STEP 2 — Click the header logo
    await test.step('Click the header logo', async () => {
      await pm.onHomePage().clickHeaderLogo();
    });

    // STEP 3 — Validate redirect to pm.onHomePage()page
    await test.step('Validate redirection to Home Page', async () => {
      await pm.onHomePage().validateHeaderLogoRedirect();
    });

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC1 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC2 — Validate Header Navigation + Submenu Navigation
  // ============================================================
  // This test validates all main menu items and all submenu items.
  test('TC2 — Header Navigation + Submenu Validation', async ({ pm }, testInfo) => {
    
    test.setTimeout(300000); // Extended timeout due to heavy navigation

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Locate header navigation items
    await test.step('Locate header navigation items', async () => {
      await pm.onHomePage().locateHeaderNavItems();
    });

    // STEP 2 — Validate header navigation visibility
    await test.step('Validate header navigation visibility', async () => {
      await pm.onHomePage().validateHeaderNavVisibility();
    });

    // STEP 3 — Capture menu snapshot
    await test.step('Capture menu snapshot', async () => {
      await pm.onHomePage().captureMenuSnapshot();
    });

    // STEP 4 — Validate all main menu navigation
    await test.step('Validate main menu navigation', async () => {
      await pm.onHomePage().validateMainMenus();
    });

    // STEP 5 — Validate all submenu navigation
    await test.step('Validate submenu navigation', async () => {
      await pm.onHomePage().validateSubMenus();
    });

    // STEP 6 — Finish test
    await test.step('Finish test', async () => {
      await pm.onHomePage().closeNavigationPage();

      if (pm.onHomePage().tc2Errors.length > 0) {
        console.log("\n==================== TC2 — SUMMARY OF ERRORS ====================");

        const summary = pm.onHomePage().tc2Errors.join("\n");

        console.log(summary);
        console.log("=================================================================\n");

        // Attach full summary to the Playwright report
        await testInfo.attach("TC2 — Errors Summary", {
          body: summary,
          contentType: "text/plain"
        });

      } else {
        console.log("✓ TC2 completed successfully — no errors found");
      }
    });
  });


  // ============================================================
  // 🔵 TC3 — Validate Contact Information in the Header
  // ============================================================
  // This test validates the phone number, Contact Us text, and Contact Us redirection.
  test('TC3 — Validate Contact Information in the Header', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Check if phone number element exists
    await test.step('Validate header phone number', async () => {
      await pm.onHomePage().validateHeaderPhone();
    });

    // STEP 2 — Validate phone number text
    await test.step('Validate phone number text in the header', async () => {
      await pm.onHomePage().validateHeaderPhone();
    });

    // STEP 3 — Check if Contact Us link exists
    await test.step('Check if Contact Us link exists', async () => {
      await expect(pm.onHomePage().contactUsLink).toBeVisible();
    });

    // STEP 4 — Validate Contact Us link text
    await test.step('Validate Contact Us link text in the header', async () => {
      await pm.onHomePage().validateHeaderContactText();
    });

    // STEP 5 — Validate Contact Us redirection
    await test.step('Validate Contact Us redirection', async () => {
      await pm.onHomePage().validateHeaderContactRedirect();
    });

    // STEP 6 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC3 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC4 — Validate "Recently Viewed" Button
  // ============================================================
  // This test validates the Recently Viewed button and its panel visibility.
  test('TC4 — Validate "Recently Viewed" Button', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Recently Viewed button text
    await test.step('Validate Recently Viewed button text', async () => {
      await pm.onHomePage().validateRecentlyViewedButtonText();
    });

    // STEP 2 — Click button and validate panel
    await test.step('Click Recently Viewed button and validate panel', async () => {
      await pm.onHomePage().validateRecentlyViewedButton();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC4 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC5 — Validate Access to the Customer Portal
  // ============================================================
  // This test validates the Customer Portal button, AJAX-loaded content,
  // and the presence of required fields on the Customer Portal page.
  test('TC5 — Validate Access to the Customer Portal', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Customer Portal button text
    await test.step('Validate Customer Portal button text', async () => {
      await pm.onHomePage().validateCustomerPortalButtonText();
    });

    // STEP 2 — Click Customer Portal button
    await test.step('Click Customer Portal button', async () => {
      await pm.onHomePage().clickCustomerPortalButton();
    });

    // STEP 3 — Wait for AJAX content to load
    await test.step('Wait for AJAX content to load', async () => {
      await pm.onHomePage().waitForCustomerPortalAjax();
    });

    // STEP 4 — Validate Customer Portal required fields
    await test.step('Validate Customer Portal required fields', async () => {
      await pm.onHomePage().validateCustomerPortalFields();
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC5 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC6 — Validate Ratings & Reviews in the Header
  // ============================================================
  // This test validates the Ratings & Reviews link, its text, and the redirection.
  test('TC6 — Validate Ratings & Reviews in the Header', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Ratings & Reviews link text
    await test.step('Validate Ratings & Reviews link text', async () => {
      await pm.onHomePage().validateRatingsAndReviewsText();
    });

    // STEP 2 — Click the Ratings & Reviews link
    await test.step('Click the Ratings & Reviews link', async () => {
      await pm.onHomePage().clickRatingsAndReviews();
    });

    // STEP 3 — Validate redirect to the Reviews page
    await test.step('Validate redirect to the Reviews page', async () => {
      await pm.onHomePage().validateRatingsAndReviewsRedirect();
    });

    // STEP 4 — Validate Reviews page title
    await test.step('Validate Reviews page title', async () => {
      await pm.onHomePage().validateReviewsPageTitle();
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC6 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC15 — Validate Main Titles on the Home Page
  // ============================================================
  // This test validates the main titles displayed on the Home Page.
  test('TC15 — Validate Main Titles on the Home Page', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Define expected Home Page titles
    const expectedTitles = [
      "Welcome To The Home Of Ski Holidays",
      "Speak to the ski experts",
      "Find Your Skiing Holiday"
    ];

    // STEP 2 — Validate each Home Page title individually
    await test.step('Validate each home Page title', async () => {
      for (const title of expectedTitles) {
        await pm.onHomePage().validateSingleTitle(title);
      }
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC15 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC16 — Validate Carousel of Promotions and Country Banners
  // ============================================================
  // This test validates the promotional carousel and all country banners.
  test('TC16 — Validate Carousel of Promotions and Country Banners', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Count carousel slides
    const totalSlides = await pm.onHomePage().getCarouselSlideCount();

    // STEP 2 — Validate each carousel slide
    await test.step('Validate each carousel slide', async () => {
      for (let i = 0; i < totalSlides; i++) {
        await pm.onHomePage().validateSingleCarouselSlide(i, totalSlides);
      }
    });

    // STEP 3 — Get country banners list
    const banners = await pm.onHomePage().getCountryBannerList();

    // STEP 4 — Validate each country banner and its redirection
    await test.step('Validate each country banner and its redirection', async () => {
      for (const banner of banners) {
        if (!banner.url) {
          // Logging happens inside the Home Page class
          continue;
        }
        await pm.onHomePage().validateSingleCountryBanner(banner.label, banner.url);
      }
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC16 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC17 — Validate CTA Boxes (Call To Action)
  // ============================================================
  // This test validates all CTA boxes, their titles, and their redirections.
  test('TC17 — Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Fetch CTA boxes list (optional, only for logging)
    await pm.onHomePage().getCtaBoxesList();

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await pm.onHomePage().validateCtaBoxesList();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC17 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC18 — Validate Contact Section (Phone, Email, Newsletter)
  // ============================================================
  // This test validates the three contact blocks displayed on the Home Page.
  test('TC18 — Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate phone block
    await test.step('Validate phone block', async () => {
      await pm.onHomePage().validateContactPhoneBlock();
    });

    // STEP 2 — Validate email block
    await test.step('Validate email block', async () => {
      await pm.onHomePage().validateContactEmailBlock();
    });

    // STEP 3 — Validate newsletter block
    await test.step('Validate newsletter block', async () => {
      await pm.onHomePage().validateContactNewsletterBlock();
    });

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC18 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC20 — Validate Footer Links
  // ============================================================
  test('TC20 — Validate Footer Links', async ({ pm }, testInfo) => {
    test.setTimeout(300000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Ensure footer container is visible
    await test.step('Ensure footer container is visible', async () => {
      await expect(pm.onHomePage().footerContainer).toBeVisible();
    });

    // STEP 2 — Scroll to footer
    await test.step('Scroll to footer', async () => {
      await pm.onHomePage().footerContainer.scrollIntoViewIfNeeded();
    });

    // STEP 3 — Wait for footer to render
    await test.step('Wait for footer to render', async () => {
      await pm.onHomePage().waitForFooterToRender();
    });

    // STEP 4 — Expand all footer sections (mobile only)
    await test.step('Expand all footer sections', async () => {
      await pm.onHomePage().expandAllFooterSections();
    });

    // STEP 5 — Fetch footer items list
    const footerItems = await pm.onHomePage().getFooterItemsList();

    // STEP 6 — Validate footer items count
    await test.step('Validate footer items count', async () => {
      expect(footerItems.length).toBeGreaterThan(0);
      console.log(`✓ Found ${footerItems.length} footer items`);
    });

    // STEP 7 — Validate visibility of each footer item
    await test.step('Validate visibility of each footer item', async () => {
      for (const item of footerItems) {
        if (!item.url || !item.sectionId) continue;

        const locator = pm.onHomePage().getFooterItemLocator(item.sectionId, item.url);
        await expect(locator).toBeVisible();
      }
    });

    // STEP 8 — Validate text of each footer item
    await test.step('Validate text of each footer item', async () => {
      for (const item of footerItems) {
        if (!item.url || !item.sectionId) continue;

        const locator = pm.onHomePage().getFooterItemLocator(item.sectionId, item.url);
        const text = (await locator.innerText()).trim();

        if (!text) {
          throw new Error(`❌ Empty text: ${item.label}`);
        }
      }
    });

    // STEP 9 — Validate URL format
    await test.step('Validate URL format', async () => {
      for (const item of footerItems) {
        if (!item.absoluteUrl) continue;

        if (!item.absoluteUrl.startsWith("https://")) {
          throw new Error(`❌ Invalid URL: ${item.absoluteUrl}`);
        }
      }
    });

    // STEP 10 — Validate footer link navigation (URL + title)
    await test.step('Validate footer link navigation', async () => {
      await pm.onHomePage().validateAllFooterLinks(footerItems);
    });

    // STEP 11 — Finish test
    await test.step('Finish test', async () => {
      await pm.onHomePage().closeFooterNavigationPage();
      console.log("✓ TC20 completed successfully");
    });
  });

  // ============================================================
  // 🔵 TC22 — Validate Carousel CTA Button
  // ============================================================
  // This test validates the CTA button inside the active carousel slide.
  test('TC22 — Validate Carousel CTA Button', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate CTA visibility inside the active slide
    await test.step('Validate CTA visibility inside the active carousel slide', async () => {
      await pm.onHomePage().validateCarouselCtaVisibility();
    });

    // STEP 2 — Validate CTA navigation
    await test.step('Validate CTA navigation from the active carousel slide', async () => {
      await pm.onHomePage().validateCarouselCtaNavigation();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC22 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TCXX — Validate Inline Links in Sections
  // ============================================================
  // This test validates inline links inside two Home Page sections:
  // 1) Speak to the ski experts
  // 2) Find Your Skiing Holiday
  test('TCXX — Validate Inline Links in Sections', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Speak to Experts section
    await test.step('Validate inline links inside the "Speak to Experts" section', async () => {
      await pm.onHomePage().validateSpeakToExpertsLinksList();
    });

    // STEP 2 — Validate Find Your Skiing Holiday section
    await test.step('Validate inline links inside the "Find Your Skiing Holiday" section', async () => {
      await pm.onHomePage().validateFindYourSkiingHolidayLinksList();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ Inline links validation completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC26 — Validate Page Responsiveness (Mobile + Tablet)
  // ============================================================
  test('TC26 — Validate Page Responsiveness (Mobile/Tablet)', async ({ pm }, testInfo) => {
    test.setTimeout(300000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate at 375px (mobile)
    await test.step('Validate layout and responsiveness at 375px (mobile)', async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(375);
    });

    // STEP 2 — Validate at 768px (tablet)
    await test.step('Validate layout and responsiveness at 768px (tablet)', async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(768);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log("✓ TC26 completed successfully");
    });
  });

  // ============================================================
  // 🔵 TC28 — Validate "Search by Holiday ID" Button in Footer
  // ============================================================
  test('TC28 — Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {
    test.setTimeout(120000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Holiday ID Search
    await test.step('Validate Holiday ID Search in Footer', async () => {
      await pm.onHomePage().validateHolidayIdSearch();
    });

    // STEP 2 — Finish test
    await test.step('Finish test', async () => {
      console.log("✓ TC28 completed successfully");
    });
  });

});