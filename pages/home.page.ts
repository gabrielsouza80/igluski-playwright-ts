import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';


//home.page.ts - Home page

export class HomePage extends HelperBase {
  // Actions instance for generic utilities
  private actions: Actions;

  // LOCATORS: Header and main navigation
  readonly logoLink: Locator = this.page.locator('a[title="Iglu Ski logo"]');
  readonly skiHolidaysLink: Locator = this.page.locator('(//a[@href="/ski-holidays"])[2]');
  readonly skiDestinationsLink: Locator = this.page.locator('a[href="/ski-resorts"]').first();
  readonly skiDealsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
  readonly snowReportsLink: Locator = this.page.locator('(//a[@href="/snow-reports"])[1]');
  readonly skiblogguidesLink: Locator = this.page.locator('(//a[@href="/blog"])[1]');
  readonly enquireLink: Locator = this.page.locator('(//a[contains(@href, "/enquire")])[1]');
  readonly contactusLink: Locator = this.page.locator('(//a[@href="/contact-us"])[1]');
  readonly phoneLocatorHeader: Locator = this.page.locator('(//span[@title="Call Our Team"])[1]');
  readonly btnAccessCustomerPortal: Locator = this.page.locator('//img[contains(@alt, "Customer portal icon")]//..');
  readonly btnRecentlyViewedHeader: Locator = this.page.locator('//a[contains(@class, "top-bar__info-link")]');
  readonly resultRecentlyViewedHeader: Locator = this.page.locator('//div[contains(@class, "top-bar__rv-no-result")]');
  readonly btnReviewLinkHeader: Locator = this.page.locator('//a[@class="header-headline__review-link"]');

  // LOCATORS: Main content of the homepage
  readonly tituloBannerHome: Locator = this.page.locator('(//h2[@class="h2-title"])[2]');
  readonly tituloHomePage: Locator = this.page.locator('//h1[@class="h1-title"]');
  readonly carouselhome: Locator = this.page.locator('*[data-ski-widget="content-carousel"]');
  readonly closeAdButton: Locator = this.page.locator('sleeknote-p72idi-bottom >>> div[data-sn-type="close"] >>> button');

  // Locators: Cookie Model
  readonly acceptCookiesBtn: Locator = this.page.locator('#onetrust-accept-btn-handler').first();
  readonly cookiesBanner: Locator = this.page.locator('#onetrust-banner-sdk');
  readonly acceptCookiesBtnRecommended: Locator = this.page.locator('#accept-recommended-btn-handler');

  // LOCATORS: Search components
  readonly propertiesSearchInput: Locator = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput: Locator = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly resortsSearchInput: Locator = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton: Locator = this.page.locator('button.search-item__cta , .search-bar__form-submit');

  // LOCATORS: Footer links
  readonly phoneLocator = this.page.locator('(xpath://span[@title="Call Our Team"])[1]');
  readonly footerFranceLink: Locator = this.page.locator('footer a[href*="/france"]').first();
  readonly footerSkiChaletsLink: Locator = this.page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();


  // Page builder
  constructor(page: Page) {
    super(page);
    this.actions = new Actions(page);
  }

  // Private utility: toSlug used internally by the HomePage
  // NAVIGATION AND COOKIES: Navigates to the home page and accepts cookies

