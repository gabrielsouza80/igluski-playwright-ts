import { test } from '@playwright/test';
import { PageManager } from '../pages/utils/PageManager';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe.only('Home Page', () => {

  // BEFORE EACH: Executed before each test — browse and accept cookies
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().navigateAndAcceptCookies(); // Browse and accept cookies via PageManager.
  });


  // TC 1 — Validate Iglu Ski Logo: checks for redirection when clicking on the logo
  test('Validate Iglu Ski Logo', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateLogo();
  });

  // TC 2 — Validate Menu + Submenus: validates menus, sublinks, and <h1>; resumes duplicates
  test('Validate Main Navigation Menu', async ({ page }) => {
    // ✅ Increase the global timeout for this test (5 minutes)
    test.setTimeout(300000);

    const pm = new PageManager(page);

    // ✅ Validates all sublinks (unlimited)
    await pm.onHomePage().validateMenuAndSubMenuNavigation();

  });

  test('Click on the menu and optionally on the submenu.', async ({ page }) => {
    const pm = new PageManager(page);

    // ✅ Just click on the main menu:
    await pm.onHomePage().clickMenu("Ski Holidays");

    // ✅ Click on the menu and then on a submenu:
    await pm.onHomePage().clickMenu("Ski Holidays", "Family ski holidays");
  });

  // TC 3 — Validate Contact Information in Header: checks phone number and email address
  test('Validate Contact Information in the Header', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onHomePage().validateHeaderContactInfo();

  });

  //TC 4 — Validate "Recently Viewed" Button
  test('Validate "Recently Viewed" button', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateRecentlyViewedButton();
  });

  //TC 5 — Validate Access to the Customer Portal
  test('Validate Access to the Customer Portal', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateAccessCustomerPortal();
  });

  //TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateRatingsAndReviews();
  });

  //TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateMultipleTitles([
      "Welcome To The Home Of Ski",
      "Speak to the ski experts",
      "Find Your Skiing Holiday"
    ]);
  });

  //TC 16 — Validate carousel of promotions and country banners on the homepage"
  test('Validate Carousel of Banners (Countries)"', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateCarouselHome();
    await pm.onHomePage().validateBannersHome();
  });

  //TC 20 — Validate Footer Links
  test('Validate Footer Links"', async ({ page }) => {
    // ✅ Increase the global timeout for this test (5 minutes)
    test.setTimeout(300000);
    const pm = new PageManager(page);
    await pm.onHomePage().validateFooterItems();
  });

});