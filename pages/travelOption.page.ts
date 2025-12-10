import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class TravelOptionsPage   extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();

  readonly flightsSection: Locator = this.page.locator('text=FLIGHTS').first();
  readonly defaultFlightOption: Locator = this.page.locator('text=/Flight Option \\(Default\\)').first();
  readonly flightOption1: Locator = this.page.locator('text=/Flight Option 1/').first();
  readonly continueToExtrasBtn: Locator = this.page.getByRole('button', { name: /Continue to Extras/i });

  async selectDefaultFlight(): Promise<void> {
    // Flight Option (Default) já vem selecionada
    const selectBtn = this.defaultFlightOption.locator('..').locator('button:has-text("Select")').first();
    await selectBtn.click({ force: true });
  }

  async selectFlightOption1(): Promise<void> {
    const selectBtn = this.flightOption1.locator('..').locator('button:has-text("Select")').first();
    await selectBtn.click({ force: true });
  }

  async continueToExtras(): Promise<void> {
    await this.continueToExtrasBtn.last().click();
  }

  async isTravelPageLoaded(): Promise<boolean> {
    return await this.flightsSection.isVisible({ timeout: 5000 }).catch(() => false);
  }
}