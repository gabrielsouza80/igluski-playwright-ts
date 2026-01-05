import { test, expect } from '../support/baseTest';

// ================================================================
// Test Suite: Componets Page
// ================================================================

test.describe('Componets Page', () => {

    // BEFORE EACH
    test.beforeEach(async ({ pm }) => {
        await test.step('✓ Navigate to the Home Page and handle cookie banner', async () => {
            await pm.onHomePage().navigateAndAcceptCookies();
        });
    });

    // ============================================================
    // 🔵 TC1 — Validate Header Logo Navigation
    // ============================================================
    // This test validates the header logo: visibility, click action, and redirect.
    test('TC1 — Validate Logo Navigation', async ({ pm }, testInfo) => {

        test.setTimeout(60000);

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate header logo visibility
        await test.step('Validate header logo visibility', async () => {
            await pm.onComponentsPage().validateHeaderLogo();
        });

        // STEP 2 — Click the header logo
        await test.step('Click the header logo', async () => {
            await pm.onComponentsPage().clickHeaderLogo();
        });

        // STEP 3 — Validate redirect to pm.onComponentsPage()page
        await test.step('Validate redirection to Home Page', async () => {
            await pm.onComponentsPage().validateHeaderLogoRedirect();
        });

        // STEP 4 — Finish test
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

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Locate header navigation items
        await test.step('Locate header navigation items', async () => {
            await pm.onComponentsPage().locateHeaderNavItems();
        });

        // STEP 2 — Validate header navigation visibility
        await test.step('Validate header navigation visibility', async () => {
            await pm.onComponentsPage().validateHeaderNavVisibility();
        });

        // STEP 3 — Capture menu snapshot
        await test.step('Capture menu snapshot', async () => {
            await pm.onComponentsPage().captureMenuSnapshot();
        });

        // STEP 4 — Validate all main menu navigation
        await test.step('Validate main menu navigation', async () => {
            await pm.onComponentsPage().validateMainMenus();
        });

        // STEP 5 — Validate all submenu navigation
        await test.step('Validate submenu navigation', async () => {
            await pm.onComponentsPage().validateSubMenus();
        });

        // STEP 6 — Finish test
        await test.step('Finish test', async () => {
            await pm.onComponentsPage().closeNavigationPage();

            if (pm.onComponentsPage().tc2Errors.length > 0) {
                console.log("\n==================== TC2 — SUMMARY OF ERRORS ====================");

                const summary = pm.onComponentsPage().tc2Errors.join("\n");

                console.log(summary);
                console.log("=================================================================\n");

                // Attach full summary to the Playwright report
                await testInfo.attach("TC2 — Errors Summary", {
                    body: summary,
                    contentType: "text/plain"
                });

            } else {
                console.log("✓ TC2 completed successfully — no errors found");
            }
        });
    });


    // ============================================================
    // 🔵 TC3 — Validate Contact Information in the Header
    // ============================================================
    // This test validates the phone number, Contact Us text, and Contact Us redirection.
    test('TC3 — Validate Contact Information in the Header', async ({ pm }, testInfo) => {

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Check if phone number element exists
        await test.step('Validate header phone number', async () => {
            await pm.onComponentsPage().validateHeaderPhone();
        });

        // STEP 2 — Validate phone number text
        await test.step('Validate phone number text in the header', async () => {
            await pm.onComponentsPage().validateHeaderPhone();
        });

        // STEP 3 — Check if Contact Us link exists
        await test.step('Check if Contact Us link exists', async () => {
            await expect(pm.onComponentsPage().contactUsLink).toBeVisible();
        });

        // STEP 4 — Validate Contact Us link text
        await test.step('Validate Contact Us link text in the header', async () => {
            await pm.onComponentsPage().validateHeaderContactText();
        });

        // STEP 5 — Validate Contact Us redirection
        await test.step('Validate Contact Us redirection', async () => {
            await pm.onComponentsPage().validateHeaderContactRedirect();
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

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate Recently Viewed button text
        await test.step('Validate Recently Viewed button text', async () => {
            await pm.onComponentsPage().validateRecentlyViewedButtonText();
        });

        // STEP 2 — Click button and validate panel
        await test.step('Click Recently Viewed button and validate panel', async () => {
            await pm.onComponentsPage().validateRecentlyViewedButton();
        });

        // STEP 3 — Finish test
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

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate Customer Portal button text
        await test.step('Validate Customer Portal button text', async () => {
            await pm.onComponentsPage().validateCustomerPortalButtonText();
        });

        // STEP 2 — Click Customer Portal button
        await test.step('Click Customer Portal button', async () => {
            await pm.onComponentsPage().clickCustomerPortalButton();
        });

        // STEP 3 — Wait for AJAX content to load
        await test.step('Wait for AJAX content to load', async () => {
            await pm.onComponentsPage().waitForCustomerPortalAjax();
        });

        // STEP 4 — Validate Customer Portal required fields
        await test.step('Validate Customer Portal required fields', async () => {
            await pm.onComponentsPage().validateCustomerPortalFields();
        });

        // STEP 5 — Finish test
        await test.step('Finish test', async () => {
            console.log('✓ TC5 completed successfully');
        });
    });

    // ============================================================
    // 🔵 TC6 — Validate Ratings & Reviews in the Header
    // ============================================================
    // This test validates the Ratings & Reviews link, its text, and the redirection.
    test('TC6 — Validate Ratings & Reviews in the Header', async ({ pm }, testInfo) => {

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate Ratings & Reviews link text
        await test.step('Validate Ratings & Reviews link text', async () => {
            await pm.onComponentsPage().validateRatingsAndReviewsText();
        });

        // STEP 2 — Click the Ratings & Reviews link
        await test.step('Click the Ratings & Reviews link', async () => {
            await pm.onComponentsPage().clickRatingsAndReviews();
        });

        // STEP 3 — Validate redirect to the Reviews page
        await test.step('Validate redirect to the Reviews page', async () => {
            await pm.onComponentsPage().validateRatingsAndReviewsRedirect();
        });

        // STEP 4 — Validate Reviews page title
        await test.step('Validate Reviews page title', async () => {
            await pm.onComponentsPage().validateReviewsPageTitle();
        });

        // STEP 5 — Finish test
        await test.step('Finish test', async () => {
            console.log('✓ TC6 completed successfully');
        });
    });

    // ============================================================
    // 🔵 TC18 — Validate Contact Section (Phone, Email, Newsletter)
    // ============================================================
    // This test validates the three contact blocks displayed on the Home Page.
    test('TC18 — Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate phone block
        await test.step('Validate phone block', async () => {
            await pm.onComponentsPage().validateContactPhoneBlock();
        });

        // STEP 2 — Validate email block
        await test.step('Validate email block', async () => {
            await pm.onComponentsPage().validateContactEmailBlock();
        });

        // STEP 3 — Validate newsletter block
        await test.step('Validate newsletter block', async () => {
            await pm.onComponentsPage().validateContactNewsletterBlock();
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
        test.setTimeout(300000);

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Ensure footer container is visible
        await test.step('Ensure footer container is visible', async () => {
            await expect(pm.onComponentsPage().footerContainer).toBeVisible();
        });

        // STEP 2 — Scroll to footer
        await test.step('Scroll to footer', async () => {
            await pm.onComponentsPage().footerContainer.scrollIntoViewIfNeeded();
        });

        // STEP 3 — Wait for footer to render
        await test.step('Wait for footer to render', async () => {
            await pm.onComponentsPage().waitForFooterToRender();
        });

        // STEP 4 — Expand all footer sections (mobile only)
        await test.step('Expand all footer sections', async () => {
            await pm.onComponentsPage().expandAllFooterSections();
        });

        // STEP 5 — Fetch footer items list
        const footerItems = await pm.onComponentsPage().getFooterItemsList();

        // STEP 6 — Validate footer items count
        await test.step('Validate footer items count', async () => {
            expect(footerItems.length).toBeGreaterThan(0);
            console.log(`✓ Found ${footerItems.length} footer items`);
        });

        // STEP 7 — Validate visibility of each footer item
        await test.step('Validate visibility of each footer item', async () => {
            for (const item of footerItems) {
                if (!item.url || !item.sectionId) continue;

                const locator = pm.onComponentsPage().getFooterItemLocator(item.sectionId, item.url);
                await expect(locator).toBeVisible();
            }
        });

        // STEP 8 — Validate text of each footer item
        await test.step('Validate text of each footer item', async () => {
            for (const item of footerItems) {
                if (!item.url || !item.sectionId) continue;

                const locator = pm.onComponentsPage().getFooterItemLocator(item.sectionId, item.url);
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
            await pm.onComponentsPage().validateAllFooterLinks(footerItems);
        });

        // STEP 11 — Finish test
        await test.step('Finish test', async () => {
            await pm.onComponentsPage().closeFooterNavigationPage();
            console.log("✓ TC20 completed successfully");
        });
    });

    // ============================================================
    // 🔵 TC28 — Validate "Search by Holiday ID" Button in Footer
    // ============================================================
    test('TC28 — Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {
        test.setTimeout(120000);

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate Holiday ID Search
        await test.step('Validate Holiday ID Search in Footer', async () => {
            await pm.onComponentsPage().validateHolidayIdSearch();
        });

        // STEP 2 — Finish test
        await test.step('Finish test', async () => {
            console.log("✓ TC28 completed successfully");
        });
    });
}); 
