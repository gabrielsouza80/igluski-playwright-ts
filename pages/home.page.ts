import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';

export class HomePage extends HelperBase {

  private actions: Actions;

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
  readonly btnAccessCustomerPortal = this.page.locator('//img[contains(@alt, "Customer portal icon")]//..');
  readonly btnRecentlyViewedHeader = this.page.locator('//a[contains(@class, "top-bar__info-link")]');
  readonly resultRecentlyViewedHeader = this.page.locator('//div[contains(@class, "top-bar__rv-no-result")]');
  readonly btnReviewLinkHeader = this.page.locator('//a[@class="header-headline__review-link"]');

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

  async validateLogo() {
    console.log(`\n==================== LOGO — VALIDATION START ====================`);
    await this.validateRedirectButton(this.logoLink, '/');
    console.log(`• Logo redirects correctly to home page`);
    console.log(`==================== LOGO — VALIDATION COMPLETE =================\n`);
  }

  async validateHeaderContactInfo() {
    console.log(`\n==================== HEADER — CONTACT INFO CHECK ====================`);

    const phoneText = await this.phoneLocatorHeader.innerText();
    console.log(`• Header phone text: ${phoneText}`);

    const contactText = await this.contactUsLink.innerText();
    console.log(`• Contact Us link text: ${contactText}`);

    console.log(`• Validating Contact Us redirection...`);
    await this.validateRedirectButton(this.contactUsLink, '/contact-us');

    console.log(`==================== HEADER — CONTACT INFO COMPLETE ==================\n`);
  }

  async validateRecentlyViewedButton() {
    console.log(`\n==================== RECENTLY VIEWED — VALIDATION START ====================`);

    await this.btnRecentlyViewedHeader.click();
    await expect(this.resultRecentlyViewedHeader).toBeVisible();

    const txt = await this.resultRecentlyViewedHeader.innerText();
    console.log(`• Recently Viewed result text: ${txt}`);

    console.log(`==================== RECENTLY VIEWED — VALIDATION COMPLETE ==================\n`);
  }

  async validateAccessCustomerPortal() {
    await this.validateRedirectButton(
      this.btnAccessCustomerPortal,
      this.urls.URLCustomerPortalPage
    );
  }

  async validateRatingsAndReviews() {
    await this.validateRedirectButton(
      this.btnReviewLinkHeader,
      this.urls.URLReviewsPage
    );
  }

