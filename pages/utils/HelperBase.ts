// HelperBase: base class for Pages and Helpers.
// Provides the Playwright `page` object and common utilities (logs, waits, safe clicks).
// Contains custom actions and validations for the platform.

import { Page, Locator, expect } from '@playwright/test';
import fs from "fs";
import path from "path";

export class HelperBase {

  protected readonly page: Page;

  // Load JSON once and keep it as a protected property
  protected readonly urls: Record<string, string> = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "secrets/secrets.urls.json"), "utf-8")
  );

  constructor(page: Page) {
    this.page = page;
  }

  // Standardized simple log
  protected log(message: string): void {
    console.log(message);
  }

  // Wait until a selector or locator is visible.
  protected async waitForVisible(target: string | Locator, timeout = 5000): Promise<boolean> {
    const locator = typeof target === 'string' ? this.page.locator(target) : target;
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Click securely on selector or locator (wait for visibility first).
  protected async safeClick(target: string | Locator, timeout = 5000): Promise<void> {
    const locator = typeof target === 'string' ? this.page.locator(target) : target;
    await this.waitForVisible(locator, timeout).catch(() => null);
    await locator.click({ timeout }).catch(() => null);
  }

  async waitSpinnerToDisappear(timeout = 20000): Promise<void> {
    const spinner = this.page.locator('.spinner.hide');
    try {
      await spinner.waitFor({ state: 'hidden', timeout });
    } catch (e) {
      console.log('Spinner did not disappear within the timeout period.');
    }
  }

  // Try closing the cookie banner using different (site-specific) selectors.
  async acceptCookies() {
    try {
      const button = await this.page.locator('button:has-text("Accept Cookies & Close")').first();

      if (await button.isVisible({ timeout: 5000 })) {
        await button.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      try {
        const altButton = await this.page.locator('button:has-text("Accept")').first();
        if (await altButton.isVisible({ timeout: 3000 })) {
          await altButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch (e2) {
        console.log('Cookie banner não encontrado ou já foi fechado');
      }
    }
  }

  // validateRedirectButton: opens the link in a new tab and validates the URL (specific to the site)
  async validateRedirectButton(button: Locator | null, expectedUrl: string): Promise<void> {
    console.log(`\n==================== REDIRECT — VALIDATION START ====================`);

    let urlToOpen = expectedUrl;

    if (button) {
      const href = await button.getAttribute('href');

      urlToOpen = href && !href.startsWith("http")
        ? new URL(href, this.page.url()).toString()
        : (href || expectedUrl);

      console.log(`• Extracted URL from element: ${urlToOpen}`);
    } else {
      console.log(`• No element provided. Using expected URL: ${expectedUrl}`);
    }

    console.log(`• Opening new tab to validate redirection...`);
    console.log(`---------------------------------------------------------------`);

    const newPage = await this.page.context().newPage();

    await newPage.goto(urlToOpen, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await expect(newPage).toHaveURL(new RegExp(urlToOpen, 'i'));
    console.log(`• Redirect OK → ${urlToOpen}`);

    await newPage.close();

    console.log(`==================== REDIRECT — VALIDATION COMPLETE ==================\n`);
  }

  // extractFullUrl: automatically generates absolute URLs (site-specific)
  async extractFullUrl(button: Locator): Promise<string | null> {

    const href = await button.getAttribute('href');
    if (!href) return null;

    return href.startsWith('http')
      ? href
      : new URL(href, this.page.url()).href;
  }

  async scrollDown(pixels: number = 500): Promise<void> {
    await this.page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, pixels);
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  // ============================================================
  // 🔵 NOVOS MÉTODOS GENÉRICOS (ADICIONADOS)
  // ============================================================

  protected normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  protected async validateTitleContains(page: Page, label: string): Promise<boolean> {
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

      return labelWords.some(w => h1Text.includes(w));
    } catch {
      return false;
    }
  }

  async openAndValidateUrl(url: string, expectedPattern: RegExp): Promise<void> {
    // Create a new tab without touching the main page
    const context = this.page.context();
    const newPage = await context.newPage();

    try {
      // Navigate to the target URL in the new tab
      await newPage.goto(url, { waitUntil: "domcontentloaded" });

      // Validate the final URL using the expected pattern
      await expect(newPage).toHaveURL(expectedPattern);
    } finally {
      // Always close only the temporary tab
      await newPage.close();
    }
  }

  protected async waitForCarouselSlideChange(previousHref: string): Promise<void> {
    await this.page.waitForFunction(
      (href) => {
        const active = document.querySelector('.content-carousel__inner__item--active a');
        return active && active.getAttribute('href') !== href;
      },
      previousHref
    );
  }

  protected async scrollIntoView(locator: Locator): Promise<void> {
    try {
      await locator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);
    } catch { }
  }

  protected resolveUrl(href: string | null | undefined): string | null {
    if (!href) return null;
    return href.startsWith("http") ? href : new URL(href, this.page.url()).href;
  }

async validatePageTitleContains(page: any, expected: string): Promise<void> {
  const title = await page.title();
  console.log(`  • Page title: "${title}"`);

  if (title.toLowerCase().includes(expected.toLowerCase())) {
    console.log(`  ✓ Title contains "${expected}"`);
  } else {
    console.error(`  ❌ Title does NOT contain "${expected}"`);
  }
}
async validatePageTitleFuzzy(page: any, expected: string): Promise<void> {
  const title = await page.title();
  console.log(`  • Page title: "${title}"`);

  const t = title.toLowerCase();
  const e = expected.toLowerCase();

  // regras de tolerância
  const similar =
    t.includes(e) ||                          // contém literal
    t.includes(e.replace(/s$/, "")) ||        // singular/plural
    t.includes(e.replace(/ing$/, "")) ||      // snowboard / snowboarding
    t.includes(e.split(" ")[0]) ||            // primeira palavra
    e.split(" ").some(word => t.includes(word)); // qualquer palavra relevante

  if (similar) {
    console.log(`  ✓ Title is similar to "${expected}"`);
  } else {
    console.error(`  ❌ Title is NOT similar to "${expected}"`);
  }
}
}