import { test, expect } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH: Executed before each test — navigate and accept cookies
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies();
  });

  // TC 1 — Validate Iglu Ski Logo: checks for redirection when clicking on the logo
  test('Validate Iglu Ski Logo', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateLogo();
  });

  // TC 2 — Validate Menu + Submenus: validates menus, sublinks, and <h1>
  test('Validate Main Navigation Menu', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    // Increase the overall timeout for this test (5 minutes)
    test.setTimeout(300000);

    // Validate all sublinks (unlimited)
    await pm.onHomePage().validateMenuAndSubMenuNavigation();
  });

  // TC — Click on menu and submenu using clickMenu()
  test('Click on the menu and optionally on the submenu', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    // Just click on the main menu
    await pm.onHomePage().clickMenu("Ski Holidays");

    // Click on the menu and then on the submenu
    await pm.onHomePage().clickMenu("Ski Holidays", "Family ski holidays");
  });

  // TC 3 — Validate Contact Information in Header
  test('Validate Contact Information in the Header', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateHeaderContactInfo();
  });

  // TC 4 — Validate "Recently Viewed" Button
  test('Validate "Recently Viewed" Button', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateRecentlyViewedButton();
  });

  // TC 5 — Validate Access to the Customer Portal
  test('Validate Access to the Customer Portal', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateAccessCustomerPortal();
  });

  // TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateRatingsAndReviews();
  });

  // TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateMultipleTitles([
      "Welcome To The Home Of Ski",
      "Speak to the ski experts",
      "Find Your Skiing Holiday"
    ]);
  });

  // TC 16 — Validate carousel of promotions and country banners on the homepage
  test('Validate Carousel of Promotions and Country Banners', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateCarouselHome();
    await pm.onHomePage().validateCountryBanners();
  });

  // TC 17 — Validate CTA Boxes (Call To Action)
  test('Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateCtaBoxes(); // ← FIXED (no arguments)
  });

  // TC 18 — Validate Contact Section (Phone, Email, Newsletter)
  test('Validate Contact Section (Phone, Email, Newsletter)', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateContactSection();
  });

  // TC 20 — Validate Footer Links
  test('Validate Footer Links', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    // Increase timeout for this test (5 minutes)
    test.setTimeout(300000);
    await pm.onHomePage().validateFooterItems();
  });

  // TC 22 — Validate Carousel CTA Button
  test('Validate Carousel CTA Button', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    await pm.onHomePage().validateCarouselCTA();
  });

  // Validate Inline Links in Sections
  test('Validate Inline Links in Sections', async ({ page, pm }, testInfo) => {
    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      console.log(`\n===== TEST STARTED: ${testInfo.title} =====\n`);
    });

    // 1) First section — returns exactly 6 links
    await pm.onHomePage().validateSpeakToExpertsLinks();

    // 2) Second section — returns exactly 10 links
    await pm.onHomePage().validateFindYourSkiingHolidayLinks();
  });

  // TC 26 — Validate Page Responsiveness
  test('Validate Page Responsiveness (Mobile/Tablet)', async ({ page, pm }, testInfo) => {

    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    await pm.onHomePage().validateTC26(375); // Mobile
    await pm.onHomePage().validateTC26(768); // Tablet
  });

  // TC 28 — Validate "Search by Holiday ID" Button in Footer
  test('Validate "Search by Holiday ID" Button in Footer', async ({ page, pm }, testInfo) => {

    await test.step(`🧪 Starting test: ${testInfo.title}`, async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    await pm.onHomePage().validateTC28();
  });

});