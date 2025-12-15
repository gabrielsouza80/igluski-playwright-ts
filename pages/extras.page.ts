import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class ExtrasPage   extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();

  readonly adult1Dropdown: Locator = this.page.locator('text=Adult 1').first().locator('..').locator('select, [role="combobox"]');
  readonly adult2Dropdown: Locator = this.page.locator('text=Adult 2').first().locator('..').locator('select, [role="combobox"]');
  readonly continueToSummaryBtn: Locator = this.page.locator('(//*[@class="row"]//button[contains(text(),"Continue to Holiday Summary")])[1]')

  async continueToSummary(){
    await this.continueToSummaryBtn.click();
  }

  async isExtrasPageLoaded(): Promise<boolean> {
    return await this.adult1Dropdown.isVisible({ timeout: 5000 }).catch(() => false);
  }
}