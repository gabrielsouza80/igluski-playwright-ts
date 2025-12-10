import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class SummaryPage    extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();

  readonly roomsAndBoardSection: Locator = this.page.locator('text=/Room\\(s\\) & Board/');
  readonly flightsSection: Locator = this.page.locator('text=Flights').first();
  readonly bookOnlineBtn: Locator = this.page.getByRole('button', { name: /Book Online/i });
  readonly totalPrice: Locator = this.page.locator('text=/Total Price/').locator('..').locator('text=/£/');

  async getTotalPrice(): Promise<string> {
    return await this.totalPrice.textContent() || '';
  }

  async bookOnline(): Promise<void> {
    await this.bookOnlineBtn.last().click();
  }

  async isSummaryPageLoaded(): Promise<boolean> {
    return await this.roomsAndBoardSection.isVisible({ timeout: 5000 }).catch(() => false);
  }
}