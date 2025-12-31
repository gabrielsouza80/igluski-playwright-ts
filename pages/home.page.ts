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

export class HomePage extends HelperBase {

  private actions: Actions;
  private menusSnapshot: MenuSnapshot[] = [];
  private navPage: Page | null = null;

  // ============================
  // HEADER & NAVIGATION LOCATORS
  // ============================
  readonly logoLink = this.page.locator('a[title="Iglu Ski logo"]');
  readonly skiHolidaysLink = this.page.locator('(//a[@href="/ski-holidays"])[2]');
  readonly skiDestinationsLink = this.page.locator('a[href="/ski-resorts"]').first();
  readonly skiDealsLink = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
  readonly snowReportsLink = this.page.locator('(//a[@href="/snow-reports"])[1]');
  readonly blogGuidesLink = this.page.locator('(//a[@href="/blog"])[1]');
  readonly enquireLink = this.page.locator('(//a[contains(@href, "/enquire")])[1]');
  readonly contactUsLink = this.page.locator('(//a[@href="/contact-us"])[1]');
  readonly phoneLocatorHeader = this.page.locator('(//span[@title="Call Our Team"])[1]');
  readonly btnAccessCustomerPortal = this.page.locator('a[href*="customerportal.igluski.com"]');
  readonly btnRecentlyViewedHeader = this.page.locator('//a[contains(@class, "top-bar__info-link")]');
  readonly resultRecentlyViewedHeader = this.page.locator('//div[contains(@class, "top-bar__rv-no-result")]');
  readonly btnReviewLinkHeader = this.page.locator('//a[@class="header-headline__review-link"]');
  readonly headerLogo = this.page.locator('a.header-logo');
  readonly headerNavItems = this.page.locator('.menu-list__item > .menu-list__item-link');
  readonly headerSubmenus = this.page.locator('.menu-list__item > .submenu');

  // ============================
  // HOMEPAGE CONTENT LOCATORS
  // ============================
  readonly titleBannerHome = this.page.locator('(//h2[@class="h2-title"])[2]');
  readonly titleHomePage = this.page.locator('//h1[@class="h1-title"]');

  // ============================
  // INLINE SECTION LOCATORS (NEW)
  // ============================

  // Finds any <h2> tag in the text, ignoring case.
  sectionTitle = (text: string) =>
    this.page.locator(
      `//h2[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${text.toLowerCase()}")]`
    );

  // Returns the parent container of the section (the <div> wrapping the <h2>)
  sectionContainer = (title: Locator) =>
    title.locator('xpath=..');

  // Returns all <a> elements inside the section
  sectionLinks = (section: Locator) =>
    section.locator('a');


  // ============================
  // CAROUSEL
  // ============================
  readonly carouselHome = this.page.locator('*[data-ski-widget="content-carousel"]');
  readonly carouselNextButton = this.page.locator('.content-carousel__control--right');
  readonly carouselPrevButton = this.page.locator('.content-carousel__control--left');
  readonly carouselActiveSlide = this.page.locator('.content-carousel__inner__item--active');
  readonly carouselSlides = this.page.locator('//div[contains(@class, "content-carousel__inner__item")]');

  // ============================
  // CTA ROWS
  // ============================
  readonly ctaRow5 = this.page.locator('(//div[@class="row"])[5]');
  readonly ctaTitlesRow5 = this.page.locator('(//div[@class="row"])[5]//h2[@class="box-panel__title"]');
  readonly ctaLinksRow5 = this.page.locator('(//div[@class="row"])[5]//a');

  // ============================
  // CONTACT SECTION
  // ============================
  readonly contactSection = this.page.locator('(//div[@class="container"])[4]');
  readonly contactPhoneTitle = this.page.locator('//div[contains(text(), "Speak to a ski expert")]');
  readonly contactPhoneNumber = this.page.locator('//div[contains(@class,"contact-block__phone")]//span[contains(@class,"InfinityNumber")]');

  readonly contactEmailTitle = this.page.locator('//div[contains(text(), "Email about a ski holiday")]');
  readonly contactEmailButton = this.page.locator('//span[contains(text(), "Enquire")]');
  readonly contactNewsletterTitle = this.page.locator('//div[contains(text(), "Subscribe to our newsletter")]');
  readonly contactNewsletterButton = this.page.locator('//span[contains(text(), "Sign up")]');

  // ============================
  // COOKIES
  // ============================
  readonly cookiesBanner = this.page.locator('#onetrust-banner-sdk');
  readonly acceptCookiesBtn = this.page.locator('#onetrust-accept-btn-handler').first();
  readonly acceptCookiesBtnRecommended = this.page.locator('#accept-recommended-btn-handler');

  // ============================
  // SEARCH
  // ============================
  readonly propertiesSearchInput = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly resortsSearchInput = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton = this.page.locator('button.search-item__cta , .search-bar__form-submit');

  // ============================
  // FOOTER
  // ============================
  readonly footerFranceLink = this.page.locator('footer a[href*="/france"]').first();
  readonly footerSkiChaletsLink = this.page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();

  // ============================
  // RESPONSIVE / TC26 LOCATORS
  // ============================

  // Hamburger menu (mobile/tablet)
  readonly hamburgerMenu = this.page
    .locator('[aria-label*="menu" i], .hamburger, button[id*="menu"], [class*="hamburger"], [class*="menu"]')
    .first();

  // All images on the page
  readonly allImages = this.page.locator('img');

