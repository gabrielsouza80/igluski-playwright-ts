import { test } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH
  test.beforeEach(async ({ pm }) => {
    await test.step('✓ Navigate and accept cookies', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
    });
  });

  // TC 1 — Validate Iglu Ski Logo
  test('Validate Iglu Ski Logo', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Iglu Ski Logo', async () => {
      await pm.onHomePage().validateLogo();
    });
  });

  // TC 2 — Validate Menu + Submenus
  test('Validate Main Navigation Menu', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    test.setTimeout(300000);

    await test.step('✓ Validate Main Navigation Menu + Submenus', async () => {
      await pm.onHomePage().validateMenuAndSubMenuNavigation();
    });
  });

  // TC — Click on menu and submenu
  test('Click on the menu and optionally on the submenu', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Click main menu: Ski Holidays', async () => {
      await pm.onHomePage().clickMenu("Ski Holidays");
    });

    await test.step('✓ Click submenu: Family ski holidays', async () => {
      await pm.onHomePage().clickMenu("Ski Holidays", "Family ski holidays");
    });
  });

  // TC 3 — Validate Contact Information in Header
  test('Validate Contact Information in the Header', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Contact Information in Header', async () => {
      await pm.onHomePage().validateHeaderContactInfo();
    });
  });

  // TC 4 — Validate "Recently Viewed" Button
  test('Validate "Recently Viewed" Button', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Recently Viewed Button', async () => {
      await pm.onHomePage().validateRecentlyViewedButton();
    });
  });

  // TC 5 — Validate Access to the Customer Portal
  test('Validate Access to the Customer Portal', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Access to Customer Portal', async () => {
      await pm.onHomePage().validateAccessCustomerPortal();
    });
  });

  // TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Ratings and Reviews', async () => {
      await pm.onHomePage().validateRatingsAndReviews();
    });
  });

  // TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Main Titles', async () => {
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

    await test.step('✓ Validate Carousel Home', async () => {
      await pm.onHomePage().validateCarouselHome();
    });

    await test.step('✓ Validate Country Banners', async () => {
      await pm.onHomePage().validateCountryBanners();
    });
  });

  // TC 17 — Validate CTA Boxes
  test('Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate CTA Boxes', async () => {
      await pm.onHomePage().validateCtaBoxes();
    });
  });

  // TC 18 — Validate Contact Section
  test('Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Contact Section', async () => {
      await pm.onHomePage().validateContactSection();
    });
  });

  // TC 20 — Validate Footer Links
  test('Validate Footer Links', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    test.setTimeout(300000);

    await test.step('✓ Validate Footer Links', async () => {
      await pm.onHomePage().validateFooterItems();
    });
  });

  // TC 22 — Validate Carousel CTA Button
  test('Validate Carousel CTA Button', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Carousel CTA Button', async () => {
      await pm.onHomePage().validateCarouselCTA();
    });
  });

  // Validate Inline Links
  test('Validate Inline Links in Sections', async ({ pm }, testInfo) => {
    console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);

    await test.step('✓ Validate Speak to Experts Links', async () => {
      await pm.onHomePage().validateSpeakToExpertsLinks();
    });

    await test.step('✓ Validate Find Your Skiing Holiday Links', async () => {
      await pm.onHomePage().validateFindYourSkiingHolidayLinks();
    });
  });

  // TC 26 — Validate Page Responsiveness
  test('Validate Page Responsiveness (Mobile/Tablet)', async ({ pm }, testInfo) => {
    pm.onHomePage().logTestStart(testInfo.title);

    await test.step('✓ Validate Responsiveness at 375px', async () => {
      await pm.onHomePage().validateResponsiveness(375);
    });

    await test.step('✓ Validate Responsiveness at 768px', async () => {
      await pm.onHomePage().validateResponsiveness(768);
    });
  });

  // TC 28 — Validate Holiday ID Search
  test('Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {
    pm.onHomePage().logTestStart(testInfo.title);

    await test.step('✓ Validate Holiday ID Search', async () => {
      await pm.onHomePage().validateHolidayIdSearch();
    });
  });

});