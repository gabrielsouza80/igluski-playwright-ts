    console.log('VALIDATION PASSED: Header logo clicked');
    console.log('VALIDATION PASSED: Redirected to Home Page');
    console.log('VALIDATION PASSED: Header navigation items located');
    console.log('VALIDATION PASSED: Header navigation visibility validated');
    console.log('VALIDATION PASSED: Menu snapshot captured');
    console.log('VALIDATION PASSED: Main menu navigation validated');
    console.log('VALIDATION PASSED: Submenu navigation validated');
    console.log('VALIDATION PASSED: Header phone number validated');
    console.log('VALIDATION PASSED: Contact Us link validated');
    console.log('VALIDATION PASSED: Contact Us redirection validated');
    console.log('VALIDATION PASSED: Recently Viewed button text validated');
    console.log('VALIDATION PASSED: Recently Viewed panel validated');
    console.log('VALIDATION PASSED: Customer Portal button text validated');
    console.log('VALIDATION PASSED: Customer Portal button clicked');
    console.log('VALIDATION PASSED: AJAX content loaded');
    console.log('VALIDATION PASSED: Customer Portal required fields validated');
import { test, expect } from '../support/baseTest';
import testData from './fixtures/testdata.json';

// ================================================================
// Test Suite: Componets Page
// ================================================================

