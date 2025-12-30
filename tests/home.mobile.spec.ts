import { test } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page Mobile
// ================================================================

test.describe('Home Page Mobile', () => {

  // BEFORE EACH
  test.beforeEach(async ({ pm }) => {
    await test.step('✓ Navigate to the homepage and handle cookie banner', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
    });
  });

  // TC 1 — Validate Iglu Ski Logo
  test('Validate Iglu Ski Logo', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate that clicking the Iglu Ski logo redirects to the homepage', async () => {
      await pm.onHomePage().validateLogo();
    });
  });

  // TC 2 — Validate Menu + Submenus
  test('Validate Main Navigation Menu', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    test.setTimeout(300000);

    await test.step('✓ Validate all main navigation menu items and their respective submenus', async () => {
      await pm.onHomePage().validateMenuAndSubMenuNavigation();
    });
  });

  // TC — Click on menu and submenu
  test('Click on the menu and optionally on the submenu', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Click the main menu item "Ski Holidays"', async () => {
      await pm.onHomePage().clickMenu("Ski Holidays");
    });

    await test.step('✓ Click the submenu item "Family ski holidays" under "Ski Holidays"', async () => {
      await pm.onHomePage().clickMenu("Ski Holidays", "Family ski holidays");
    });
  });

  // TC 3 — Validate Contact Information in Header
  test('Validate Contact Information in the Header', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate phone number, contact link, and redirection in the header', async () => {
      await pm.onHomePage().validateHeaderContactInfo();
    });
  });

  // TC 4 — Validate "Recently Viewed" Button
  test('Validate "Recently Viewed" Button', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate that the Recently Viewed button opens the correct panel', async () => {
      await pm.onHomePage().validateRecentlyViewedButton();
    });
  });

  // TC 5 — Validate Access to the Customer Portal
  test('Validate Access to the Customer Portal', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate that the Customer Portal button redirects to the correct page', async () => {
      await pm.onHomePage().validateAccessCustomerPortal();
    });
  });

  // TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate that the Ratings & Reviews link redirects correctly', async () => {
      await pm.onHomePage().validateRatingsAndReviews();
    });
  });

  // TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate the presence and correctness of the main homepage titles', async () => {
      await pm.onHomePage().validateMultipleTitles([
        "Welcome To The Home Of Ski",
        "Speak to the ski experts",
        "Find Your Skiing Holiday"
      ]);
    });
  });

  // TC 16 — Validate carousel + country banners
  test('Validate Carousel of Promotions and Country Banners', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate the promotional carousel functionality and CTA behavior', async () => {
      await pm.onHomePage().validateCarouselHome();
    });

    await test.step('✓ Validate all country banners and their respective redirections', async () => {
      await pm.onHomePage().validateCountryBanners();
    });
  });

  // TC 17 — Validate CTA Boxes
  test('Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate all CTA boxes, titles, and redirections', async () => {
      await pm.onHomePage().validateCtaBoxes();
    });
  });

  // TC 18 — Validate Contact Section
  test('Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate the full contact section including phone, email, and newsletter blocks', async () => {
      await pm.onHomePage().validateContactSection();
    });
  });

  // TC 20 — Validate Footer Links
  test('Validate Footer Links', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    test.setTimeout(300000);

    await test.step('✓ Validate all footer links and ensure correct redirections', async () => {
      await pm.onHomePage().validateFooterItems();
    });
  });

  // TC 22 — Validate Carousel CTA Button
  test('Validate Carousel CTA Button', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate the CTA button inside the promotional carousel', async () => {
      await pm.onHomePage().validateCarouselCTA();
    });
  });

  // Validate Inline Links
  test('Validate Inline Links in Sections', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate inline links inside the "Speak to Experts" section', async () => {
      await pm.onHomePage().validateSpeakToExpertsLinks();
    });

    await test.step('✓ Validate inline links inside the "Find Your Skiing Holiday" section', async () => {
      await pm.onHomePage().validateFindYourSkiingHolidayLinks();
    });
  });

  // TC 26 — Validate Page Responsiveness
  test('Validate Page Responsiveness (Mobile/Tablet)', async ({ pm }, testInfo) => {
    pm.onHomePage().logTestStart(testInfo.title);

    await test.step('✓ Validate layout and responsiveness at 375px (mobile)', async () => {
      await pm.onHomePage().validateResponsiveness(375);
    });

    await test.step('✓ Validate layout and responsiveness at 768px (tablet)', async () => {
      await pm.onHomePage().validateResponsiveness(768);
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