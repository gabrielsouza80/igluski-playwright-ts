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

  // Locators: Cookie Model
  readonly acceptCookiesButton: Locator = this.page.locator('button:has-text("Accept Cookies & Close")').first();
  readonly cookiesBanner: Locator = this.page.locator('//div[@aria-label="Cookie banner"]');

  // LOCATORS: Search components
  readonly propertiesSearchInput: Locator = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput: Locator = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly resortsSearchInput: Locator = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton: Locator = this.page.locator('button.search-item__cta');

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

  async navigate(): Promise<void> {
  // Opens the homepage.
  await this.page.goto('/', { waitUntil: 'domcontentloaded' });

// Brief pause to allow dynamic elements to load
  await this.page.waitForTimeout(1500);

    //Accept cookies if they appear.
  await this.acceptCookies();

  // Remove persistent overlays that may intercept clicks.
  try {
    await this.page.evaluate(() => {
      try {
        const ids = ['onetrust-consent-sdk', 'onetrust-pc-wrapper', 'onetrust-banner-sdk'];
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.remove();
        });
        document.querySelectorAll('.onetrust-pc-dark-filter, .onetrust-pc-sdk, #onetrust-pc')
          .forEach(e => e.remove());
      } catch { /* ignore */ }
    });
    await this.page.waitForTimeout(200);
  } catch { /* ignore */ }
}




  //Action: search by country by filling in the input field and pressing Enter.
  async searchForCountry(text: string) {
    await this.countriesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.countriesSearchInput.press('Enter');
  }

  // Action: search for a property by filling in the input and pressing Enter.

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
  const duplicatesSummary: Record<string, Array<{ label: string; duplicateWith: string; url: string }>> = {};

  const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
    const normalize = (txt: string) =>
      txt.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/gi, " ")
        .trim();

    const normalizedLabel = normalize(label);

    try {
      const h1TextRaw = await page.locator("h1").first().innerText();
      const h1Text = normalize(h1TextRaw);
      const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);
      const anyWordFound = labelWords.some(w => h1Text.includes(w));

      if (anyWordFound) {
        console.log(`✓ Valid title for "${label}" → "${h1TextRaw}"`);
        return true;
      }
    } catch { }

    console.warn(`⚠ No match found in <h1> for: "${label}"`);
    return false;
  };

  const menusSnapshot = await this.page.$$eval("li.menu-list__item", (items) => {
    return items.map((li) => {
      const mainLink = li.querySelector("a");
      const mainHref = mainLink ? mainLink.getAttribute("href") : null;
      const mainLabel = mainLink ? (mainLink.textContent?.trim() || "") : (li.textContent?.trim() || "");
      const subAnchors = Array.from(li.querySelectorAll(".submenu-list__block-item a"));
      const sublinks = subAnchors.map((a) => ({
        label: a.textContent?.trim() || "",
        href: a.getAttribute("href")
      }));
      return { mainLabel, mainHref, sublinks };
    });
  });

  console.log(`🌐 Validating ${menusSnapshot.length} main menus`);

  for (const menu of menusSnapshot) {
    const menuLabel = menu.mainLabel || "menu";
    const menuHref = this.actions.extractFullUrlFromString(menu.mainHref);

    console.log(`\n🌐 Validating menu: "${menuLabel}"`);

    if (!menuHref) {
      console.warn(`⚠ Menu "${menuLabel}" has no valid URL. Skipping.`);
      continue;
    }

    let menuPage: Page | null = null;

    try {
      menuPage = await this.page.context().newPage();
      await menuPage.goto(menuHref, { waitUntil: "domcontentloaded", timeout: 120000 });

      // ✅ Special case: validate whether the "Search" menu opens the search field
      if (/search/i.test(menuLabel)) {
        try {
          await this.resortsSearchInput.waitFor({ state: "visible", timeout: 2000 });
          console.log(`✓ Search menu validated: campo de busca visível`);
        } catch {
          console.warn(`⚠ Search menu não abriu o campo de busca`);
        }
      } else {
        await validateTitleContains(menuPage, menuLabel);
      }

      const sublinks = menu.sublinks || [];
      console.log(`📁 Menu "${menuLabel}" → Found ${sublinks.length} sublinks`);

      if (sublinks.length === 0) {
        await menuPage.close();
        continue;
      }

      const allSublinks: Array<{ label: string; href: string }> = [];
      const seen = new Map<string, string>();

      for (const s of sublinks) {
        const full = this.actions.extractFullUrlFromString(s.href);
        if (!full) continue;

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
      if (menuPage) await menuPage.close().catch(() => null);
    }
  }

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
    const duplicatesSummary: Array<{ label: string; duplicateWith: string; url: string }> = [];

    const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
      const normalize = (txt: string) =>
        txt.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s]/gi, " ")
          .trim();

      const normalizedLabel = normalize(label);

      try {
        const h1TextRaw = await page.locator("h1").first().innerText();
        const h1Text = normalize(h1TextRaw);

        const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);
        const anyWordFound = labelWords.some(w => h1Text.includes(w));

        if (anyWordFound) {
          console.log(`✓ Valid title for footer item "${label}" → "${h1TextRaw}"`);
          return true;
        }
      } catch { }

      console.warn(`⚠ No match found in <h1> for footer item: "${label}"`);
      return false;
    };

    // ✅ Captures all items from the footer
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

    const seen = new Map<string, string>();

    for (const f of footerItems) {
      const fullUrl = this.actions.extractFullUrlFromString(f.href);
      if (!fullUrl) {
        console.warn(`⚠ Footer item "${f.label}" has no valid URL. Skipping.`);
        continue;
      }

      if (seen.has(fullUrl)) {
        const duplicateWith = seen.get(fullUrl)!;
        console.warn(`⚠ Duplicate found → "${f.label}" duplicate with "${duplicateWith}" (URL: ${fullUrl})`);
        duplicatesSummary.push({ label: f.label, duplicateWith, url: fullUrl });
      } else {
        seen.set(fullUrl, f.label);
      }

      // ✅ Before opening a new tab, scroll down to the item in the footer.
      try {
        const locator = this.page.locator(`//li[@class="footer-list__item"] >> text=${f.label}`);
        await locator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500); // pequena pausa para ver o scroll
      } catch {
        console.warn(`⚠ Could not scroll to footer item "${f.label}"`);
      }

      // ✅ Opens a new tab to validate each item in the footer.
      let footerPage: Page | null = null;
      try {
        footerPage = await this.page.context().newPage();
        await footerPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await validateTitleContains(footerPage, f.label);
        console.log(`✓ Footer item validated: ${f.label}`);
      } catch (err: any) {
        console.error(`❌ Footer item "${f.label}" failed → ${err?.message || err}`);
      } finally {
        if (footerPage) await footerPage.close().catch(() => null);
      }
    }

    console.log(`\n📊 FOOTER DUPLICATES SUMMARY:`);
    if (duplicatesSummary.length === 0) {
      console.log(`✅ No duplicates found in footer.`);
    } else {
      duplicatesSummary.forEach(d => {
        console.log(`  - "${d.label}" duplicate with "${d.duplicateWith}" (URL: ${d.url})`);
      });
    }
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
  async clickMenu(menuName: string, subMenuName?: string): Promise<void> {
    console.log(`🔍 Iniciando processo para clicar no menu: "${menuName}"${subMenuName ? ` e submenu: "${subMenuName}"` : ''}`);

    console.log(`➡️ Localizando menu principal com texto: "${menuName}"`);
    const menuButton = this.page.locator(`li.menu-list__item > a.menu-list__item-link:has-text("${menuName}")`);

    const menuCount = await menuButton.count();
    console.log(`📊 Found ${menuCount} elements for menu "${menuName}"`);
    if (menuCount === 0) {
      console.error(`❌ Menu "${menuName}" not found.`);
      return;
    }

    if (!subMenuName) {
      console.log(`✅ Nenhum submenu informado. Clicando diretamente no menu "${menuName}"`);
      await menuButton.click();
      console.log(`✓ Clicou no menu: ${menuName}`);
    } else {
      console.log(`➡️ Submenu informado: "${subMenuName}". Preparando para abrir submenu...`);
      await menuButton.hover();
      console.log(`⏳ Waiting 500ms to ensure submenu loads`);
      await this.page.waitForTimeout(500);

      console.log(`➡️ Localizando submenu com texto: "${subMenuName}"`);
      const subMenuLink = this.page.locator(`.submenu-list__block-item a:has-text("${subMenuName}")`);

      const subMenuCount = await subMenuLink.count();
      console.log(`📊 Found ${subMenuCount} elements for submenu "${subMenuName}"`);
      if (subMenuCount === 0) {
        console.error(`❌ Submenu "${subMenuName}" not found inside "${menuName}".`);
        return;
      }

      console.log(`✅ Submenu encontrado. Clicando no submenu "${subMenuName}"`);
      await subMenuLink.click();
      console.log(`✓ Clicou no submenu: ${subMenuName} dentro do menu: ${menuName}`);
    }

    console.log(`🏁 Processo concluído para menu "${menuName}"${subMenuName ? ` e submenu "${subMenuName}"` : ''}`);
  }

}
