import { test } from '../support/baseTest';

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

});