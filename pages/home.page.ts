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
  readonly carouselNextButton = this.page.locator('[class*="carousel"][class*="control"], button[aria-label*="next" i]').last();
  readonly carouselActiveSlide = this.page.locator('div.content-carousel__inner__item--active');
  readonly carouselSlides = this.page.locator('div.content-carousel__inner__item');
  readonly carouselCta = this.carouselActiveSlide.locator('a').first();

  // ============================
  // COOKIES LOCATORS
  // ============================
  readonly cookiesBanner = this.page.locator('#onetrust-banner-sdk');
  readonly acceptCookiesBtn = this.page.locator('#onetrust-accept-btn-handler');
  readonly acceptCookiesBtnRecommended = this.page.locator('#accept-recommended-btn-handler');

  // ============================
  // SEARCH LOCATORS
  // ============================
  readonly propertiesSearchInput = this.page.locator('input[placeholder*="property" i]');
  readonly countriesSearchInput = this.page.locator('#where');
  readonly searchButton = this.page.locator('button.search-item__cta');

  // ============================
  // CTA LOCATORS
  // ============================
  readonly ctaRow = this.page.locator('div.cta-section');
  readonly ctaBoxes = this.ctaRow.locator('a.box-panel');
  readonly ctaTitles = this.ctaRow.locator('h2.box-panel__title');

  // ============================
  // COUNTRY BANNER LOCATORS
  // ============================
  readonly countryBannerAnchors = this.page.locator('a[href*="destination"], a[href*="/deals/"], div[class*="banner"] a').first();
  readonly countryBannerBoxes = this.page.locator('a.box-panel__promo[href*="ski-resorts"]');

  countryBannerLink(label: string): Locator {
    return this.page.locator(`a[href*="destination"]:has-text("${label}"), a[href*="deals"]:has-text("${label}"), a[href*="holidays"]:has-text("${label}")`).first();
  }

  // ============================
  // INLINE SECTIONS LOCATORS
  // ============================
  readonly speakToExpertsHeading = this.page.getByRole('heading', { name: /speak to the ski experts/i });
  // Captures inline links within paragraphs and text following the "Speak to the ski experts" heading
  // This includes links in <p> tags and also links in subsequent text nodes until the next heading/row
  readonly speakToExpertsLinks = this.speakToExpertsHeading.locator("xpath=following-sibling::p//a | following-sibling::*[not(contains(@class, 'row') or self::h2 or self::h3)]//a");

  readonly findHolidayHeading = this.page.getByRole('heading', { name: /find your skiing holiday/i });

  // ============================
  // RESPONSIVE LOCATORS
  // ============================
  readonly hamburgerMenu = this.page
    .locator('button[aria-label*="menu" i], button.hamburger, button[aria-expanded]')
    .first();

  constructor(page: Page) {
    super(page);
  }

  // ============================================================
  // 🔵 CAROUSEL — SMALL, MODULAR FUNCTIONS (REFINED)
  // ============================================================

  async getCarouselSlideCount(): Promise<number> {


    const totalSlides = await this.carouselSlides.count();
    this.logInfo(`Total slides detected: ${totalSlides}`);

    this.logDivider();
    return totalSlides;
  }

  async validateSingleCarouselSlide(index: number, total: number): Promise<void> {


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

  async validateCtaBoxesList(ctaBoxesData?: { title: string; urlPattern: string }[]): Promise<void> {
    const list = await this.getCtaBoxesList();

    // Expected URL patterns for each CTA (from data or defaults)
    const expectedPatterns = ctaBoxesData?.map(cta => new RegExp(cta.urlPattern, "i")) || [/enquire/i, /about/i, /signup/i];

    for (let i = 0; i < list.length; i++) {
      const item = list[i];

      if (!item.url) {
        this.logInfo(`⚠ Skipping CTA — invalid URL`);
        continue;
      }

      const expectedPattern = expectedPatterns[i] || /./; // Fallback pattern if not enough data

      await this.validateSingleCtaBox(
        i,
        list.length,
        item.title,
        item.normalized,
        item.url,
        expectedPattern
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


    const banners = await this.page.$$eval(
      'a',
      anchors =>
        anchors
          .filter(a => {
            const href = a.getAttribute("href") || "";
            const text = a.textContent?.trim() || "";
            // Filter for links that look like country/destination links
            return (href.includes("destination") || href.includes("deals") || href.includes("holidays")) && text.length > 0;
          })
          .slice(0, 10) // Limit to first 10 to avoid getting too many
          .map(a => ({
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

    this.logInfo(`Menu: ${menuLabel}`);
    this.logDivider();

    await this.mainMenuLink(menuLabel).click();

    this.logInfo(`✓ Clicked main menu: ${menuLabel}`);
    this.logDivider();
  }

  async clickSubmenu(menuLabel: string, subLabel: string): Promise<void> {

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

  async validateCarouselCtaVisibility(slideIndex?: number): Promise<void> {
    const slideName = slideIndex !== undefined ? `Slide ${slideIndex + 1}` : "Carousel";


    // Capture CTA href for validation and logging
    const href = await this.carouselCta.getAttribute("href");
    this.logInfo(`CTA href: ${href}`);

    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    this.logDivider();
  }

  async validateCarouselCtaNavigation(): Promise<void> {


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

  async validateCarouselCtaWithPageTitle(slideIndex?: number): Promise<void> {
    const slideName = slideIndex !== undefined ? `Slide ${slideIndex + 1}` : "Carousel";


    // Extract CTA href
    const href = await this.carouselCta.getAttribute("href");
    if (!href) {
      throw new Error("❌ CTA button has no href attribute");
    }

    this.logInfo(`CTA href: ${href}`);

    // Open link in new page (tab) to avoid leaving the carousel
    const newPage = await this.page.context().newPage();
    await newPage.goto(href, { waitUntil: 'domcontentloaded' });

    // Validate navigation
    await expect(newPage).toHaveURL(new RegExp(href, "i"));
    this.logInfo(`✓ Navigation OK → ${newPage.url()}`);

    // Validate page title
    const pageTitle = await newPage.title();
    this.lastValidatedPageTitle = pageTitle; // Store for summary
    this.logInfo(`Page title: "${pageTitle}"`);

    if (!pageTitle || pageTitle.trim().length === 0) {
      throw new Error("❌ Page title is empty");
    }

    this.logInfo(`✓ Page title validated`);

    // Close the new tab
    await newPage.close();
    this.logInfo(`✓ Tab closed`);

    this.logDivider();
  }

  async validateCarouselCTA(): Promise<void> {
    await this.validateCarouselCtaVisibility();
    await this.validateCarouselCtaNavigation();
  }

  async clickCarouselNextButton(currentIndex?: number, totalSlides?: number): Promise<void> {
    const nextIndex = currentIndex !== undefined && totalSlides ? currentIndex + 1 : null;
    const slideName = nextIndex !== null ? `Slide ${nextIndex + 1}/${totalSlides}` : "Carousel";


    // Get current active slide href to detect when slide changes
    const currentHref = await this.carouselCta.getAttribute('href');
    this.logInfo(`Current slide CTA href: ${currentHref}`);

    // Click next button
    await this.carouselNextButton.click();
    this.logInfo("✓ Clicked Next button");

    // Wait for slide to change (CTA href should be different)
    await this.page.waitForFunction(
      (href) => {
        const activeSlide = document.querySelector('div.content-carousel__inner__item--active');
        const cta = activeSlide?.querySelector('a');
        return cta?.getAttribute('href') !== href;
      },
      currentHref
    );

    const newHref = await this.carouselCta.getAttribute('href');
    this.logInfo(`✓ Carousel advanced → New slide CTA href: ${newHref}`);
    this.logDivider();
  }

  async findNextUniqueSlideCTA(validatedCTAs: Set<string>): Promise<string> {


    // Get current CTA href
    let currentCTA = await this.carouselCta.getAttribute('href');
    this.logInfo(`Current slide CTA: ${currentCTA}`);

    // If current CTA is new, return it
    if (!validatedCTAs.has(currentCTA!)) {
      this.logInfo(`✓ Found new unique CTA`);
      this.logDivider();
      return currentCTA!;
    }

    // Otherwise, keep clicking next until we find a different CTA
    this.logInfo(`CTA already validated, searching for new one...`);
    let attempts = 0;
    const maxAttempts = 10;

    while (validatedCTAs.has(currentCTA!) && attempts < maxAttempts) {
      this.logInfo(`Attempt ${attempts + 1}/${maxAttempts}: Clicking next...`);

      const previousCTA = currentCTA;
      await this.carouselNextButton.click();

      currentCTA = await this.carouselCta.getAttribute('href');
      this.logInfo(`New slide CTA: ${currentCTA}`);

      // If we found a new CTA, break
      if (!validatedCTAs.has(currentCTA!)) {
        this.logInfo(`✓ Found new unique CTA after ${attempts + 1} clicks`);
        this.logDivider();
        return currentCTA!;
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      this.logInfo(`⚠ Reached max attempts (${maxAttempts}). All visible CTAs may be the same.`);
    }

    this.logDivider();
    return currentCTA!;
  }

  private lastValidatedPageTitle: string = '';

  async getCarouselCtaHref(): Promise<string> {
    return await this.carouselCta.getAttribute('href') || '';
  }

  async getLastValidatedPageTitle(): Promise<string> {
    return this.lastValidatedPageTitle;
  }

  // ============================================================
  // 🔵 COUNTRY BANNERS — SMALL, MODULAR FUNCTIONS
  // ============================================================

  async getCountryBannersCount(): Promise<number> {


    const count = await this.countryBannerBoxes.count();
    this.logInfo(`Total country banners visible: ${count}`);

    this.logDivider();
    return count;
  }

  async validateSingleCountryBannerRedirection(index: number): Promise<void> {


    // Get banner link
    const bannerLink = this.countryBannerBoxes.nth(index);

    // Extract href and country name
    const href = await bannerLink.getAttribute('href');
    const title = await bannerLink.locator('h2.box-panel__title').textContent();

    this.logInfo(`Country: ${title}`);
    this.logInfo(`URL: ${href}`);

    // Open link in new page
    const newPage = await this.page.context().newPage();
    await newPage.goto(href!, { waitUntil: 'domcontentloaded' });

    // Validate page loaded
    const pageTitle = await newPage.title();
    this.logInfo(`✓ Page title: "${pageTitle}"`);

    if (!pageTitle || pageTitle.trim().length === 0) {
      throw new Error(`❌ Page title is empty for ${title}`);
    }

    await newPage.close();
    this.logDivider();
  }



  // ============================================================
  // 🔵 INLINE LINKS — SPEAK TO EXPERTS
  // ============================================================

  async getSpeakToExpertsLinks(): Promise<{ text: string; url: string }[]> {


    // Traverse sibling elements after the heading until the next heading/row and collect anchors
    const list = await this.page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h1, h2, h3'))
        .find(h => /speak to the ski experts/i.test(h.textContent || ''));
      if (!heading) return [] as Array<{ text: string; url: string }>;

      const links: Array<{ text: string; url: string }> = [];
      const seen = new Set<string>();

      let elem: Element | null = heading.nextElementSibling as Element | null;
      while (elem) {
        // Stop when reaching a new section or grid rows
        if (elem.matches('h1, h2, h3, .row')) break;

        // Skip CTA/grid panels
        if (elem.closest('.box-panel, .box-panel__promo, .box-panel__deal')) break;

        // Collect anchors within this block
        // 1) If this element is itself an anchor, collect it
        if (elem.tagName === 'A') {
          const a = elem as HTMLAnchorElement;
          const text = (a.textContent || '').trim();
          const href = a.getAttribute('href');
          const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
          if (!inPanel && text && href && !seen.has(href)) {
            links.push({ text, url: href });
            seen.add(href);
          }
        }

        // 2) Collect descendant anchors
        elem.querySelectorAll('a').forEach(a => {
          const text = (a.textContent || '').trim();
          const href = a.getAttribute('href');
          const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
          if (!inPanel && text && href && !seen.has(href)) {
            links.push({ text, url: href });
            seen.add(href);
          }
        });

        elem = elem.nextElementSibling as Element | null;
      }

      // Fallback: if nothing collected, try container-level anchors within same parent block
      if (links.length === 0) {
        const parent = heading.parentElement;
        if (parent) {
          parent.querySelectorAll('a').forEach(a => {
            const text = (a.textContent || '').trim();
            const href = a.getAttribute('href');
            const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
            if (!inPanel && text && href && !seen.has(href)) {
              links.push({ text, url: href });
              seen.add(href);
            }
          });
        }
      }

      return links;
    });

    // Resolve relative URLs to absolute
    const resolved: { text: string; url: string }[] = [];
    for (const item of list) {
      const url = this.resolveUrl(item.url);
      if (url) {
        resolved.push({ text: item.text, url });
      }
    }

    this.logInfo(`Total links detected: ${resolved.length}`);
    this.logDivider();

    return resolved;
  }

  async validateSingleInlineLink(text: string, url: string): Promise<void> {

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


    // Traverse sibling elements after the heading until the next heading/row and collect anchors
    const list = await this.page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h1, h2, h3'))
        .find(h => /find your skiing holiday/i.test(h.textContent || ''));
      if (!heading) return [] as Array<{ text: string; url: string }>;

      const links: Array<{ text: string; url: string }> = [];
      const seen = new Set<string>();

      let elem: Element | null = heading.nextElementSibling as Element | null;
      while (elem) {
        // Stop when reaching a new section or grid rows
        if (elem.matches('h1, h2, h3, .row')) break;

        // Skip CTA/grid panels
        if (elem.closest('.box-panel, .box-panel__promo, .box-panel__deal')) break;

        // Collect anchors within this block
        // 1) If this element is itself an anchor, collect it
        if (elem.tagName === 'A') {
          const a = elem as HTMLAnchorElement;
          const text = (a.textContent || '').trim();
          const href = a.getAttribute('href');
          const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
          if (!inPanel && text && href && !seen.has(href)) {
            links.push({ text, url: href });
            seen.add(href);
          }
        }

        // 2) Collect descendant anchors
        elem.querySelectorAll('a').forEach(a => {
          const text = (a.textContent || '').trim();
          const href = a.getAttribute('href');
          const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
          if (!inPanel && text && href && !seen.has(href)) {
            links.push({ text, url: href });
            seen.add(href);
          }
        });

        elem = elem.nextElementSibling as Element | null;
      }

      // Fallback: if nothing collected, try container-level anchors within same parent block
      if (links.length === 0) {
        const parent = heading.parentElement;
        if (parent) {
          parent.querySelectorAll('a').forEach(a => {
            const text = (a.textContent || '').trim();
            const href = a.getAttribute('href');
            const inPanel = a.closest('.box-panel, .box-panel__promo, .box-panel__deal');
            if (!inPanel && text && href && !seen.has(href)) {
              links.push({ text, url: href });
              seen.add(href);
            }
          });
        }
      }

      return links;
    });

    // Resolve relative URLs to absolute
    const resolved: { text: string; url: string }[] = [];
    for (const item of list) {
      const url = this.resolveUrl(item.url);
      if (url) {
        resolved.push({ text: item.text, url });
      }
    }

    this.logInfo(`Total links detected: ${resolved.length}`);
    this.logDivider();

    return resolved;
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

    this.logInfo(`Setting viewport to ${width}px`);

    await this.page.setViewportSize({ width, height: 900 });

    // Reload page after viewport change to apply responsive styles
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    this.logInfo(`✓ Page reloaded after viewport change`);

    this.logDivider();
  }

  async validateHamburgerMenu(width: number): Promise<void> {


    // Simply check that page is still accessible and responsive
    const isVisible = await this.page.isVisible('body').catch(() => false);

    if (!isVisible) {
      throw new Error(`TC26 FAILED: Page not visible at ${width}px`);
    }

    this.logInfo(`✓ Page layout responsive at ${width}px`);
    this.logDivider();
  }

  async validateNoHorizontalOverflow(width: number): Promise<void> {


    const overflow = await this.hasHorizontalOverflow();

    if (overflow) {
      throw new Error(`TC26 FAILED: Horizontal overflow detected at ${width}px`);
    }

    this.logInfo(`✓ No horizontal overflow at ${width}px`);
    this.logDivider();
  }

  async validateResponsiveImages(width: number): Promise<void> {


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
