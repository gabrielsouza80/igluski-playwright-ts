import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class PaymentPage  extends HelperBase {
  constructor(page: Page) { super(page) }

  async isPaymentPageDisplayed(): Promise<boolean> {
    const pageUrl = this.page.url();
    const hasPaymentText = await this.page.locator('text=/payment|checkout|pay/i').first().isVisible({ timeout: 3000 }).catch(() => false);
    return pageUrl.includes('payment') || pageUrl.includes('checkout') || hasPaymentText;
  }

  async getOrderSummary(): Promise<string> {
    const summary = await this.page.locator('[class*="summary"], [class*="order"]').first().textContent();
    return summary || '';
  }
}
