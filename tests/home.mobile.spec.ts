import { test } from '../support/baseTest';
import testData from './fixtures/testdata.json';

// ================================================================
// Test Suite: Home Page Mobile
// ================================================================

// Helper function to block Sleeknote
async function blockSleeknote(page: any) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      [class*="sleeknote"],
      sleeknote-top,
      sleeknote-bottom,
      sleeknote-left,
      sleeknote-right {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    const observer = new MutationObserver(() => {
      const sleeknoteElements = document.querySelectorAll('[class*="sleeknote"], sleeknote-top, sleeknote-bottom, sleeknote-left, sleeknote-right');
      sleeknoteElements.forEach(el => el.remove());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

test.describe('Home Page Mobile', () => {

  // BEFORE EACH - Configure mobile viewport and navigate
  test.beforeEach(async ({ pm }) => {
    const page = pm.getPage();

    // Block Sleeknote requests
    await page.route('**/*sleeknote*/**', route => route.abort());
    await page.route('**/*.sleeknote.*', route => route.abort());

    await test.step('✓ Set mobile viewport (375x812)', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    await test.step('✓ Navigate to the homepage and handle cookie banner', async () => {
      await pm.onHomePage().navigateAndAcceptCookies();
      await blockSleeknote(page);
    });

    await test.step('✓ Handle Sleeknote popup if present', async () => {
      await pm.onHomePage().handleSleeknotePopup();
    });
  });

  // ============================================================
  // 🔵 TC15-MOBILE — Validate Main Titles on the Home Page (Mobile)
  // ============================================================
  // This test validates the main titles displayed on the Home Page in mobile view.
  test('TC15-MOBILE — Validate Main Titles on the Home Page (Mobile)', async ({ pm }, testInfo) => {

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
      console.log(`VALIDATION PASSED: All ${expectedTitles.length} home page titles validated successfully (Mobile)`);
      console.log(`✓ TC15-MOBILE completed successfully - validated ${expectedTitles.length} titles`);
    });
  });

  // ============================================================
  // 🔵 TC16-MOBILE — Validate Country Banners (Ski Resorts) (Mobile)
  // ============================================================
  // This test validates country banner boxes and their redirections in mobile view.
  test('TC16-MOBILE — Validate Country Banners (Ski Resorts) (Mobile)', async ({ pm }, testInfo) => {

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
      console.log(`VALIDATION PASSED: All ${bannerCount} country banners validated with correct redirections (Mobile)`);
      console.log(`✓ TC16-MOBILE completed successfully - validated ${bannerCount} banners`);
    });
  });

  // ============================================================
  // 🔵 TC17-MOBILE — Validate CTA Boxes (Call To Action) (Mobile)
  // ============================================================
  // This test validates all CTA boxes, their titles, and their redirections in mobile view.
  test('TC17-MOBILE — Validate CTA Boxes (Call To Action) (Mobile)', async ({ pm }, testInfo) => {

    const ctaBoxesData = testData.homePage.ctaBoxes;

    // STEP 1 — Fetch CTA boxes list (optional, only for logging)
    await pm.onHomePage().getCtaBoxesList();

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await pm.onHomePage().validateCtaBoxesList(ctaBoxesData.data);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log(`VALIDATION PASSED: All ${ctaBoxesData.data.length} CTA boxes titles and redirections validated successfully (Mobile)`);
      console.log(`✓ TC17-MOBILE completed successfully - validated ${ctaBoxesData.data.length} CTA boxes`);
    });
  });

  // ============================================================
  // 🔵 TC22-MOBILE — Validate Carousel CTA Button (Mobile)
  // ============================================================
  // This test validates the CTA button for each carousel slide in mobile view.
  test('TC22-MOBILE — Validate Carousel CTA Button (Mobile)', async ({ pm }, testInfo) => {

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
              await pm.onHomePage().clickCarouselNextButton(slideIndex, totalSlides, true);
            });
          }
        });
      }

      // STEP 2.5 — Summary of all slides
      await test.step('Summary of carousel validation', async () => {
        console.log('\n\n==================== ✓ CAROUSEL VALIDATION SUMMARY (MOBILE) ====================');
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
        console.log(`VALIDATION PASSED: All ${totalSlides} carousel slides validated with CTA verification (Mobile)`);
      });
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC22-MOBILE completed successfully');
    });
  });

  // ============================================================
  // 🔵 TCXX-MOBILE — Validate Inline Links in Sections (Mobile)
  // ============================================================
  // This test validates inline links inside two Home Page sections in mobile view:
  // 1) Speak to the ski experts
  // 2) Find Your Skiing Holiday
  test('TCXX-MOBILE — Validate Inline Links in Sections (Mobile)', async ({ pm }, testInfo) => {

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
      console.log('VALIDATION PASSED: Speak to Experts section inline links validated (Mobile)');
      console.log('VALIDATION PASSED: Find Your Skiing Holiday section inline links validated (Mobile)');
      console.log('✓ Inline links validation completed successfully (Mobile)');
    });
  });

  // ============================================================
  // 🔵 TC26-MOBILE — Validate Mobile Layout Consistency
  // ============================================================
  // This test validates that the page renders correctly in mobile landscape mode (812x375)
  test('TC26-MOBILE — Validate Mobile Layout Consistency', async ({ pm }, testInfo) => {

    // STEP 1 — Set mobile landscape viewport (deitado)
    await test.step('Set mobile landscape viewport (812x375)', async () => {
      await pm.getPage().setViewportSize({ width: 812, height: 375 });
    });

    // STEP 2 — Validate mobile layout at 812px (landscape)
    await test.step('Validate layout and responsiveness at 812px (Mobile Landscape)', async () => {
      await pm.onHomePage().validateResponsivenessAtWidth(812);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('VALIDATION PASSED: Page layout validated at 812px (Mobile Landscape)');
      console.log('✓ TC26-MOBILE completed successfully - mobile landscape layout validated');
    });
  });

});