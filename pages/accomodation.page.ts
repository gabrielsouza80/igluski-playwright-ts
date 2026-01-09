import { Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';

export class AccommodationPage  extends HelperBase {
  constructor(page: Page) { super(page) }

  readonly logoLink: Locator = this.page.locator('a[href="/"]').filter({ has: this.page.locator('img[alt*="Iglu Ski"]') }).first();

  readonly main: Locator = this.page.locator('.main.body-additional-bottom-margin');
  readonly confirmNumberOfPeopleBtn: Locator = this.page.getByRole('button', { name: /Confirm Number of People/i });
  readonly addRoomBtn: Locator = this.page.getByRole('button', { name: /Add Room/i });
  readonly addRoomBtnModal: Locator = this.page.locator('.modal-footer button.btn-primary');

  readonly numberOfAdultsInput: Locator = this.page.locator('#number-of-adults-input');
  readonly numberOfChildrenInput: Locator = this.page.locator('#number-of-children-input');
  readonly numberOfInfantsInput: Locator = this.page.locator('#number-of-infants-input'); 
  readonly showRoomOptionsBtn: Locator = this.page.locator('//button[contains(text(), "Choose Your Room")] | //button[contains(text(), "Show Room Options")]');
  readonly continueToTravelOptionsBtn: Locator = this.page.getByRole('button', { name: /Continue to Travel Options/i });

  async setNumberOfAdults(count: number): Promise<void> {
    await this.numberOfAdultsInput.fill(String(count));
  }

  async setNumberOfChildren(count: number): Promise<void> {
    await this.numberOfChildrenInput.fill(String(count));
  }

  async setNumberOfInfants(count: number): Promise<void> {
    await this.numberOfInfantsInput.fill(String(count));
  }

  async clickConfirmNumberOfPeople(): Promise<void> {
    await this.confirmNumberOfPeopleBtn.click();
  }

  async clickAddRoom(): Promise<void> {
    await this.addRoomBtn.click();
    await this.addRoomBtnModal.click();

  }

  async selectAdultForRoom(adultNumber: 1 | 2): Promise<void> {
    // Seleciona Adult 1 ou Adult 2 nos checkboxes do modal
    const adultCheckbox = this.page.locator(`text=/Adult ${adultNumber}/`)
    await adultCheckbox.click();
  }

  async allocateRoomOccupancy(): Promise<void> {
    // Seleciona ambos adultos para a sala
    await this.selectAdultForRoom(1);
    await this.selectAdultForRoom(2);
    // Closes the modal/shows room options
    await this.showRoomOptionsBtn.click();
    // Waits for availability check
    await this.page.waitForLoadState('networkidle');
  }

  async selectRoomOption(): Promise<void> {
    // Clicks 'Select' to choose the room option
    const selectBtn = this.page.locator('button:has-text("Select")').first();
    await selectBtn.click();
  }

  async continueToTravelOptions(): Promise<void> {
    const continueBtn = this.page.locator('(//button[contains(@data-button-type,"goToTravelBtn")])[2]')
    await continueBtn.click();
  }

  async isAccommodationPageLoaded(): Promise<boolean> {
    return await this.confirmNumberOfPeopleBtn.isVisible().catch(() => false);
  }
}
