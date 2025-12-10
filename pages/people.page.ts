import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class PeopleAndContactDetailsPage extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.this.page.locator('img[alt*="Iglu Ski"]') }).first();

  readonly titleSelect: Locator = this.page.locator('#RoomsDetails_0__People_0__TitleId');
  readonly firstNameInput: Locator = this.page.locator('#RoomsDetails_0__People_0__FirstName');
  readonly lastNameInput: Locator = this.page.locator('#RoomsDetails_0__People_0__LastName');;
  readonly daySelect: Locator = this.page.locator('select[aria-label*="day"]').first();;
  readonly monthSelect: Locator = this.page.locator('select[aria-label*="month"]').first();
  readonly yearSelect: Locator = this.page.locator('select[aria-label*="year"]').first();
  readonly postCodeInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_Postcode');;
  readonly findAddressBtn: Locator = this.page.getByRole('button', { name: /Find Address/i });;
  readonly address1Input: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_FirstAddressLine');;
  readonly address2Input: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_SecondAddressLine');;
  readonly townInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_Town');
  readonly countryInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_Country');
  readonly mobilePhoneInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_MobilePhone');
  readonly emailInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_Email');
  readonly confirmEmailInput: Locator = this.page.locator('#RoomsDetails_0__People_0__ContactInfo_ConfirmEmail');
  readonly newsLetterCheckbox: Locator = this.page.locator('#chkNewsLetterSub');
  readonly continueToBookingBtn: Locator = page.getByRole('button', { name: /Continue to Booking/i });

  async fillPassengerDetails(title: string, firstName: string, lastName: string, day: string, month: string, year: string): Promise<void> {
    await this.titleSelect.selectOption({ label: title });
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.daySelect.selectOption({ label: day });
    await this.monthSelect.selectOption({ label: month });
    await this.yearSelect.selectOption({ label: year });
  }

  async fillAddressDetails(postCode: string, address1: string, address2: string, town: string, country: string): Promise<void> {
    await this.postCodeInput.fill(postCode);
    // Optionally use Find Address button
    await this.address1Input.fill(address1);
    await this.address2Input.fill(address2);
    await this.townInput.fill(town);
    await this.countryInput.fill(country);
  }

  async fillContactDetails(phone: string, email: string): Promise<void> {
    await this.mobilePhoneInput.fill(phone);
    await this.emailInput.fill(email);
    await this.confirmEmailInput.fill(email);
  }

  async subscribeToNewsletter(subscribe: boolean): Promise<void> {
    if (subscribe) {
      await this.newsLetterCheckbox.check();
    } else {
      await this.newsLetterCheckbox.uncheck();
    }
  }

  async continueToBooking(): Promise<void> {
    await this.continueToBookingBtn.last().click();
  }

  async isPeoplePageLoaded(): Promise<boolean> {
    return await this.firstNameInput.isVisible({ timeout: 5000 }).catch(() => false);
  }
}