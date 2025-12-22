// Actions.ts - Generic methods reusable in multiple tests
// Contains utility functions that are not specific to any website

import { Page, Locator } from '@playwright/test';

export class Actions {

  constructor(private page: Page) { }

  // Normalize text by removing accents and special characters (generic)
  normalizeText(s?: string | null): string {
    if (!s) return '';
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
      .toLowerCase();
  }

  // Generate absolute URL from a (generic) href
  extractFullUrlFromString(linkHref: string | null): string | null {
    if (!linkHref) return null;
    try {
      return linkHref.startsWith('http') ? linkHref : new URL(linkHref, this.page.url()).href;
    } catch {
      return null;
    }
  }

  // Verifica se um elemento está visível (genérico)
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  // Wait for the page to load with the expected URL (generic).
  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    try {
      await this.page.waitForURL(`**${expectedUrl}*`, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

}
