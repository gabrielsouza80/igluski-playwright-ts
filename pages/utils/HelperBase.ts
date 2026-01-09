// HelperBase: base class for Pages and Helpers.
// Provides the Playwright `page` object and common utilities (logs, waits, soft validations).

import { Page, Locator, expect } from '@playwright/test';
import type { MenuSnapshot, SubLinkSnapshot } from '../components.page';
import testdata from '../../tests/fixtures/testdata.json';

type LogLevel = 'minimal' | 'verbose';

export class HelperBase {
  protected readonly page: Page;

  public testCaseErrors: string[] = [];
  public testCaseWarnings: string[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  // ============================================================
  // 🔵 CONFIG
  // ============================================================
  private get logLevel(): LogLevel {
    const fromEnv = (process.env.LOG_LEVEL || '').toLowerCase().trim();
    if (fromEnv === 'verbose') return 'verbose';
    if (fromEnv === 'minimal') return 'minimal';
    const fromJson = (testdata as any)?.framework?.logging?.level;
    return fromJson === 'verbose' ? 'verbose' : 'minimal';
  }

  // ============================================================
  // 🔵 TESTDATA ACCESSORS (Centralized Selector Management)
  // ============================================================
  /**
   * Retrieves a selector string from testdata.json locators configuration
   * @param path Dot-notation path like 'searchPage.filterSidebar.sidebar'
   * @returns Selector string or null if not found
   */
  protected getSelector(path: string): string | null {
    const parts = path.split('.');
    let current: any = testdata;

    for (const part of parts) {
      if (current?.[part] === undefined) return null;
      current = current[part];
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * Retrieves a numeric timeout value from testdata.json
   * @param path Dot-notation path like 'searchPage.timeouts.sidebarVisible'
   * @param defaultValue Fallback value if not found
   * @returns Timeout in milliseconds
   */
  protected getTimeout(path: string, defaultValue: number = 5000): number {
    const value = this.getSelector(path);
    const parsed = value ? parseInt(value, 10) : NaN;
    return !isNaN(parsed) ? parsed : defaultValue;
  }

  /**
   * Retrieves a regex pattern from testdata.json
   * @param path Dot-notation path like 'searchPage.locators.regexPatterns.resultsMessage'
   * @returns RegExp object or null
   */
  protected getRegexPattern(path: string): RegExp | null {
    const pattern = this.getSelector(path);
    if (!pattern) return null;

    // Remove leading/trailing slashes if present
    const cleaned = pattern.replace(/^\/|\/[gimuy]*$/g, '');
    const flags = pattern.match(/\/([gimuy]*)$/)?.[1] || '';

    try {
      return new RegExp(cleaned, flags);
    } catch {
      return null;
    }
  }

  // ============================================================
  // 🔵 SOFT ISSUES (anti-false-positive)
  // ============================================================
  public clearSoftIssues(): void {
    this.testCaseErrors = [];
    this.testCaseWarnings = [];
  }

  protected addSoftError(message: string): void {
    const msg = this.sanitizeLogMessage(message);
    this.testCaseErrors.push(msg);
    this.logError(msg);
  }

  protected addSoftWarning(message: string): void {
    const msg = this.sanitizeLogMessage(message);
    this.testCaseWarnings.push(msg);
    this.logWarn(msg);
  }

  // ============================================================
  // 🔵 COOKIE BANNER HANDLING
  // ============================================================
  async acceptCookies(): Promise<void> {
    if (!this.checkPageAlive('acceptCookies')) return;

    const selectors = [
      'button:has-text("Accept Cookies & Close")',
      'button:has-text("Accept")',
    ];

    for (const selector of selectors) {
      if (!this.checkPageAlive('acceptCookies iteration')) return;
      const btn = this.page.locator(selector).first();
      try {
        const count = await btn.count();
        if (!count) continue;
        await btn.click();
        return;
      } catch {
        // ignore - button not found or page closed
      }
    }

    this.logInfo('Cookie banner not found or already closed');
  }

  // ============================================================
  // 🔵 URL HELPERS
  // ============================================================
  protected resolveUrl(href: string | null | undefined): string | null {
    if (!href) return null;
    return href.startsWith('http') ? href : new URL(href, this.page.url()).href;
  }

  async openAndValidateUrl(url: string, expectedPattern: RegExp): Promise<void> {
    const newPage = await this.page.context().newPage();
    try {
      await newPage.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(newPage).toHaveURL(expectedPattern);
    } finally {
      await newPage.close();
    }
  }

  // ============================================================
  // 🔵 TEXT NORMALIZATION
  // ============================================================
  protected normalizeText(text: string): string {
    return (text ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ============================================================
  // 🔵 TITLE VALIDATION
  // ============================================================
  protected async validateTitleContains(page: Page, label: string): Promise<void> {
    const normalize = (txt: string) =>
      (txt ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/gi, ' ')
        .trim();

    const normalizedLabel = normalize(label);

    try {
      const h1 = page.locator('h1').first();
      const h1Text = normalize(await h1.innerText());
      const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);
      const match = labelWords.some(w => h1Text.includes(w));

      if (!match) {
        this.addSoftError(`Title does NOT contain expected label: "${label}"`);
      } else {
        this.logInfo('[OK] Title contains expected label');
      }
    } catch {
      this.addSoftError(`Title validation failed for label: "${label}"`);
    }
  }

  // ============================================================
  // 🔵 CAROUSEL HELPERS
  // ============================================================
  protected async waitForCarouselSlideChange(previousHref: string): Promise<void> {
    await this.page.waitForFunction(
      (href) => {
        const active = document.querySelector('.content-carousel__inner__item--active a');
        return active && active.getAttribute('href') !== href;
      },
      previousHref
    );
  }

  // ============================================================
  // 🔵 SCROLL HELPERS
  // ============================================================
  protected async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  // ============================================================
  // 🔵 NAVIGATION
  // ============================================================
  async navigateAndAcceptCookies(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'load' });
    try {
      await this.page.waitForLoadState('networkidle');
    } catch {
      // networkidle may never occur; continue.
    }
    await this.acceptCookies();
  }

  // ============================================================
  // 🔵 STRUCTURED LOGGING (ASCII-safe)
  // ============================================================
  private sanitizeLogMessage(message: string): string {
    return (message ?? '')
      .replace(/[✓✔]/g, '[OK]')
      .replace(/[❌✗✖]/g, '[FAIL]')
      .replace(/[⚠]/g, '[WARN]')
      .replace(/[ℹ]/g, '[INFO]')
      .replace(/🔎/g, '[INFO]')
      .replace(/[•]/g, '-')
      .replace(/[→]/g, '->')
      .replace(/[—–]/g, '-')
      .replace(/[“”]/g, '"')
      .replace(/[’]/g, "'");
  }

  protected logSection(title: string): void {
    console.log(`\n==================== ${String(title).toUpperCase()} ====================`);
  }

  protected logInfo(message: string): void {
    const msg = this.sanitizeLogMessage(message);
    if (this.logLevel === 'minimal' && msg.startsWith('[OK]')) return;
    console.log(`- ${msg}`);
  }

  protected logSubInfo(message: string): void {
    const msg = this.sanitizeLogMessage(message);
    if (this.logLevel === 'minimal' && msg.startsWith('[OK]')) return;
    console.log(`  - ${msg}`);
  }

  protected logDivider(): void {
    console.log('---------------------------------------------------------------');
  }

  protected logWarn(message: string): void {
    console.log(`[WARN] ${this.sanitizeLogMessage(message)}`);
  }

  protected logError(message: string): void {
    console.log(`[ERROR] ${this.sanitizeLogMessage(message)}`);
  }

  // ============================================================
  // 🧪 GENERIC MENU UTILITIES
  // ============================================================
  async getMenuSnapshot(): Promise<MenuSnapshot[]> {
    const snapshot = await this.page.$$eval('li.menu-list__item', (items) => {
      return items.map((li) => {
        const mainLink = li.querySelector('a');
        const mainHref = mainLink?.getAttribute('href') || null;
        const mainLabel = mainLink?.textContent?.trim() || '';

        const subAnchors = Array.from(li.querySelectorAll('.submenu-list__block-item a'));
        const sublinks = subAnchors.map((a) => ({
          label: a.textContent?.trim() || '',
          href: a.getAttribute('href'),
        }));

        return { mainLabel, mainHref, sublinks };
      });
    });

    this.logInfo(`Snapshot captured: ${snapshot.length} main menus`);
    this.logDivider();
    return snapshot;
  }

  async safeGoto(page: Page, url: string): Promise<void> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return;
      } catch (err) {
        this.logWarn(`Navigation failed (attempt ${attempt}) -> ${url}`);
        if (attempt === 2) throw err;
      }
    }
  }

  async validateSingleMenu(navPage: Page, menu: MenuSnapshot): Promise<void> {
    this.logInfo(`URL: ${menu.mainHref}`);
    this.logDivider();

    const menuUrl = this.resolveUrl(menu.mainHref);
    if (!menuUrl) {
      this.addSoftWarning(`Skipping menu (no URL): ${menu.mainLabel}`);
      return;
    }

    await this.safeGoto(navPage, menuUrl);
    await expect(navPage).toHaveURL(new RegExp(menuUrl, 'i'));
    const pageTitle = await navPage.title();
    this.logInfo(`Page title: ${pageTitle}`);
    this.logInfo('[OK] Main menu validated');
    this.logDivider();
  }

  async validateSingleSubmenu(navPage: Page, sub: SubLinkSnapshot): Promise<void> {
    this.logInfo(`URL: ${sub.href}`);
    this.logDivider();

    const subUrl = this.resolveUrl(sub.href);
    if (!subUrl) {
      this.addSoftWarning(`Skipping submenu (no URL): ${sub.label}`);
      return;
    }

    await this.safeGoto(navPage, subUrl);
    await expect(navPage).toHaveURL(new RegExp(subUrl, 'i'));
    const pageTitle = await navPage.title();
    this.logInfo(`Page title: ${pageTitle}`);
    await this.validateTitleContains(navPage, sub.label);
    this.logDivider();
  }

  // ============================================================
  // 🔵 RESPONSIVENESS HELPERS
  // ============================================================
  protected async hasHorizontalOverflow(): Promise<boolean> {
    return await this.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  }

  protected async validateImagesResponsive(width: number): Promise<{ valid: boolean; invalidImages: string }> {
    return await this.page.evaluate((viewportWidth) => {
      const images = Array.from(document.querySelectorAll('img'));
      const invalidImages: string[] = [];
      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        if (rect.width > viewportWidth) {
          const src = (img as HTMLImageElement).src || `image-${index}`;
          invalidImages.push(`${src} (${Math.round(rect.width)}px)`);
        }
      });
      return { valid: invalidImages.length === 0, invalidImages: invalidImages.join(', ') };
    }, width);
  }

  // ============================================================
  // 🔵 PAGE GUARDS
  // ============================================================
  protected checkPageAlive(context: string): boolean {
    if (this.page.isClosed()) {
      this.addSoftError(`Page closed - ${context}`);
      return false;
    }
    return true;
  }

  // ============================================================
  // 🔵 CHECKBOX SELECTION HELPER
  // ============================================================
  protected async selectCheckboxByStrategies(
    filterName: string,
    filterValue: string,
    strategies: Locator[],
    container: Locator
  ): Promise<boolean> {
    try {
      await container.waitFor({ state: 'visible' }).catch(() => { });
      await container.scrollIntoViewIfNeeded().catch(() => { });

      let checkbox: Locator | null = null;
      let strategyIndex = -1;
      for (let i = 0; i < strategies.length; i++) {
        const count = await strategies[i].count().catch(() => 0);
        if (count > 0) {
          checkbox = strategies[i];
          strategyIndex = i;
          this.logInfo(`  Strategy ${i + 1}: found ✓`);
          break;
        }
      }

      if (!checkbox || !(await checkbox.count())) {
        const allCheckboxes = await container.locator('input[type="checkbox"]').all();
        this.addSoftWarning(`Checkbox for ${filterName}: ${filterValue} not found (${allCheckboxes.length} checkboxes in container)`);
        return false;
      }

      await checkbox.scrollIntoViewIfNeeded().catch(() => { });

      // If already checked, skip further interaction
      const alreadyChecked = await checkbox.isChecked().catch(() => false);
      if (alreadyChecked) {
        this.logInfo(`  ✓ ${filterName} already selected`);
        return true;
      }

      const attemptCheck = async (): Promise<boolean> => {
        await checkbox.check({ force: true }).catch(() => { });
        return await checkbox.isChecked().catch(() => false);
      };

      // Primary attempt
      let checked = await attemptCheck();
      if (checked) {
        this.logInfo(`  ✓ ${filterName} selected`);
      }

      // Fallback 1: click owning label/container if present
      if (!checked) {
        const label = checkbox.locator('xpath=ancestor::label[1]');
        if (await label.count()) {
          await label.click({ force: true }).catch(() => { });
          checked = await checkbox.isChecked().catch(() => false);
          if (checked) {
            this.logInfo(`  ✓ Fallback 1: ancestor label ✓`);
          }
        }
      }

      // Fallback 2: click label associated via "for" attribute
      if (!checked) {
        const checkboxId = await checkbox.getAttribute('id');
        if (checkboxId) {
          const forLabel = this.page.locator(`label[for="${checkboxId}"]`).first();
          if (await forLabel.count()) {
            await forLabel.click({ force: true }).catch(() => { });
            checked = await checkbox.isChecked().catch(() => false);
            if (checked) {
              this.logInfo(`  ✓ Fallback 2: "for" label ✓`);
            }
          }
        }
      }

      // Fallback 3: force a normal click on the input
      if (!checked) {
        await checkbox.click({ force: true }).catch(() => { });
        checked = await checkbox.isChecked().catch(() => false);
        if (checked) {
          this.logInfo(`  ✓ Fallback 3: direct click ✓`);
        }
      }

      // Fallback 4: click closest container element (common for custom checkboxes)
      if (!checked) {
        const containerClick = checkbox.locator('xpath=ancestor::*[self::label or self::li or self::div][1]');
        if (await containerClick.count()) {
          await containerClick.click({ force: true }).catch(() => { });
          checked = await checkbox.isChecked().catch(() => false);
          if (checked) {
            this.logInfo(`  ✓ Fallback 4: container ✓`);
          }
        }
      }

      // Fallback 5: force state via DOM if all clicks failed
      if (!checked) {
        this.logInfo(`  → Trying fallback 5: DOM mutation (direct state change)`);
        await checkbox.evaluate((el) => {
          const input = el as HTMLInputElement;
          input.checked = true;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }).catch(() => { });
        checked = await checkbox.isChecked().catch(() => false);
        if (checked) {
          this.logInfo(`  ✓ Fallback 5 (DOM mutation) succeeded`);
        }
      }

      if (!checked) {
        this.addSoftError(`Clicking the checkbox did not change its state for ${filterName}: ${filterValue}`);
        return false;
      }

      await this.page.waitForLoadState('domcontentloaded').catch(() => { });

      this.logInfo(`[OK] Selected ${filterName}: ${filterValue}`);
      return true;
    } catch (error) {
      this.addSoftError(`Error selecting ${filterName}: ${String(error)}`);
      return false;
    }
  }
}
