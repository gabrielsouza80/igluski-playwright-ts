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
  readonly btnRecentlyViewedHeader: Locator = this.page.locator('//a[contains(@class, "top-bar__info-link")]');
  readonly resultRecentlyViewedHeader: Locator = this.page.locator('//div[contains(@class, "top-bar__rv-no-result")]');

  // LOCATORS: Main content of the homepage
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

    // Please wait up to 3 seconds for the Banner to appear.
    try {
      await this.cookiesBanner.waitFor({ state: 'visible', timeout: 60000 });
      console.log("Cookie Banner detected");
    } catch {
      console.log("No cookie Banner appeared within the time limit.");
      return; // Exit the function if there is no Banner.
    }

    // It handles the different possible buttons.
    if (await this.acceptCookiesBtn.isVisible()) {
      await this.acceptCookiesBtn.click();
      console.log("✅ Cookies accepted (default button)");
    } else if (await this.acceptCookiesBtnRecommended.isVisible()) {
      await this.acceptCookiesBtnRecommended.click();
      console.log("✅ Cookies accepted (Allow all)");
    } else {
      console.log("ℹ️ No visible accept button");
    }

    // Wait for the Banner to disappear to ensure it doesn't block clicks.
    await this.cookiesBanner.waitFor({ state: 'hidden', timeout: 5000 });
    console.log("✅ Cookie Banner removed");
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
    await this.validateRedirectButton(this.logoLink, '/');
  }

  // VALIDATIONS: Collects contact information in the header.
  async validateHeaderContactInfo() {
    const txtphoneLocatorHeader = await this.phoneLocatorHeader.innerText();
    console.log(`Header Phone Info: ${txtphoneLocatorHeader}`);
    const txtcontactusLink = await this.contactusLink.innerText();
    console.log(`Header Contact Us Link Text: ${txtcontactusLink}`);
    await this.validateRedirectButton(this.contactusLink, '/contact-us');
  }

  async validateRecentlyViewedButton() {
    await this.btnRecentlyViewedHeader.click();
    await expect(this.resultRecentlyViewedHeader).toBeVisible();
    const txtResult = await this.resultRecentlyViewedHeader.innerText();
    console.log(`Recently Viewed Result Text: ${txtResult}`);
  }

  // VALIDATIONS: Validates main menus and submenus, titles, and duplicates.
  async validateMenuAndSubMenuNavigation(): Promise<void> {
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
          console.log(`✓ Valid title for "${label}" → "${h1TextRaw}"`);
          return true;
        }
      } catch { }

      console.warn(`⚠ No match found in <h1> for: "${label}"`);
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

    console.log(`🌐 Validating ${menusSnapshot.length} main menus`);

    // Iterate through each main menu
    for (const menu of menusSnapshot) {
      const menuLabel = menu.mainLabel || "menu";
      const menuHref = this.actions.extractFullUrlFromString(menu.mainHref);

      console.log(`\n🌐 Validating menu: "${menuLabel}"`);

      // Skip menus without a valid URL
      if (!menuHref) {
        console.warn(`⚠ Menu "${menuLabel}" has no valid URL. Skipping.`);
        continue;
      }

      let menuPage: Page | null = null;

      try {
        // Open the menu link in a new page
        menuPage = await this.page.context().newPage();
        await menuPage.goto(menuHref, { waitUntil: "domcontentloaded", timeout: 120000 });

        // Special case: if the menu is "Search", validate that the search field appears
        if (/search/i.test(menuLabel)) {
          try {
            await this.resortsSearchInput.waitFor({ state: "visible", timeout: 2000 });
            console.log(`✓ Search menu validated: search field visible`);
          } catch {
            console.warn(`⚠ Search menu did not open the search field`);
          }
        } else {
          // Otherwise, validate that the page title matches the menu label
          await validateTitleContains(menuPage, menuLabel);
        }

        const sublinks = menu.sublinks || [];
        console.log(`📁 Menu "${menuLabel}" → Found ${sublinks.length} sublinks`);

        // If no sublinks, close the page and continue
        if (sublinks.length === 0) {
          await menuPage.close();
          continue;
        }

        // Prepare to check all sublinks and detect duplicates
        const allSublinks: Array<{ label: string; href: string }> = [];
        const seen = new Map<string, string>();

        for (const s of sublinks) {
          const full = this.actions.extractFullUrlFromString(s.href);
          if (!full) continue;

          // Detect duplicates: if the same URL appears with different labels
          if (seen.has(full)) {
            const duplicateWith = seen.get(full)!;
            console.warn(`⚠ Duplicate found → "${s.label}" duplicate with "${duplicateWith}" (URL: ${full})`);
            if (!duplicatesSummary[menuLabel]) duplicatesSummary[menuLabel] = [];
            duplicatesSummary[menuLabel].push({ label: s.label, duplicateWith, url: full });
          } else {
            seen.set(full, s.label);
          }

          allSublinks.push({ label: s.label || full, href: full });
        }

        // Open each submenu link in a new page and validate its title
        const subPage = await this.page.context().newPage();
        for (const s of allSublinks) {
          try {
            await subPage.goto(s.href, { waitUntil: "domcontentloaded", timeout: 90000 });
            await validateTitleContains(subPage, s.label);
            console.log(`      ✓ Submenu validated: ${s.label}`);
          } catch (err: any) {
            console.error(`❌ Submenu "${s.label}" failed → ${err?.message || err}`);
          }
        }
        await subPage.close().catch(() => null);
      } finally {
        // Ensure the menu page is closed even if an error occurs
        if (menuPage) await menuPage.close().catch(() => null);
      }
    }

    // Print a summary of duplicate submenus found
    console.log(`\n📊 DUPLICATES SUMMARY:`);
    if (Object.keys(duplicatesSummary).length === 0) {
      console.log(`✅ No duplicates found.`);
    } else {
      for (const [menu, duplicates] of Object.entries(duplicatesSummary)) {
        console.log(`\nMenu: ${menu}`);
        duplicates.forEach(d => {
          console.log(`  - "${d.label}" duplicate with "${d.duplicateWith}" (URL: ${d.url})`);
        });
      }
    }
  }

  // VALIDATIONS: Validates all items in the footer.
