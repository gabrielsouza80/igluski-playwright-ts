import { expect, Page, Locator } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import config from '../playwright.config';
import {
  generateTitle,
  generateFirstName,
  generateLastName,
  generateEmail,
  generatePhoneCountryCode,
  generatePhoneNumber,
  generateAdultsCount,
  generateChildrenCount
} from './utils/test-data-generator';

export class EnquirePage extends HelperBase {
  constructor(page: Page) { super(page) }

  // Contact Details section
  readonly titleSelect: Locator = this.page.locator('#Title');
  readonly firstNameInput: Locator = this.page.locator('#FirstName');
  readonly lastNameInput: Locator = this.page.locator('#LastName');
  readonly emailInput: Locator = this.page.locator('#Email');
  readonly phoneCountryCodeSelect: Locator = this.page.locator('select#PhoneNumberCountryCode');
  readonly phoneNumberInput: Locator = this.page.locator('#PhoneNumber');

  // Party section
  readonly adultsSelect: Locator = this.page.locator('#Adults');
  readonly childrenSelect: Locator = this.page.locator('#Children');

  // Additional info
  readonly additionalCommentsTextarea: Locator = this.page.locator('#AdditionalComments');
  readonly newsLetterCheckbox: Locator = this.page.locator('#chkNewsLetterSub');

  // Submit button
  readonly enquireButton: Locator = this.page.locator('#ab-track-enquire');

  readonly subFooterLinks: Locator = this.page.locator('.sob-footer-links-container');


  async navigateAndAcceptCookies(): Promise<void> {
    await this.page.goto('/enquire', { waitUntil: 'load' });
      try {
        const timeout = (config as any)?.timeout ?? 5000;
        await this.page.waitForLoadState('networkidle', { timeout });
      } catch {
        // networkidle may never occur (analytics, long-polling). Continue and
        // wait for a key element to be visible so tests proceed deterministically.
      }
  }

  async isPageLoaded(): Promise<boolean> {
    const timeout = (config as any)?.timeout ?? 5000;
    try {
      // Ensure all mandatory fields are visible
      const visibleChecks = await Promise.all([
        this.firstNameInput.isVisible({ timeout }).catch(() => false),
        this.lastNameInput.isVisible({ timeout }).catch(() => false),
        this.emailInput.isVisible({ timeout }).catch(() => false),
        this.phoneNumberInput.isVisible({ timeout }).catch(() => false),
        this.subFooterLinks.isVisible({ timeout }).catch(() => false),
      ]);
      if (!visibleChecks.every(Boolean)) return false;

      // Ensure all mandatory fields are enabled
      const enabledChecks = await Promise.all([
        this.firstNameInput.isEnabled().catch(() => false),
        this.lastNameInput.isEnabled().catch(() => false),
        this.emailInput.isEnabled().catch(() => false),
        this.phoneNumberInput.isEnabled().catch(() => false),
      ]);

      return enabledChecks.every(Boolean);
    } catch {
      return false;
    }
  }

  async fillAllMandatoryFields(): Promise<void> {
    const title = generateTitle();
    const firstName = generateFirstName();
    const lastName = generateLastName();
    const email = generateEmail();
    const phoneCountry = generatePhoneCountryCode();
    const phone = generatePhoneNumber();
    const adults = generateAdultsCount();
    const children = generateChildrenCount();

    await this.titleSelect.selectOption({ label: title });
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneCountryCodeSelect.selectOption({ value: phoneCountry });
    await this.phoneNumberInput.fill(phone);
    await this.adultsSelect.selectOption({ label: adults });
    await this.childrenSelect.selectOption({ label: children });
  }

  async fillField(fieldName: string, value: string): Promise<void> {
    switch (fieldName) {
      case 'title':
        await this.titleSelect.selectOption({ label: value });
        break;
      case 'firstName':
        await this.firstNameInput.fill(value);
        break;
      case 'lastName':
        await this.lastNameInput.fill(value);
        break;
      case 'email':
        await this.emailInput.fill(value);
        break;
      case 'phone':
        await this.phoneNumberInput.fill(value);
        break;
      case 'adults':
        await this.adultsSelect.selectOption({ label: value });
        break;
      case 'children':
        await this.childrenSelect.selectOption({ label: value });
        break;
      case 'comments':
        await this.additionalCommentsTextarea.fill(value);
        break;
      default:
        throw new Error(`Unknown field: ${fieldName}`);
    }
  }

  async clearField(fieldName: string): Promise<void> {
    switch (fieldName) {
      case 'firstName':
        await this.firstNameInput.clear();
        break;
      case 'lastName':
        await this.lastNameInput.clear();
        break;
      case 'email':
        await this.emailInput.clear();
        break;
      case 'phone':
        await this.phoneNumberInput.clear();
        break;
      case 'comments':
        await this.additionalCommentsTextarea.clear();
        break;
    }
  }

  async setNewsletterSubscription(subscribe: boolean): Promise<void> {
    const isChecked = await this.newsLetterCheckbox.isChecked();
    if (subscribe && !isChecked) {
      await this.newsLetterCheckbox.check();
    } else if (!subscribe && isChecked) {
      await this.newsLetterCheckbox.uncheck();
    }
  }

  async fillAdditionalComments(comments: string): Promise<void> {
    await this.additionalCommentsTextarea.fill(comments);
  }

  async submitEnquiry(): Promise<void> {
    await this.enquireButton.click();
  }


  async validateMandatoryFieldsErrorMessage(expectedMessages: Record<string, string>) {
    const fields = Object.keys(expectedMessages);
    await Promise.all(fields.map(async field => {
      const err = await this.getErrorMessageForField(field);
      expect(err).not.toBeNull();
      expect((err || '').trim().length).toBeGreaterThan(0);
      expect((err || '')).toContain(expectedMessages[field]);
    }));
  }

  async getErrorMessageForField(fieldName: string): Promise<string | null> {
    const errorMessages = await this.page.locator(`[data-valmsg-for="${fieldName}"]`).textContent().catch(() => null);
    return errorMessages;
  }

  async isSubmissionSuccessful(): Promise<boolean> {
    // Pode ser um redirect ou uma mensagem de sucesso
    const successMessage = await this.page.locator('text=/Thank you|Success|confirmation/i').isVisible({ timeout: 5000 }).catch(() => false);
    const urlChanged = !this.page.url().includes('/enquire');

    return successMessage || urlChanged;
  }

  async getFieldValue(fieldName: string): Promise<string> {
    switch (fieldName) {
      case 'firstName':
        return await this.firstNameInput.inputValue();
      case 'lastName':
        return await this.lastNameInput.inputValue();
      case 'email':
        return await this.emailInput.inputValue();
      case 'phone':
        return await this.phoneNumberInput.inputValue();
      default:
        return '';
    }
  }
}