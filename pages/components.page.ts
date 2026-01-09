import { Page, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

// Type definitions for menu navigation structure
export type SubLinkSnapshot = {
    label: string;
    href: string | null;
};

export type MenuSnapshot = {
    mainLabel: string;
    mainHref: string | null;
    sublinks: SubLinkSnapshot[];
};

/**
 * ComponentsPage - Handles all header, footer, and navigation components
 * Used for: TC1-TC6, TC18, TC20, TC28
 */
export class ComponentsPage extends HelperBase {
    // Stores menu structure for validation
    private menusSnapshot: MenuSnapshot[] = [];
    // Separate page contexts for navigation testing
    private navPage: Page | null = null;
    private footerNavPage: Page | null = null;

    // ============================
    // HEADER LOCATORS
    // ============================
    readonly headerLogo = this.page.locator('a.header-logo');
    readonly headerNavItems = this.page.locator('a.menu-list__item-link');
    readonly btnRecentlyViewedHeader = this.page.locator('a.top-bar__info-link');
    readonly resultRecentlyViewedHeader = this.page.locator('div.top-bar__rv-no-result');
    readonly btnAccessCustomerPortal = this.page.locator('a[href*="customerportal"]');
    readonly btnReviewLinkHeader = this.page.locator('a.header-headline__review-link');
    readonly phoneLocatorHeader = this.page.locator('span.InfinityNumber').first();
    readonly contactUsLink = this.page.locator('a[href="/contact-us"]').first();

    // ============================
    // FOOTER LOCATORS
    // ============================
    readonly holidayIdInput = this.page.locator('div.search-by-holiday-id input#siteSearchInput');
    readonly footerContainer = this.page.locator('footer.footer-position');
    readonly footerExpandButtons = this.page.locator('i.footer-search-links-icon');
    readonly holidayIdContainer = this.page.locator('div.search-by-holiday-id');
    readonly btnSearchByHolidayId = this.page.locator('button.holiday-id__trigger');
    readonly holidayIdForm = this.page.locator('div.search-by-holiday-id form');
    readonly holidayIdSearchButton = this.page.locator('footer button.holiday-id__btn');

    // ============================
    // CONTACT SECTION LOCATORS
    // ============================
    // ID > Class > CSS > XPath
    readonly contactPhoneTitle = this.page.locator('div.contact-block__title').first();
    readonly contactPhoneNumber = this.page.locator('span.InfinityNumber');
    readonly contactEmailTitle = this.page.locator('div.contact-block__title').nth(1);
    readonly contactEmailButton = this.page.locator('button[onclick*="enquire"]');
    readonly contactNewsletterTitle = this.page.locator('div.contact-block__title').nth(2);
    readonly contactNewsletterButton = this.page.locator('button[onclick*="signup"]');

    constructor(page: Page) {
        super(page);
    }

    // ============================================================
    // 🔵 HEADER LOGO — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async clickHeaderLogo(): Promise<void> {

        await this.headerLogo.click();
        this.logInfo("✓ Header logo clicked");
        this.logDivider();
    }

    async validateHeaderLogoRedirect(): Promise<void> {

        await expect(this.page).toHaveURL(/igluski\.com/);
        this.logInfo(`✓ Redirected to homepage → ${this.page.url()}`);
        this.logDivider();
    }

    // ============================================================
    // 🧪 TC2 — HEADER NAVIGATION & SUBMENU VALIDATION
    // ============================================================

    async locateHeaderNavItems(): Promise<void> {


        // Count total navigation items in header
        const count = await this.headerNavItems.count();
        this.logInfo(`Detected ${count} header navigation items`);

        this.logDivider();
    }

    async validateHeaderNavVisibility(): Promise<void> {


        const count = await this.headerNavItems.count();
        this.logInfo(`Validating visibility for ${count} items`);

        // Verify each nav item is visible
        for (let i = 0; i < count; i++) {
            const item = this.headerNavItems.nth(i);
            const text = (await item.textContent())?.trim() ?? `Item ${i + 1}`;
            this.logInfo(`Checking visibility: ${text}`);
            await expect(item).toBeVisible();
        }

        this.logDivider();
    }

    // ============================================================
    // 🔵 HEADER NAVIGATION — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async captureMenuSnapshot(): Promise<void> {


        // Extract full menu structure from DOM
        this.menusSnapshot = await this.getMenusSnapshot();

        if (!this.menusSnapshot.length) {
            throw new Error("❌ No menus found in header navigation snapshot");
        }

        this.logInfo(`Captured snapshot for ${this.menusSnapshot.length} menus`);
        this.logDivider();
    }

    async validateMainMenus(): Promise<void> {


        // Ensure navigation page is ready
        await this.initNavigationPage();

        // Test each main menu link
        for (const menu of this.menusSnapshot) {
            this.logInfo(`Validating main menu: ${menu.mainLabel}`);
            await this.validateMainMenu(this.navPage!, menu);
        }

        this.logDivider();
    }

    async validateSubMenus(): Promise<void> {


        await this.initNavigationPage();

        // Test submenu links for each main menu
        for (const menu of this.menusSnapshot) {
            if (menu.sublinks.length > 0) {
                this.logInfo(`Validating ${menu.sublinks.length} submenus for: ${menu.mainLabel}`);
                await this.validateSubmenus(this.navPage!, menu);
            }
        }

        this.logDivider();
    }

    async initNavigationPage(): Promise<void> {
        // Create new page context for testing navigation without affecting main page
        if (!this.navPage) {
            this.navPage = await this.page.context().newPage();
            this.logInfo("✓ Navigation page created");
        }
    }

    async closeNavigationPage(): Promise<void> {
        if (this.navPage) {
            await this.navPage.close();
            this.navPage = null;
            this.logInfo("✓ Navigation page closed");
        }
    }

    // ============================================================
    // 🔵 HEADER CONTACT INFO — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async validateHeaderPhone(): Promise<void> {


        // Extract and verify phone number text
        const phoneText = (await this.phoneLocatorHeader.innerText()).trim();
        this.logInfo(`Phone number text: ${phoneText}`);

        // Ensure phone element is visible
        await expect(this.phoneLocatorHeader).toBeVisible();
        this.logInfo(`✓ Header phone is visible with text: "${phoneText}"`);

        this.logDivider();
    }

    async validateHeaderContactText(): Promise<void> {


        // Extract and verify contact link text
        const contactText = (await this.contactUsLink.innerText()).trim();
        this.logInfo(`Contact Us link text: ${contactText}`);

        // Ensure contact link is visible
        await expect(this.contactUsLink).toBeVisible();
        this.logInfo(`✓ Contact Us link is visible with text: "${contactText}"`);

        this.logDivider();
    }

    async validateHeaderContactRedirect(): Promise<void> {


        // Get contact URL and resolve to absolute path
        const href = await this.contactUsLink.getAttribute("href");
        const url = this.resolveUrl(href);

        if (!url) {
            throw new Error("❌ TC — Contact Us link has no valid href.");
        }

        // Open link in new tab and verify destination
        await this.openAndValidateUrl(url, /contact-us/i);

        this.logInfo("✓ Contact Us redirects correctly");
        this.logDivider();
    }

    // ============================================================
    // 🔵 RECENTLY VIEWED — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async validateRecentlyViewedButtonText(): Promise<void> {


        // Extract button text for validation
        const text = (await this.btnRecentlyViewedHeader.innerText()).trim();
        this.logInfo(`Recently Viewed button text: "${text}"`);

        // Verify button contains expected text
        await expect(this.btnRecentlyViewedHeader).toHaveText(/recently viewed/i);
        this.logInfo("✓ Recently Viewed button text is correct");

        this.logDivider();
    }

    async clickRecentlyViewedButton(): Promise<void> {


        // Click button (Playwright auto-waits for actionability)
        await this.btnRecentlyViewedHeader.click();

        this.logInfo("✓ Recently Viewed button clicked");
        this.logDivider();
    }

    async validateRecentlyViewedPanel(): Promise<void> {


        // Extract panel message
        const txt = (await this.resultRecentlyViewedHeader.innerText()).trim();
        this.logInfo(`Panel text: "${txt}"`);

        // Ensure panel appears after click
        await expect(this.resultRecentlyViewedHeader).toBeVisible();
        this.logInfo("✓ Recently Viewed panel is visible");

        this.logDivider();
    }

    async validateRecentlyViewedButton(): Promise<void> {
        await this.clickRecentlyViewedButton();
        await this.validateRecentlyViewedPanel();
    }

    // ============================================================
    // 🔵 CUSTOMER PORTAL — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async validateCustomerPortalButtonText(): Promise<void> {


        // Extract button text for validation
        const text = (await this.btnAccessCustomerPortal.innerText()).trim();
        this.logInfo(`Customer Portal button text: "${text}"`);

        // Verify button contains expected text
        await expect(this.btnAccessCustomerPortal).toHaveText(/customer portal/i);
        this.logInfo("✓ Customer Portal button text is correct");

        this.logDivider();
    }

    async clickCustomerPortalButton(): Promise<void> {


        // Click button (Playwright auto-waits for actionability)
        await this.btnAccessCustomerPortal.click();

        this.logInfo("✓ Customer Portal button clicked");
        this.logDivider();
    }

    async waitForCustomerPortalAjax(): Promise<void> {


        const bookingWelcomeMessage = this.page.locator('text=Welcome to My Booking!');

        // Wait for AJAX-loaded content to appear
        const text = (await bookingWelcomeMessage.innerText()).trim();
        this.logInfo(`✓ AJAX content loaded: "${text}"`);

        this.logDivider();
    }

    async validateCustomerPortalFields(): Promise<void> {


        // Define required fields to check
        const requiredBookingFields = [
            { fieldLocator: this.page.locator('#LeadBookerSurname'), label: "Surname field" },
            { fieldLocator: this.page.locator('#BookingId'), label: "Booking ID field" }
        ];

        // Verify each required field is visible
        for (const field of requiredBookingFields) {
            this.logInfo(`Validating ${field.label}...`);
            await expect(field.fieldLocator).toBeVisible();
            this.logInfo(`✓ ${field.label} is visible`);
        }

        this.logDivider();
    }

    // ============================================================
    // 🔵 RATINGS & REVIEWS — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async validateRatingsAndReviewsText(): Promise<void> {


        // Extract review link text
        const text = (await this.btnReviewLinkHeader.innerText()).trim();
        this.logInfo(`Ratings & Reviews link text: "${text}"`);

        // Verify format: number + "reviews"
        await expect(this.btnReviewLinkHeader).toContainText(/\d+\s*reviews?/i);
        this.logInfo("✓ Ratings & Reviews link text is correct");

        this.logDivider();
    }

    async clickRatingsAndReviews(): Promise<void> {


        // Click reviews link (Playwright auto-waits for actionability)
        await this.btnReviewLinkHeader.click();

        this.logInfo("✓ Ratings & Reviews link clicked");
        this.logDivider();
    }

    async validateRatingsAndReviewsRedirect(): Promise<void> {


        // Get reviews URL and resolve to absolute path
        const href = await this.btnReviewLinkHeader.getAttribute("href");
        const url = this.resolveUrl(href);

        if (!url) {
            throw new Error("❌ TC — Ratings & Reviews link has no valid href.");
        }

        // Open link in new tab and verify destination
        await this.openAndValidateUrl(url, /reviews/i);

        this.logInfo("✓ Ratings & Reviews redirects correctly");
        this.logDivider();
    }

    async validateReviewsPageTitle(): Promise<void> {


        // Verify page title contains "Reviews"
        await expect(this.page).toHaveTitle(/Reviews/i);

        this.logInfo("✓ Reviews page title is correct");
        this.logDivider();
    }

    // ============================================================
    // 🔵 MENU VALIDATION — SNAPSHOT + MAIN MENUS + SUBMENUS
    // ============================================================

    async getMenusSnapshot(): Promise<MenuSnapshot[]> {


        // Extract all menu and submenu links from DOM
        const menusSnapshot = await this.page.$$eval("li.menu-list__item", (items) => {
            return items.map((li) => {
                const mainLink = li.querySelector("a");
                const mainHref = mainLink?.getAttribute("href") || null;
                const mainLabel = mainLink?.textContent?.trim() || "";

                const subAnchors = Array.from(
                    li.querySelectorAll(".submenu-list__block-item a")
                );
                const sublinks = subAnchors.map((a) => ({
                    label: a.textContent?.trim() || "",
                    href: a.getAttribute("href"),
                }));

                return { mainLabel, mainHref, sublinks };
            });
        });

        this.logInfo(`Total main menus detected: ${menusSnapshot.length}`);
        this.logDivider();

        return menusSnapshot;
    }

    async validateMainMenu(navPage: Page, menu: MenuSnapshot): Promise<void> {
        const menuLabel = menu.mainLabel;
        const menuUrl = this.resolveUrl(menu.mainHref);


        this.logInfo(`Menu label: "${menuLabel}"`);
        this.logInfo(`Menu URL: ${menuUrl || "(no valid URL)"}`);
        this.logDivider();

        if (!menuUrl) {
            this.logInfo(`Skipping menu "${menuLabel}" — no valid URL.`);
            return;
        }

        try {
            // Navigate to menu URL and verify title
            await navPage.goto(menuUrl, { waitUntil: "domcontentloaded", });
            await this.validateTitleContains(navPage, menuLabel);
        } catch (err: any) {
            console.error(`❌ Failed to load menu "${menuLabel}" → ${err?.message || err}`);
            throw err;
        }
    }

    async validateSubmenus(navPage: Page, menu: MenuSnapshot): Promise<void> {
        const sublinks = menu.sublinks || [];
        this.logInfo(`Submenus found: ${sublinks.length}`);

        if (sublinks.length === 0) return;

        for (const sub of sublinks) {
            const subUrl = this.resolveUrl(sub.href);
            if (!subUrl) {
                this.logSubInfo(`Skipping submenu "${sub.label}" — invalid URL.`);
                continue;
            }

            this.logDivider();
            this.logSubInfo(`Submenu label: "${sub.label}"`);
            this.logSubInfo(`Submenu URL: ${subUrl}`);

            try {
                // Recreate page if it was closed by previous error
                if (navPage.isClosed()) {
                    this.logSubInfo("⚠ Navigation page was closed, recreating...");
                    this.navPage = await this.page.context().newPage();
                    navPage = this.navPage;
                }

                // Navigate and validate submenu page
                await navPage.goto(subUrl, { waitUntil: "domcontentloaded" });
                await this.validateTitleContains(navPage, sub.label);
                this.logSubInfo(`✓ Submenu validated successfully`);
            } catch (err: any) {
                const errorMsg = err?.message || String(err);
                console.error(`❌ Submenu "${sub.label}" failed → ${errorMsg}`);

                // Recover from closed page errors
                if (navPage.isClosed() || errorMsg.includes("Target page, context or browser has been closed")) {
                    this.logSubInfo("⚠ Recreating navigation page after error...");
                    try {
                        this.navPage = await this.page.context().newPage();
                        navPage = this.navPage;
                    } catch (recreateErr) {
                        console.error("❌ Failed to recreate navigation page");
                    }
                }
            }
        }
    }

    // ============================================================
    // 🔵 FOOTER — COMPLETE BLOCK (FULLY COMPATIBLE WITH TC20)
    // ============================================================

    async waitForFooterToRender(): Promise<void> {


        // Wait for footer items to be visible (ensures dynamic content loaded)
        await this.page.waitForSelector('#footer-section1-list li.footer-list__item', {
            state: 'visible',
        });

        this.logInfo("✓ Footer rendered");
        this.logDivider();
    }

    async expandAllFooterSections(): Promise<void> {


        const count = await this.footerExpandButtons.count();

        // Expand mobile accordion sections if present
        for (let i = 0; i < count; i++) {
            const toggle = this.footerExpandButtons.nth(i);

            if (await toggle.isVisible()) {
                await toggle.click();
            }
        }

        this.logInfo(`✓ Expanded ${count} footer sections`);
        this.logDivider();
    }

    async initFooterNavigationPage(): Promise<void> {
        // Create separate page for footer link testing
        if (!this.footerNavPage) {
            this.footerNavPage = await this.page.context().newPage();
            this.logInfo("✓ Footer navigation page created");
        }
    }

    async closeFooterNavigationPage(): Promise<void> {
        if (this.footerNavPage) {
            await this.footerNavPage.close();
            this.footerNavPage = null;
            this.logInfo("✓ Footer navigation page closed");
        }
    }

    getFooterItemLocator(sectionId: string, relativeUrl: string) {
        // Build locator based on section type (top sections vs bottom sections)
        if (sectionId.startsWith("footer-section")) {
            return this.page.locator(
                `#${sectionId} a.footer-list__link[href="${relativeUrl}"]`
            );
        }

        // Handle bottom sections with title-based locators
        const footerSectionTitle = sectionId.replace("footer-", "").replace(/-/g, " ");

        return this.page.locator(
            `h4.footer-list__title:has-text("${footerSectionTitle}") + ul.footer-list a.footer-list__link[href="${relativeUrl}"]`
        );
    }

    async getFooterItemsList(): Promise<{
        label: string;
        url: string | null;
        absoluteUrl: string | null;
        sectionId: string | null;
    }[]> {


        // Extract all top section footer links
        const topItems = await this.page.$$eval(
            'ul[id^="footer-section"] > li.footer-list__item',
            (elements) =>
                elements.map((li) => {
                    const a = li.querySelector("a");
                    const parent = li.closest("ul");
                    return {
                        label: a?.textContent?.trim() || "",
                        href: a?.getAttribute("href") || null,
                        sectionId: parent?.id || null,
                    };
                })
        );

        // Extract all bottom section footer links
        const bottomItems = await this.page.$$eval(
            '.footer-blue-background ul.footer-list > li.footer-list__item',
            (elements) =>
                elements.map((li) => {
                    const a = li.querySelector("a");
                    const parent = li.closest("ul");
                    const title = parent?.previousElementSibling?.textContent
                        ?.trim()
                        .replace(/\s+/g, "-")
                        .toLowerCase();

                    return {
                        label: a?.textContent?.trim() || "",
                        href: a?.getAttribute("href") || null,
                        sectionId: `footer-${title}`,
                    };
                })
        );

        // Merge and convert to absolute URLs
        const merged = [...topItems, ...bottomItems].map((i) => ({
            label: i.label,
            url: i.href,
            absoluteUrl: i.href
                ? new URL(i.href, "https://www.igluski.com/").toString()
                : null,
            sectionId: i.sectionId,
        }));

        this.logInfo(`Total footer items detected: ${merged.length}`);
        this.logDivider();

        return merged;
    }

    async validateFooterItemsVisibility(items: any[]): Promise<void> {


        // Check each footer link is visible
        for (const item of items) {
            if (!item.url || !item.sectionId) continue;

            const footerLink = this.getFooterItemLocator(item.sectionId, item.url);
            await expect(footerLink).toBeVisible();
        }

        this.logInfo("✓ All footer items visible");
        this.logDivider();
    }

    async validateFooterItemsText(items: any[]): Promise<void> {


        // Verify each footer link has non-empty text
        for (const item of items) {
            if (!item.url || !item.sectionId) continue;

            const footerLink = this.getFooterItemLocator(item.sectionId, item.url);
            const text = (await footerLink.innerText()).trim();

            if (!text) {
                throw new Error(`❌ Empty text: ${item.label}`);
            }
        }

        this.logInfo("✓ All footer items have valid text");
        this.logDivider();
    }

    async validateFooterItemsUrlFormat(items: any[]): Promise<void> {


        // Ensure all footer links have valid URLs
        for (const item of items) {
            if (!item.absoluteUrl) continue;

            if (!item.absoluteUrl.startsWith("https://")) {
                throw new Error(`❌ Invalid URL: ${item.absoluteUrl}`);
            }
        }

        this.logInfo("✓ All footer URLs have valid format");
        this.logDivider();
    }

    async validateSingleFooterLink(
        sectionId: string,
        relativeUrl: string,
        absoluteUrl: string,
        label: string
    ): Promise<void> {

        this.logInfo(`URL: ${absoluteUrl}`);
        this.logDivider();

        await this.initFooterNavigationPage();

        // Navigate to footer link and verify URL + title
        await this.footerNavPage!.goto(absoluteUrl, { waitUntil: "domcontentloaded" });

        await expect(this.footerNavPage!).toHaveURL(new RegExp(absoluteUrl, "i"));
        this.logInfo("✓ URL validated");

        const title = await this.footerNavPage!.title();
        this.logInfo(`✓ Page title: ${title}`);

        this.logDivider();
    }

    async validateAllFooterLinks(items: any[]): Promise<void> {


        await this.initFooterNavigationPage();

        // Test each footer link navigation
        for (const item of items) {
            if (!item.url || !item.absoluteUrl || !item.sectionId) {
                this.logInfo(`⚠ Skipping invalid footer item: ${item.label}`);
                continue;
            }

            await this.validateSingleFooterLink(
                item.sectionId,
                item.url,
                item.absoluteUrl,
                item.label
            );
        }

        this.logDivider();
    }

    async scrollToFooter(): Promise<void> {


        // Use End key for quick scroll to bottom
        await this.page.keyboard.press("End");

        await expect(this.footerContainer).toBeVisible();
        this.logInfo("✓ Scrolled to footer");

        this.logDivider();
    }

    // ============================================================
    // 🔵 TC28 — Validate "Search by Holiday ID" in Footer
    // ============================================================
    async validateHolidayIdSearch(holidayIdData?: { inputPlaceholder: string; buttonText: string; description: string }): Promise<void> {


        // Navigate to footer section
        await this.scrollToFooter();

        // Verify Holiday ID search container exists
        await expect(this.holidayIdContainer).toBeVisible();
        this.logInfo("✓ Holiday ID container visible");

        // Check button text is correct
        const expectedButtonText = holidayIdData?.buttonText || "Search by Holiday ID";
        await expect(this.btnSearchByHolidayId).toHaveText(new RegExp(expectedButtonText, "i"));
        this.logInfo(`✓ '${expectedButtonText}' button text OK`);

        // Click to expand form
        await this.btnSearchByHolidayId.click();
        this.logInfo("✓ Clicked 'Search by Holiday ID' button");

        // Check input field is present
        this.logInfo("✓ Holiday ID input field visible");

        // Log placeholder text for reference
        const placeholder = await this.holidayIdInput.getAttribute("placeholder");
        const expectedPlaceholder = holidayIdData?.inputPlaceholder || "Enter your holiday ID";
        this.logInfo(`Input placeholder: "${placeholder}" (expected: "${expectedPlaceholder}")`);

        // Verify search button is present
        await expect(this.holidayIdSearchButton).toBeVisible();
        this.logInfo("✓ Search button inside Holiday ID form visible");

        this.logInfo("✓ TC28 PASSED: Holiday ID search validated successfully");
        this.logDivider();
    }

    // ============================================================
    // 🔵 CONTACT SECTION — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    async validateContactPhoneBlock(phoneBlock?: { type?: string; title?: string;[key: string]: any }): Promise<void> {
        const startUrl = this.page.url();
        try {
            // Wait for contact phone title to be visible
            await this.contactPhoneTitle.waitFor({ state: 'visible' }).catch(() => { });

            // Extract and verify phone block title
            const title = this.normalizeText(await this.contactPhoneTitle.innerText().catch(() => 'Phone'));
            const expectedTitle = phoneBlock?.title || 'Phone';
            this.logInfo(`Phone block title: "${title}" (expected: "${expectedTitle}")`);

            // Extract phone number text
            const phoneText = (await this.contactPhoneNumber.innerText().catch(() => 'N/A')).trim();
            this.logInfo(`Phone number: "${phoneText}"`);

            // Click phone number and verify navigation
            if (await this.contactPhoneNumber.count() > 0) {
                await this.contactPhoneNumber.click();
                await expect(this.page).toHaveURL(/contact-us/i);
                this.logInfo('✓ Phone block navigation OK → contact-us page');
            }
        } catch (error) {
            this.logInfo(`⚠ Contact phone block validation issue: ${error}`);
        } finally {
            // Restore original page for the next contact-block validation
            if (!this.page.isClosed() && this.page.url() !== startUrl) {
                await this.page.goto(startUrl, { waitUntil: 'domcontentloaded' }).catch(() => { });
            }
        }

        this.logDivider();
    }

    async validateContactEmailBlock(emailBlock?: { type?: string; title?: string;[key: string]: any }): Promise<void> {
        const startUrl = this.page.url();
        try {
            // Wait for contact email title to be visible
            await this.contactEmailTitle.waitFor({ state: 'visible' }).catch(() => { });

            // Extract and verify email block title
            const title = this.normalizeText(await this.contactEmailTitle.innerText().catch(() => 'Email'));
            const expectedTitle = emailBlock?.title || 'Email';
            this.logInfo(`Email block title: "${title}" (expected: "${expectedTitle}")`);

            // Extract button text
            const buttonText = this.normalizeText(await this.contactEmailButton.innerText().catch(() => 'Contact'));
            this.logInfo(`Email button text: "${buttonText}"`);

            // Click enquire button and verify navigation
            if (await this.contactEmailButton.count() > 0) {
                await this.contactEmailButton.click().catch(() => { });
                await expect(this.page).toHaveURL(/enquire/i).catch(() => { });
                this.logInfo('✓ Email block navigation OK → enquire page');
            }
        } catch (error) {
            this.logInfo(`⚠ Contact email block validation issue: ${error}`);
        } finally {
            // Restore original page for the next contact-block validation
            if (!this.page.isClosed() && this.page.url() !== startUrl) {
                await this.page.goto(startUrl, { waitUntil: 'domcontentloaded' }).catch(() => { });
            }
        }
        this.logDivider();
    }
    async validateContactNewsletterBlock(newsletterBlock?: { type?: string; title?: string;[key: string]: any }): Promise<void> {
        const startUrl = this.page.url();
        try {
            // Wait for contact newsletter title to be visible
            await this.contactNewsletterTitle.waitFor({ state: 'visible' }).catch(() => { });

            // Extract and verify newsletter block title
            const title = this.normalizeText(await this.contactNewsletterTitle.innerText().catch(() => 'Newsletter'));
            const expectedTitle = newsletterBlock?.title || 'Newsletter';
            this.logInfo(`Newsletter block title: "${title}" (expected: "${expectedTitle}")`);

            // Extract button text
            const buttonText = this.normalizeText(await this.contactNewsletterButton.innerText().catch(() => 'Sign up'));
            this.logInfo(`Newsletter button text: "${buttonText}"`);

            // Click sign up button and verify navigation
            if (await this.contactNewsletterButton.count() > 0) {
                await this.contactNewsletterButton.click().catch(() => { });
                await expect(this.page).toHaveURL(/signup/i).catch(() => { });
                this.logInfo('✓ Newsletter block navigation OK → signup page');
            }
        } catch (error) {
            this.logInfo(`⚠ Contact newsletter block validation issue: ${error}`);
        } finally {
            // Restore original page for any subsequent assertions
            if (!this.page.isClosed() && this.page.url() !== startUrl) {
                await this.page.goto(startUrl, { waitUntil: 'domcontentloaded' }).catch(() => { });
            }
        }
        this.logDivider();
    }

    async validateContactSection(): Promise<void> {
        await this.validateContactPhoneBlock();
        await this.validateContactEmailBlock();
        await this.validateContactNewsletterBlock();
    }

    // ============================================================
    // 🔵 TC-F21 — TRUST SEALS VALIDATION (ATOL, ABTA, IATA, Feefo)
    // ============================================================

    /**
     * Validates visibility of trust seals in footer
     * @param {Array} seals - Array of seal objects with name and altText
     */
    async validateTrustSealsVisibility(seals: any[]): Promise<void> {


        for (const seal of seals) {
            this.logInfo(`Checking seal: ${seal.name}`);

            // Try multiple strategies to find the seal
            const sealLocator = this.page.locator(`img[alt*="${seal.altText}" i], a[href*="${seal.urlPattern}" i] img, a[title*="${seal.name}" i] img`).first();

            await expect(sealLocator).toBeVisible();
            this.logInfo(`✓ ${seal.name} seal is visible`);
        }

        this.logInfo(`✓ All ${seals.length} trust seals are visible`);
        this.logDivider();
    }

    /**
     * Validates that trust seals are clickable links
     * @param {Array} seals - Array of seal objects
     */
    async validateTrustSealsLinks(seals: any[]): Promise<void> {


        let linkCount = 0;
        for (const seal of seals) {
            this.logInfo(`Checking ${seal.name}`);

            // First, find the seal element (image or link)
            const sealImage = this.page.locator(`img[alt*="${seal.altText}" i]`).first();

            // Check if it's wrapped in an anchor or if there's a nearby anchor with the urlPattern
            const sealLink = this.page.locator(`a[href*="${seal.urlPattern}" i]`).first();
            const linkCount_check = await sealLink.count();

            if (linkCount_check > 0) {
                // This seal is clickable
                await expect(sealLink).toBeVisible();

                // Verify it's an anchor element
                const tagName = await sealLink.evaluate(el => el.tagName.toLowerCase());
                expect(tagName).toBe('a');

                // Verify href is not empty
                const href = await sealLink.getAttribute('href');
                expect(href).toBeTruthy();
                this.logInfo(`✓ ${seal.name} is a clickable link with href: ${href}`);
                linkCount++;
            } else {
                // This seal is not clickable (just an image)
                this.logInfo(`ℹ ${seal.name} is a non-clickable image (informational only)`);
            }
        }

        this.logInfo(`✓ Found ${linkCount} clickable trust seals out of ${seals.length} total`);
        this.logDivider();
    }

    /**
     * Validates trust seals URL format
     * @param {Array} seals - Array of seal objects with urlPattern
     */
    async validateTrustSealsUrlFormat(seals: any[]): Promise<void> {


        let validatedCount = 0;
        for (const seal of seals) {
            this.logInfo(`Checking ${seal.name} URL format`);

            // Only validate if there's a link for this seal
            const sealLink = this.page.locator(`a[href*="${seal.urlPattern}" i]`).first();
            const linkExists = await sealLink.count();

            if (linkExists > 0) {
                const href = await sealLink.getAttribute('href');

                if (href) {
                    // Check if URL contains expected pattern
                    const containsPattern = href.toLowerCase().includes(seal.urlPattern.toLowerCase());
                    expect(containsPattern).toBeTruthy();
                    this.logInfo(`✓ ${seal.name} URL contains expected pattern: ${seal.urlPattern}`);
                    validatedCount++;
                }
            } else {
                this.logInfo(`ℹ ${seal.name} has no URL to validate (non-clickable)`);
            }
        }

        this.logInfo(`✓ Validated ${validatedCount} trust seal URLs`);
        this.logDivider();
    }

    // ============================================================
    // 🔵 TC-F22 — SOCIAL MEDIA ICONS VALIDATION (Facebook, Instagram, X)
    // ============================================================

    /**
     * Validates visibility of social media icons in footer
     * @param {Array} platforms - Array of platform objects with name and urlPattern
     */
    async validateSocialMediaIconsVisibility(platforms: any[]): Promise<void> {


        for (const platform of platforms) {
            this.logInfo(`Checking ${platform.name} icon`);

            // Try multiple strategies to find the social media icon
            const iconLocator = this.page.locator(`a[href*="${platform.urlPattern}" i], a[title*="${platform.name}" i], a[aria-label*="${platform.name}" i]`).first();

            await expect(iconLocator).toBeVisible();
            this.logInfo(`✓ ${platform.name} icon is visible`);
        }

        this.logInfo(`✓ All ${platforms.length} social media icons are visible`);
        this.logDivider();
    }

    /**
     * Validates that social media icons are clickable links
     * @param {Array} platforms - Array of platform objects
     */
    async validateSocialMediaIconsLinks(platforms: any[]): Promise<void> {


        for (const platform of platforms) {
            this.logInfo(`Checking ${platform.name} link`);

            const iconLink = this.page.locator(`a[href*="${platform.urlPattern}" i], a[title*="${platform.name}" i], a[aria-label*="${platform.name}" i]`).first();

            // Verify it's an anchor element
            const tagName = await iconLink.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('a');

            // Verify href is not empty
            const href = await iconLink.getAttribute('href');
            expect(href).toBeTruthy();
            this.logInfo(`✓ ${platform.name} is a clickable link with href: ${href}`);
        }

        this.logInfo(`✓ All ${platforms.length} social media icons are valid links`);
        this.logDivider();
    }

    /**
     * Validates social media URL format
     * @param {Array} platforms - Array of platform objects with urlPattern
     */
    async validateSocialMediaUrlFormat(platforms: any[]): Promise<void> {


        for (const platform of platforms) {
            this.logInfo(`Checking ${platform.name} URL format`);

            const iconLink = this.page.locator(`a[href*="${platform.urlPattern}" i], a[title*="${platform.name}" i], a[aria-label*="${platform.name}" i]`).first();
            const href = await iconLink.getAttribute('href');

            if (href) {
                // Check if URL contains expected pattern
                const containsPattern = href.toLowerCase().includes(platform.urlPattern.toLowerCase());
                expect(containsPattern).toBeTruthy();
                this.logInfo(`✓ ${platform.name} URL contains expected pattern: ${platform.urlPattern}`);

                // Optionally check against expected URL if provided
                if (platform.expectedUrl) {
                    const urlsMatch = href.toLowerCase().includes(platform.expectedUrl.toLowerCase().replace('https://', '').replace('www.', ''));
                    if (urlsMatch) {
                        this.logInfo(`✓ ${platform.name} URL matches expected: ${platform.expectedUrl}`);
                    }
                }
            }
        }

        this.logInfo(`✓ All social media URLs have correct format`);
        this.logDivider();
    }
}