  // ============================
  // MENU & SUBMENU VALIDATION
  // ============================
  async validateMenuAndSubMenuNavigation(): Promise<void> {
    console.log(`\n==================== MENUS — VALIDATION START ====================`);

    // Snapshot dos menus e submenus
    const menusSnapshot = await this.page.$$eval("li.menu-list__item", (items) => {
      return items.map((li) => {
        const mainLink = li.querySelector("a");
        const mainHref = mainLink?.getAttribute("href") || null;
        const mainLabel = mainLink?.textContent?.trim() || "";

        const subAnchors = Array.from(li.querySelectorAll(".submenu-list__block-item a"));
        const sublinks = subAnchors.map((a) => ({
          label: a.textContent?.trim() || "",
          href: a.getAttribute("href")
        }));

        return { mainLabel, mainHref, sublinks };
      });
    });

    console.log(`• Total main menus detected: ${menusSnapshot.length}`);
    console.log(`---------------------------------------------------------------`);

    // Processa cada menu
    for (const menu of menusSnapshot) {
      const menuLabel = menu.mainLabel;
      const menuUrl = this.resolveUrl(menu.mainHref);

      console.log(`\n==================== MENU ====================`);
      console.log(`• Menu label: "${menuLabel}"`);
      console.log(`• Menu URL: ${menuUrl || "(no valid URL)"}`);
      console.log(`---------------------------------------------------------------`);

      if (!menuUrl) {
        console.warn(`• Skipping menu "${menuLabel}" — no valid URL.`);
        continue;
      }

      // Abre o menu em nova aba
      const menuPage = await this.page.context().newPage();
      await menuPage.goto(menuUrl, { waitUntil: "domcontentloaded", timeout: 120000 });

      // Valida título da página
      await this.validateTitleContains(menuPage, menuLabel);

      const sublinks = menu.sublinks || [];
      console.log(`• Submenus found: ${sublinks.length}`);

      if (sublinks.length === 0) {
        await menuPage.close();
        continue;
      }

      // Processa cada submenu
      for (const sub of sublinks) {
        const subUrl = this.resolveUrl(sub.href);
        if (!subUrl) continue;

        console.log(`  -----------------------------------------------------------`);
        console.log(`  • Submenu label: "${sub.label}"`);
        console.log(`  • Submenu URL: ${subUrl}`);

        const subPage = await this.page.context().newPage();

        try {
          await subPage.goto(subUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
          await this.validateTitleContains(subPage, sub.label);
          console.log(`  ✓ Submenu validated successfully`);
        } catch (err: any) {
          console.error(`  ❌ Submenu "${sub.label}" failed → ${err?.message || err}`);
        }

        await subPage.close();
      }

      await menuPage.close();
    }

    console.log(`==================== MENUS — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // FOOTER VALIDATION
  // ============================
  async validateFooterItems(): Promise<void> {
    console.log(`\n==================== FOOTER — VALIDATION START ====================`);

    // Captura todos os itens do footer
    const footerItems = await this.page.$$eval(
      '//li[@class="footer-list__item"]',
      (items) =>
        items.map((li) => {
          const a = li.querySelector("a");
          return {
            label: a?.textContent?.trim() || "",
            href: a?.getAttribute("href") || null,
          };
        })
    );

    console.log(`• Total footer items detected: ${footerItems.length}`);
    console.log(`---------------------------------------------------------------`);

    for (const item of footerItems) {
      const label = item.label;
      const url = this.resolveUrl(item.href ?? null);

      console.log(`\n• Footer item: "${label}"`);
      console.log(`  URL: ${url || "(invalid)"}\n`);

      if (!url) {
        console.warn(`  ⚠ Skipping — no valid URL`);
        continue;
      }

      // Localiza o item no footer
      const locator = this.page.locator(
        `//li[@class="footer-list__item"] >> text=${label}`
      );

      // Scroll seguro até o item
      await this.scrollIntoView(locator);

      // Valida redirecionamento abrindo em nova aba
      try {
        await this.openAndValidateUrl(url, new RegExp(url, "i"));
        console.log(`  ✓ Footer link OK`);
      } catch (err: any) {
        console.error(`  ❌ Footer link failed: ${err?.message || err}`);
      }
    }

    console.log(`\n==================== FOOTER — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // CAROUSEL HOME VALIDATION
  // ============================
  async validateCarouselHome(): Promise<void> {
    console.log(`\n==================== CAROUSEL HOME — VALIDATION START ====================`);

    const totalSlides = await this.carouselSlides.count();
    console.log(`• Total slides detected: ${totalSlides}`);

    if (totalSlides === 0) {
      throw new Error("❌ No slides found in carousel");
    }

    // Loop por todos os slides
    for (let i = 0; i < totalSlides; i++) {
      console.log(`\n==================== SLIDE ${i + 1} / ${totalSlides} ====================`);

      // Garante que o slide ativo está visível
      await expect(this.carouselActiveSlide).toBeVisible();

      // CTA do slide ativo
      const bannerCTA = this.carouselActiveSlide.locator("a");
      await bannerCTA.waitFor({ state: "visible", timeout: 7000 });

      const href = await bannerCTA.getAttribute("href");
      console.log(`• Banner CTA detected: ${href}`);

      // Valida navegação
      try {
        await bannerCTA.click({ force: true });
        await expect(this.page).toHaveURL(/ski-holidays/);
        console.log(`  ✓ Banner CTA navigation OK → ${this.page.url()}`);
      } catch {
        console.error(`  ❌ Banner CTA failed on slide ${i + 1}`);
      }

      // Volta para a home
      await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });

      // Avança para o próximo slide
      if (i < totalSlides - 1) {
        console.log(`• Moving to next slide...`);
        await this.carouselNextButton.click({ force: true });
        await this.waitForCarouselSlideChange(href!);
      }
    }

    console.log(`\n==================== CAROUSEL HOME — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // CONTACT SECTION VALIDATION
  // ============================
  async validateContactSection() {
    console.log(`\n==================== CONTACT SECTION — VALIDATION START ====================`);

    await expect(this.contactSection).toBeVisible();
    console.log(`• Contact section is visible`);
    console.log(`---------------------------------------------------------------`);

    const normalize = (t: string) => this.normalizeText(t);

    // ============================
    // PHONE BLOCK
    // ============================
    console.log(`• Validating phone block...`);

    const phoneTitle = normalize(await this.contactPhoneTitle.innerText());
    if (!phoneTitle.includes("speak to a ski expert")) {
      throw new Error(`❌ Phone title mismatch. Found: "${phoneTitle}"`);
    }
    console.log(`  ✓ Phone title OK`);

    console.log(`  • Clicking phone number to validate navigation...`);
    await this.contactPhoneNumber.click();
    await expect(this.page).toHaveURL(/contact-us/);
    console.log(`  ✓ Phone link navigation OK`);

    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });
    console.log(`---------------------------------------------------------------`);

    // ============================
    // EMAIL BLOCK
    // ============================
    console.log(`• Validating email block...`);

    const emailTitle = normalize(await this.contactEmailTitle.innerText());
    if (!emailTitle.includes("email about a ski holiday")) {
      throw new Error(`❌ Email title mismatch. Found: "${emailTitle}"`);
    }
    console.log(`  ✓ Email title OK`);

    const emailButtonText = normalize(await this.contactEmailButton.innerText());
    if (!emailButtonText.includes("enquire")) {
      throw new Error(`❌ Email button text mismatch. Found: "${emailButtonText}"`);
    }
    console.log(`  ✓ Email button text OK`);

    console.log(`  • Clicking ENQUIRE button to validate navigation...`);
    await this.contactEmailButton.click();
    await expect(this.page).toHaveURL(/enquire/);
    console.log(`  ✓ ENQUIRE button navigation OK`);

    await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });
    console.log(`---------------------------------------------------------------`);

    // ============================
    // NEWSLETTER BLOCK
    // ============================
    console.log(`• Validating newsletter block...`);

    const newsletterTitle = normalize(await this.contactNewsletterTitle.innerText());
    if (!newsletterTitle.includes("subscribe to our newsletter")) {
      throw new Error(`❌ Newsletter title mismatch. Found: "${newsletterTitle}"`);
    }
    console.log(`  ✓ Newsletter title OK`);

    const newsletterButtonText = normalize(await this.contactNewsletterButton.innerText());
    if (!newsletterButtonText.includes("sign up")) {
      throw new Error(`❌ Newsletter button text mismatch. Found: "${newsletterButtonText}"`);
    }
    console.log(`  ✓ Newsletter button text OK`);

    console.log(`  • Clicking SIGN UP button to validate navigation...`);
    await this.contactNewsletterButton.click();
    await expect(this.page).toHaveURL(/signup/);
    console.log(`  ✓ SIGN UP button navigation OK`);

    console.log(`\n==================== CONTACT SECTION — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // CTA BOXES VALIDATION
  // ============================
  async validateCtaBoxes(): Promise<void> {
    console.log(`\n==================== CTA BOXES — VALIDATION START ====================`);

    // Find the row that contains the first CTA title
    const ctaRow = this.page.locator(
      '//h2[contains(text(), "TALK TO")]/ancestor::div[@class="row"]'
    );

    // Select the 3 CTA <a> elements inside that row (XPath only)
    const ctaBoxes = ctaRow.locator('//a');
    const ctaTitles = ctaRow.locator('//h2[@class="box-panel__title"]');

    const totalCtas = await ctaBoxes.count();
    console.log(`• Total CTA boxes detected: ${totalCtas}`);
    console.log(`---------------------------------------------------------------`);

    const expectedPatterns = [
      /enquire/i,
      /about/i,
      /signup/i
    ];

    for (let i = 0; i < totalCtas; i++) {
      console.log(`\n==================== CTA ${i + 1} / ${totalCtas} ====================`);

      const cta = ctaBoxes.nth(i);
      const titleLocator = ctaTitles.nth(i);

      await this.scrollIntoView(titleLocator);

      const rawTitle = await titleLocator.innerText();
      const normalizedTitle = this.normalizeText(rawTitle);

      console.log(`• CTA title: "${rawTitle}"`);
      console.log(`• Normalized: "${normalizedTitle}"`);

      const href = await cta.getAttribute("href");
      const url = this.resolveUrl(href);

      console.log(`• CTA URL: ${url || "(invalid)"}`);

      if (!url) {
        console.warn(`  ⚠ Skipping CTA — invalid URL`);
        continue;
      }

      const expectedPattern = expectedPatterns[i];

      try {
        await this.openAndValidateUrl(url, expectedPattern);
        console.log(`  ✓ CTA navigation OK`);
      } catch (err: any) {
        console.error(`  ❌ CTA navigation failed: ${err?.message || err}`);
      }

      await this.page.goto("https://www.igluski.com/", { waitUntil: "domcontentloaded" });
      await this.page.waitForLoadState("domcontentloaded");
    }

    console.log(`\n==================== CTA BOXES — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
  // COUNTRY BANNERS VALIDATION
  // ============================
  async validateCountryBanners(): Promise<void> {
    console.log(`\n==================== COUNTRY BANNERS — VALIDATION START ====================`);

    // Captura todos os banners de países
    const banners = await this.page.$$eval(
      '//div[contains(@class, "country-banner")]//a',
      (anchors) =>
        anchors.map((a) => ({
          label: a.textContent?.trim() || "",
          href: a.getAttribute("href") || null,
        }))
    );

    console.log(`• Total country banners detected: ${banners.length}`);
    console.log(`---------------------------------------------------------------`);

    for (const banner of banners) {
      const label = banner.label;
      const url = this.resolveUrl(banner.href ?? null);

      console.log(`\n• Country banner: "${label}"`);
      console.log(`  URL: ${url || "(invalid)"}\n`);

      if (!url) {
        console.warn(`  ⚠ Skipping — invalid URL`);
        continue;
      }

      // Localiza o banner real no DOM
      const locator = this.page.locator(
        `//div[contains(@class, "country-banner")]//a[contains(text(), "${label}")]`
      );

      // Scroll seguro até o banner
      await this.scrollIntoView(locator);

      // Valida redirecionamento abrindo em nova aba
      try {
        await this.openAndValidateUrl(url, new RegExp(url, "i"));
        console.log(`  ✓ Country banner navigation OK`);
      } catch (err: any) {
        console.error(`  ❌ Country banner navigation failed: ${err?.message || err}`);
      }
    }

    console.log(`\n==================== COUNTRY BANNERS — VALIDATION COMPLETE ==================\n`);
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
  async clickMenu(menuLabel: string, subLabel?: string): Promise<void> {
    console.log(`\n==================== CLICK MENU — START ====================`);
    console.log(`• Menu: ${menuLabel}`);
    if (subLabel) console.log(`• Submenu: ${subLabel}`);
    console.log(`---------------------------------------------------------------`);

    // Localiza o menu principal
    const menu = this.page.locator(
      `li.menu-list__item a:has-text("${menuLabel}")`
    ).first();

    await menu.waitFor({ state: "visible", timeout: 7000 });
    await menu.click();
    console.log(`✓ Clicked main menu: ${menuLabel}`);

    // Se NÃO houver submenu → valida título da página
    if (!subLabel) {
      await this.validateTitleContains(this.page, menuLabel);
      console.log(`✓ Page title validated for menu: ${menuLabel}`);
      console.log(`==================== CLICK MENU — COMPLETE ====================\n`);
      return;
    }

    // Localiza submenu
    const submenu = this.page.locator(
      `.submenu-list__block-item a:has-text("${subLabel}")`
    ).first();

    await submenu.waitFor({ state: "visible", timeout: 7000 });
    await submenu.click();
    console.log(`✓ Clicked submenu: ${subLabel}`);

    // Valida título da página
    await this.validateTitleContains(this.page, subLabel);
    console.log(`✓ Page title validated for submenu: ${subLabel}`);

    console.log(`==================== CLICK MENU — COMPLETE ====================\n`);
  }

  // ============================
  // MULTIPLE TITLES VALIDATION
  // ============================
  async validateMultipleTitles(expectedTitles: string[]): Promise<void> {
    console.log(`\n==================== MULTIPLE TITLES — VALIDATION START ====================`);

    for (const expected of expectedTitles) {
      const locator = this.page.locator(`text=${expected}`).first();

      console.log(`• Validating title: "${expected}"`);

      try {
        await expect(locator).toBeVisible({ timeout: 7000 });
        console.log(`  ✓ Title found: "${expected}"`);
      } catch {
        throw new Error(`❌ Title not found on page: "${expected}"`);
      }
    }

    console.log(`==================== MULTIPLE TITLES — VALIDATION COMPLETE ==================\n`);
  }

  // ============================
// CAROUSEL CTA VALIDATION
// ============================
async validateCarouselCTA(): Promise<void> {
  console.log(`\n==================== CAROUSEL CTA — VALIDATION START ====================`);

  const activeSlide = this.carouselActiveSlide; // 🔥 Fix

  await expect(activeSlide).toBeVisible({ timeout: 7000 });

  const cta = activeSlide.locator('a').first();
  await expect(cta).toBeVisible({ timeout: 7000 });

  const href = await cta.getAttribute('href');
  if (!href) throw new Error("❌ CTA button has no href attribute");

  console.log(`• CTA href: ${href}`);

  await cta.click({ force: true });

  await expect(this.page).toHaveURL(new RegExp(href, "i"));
  console.log(`✓ CTA navigation OK → ${this.page.url()}`);

  console.log(`==================== CAROUSEL CTA — VALIDATION COMPLETE ==================\n`);
}


async validateSpeakToExpertsLinks(): Promise<void> {
  console.log(`\n==================== INLINE LINKS — SECTION: SPEAK TO THE SKI EXPERTS ====================`);

  // 1. Locate <h2> using the professional locator
  const title = this.sectionTitle("Speak to the ski experts");
  await title.waitFor({ state: "visible" });
  console.log(`• Section title found: "Speak to the ski experts"`);

  // 2. Section container
  const section = this.sectionContainer(title);

  // 3. All <a> inside the section
  const links = this.sectionLinks(section);

  const totalLinks = await links.count();
  console.log(`• Total links detected: ${totalLinks}`);
  console.log(`---------------------------------------------------------------`);

  // 4. Loop through links
  for (let i = 0; i < totalLinks; i++) {
    console.log(`\n==================== LINK ${i + 1} / ${totalLinks} ====================`);

    const link = links.nth(i);
    const linkText = (await link.innerText()).trim();
    const href = await link.getAttribute("href");
    const url = this.resolveUrl(href);

    console.log(`• Link text: "${linkText}"`);
    console.log(`• URL: ${url}`);

    // 5. Open in new tab
    const context = this.page.context();
    const newPage = await context.newPage();

    await newPage.goto(url!, { waitUntil: "domcontentloaded" });

    // 6. Fuzzy title validation
    await this.validatePageTitleFuzzy(newPage, linkText);

    await newPage.close();
  }

  console.log(`\n==================== INLINE LINKS — VALIDATION COMPLETE ==================\n`);
}

async validateFindYourSkiingHolidayLinks(): Promise<void> {
  console.log(`\n==================== INLINE LINKS — SECTION: FIND YOUR SKIING HOLIDAY ====================`);

  const titleText = "Find Your Skiing Holiday";

  // 1. Real XPath for the title
  const titleXPath = `//h2[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${titleText.toLowerCase()}")]`;

  // 2. Title locator
  const title = this.page.locator(titleXPath);
  await title.waitFor({ state: "visible" });
  console.log(`• Section title found: "${titleText}"`);

  // 3. Section container
  const section = this.sectionContainer(title);

  // 4. Links before the first <div>
  const links = this.page.locator(
    `${titleXPath}/following-sibling::a[following-sibling::div]`
  );

  const totalLinks = await links.count();
  console.log(`• Total links detected: ${totalLinks}`);
  console.log(`---------------------------------------------------------------`);

  for (let i = 0; i < totalLinks; i++) {
    console.log(`\n==================== LINK ${i + 1} / ${totalLinks} ====================`);

    const link = links.nth(i);
    const linkText = (await link.innerText()).trim();
    const href = await link.getAttribute("href");
    const url = this.resolveUrl(href);

    console.log(`• Link text: "${linkText}"`);
    console.log(`• URL: ${url}`);

    // Open in new tab
    const context = this.page.context();
    const newPage = await context.newPage();

    await newPage.goto(url!, { waitUntil: "domcontentloaded" });

    // Fuzzy validation
    await this.validatePageTitleFuzzy(newPage, linkText);

    await newPage.close();
  }

  console.log(`\n==================== INLINE LINKS — VALIDATION COMPLETE ==================\n`);
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
async validateTC26(viewportWidth: number): Promise<void> {
  await this.page.setViewportSize({ width: viewportWidth, height: 900 });

  console.log(`\n===== TC26: Validating responsiveness at ${viewportWidth}px =====\n`);

  // 1) Hamburger menu must be visible
  const hamburgerVisible = await this.isHamburgerMenuVisible();
  if (!hamburgerVisible) {
    throw new Error(`TC26 FAILED: Hamburger menu NOT visible at ${viewportWidth}px`);
  }

  // 2) No horizontal overflow allowed
  const overflow = await this.hasHorizontalOverflow();
  if (overflow) {
    throw new Error(`TC26 FAILED: Horizontal overflow detected at ${viewportWidth}px`);
  }

  // 3) Images must be responsive
  const imagesResult = await this.validateImagesResponsive(viewportWidth);
  if (!imagesResult.valid) {
    throw new Error(
      `TC26 FAILED: Images not responsive at ${viewportWidth}px. Invalid images: ${imagesResult.invalidImages}`
    );
  }

  console.log(`✓ TC26 PASSED at ${viewportWidth}px`);
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
async validateTC28(): Promise<void> {
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
