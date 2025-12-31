import { test } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH
  test.beforeEach(async ({ pm }) => {
    await test.step('✓ Navigate to the homepage and handle cookie banner', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
    });
  });

  // ============================================================
  // 🔵 TC1 — Validate Header Logo Navigation
  // ============================================================
  // This test validates the header logo: visibility, click action, and redirect.
  test('TC1 — Validate Logo Navigation', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // Logs the test start in the console.
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // Locates the header logo element.
    await test.step('Locate the header logo', async () => {
      await home.locateHeaderLogo();
    });

    // Ensures the header logo is visible.
    await test.step('Validate that the logo is visible', async () => {
      await home.validateHeaderLogoVisibility();
    });

    // Clicks the header logo.
    await test.step('Click the logo', async () => {
      await home.clickHeaderLogo();
    });

    // Validates that clicking the logo redirects to the homepage.
    await test.step('Validate redirection to homepage', async () => {
      await home.validateHeaderLogoRedirect();
    });

    // Final log for TC1.
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

    const home = pm.onHomePage();

    // Logs the test start in the console.
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // Locates the header navigation items.
    await test.step('Locate header navigation items', async () => {
      await home.locateHeaderNavItems();
    });

    // Ensures all header navigation items are visible.
    await test.step('Validate header navigation visibility', async () => {
      await home.validateHeaderNavVisibility();
    });

    // Captures a snapshot of all menus and submenus.
    await test.step('Capture menu snapshot', async () => {
      await home.captureMenuSnapshot();
    });

    // Validates navigation for all main menu items.
    await test.step('Validate main menu navigation', async () => {
      await home.validateMainMenus();
    });

    // Validates navigation for all submenu items.
    await test.step('Validate submenu navigation', async () => {
      await home.validateSubMenus();
    });

    // Closes the reusable navigation tab and logs completion.
    await test.step('Finish test', async () => {
      await home.closeNavigationPage();
      console.log('✓ TC2 completed successfully');
    });
  });

  // TC — Click on menu and submenu
  test('Click on the menu and optionally on the submenu', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Click main menu
    await test.step('Click the main menu item "Ski Holidays"', async () => {
      await home.clickMainMenu("Ski Holidays");
    });

    // STEP 2 — Click submenu
    await test.step('Click the submenu item "Family ski holidays" under "Ski Holidays"', async () => {
      await home.clickSubmenu("Ski Holidays", "Family ski holidays");
    });
  });


  // ============================================================
  // 🔵 TC3 — Validate Contact Information in the Header
  // ============================================================
  // This test validates the phone number, Contact Us text, and Contact Us redirection.
  test('TC3 — Validate Contact Information in the Header', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // Log test start
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // Validate phone number text
    await test.step('Validate phone number text in the header', async () => {
      await home.validateHeaderPhone();
    });

    // Validate Contact Us link text
    await test.step('Validate Contact Us link text in the header', async () => {
      await home.validateHeaderContactText();
    });

    // Validate Contact Us redirection
    await test.step('Validate Contact Us redirection', async () => {
      await home.validateHeaderContactRedirect();
    });

    // Log test completion
    await test.step('Finish test', async () => {
      console.log('✓ TC3 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC4 — Validate "Recently Viewed" Button
  // ============================================================
  // This test validates the Recently Viewed button and its panel visibility.
  test('TC4 — Validate "Recently Viewed" Button', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // Log test start
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // Click the Recently Viewed button
    await test.step('Click the Recently Viewed button', async () => {
      await home.clickRecentlyViewedButton();
    });

    // Validate the Recently Viewed panel visibility
    await test.step('Validate Recently Viewed panel visibility', async () => {
      await home.validateRecentlyViewedPanel();
    });

    // Log test completion
    await test.step('Finish test', async () => {
      console.log('✓ TC4 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC5 — Validate Access to the Customer Portal
  // ============================================================
  // This test validates the Customer Portal button and its AJAX-loaded content.
  test('TC5 — Validate Access to the Customer Portal', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // Log test start
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // Click the Customer Portal button
    await test.step('Click the Customer Portal button', async () => {
      await home.clickCustomerPortalButton();
    });

    // Validate Customer Portal content
    await test.step('Validate Customer Portal content loads', async () => {
      await home.validateCustomerPortalContent();
    });

    // Log test completion
    await test.step('Finish test', async () => {
      console.log('✓ TC5 completed successfully');
    });
  });

  // TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Click Ratings & Reviews link
    await test.step('Click the Ratings & Reviews link', async () => {
      await home.clickRatingsAndReviews();
    });

    // STEP 2 — Validate redirect to Reviews page
    await test.step('Validate redirect to the Reviews page', async () => {
      await home.validateRatingsAndReviewsRedirect();
    });
  });

  // TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Validate each main title individually
    await test.step('Validate main homepage titles', async () => {
      await home.validateHomepageTitles([
        "Welcome To The Home Of Ski",
        "Speak to the ski experts",
        "Find Your Skiing Holiday"
      ]);
    });
  });

  // TC 16 — Validate carousel + country banners
  test('Validate Carousel of Promotions and Country Banners', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Validate promotional carousel
    await test.step('Validate promotional carousel functionality and CTA behavior', async () => {
      await home.validateCarousel();
    });

    // STEP 2 — Validate country banners
    await test.step('Validate all country banners and their respective redirections', async () => {
      await home.validateCountryBannersList();
    });
  });

  // TC 17 — Validate CTA Boxes
  test('Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Fetch CTA list
    await test.step('Fetch CTA boxes and titles', async () => {
      await home.getCtaBoxesList();
    });

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await home.validateCtaBoxesList();
    });
  });

  // TC 18 — Validate Contact Section
  test('Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Validate phone block
    await test.step('Validate phone block', async () => {
      await home.validateContactPhoneBlock();
    });

    // STEP 2 — Validate email block
    await test.step('Validate email block', async () => {
      await home.validateContactEmailBlock();
    });

    // STEP 3 — Validate newsletter block
    await test.step('Validate newsletter block', async () => {
      await home.validateContactNewsletterBlock();
    });
  });

  // TC 20 — Validate Footer Links
  test('Validate Footer Links', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    test.setTimeout(300000);

    const home = pm.onHomePage();

    // STEP 1 — Fetch footer items
    await test.step('Fetch footer items list', async () => {
      await home.getFooterItemsList();
    });

    // STEP 2 — Validate footer links
    await test.step('Validate footer links and redirections', async () => {
      await home.validateFooterItemsList();
    });
  });

  // TC 22 — Validate Carousel CTA Button
  test('Validate Carousel CTA Button', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Validate CTA visibility
    await test.step('Validate CTA visibility inside the active carousel slide', async () => {
      await home.validateCarouselCtaVisibility();
    });

    // STEP 2 — Validate CTA navigation
    await test.step('Validate CTA navigation from the active carousel slide', async () => {
      await home.validateCarouselCtaNavigation();
    });
  });

  // Validate Inline Links
  test('Validate Inline Links in Sections', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    const home = pm.onHomePage();

    // STEP 1 — Validate Speak to Experts section
    await test.step('Validate inline links inside the "Speak to Experts" section', async () => {
      await home.validateSpeakToExpertsLinksList();
    });

    // STEP 2 — Validate Find Your Skiing Holiday section
    await test.step('Validate inline links inside the "Find Your Skiing Holiday" section', async () => {
      await home.validateFindYourSkiingHolidayLinksList();
    });
  });

  // TC 26 — Validate Page Responsiveness
  test('Validate Page Responsiveness (Mobile/Tablet)', async ({ pm }, testInfo) => {
    pm.onHomePage().logTestStart(testInfo.title);

    const home = pm.onHomePage();

    // STEP 1 — Mobile
    await test.step('Validate layout and responsiveness at 375px (mobile)', async () => {
      await home.validateResponsivenessAtWidth(375);
    });

    // STEP 2 — Tablet
    await test.step('Validate layout and responsiveness at 768px (tablet)', async () => {
      await home.validateResponsivenessAtWidth(768);
    });
  });

  // TC 28 — Validate Holiday ID Search
  test('Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {
    pm.onHomePage().logTestStart(testInfo.title);

    await test.step('✓ Validate the Holiday ID search functionality in the footer', async () => {
      await pm.onHomePage().validateHolidayIdSearch();
    });
  });

});