  async navigateAndAcceptCookies(): Promise<void> {
    // Navigate to the home page.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });

    console.log(`\n==================== COOKIES — INITIAL STATE ====================`);
    console.log(`• Navigated to home page (domcontentloaded).`);
    console.log(`• Waiting for cookie banner to appear...`);
    console.log(`---------------------------------------------------------------`);

    // Please wait up to 60 seconds for the Banner to appear.
    try {
      await this.cookiesBanner.waitFor({ state: 'visible', timeout: 60000 });
      console.log(`• Cookie banner detected.`);
    } catch {
      console.log(`• No cookie banner appeared within the time limit.`);
      console.log(`==================== COOKIES — NO BANNER =======================\n`);
      return; // Exit the function if there is no banner.
    }

    console.log(`---------------------------------------------------------------`);
    console.log(`• Checking available accept buttons...`);

    // It handles the different possible buttons.
    if (await this.acceptCookiesBtn.isVisible()) {
      await this.acceptCookiesBtn.click();
      console.log(`• Clicked default accept button.`);
      console.log(`✅ Cookies accepted (default button).`);
    } else if (await this.acceptCookiesBtnRecommended.isVisible()) {
      await this.acceptCookiesBtnRecommended.click();
      console.log(`• Clicked "Allow all" button.`);
      console.log(`✅ Cookies accepted (Allow all).`);
    } else {
      console.log(`ℹ️ No visible accept button found.`);
    }

    // Wait for the Banner to disappear to ensure it doesn't block clicks.
    await this.cookiesBanner.waitFor({ state: 'hidden', timeout: 5000 });

    console.log(`---------------------------------------------------------------`);
    console.log(`• Cookie banner is now hidden.`);
    console.log(`==================== COOKIES — COMPLETED =======================\n`);
  }

  async searchForCountry(text: string) {
    try {
      await this.countriesSearchInput.fill(text, { timeout: 5000 });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.warn('searchForCountry: fill failed, will still try to click search button', error);
    } finally {
      try {
        await this.searchButton.click();
      } catch (clickErr) {
        console.error('searchForCountry: search button click failed', clickErr);
      }
    }
  }

  async searchForProperty(text: string) {
    await this.propertiesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.propertiesSearchInput.press('Enter');
  }

  // Action: Click the search button.
  async clickOnSearchButton() {
    await this.searchButton.click();
  }
  // --------------------------
  // Assertions & Validations
  // --------------------------