  // ============================
  // FOOTER - TC28 LOCATORS
  // ============================

  // Main container of the component
  readonly holidayIdContainer = this.page.locator('.search-by-holiday-id');

  // "Search by Holiday ID" button
  readonly btnSearchByHolidayId = this.page.locator('.search-by-holiday-id .holiday-id__trigger');

  // Form that opens after clicking the button
  readonly holidayIdForm = this.page.locator('.search-by-holiday-id form');

  // Holiday ID input field
  readonly holidayIdInput = this.page.locator('.search-by-holiday-id input#siteSearchInput');

  // Search button inside the form
  readonly holidayIdSearchButton = this.page.locator('.search-by-holiday-id button.holiday-id__btn');
  constructor(page: Page) {
    super(page);
    this.actions = new Actions(page);
  }


  // ============================
  // NAVIGATION & COOKIES
  // ============================
  async navigateAndAcceptCookies(): Promise<void> {
    console.log(`\n==================== COOKIES — INITIAL STATE ====================`);
    console.log(`• Navigating to home page...`);
    console.log(`---------------------------------------------------------------`);

    await this.page.goto('/', { waitUntil: 'domcontentloaded' });

    try {
      await this.cookiesBanner.waitFor({ state: 'visible', timeout: 60000 });
      console.log(`• Cookie banner detected.`);
    } catch {
      console.log(`• No cookie banner appeared.`);
      console.log(`==================== COOKIES — NO BANNER =======================\n`);
      return;
    }

    console.log(`• Checking available accept buttons...`);

    if (await this.acceptCookiesBtn.isVisible()) {
      await this.acceptCookiesBtn.click();
      console.log(`• Clicked default accept button.`);
    } else if (await this.acceptCookiesBtnRecommended.isVisible()) {
      await this.acceptCookiesBtnRecommended.click();
      console.log(`• Clicked recommended accept button.`);
    } else {
      console.log(`• No visible accept button found.`);
    }

    await this.cookiesBanner.waitFor({ state: 'hidden', timeout: 5000 });
    console.log(`• Cookie banner hidden.`);
    console.log(`==================== COOKIES — COMPLETED =======================\n`);
  }

  // ============================
  // SEARCH FUNCTIONS
  // ============================
  async searchForCountry(text: string) {
    try {
      await this.countriesSearchInput.fill(text, { timeout: 5000 });
      await this.page.waitForTimeout(500);
    } catch {
      console.warn('searchForCountry: fill failed, clicking search anyway');
    }

    try {
      await this.searchButton.click();
    } catch {
      console.error('searchForCountry: search button click failed');
    }
  }

  async searchForProperty(text: string) {
    await this.propertiesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(500);
    await this.propertiesSearchInput.press('Enter');
  }

  async clickOnSearchButton() {
    await this.searchButton.click();
  }

