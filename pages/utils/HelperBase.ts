// HelperBase: base class for Pages and Helpers.
// Provides the Playwright `page` object and common utilities (logs, waits, safe clicks).
// Contains custom actions and validations for the platform.

import { Page, Locator, expect } from '@playwright/test';

export class HelperBase {
  protected readonly page: Page;

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
      // Try multiple ways to find and click the button.
      const button = await this.page.locator('button:has-text("Accept Cookies & Close")').first();

      if (await button.isVisible({ timeout: 5000 })) {
        await button.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // If you haven't found it one way, try other ways.
      try {
        const altButton = await this.page.locator('button:has-text("Accept")').first();
        if (await altButton.isVisible({ timeout: 3000 })) {
          await altButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch (e2) {
        // The cookie banner may not exist or has already been closed.
        console.log('Cookie banner não encontrado ou já foi fechado');
      }
    }
  }

  // validateRedirectButton: opens the link in a new tab and validates the URL (specific to the site)
  async validateRedirectButton(button: Locator | null, expectedUrl: string): Promise<void> {
  console.log(`\n==================== REDIRECT — VALIDATION START ====================`);

  // Determine the URL to open
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

  // Open new tab
  const newPage = await this.page.context().newPage();

  await newPage.goto(urlToOpen, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // Validate URL
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

  /**
* Scrolls down the page
* @param pixels - Number of pixels to scroll (default: 500)
*/
  async scrollDown(pixels: number = 500): Promise<void> {
    await this.page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, pixels);
  }

  /**
* Scroll to the bottom of the page
*/
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
  * Scroll to the top of the page
  */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }
}