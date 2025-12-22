import { test, expect } from '../support/baseTest';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH: Executed before each test — browse and accept cookies
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies(); 
  });


// TC 1 — Validate Iglu Ski Logo: checks for redirection when clicking on the logo
  test('Validar Logo da Iglu Ski', async ({ page, pm }) => {
    await pm.onHomePage().validateLogo();
  });

// TC 2 — Validate Menu + Submenus: validates menus, sublinks, and <h1>; resumes duplicates
  test('Validar Menu de Navegação Principal', async ({ page, pm }) => {
    // ✅ Aumenta timeout global para este teste (5 minutos)
    test.setTimeout(300000);

    // ✅ Valida todos os sublinks (ilimitado)
    await pm.onHomePage().validateMenuAndSubMenuNavigation();

  });

  test('Click on the menu and optionally on the submenu.', async ({ page, pm }) => {
    // ✅ Just click on the main menu:
    await pm.onHomePage().clickMenu("Ski Holidays");

    // ✅ Click on the menu and then on a submenu:
    await pm.onHomePage().clickMenu("Ski Holidays", "Family ski holidays");
  });

// TC 3 — Validate Contact Information in Header: checks phone number and email address
  test('Validate Contact Information in the Header', async ({ page, pm }) => {
    await pm.onHomePage().validateHeaderContactInfo();

  });

  //TC 4 — Validate "Recently Viewed" Button
  test('Validate "Recently Viewed" button', async ({ page, pm }) => {
    await pm.onHomePage().validateRecentlyViewedButton();
  });

  //TC 5 — Validate Access to the Customer Portal
  test('Validate Access to the Customer Portal', async ({ page, pm }) => {
    await pm.onHomePage().validateAccessCustomerPortal();
  });

  //TC 6 — Validate Ratings and Reviews in the Header
  test('Validate Ratings and Reviews in the Header', async ({ page, pm }) => {
    await pm.onHomePage().validateRatingsAndReviews();
  });

  //TC 15 — Validate Main Titles on the Homepage
  test('Validate Main Titles on the Homepage', async ({ page, pm }) => {
    await pm.onHomePage().validateMultipleTitles([
      "Welcome To The Home Of Ski",
      "Speak to the ski experts",
      "Find Your Skiing Holiday"
    ]);
  });

  //TC 16 — Validate carousel of promotions and country banners on the homepage
  test('Validate carousel of promotions and country banners on the homepage', async ({ page, pm }) => {
    await pm.onHomePage().validateCarouselHome();
    await pm.onHomePage().validateCountryBanners();
  });

   // TC 17 — Validate CTA Boxes (Call To Action)
test('Validate CTA Boxes (Call To Action)', async ({ pm }) => {
  await pm.onHomePage().validateCtaBoxes(
    [
      "TALK TO A SKI EXPERT",
      "ABOUT IGLU SKI",
      "SIGN UP TO OUR NEWSLETTER"
    ],
    [
      "/enquire",
      "/about",
      "/signup"
    ]
  );
});

  //TC 20 — Validate Footer Links
  test('Validate Footer Links"', async ({ page, pm }) => {
    // ✅ Increase the global timeout for this test (5 minutes)
    test.setTimeout(300000);
    await pm.onHomePage().validateFooterItems();
  });

});