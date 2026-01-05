import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';


export type SubLinkSnapshot = {
    label: string;
    href: string | null;
};

export type MenuSnapshot = {
    mainLabel: string;
    mainHref: string | null;
    sublinks: SubLinkSnapshot[];
};

export class ComponentsPage extends HelperBase {
    private actions: Actions;
    private menusSnapshot: MenuSnapshot[] = [];
    private navPage: Page | null = null;

    // ============================
    // HEADER & FOOTER LOCATORS
    // ============================
    readonly contactUsLink = this.page.locator('(//a[@href="/contact-us"])[1]');
    readonly phoneLocatorHeader = this.page.locator('(//span[@title="Call Our Team"])[1]');
    readonly btnAccessCustomerPortal = this.page.locator('a[href*="customerportal.igluski.com"]');
    readonly btnRecentlyViewedHeader = this.page.locator('//a[contains(@class, "top-bar__info-link")]');
    readonly resultRecentlyViewedHeader = this.page.locator('//div[contains(@class, "top-bar__rv-no-result")]');
    readonly btnReviewLinkHeader = this.page.locator('//a[@class="header-headline__review-link"]');
    readonly headerLogo = this.page.locator('a.header-logo');
    readonly headerNavItems = this.page.locator('.menu-list__item > .menu-list__item-link');
    readonly footerContainer = this.page.locator('footer');
    readonly holidayIdContainer = this.page.locator('.search-by-holiday-id');
    readonly btnSearchByHolidayId = this.page.locator('.search-by-holiday-id .holiday-id__trigger');
    readonly holidayIdForm = this.page.locator('.search-by-holiday-id form');
    readonly holidayIdInput = this.page.locator('.search-by-holiday-id input#siteSearchInput');
    readonly holidayIdSearchButton = this.page.locator('.search-by-holiday-id button.holiday-id__btn');

    // ============================
    // CONTACT SECTION
    // ============================
    readonly contactPhoneTitle = this.page.locator('//div[contains(text(), "Speak to a ski expert")]');
    readonly contactPhoneNumber = this.page.locator('//div[contains(@class,"contact-block__phone")]//span[contains(@class,"InfinityNumber")]');
    readonly contactEmailTitle = this.page.locator('//div[contains(text(), "Email about a ski holiday")]');
    readonly contactEmailButton = this.page.locator('//span[contains(text(), "Enquire")]');
    readonly contactNewsletterTitle = this.page.locator('//div[contains(text(), "Subscribe to our newsletter")]');
    readonly contactNewsletterButton = this.page.locator('//span[contains(text(), "Sign up")]');


    constructor(page: Page) {
        super(page);
        this.actions = new Actions(page);
    }

    // ============================================================
    // 🔵 HEADER LOGO — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    // Validates that the header logo is present and visible on the page
    async validateHeaderLogo(): Promise<void> {
        this.logSection("Header Logo — Validation");

        await expect(this.headerLogo).toBeVisible();

        this.logInfo("✓ Header logo located and visible");
        this.logDivider();
    }

    // Clicks the header logo
    async clickHeaderLogo(): Promise<void> {
        this.logSection("Header Logo — Click");
        await this.headerLogo.click();
        this.logInfo("✓ Header logo clicked");
        this.logDivider();
    }

    // Validates that clicking the logo redirects to the homepage
    async validateHeaderLogoRedirect(): Promise<void> {
        this.logSection("Header Logo — Redirect");
        await expect(this.page).toHaveURL(/igluski\.com/);
        this.logInfo(`✓ Redirected to homepage → ${this.page.url()}`);
        this.logDivider();
    }

    // ============================================================
    // 🧪 TC2 — HEADER NAVIGATION & SUBMENU VALIDATION
    // ============================================================

    // ------------------------------------------------------------
    // TC2 — DOM Interactions
    // ------------------------------------------------------------

    // Waits for header navigation items to appear.
    async locateHeaderNavItems(): Promise<void> {
        this.logSection("Header Navigation — Locate Items");
        await expect(this.headerNavItems.first()).toBeVisible();
        const count = await this.headerNavItems.count();
        this.logInfo(`Detected ${count} header navigation items`);
        this.logDivider();
    }