async validateFooterItems(): Promise<void> {
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
        console.log(`✓ Valid title for footer item "${label}" → "${h1TextRaw}"`);
        return true;
      }
    } catch { }

    console.warn(`⚠ No match found in <h1> for footer item: "${label}"`);
    return false;
  };

  // ✅ Capture all footer items from the DOM
  const footerItems = await this.page.$$eval('//li[@class="footer-list__item"]', (items) => {
    return items.map((li) => {
      const anchor = li.querySelector('a');
      return {
        label: anchor?.textContent?.trim() || li.textContent?.trim() || '',
        href: anchor?.getAttribute('href') || null
      };
    });
  });

  console.log(`🌐 Validating ${footerItems.length} footer items`);

  // Map to track seen URLs and detect duplicates
  const seen = new Map<string, string>();

  // Iterate through each footer item
  for (const f of footerItems) {
    const fullUrl = this.actions.extractFullUrlFromString(f.href);

    // Skip items without a valid URL
    if (!fullUrl) {
      console.warn(`⚠ Footer item "${f.label}" has no valid URL. Skipping.`);
      continue;
    }

    // Check for duplicates: same URL with different labels
    if (seen.has(fullUrl)) {
      const duplicateWith = seen.get(fullUrl)!;
      console.warn(`⚠ Duplicate found → "${f.label}" duplicate with "${duplicateWith}" (URL: ${fullUrl})`);
      duplicatesSummary.push({ label: f.label, duplicateWith, url: fullUrl });
    } else {
      seen.set(fullUrl, f.label);
    }

    // ✅ Scroll into view before opening a new tab (helps simulate user interaction)
    try {
      const locator = this.page.locator(`//li[@class="footer-list__item"] >> text=${f.label}`);
      await locator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500); // small pause to visualize the scroll
    } catch {
      console.warn(`⚠ Could not scroll to footer item "${f.label}"`);
    }

    // ✅ Open a new tab to validate each footer item
    let footerPage: Page | null = null;
    try {
      footerPage = await this.page.context().newPage();
      await footerPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await validateTitleContains(footerPage, f.label);
      console.log(`✓ Footer item validated: ${f.label}`);
    } catch (err: any) {
      console.error(`❌ Footer item "${f.label}" failed → ${err?.message || err}`);
    } finally {
      // Ensure the tab is closed even if an error occurs
      if (footerPage) await footerPage.close().catch(() => null);
    }
  }

  // Print a summary of duplicate footer items found
  console.log(`\n📊 FOOTER DUPLICATES SUMMARY:`);
  if (duplicatesSummary.length === 0) {
    console.log(`✅ No duplicates found in footer.`);
  } else {
    duplicatesSummary.forEach(d => {
      console.log(`  - "${d.label}" duplicate with "${d.duplicateWith}" (URL: ${d.url})`);
    });
  }
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
    
  }

  async validateCarouselHome() {
    // 1. Checks if the homepage title is visible.
    await expect(this.tituloHomePage).toBeVisible();

    // 2. Reads the title text and confirms it contains the expected phrase
    const titulo = await this.tituloHomePage.innerText();
    expect(titulo).toContain('Welcome To The Home Of Ski');
    console.log(`Homepage Title: ${titulo}`);

    // 3. Waits for the carousel to be visible on the page
    await expect(this.carouselhome).toBeVisible();

    // 4. Locates the slide that is initially active
    let activeSlide = this.carouselhome.locator('.content-carousel__inner__item--active').first();

    // 5. Gets the link (href) of the initially active slide
    const initialHref = await activeSlide.locator('a').getAttribute('href') ?? '';
    console.log(`Initial slide: ${initialHref}`);

    // 6. Clicks the NEXT button (advance carousel)
    await this.carouselhome.locator('.content-carousel__control--right').click({ force: true });

    // 7. Waits until the active slide changes to one different from the initial
    await this.page.waitForFunction(
      (expectedHref) => {
        const active = document.querySelector('.content-carousel__inner__item--active a');
        return active && active.getAttribute('href') !== expectedHref;
      },
      initialHref // Checks if the homepage title is visible.
    );

    // 8. The new slide becomes active after clicking NEXT.
    activeSlide = this.carouselhome.locator('.content-carousel__inner__item--active').first();
    const nextHref = await activeSlide.locator('a').getAttribute('href') ?? '';
    console.log(`Slide after NEXT: ${nextHref}`);

    // 9. Confirms that the new slide is different from the initial one
    expect(nextHref).not.toBe(initialHref);

    // 10. Clicks the PREVIOUS button (go back in the carousel)
    await this.carouselhome.locator('.content-carousel__control--left').click({ force: true });

    // 11. Wait until the active slide reverts to the initial slide.
    await this.page.waitForFunction(
      (expectedHref) => {
        const active = document.querySelector('.content-carousel__inner__item--active a');
        return active && active.getAttribute('href') === expectedHref;
      },
      initialHref
    );

    // 12. Get the active slide after clicking PREVIOUS.
    activeSlide = this.carouselhome.locator('.content-carousel__inner__item--active').first();
    const prevHref = await activeSlide.locator('a').getAttribute('href') ?? '';
    console.log(`Slide after PREVIOUS: ${prevHref}`);

    // 13. Confirms that it returned to the initial slide
    expect(prevHref).toBe(initialHref);
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
    // Main menu locator
    const menu = this.page.locator(`//li[@class="menu-list__item"]//a[text()="${menuName}"]`);

    // If you only go through the Name menu → click on the menu
    if (!subMenuName) {
      await menu.click();
      console.log(`✓ Clicked only on the menu: ${menuName}`);
      return;
    }

    // If you also pass the subMenuName → hover on the menu and try to click on the submenu
    await menu.hover();

    // Submenu locator (you will fill in with your XPath)
    const subMenu = this.page.locator(`//li[@class="submenu-list__item"]//a[text()="${subMenuName}"]`);

    // Check if the submenu exists and is visible.
    const count = await subMenu.count();
    if (count === 0) {
      console.log(`⚠️ There is no submenu labeled with that name. "${subMenuName}" inside the menu "${menuName}"`);
      return;
    }

    await subMenu.click();
    console.log(`✓ Clicked on the submenu: "${subMenuName}" inside the menu: "${menuName}"`);
  }
}
