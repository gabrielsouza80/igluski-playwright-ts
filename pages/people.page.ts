import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { PassengerData, generatePassengerData, generateMultiplePassengers } from '../pages/utils/test-data-generator';

export class PeopleAndContactDetailsPage extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly titleSelect_0: Locator = this.page.locator('#RoomsDetails_0__People_0__TitleId');
  readonly firstNameInput_0: Locator = this.page.locator('#RoomsDetails_0__People_0__FirstName');
  readonly lastNameInput_0: Locator = this.page.locator('#RoomsDetails_0__People_0__LastName');;
  readonly daySelect_0: Locator = this.page.locator('select[data-date-field*="day"]').first();;
  readonly monthSelect_0: Locator = this.page.locator('select[data-date-field*="month"]').first();
  readonly yearSelect_0: Locator = this.page.locator('select[data-date-field*="year"]').first();
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
  readonly continueToBookingBtn: Locator = this.page.getByRole('button', { name: /Continue to Booking/i });

  // Adult 2 fields
  readonly firstNameInput_1: Locator = this.page.locator('#RoomsDetails_0__People_1__FirstName');
  readonly lastNameInput_1: Locator = this.page.locator('#RoomsDetails_0__People_1__LastName');;
  readonly titleSelect_1: Locator = this.page.locator('#RoomsDetails_0__People_1__TitleId');
  readonly daySelect_1: Locator = this.page.locator('select[data-date-field*="day"][data-dob-person="RoomsDetails[0].People[1]"]');
  readonly monthSelect_1: Locator = this.page.locator('select[data-date-field*="month"][data-dob-person="RoomsDetails[0].People[1]"]')
  readonly yearSelect_1: Locator = this.page.locator('select[data-date-field*="year"][data-dob-person="RoomsDetails[0].People[1]"]')

  async clickContinueToBooking() {
    await this.continueToBookingBtn.first().click()
  }

  async fillAllMandatoryFields(passengerData?: PassengerData): Promise<void> {
    // Se não fornecer dados, gerar aleatórios
    const data = passengerData || generatePassengerData();

    console.log('📝 Filling mandatory fields with passenger data:');
    console.log(`   Title: ${data.title}`);
    console.log(`   Name: ${data.firstName} ${data.lastName}`);
    console.log(`   DOB: ${data.day}/${data.month}/${data.year}`);
    console.log(`   Address: ${data.address1}, ${data.town}`);
    console.log(`   Email: ${data.email}`);

    // Preencher Title
    await this.titleSelect_0.selectOption({ label: data.title });

    // Preencher First Name
    await this.firstNameInput_0.fill(data.firstName);

    // Preencher Last Name
    await this.lastNameInput_0.fill(data.lastName);

    // Preencher Date of Birth
    await this.daySelect_0.selectOption({ label: data.day });
    await this.monthSelect_0.selectOption({ label: data.month });
    await this.yearSelect_0.selectOption({ label: "1987" });

    // Preencher Address
    await this.postCodeInput.fill(data.postcode);
    await this.address1Input.fill(data.address1);

    // Address 2 é opcional
    if (data.address2) {
      await this.address2Input.fill(data.address2);
    }

    await this.townInput.fill(data.town);
    await this.countryInput.fill(data.country);

    // Preencher Contact Info
    await this.mobilePhoneInput.fill(data.mobilePhone);
    await this.emailInput.fill(data.email);
    await this.confirmEmailInput.fill(data.email); // Confirmar com o mesmo email

    console.log('✅ All mandatory fields filled successfully');
  }

  /**
   * Preenche múltiplos passageiros (Adult 1 e Adult 2)
   */
  async fillMultiplePassengers(passengersData?: PassengerData[]): Promise<void> {
    const passengers = passengersData || generateMultiplePassengers(2);
    // Adult 1
    await this.fillAllMandatoryFields(passengers[0]);

    // Adult 2 (se disponível)
    if (passengers.length > 1) {
      console.log('\n📝 Filling Adult 2 data:');
      const adult2 = passengers[1];

      await this.titleSelect_1.selectOption({ label: adult2.title });
      // Preencher First Name
      await this.firstNameInput_1.fill('Name');

      // Preencher Last Name
      await this.lastNameInput_1.fill("Last");

      // Preencher Date of Birth
      await this.daySelect_1.selectOption({ label: "6"});
      await this.monthSelect_1.selectOption({ label: "Jul"});
      await this.yearSelect_1.selectOption({ label: "1987"});
    }
  }
}