    // Ensures all header navigation items are visible.
    async validateHeaderNavVisibility(): Promise<void> {
        this.logSection("Header Navigation — Validate Visibility");

        const count = await this.headerNavItems.count();
        this.logInfo(`Validating visibility for ${count} items`);

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

    // Captures a snapshot of all menus and submenus
    async captureMenuSnapshot(): Promise<void> {
        this.logSection("Header Navigation — Snapshot");

        this.menusSnapshot = await this.getMenuSnapshot();

        if (!this.menusSnapshot.length) {
            throw new Error("❌ No menus found in header navigation snapshot");
        }

        this.logInfo(`Captured snapshot for ${this.menusSnapshot.length} menus`);
        this.logDivider();
    }

    // Validates navigation for all main menu items
    async validateMainMenus(): Promise<void> {
        this.logSection("Header Navigation — Validate Main Menus");

        await this.initNavigationPage();

        for (const menu of this.menusSnapshot) {
            this.logInfo(`Validating main menu: ${menu.mainLabel}`);
            await this.validateSingleMenu(this.navPage!, menu);
        }

        this.logDivider();
    }

    // Validates navigation for all submenu items
    async validateSubMenus(): Promise<void> {
        this.logSection("Header Navigation — Validate Submenus");

        await this.initNavigationPage();

        for (const menu of this.menusSnapshot) {
            for (const sub of menu.sublinks) {
                this.logInfo(`Validating submenu: ${sub.label}`);
                await this.validateSingleSubmenu(this.navPage!, sub);
            }
        }

        this.logDivider();
    }

    // Creates a reusable navigation tab
    async initNavigationPage(): Promise<void> {
        if (!this.navPage) {
            this.navPage = await this.page.context().newPage();
            this.logInfo("✓ Navigation page created");
        }
    }

    // Closes the reusable navigation tab
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

    // Validates the phone number displayed in the header
    async validateHeaderPhone(): Promise<void> {
        this.logSection("Header — Phone Validation");

        await expect(this.phoneLocatorHeader).toBeVisible();

        const phoneText = await this.phoneLocatorHeader.innerText();
        this.logInfo(`✓ Header phone visible → ${phoneText}`);

        this.logDivider();
    }

    // Validates the "Contact Us" text in the header
    async validateHeaderContactText(): Promise<void> {
        this.logSection("Header — Contact Us Text Validation");

        await expect(this.contactUsLink).toBeVisible();

        const contactText = await this.contactUsLink.innerText();
        this.logInfo(`✓ Contact Us link visible → ${contactText}`);

        this.logDivider();
    }

    // Validates that the Contact Us link redirects correctly
    async validateHeaderContactRedirect(): Promise<void> {
        this.logSection("Header — Contact Us Redirect Validation");

        // Extract URL from the link
        const href = await this.contactUsLink.getAttribute("href");
        const url = this.resolveUrl(href);

        if (!url) {
            throw new Error("❌ TC — Contact Us link has no valid href.");
        }

        // Validate redirect in a new tab
        await this.openAndValidateUrl(url, /contact-us/i);

        this.logInfo("✓ Contact Us redirects correctly");
        this.logDivider();
    }

    // ============================================================
    // 🔵 RECENTLY VIEWED — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    // Validates that the Recently Viewed button is visible and has the correct text
    async validateRecentlyViewedButtonText(): Promise<void> {
        this.logSection("Recently Viewed — Button Text Validation");

        // Ensure the button is visible
        await expect(this.btnRecentlyViewedHeader).toBeVisible();

        // Ensure the button text is correct
        await expect(this.btnRecentlyViewedHeader).toHaveText(/recently viewed/i);

        this.logInfo("✓ Recently Viewed button visible with correct text");
        this.logDivider();
    }

    // Clicks the Recently Viewed button
    async clickRecentlyViewedButton(): Promise<void> {
        this.logSection("Recently Viewed — Click");

        // Click the button (Playwright waits automatically)
        await this.btnRecentlyViewedHeader.click();

        this.logInfo("✓ Recently Viewed button clicked");
        this.logDivider();
    }

    // Validates that the Recently Viewed panel becomes visible
    async validateRecentlyViewedPanel(): Promise<void> {
        this.logSection("Recently Viewed — Panel Validation");

        // Ensure the Recently Viewed panel is visible
        await expect(this.resultRecentlyViewedHeader).toBeVisible();

        // Read and log the panel text
        const txt = await this.resultRecentlyViewedHeader.innerText();
        this.logInfo(`✓ Recently Viewed panel visible → ${txt}`);

        this.logDivider();
    }

    // Wrapper that clicks the Recently Viewed button and validates the panel
    async validateRecentlyViewedButton(): Promise<void> {
        await this.clickRecentlyViewedButton();
        await this.validateRecentlyViewedPanel();
    }

    // ============================================================
    // 🔵 CUSTOMER PORTAL — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    // Validates the Customer Portal button text
    async validateCustomerPortalButtonText(): Promise<void> {
        this.logSection("Customer Portal — Button Text Validation");

        // Ensure the button is visible
        await expect(this.btnAccessCustomerPortal).toBeVisible();

        // Ensure the button text is correct
        await expect(this.btnAccessCustomerPortal).toHaveText(/customer portal/i);

        this.logInfo("✓ Customer Portal button visible with correct text");
        this.logDivider();
    }

    // Clicks the Customer Portal button
    async clickCustomerPortalButton(): Promise<void> {
        this.logSection("Customer Portal — Click");

        // Ensure the button is visible before clicking
        await expect(this.btnAccessCustomerPortal).toBeVisible();

        // Click the button (Playwright waits automatically)
        await this.btnAccessCustomerPortal.click();

        this.logInfo("✓ Customer Portal button clicked");
        this.logDivider();
    }

    // Waits for AJAX content to load
    async waitForCustomerPortalAjax(): Promise<void> {
        this.logSection("Customer Portal — AJAX Wait");

        const welcomeText = this.page.locator('text=Welcome to My Booking!');

        // Wait for AJAX-loaded content to appear
        await expect(welcomeText).toBeVisible({ timeout: 7000 });

        this.logInfo("✓ AJAX content loaded successfully");
        this.logDivider();
    }

    // Validates required fields inside the Customer Portal
    async validateCustomerPortalFields(): Promise<void> {
        this.logSection("Customer Portal — Field Validation");

        // Validate Surname field
        await expect(this.page.locator('#LeadBookerSurname')).toBeVisible();
        this.logInfo("✓ Surname field is visible");

        // Validate Booking ID field
        await expect(this.page.locator('#BookingId')).toBeVisible();
        this.logInfo("✓ Booking ID field is visible");

        this.logDivider();
    }

    // ============================================================
    // 🔵 RATINGS & REVIEWS — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    // Validates the Ratings & Reviews link text
    async validateRatingsAndReviewsText(): Promise<void> {
        this.logSection("Ratings & Reviews — Text Validation");

        await expect(this.btnReviewLinkHeader).toBeVisible();
        await expect(this.btnReviewLinkHeader).toHaveText(/reviews/i);

        this.logInfo("✓ Ratings & Reviews link visible with correct text");
        this.logDivider();
    }

    // Clicks the Ratings & Reviews link
    async clickRatingsAndReviews(): Promise<void> {
        this.logSection("Ratings & Reviews — Click");

        await expect(this.btnReviewLinkHeader).toBeVisible();
        await this.btnReviewLinkHeader.click();

        this.logInfo("✓ Ratings & Reviews link clicked");
        this.logDivider();
    }

    // Validates the redirect to the Reviews page
    async validateRatingsAndReviewsRedirect(): Promise<void> {
        this.logSection("Ratings & Reviews — Redirect Validation");

        // Extract href
        const href = await this.btnReviewLinkHeader.getAttribute("href");
        const url = this.resolveUrl(href);

        if (!url) {
            throw new Error("❌ TC — Ratings & Reviews link has no valid href.");
        }

        // Validate redirect in a new tab
        await this.openAndValidateUrl(url, /reviews/i);

        this.logInfo("✓ Ratings & Reviews redirects correctly");
        this.logDivider();
    }

    // Validates the Reviews page title
    async validateReviewsPageTitle(): Promise<void> {
        this.logSection("Ratings & Reviews — Page Title Validation");

        await expect(this.page).toHaveTitle(/Reviews/i);

        this.logInfo("✓ Reviews page title is correct");
        this.logDivider();
    }

    // ============================================================
    // 🔵 MENU VALIDATION — SNAPSHOT + MAIN MENUS + SUBMENUS
    // ============================================================

    // Extracts all main menus and submenus from the DOM.
    async getMenusSnapshot(): Promise<MenuSnapshot[]> {
        this.logSection("Menus — Snapshot");

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

    // Opens a reusable navigation tab for menu validation.
    async openNavigationTab(): Promise<Page> {
        this.logInfo("Opening reusable navigation tab...");
        return await this.page.context().newPage();
    }

    // Validates navigation for a single main menu.
    async validateMainMenu(navPage: Page, menu: MenuSnapshot): Promise<void> {
        const menuLabel = menu.mainLabel;
        const menuUrl = this.resolveUrl(menu.mainHref);

        this.logSection("Menu");
        this.logInfo(`Menu label: "${menuLabel}"`);
        this.logInfo(`Menu URL: ${menuUrl || "(no valid URL)"}`);
        this.logDivider();

        if (!menuUrl) {
            this.logInfo(`Skipping menu "${menuLabel}" — no valid URL.`);
            return;
        }

        try {
            await navPage.goto(menuUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
            await this.validateTitleContains(navPage, menuLabel);
        } catch (err: any) {
            console.error(`❌ Failed to load menu "${menuLabel}" → ${err?.message || err}`);
            throw err;
        }
    }

    // Validates navigation for all submenus under a main menu.
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
                await navPage.goto(subUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
                await this.validateTitleContains(navPage, sub.label);
                this.logSubInfo(`✓ Submenu validated successfully`);
            } catch (err: any) {
                console.error(`❌ Submenu "${sub.label}" failed → ${err?.message || err}`);
            }
        }
    }

    // ============================================================
    // 🔵 FOOTER — COMPLETE BLOCK (REFINED VERSION)
    // ============================================================

    footerNavPage: Page | null = null;

    // Wait for footer widget to render
    async waitForFooterToRender(): Promise<void> {
        await this.page.waitForSelector('#footer-section1-list li.footer-list__item', {
            state: 'visible',
            timeout: 15000
        });
    }

    // Expand footer sections (mobile only)
    async expandAllFooterSections(): Promise<void> {
        const toggles = this.page.locator('.footer-search-links-icon');
        const count = await toggles.count();

        for (let i = 0; i < count; i++) {
            const toggle = toggles.nth(i);

            if (await toggle.isVisible()) {
                await expect(toggle).toBeVisible();
                await toggle.click();
            }
        }
    }

    // Create reusable footer navigation tab
    async initFooterNavigationPage(): Promise<void> {
        if (!this.footerNavPage) {
            this.footerNavPage = await this.page.context().newPage();
            this.logInfo("✓ Footer navigation page created");
        }
    }

    // Close reusable footer navigation tab
    async closeFooterNavigationPage(): Promise<void> {
        if (this.footerNavPage) {
            await this.footerNavPage.close();
            this.footerNavPage = null;
            this.logInfo("✓ Footer navigation page closed");
        }
    }

    // Correct locator for footer items (top + bottom)
    getFooterItemLocator(sectionId: string, relativeUrl: string) {
        if (sectionId.startsWith("footer-section")) {
            return this.page.locator(
                `#${sectionId} a.footer-list__link[href="${relativeUrl}"]`
            );
        }

        const title = sectionId.replace("footer-", "").replace(/-/g, " ");

        return this.page.locator(
            `h4.footer-list__title:has-text("${title}") + ul.footer-list a.footer-list__link[href="${relativeUrl}"]`
        );
    }

    // Fetch all footer items (top + bottom)
    async getFooterItemsList(): Promise<{
        label: string;
        url: string | null;
        absoluteUrl: string | null;
        sectionId: string | null;
    }[]> {
        this.logSection("Footer — Fetch Items");

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

    // Validate a single footer link
    async validateSingleFooterLink(
        sectionId: string,
        relativeUrl: string,
        absoluteUrl: string,
        label: string
    ): Promise<void> {
        this.logSection(`Footer Navigation — ${label}`);
        this.logInfo(`URL: ${absoluteUrl}`);
        this.logDivider();

        await this.initFooterNavigationPage();

        await this.footerNavPage!.goto(absoluteUrl, { waitUntil: "domcontentloaded" });

        await expect(this.footerNavPage!).toHaveURL(new RegExp(absoluteUrl, "i"));
        this.logInfo("✓ URL validated");

        const title = await this.footerNavPage!.title();
        this.logInfo(`✓ Page title: ${title}`);

        this.logDivider();
    }

    // Validate all footer links
    async validateAllFooterLinks(
        footerItems: {
            label: string;
            url: string | null;
            absoluteUrl: string | null;
            sectionId: string | null;
        }[]
    ): Promise<void> {
        this.logSection("Footer Navigation — Validate All Links");

        await this.initFooterNavigationPage();

        for (const item of footerItems) {
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

    // ============================
    // FOOTER - TC28 HELPERS
    // ============================

    // Scrolls to the footer
    async scrollToFooter(): Promise<void> {
        this.logSection("Footer — Scroll");
        await this.page.keyboard.press("End");
        await expect(this.footerContainer).toBeVisible({ timeout: 7000 });
        this.logInfo("✓ Scrolled to footer");
        this.logDivider();
    }

    // ============================================================
    // 🔵 TC28 — Validate "Search by Holiday ID" in Footer
    // ============================================================
    async validateHolidayIdSearch(): Promise<void> {
        this.logSection("TC28 — Validate 'Search by Holiday ID'");

        // STEP A — Scroll to footer
        await this.scrollToFooter();

        // STEP B — Validate container visibility
        await expect(this.holidayIdContainer).toBeVisible();
        this.logInfo("✓ Holiday ID container visible");

        // STEP C — Validate button visibility
        await expect(this.btnSearchByHolidayId).toBeVisible();
        this.logInfo("✓ 'Search by Holiday ID' button visible");

        // STEP D — Click button
        await this.btnSearchByHolidayId.click();
        await this.page.waitForLoadState("domcontentloaded");
        this.logInfo("✓ Clicked 'Search by Holiday ID' button");

        // STEP E — Validate form visibility
        await expect(this.holidayIdForm).toBeVisible();
        this.logInfo("✓ Holiday ID form visible");

        // STEP F — Validate input field
        await expect(this.holidayIdInput).toBeVisible();
        this.logInfo("✓ Holiday ID input field visible");

        // Optional: Validate placeholder
        const placeholder = await this.holidayIdInput.getAttribute("placeholder");
        this.logInfo(`Input placeholder: ${placeholder}`);

        // STEP G — Validate search button
        await expect(this.holidayIdSearchButton).toBeVisible();
        this.logInfo("✓ Search button inside Holiday ID form visible");

        this.logInfo("✓ TC28 PASSED: Holiday ID search validated successfully");
        this.logDivider();
    }

    // ============================================================
    // 🔵 CONTACT SECTION — PAGE-SPECIFIC FUNCTIONS
    // ============================================================

    // PHONE BLOCK
    async validateContactPhoneBlock(): Promise<void> {
        this.logSection("Contact Section — Phone Block");

        // Validate title
        const title = this.normalizeText(await this.contactPhoneTitle.innerText());
        this.logInfo(`Phone title: ${title}`);

        await expect(this.contactPhoneTitle).toHaveText(/speak to a ski expert/i);
        this.logInfo("✓ Phone title OK");

        // Validate navigation
        this.logInfo("Clicking phone number to validate navigation...");
        await expect(this.contactPhoneNumber).toBeVisible();
        await this.contactPhoneNumber.click();

        await expect(this.page).toHaveURL(/contact-us/i);
        this.logInfo("✓ Phone link navigation OK");

        this.logDivider();
    }

    // EMAIL BLOCK
    async validateContactEmailBlock(): Promise<void> {
        this.logSection("Contact Section — Email Block");

        // Validate title
        const title = this.normalizeText(await this.contactEmailTitle.innerText());
        this.logInfo(`Email title: ${title}`);

        await expect(this.contactEmailTitle).toHaveText(/email about a ski holiday/i);
        this.logInfo("✓ Email title OK");

        // Validate button text
        const buttonText = this.normalizeText(await this.contactEmailButton.innerText());
        this.logInfo(`Email button text: ${buttonText}`);

        await expect(this.contactEmailButton).toHaveText(/enquire/i);
        this.logInfo("✓ Email button text OK");

        // Validate navigation
        this.logInfo("Clicking ENQUIRE button to validate navigation...");
        await expect(this.contactEmailButton).toBeVisible();
        await this.contactEmailButton.click();

        await expect(this.page).toHaveURL(/enquire/i);
        this.logInfo("✓ ENQUIRE button navigation OK");

        this.logDivider();
    }

    // NEWSLETTER BLOCK
    async validateContactNewsletterBlock(): Promise<void> {
        this.logSection("Contact Section — Newsletter Block");

        // Validate title
        const title = this.normalizeText(await this.contactNewsletterTitle.innerText());
        this.logInfo(`Newsletter title: ${title}`);

        await expect(this.contactNewsletterTitle).toHaveText(/subscribe to our newsletter/i);
        this.logInfo("✓ Newsletter title OK");

        // Validate button text
        const buttonText = this.normalizeText(await this.contactNewsletterButton.innerText());
        this.logInfo(`Newsletter button text: ${buttonText}`);

        await expect(this.contactNewsletterButton).toHaveText(/sign up/i);
        this.logInfo("✓ Newsletter button text OK");

        // Validate navigation
        this.logInfo("Clicking SIGN UP button to validate navigation...");
        await expect(this.contactNewsletterButton).toBeVisible();
        await this.contactNewsletterButton.click();

        await expect(this.page).toHaveURL(/signup/i);
        this.logInfo("✓ SIGN UP button navigation OK");

        this.logDivider();
    }

    // Wrapper for backward compatibility
    async validateContactSection(): Promise<void> {
        await this.validateContactPhoneBlock();
        await this.validateContactEmailBlock();
        await this.validateContactNewsletterBlock();
    }

}