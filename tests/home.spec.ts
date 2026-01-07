import { test } from '../support/baseTest';
import testData from './fixtures/testdata.json';

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
    const expectedTitles = testData.homePage.titles.data;

    // STEP 2 — Validate each Home Page title individually
    await test.step('Validate each home Page title', async () => {
      for (const title of expectedTitles) {
        await pm.onHomePage().validateSingleTitle(title);
      }
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC15 completed successfully - validated ${expectedTitles.length} titles`);
    });
  });

  // ============================================================
  // 🔵 TC16 — Validate Country Banners (Ski Resorts)
  // ============================================================
  // This test validates country banner boxes and their redirections.
  test('TC16 — Validate Country Banners (Ski Resorts)', async ({ pm }, testInfo) => {

    const bannerData = testData.homePage.countryBanners;

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Count and validate all country banners
    let bannerCount = 0;
    await test.step(`Validate all country banners (${bannerData.data.join(', ')})`, async () => {
      bannerCount = await pm.onHomePage().getCountryBannersCount();
      for (let i = 0; i < bannerCount; i++) {
        await pm.onHomePage().validateSingleCountryBannerRedirection(i);
      }
    });

    // STEP 2 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC16 completed successfully - validated ${bannerCount} banners`);
    });
  });

  // ============================================================
  // 🔵 TC17 — Validate CTA Boxes (Call To Action)
  // ============================================================
  // This test validates all CTA boxes, their titles, and their redirections.
  test('TC17 — Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {

    const ctaBoxesData = testData.homePage.ctaBoxes;

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Fetch CTA boxes list (optional, only for logging)
    await pm.onHomePage().getCtaBoxesList();

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await pm.onHomePage().validateCtaBoxesList(ctaBoxesData.data);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC17 completed successfully - validated ${ctaBoxesData.data.length} CTA boxes`);
    });
  });

  // ============================================================
  // 🔵 TC22 — Validate Carousel CTA Button - develop
  // ============================================================
  // This test validates the CTA button for each carousel slide.
  test('TC22 — Validate Carousel CTA Button', async ({ pm }, testInfo) => {

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Count carousel slides
    let totalSlides: number = 0;
    await test.step('Count carousel slides', async () => {
      totalSlides = await pm.onHomePage().getCarouselSlideCount();
    });

    // STEP 2 — Validate CTA for each carousel slide
    await test.step('Validate CTA button and navigation for each carousel slide', async () => {
      const validatedCTAs = new Set<string>();
      const ctaList: { order: number; href: string; pageTitle: string }[] = [];

      // Keep validating unique CTAs until we've cycled through all slides
      while (validatedCTAs.size < totalSlides) {
        await test.step(`Validating unique CTA (${validatedCTAs.size + 1}/${totalSlides})`, async () => {
          // STEP 2.1 — Find next unique CTA
          await test.step('Find next unique CTA', async () => {
            const ctaHref = await pm.onHomePage().findNextUniqueSlideCTA(validatedCTAs);
            validatedCTAs.add(ctaHref);
          });

          // STEP 2.2 — Validate CTA visibility
          await test.step('Validate CTA visibility', async () => {
            await pm.onHomePage().validateCarouselCtaVisibility();
          });

          // STEP 2.3 — Validate CTA navigation and page title
          let pageTitle: string = '';
          await test.step('Validate CTA navigation and page title', async () => {
            const href = await pm.onHomePage().getCarouselCtaHref();
            await pm.onHomePage().validateCarouselCtaWithPageTitle();
            pageTitle = await pm.onHomePage().getLastValidatedPageTitle();
            ctaList.push({
              order: validatedCTAs.size,
              href: href,
              pageTitle: pageTitle
            });
          });

          // STEP 2.4 — Advance carousel (if not last CTA)
          if (validatedCTAs.size < totalSlides) {
            await test.step('Advance to next slide', async () => {
              await pm.onHomePage().navigateAndAcceptCookies();
              await pm.onHomePage().clickCarouselNextButton();
            });
          }
        });
      }

      // STEP 2.5 — Summary of validated CTAs
      await test.step('Summary of validated CTAs', async () => {
        console.log('\n\n==================== ✓ CAROUSEL CTA VALIDATION SUMMARY ====================');
        console.log(`Total unique CTAs validated: ${ctaList.length}`);
        console.log('---------------------------------------------------------------');
        ctaList.forEach(cta => {
          console.log(`${cta.order}. ${cta.href}`);
          console.log(`   └─ Page Title: "${cta.pageTitle}"`);
        });
        console.log('=========================================================================\n');
      });
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
    
    const viewports = testData.responsiveness.viewports;

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate at 375px (mobile)
    await test.step(`Validate layout and responsiveness at ${viewports[0].width}px (${viewports[0].name})`, async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(viewports[0].width);
    });

    // STEP 2 — Validate at 768px (tablet)
    await test.step(`Validate layout and responsiveness at ${viewports[1].width}px (${viewports[1].name})`, async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(viewports[1].width);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC26 completed successfully - validated ${viewports.length} viewports`);
    });
  });

});