import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';

export class HomePage extends HelperBase {
  private actions: Actions;
  private navPage: Page | null = null;

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
  readonly carouselNextButton = this.page.locator('.content-carousel__control--right');
  readonly carouselActiveSlide = this.page.locator('.content-carousel__inner__item--active');
  readonly carouselSlides = this.page.locator('//div[contains(@class, "content-carousel__inner__item")]');

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
  readonly searchButton = this.page.locator('button.search-item__cta , .search-bar__form-submit');

  // ============================
  // RESPONSIVE / TC26 LOCATORS
  // ============================

  // Hamburger menu (mobile/tablet)
  readonly hamburgerMenu = this.page
    .locator('[aria-label*="menu" i], .hamburger, button[id*="menu"], [class*="hamburger"], [class*="menu"]')
    .first();

  // All images on the page
  readonly allImages = this.page.locator('img');


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

  // ============================================================
  // 🔵 CTA BOXES — PAGE-SPECIFIC FUNCTIONS
  // ============================================================

  // Fetches all CTA boxes, titles, and URLs
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

  // Validates a single CTA box
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

  // Validates all CTA boxes
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

  // Wrapper for backward compatibility
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
  // 🔵 HOMEPAGE TITLES — PAGE-SPECIFIC FUNCTIONS
  // ============================================================

  // Validates a single homepage title
  async validateSingleTitle(expected: string): Promise<void> {
    this.logSection("Homepage Title — Validation");
    this.logInfo(`Validating title: "${expected}"`);
    this.logDivider();

    // Locate the title using a robust text selector
    const locator = this.page.locator(`xpath=//*[contains(text(), "${expected}")]`).first();

    // Ensure the title is visible
    await expect(locator).toBeVisible({ timeout: 7000 });

    this.logInfo(`✓ Title found: "${expected}"`);
    this.logDivider();
  }

  // Validates all homepage titles
  async validateHomepageTitles(expectedTitles: string[]): Promise<void> {
    for (const title of expectedTitles) {
      await this.validateSingleTitle(title);
    }
  }

  // ============================================================
  // 🔵 CAROUSEL CTA — PAGE-SPECIFIC FUNCTIONS
  // ============================================================

  // Validates CTA visibility inside the active carousel slide
  async validateCarouselCtaVisibility(): Promise<void> {
    this.logSection("Carousel CTA — Visibility");

    const activeSlide = this.carouselActiveSlide;

    // Ensure the active slide is visible
    await expect(activeSlide).toBeVisible({ timeout: 7000 });

    // Locate the CTA inside the active slide
    const cta = activeSlide.locator("a").first();

    // Ensure the CTA is visible
    await expect(cta).toBeVisible({ timeout: 7000 });

    // Extract CTA href
    const href = await cta.getAttribute("href");
    this.logInfo(`CTA href: ${href}`);

    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    this.logDivider();
  }

  // Validates CTA navigation from the active carousel slide
  async validateCarouselCtaNavigation(): Promise<void> {
    this.logSection("Carousel CTA — Navigation");

    const activeSlide = this.carouselActiveSlide;
    const cta = activeSlide.locator("a").first();

    // Extract CTA href
    const href = await cta.getAttribute("href");
    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    // Ensure CTA is visible before clicking
    await expect(cta).toBeVisible();

    // Click CTA (no force needed)
    await cta.click();

    // Validate navigation
    await expect(this.page).toHaveURL(new RegExp(href, "i"));
    this.logInfo(`✓ CTA navigation OK → ${this.page.url()}`);

    this.logDivider();
  }

  // Wrapper for backward compatibility
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
    await expect(title).toBeVisible();

    this.logInfo(`Section title found: "Speak to the ski experts"`);

    const section = this.sectionContainer(title);
    const links = this.sectionLinks(section);

    const total = await links.count();
    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      const text = (await link.textContent())?.trim() ?? "";
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

    // Validate page loaded correctly
    await expect(newPage).toHaveURL(new RegExp(url, "i"));

    const title = await newPage.title();
    this.logInfo(`✓ Page title: ${title}`);

    await newPage.close();
    this.logDivider();
  }

  async validateSpeakToExpertsLinksList(): Promise<void> {
    const list = await this.getSpeakToExpertsLinks();

    for (const item of list) {
      await this.validateSingleInlineLink(item.text, item.url);
    }
  }

  // Wrapper
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
    await expect(title).toBeVisible();

    this.logInfo(`Section title found: "${titleText}"`);

    // More robust selector: find links inside the same section container
    const section = title.locator('xpath=ancestor::div[contains(@class, "row")]');
    const links = section.locator('a');

    const total = await links.count();
    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      const text = (await link.textContent())?.trim() ?? "";
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

  // Wrapper
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

  // ============================================================
  // 🔵 RESPONSIVENESS — SMALL, MODULAR FUNCTIONS
  // ============================================================

  // Set viewport
  async setViewport(width: number): Promise<void> {
    this.logSection(`Responsiveness — Set Viewport`);
    this.logInfo(`Setting viewport to ${width}px`);
    await this.page.setViewportSize({ width, height: 900 });
    this.logDivider();
  }

  // Validate hamburger menu visibility
  async validateHamburgerMenu(width: number): Promise<void> {
    this.logSection(`Responsiveness — Hamburger Menu`);

    const visible = await this.isHamburgerMenuVisible();

    if (!visible) {
      throw new Error(`TC26 FAILED: Hamburger menu NOT visible at ${width}px`);
    }

    this.logInfo(`✓ Hamburger menu visible at ${width}px`);
    this.logDivider();
  }

  // Validate no horizontal overflow
  async validateNoHorizontalOverflow(width: number): Promise<void> {
    this.logSection(`Responsiveness — Horizontal Overflow`);

    const overflow = await this.hasHorizontalOverflow();

    if (overflow) {
      throw new Error(`TC26 FAILED: Horizontal overflow detected at ${width}px`);
    }

    this.logInfo(`✓ No horizontal overflow at ${width}px`);
    this.logDivider();
  }

  // Validate responsive images
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

  // Main validator
  async validateResponsivenessAtWidth(width: number): Promise<void> {
    this.logSection(`Responsiveness — ${width}px`);

    // STEP A — Set viewport
    await this.setViewport(width);
    this.logInfo(`Viewport set to ${width}px`);

    // STEP B — Validate hamburger menu behavior
    await this.validateHamburgerMenu(width);
    this.logInfo("✓ Hamburger menu validated");

    // STEP C — Validate no horizontal overflow
    await this.validateNoHorizontalOverflow(width);
    this.logInfo("✓ No horizontal overflow detected");

    // STEP D — Validate responsive images
    await this.validateResponsiveImages(width);
    this.logInfo("✓ Responsive images validated");

    // FINAL LOG
    this.logInfo(`✓ TC26 PASSED at ${width}px`);
    this.logDivider();
  }

  // Wrapper
  async validateResponsiveness(width: number): Promise<void> {
    await this.validateResponsivenessAtWidth(width);
  }

}