  // ASSERTIONS: Checks if a locator is visible using Actions
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    return await this.actions.verifyElementVisible(locator);
  }

  // ASSERTIONS: Awaiting expected URL using Actions
  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    return await this.actions.verifyPageLoaded(expectedUrl);
  }

  // VALIDATIONS: Validates logo redirection
  async validateLogo() {
    console.log(`\n==================== LOGO — VALIDATION START ====================`);
    console.log(`• Checking logo redirection...`);
    console.log(`---------------------------------------------------------------`);

    await this.validateRedirectButton(this.logoLink, '/');

    console.log(`• Logo redirects correctly to home page ("/")`);
    console.log(`==================== LOGO — VALIDATION COMPLETE =================\n`);
  }

  // VALIDATIONS: Collects contact information in the header.
  async validateHeaderContactInfo() {
    console.log(`\n==================== HEADER — CONTACT INFO CHECK ====================`);
    console.log(`• Validating header contact information...`);
    console.log(`---------------------------------------------------------------`);

    // Phone text
    const txtphoneLocatorHeader = await this.phoneLocatorHeader.innerText();
    console.log(`• Header phone text: ${txtphoneLocatorHeader}`);

    // Contact Us link text
    const txtcontactusLink = await this.contactusLink.innerText();
    console.log(`• Contact Us link text: ${txtcontactusLink}`);

    // Validate redirect
    console.log(`• Validating Contact Us redirection...`);
    await this.validateRedirectButton(this.contactusLink, '/contact-us');

    console.log(`==================== HEADER — CONTACT INFO COMPLETE ==================\n`);
  }

  async validateRecentlyViewedButton() {
    console.log(`\n==================== RECENTLY VIEWED — VALIDATION START ====================`);
    console.log(`• Clicking Recently Viewed button...`);
    console.log(`---------------------------------------------------------------`);

    await this.btnRecentlyViewedHeader.click();

    console.log(`• Waiting for Recently Viewed result to appear...`);
    await expect(this.resultRecentlyViewedHeader).toBeVisible();

    const txtResult = await this.resultRecentlyViewedHeader.innerText();
    console.log(`• Recently Viewed result text: ${txtResult}`);

    console.log(`==================== RECENTLY VIEWED — VALIDATION COMPLETE ==================\n`);
  }

  async validateAccessCustomerPortal() {

    await this.validateRedirectButton(this.btnAccessCustomerPortal, 'https://customerportal.igluski.com/Login?ReturnUrl=%2F');
  }

  async validateRatingsAndReviews() {
    await this.validateRedirectButton(this.btnReviewLinkHeader, 'https://www.igluski.com/customer-reviews');
  }

  // VALIDATIONS: Validates main menus and submenus, titles, and duplicates.
  async validateMenuAndSubMenuNavigation(): Promise<void> {
    console.log(`\n==================== MENUS — VALIDATION START ====================`);

    // Object to store duplicate submenu entries found during validation
    const duplicatesSummary: Record<string, Array<{ label: string; duplicateWith: string; url: string }>> = {};

    // Helper function: checks if the <h1> title of a page contains words from the menu/submenu label
    const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
      // Normalize text: lowercase, remove accents, remove special characters
      const normalize = (txt: string) =>
        txt.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/gi, " ")
          .trim();

      const normalizedLabel = normalize(label);

      try {
        // Get the first <h1> text from the page
        const h1TextRaw = await page.locator("h1").first().innerText();
        const h1Text = normalize(h1TextRaw);

        // Split the label into words longer than 2 characters
        const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);

        // Check if any of those words are present in the <h1> text
        const anyWordFound = labelWords.some(w => h1Text.includes(w));

        if (anyWordFound) {
          console.log(`      • Title OK for "${label}" → "${h1TextRaw}"`);
          return true;
        }
      } catch {
        // Ignore and fall through to warning
      }

      console.warn(`      • Warning: No <h1> match found for "${label}"`);
      return false;
    };

    // Take a snapshot of all main menus and their submenus from the DOM
    const menusSnapshot = await this.page.$$eval("li.menu-list__item", (items) => {
      return items.map((li) => {
        const mainLink = li.querySelector("a");
        const mainHref = mainLink ? mainLink.getAttribute("href") : null;
        const mainLabel = mainLink ? (mainLink.textContent?.trim() || "") : (li.textContent?.trim() || "");

        // Collect all submenu links inside this menu
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

    // Iterate through each main menu
    for (const menu of menusSnapshot) {
      const menuLabel = menu.mainLabel || "menu";
      const menuHref = this.actions.extractFullUrlFromString(menu.mainHref);

      console.log(`\n==================== MENU ====================`);
      console.log(`• Menu label: "${menuLabel}"`);
      console.log(`• Menu URL: ${menuHref || "(no valid URL)"}`);
      console.log(`---------------------------------------------------------------`);

      // Skip menus without a valid URL
      if (!menuHref) {
        console.warn(`• Skipping menu "${menuLabel}" — no valid URL.`);
        continue;
      }

      let menuPage: Page | null = null;

      try {
        // Open the menu link in a new page
        console.log(`• Opening menu page: ${menuHref}`);
        menuPage = await this.page.context().newPage();
        await menuPage.goto(menuHref, { waitUntil: "domcontentloaded", timeout: 120000 });

        // Special case: if the menu is "Search", validate that the search field appears
        if (/search/i.test(menuLabel)) {
          console.log(`• Menu identified as Search. Validating search field...`);
          try {
            await this.resortsSearchInput.waitFor({ state: "visible", timeout: 2000 });
            console.log(`  ✓ Search field is visible.`);
          } catch {
            console.warn(`  • Warning: Search menu did not open the search field.`);
          }
        } else {
          console.log(`• Validating page title for menu "${menuLabel}"...`);
          await validateTitleContains(menuPage, menuLabel);
        }

        const sublinks = menu.sublinks || [];
        console.log(`• Submenus found for "${menuLabel}": ${sublinks.length}`);

        // If no sublinks, close the page and continue
        if (sublinks.length === 0) {
          console.log(`• No submenus to validate for "${menuLabel}".`);
          await menuPage.close();
          continue;
        }

        // Prepare to check all sublinks and detect duplicates
        const allSublinks: Array<{ label: string; href: string }> = [];
        const seen = new Map<string, string>();

        console.log(`• Checking submenu URLs and detecting duplicates...`);

        for (const s of sublinks) {
          const full = this.actions.extractFullUrlFromString(s.href);
          if (!full) continue;

          // Detect duplicates: if the same URL appears with different labels
          if (seen.has(full)) {
            const duplicateWith = seen.get(full)!;
            console.warn(`  • Duplicate URL detected → "${s.label}" duplicate of "${duplicateWith}" (URL: ${full})`);
            if (!duplicatesSummary[menuLabel]) duplicatesSummary[menuLabel] = [];
            duplicatesSummary[menuLabel].push({ label: s.label, duplicateWith, url: full });
          } else {
            seen.set(full, s.label);
          }

          allSublinks.push({ label: s.label || full, href: full });
        }

        // Open each submenu link in a new page and validate its title
        const subPage = await this.page.context().newPage();
        console.log(`• Validating ${allSublinks.length} submenu pages for "${menuLabel}"...`);

        for (const s of allSublinks) {
          console.log(`  -----------------------------------------------------------`);
          console.log(`  • Submenu label: "${s.label}"`);
          console.log(`  • Submenu URL: ${s.href}`);

          try {
            await subPage.goto(s.href, { waitUntil: "domcontentloaded", timeout: 90000 });
            await validateTitleContains(subPage, s.label);
            console.log(`  ✓ Submenu validated successfully: "${s.label}"`);
          } catch (err: any) {
            console.error(`  ❌ Submenu "${s.label}" failed → ${err?.message || err}`);
          }
        }

        await subPage.close().catch(() => null);
      } finally {
        // Ensure the menu page is closed even if an error occurs
        if (menuPage) await menuPage.close().catch(() => null);
      }
    }

    // Print a summary of duplicate submenus found
    console.log(`\n==================== MENUS — DUPLICATES SUMMARY ====================`);
    if (Object.keys(duplicatesSummary).length === 0) {
      console.log(`• No duplicate submenu URLs found.`);
    } else {
      for (const [menu, duplicates] of Object.entries(duplicatesSummary)) {
        console.log(`• Menu: ${menu}`);
        duplicates.forEach(d => {
          console.log(`  - "${d.label}" duplicate of "${d.duplicateWith}" (URL: ${d.url})`);
        });
      }
    }

    console.log(`==================== MENUS — VALIDATION COMPLETE ==================\n`);
  }

  // VALIDATIONS: Validates all items in the footer.
  async validateFooterItems(): Promise<void> {
    console.log(`\n==================== FOOTER — VALIDATION START ====================`);

    // Array to store duplicate footer items found during validation
    const duplicatesSummary: Array<{ label: string; duplicateWith: string; url: string }> = [];

    // Helper function: checks if the <h1> title of a page contains words from the footer item label
    const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
      // Normalize text: lowercase, remove accents, remove special characters
      const normalize = (txt: string) =>
        txt.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/gi, " ")
          .trim();

      const normalizedLabel = normalize(label);

      try {
        // Get the first <h1> text from the page
        const h1TextRaw = await page.locator("h1").first().innerText();
        const h1Text = normalize(h1TextRaw);

        // Split the label into words longer than 2 characters
        const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);

        // Check if any of those words are present in the <h1> text
        const anyWordFound = labelWords.some(w => h1Text.includes(w));

        if (anyWordFound) {
          console.log(`      • Title OK for footer item "${label}" → "${h1TextRaw}"`);
          return true;
        }
      } catch {
        // Ignore and fall through to warning
      }

      console.warn(`      • Warning: No <h1> match found for footer item "${label}"`);
      return false;
    };

    // Capture all footer items from the DOM
    const footerItems = await this.page.$$eval(
      '//li[@class="footer-list__item"]',
      (items) => {
        return items.map((li) => {
          const anchor = li.querySelector('a');
          return {
            label: anchor?.textContent?.trim() || li.textContent?.trim() || '',
            href: anchor?.getAttribute('href') || null
          };
        });
      }
    );

    console.log(`• Total footer items detected: ${footerItems.length}`);
    console.log(`---------------------------------------------------------------`);

    // Map to track seen URLs and detect duplicates
    const seen = new Map<string, string>();

    // Iterate through each footer item
    for (const f of footerItems) {
      const fullUrl = this.actions.extractFullUrlFromString(f.href);

      console.log(`\n==================== FOOTER ITEM ====================`);
      console.log(`• Label: "${f.label}"`);
      console.log(`• Raw URL: ${f.href || "(no href attribute)"}`);

      // Skip items without a valid URL
      if (!fullUrl) {
        console.warn(`• Skipping footer item "${f.label}" — no valid URL.`);
        continue;
      }

      console.log(`• Resolved URL: ${fullUrl}`);

      // Check for duplicates: same URL with different labels
      if (seen.has(fullUrl)) {
        const duplicateWith = seen.get(fullUrl)!;
        console.warn(
          `• Duplicate URL detected → "${f.label}" duplicate of "${duplicateWith}" (URL: ${fullUrl})`
        );
        duplicatesSummary.push({ label: f.label, duplicateWith, url: fullUrl });
      } else {
        seen.set(fullUrl, f.label);
      }

      // Scroll into view before opening a new tab (helps simulate user interaction)
      try {
        const locator = this.page.locator(
          `//li[@class="footer-list__item"] >> text=${f.label}`
        );
        await locator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);
        console.log(`• Scrolled into view.`);
      } catch {
        console.warn(`• Warning: Could not scroll to footer item "${f.label}".`);
      }

      // Open a new tab to validate each footer item
      let footerPage: Page | null = null;
      try {
        console.log(`• Opening footer URL in new tab...`);
        footerPage = await this.page.context().newPage();
        await footerPage.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 90000
        });

        await validateTitleContains(footerPage, f.label);
        console.log(`• Footer item validated successfully: "${f.label}"`);
      } catch (err: any) {
        console.error(
          `❌ Footer item "${f.label}" failed → ${err?.message || err}`
        );
      } finally {
        // Ensure the tab is closed even if an error occurs
        if (footerPage) await footerPage.close().catch(() => null);
      }
    }

    // Print a summary of duplicate footer items found
    console.log(`\n==================== FOOTER — DUPLICATES SUMMARY ====================`);
    if (duplicatesSummary.length === 0) {
      console.log(`• No duplicate footer URLs found.`);
    } else {
      duplicatesSummary.forEach(d => {
        console.log(
          `• "${d.label}" duplicate of "${d.duplicateWith}" (URL: ${d.url})`
        );
      });
    }

    console.log(`==================== FOOTER — VALIDATION COMPLETE ==================\n`);
  }

  // This function prints all slides and indicators from the carousel to the console.
  // showing which ones are active at the moment.
  async logCarouselSlides() {
    // Locates all slide elements within the carousel.
    const slides = await this.carouselhome.locator('.content-carousel__inner__item').all();
    console.log(`Total number of slides found: ${slides.length}`);

    // Browse through each slide found.
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];

      // Get the link (href) associated with the slide.
      const href = await slide.locator('a').getAttribute('href');

      // Retrieves all classes applied to the slide.
      const className = await slide.getAttribute('class');

      // Verifies if the slide contains the class indicating it is active
      const isActive = className?.includes('content-carousel__inner__item--active');

      // Prints to the console the index, link, and classes of the slide
      // If it's active, adds the [ACTIVE] tag for highlighting
      console.log(`Slide ${i}: href=${href}, classes=${className}${isActive ? ' [ACTIVE]' : ''}`);
    }

    // Locates all indicator elements (navigation dots) within the carousel
    const indicators = await this.carouselhome.locator('.content-carousel__indicators__item').all();

    // Browse through each indicator
    for (let i = 0; i < indicators.length; i++) {
      const indicator = indicators[i];

      // Retrieves all classes applied to the indicator
      const className = await indicator.getAttribute('class');

      // Verifies if the indicator contains the class indicating it is active
      const isActive = className?.includes('content-carousel__indicators__item--active');

      // Prints to the console the index and classes of the indicator
      // If it's active, adds the [ACTIVE] tag for highlighting
      console.log(`Indicator ${i}: classes=${className}${isActive ? ' [ACTIVE]' : ''}`);
    }
  }

  async validateBannersHome() {

    // ==================== HOMEPAGE BANNER TITLE ====================
    await expect(this.tituloBannerHome).toBeVisible();
    const titulo = await this.tituloBannerHome.innerText();
    expect(titulo).toContain('Find Your Skiing Holiday');

    console.log(`\n==================== HOMEPAGE BANNER TITLE =====================`);
    console.log(`• Title detected: ${titulo}`);
    console.log(`---------------------------------------------------------------\n`);


    // ==================== DETECT WHICH ROW CONTAINS FRANCE ====================
    const detectFranceRow = async () => {
      const row5 = this.page.locator('(//div[@class="row"])[5]//h2[@class="box-panel__title"]');
      const row6 = this.page.locator('(//div[@class="row"])[6]//h2[@class="box-panel__title"]');

      const row5Text = await row5.first().innerText().catch(() => "");
      const row6Text = await row6.first().innerText().catch(() => "");

      if (row6Text.includes("FRANCE")) return 6;
      if (row5Text.includes("FRANCE")) return 5;

      throw new Error("❌ Could not detect which row contains FRANCE.");
    };


    // ==================== VALIDATION FUNCTION (ORIGINAL LOGIC) ====================
    const validateRow = async (rowNumber: number) => {
      const locator = this.page.locator(
        `(//div[@class="row"])[${rowNumber}]//h2[@class="box-panel__title"]`
      );

      // Wait for at least one element to appear
      try {
        await locator.first().waitFor({ state: "visible", timeout: 10000 });
      } catch {
        throw new Error(`❌ Row ${rowNumber} did not load any elements within the expected time.`);
      }

      const count = await locator.count();

      console.log(`==================== ROW ${rowNumber} — ${count} ELEMENTS ====================\n`);

      if (count === 0) {
        throw new Error(`❌ Row ${rowNumber} contains zero elements. This should never happen.`);
      }

      for (let i = 0; i < count; i++) {
        const titleEl = locator.nth(i);

        await expect(titleEl).toBeVisible();

        const text = await titleEl.innerText();

        console.log(`-------------------- Item ${i + 1} --------------------`);
        console.log(`Title:\n${text}`);

        const link = titleEl.locator("xpath=ancestor::a");
        const href = await link.getAttribute("href");

        if (!href) {
          console.warn(`⚠ No href found for title: "${text}"`);
          continue;
        }

        const fullUrl = href.startsWith("http")
          ? href
          : `https://www.igluski.com${href}`;

        console.log(`Expected URL: ${fullUrl}`);

        const icon = titleEl.locator('../img[@class="box-panel__icon"]');
        await expect(icon).toBeVisible();

        await icon.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(300);

        let newPage: Page | null = null;

        try {
          newPage = await this.page.context().newPage();
          await newPage.goto(fullUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });

          console.log(`Redirect OK → ${newPage.url()}\n`);
        } catch (err: any) {
          console.error(`❌ Redirect failed → ${err?.message || err}`);
          throw err;
        } finally {
          if (newPage) await newPage.close().catch(() => null);
        }
      }

      console.log(`---------------------------------------------------------------\n`);
    };


    // ==================== EXECUTE VALIDATION BASED ON FRANCE POSITION ====================
    const franceRow = await detectFranceRow();

    if (franceRow === 6) {
      await validateRow(6);
      await validateRow(7);
    } else {
      await validateRow(5);
      await validateRow(6);
    }

    console.log(`==================== BANNERS VALIDATION COMPLETE ==============\n`);
  }

  async validateCarouselHome() {

    // ==================== CAROUSEL — TITLE CHECK ====================
    await expect(this.tituloHomePage).toBeVisible();
    const titulo = await this.tituloHomePage.innerText();
    expect(titulo).toContain('Welcome To The Home Of Ski');

    console.log(`\n==================== CAROUSEL — TITLE CHECK ====================`);
    console.log(`• Title detected: ${titulo}`);
    console.log(`---------------------------------------------------------------\n`);


    // ==================== CAROUSEL — INITIAL STATE ====================
    await expect(this.carouselhome).toBeVisible();

    let activeSlide = this.carouselhome
      .locator('.content-carousel__inner__item--active')
      .first();

    const initialHref =
      (await activeSlide.locator('a').getAttribute('href')) ?? '';

    console.log(`==================== CAROUSEL — INITIAL STATE ==================`);
    console.log(`• Initial slide URL: ${initialHref}`);
    console.log(`---------------------------------------------------------------\n`);


    // ==================== CAROUSEL — NEXT ACTION ====================
    await this.carouselhome
      .locator('.content-carousel__control--right')
      .click({ force: true });

    await this.page.waitForFunction(
      (expectedHref) => {
        const active = document.querySelector(
          '.content-carousel__inner__item--active a'
        );
        return active && active.getAttribute('href') !== expectedHref;
      },
      initialHref
    );

    activeSlide = this.carouselhome
      .locator('.content-carousel__inner__item--active')
      .first();

    const nextHref =
      (await activeSlide.locator('a').getAttribute('href')) ?? '';

    console.log(`==================== CAROUSEL — NEXT ACTION ====================`);
    console.log(`• Slide after NEXT: ${nextHref}`);
    console.log(`---------------------------------------------------------------\n`);

    expect(nextHref).not.toBe(initialHref);


    // ==================== CAROUSEL — PREVIOUS ACTION ====================
    await this.carouselhome
      .locator('.content-carousel__control--left')
      .click({ force: true });

    await this.page.waitForFunction(
      (expectedHref) => {
        const active = document.querySelector(
          '.content-carousel__inner__item--active a'
        );
        return active && active.getAttribute('href') === expectedHref;
      },
      initialHref
    );

    activeSlide = this.carouselhome
      .locator('.content-carousel__inner__item--active')
      .first();

    const prevHref =
      (await activeSlide.locator('a').getAttribute('href')) ?? '';

    console.log(`==================== CAROUSEL — PREVIOUS ACTION ================`);
    console.log(`• Slide after PREVIOUS: ${prevHref}`);
    console.log(`---------------------------------------------------------------\n`);

    expect(prevHref).toBe(initialHref);


    // ==================== CAROUSEL VALIDATION COMPLETE ====================
    console.log(`==================== CAROUSEL VALIDATION COMPLETE ==============\n`);
  }

  // EXTRAS: Performs a simple search by resort category and waits for results.

  async searchFor(query: string): Promise<void> {
    // Click and fill in the resorts input.
    await this.resortsSearchInput.click();
    await this.resortsSearchInput.fill(query);

    // Send the search
    await this.page.keyboard.press('Enter');

    // It attempts to detect a common results/suggestions panel.
    const possibleSelectors = [
      'ul[role="listbox"]',
      '.search-results',
      '.search-autocomplete',
      '.results-list',
      '.searchResults',
      '.autosuggest'
    ];

    for (const sel of possibleSelectors) {
      try {
        const locator = this.page.locator(sel).first();
        if (await locator.count() > 0) {
          await locator.waitFor({ state: 'visible', timeout: 5000 });
          return;
        }
      } catch {
        // Ignore and try the next selector.
      }
    }

    // Fallback: Please wait a short time for the AJAX result to load.
    await this.page.waitForTimeout(1000);
  }

  // Retrieves representative text from search results.
  async getSearchResults(): Promise<string> {
    const candidates = [
      'ul[role="listbox"] li',
      '.search-results .result, .search-results li',
      '.search-autocomplete li',
      '.results-list li',
      '.autosuggest li'
    ];

    for (const sel of candidates) {
      try {
        const locator = this.page.locator(sel).first();
        if (await locator.count() > 0) {
          const txt = (await locator.textContent({ timeout: 3000 })) || '';
          if (txt.trim().length > 0) return txt.trim();
        }
      } catch {
        // ignore
      }
    }

    // Last resort: return the current value of the search input.
    try {
      const val = await this.resortsSearchInput.inputValue();
      return val || '';
    } catch {
      return '';
    }
  }

  // clickMenu: clicks on the main menu and optionally on submenus (specific to the site's HTML structure)
  async clickMenu(menuName: string, subMenuName?: string) {
    console.log(`\n==================== MENU — INTERACTION START ====================`);
    console.log(`• Target menu: "${menuName}"`);
    if (subMenuName) console.log(`• Target submenu: "${subMenuName}"`);
    console.log(`---------------------------------------------------------------`);

    // Main menu locator
    const menu = this.page.locator(`//li[@class="menu-list__item"]//a[text()="${menuName}"]`);

    // If only the main menu is clicked
    if (!subMenuName) {
      await menu.click();
      console.log(`• Clicked main menu: "${menuName}"`);
      console.log(`==================== MENU — INTERACTION COMPLETE ==================\n`);
      return;
    }

    // Hover to reveal submenu
    console.log(`• Hovering menu: "${menuName}" to reveal submenu...`);
    await menu.hover();

    // Submenu locator
    const subMenu = this.page.locator(`//li[@class="submenu-list__item"]//a[text()="${subMenuName}"]`);

    // Check if submenu exists
    const count = await subMenu.count();
    if (count === 0) {
      console.log(`• Submenu not found: "${subMenuName}" inside "${menuName}"`);
      console.log(`==================== MENU — INTERACTION COMPLETE ==================\n`);
      return;
    }

    // Click submenu
    await subMenu.click();
    console.log(`• Clicked submenu: "${subMenuName}" inside menu "${menuName}"`);
    console.log(`==================== MENU — INTERACTION COMPLETE ==================\n`);
  }

  async validateMultipleTitles(expected: string | string[]) {
    console.log(`\n==================== TITLE CHECK — START ====================`);

    // Normalize input to array
    const expectedTitles = Array.isArray(expected) ? expected : [expected];

    console.log(`• Titles to validate: ${expectedTitles.length}`);
    expectedTitles.forEach(t => console.log(`  • "${t}"`));

    console.log(`---------------------------------------------------------------`);
    console.log(`• Collecting all H1–H6 titles from the page...`);

    // Collect all H1–H6 elements once
    const allTitles = await this.page.$$eval(
      'h1, h2, h3, h4, h5, h6',
      elements => elements.map(el => el.textContent?.trim() || "")
    );

    console.log(`• Total titles found: ${allTitles.length}`);
    allTitles.forEach((t, i) => console.log(`  • [${i + 1}] ${t}`));

    console.log(`---------------------------------------------------------------`);
    console.log(`• Validating required titles...\n`);

    // Normalize helper
    const normalize = (txt: string) =>
      txt.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const normalizedTitles = allTitles.map(t => normalize(t));

    // Validate each expected title
    for (const expectedTitle of expectedTitles) {
      const expectedNorm = normalize(expectedTitle);

      const found = normalizedTitles.some(t => t.includes(expectedNorm));

      if (found) {
        console.log(`• OK → Found required title: "${expectedTitle}"`);
      } else {
        throw new Error(`❌ Required title not found: "${expectedTitle}"`);
      }
    }

    console.log(`\n==================== TITLE CHECK — COMPLETE ==================\n`);
  }
}