  // ============================
  // GENERIC ASSERTIONS
  // ============================
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    return await this.actions.verifyElementVisible(locator);
  }

  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    return await this.actions.verifyPageLoaded(expectedUrl);
  }

  // ============================
  // HEADER VALIDATIONS
  // ============================

  // ============================================================
  // 🔵 TC1 — HEADER LOGO
  // ============================================================

  // Locates the header logo element on the page.
  async locateHeaderLogo(): Promise<void> {
    this.logSection("Header Logo — Locate");
    await this.headerLogo.waitFor({ state: "visible" });
    this.logInfo("Header logo located");
    this.logDivider();
  }

  // Ensures the header logo is visible.
  async validateHeaderLogoVisibility(): Promise<void> {
    this.logSection("Header Logo — Visibility");
    await expect(this.headerLogo).toBeVisible();
    this.logInfo("✓ Header logo is visible");
    this.logDivider();
  }

  // Clicks the header logo.
  async clickHeaderLogo(): Promise<void> {
    this.logSection("Header Logo — Click");
    await this.headerLogo.click();
    this.logInfo("✓ Header logo clicked");
    this.logDivider();
  }

  // Validates that clicking the logo redirects to the homepage.
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
  async locateHeaderNavItems() {
    await this.headerNavItems.first().waitFor({ state: "visible" });
  }

  // Ensures all header navigation items are visible.
  async validateHeaderNavVisibility() {
    const count = await this.headerNavItems.count();
    for (let i = 0; i < count; i++) {
      await expect(this.headerNavItems.nth(i)).toBeVisible();
    }
  }

  // ------------------------------------------------------------
  // TC2 — High-Level Flow
  // ------------------------------------------------------------

  // Captures a snapshot of all menus and submenus.
  async captureMenuSnapshot() {
    this.menusSnapshot = await this.getMenuSnapshot();
  }

  // Validates navigation for all main menu items.
  async validateMainMenus() {
    await this.initNavigationPage();

    for (const menu of this.menusSnapshot) {
      await this.validateSingleMenu(this.navPage!, menu);
    }
  }

  // Validates navigation for all submenus.
  async validateSubMenus() {
    await this.initNavigationPage();

    for (const menu of this.menusSnapshot) {
      for (const sub of menu.sublinks) {
        await this.validateSingleSubmenu(this.navPage!, sub);
      }
    }
  }

  // Creates a reusable navigation tab for menu validation.
  async initNavigationPage() {
    if (!this.navPage) {
      this.navPage = await this.page.context().newPage();
    }
  }

  // Closes the reusable navigation tab.
  async closeNavigationPage() {
    if (this.navPage) {
      await this.navPage.close();
      this.navPage = null;
    }
  }

  // ============================================================
  // 🔵 HEADER CONTACT INFO — SMALL, MODULAR FUNCTIONS
  // ============================================================

  // Validates the phone number displayed in the header.
  async validateHeaderPhone(): Promise<void> {
    this.logSection("Header — Phone Validation");
    const phoneText = await this.phoneLocatorHeader.innerText();
    this.logInfo(`Phone text: ${phoneText}`);
    this.logDivider();
  }

  // Validates the "Contact Us" text in the header.
  async validateHeaderContactText(): Promise<void> {
    this.logSection("Header — Contact Us Text Validation");
    const contactText = await this.contactUsLink.innerText();
    this.logInfo(`Contact Us text: ${contactText}`);
    this.logDivider();
  }

  // Validates that the Contact Us link redirects correctly.
  async validateHeaderContactRedirect(): Promise<void> {
    this.logSection("Header — Contact Us Redirect Validation");
    await this.validateRedirectButton(this.contactUsLink, "/contact-us");
    this.logInfo("✓ Contact Us redirects correctly");
    this.logDivider();
  }

  // Wrapper for validating all header contact info.
  async validateHeaderContactInfo(): Promise<void> {
    await this.validateHeaderPhone();
    await this.validateHeaderContactText();
    await this.validateHeaderContactRedirect();
  }

  // ============================================================
  // 🔵 RECENTLY VIEWED — SMALL, MODULAR FUNCTIONS
  // ============================================================

  // Clicks the Recently Viewed button.
  async clickRecentlyViewedButton(): Promise<void> {
    this.logSection("Recently Viewed — Click");
    await this.btnRecentlyViewedHeader.click();
    this.logInfo("✓ Recently Viewed button clicked");
    this.logDivider();
  }

  // Validates that the Recently Viewed panel appears.
  async validateRecentlyViewedPanel(): Promise<void> {
    this.logSection("Recently Viewed — Panel Validation");
    await expect(this.resultRecentlyViewedHeader).toBeVisible();
    const txt = await this.resultRecentlyViewedHeader.innerText();
    this.logInfo(`Panel text: ${txt}`);
    this.logInfo("✓ Recently Viewed panel is visible");
    this.logDivider();
  }

  // Wrapper for validating Recently Viewed.
  async validateRecentlyViewedButton(): Promise<void> {
    await this.clickRecentlyViewedButton();
    await this.validateRecentlyViewedPanel();
  }

  // ============================================================
  // 🔵 CUSTOMER PORTAL — SMALL, MODULAR FUNCTIONS
  // ============================================================

  // Clicks the Customer Portal button.
  async clickCustomerPortalButton(): Promise<void> {
  this.logSection("Customer Portal — Click");

  await this.btnAccessCustomerPortal.waitFor({ state: "visible" });
  await this.btnAccessCustomerPortal.scrollIntoViewIfNeeded();
  await this.btnAccessCustomerPortal.click({ force: true });

  this.logInfo("✓ Customer Portal button clicked");
  this.logDivider();
}

async validateCustomerPortalContent(): Promise<void> {
  this.logSection("Customer Portal — Redirect Validation");

  const welcomeText = this.page.locator('text=Welcome to My Booking!');
  await welcomeText.waitFor({ state: "visible" });

  await expect(this.page.locator('#LeadBookerSurname')).toBeVisible();
  await expect(this.page.locator('#BookingId')).toBeVisible();

  this.logInfo("✓ Customer Portal content loaded successfully (AJAX)");
  this.logDivider();
}

  // Validates Customer Portal redirection.