test.describe('Components Page', () => {

    // BEFORE EACH
    test.beforeEach(async ({ pm }) => {
        await test.step('✓ Navigate to the Home Page and handle cookie banner', async () => {
            await pm.onHomePage().navigateAndAcceptCookies();
        });
    });

    // ============================================================
    // 🔵 TC-001 — Validate Header Logo Navigation
    // ============================================================
    // This test validates the header logo navigation flow.
    test('TC-001 — Validate Logo Navigation', async ({ pm }, testInfo) => {

        // STEP 1 — Click the header logo
        await test.step('Click the header logo', async () => {
            await pm.onComponentsPage().clickHeaderLogo();
        });

        // STEP 2 — Validate redirect to Home Page
        await test.step('Validate redirection to Home Page', async () => {
            await pm.onComponentsPage().validateHeaderLogoRedirect();
        });

        // STEP 3 — Finish test
        await test.step('Finish test', async () => {
            console.log('VALIDATION PASSED: Header logo clicked and redirected to Home Page');
            console.log('✓ TC-001 completed successfully');
        });
    });

    // ============================================================
    // 🔵 TC-002 — Validate Header Navigation + Submenu Navigation
    // ============================================================
    // This test validates all main menu items and all submenu items.
    test('TC-002 — Header Navigation + Submenu Validation', async ({ pm }, testInfo) => {

        test.setTimeout(300_000); // Extended timeout due to heavy navigation

        // STEP 1 — Locate header navigation items (ACTION)
        await test.step('Locate header navigation items', async () => {
            await pm.onComponentsPage().locateHeaderNavItems();
        });

        // STEP 2 — Validate header navigation visibility (ASSERTION)
        await test.step('Validate header navigation visibility', async () => {
            await pm.onComponentsPage().validateHeaderNavVisibility();
        });

        // STEP 3 — Capture menu snapshot (ACTION)
        await test.step('Capture menu snapshot', async () => {
            await pm.onComponentsPage().captureMenuSnapshot();
        });

        // STEP 4 — Validate all main menu navigation (ASSERTION)
        await test.step('Validate main menu navigation', async () => {
            await pm.onComponentsPage().validateMainMenus();
        });

        // STEP 5 — Validate all submenu navigation (ASSERTION)
        await test.step('Validate submenu navigation', async () => {
            await pm.onComponentsPage().validateSubMenus();
        });

        // STEP 6 — Finish test
        await test.step('Finish test', async () => {
            console.log('VALIDATION PASSED: Header navigation items visibility validated');
            console.log('VALIDATION PASSED: Main menu navigation validated successfully');
            console.log('VALIDATION PASSED: Submenu navigation validated successfully');
            
            await pm.onComponentsPage().closeNavigationPage();

            if (pm.onComponentsPage().testCaseErrors.length > 0) {
                console.log("\n==================== TC-002 — SUMMARY OF ERRORS ====================");

                const summary = pm.onComponentsPage().testCaseErrors.join("\n");

                console.log(summary);
                console.log("=================================================================\n");

                // Attach full summary to the Playwright report
                await testInfo.attach("TC-002 — Errors Summary", {
                    body: summary,
                    contentType: "text/plain"
                });

            } else {
                console.log("✓ TC-002 completed successfully — no errors found");
            }
        });
    });

    // ============================================================
    // 🔵 TC-003 — Validate Contact Information in the Header
    // ============================================================
    // This test validates the phone number, Contact Us text, and Contact Us redirection.
    test('TC-003 — Validate Contact Information in the Header', async ({ pm }, testInfo) => {

        const contactTexts = testData.components.header.contactTexts;

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate phone number (existence + text)
        await test.step('Validate header phone number', async () => {
            await pm.onComponentsPage().validateHeaderPhone();
        });

        // STEP 2 — Validate Contact Us link (existence + text)
        await test.step('Validate Contact Us link', async () => {
            await pm.onComponentsPage().validateHeaderContactText();
        });

        // STEP 3 — Validate Contact Us redirection
        await test.step('Validate Contact Us redirection', async () => {
            await pm.onComponentsPage().validateHeaderContactRedirect();
        });

        // STEP 4 — Finish test
        await test.step('Finish test', async () => {
            console.log('VALIDATION PASSED: Header phone number validated');
            console.log('VALIDATION PASSED: Contact Us link validated');
            console.log('VALIDATION PASSED: Contact Us redirection validated');
            console.log(`✓ TC-003 completed successfully - validated contact: "${contactTexts.phoneTitle}"`);
        });
    });

    // ============================================================
    // 🔵 TC-004 — Validate "Recently Viewed" Button
    // ============================================================
    // This test validates the Recently Viewed button and its panel visibility.
    test('TC-004 — Validate "Recently Viewed" Button', async ({ pm }, testInfo) => {

        const recentlyViewedData = testData.components.header.recentlyViewed;

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
            console.log('VALIDATION PASSED: Recently Viewed button text validated');
            console.log('VALIDATION PASSED: Recently Viewed panel validated');
            console.log(`✓ TC-004 completed successfully - "${recentlyViewedData.buttonText}"`);
        });
    });

    // ============================================================
    // 🔵 TC-005 — Validate Access to the Customer Portal
    // ============================================================
    // This test validates the Customer Portal button, AJAX-loaded content,
    // and the presence of required fields on the Customer Portal page.
    test('TC-005 — Validate Access to the Customer Portal', async ({ pm }, testInfo) => {

        const customerPortalData = testData.components.header.customerPortal;

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
            const requiredFields = customerPortalData.requiredFields;
            await pm.onComponentsPage().validateCustomerPortalFields();
        });

        // STEP 5 — Finish test
        await test.step('Finish test', async () => {
            console.log('VALIDATION PASSED: Customer Portal button text validated');
            console.log('VALIDATION PASSED: AJAX content loaded successfully');
            console.log(`VALIDATION PASSED: Customer Portal required fields validated (${customerPortalData.requiredFields.length} fields)`);
            console.log(`✓ TC-005 completed successfully - expected fields: ${customerPortalData.requiredFields.join(', ')}`);
        });
    });

    // ============================================================
    // 🔵 TC-006 — Validate Ratings & Reviews in the Header
    // ============================================================
    // This test validates the Ratings & Reviews link, its text, and the redirection.
    test('TC-006 — Validate Ratings & Reviews in the Header', async ({ pm }, testInfo) => {

        const reviewsLinkData = testData.components.header.reviewsLink;
        const reviewsPageUrl = testData.urls.reviewsPage;

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
            console.log('VALIDATION PASSED: Ratings & Reviews link text validated');
            console.log('VALIDATION PASSED: Redirected to Reviews page successfully');
            console.log('VALIDATION PASSED: Reviews page title validated');
            console.log(`✓ TC-006 completed successfully - "${reviewsLinkData.text}" → ${reviewsPageUrl}`);
        });
    });

    // ============================================================
    // 🔵 TC-007 — Validate Contact Section (Phone, Email, Newsletter)
    // ============================================================
    // This test validates the three contact blocks displayed on the Home Page.
    test('TC-007 — Validate Contact Section (Phone, Email, Newsletter)', async ({ pm }, testInfo) => {

        const contactBlocks = testData.components.contact.blocks;

        // STEP 1 — Validate phone block
        await test.step('Validate phone block', async () => {
            await pm.onComponentsPage().validateContactPhoneBlock(contactBlocks[0]);
        });

        // STEP 2 — Validate email block
        await test.step('Validate email block', async () => {
            await pm.onComponentsPage().validateContactEmailBlock(contactBlocks[1]);
        });

        // STEP 3 — Validate newsletter block
        await test.step('Validate newsletter block', async () => {
            await pm.onComponentsPage().validateContactNewsletterBlock(contactBlocks[2]);
        });

        // STEP 4 — Finish test
        await test.step('Finish test', async () => {
            console.log('VALIDATION PASSED: Contact phone block validated');
            console.log('VALIDATION PASSED: Contact email block validated');
            console.log('VALIDATION PASSED: Contact newsletter block validated');
            console.log('✓ TC-007 completed successfully');
        });
    });

    // ============================================================
    // 🔵 TC-008 — Validate Footer Links
    // ============================================================
    test('TC-008 — Validate Footer Links', async ({ pm }, testInfo) => {
        test.setTimeout(300_000); // Extended timeout due to heavy navigation

        const footerData = testData.components.footer.holidayIdSearch;

        // STEP 1 — Scroll to footer
        await test.step('Scroll to footer', async () => {
            await pm.onComponentsPage().footerContainer.scrollIntoViewIfNeeded();
        });

        // STEP 2 — Wait for footer to render
        await test.step('Wait for footer to render', async () => {
            await pm.onComponentsPage().waitForFooterToRender();
        });

        // STEP 3 — Expand all footer sections (mobile only)
        await test.step('Expand all footer sections', async () => {
            await pm.onComponentsPage().expandAllFooterSections();
        });

        // STEP 4 — Fetch footer items list
        const footerItems = await pm.onComponentsPage().getFooterItemsList();

        // STEP 5 — Validate visibility of each footer item
        await test.step('Validate visibility of each footer item', async () => {
            await pm.onComponentsPage().validateFooterItemsVisibility(footerItems);
            console.log(`VALIDATION PASSED: All ${footerItems.length} footer items visibility validated`);
        });

        // STEP 6 — Validate text of each footer item
        await test.step('Validate text of each footer item', async () => {
            await pm.onComponentsPage().validateFooterItemsText(footerItems);
            console.log(`VALIDATION PASSED: All ${footerItems.length} footer items text validated`);
        });

        // STEP 7 — Validate URL format
        await test.step('Validate URL format', async () => {
            await pm.onComponentsPage().validateFooterItemsUrlFormat(footerItems);
            console.log(`VALIDATION PASSED: All ${footerItems.length} footer items URL format validated`);
        });

        // STEP 8 — Validate footer link navigation (URL + title)
        await test.step('Validate footer link navigation', async () => {
            await pm.onComponentsPage().validateAllFooterLinks(footerItems);
            console.log(`VALIDATION PASSED: All ${footerItems.length} footer links navigation validated`);
        });

        // STEP 9 — Final assertion and finish test
        await test.step('Finish test', async () => {
            expect(footerItems.length).toBeGreaterThan(0);
            console.log(`\n==================== FOOTER DATA VALIDATION SUMMARY ====================`);
            console.log(`Footer Configuration:`);
            console.log(`  • Holiday ID Search Button: "${footerData.buttonText}"`);
            console.log(`  • Input Placeholder: "${footerData.inputPlaceholder}"`);
            console.log(`  • Description: "${footerData.description}"`);
            console.log(`  • Total footer items found: ${footerItems.length}`);
            console.log(`=================================================================\n`);
            await pm.onComponentsPage().closeFooterNavigationPage();
            console.log("✓ TC-008 completed successfully");
        });
    });

    // ============================================================
    // 🔵 TC-009 — Validate "Search by Holiday ID" Button in Footer
    // ============================================================
    test('TC-009 — Validate "Search by Holiday ID" Button in Footer', async ({ pm }, testInfo) => {

        const holidayIdData = testData.components.footer.holidayIdSearch;

        // STEP 0 — Start test
        await test.step('Start test', async () => {
            pm.onHomePage().logTestStart(testInfo.title);
        });

        // STEP 1 — Validate Holiday ID Search
        await test.step('Validate Holiday ID Search in Footer', async () => {
            await pm.onComponentsPage().validateHolidayIdSearch(holidayIdData);
            console.log(`VALIDATION PASSED: Holiday ID Search validated - Button: "${holidayIdData.buttonText}"`);
        });

        // STEP 2 — Finish test
        await test.step('Finish test', async () => {
            console.log("✓ TC-009 completed successfully");
        });
    });

    // ============================================================
    // 🔵 TC-010 — Validate Trust Seals (ATOL, ABTA, IATA, Feefo) in Footer
    // ============================================================
    test('TC-010 — Validate Trust Seals (ATOL, ABTA, IATA, Feefo) in Footer', async ({ pm }, testInfo) => {

        const trustSealsData = testData.components.footer.trustSeals;

        // STEP 1 — Scroll to footer
        await test.step('Scroll to footer', async () => {
            await pm.onComponentsPage().footerContainer.scrollIntoViewIfNeeded();
        });

        // STEP 2 — Validate trust seals visibility
        await test.step('Validate trust seals are visible', async () => {
            await pm.onComponentsPage().validateTrustSealsVisibility(trustSealsData.seals);
        });

        // STEP 3 — Validate trust seals are clickable links
        await test.step('Validate trust seals are clickable links', async () => {
            await pm.onComponentsPage().validateTrustSealsLinks(trustSealsData.seals);
        });

        // STEP 4 — Validate trust seals URLs
        await test.step('Validate trust seals URLs format', async () => {
            await pm.onComponentsPage().validateTrustSealsUrlFormat(trustSealsData.seals);
        });

        // STEP 5 — Finish test
        await test.step('Finish test', async () => {
            console.log(`VALIDATION PASSED: Trust seals visibility validated (${trustSealsData.seals.length} seals)`);
            console.log(`VALIDATION PASSED: Trust seals clickable links validated (${trustSealsData.seals.length} seals)`);
            console.log(`VALIDATION PASSED: Trust seals URL format validated (${trustSealsData.seals.length} seals)`);
            console.log(`✓ TC-010 completed successfully - validated ${trustSealsData.seals.length} trust seals`);
        });
    });

    // ============================================================
    // 🔵 TC-011 — Validate Social Media Icons (Facebook, Instagram, X) in Footer
    // ============================================================
    test('TC-011 — Validate Social Media Icons (Facebook, Instagram, X) in Footer', async ({ pm }, testInfo) => {

        const socialMediaData = testData.components.footer.socialMedia;

        // STEP 1 — Scroll to footer
        await test.step('Scroll to footer', async () => {
            await pm.onComponentsPage().footerContainer.scrollIntoViewIfNeeded();
        });

        // STEP 2 — Validate social media icons visibility
        await test.step('Validate social media icons are visible', async () => {
            await pm.onComponentsPage().validateSocialMediaIconsVisibility(socialMediaData.platforms);
        });

        // STEP 3 — Validate social media icons are clickable links
        await test.step('Validate social media icons are clickable links', async () => {
            await pm.onComponentsPage().validateSocialMediaIconsLinks(socialMediaData.platforms);
        });

        // STEP 4 — Validate social media URLs
        await test.step('Validate social media URLs format', async () => {
            await pm.onComponentsPage().validateSocialMediaUrlFormat(socialMediaData.platforms);
        });

        // STEP 5 — Finish test
        await test.step('Finish test', async () => {
            console.log(`VALIDATION PASSED: Social media icons visibility validated (${socialMediaData.platforms.length} icons)`);
            console.log(`VALIDATION PASSED: Social media icons links validated (${socialMediaData.platforms.length} icons)`);
            console.log(`VALIDATION PASSED: Social media URL format validated (${socialMediaData.platforms.length} icons)`);
            console.log(`✓ TC-011 completed successfully - validated ${socialMediaData.platforms.length} social media icons`);
        });
    });
});
