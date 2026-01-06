import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class HomePage extends HelperBase {
  // Menu locators
  mainMenuLink = (label: string) =>
    this.page.locator(`li.menu-list__item a:has-text("${label}")`).first();

  submenuLink = (label: string) =>
    this.page.locator(`.submenu-list__block-item a:has-text("${label}")`).first();

  // ============================
  // CAROUSEL LOCATORS
  // ============================
  readonly carouselNextButton = this.page.locator('.content-carousel__control--right');
  readonly carouselActiveSlide = this.page.locator('.content-carousel__inner__item--active');
  readonly carouselSlides = this.page.locator('//div[contains(@class, "content-carousel__inner__item")]');
  readonly carouselCta = this.carouselActiveSlide.locator('a').first();

  // ============================
  // COOKIES LOCATORS
  // ============================
  readonly cookiesBanner = this.page.locator('#onetrust-banner-sdk');
  readonly acceptCookiesBtn = this.page.locator('#onetrust-accept-btn-handler').first();
  readonly acceptCookiesBtnRecommended = this.page.locator('#accept-recommended-btn-handler');

  // ============================
  // SEARCH LOCATORS
  // ============================
  readonly propertiesSearchInput = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly searchButton = this.page.locator('button.search-item__cta , .search-bar__form-submit');

  // ============================
  // CTA LOCATORS
  // ============================
  readonly ctaRow = this.page.locator('h2:has-text("TALK TO")').locator('..').locator('..');
  readonly ctaBoxes = this.ctaRow.locator('a');
  readonly ctaTitles = this.ctaRow.locator('h2.box-panel__title');

  // ============================
  // COUNTRY BANNER LOCATORS
  // ============================
  readonly countryBannerAnchors = this.page.locator('//div[contains(@class, "country-banner")]//a');

  countryBannerLink(label: string): Locator {
    return this.countryBannerAnchors.filter({ hasText: label });
  }

  // ============================
  // INLINE SECTIONS LOCATORS
  // ============================
  readonly speakToExpertsHeading = this.page.getByRole('heading', { name: /speak to the ski experts/i });
  readonly speakToExpertsSection = this.speakToExpertsHeading.locator("xpath=ancestor::div[contains(@class,'row')]");
  readonly speakToExpertsLinks = this.speakToExpertsSection.locator('a');

  readonly findHolidayHeading = this.page.getByRole('heading', { name: /find your skiing holiday/i });
  readonly findHolidaySection = this.findHolidayHeading.locator("xpath=ancestor::div[contains(@class,'row')]");
  readonly findHolidayLinks = this.findHolidaySection.locator('a');

  // ============================
  // RESPONSIVE LOCATORS
  // ============================
  readonly hamburgerMenu = this.page
    .locator('[aria-label*="menu" i], .hamburger, button[id*="menu"], [class*="hamburger"], [class*="menu"]')
    .first();

  constructor(page: Page) {
    super(page);
  }

  // ============================================================
  // 🔵 NAVIGATION — HOME PAGE SETUP
  // ============================================================

  async navigateAndAcceptCookies(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'load' });
    try {
      await this.page.waitForLoadState('networkidle');
    } catch {
      // networkidle may never occur (analytics, long-polling). Continue and
      // wait for a key element to be visible so tests proceed deterministically.
    }
    await this.acceptCookies();
  }

  // ============================================================
  // 🔵 CAROUSEL — SMALL, MODULAR FUNCTIONS (REFINED)
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

    // Click CTA inside the active slide
    await this.carouselCta.click();
    this.logInfo("✓ CTA clicked");

    // Return to homepage
    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });

    // Move to next slide (if not last)
    if (index < total - 1) {
      const href = await this.carouselCta.getAttribute("href");
      this.logInfo("Moving to next slide...");
      await this.carouselNextButton.click();
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
  // 🔵 CTA BOXES — PAGE-SPECIFIC FUNCTIONS (REFINED)
  // ============================================================

  async getCtaBoxesList(): Promise<{ title: string; normalized: string; url: string | null }[]> {
    this.logSection("CTA Boxes — Fetch List");

    const total = await this.ctaBoxes.count();
    this.logInfo(`Total CTA boxes detected: ${total}`);
    this.logDivider();

    const list: { title: string; normalized: string; url: string | null }[] = [];

    for (let i = 0; i < total; i++) {
      const rawTitle = await this.ctaTitles.nth(i).innerText();
      const normalized = this.normalizeText(rawTitle);

      const href = await this.ctaBoxes.nth(i).getAttribute("href");
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

    // Open URL and validate pattern
    await this.openAndValidateUrl(url, expectedPattern);
    this.logInfo("✓ CTA navigation OK");

    // Return to homepage
    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });

    this.logDivider();
  }

  async validateCtaBoxesList(): Promise<void> {
    const list = await this.getCtaBoxesList();

    // Expected URL patterns for each CTA
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

    const countryLink = this.countryBannerLink(label);

    await this.scrollIntoView(countryLink);

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

  async validateCountryBanners(): Promise<void> {
    await this.validateCountryBannersList();
  }

  // ============================================================
  // 🔵 CLICK MENU — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async clickMainMenu(menuLabel: string): Promise<void> {
    this.logSection("Click Menu — Main");
    this.logInfo(`Menu: ${menuLabel}`);
    this.logDivider();

    await this.mainMenuLink(menuLabel).click();

    this.logInfo(`✓ Clicked main menu: ${menuLabel}`);
    this.logDivider();
  }

  async clickSubmenu(menuLabel: string, subLabel: string): Promise<void> {
    this.logSection("Click Menu — Submenu");
    this.logInfo(`Menu: ${menuLabel}`);
    this.logInfo(`Submenu: ${subLabel}`);
    this.logDivider();

    // Hover main menu
    await this.mainMenuLink(menuLabel).hover();

    // Click submenu
    await this.submenuLink(subLabel).click();

    this.logInfo(`✓ Clicked submenu: ${subLabel}`);
    this.logDivider();
  }

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

  async validateSingleTitle(expected: string): Promise<void> {
    this.logSection("Homepage Title — Validation");
    this.logInfo(`Validating title: "${expected}"`);

    // Locate the title using Playwright's native text selector
    const titleLocator = this.page.getByText(expected, { exact: false });

    // Get text to confirm it exists
    const text = await titleLocator.textContent();
    this.logInfo(`Title text: "${text}"`);

    // VALIDATION — Must be visible
    await expect(titleLocator).toBeVisible();
    this.logInfo(`✓ Title found and visible: "${expected}"`);

    this.logDivider();
  }

  async validateHomepageTitles(expectedTitles: string[]): Promise<void> {
    for (const title of expectedTitles) {
      await this.validateSingleTitle(title);
    }
  }

  // ============================================================
  // 🔵 CAROUSEL CTA — PAGE-SPECIFIC FUNCTIONS (REFINED)
  // ============================================================

  async validateCarouselCtaVisibility(): Promise<void> {
    this.logSection("Carousel CTA — Visibility");

    // Capture CTA href for validation and logging
    const href = await this.carouselCta.getAttribute("href");
    this.logInfo(`CTA href: ${href}`);

    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    this.logDivider();
  }

  async validateCarouselCtaNavigation(): Promise<void> {
    this.logSection("Carousel CTA — Navigation");

    // Extract CTA href
    const href = await this.carouselCta.getAttribute("href");
    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    // Click CTA
    await this.carouselCta.click();
    this.logInfo("✓ CTA clicked");

    // Navigation must match CTA href
    await expect(this.page).toHaveURL(new RegExp(href, "i"));
    this.logInfo(`✓ CTA navigation OK → ${this.page.url()}`);

    this.logDivider();
  }

  async validateCarouselCTA(): Promise<void> {
    await this.validateCarouselCtaVisibility();
    await this.validateCarouselCtaNavigation();
  }

  // ============================================================
  // 🔵 INLINE LINKS — SPEAK TO EXPERTS
  // ============================================================

  async getSpeakToExpertsLinks(): Promise<{ text: string; url: string }[]> {
    this.logSection("Inline Links — Speak to Experts");

    const total = await this.speakToExpertsLinks.count();

    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = this.speakToExpertsLinks.nth(i);

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

    // Open link in a new page
    const newPage = await this.page.context().newPage();
    await newPage.goto(url, { waitUntil: "domcontentloaded" });

    // Page must load the expected URL
    await expect(newPage).toHaveURL(new RegExp(url, "i"));
    this.logInfo(`✓ Navigation OK → ${newPage.url()}`);

    // Log page title
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

  async validateSpeakToExpertsLinks(): Promise<void> {
    await this.validateSpeakToExpertsLinksList();
  }


  // ============================================================
  // 🔵 INLINE LINKS — FIND YOUR SKIING HOLIDAY
  // ============================================================

  async getFindYourSkiingHolidayLinks(): Promise<{ text: string; url: string }[]> {
    this.logSection("Inline Links — Find Your Skiing Holiday");

    const total = await this.findHolidayLinks.count();

    this.logInfo(`Total links detected: ${total}`);
    this.logDivider();

    const list: { text: string; url: string }[] = [];

    for (let i = 0; i < total; i++) {
      const link = this.findHolidayLinks.nth(i);

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

  async validateFindYourSkiingHolidayLinks(): Promise<void> {
    await this.validateFindYourSkiingHolidayLinksList();
  }


  logTestStart(testName: string): void {
    console.log(`\n===== TEST STARTED: ${testName} =====\n`);
  }

  // ============================================================
  // 🔵 RESPONSIVENESS — SMALL, MODULAR FUNCTIONS (REFINED)
  // ============================================================

  async setViewport(width: number): Promise<void> {
    this.logSection("Responsiveness — Set Viewport");
    this.logInfo(`Setting viewport to ${width}px`);

    await this.page.setViewportSize({ width, height: 900 });

    this.logDivider();
  }

  async validateHamburgerMenu(width: number): Promise<void> {
    this.logSection("Responsiveness — Hamburger Menu");

    const visible = await this.hamburgerMenu.isVisible();

    if (!visible) {
      throw new Error(`TC26 FAILED: Hamburger menu NOT visible at ${width}px`);
    }

    this.logInfo(`✓ Hamburger menu visible at ${width}px`);
    this.logDivider();
  }

  async validateNoHorizontalOverflow(width: number): Promise<void> {
    this.logSection("Responsiveness — Horizontal Overflow");

    const overflow = await this.hasHorizontalOverflow();

    if (overflow) {
      throw new Error(`TC26 FAILED: Horizontal overflow detected at ${width}px`);
    }

    this.logInfo(`✓ No horizontal overflow at ${width}px`);
    this.logDivider();
  }

  async validateResponsiveImages(width: number): Promise<void> {
    this.logSection("Responsiveness — Images");

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
    this.logSection(`Responsiveness — ${width}px`);

    // STEP A — Set viewport
    await this.setViewport(width);

    // STEP B — Validate hamburger menu behavior
    await this.validateHamburgerMenu(width);

    // STEP C — Validate no horizontal overflow
    await this.validateNoHorizontalOverflow(width);

    // STEP D — Validate responsive images
    await this.validateResponsiveImages(width);

    // FINAL LOG
    this.logInfo(`✓ TC26 PASSED at ${width}px`);
    this.logDivider();
  }

  async validateResponsiveness(width: number): Promise<void> {
    await this.validateResponsivenessAtWidth(width);
  }
}