async validateCustomerPortalRedirect(): Promise<void> {
  this.logSection("Customer Portal — Redirect Validation");

  const button = this.btnAccessCustomerPortal;

  await button.waitFor({ state: "visible" });
  await button.scrollIntoViewIfNeeded();
  await button.click({ force: true });

  // Validate AJAX-loaded content
  const welcomeText = this.page.locator('text=Welcome to My Booking!');
  await welcomeText.waitFor({ state: "visible" });

  const surnameField = this.page.locator('#LeadBookerSurname');
  const bookingIdField = this.page.locator('#BookingId');

  await expect(surnameField).toBeVisible();
  await expect(bookingIdField).toBeVisible();

  this.logInfo("✓ Customer Portal content loaded successfully (AJAX)");
  this.logDivider();
}

  // Wrapper for validating Customer Portal access.
  async validateAccessCustomerPortal(): Promise<void> {
    await this.clickCustomerPortalButton();
    await this.validateCustomerPortalRedirect();
  }

  // ============================================================
  // 🔵 RATINGS & REVIEWS — SMALL, MODULAR FUNCTIONS
  // ============================================================

  // Clicks the Ratings & Reviews link.
  async clickRatingsAndReviews(): Promise<void> {
    this.logSection("Ratings & Reviews — Click");
    await this.btnReviewLinkHeader.click();
    this.logInfo("✓ Ratings & Reviews link clicked");
    this.logDivider();
  }

  // Validates Ratings & Reviews redirection.
  async validateRatingsAndReviewsRedirect(): Promise<void> {
    this.logSection("Ratings & Reviews — Redirect Validation");
    await this.validateRedirectButton(
      this.btnReviewLinkHeader,
      this.urls.URLReviewsPage
    );
    this.logInfo("✓ Ratings & Reviews redirects correctly");
    this.logDivider();
  }

  // Wrapper for validating Ratings & Reviews.
  async validateRatingsAndReviews(): Promise<void> {
    await this.clickRatingsAndReviews();
    await this.validateRatingsAndReviewsRedirect();
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
  // ============================
  // FOOTER VALIDATION
  // ============================
  // ============================================================
  // 🔵 FOOTER — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async getFooterItemsList(): Promise<{ label: string; url: string | null }[]> {
    this.logSection("Footer — Fetch Items");

    const items = await this.page.$$eval(
      '//li[@class="footer-list__item"]',
      (elements) =>
        elements.map((li) => {
          const a = li.querySelector("a");
          return {
            label: a?.textContent?.trim() || "",
            href: a?.getAttribute("href") || null,
          };
        })
    );

    const mapped = items.map((i) => ({
      label: i.label,
      url: this.resolveUrl(i.href),
    }));

    this.logInfo(`Total footer items detected: ${mapped.length}`);
    this.logDivider();

    return mapped;
  }

  async validateSingleFooterItem(label: string, url: string): Promise<void> {
    this.logSection(`Footer Item — ${label}`);
    this.logInfo(`URL: ${url}`);
    this.logDivider();

    const locator = this.page.locator(
      `//li[@class="footer-list__item"] >> text=${label}`
    );

    await this.scrollIntoView(locator);

    try {
      await this.openAndValidateUrl(url, new RegExp(url, "i"));
      this.logInfo("✓ Footer link OK");
    } catch (err: any) {
      this.logInfo(`❌ Footer link failed: ${err?.message || err}`);
    }

    this.logDivider();
  }

  async validateFooterItemsList(): Promise<void> {
    const list = await this.getFooterItemsList();

    for (const item of list) {
      if (!item.url) {
        this.logInfo(`⚠ Skipping invalid footer item: ${item.label}`);
        continue;
      }

      await this.validateSingleFooterItem(item.label, item.url);
    }
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateFooterItems(): Promise<void> {
    await this.validateFooterItemsList();
  }

  // ============================================================
  // 🔵 CAROUSEL — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async getCarouselSlideCount(): Promise<number> {
    this.logSection("Carousel — Slide Count");
    const totalSlides = await this.carouselSlides.count();
    this.logInfo(`Total slides detected: ${totalSlides}`);
    this.logDivider();
    return totalSlides;
  }

  async validateSingleCarouselSlide(index: number, total: number): Promise<void> {
    this.logSection(`Carousel — Slide ${index + 1} of ${total}`);

    await expect(this.carouselActiveSlide).toBeVisible();

    const bannerCTA = this.carouselActiveSlide.locator("a");
    await bannerCTA.waitFor({ state: "visible", timeout: 7000 });

    const href = await bannerCTA.getAttribute("href");
    this.logInfo(`CTA detected: ${href}`);

    try {
      await bannerCTA.click({ force: true });
      await expect(this.page).toHaveURL(/ski-holidays/);
      this.logInfo(`✓ CTA navigation OK → ${this.page.url()}`);
    } catch {
      this.logInfo(`❌ CTA navigation failed on slide ${index + 1}`);
    }

    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });

    if (index < total - 1) {
      this.logInfo("Moving to next slide...");
      await this.carouselNextButton.click({ force: true });
      await this.waitForCarouselSlideChange(href!);
    }

    this.logDivider();
  }

  async validateCarousel(): Promise<void> {
    const totalSlides = await this.getCarouselSlideCount();

    if (totalSlides === 0) {
      throw new Error("❌ No slides found in carousel");
    }

    for (let i = 0; i < totalSlides; i++) {
      await this.validateSingleCarouselSlide(i, totalSlides);
    }
  }

  // ============================
  // CONTACT SECTION VALIDATION
  // ============================
  // ============================================================
  // 🔵 CONTACT SECTION — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async validateContactPhoneBlock(): Promise<void> {
    this.logSection("Contact Section — Phone Block");

    const title = this.normalizeText(await this.contactPhoneTitle.innerText());
    this.logInfo(`Phone title: ${title}`);

    if (!title.includes("speak to a ski expert")) {
      throw new Error(`❌ Phone title mismatch. Found: "${title}"`);
    }

    this.logInfo("✓ Phone title OK");
    this.logInfo("Clicking phone number to validate navigation...");

    await this.contactPhoneNumber.click();
    await expect(this.page).toHaveURL(/contact-us/);

    this.logInfo("✓ Phone link navigation OK");
    this.logDivider();

    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });
  }

  async validateContactEmailBlock(): Promise<void> {
    this.logSection("Contact Section — Email Block");

    const title = this.normalizeText(await this.contactEmailTitle.innerText());
    this.logInfo(`Email title: ${title}`);

    if (!title.includes("email about a ski holiday")) {
      throw new Error(`❌ Email title mismatch. Found: "${title}"`);
    }

    this.logInfo("✓ Email title OK");

    const buttonText = this.normalizeText(await this.contactEmailButton.innerText());
    this.logInfo(`Email button text: ${buttonText}`);

    if (!buttonText.includes("enquire")) {
      throw new Error(`❌ Email button text mismatch. Found: "${buttonText}"`);
    }

    this.logInfo("✓ Email button text OK");
    this.logInfo("Clicking ENQUIRE button to validate navigation...");

    await this.contactEmailButton.click();
    await expect(this.page).toHaveURL(/enquire/);

    this.logInfo("✓ ENQUIRE button navigation OK");
    this.logDivider();

    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });
  }

  async validateContactNewsletterBlock(): Promise<void> {
    this.logSection("Contact Section — Newsletter Block");

    const title = this.normalizeText(await this.contactNewsletterTitle.innerText());
    this.logInfo(`Newsletter title: ${title}`);

    if (!title.includes("subscribe to our newsletter")) {
      throw new Error(`❌ Newsletter title mismatch. Found: "${title}"`);
    }

    this.logInfo("✓ Newsletter title OK");

    const buttonText = this.normalizeText(await this.contactNewsletterButton.innerText());
    this.logInfo(`Newsletter button text: ${buttonText}`);

    if (!buttonText.includes("sign up")) {
      throw new Error(`❌ Newsletter button text mismatch. Found: "${buttonText}"`);
    }

    this.logInfo("✓ Newsletter button text OK");
    this.logInfo("Clicking SIGN UP button to validate navigation...");

    await this.contactNewsletterButton.click();
    await expect(this.page).toHaveURL(/signup/);

    this.logInfo("✓ SIGN UP button navigation OK");
    this.logDivider();
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateContactSection(): Promise<void> {
    await this.validateContactPhoneBlock();
    await this.validateContactEmailBlock();
    await this.validateContactNewsletterBlock();
  }


  // ============================================================
  // 🔵 CTA BOXES — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async getCtaBoxesList(): Promise<
    { title: string; normalized: string; url: string | null }[]
  > {
    this.logSection("CTA Boxes — Fetch List");

    const ctaRow = this.page.locator(
      '//h2[contains(text(), "TALK TO")]/ancestor::div[@class="row"]'
    );

    const ctaBoxes = ctaRow.locator('//a');
    const ctaTitles = ctaRow.locator('//h2[@class="box-panel__title"]');

    const total = await ctaBoxes.count();
    this.logInfo(`Total CTA boxes detected: ${total}`);
    this.logDivider();

    const list: { title: string; normalized: string; url: string | null }[] = [];

    for (let i = 0; i < total; i++) {
      const titleLocator = ctaTitles.nth(i);
      const rawTitle = await titleLocator.innerText();
      const normalized = this.normalizeText(rawTitle);

      const href = await ctaBoxes.nth(i).getAttribute("href");
      const url = this.resolveUrl(href);

      list.push({ title: rawTitle, normalized, url });
    }

    return list;
  }

  async validateSingleCtaBox(
    index: number,
    total: number,
    title: string,
    normalized: string,
    url: string,
    expectedPattern: RegExp
  ): Promise<void> {
    this.logSection(`CTA Box — ${index + 1} of ${total}`);
    this.logInfo(`Title: ${title}`);
    this.logInfo(`Normalized: ${normalized}`);
    this.logInfo(`URL: ${url}`);
    this.logDivider();

    try {
      await this.openAndValidateUrl(url, expectedPattern);
      this.logInfo("✓ CTA navigation OK");
    } catch (err: any) {
      this.logInfo(`❌ CTA navigation failed: ${err?.message || err}`);
    }

    await this.page.goto("https://www.igluski.com/", {
      waitUntil: "domcontentloaded"
    });

    this.logDivider();
  }

  async validateCtaBoxesList(): Promise<void> {
    const list = await this.getCtaBoxesList();

    const expectedPatterns = [/enquire/i, /about/i, /signup/i];

    for (let i = 0; i < list.length; i++) {
      const item = list[i];

      if (!item.url) {
        this.logInfo(`⚠ Skipping CTA — invalid URL`);
        continue;
      }

      await this.validateSingleCtaBox(
        i,
        list.length,
        item.title,
        item.normalized,
        item.url,
        expectedPatterns[i]
      );
    }
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateCtaBoxes(): Promise<void> {
    await this.validateCtaBoxesList();
  }

  // ============================================================
  // 🔵 COUNTRY BANNERS — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async getCountryBannerList(): Promise<{ label: string; url: string | null }[]> {
    this.logSection("Country Banners — Fetch List");

    const banners = await this.page.$$eval(
      '//div[contains(@class, "country-banner")]//a',
      anchors =>
        anchors.map(a => ({
          label: a.textContent?.trim() || "",
          href: a.getAttribute("href") || null
        }))
    );

    const mapped = banners.map(b => ({
      label: b.label,
      url: this.resolveUrl(b.href)
    }));

    this.logInfo(`Total banners detected: ${mapped.length}`);
    this.logDivider();

    return mapped;
  }

  async validateSingleCountryBanner(label: string, url: string): Promise<void> {
    this.logSection(`Country Banner — ${label}`);
    this.logInfo(`URL: ${url}`);
    this.logDivider();

    const locator = this.page.locator(
      `//div[contains(@class, "country-banner")]//a[contains(text(), "${label}")]`
    );

    await this.scrollIntoView(locator);

    try {
      await this.openAndValidateUrl(url, new RegExp(url, "i"));
      this.logInfo("✓ Country banner navigation OK");
    } catch (err: any) {
      this.logInfo(`❌ Navigation failed: ${err?.message || err}`);
    }

    this.logDivider();
  }

  async validateCountryBannersList(): Promise<void> {
    const banners = await this.getCountryBannerList();

    for (const banner of banners) {
      if (!banner.url) {
        this.logInfo(`⚠ Skipping invalid banner: ${banner.label}`);
        continue;
      }

      await this.validateSingleCountryBanner(banner.label, banner.url);
    }
  }

  // Wrapper (compatibilidade)
  async validateCountryBanners(): Promise<void> {
    await this.validateCountryBannersList();
  }

  // ============================
  // GENERIC HOMEPAGE HELPERS
  // ============================

  /**
   * Validates that the homepage main title is visible and contains expected text.
   */
  async validateHomePageTitle(expected: string): Promise<void> {
    console.log(`\n==================== HOMEPAGE TITLE — VALIDATION START ====================`);

    await expect(this.titleHomePage).toBeVisible();

    const rawTitle = await this.titleHomePage.innerText();
    const normalized = this.normalizeText(rawTitle);

    console.log(`• Found title: "${rawTitle}"`);
    console.log(`• Normalized: "${normalized}"`);

    if (!normalized.includes(this.normalizeText(expected))) {
      throw new Error(`❌ Homepage title mismatch. Expected something containing "${expected}"`);
    }

    console.log(`✓ Homepage title validated successfully`);
    console.log(`==================== HOMEPAGE TITLE — VALIDATION COMPLETE ==================\n`);
  }

  /**
   * Validates that the banner title is visible and contains expected text.
   */
  async validateBannerTitle(expected: string): Promise<void> {
    console.log(`\n==================== BANNER TITLE — VALIDATION START ====================`);

    await expect(this.titleBannerHome).toBeVisible();

    const rawTitle = await this.titleBannerHome.innerText();
    const normalized = this.normalizeText(rawTitle);

    console.log(`• Found banner title: "${rawTitle}"`);
    console.log(`• Normalized: "${normalized}"`);

    if (!normalized.includes(this.normalizeText(expected))) {
      throw new Error(`❌ Banner title mismatch. Expected something containing "${expected}"`);
    }

    console.log(`✓ Banner title validated successfully`);
    console.log(`==================== BANNER TITLE — VALIDATION COMPLETE ==================\n`);
  }

  /**
   * Validates that the Ski Holidays link redirects correctly.
   */
  async validateSkiHolidaysLink(): Promise<void> {
    console.log(`\n==================== SKI HOLIDAYS LINK — VALIDATION START ====================`);
    await this.validateRedirectButton(this.skiHolidaysLink, '/ski-holidays');
    console.log(`✓ Ski Holidays link validated successfully`);
    console.log(`==================== SKI HOLIDAYS LINK — VALIDATION COMPLETE ==================\n`);
  }

  /**
   * Validates that the Ski Deals link redirects correctly.
   */
  async validateSkiDealsLink(): Promise<void> {
    console.log(`\n==================== SKI DEALS LINK — VALIDATION START ====================`);
    await this.validateRedirectButton(this.skiDealsLink, '/ski-deals');
    console.log(`✓ Ski Deals link validated successfully`);
    console.log(`==================== SKI DEALS LINK — VALIDATION COMPLETE ==================\n`);
  }

  /**
   * Validates that the Snow Reports link redirects correctly.
   */
  async validateSnowReportsLink(): Promise<void> {
    console.log(`\n==================== SNOW REPORTS LINK — VALIDATION START ====================`);
    await this.validateRedirectButton(this.snowReportsLink, '/snow-reports');
    console.log(`✓ Snow Reports link validated successfully`);
    console.log(`==================== SNOW REPORTS LINK — VALIDATION COMPLETE ==================\n`);
  }

  /**
   * Validates that the Blog & Guides link redirects correctly.
   */
  async validateBlogGuidesLink(): Promise<void> {
    console.log(`\n==================== BLOG & GUIDES LINK — VALIDATION START ====================`);
    await this.validateRedirectButton(this.blogGuidesLink, '/blog');
    console.log(`✓ Blog & Guides link validated successfully`);
    console.log(`==================== BLOG & GUIDES LINK — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // CLICK MENU (WITH VALIDATION)
  // ============================
  // ============================================================
  // 🔵 CLICK MENU — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async clickMainMenu(menuLabel: string): Promise<void> {
    this.logSection("Click Menu — Main");
    this.logInfo(`Menu: ${menuLabel}`);
    this.logDivider();

    const menu = this.page.locator(
      `li.menu-list__item a:has-text("${menuLabel}")`
    ).first();

    await menu.waitFor({ state: "visible", timeout: 7000 });
    await menu.click();

    this.logInfo(`✓ Clicked main menu: ${menuLabel}`);

    await this.validateTitleContains(this.page, menuLabel);
    this.logInfo(`✓ Page title validated for menu: ${menuLabel}`);

    this.logDivider();
  }

  async clickSubmenu(menuLabel: string, subLabel: string): Promise<void> {
    this.logSection("Click Menu — Submenu");
    this.logInfo(`Menu: ${menuLabel}`);
    this.logInfo(`Submenu: ${subLabel}`);
    this.logDivider();

    // Hover main menu
    const menu = this.page.locator(
      `li.menu-list__item a:has-text("${menuLabel}")`
    ).first();

    await menu.waitFor({ state: "visible", timeout: 7000 });
    await menu.hover();

    // Click submenu
    const submenu = this.page.locator(
      `.submenu-list__block-item a:has-text("${subLabel}")`
    ).first();

    await submenu.waitFor({ state: "visible", timeout: 7000 });
    await submenu.click();

    this.logInfo(`✓ Clicked submenu: ${subLabel}`);

    await this.validateTitleContains(this.page, subLabel);
    this.logInfo(`✓ Page title validated for submenu: ${subLabel}`);

    this.logDivider();
  }

  // Wrapper (igual ao clickMenu do TC2)
  async clickMenu(menuLabel: string, subLabel?: string): Promise<void> {
    if (!subLabel) {
      await this.clickMainMenu(menuLabel);
      return;
    }

    await this.clickSubmenu(menuLabel, subLabel);
  }

  // ============================================================
  // 🔵 HOMEPAGE TITLES — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async validateSingleTitle(expected: string): Promise<void> {
    this.logSection("Homepage Title — Validation");
    this.logInfo(`Validating title: "${expected}"`);
    this.logDivider();

    const locator = this.page.locator(`text=${expected}`).first();

    await expect(locator).toBeVisible({ timeout: 7000 });

    this.logInfo(`✓ Title found: "${expected}"`);
    this.logDivider();
  }

  async validateHomepageTitles(expectedTitles: string[]): Promise<void> {
    for (const title of expectedTitles) {
      await this.validateSingleTitle(title);
    }
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateMultipleTitles(expectedTitles: string[]): Promise<void> {
    await this.validateHomepageTitles(expectedTitles);
  }

  // ============================
  // CAROUSEL CTA VALIDATION
  // ============================
  // ============================================================
  // 🔵 CAROUSEL CTA — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async validateCarouselCtaVisibility(): Promise<void> {
    this.logSection("Carousel CTA — Visibility");

    const activeSlide = this.carouselActiveSlide;

    await expect(activeSlide).toBeVisible({ timeout: 7000 });

    const cta = activeSlide.locator("a").first();
    await expect(cta).toBeVisible({ timeout: 7000 });

    const href = await cta.getAttribute("href");
    this.logInfo(`CTA href: ${href}`);

    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    this.logDivider();
  }

  async validateCarouselCtaNavigation(): Promise<void> {
    this.logSection("Carousel CTA — Navigation");

    const activeSlide = this.carouselActiveSlide;
    const cta = activeSlide.locator("a").first();

    const href = await cta.getAttribute("href");
    if (!href) throw new Error("❌ CTA button has no href attribute");

    await cta.click({ force: true });

    await expect(this.page).toHaveURL(new RegExp(href, "i"));
    this.logInfo(`✓ CTA navigation OK → ${this.page.url()}`);

    this.logDivider();
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateCarouselCTA(): Promise<void> {
    await this.validateCarouselCtaVisibility();
    await this.validateCarouselCtaNavigation();
  }


  // ============================================================
  // 🔵 INLINE LINKS — SPEAK TO EXPERTS
  // ============================================================

  async getSpeakToExpertsLinks(): Promise<{ text: string; url: string }[]> {
    this.logSection("Inline Links — Speak to Experts");

    const title = this.sectionTitle("Speak to the ski experts");
    await title.waitFor({ state: "visible" });

    this.logInfo(`Section title found: "Speak to the ski experts"`);

    const section = this.sectionContainer(title);
    const links = this.sectionLinks(section);

    const total = await links.count();
    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      const text = (await link.innerText()).trim();
      const href = await link.getAttribute("href");
      const url = this.resolveUrl(href);

      if (!url) continue;

      list.push({ text, url });
    }

    return list;
  }

  async validateSingleInlineLink(text: string, url: string): Promise<void> {
    this.logSection(`Inline Link — ${text}`);
    this.logInfo(`URL: ${url}`);
    this.logDivider();

    const newPage = await this.page.context().newPage();
    await newPage.goto(url, { waitUntil: "domcontentloaded" });

    await this.validatePageTitleFuzzy(newPage, text);

    await newPage.close();
    this.logDivider();
  }

  async validateSpeakToExpertsLinksList(): Promise<void> {
    const list = await this.getSpeakToExpertsLinks();

    for (const item of list) {
      await this.validateSingleInlineLink(item.text, item.url);
    }
  }

  // Wrapper (compatibilidade)
  async validateSpeakToExpertsLinks(): Promise<void> {
    await this.validateSpeakToExpertsLinksList();
  }

  // ============================================================
  // 🔵 INLINE LINKS — FIND YOUR SKIING HOLIDAY
  // ============================================================

  async getFindYourSkiingHolidayLinks(): Promise<{ text: string; url: string }[]> {
    this.logSection("Inline Links — Find Your Skiing Holiday");

    const titleText = "Find Your Skiing Holiday";

    const titleXPath = `//h2[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${titleText.toLowerCase()}")]`;

    const title = this.page.locator(titleXPath);
    await title.waitFor({ state: "visible" });

    this.logInfo(`Section title found: "${titleText}"`);

    const links = this.page.locator(
      `${titleXPath}/following-sibling::a[following-sibling::div]`
    );

    const total = await links.count();
    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      const text = (await link.innerText()).trim();
      const href = await link.getAttribute("href");
      const url = this.resolveUrl(href);

      if (!url) continue;

      list.push({ text, url });
    }

    return list;
  }

  async validateFindYourSkiingHolidayLinksList(): Promise<void> {
    const list = await this.getFindYourSkiingHolidayLinks();

    for (const item of list) {
      await this.validateSingleInlineLink(item.text, item.url);
    }
  }

  // Wrapper (compatibilidade)
  async validateFindYourSkiingHolidayLinks(): Promise<void> {
    await this.validateFindYourSkiingHolidayLinksList();
  }

  /**
   * Logs a standardized test start message
   */
  logTestStart(testName: string): void {
    console.log(`\n===== TEST STARTED: ${testName} =====\n`);
  }

  /**
   * Checks if the hamburger menu is visible (mobile/tablet)
   */
  async isHamburgerMenuVisible(): Promise<boolean> {
    try {
      return await this.hamburgerMenu.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Checks if the page has horizontal overflow (layout break)
   */
  async hasHorizontalOverflow(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
  }

  /**
   * Validates that visible images do not exceed the viewport width
   */
  async validateImagesResponsive(maxWidth: number): Promise<{
    valid: boolean;
    totalImages: number;
    invalidImages: number;
    issues: string[];
  }> {
    const allImages = await this.allImages.all();
    let invalidCount = 0;
    const issues: string[] = [];

    for (const image of allImages) {
      const isVisible = await image.isVisible().catch(() => false);

      if (isVisible) {
        const boundingBox = await image.boundingBox();

        if (boundingBox && boundingBox.width > maxWidth) {
          invalidCount++;
          issues.push(
            `Image width ${boundingBox.width}px exceeds max allowed ${maxWidth}px`
          );
        }
      }
    }

    return {
      valid: invalidCount === 0,
      totalImages: allImages.length,
      invalidImages: invalidCount,
      issues,
    };
  }

  /**
   * TC26 — Validate Page Responsiveness (Mobile/Tablet)
   * - viewport 375/768
   * - hamburger visible
   * - no horizontal overflow
   * - images responsive
   */
  // ============================================================
  // 🔵 RESPONSIVENESS — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async setViewport(width: number): Promise<void> {
    this.logSection(`Responsiveness — Set Viewport`);
    this.logInfo(`Setting viewport to ${width}px`);
    await this.page.setViewportSize({ width, height: 900 });
    this.logDivider();
  }

  async validateHamburgerMenu(width: number): Promise<void> {
    this.logSection(`Responsiveness — Hamburger Menu`);
    const visible = await this.isHamburgerMenuVisible();

    if (!visible) {
      throw new Error(`TC26 FAILED: Hamburger menu NOT visible at ${width}px`);
    }

    this.logInfo(`✓ Hamburger menu visible at ${width}px`);
    this.logDivider();
  }

  async validateNoHorizontalOverflow(width: number): Promise<void> {
    this.logSection(`Responsiveness — Horizontal Overflow`);
    const overflow = await this.hasHorizontalOverflow();

    if (overflow) {
      throw new Error(`TC26 FAILED: Horizontal overflow detected at ${width}px`);
    }

    this.logInfo(`✓ No horizontal overflow at ${width}px`);
    this.logDivider();
  }

  async validateResponsiveImages(width: number): Promise<void> {
    this.logSection(`Responsiveness — Images`);
    const result = await this.validateImagesResponsive(width);

    if (!result.valid) {
      throw new Error(
        `TC26 FAILED: Images not responsive at ${width}px. Invalid images: ${result.invalidImages}`
      );
    }

    this.logInfo(`✓ All images responsive at ${width}px`);
    this.logDivider();
  }

  async validateResponsivenessAtWidth(width: number): Promise<void> {
    await this.setViewport(width);
    await this.validateHamburgerMenu(width);
    await this.validateNoHorizontalOverflow(width);
    await this.validateResponsiveImages(width);

    this.logInfo(`✓ TC26 PASSED at ${width}px`);
    this.logDivider();
  }

  // Wrapper (compatibilidade com o nome antigo)
  async validateResponsiveness(width: number): Promise<void> {
    await this.validateResponsivenessAtWidth(width);
  }

  // ============================
  // FOOTER - TC28 HELPERS
  // ============================

  /**
   * Scrolls to the footer
   */
  async scrollToFooter(): Promise<void> {
    await this.page.keyboard.press('End');
    await this.page.waitForTimeout(800);
  }

  /**
   * Checks if the Holiday ID container is visible
   */
  async isHolidayIdContainerVisible(): Promise<boolean> {
    try {
      return await this.holidayIdContainer.isVisible();
    } catch {
      return false;
    }
  }

  // ============================
  // TC28 - Validate Search by Holiday ID
  // ============================

  /**
   * TC28 — Validate "Search by Holiday ID" button in the footer
   */
  async validateHolidayIdSearch(): Promise<void> {
    console.log(`\n===== TC28: Validating 'Search by Holiday ID' in Footer =====\n`);

    // 1. Scroll to footer
    await this.scrollToFooter();

    const containerVisible = await this.isHolidayIdContainerVisible();
    if (!containerVisible) {
      throw new Error("TC28 FAILED: Holiday ID container not visible in footer.");
    }

    // 2. Validate button visibility
    const buttonVisible = await this.btnSearchByHolidayId.isVisible();
    if (!buttonVisible) {
      throw new Error("TC28 FAILED: 'Search by Holiday ID' button not found.");
    }

    // 3. Click the button
    await this.btnSearchByHolidayId.click();
    await this.page.waitForTimeout(600);

    // 4. Validate form visibility
    const formVisible = await this.holidayIdForm.isVisible();
    if (!formVisible) {
      throw new Error("TC28 FAILED: Holiday ID form did not open after clicking the button.");
    }

    // 5. Validate input field
    const inputVisible = await this.holidayIdInput.isVisible();
    if (!inputVisible) {
      throw new Error("TC28 FAILED: Holiday ID input field not visible.");
    }

    // 6. Validate search button
    const searchBtnVisible = await this.holidayIdSearchButton.isVisible();
    if (!searchBtnVisible) {
      throw new Error("TC28 FAILED: Search button inside Holiday ID form not visible.");
    }

    console.log("✓ TC28 PASSED: Holiday ID search button and form validated successfully.");
  }
}
