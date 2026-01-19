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
  // 🔵 TC01 — Validate Main Titles on the Home Page
  // ============================================================
  // This test validates the main titles displayed on the Home Page.
  test('TC01 — Validate Main Titles on the Home Page', async ({ pm }, testInfo) => {

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
      console.log(`VALIDATION PASSED: All ${expectedTitles.length} home page titles validated successfully`);
      console.log(`✓ TC01 completed successfully - validated ${expectedTitles.length} titles`);
    });
  });

  // ============================================================
  // 🔵 TC02 — Validate Country Banners (Ski Resorts)
  // ============================================================
  // This test validates country banner boxes and their redirections.
  test('TC02 — Validate Country Banners (Ski Resorts)', async ({ pm }, testInfo) => {

    const bannerData = testData.homePage.countryBanners;

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
      console.log(`VALIDATION PASSED: All ${bannerCount} country banners validated with correct redirections`);
      console.log(`✓ TC02 completed successfully - validated ${bannerCount} banners`);
    });
  });

  // ============================================================
  // 🔵 TC03 — Validate CTA Boxes (Call To Action)
  // ============================================================
  // This test validates all CTA boxes, their titles, and their redirections.
  test('TC03 — Validate CTA Boxes (Call To Action)', async ({ pm }, testInfo) => {

    const ctaBoxesData = testData.homePage.ctaBoxes;

    // STEP 1 — Fetch CTA boxes list (optional, only for logging)
    await pm.onHomePage().getCtaBoxesList();

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await pm.onHomePage().validateCtaBoxesList(ctaBoxesData.data);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`VALIDATION PASSED: All ${ctaBoxesData.data.length} CTA boxes titles and redirections validated successfully`);
      console.log(`✓ TC03 completed successfully - validated ${ctaBoxesData.data.length} CTA boxes`);
    });
  });

  // ============================================================
  // 🔵 TC04 — Validate Carousel CTA Button
  // ============================================================
  // This test validates the CTA button for each carousel slide.
  test('TC04 — Validate Carousel CTA Button', async ({ pm }, testInfo) => {

    // STEP 1 — Count carousel slides
    let totalSlides: number = 0;
    await test.step('Count carousel slides', async () => {
      totalSlides = await pm.onHomePage().getCarouselSlideCount();
    });

    // STEP 2 — Validate each carousel slide (with or without CTA)
    await test.step('Validate each carousel slide', async () => {
      const slideResults: { slideNumber: number; hasCTA: boolean; href?: string; pageTitle?: string }[] = [];

      // Iterate through ALL slides (each slide is unique)
      for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
        await test.step(`Validating slide ${slideIndex + 1}/${totalSlides}`, async () => {
          const slideNumber = slideIndex + 1;
          
          // STEP 2.1 — Check if slide has CTA button
          let hasCTA = false;
          await test.step('Check if CTA button exists', async () => {
            hasCTA = await pm.onHomePage().hasCarouselCta();
            if (hasCTA) {
              console.log(`✓ Slide ${slideNumber}: Has CTA button`);
            } else {
              console.log(`ℹ Slide ${slideNumber}: No CTA button`);
              slideResults.push({ slideNumber, hasCTA: false });
            }
          });

          // STEP 2.2 — If has CTA, validate it
          if (hasCTA) {
            await test.step('Validate CTA visibility', async () => {
              await pm.onHomePage().validateCarouselCtaVisibility();
            });

            // STEP 2.3 — Validate CTA navigation and page title (opens in new tab)
            let href: string = '';
            let pageTitle: string = '';
            await test.step('Validate CTA navigation and page title', async () => {
              href = await pm.onHomePage().getCarouselCtaHref();
              await pm.onHomePage().validateCarouselCtaWithPageTitle();
              pageTitle = await pm.onHomePage().getLastValidatedPageTitle();
              slideResults.push({
                slideNumber,
                hasCTA: true,
                href,
                pageTitle
              });
            });
          }

          // STEP 2.4 — Advance to next slide (if not last)
          if (slideIndex < totalSlides - 1) {
            await test.step('Advance to next slide', async () => {
              await pm.onHomePage().clickCarouselNextButton();
            });
          }
        });
      }

      // STEP 2.5 — Summary of all slides
      await test.step('Summary of carousel validation', async () => {
        console.log('\n\n==================== ✓ CAROUSEL VALIDATION SUMMARY ====================');
        console.log(`Total slides: ${totalSlides}`);
        console.log(`Slides with CTA: ${slideResults.filter(s => s.hasCTA).length}`);
        console.log(`Slides without CTA: ${slideResults.filter(s => !s.hasCTA).length}`);
        console.log('---------------------------------------------------------------');
        slideResults.forEach(slide => {
          if (slide.hasCTA) {
            console.log(`Slide ${slide.slideNumber}: ${slide.href}`);
            console.log(`   └─ Page Title: "${slide.pageTitle}"`);
          } else {
            console.log(`Slide ${slide.slideNumber}: No CTA button`);
          }
        });
        console.log('=========================================================================\n');
        console.log(`VALIDATION PASSED: All ${totalSlides} carousel slides validated with CTA verification`);
      });
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC04 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC05 — Validate Inline Links in Sections
  // ============================================================
  // This test validates inline links inside two Home Page sections:
  // 1) Speak to the ski experts
  // 2) Find Your Skiing Holiday
  test('TC05 — Validate Inline Links in Sections', async ({ pm }, testInfo) => {

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
      console.log('VALIDATION PASSED: Speak to Experts section inline links validated');
      console.log('VALIDATION PASSED: Find Your Skiing Holiday section inline links validated');
      console.log('✓ Inline links validation completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC06 — Validate Page Responsiveness (Mobile + Tablet)
  // ============================================================
  test('TC06 — Validate Page Responsiveness (Mobile/Tablet)', async ({ pm }, testInfo) => {

    const viewports = testData.responsiveness.viewports;

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Validate at 375px (mobile)
    await test.step(`Validate layout and responsiveness at ${viewports[0].width}px (${viewports[0].name})`, async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(viewports[0].width);
      console.log(`VALIDATION PASSED: Page layout validated at ${viewports[0].width}px (${viewports[0].name})`);
    });

    // STEP 2 — Validate at 768px (tablet)
    await test.step(`Validate layout and responsiveness at ${viewports[1].width}px (${viewports[1].name})`, async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(viewports[1].width);
      console.log(`VALIDATION PASSED: Page layout validated at ${viewports[1].width}px (${viewports[1].name})`);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`✓ TC06 completed successfully - validated ${viewports.length} viewports`);
    });
  });

});