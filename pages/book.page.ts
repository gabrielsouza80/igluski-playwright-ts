import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class PeopleAndContactDetailsPage extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();
  readonly bookingConfirmationSection: Locator = this.page.locator('text=/Booking Confirmation|Review Your Booking/i');;
  readonly continueToPaymentBtn: Locator = this.page.getByRole('button', { name: /Continue to Payment|Proceed to Payment/i });
  readonly insuranceCheckbox: Locator = this.page.locator('input[type="checkbox"][id*="insurance"]').first();
  readonly savebutton: Locator = this.page.locator('')


  async addInsurance(add: boolean): Promise<void> {
    if (add) {
      await this.insuranceCheckbox.check();
    } else {
      await this.insuranceCheckbox.uncheck();
    }
  }

  async continueToPayment(): Promise<void> {
    await this.continueToPaymentBtn.last().click();
  }

  async isBookPageLoaded(): Promise<boolean> {
    return await this.bookingConfirmationSection.isVisible({ timeout: 5000 }).catch(() => false);
  }
}