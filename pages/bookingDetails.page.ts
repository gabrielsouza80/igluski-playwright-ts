import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class BookingDetailsPage extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly termsCheckbox: Locator = this.page.locator('#sob-terms-conditions');
  readonly bookNowBtn: Locator = this.page.locator('(//button[@data-location-attribute="/book/createbooking"][contains(text(),"Book Now")])[2]');
  readonly errataCheckbox: Locator = this.page.locator('#sob-errata');


  async fillGuestDetails(firstName: string, lastName: string, email: string, phone: string): Promise<void> {
    // Preencher nome
    await this.page.getByLabel(/First Name */i).fill(firstName);

    // Preencher apelido
    await this.page.getByLabel(/Last Name/i).fill(lastName);

    // Preencher email
    await this.page.getByLabel(/Email Address/i).fill(email);

    // Preencher telefone
    await this.page.getByLabel(/Mobile Telephone Number/i).fill(phone);
  }

  async acceptTermsAndConditions(): Promise<void> {
    await this.termsCheckbox.click();
    await this.termsCheckbox.check();
  }

  async acceptErratas(): Promise<void> {
    await this.errataCheckbox.click();
    await this.errataCheckbox.check();
  }

  async proceedToPayment(){
    await this.bookNowBtn.click();
  }

  async waitForPaymentPage(timeout = 10000): Promise<void> {
    // Esperar pela página de pagamento (URL change ou elemento específico)
    await this.page.waitForURL(/payment|checkout|pay/i, { timeout });
  }

}
