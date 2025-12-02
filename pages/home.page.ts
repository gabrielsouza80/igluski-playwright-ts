import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // URLs
  readonly BASE_URL = 'https://www.igluski.com';
  readonly HOME_URL = `${this.BASE_URL}/`;
  readonly SKI_HOLIDAYS_URL = `${this.BASE_URL}/ski-holidays`;
  readonly SKI_DESTINATIONS_URL = `${this.BASE_URL}/ski-resorts`;
  readonly SKI_DEALS_URL = `${this.BASE_URL}/ski-deals`;
  readonly SNOW_REPORTS_URL = `${this.BASE_URL}/snow-reports`;
  readonly SKI_BLOG_URL = `${this.BASE_URL}/blog`;
  readonly ENQUIRE_URL = `${this.BASE_URL}/enquire`;
  readonly FRANCE_RESORTS_URL = `${this.BASE_URL}/ski-resorts/france`;
  readonly AUSTRIA_RESORTS_URL = `${this.BASE_URL}/ski-resorts/austria`;
  readonly SKI_CHALETS_URL = `${this.BASE_URL}/ski-holidays/ski-chalet-holidays`;

  // Header & Navigation
  readonly logoLink: Locator;
  readonly searchMenu: Locator;
  readonly skiHolidaysMenu: Locator;
  readonly skiDestinationsMenu: Locator;
  readonly skiDealsMenu: Locator;
  readonly snowReportsMenu: Locator;
  readonly skiBlogMenu: Locator;
  readonly enquireMenu: Locator;

  // Search Form Elements
  readonly searchPropertiesInput: Locator;
  readonly searchCountriesSelect: Locator;
  readonly searchResortsSelect: Locator;
  readonly departingSelect: Locator;
  readonly adultsSelect: Locator;
  readonly childrenSelect: Locator;
  readonly searchButton: Locator;

  // Carousel Elements
  readonly carouselNextButton: Locator;
  readonly carouselPrevButton: Locator;
  readonly carouselSlides: Locator;

  // CTA Buttons
  readonly getInTouchButton: Locator;
  readonly findOutMoreButton: Locator;
  readonly signMeUpButton: Locator;

  // Destination Cards
  readonly franceCardLink: Locator;
  readonly austriaCardLink: Locator;
  readonly italyCardLink: Locator;
  readonly andorraCardLink: Locator;

  // Footer Links
  readonly footerFranceLink: Locator;
  readonly skiChaletsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header & Navigation
    this.logoLink = page.locator('a[href="/"]').first();
    this.searchMenu = page.locator('a[href="/ski-holidays"]').first();
    this.skiHolidaysMenu = page.locator('a:has-text("SKI HOLIDAYS")').first();
    this.skiDestinationsMenu = page.locator('a:has-text("SKI DESTINATIONS")').first();
    this.skiDealsMenu = page.locator('a:has-text("SKI DEALS")').first();
    this.snowReportsMenu = page.locator('a:has-text("SNOW REPORTS")').first();
    this.skiBlogMenu = page.locator('a:has-text("SKI BLOG")').first();
    this.enquireMenu = page.locator('a:has-text("ENQUIRE")').first();

    // Search Form Elements
    this.searchPropertiesInput = page.locator('input[placeholder*="Search properties"]');
    this.searchCountriesSelect = page.locator('select').nth(0);
    this.searchResortsSelect = page.locator('select').nth(1);
    this.departingSelect = page.locator('select').nth(2);
    this.adultsSelect = page.locator('select').nth(3);
    this.childrenSelect = page.locator('select').nth(4);
    this.searchButton = page.locator('button:has-text("Search")').last();

    // Carousel Elements
    this.carouselNextButton = page.locator('button').filter({ hasText: 'Next' }).first();
    this.carouselPrevButton = page.locator('button').filter({ hasText: 'Previous' }).first();
    this.carouselSlides = page.locator('[class*="slide"], [role="region"]').first();

    // CTA Buttons
    this.getInTouchButton = page.locator('text=GET IN TOUCH').first();
    this.findOutMoreButton = page.locator('text=FIND OUT MORE').first();
    this.signMeUpButton = page.locator('text=SIGN ME UP').first();

    // Destination Cards
    this.franceCardLink = page.locator('a[href*="/ski-resorts/france"]').first();
    this.austriaCardLink = page.locator('a[href*="/ski-resorts/austria"]').first();
    this.italyCardLink = page.locator('a[href*="/ski-resorts/italy"]').first();
    this.andorraCardLink = page.locator('a[href*="/ski-resorts/andorra"]').first();

    // Footer Links
    this.footerFranceLink = page.locator('footer a[href*="/ski-resorts/france"]').first();
    this.skiChaletsLink = page.locator('a[href*="ski-chalet-holidays"]').first();
  }

  // Helper: Dismiss cookie banner
  private async dismissCookieBanner(): Promise<void> {
    try {
      const cookieButton = this.page.locator(
        'button:has-text("Accept All"), button:has-text("Accept"), [id*="onetrust"] button'
      ).first();

      if (await cookieButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cookieButton.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    } catch (error) {
      console.log('Cookie banner already dismissed or not found');
    }
  }

  // Helper: Hide cookie banner overlay
  private async hideCookieBanner(): Promise<void> {
    try {
      await this.page.evaluate(() => {
        const banners = document.querySelectorAll('[class*="onetrust"]');
        banners.forEach((banner: Element) => {
          (banner as HTMLElement).style.display = 'none';
        });
      });
    } catch (error) {
      console.log('Could not hide cookie banner');
    }
  }

  // Navigation Methods
  async navigateToHome(): Promise<void> {
    await this.page.goto(this.HOME_URL, { waitUntil: 'domcontentloaded' });
    await this.dismissCookieBanner();
    await this.hideCookieBanner();
    await this.page.waitForTimeout(2000);
  }

  async clickSearchMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.searchMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_HOLIDAYS_URL, { timeout: 15000 });
  }

  async clickSkiHolidaysMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.skiHolidaysMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_HOLIDAYS_URL, { timeout: 15000 });
  }

  async clickSkiDestinationsMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.skiDestinationsMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_DESTINATIONS_URL, { timeout: 15000 });
  }

  async clickSkiDealsMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.skiDealsMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_DEALS_URL, { timeout: 15000 });
  }

  async clickSnowReportsMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.snowReportsMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SNOW_REPORTS_URL, { timeout: 15000 });
  }

  async clickSkiBlogMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.skiBlogMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_BLOG_URL, { timeout: 15000 });
  }

  async clickEnquireMenu(): Promise<void> {
    await this.hideCookieBanner();
    await this.enquireMenu.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.ENQUIRE_URL, { timeout: 15000 });
  }

  // Carousel Methods
  async clickCarouselNext(): Promise<void> {
    await this.hideCookieBanner();
    await this.carouselNextButton.click({ timeout: 10000, force: true });
    await this.page.waitForTimeout(1500);
  }

  async clickCarouselPrev(): Promise<void> {
    await this.hideCookieBanner();
    await this.carouselPrevButton.click({ timeout: 10000, force: true });
    await this.page.waitForTimeout(1500);
  }

  async getCarouselText(): Promise<string | null> {
    try {
      return await this.carouselSlides.textContent({ timeout: 5000 });
    } catch {
      return null;
    }
  }

  // Search Form Methods
  async fillSearchForm(
    country: string,
    resort: string,
    adults: string,
    children: string
  ): Promise<void> {
    // Select country
    await this.searchCountriesSelect.selectOption(country, { timeout: 10000 });
    await this.page.waitForTimeout(800);

    // Select resort
    await this.searchResortsSelect.selectOption(resort, { timeout: 10000 });
    await this.page.waitForTimeout(800);

    // Select adults
    await this.adultsSelect.selectOption(adults, { timeout: 10000 });
    await this.page.waitForTimeout(800);

    // Select children
    await this.childrenSelect.selectOption(children, { timeout: 10000 });
    await this.page.waitForTimeout(800);
  }

  async clickSearchButton(): Promise<void> {
    await this.hideCookieBanner();
    await this.searchButton.click({ timeout: 10000, force: true });
    await this.page.waitForURL(/\/ski-holidays\?/, { timeout: 15000 });
  }

  // CTA Methods
  async clickGetInTouch(): Promise<void> {
    await this.getInTouchButton.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.getInTouchButton.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.ENQUIRE_URL, { timeout: 15000 });
  }

  async clickFindOutMore(): Promise<void> {
    await this.findOutMoreButton.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.findOutMoreButton.click({ timeout: 10000, force: true });
    await this.page.waitForURL(/\/about/, { timeout: 15000 });
  }

  async clickSignMeUp(): Promise<void> {
    await this.signMeUpButton.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.signMeUpButton.click({ timeout: 10000, force: true });
    await this.page.waitForURL(/signup/, { timeout: 15000 });
  }

  // Destination Card Methods
  async clickFranceCard(): Promise<void> {
    await this.franceCardLink.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.franceCardLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.FRANCE_RESORTS_URL, { timeout: 15000 });
  }

  async clickAustriaCard(): Promise<void> {
    await this.austriaCardLink.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.austriaCardLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.AUSTRIA_RESORTS_URL, { timeout: 15000 });
  }

  async clickItalyCard(): Promise<void> {
    await this.italyCardLink.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.italyCardLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(/\/ski-resorts\/italy/, { timeout: 15000 });
  }

  async clickAndorraCard(): Promise<void> {
    await this.andorraCardLink.scrollIntoViewIfNeeded();
    await this.hideCookieBanner();
    await this.andorraCardLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(/\/ski-resorts\/andorra/, { timeout: 15000 });
  }

  // Footer Methods
  async clickFooterFranceLink(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(800);
    await this.hideCookieBanner();
    await this.footerFranceLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.FRANCE_RESORTS_URL, { timeout: 15000 });
  }

  async clickSkiChaletsLink(): Promise<void> {
    await this.skiChaletsLink.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(800);
    await this.hideCookieBanner();
    await this.skiChaletsLink.click({ timeout: 10000, force: true });
    await this.page.waitForURL(this.SKI_CHALETS_URL, { timeout: 15000 });
  }

  // Assertion Methods
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    try {
      await this.page.waitForURL(expectedUrl, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

  async getSearchResults(): Promise<string> {
    try {
      const resultText = await this.page.locator('text=properties found').textContent({ timeout: 5000 });
      return resultText || '';
