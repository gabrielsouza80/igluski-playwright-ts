import { test, expect } from '../support/baseTest';

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

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Check if header logo exists
    const logoExists = await test.step('Check if header logo exists', async () => {
      return await home.headerLogo.isVisible();
    });

    // STEP 2 — Locate the header logo
    await test.step('Locate the header logo', async () => {
      await home.locateHeaderLogo();
    });

    // STEP 3 — Validate header logo visibility
    await test.step('Validate that the header logo is visible', async () => {
      await home.validateHeaderLogoVisibility();
    });

    // STEP 4 — Click the header logo
    await test.step('Click the header logo', async () => {
      await home.clickHeaderLogo();
    });

    // STEP 5 — Validate redirect to homepage
    await test.step('Validate redirection to homepage', async () => {
      await home.validateHeaderLogoRedirect();
    });

    // STEP 6 — Finish test
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

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Locate header navigation items
    await test.step('Locate header navigation items', async () => {
      await home.locateHeaderNavItems();
    });

    // STEP 2 — Validate header navigation visibility
    await test.step('Validate header navigation visibility', async () => {
      await home.validateHeaderNavVisibility();
    });

    // STEP 3 — Capture menu snapshot
    await test.step('Capture menu snapshot', async () => {
      await home.captureMenuSnapshot();
    });

    // STEP 4 — Validate all main menu navigation
    await test.step('Validate main menu navigation', async () => {
      await home.validateMainMenus();
    });

    // STEP 5 — Validate all submenu navigation
    await test.step('Validate submenu navigation', async () => {
      await home.validateSubMenus();
    });

    // STEP 6 — Finish test
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

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Check if phone number element exists
    const phoneExists = await test.step('Check if phone number element exists', async () => {
      return await home.phoneLocatorHeader.isVisible();
    });

    // STEP 2 — Validate phone number text
    await test.step('Validate phone number text in the header', async () => {
      await home.validateHeaderPhone();
    });

    // STEP 3 — Check if Contact Us link exists
    const contactExists = await test.step('Check if Contact Us link exists', async () => {
      return await home.contactUsLink.isVisible();
    });

    // STEP 4 — Validate Contact Us link text
    await test.step('Validate Contact Us link text in the header', async () => {
      await home.validateHeaderContactText();
    });

    // STEP 5 — Validate Contact Us redirection
    await test.step('Validate Contact Us redirection', async () => {
      await home.validateHeaderContactRedirect();
    });

    // STEP 6 — Finish test
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

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Check if Recently Viewed button exists
    const buttonExists = await test.step('Check if Recently Viewed button exists', async () => {
      return await home.btnRecentlyViewedHeader.isVisible();
    });

    // STEP 2 — Validate Recently Viewed button text
    await test.step('Validate Recently Viewed button text', async () => {
      await home.validateRecentlyViewedButtonText();
    });

    // STEP 3 — Click Recently Viewed button
    await test.step('Click Recently Viewed button', async () => {
      await home.clickRecentlyViewedButton();
    });

    // STEP 4 — Validate Recently Viewed panel visibility
    await test.step('Validate Recently Viewed panel visibility', async () => {
      await home.validateRecentlyViewedPanel();
    });

    // STEP 5 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC4 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC5 — Validate Access to the Customer Portal
  // ============================================================
  // This test validates the Customer Portal button, AJAX-loaded content,
  // and the presence of required fields on the Customer Portal page.
  test('TC5 — Validate Access to the Customer Portal', async ({ pm }, testInfo) => {
    const home = pm;

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      pm.onHomePage().logTestStart(testInfo.title);
    });

    // STEP 1 — Check if Customer Portal button exists
    const buttonExists = await test.step('Check if Customer Portal button exists', async () => {
      return await pm.onHomePage().btnAccessCustomerPortal.isVisible();
    });

    // STEP 2 — Validate Customer Portal button text
    await test.step('Validate Customer Portal button text', async () => {
      await pm.onHomePage().validateCustomerPortalButtonText();
    });

    // STEP 3 — Click Customer Portal button
    await test.step('Click Customer Portal button', async () => {
      await pm.onHomePage().clickCustomerPortalButton();
    });

    // STEP 4 — Wait for AJAX content to load
    await test.step('Wait for AJAX content to load', async () => {
      await pm.onHomePage().waitForCustomerPortalAjax();
    });

    // STEP 5 — Validate Customer Portal required fields
    await test.step('Validate Customer Portal required fields', async () => {
      await pm.onHomePage().validateCustomerPortalFields();
    });

    // STEP 6 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC5 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC6 — Validate Ratings & Reviews in the Header
  // ============================================================
  // This test validates the Ratings & Reviews link, its text, and the redirection.
  test('TC6 — Validate Ratings & Reviews in the Header', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Check if Ratings & Reviews link exists
    const linkExists = await test.step('Check if Ratings & Reviews link exists', async () => {
      return await home.btnReviewLinkHeader.isVisible();
    });

    // STEP 2 — Validate link text
    await test.step('Validate Ratings & Reviews link text', async () => {
      await home.validateRatingsAndReviewsText();
    });

    // STEP 3 — Click the Ratings & Reviews link
    await test.step('Click the Ratings & Reviews link', async () => {
      await home.clickRatingsAndReviews();
    });

    // STEP 4 — Validate redirect to the Reviews page
    await test.step('Validate redirect to the Reviews page', async () => {
      await home.validateRatingsAndReviewsRedirect();
    });

    // STEP 5 — Validate Reviews page title
    await test.step('Validate Reviews page title', async () => {
      await home.validateReviewsPageTitle();
    });

    // STEP 6 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC6 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC15 — Validate Main Titles on the Homepage
  // ============================================================
  // This test validates the main titles displayed on the homepage.
  test('TC15 — Validate Main Titles on the Homepage', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Define expected homepage titles
    const expectedTitles = await test.step('Define expected homepage titles', async () => {
      return [
        "Welcome To The Home Of Ski",
        "Speak to the ski experts",
        "Find Your Skiing Holiday"
      ];
    });

    // STEP 2 — Validate each homepage title individually
    await test.step('Validate each homepage title', async () => {
      for (const title of expectedTitles) {
        await home.validateSingleTitle(title);
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
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Count carousel slides
    const totalSlides = await test.step('Count carousel slides', async () => {
      return await home.getCarouselSlideCount();
    });

    // STEP 2 — Validate each carousel slide
    await test.step('Validate each carousel slide', async () => {
      for (let i = 0; i < totalSlides; i++) {
        await home.validateSingleCarouselSlide(i, totalSlides);
      }
    });

    // STEP 3 — Get country banners list
    const banners = await test.step('Get country banners list', async () => {
      return await home.getCountryBannerList();
    });

    // STEP 4 — Validate each country banner
    await test.step('Validate each country banner and its redirection', async () => {
      for (const banner of banners) {
        if (!banner.url) {
          // Logging happens inside the HomePage class (protected method)
          continue;
        }
        await home.validateSingleCountryBanner(banner.label, banner.url);
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
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Fetch CTA boxes list
    const ctaList = await test.step('Fetch CTA boxes and titles', async () => {
      return await home.getCtaBoxesList();
    });

    // STEP 2 — Validate each CTA box
    await test.step('Validate CTA titles and redirections', async () => {
      await home.validateCtaBoxesList();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC17 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC18 — Validate Contact Section (Phone, Email, Newsletter)
  // ============================================================
  // This test validates the three contact blocks displayed on the homepage.
  test('TC18 — Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

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

    // STEP 4 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC18 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC20 — Validate Footer Links
  // ============================================================
  test('TC20 — Validate Footer Links', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();
    test.setTimeout(300000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Check if footer exists
    await test.step('Check if footer container exists', async () => {
      await expect(home.footerContainer).toBeVisible();
    });

    // STEP 2 — Scroll to footer
    await test.step('Scroll to footer', async () => {
      await home.footerContainer.scrollIntoViewIfNeeded();
    });

    // STEP 3 — Wait for footer to render
    await test.step('Wait for footer to render', async () => {
      await home.waitForFooterToRender();
    });

    // STEP 4 — Expand all footer sections (mobile only)
    await test.step('Expand all footer sections', async () => {
      await home.expandAllFooterSections();
    });

    // STEP 5 — Fetch footer items list
    const footerItems = await test.step('Fetch footer items list', async () => {
      return await home.getFooterItemsList();
    });

    // STEP 6 — Validate footer items count
    await test.step('Validate footer items count', async () => {
      if (footerItems.length === 0) {
        throw new Error("❌ No footer items found");
      }
      console.log(`✓ Found ${footerItems.length} footer items`);
    });

    // STEP 7 — Validate visibility of each footer item
    await test.step('Validate visibility of each footer item', async () => {
      for (const item of footerItems) {
        if (!item.url || !item.sectionId) continue;

        const locator = home.getFooterItemLocator(item.sectionId, item.url);
        await expect(locator).toBeVisible();
      }
    });

    // STEP 8 — Validate text of each footer item
    await test.step('Validate text of each footer item', async () => {
      for (const item of footerItems) {
        if (!item.url || !item.sectionId) continue;

        const locator = home.getFooterItemLocator(item.sectionId, item.url);
        const text = (await locator.innerText()).trim();

        if (!text) {
          throw new Error(`❌ Empty text: ${item.label}`);
        }
      }
    });

    // STEP 9 — Validate URL format
    await test.step('Validate URL format', async () => {
      for (const item of footerItems) {
        if (!item.absoluteUrl) continue;

        if (!item.absoluteUrl.startsWith("https://")) {
          throw new Error(`❌ Invalid URL: ${item.absoluteUrl}`);
        }
      }
    });

    // STEP 10 — Validate footer link navigation (URL + title)
    await test.step('Validate footer link navigation', async () => {
      await home.validateAllFooterLinks(footerItems);
    });

    // STEP 11 — Finish test
    await test.step('Finish test', async () => {
      await home.closeFooterNavigationPage();
      console.log("✓ TC20 completed successfully");
    });
  });

  // ============================================================
  // 🔵 TC22 — Validate Carousel CTA Button
  // ============================================================
  // This test validates the CTA button inside the active carousel slide.
  test('TC22 — Validate Carousel CTA Button', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Validate CTA visibility inside the active slide
    await test.step('Validate CTA visibility inside the active carousel slide', async () => {
      await home.validateCarouselCtaVisibility();
    });

    // STEP 2 — Validate CTA navigation
    await test.step('Validate CTA navigation from the active carousel slide', async () => {
      await home.validateCarouselCtaNavigation();
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log('✓ TC22 completed successfully');
    });
  });

  // ============================================================
  // 🔵 TC — Validate Inline Links in Sections
  // ============================================================
  // This test validates inline links inside two homepage sections:
  // 1) Speak to the ski experts
  // 2) Find Your Skiing Holiday
  test('Validate Inline Links in Sections', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Speak to Experts section
    await test.step('Validate inline links inside the "Speak to Experts" section', async () => {
      await home.validateSpeakToExpertsLinksList();
    });

    // STEP 2 — Validate Find Your Skiing Holiday section
    await test.step('Validate inline links inside the "Find Your Skiing Holiday" section', async () => {
      await home.validateFindYourSkiingHolidayLinksList();
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
    const home = pm.onHomePage();
    test.setTimeout(300000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Validate at 375px (mobile)
    await test.step('Validate layout and responsiveness at 375px (mobile)', async () => {
      await home.validateResponsivenessAtWidth(375);
    });

    // STEP 2 — Validate at 768px (tablet)
    await test.step('Validate layout and responsiveness at 768px (tablet)', async () => {
      await home.validateResponsivenessAtWidth(768);
    });

    // STEP 3 — Finish test
    await test.step('Finish test', async () => {
      console.log("✓ TC26 completed successfully");
    });
  });

  // ============================================================
  // 🔵 TC28 — Validate "Search by Holiday ID" Button in Footer
  // ============================================================
  test('TC28 — Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {
    const home = pm.onHomePage();
    test.setTimeout(120000);

    // STEP 0 — Start test
    await test.step('Start test', async () => {
      home.logTestStart(testInfo.title);
    });

    // STEP 1 — Validate Holiday ID Search
    await test.step('Validate Holiday ID Search in Footer', async () => {
      await home.validateHolidayIdSearch();
    });

    // STEP 2 — Finish test
    await test.step('Finish test', async () => {
      console.log("✓ TC28 completed successfully");
    });
  });

});