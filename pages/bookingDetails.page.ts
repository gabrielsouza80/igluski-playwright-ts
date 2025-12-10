import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class BookingDetailsPage extends HelperBase {
  constructor(page: Page) { super(page) }

  async fillGuestDetails(firstName: string, lastName: string, email: string, phone: string): Promise<void> {
    // Preencher nome
    await this.page.getByLabel(/first name/i).fill(firstName);

    // Preencher apelido
    await this.page.getByLabel(/last name/i).fill(lastName);

    // Preencher email
    await this.page.getByLabel(/email/i).fill(email);

    // Preencher telefone
    await this.page.getByLabel(/phone/i).fill(phone);
  }

  async acceptTermsAndConditions(): Promise<void> {
    const termsCheckbox = this.page.locator('input[type="checkbox"]').first();
    await termsCheckbox.check();
  }

  async proceedToPayment(): Promise<void> {
    await this.page.getByRole('button', { name: /proceed|continue|next/i }).click();
  }

  async waitForPaymentPage(timeout = 10000): Promise<void> {
    // Esperar pela página de pagamento (URL change ou elemento específico)
    await this.page.waitForURL(/payment|checkout|pay/i, { timeout });
  }

}
