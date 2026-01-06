// HelperBase: base class for Pages and Helpers.
// Provides the Playwright `page` object and common utilities (logs, waits, safe clicks).
// Contains custom actions and validations for the platform.

import { Page, Locator, expect } from '@playwright/test';
import type { MenuSnapshot, SubLinkSnapshot } from '../components.page';
import fs from "fs";
import path from "path";

export class HelperBase {

  protected readonly page: Page;
  public tc2Errors: string[] = [];
  // Load JSON once and keep it as a protected property
  protected readonly urls: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "tests/fixtures/secrets.urls.json"), "utf-8")
  );

  constructor(page: Page) {
    this.page = page;
  }

  // ============================================================
  // 🔵 COOKIE BANNER HANDLING
  // ============================================================
  async acceptCookies(): Promise<void> {
    const selectors = [
      'button:has-text("Accept Cookies & Close")',
      'button:has-text("Accept")'
    ];

    for (const selector of selectors) {
      const btn = this.page.locator(selector).first();

      if (await btn.count()) {
        try {
          await expect(btn).toBeVisible();
          await btn.click();
          return;
        } catch { /* ignore */ }
      }
    }

    this.logInfo("Cookie banner not found or already closed");
  }

  // ============================================================
  // 🔵 URL HELPERS
  // ============================================================
  protected resolveUrl(href: string | null | undefined): string | null {
    if (!href) return null;
    return href.startsWith("http")
      ? href
      : new URL(href, this.page.url()).href;
  }

  async openAndValidateUrl(url: string, expectedPattern: RegExp): Promise<void> {
    const newPage = await this.page.context().newPage();

    try {
      await newPage.goto(url, { waitUntil: "domcontentloaded" });
      await expect(newPage).toHaveURL(expectedPattern);
    } finally {
      await newPage.close();
    }
  }

  // ============================================================
  // 🔵 TEXT NORMALIZATION
  // ============================================================
  protected normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ============================================================
  // 🔵 TITLE VALIDATION
  // ============================================================
  protected async validateTitleContains(page: Page, label: string): Promise<void> {
    const normalize = (txt: string) =>
      txt.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/gi, " ")
        .trim();

    const normalizedLabel = normalize(label);

    try {
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();

      const h1Text = normalize(await h1.innerText());
      const labelWords = normalizedLabel.split(/\s+/).filter(w => w.length > 2);

      const match = labelWords.some(w => h1Text.includes(w));

      if (!match) {
        const msg = `❌ Title does NOT contain expected label: "${label}"`;
        this.tc2Errors.push(msg);
        this.logInfo(msg);
      } else {
        this.logInfo(`✓ Title contains expected label`);
      }

    } catch {
      const msg = `❌ Title validation failed for label: "${label}"`;
      this.tc2Errors.push(msg);
      this.logInfo(msg);
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
    await expect(locator).toBeVisible();
  }

  // ============================================================
  // 🔵 STRUCTURED LOGGING
  // ============================================================
  protected logSection(title: string): void {
    console.log(`\n==================== ${title.toUpperCase()} ====================`);
  }

  protected logInfo(message: string): void {
    console.log(`• ${message}`);
  }

  protected logSubInfo(message: string): void {
    console.log(`  • ${message}`);
  }

  protected logDivider(): void {
    console.log(`---------------------------------------------------------------`);
  }

  protected logWarn(message: string): void {
    console.log(`⚠ ${message}`);
  }

  protected logError(message: string): void {
    console.log(`❌ ${message}`);
  }


  // ============================================================
  // 🧪 TC2 — GENERIC MENU UTILITIES (HELPER FUNCTIONS)
  // ============================================================

  // ------------------------------------------------------------
  // TC2 — Snapshot
  // ------------------------------------------------------------
  async getMenuSnapshot(): Promise<MenuSnapshot[]> {
    this.logSection("Header Navigation — Build Snapshot");

    const snapshot = await this.page.$$eval("li.menu-list__item", (items) => {
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

    this.logInfo(`Snapshot captured: ${snapshot.length} main menus`);
    this.logDivider();

    return snapshot;
  }

  // ------------------------------------------------------------
  // Safe navigation with retry
  // ------------------------------------------------------------
  async safeGoto(page: Page, url: string): Promise<void> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded"
        });
        return;
      } catch (err) {
        this.logInfo(`⚠ Navigation failed (attempt ${attempt}) → ${url}`);
        if (attempt === 2) throw err;
        await page.waitForTimeout(1000);
      }
    }
  }

  // ------------------------------------------------------------
  // Validate a single main menu
  // ------------------------------------------------------------
  async validateSingleMenu(navPage: Page, menu: MenuSnapshot): Promise<void> {
    this.logSection(`Main Menu — ${menu.mainLabel}`);
    this.logInfo(`URL: ${menu.mainHref}`);
    this.logDivider();

    const menuUrl = this.resolveUrl(menu.mainHref);
    if (!menuUrl) {
      this.logInfo(`⚠ Skipping menu (no URL): ${menu.mainLabel}`);
      return;
    }

    await this.safeGoto(navPage, menuUrl);

    // Validate URL only (correct behaviour)
    await expect(navPage).toHaveURL(new RegExp(menuUrl, "i"));

    const pageTitle = await navPage.title();
    this.logInfo(`Page title: ${pageTitle}`);

    this.logInfo(`✓ Main menu validated successfully`);
    this.logDivider();
  }

  // ------------------------------------------------------------
  // Validate a single submenu
  // ------------------------------------------------------------
  async validateSingleSubmenu(navPage: Page, sub: SubLinkSnapshot): Promise<void> {
    this.logSection(`Submenu — ${sub.label}`);
    this.logInfo(`URL: ${sub.href}`);
    this.logDivider();

    const subUrl = this.resolveUrl(sub.href);
    if (!subUrl) {
      this.logInfo(`⚠ Skipping submenu (no URL): ${sub.label}`);
      return;
    }

    await this.safeGoto(navPage, subUrl);

    await expect(navPage).toHaveURL(new RegExp(subUrl, "i"));

    const pageTitle = await navPage.title();
    this.logInfo(`Page title: ${pageTitle}`);

    // Submenus usually match title → keep validation
    await this.validateTitleContains(navPage, sub.label);

    this.logDivider();
  }

  // ------------------------------------------------------------
  // Test start log
  // ------------------------------------------------------------
  protected logTestStart(testName: string): void {
    console.log(`\n===== TEST STARTED: ${testName} =====\n`);
  }

  // ============================================================
  // 🔵 RESPONSIVENESS HELPERS
  // ============================================================

  /**
   * Checks if the page has horizontal overflow (scrollable content wider than viewport)
   * @returns {Promise<boolean>} True if horizontal overflow is detected
   */
  protected async hasHorizontalOverflow(): Promise<boolean> {
    const overflow = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    return overflow;
  }

  /**
   * Validates that all images on the page are responsive (not wider than viewport)
   * @param {number} width - The viewport width to validate against
   * @returns {Promise<{valid: boolean, invalidImages: string}>} Validation result
   */
  protected async validateImagesResponsive(width: number): Promise<{ valid: boolean; invalidImages: string }> {
    const result = await this.page.evaluate((viewportWidth) => {
      const images = Array.from(document.querySelectorAll('img'));
      const invalidImages: string[] = [];

      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        if (rect.width > viewportWidth) {
          const src = img.src || `image-${index}`;
          invalidImages.push(`${src} (${Math.round(rect.width)}px)`);
        }
      });

      return {
        valid: invalidImages.length === 0,
        invalidImages: invalidImages.join(', ')
      };
    }, width);

    return result;
  }

}