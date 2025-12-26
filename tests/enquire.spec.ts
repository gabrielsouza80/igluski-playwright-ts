import { log } from 'console';
import { test, expect } from '../support/baseTest';
import enquireData from './fixtures/enquire.json';

test.describe('Enquire Page', () => {
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies();
    await pm.onEnquirePage().navigateAndAcceptCookies();
    await pm.onEnquirePage().isPageLoaded();

  });


  test('Submit enquire', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields()
    await pm.onEnquirePage().scrollDown()
    // await enquirePage.submitEnquiry() #TODO: leave this commented for now
  });

  test('Validate blank Mandatory fields error', async ({ page, pm }) => {
    await pm.onEnquirePage().submitEnquiry();
    await pm.onEnquirePage().validateMandatoryFieldsErrorMessage({
      Email: enquireData.emptyEmailText,
      PhoneNumber: enquireData.emptyPhoneText,
      FirstName: enquireData.emptyFirstNameText,
      LastName: enquireData.emptyLastNameText
    });
  });

  test('Validate enquire intro text', async ({ page, pm }) => {

    await expect(page.locator('body')).toContainText(enquireData.introText, { timeout: 5000 });
  });

  test('Validate invalid email format shows error', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    const invalidEmail = Math.random().toString(36).substring(2, 7) + '@invalid';
    await pm.onEnquirePage().fillField('email', invalidEmail);

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('Email');
    expect(err).not.toBeNull();
    expect((err || '').trim().length).toBeGreaterThan(0);
    expect(err).toContain(enquireData.invalidEmailText);
  });

  test('Validate invalid email format - incomplete', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('email', 'incomplete@email');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('Email');
    expect(err).not.toBeNull();
    expect((err || '').trim().length).toBeGreaterThan(0);
    expect(err).toContain(enquireData.invalidEmailText);

  });

  test('Validate invalid phone format shows error', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', 'abc-not-a-phone');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    expect((err || '').trim().length).toBeGreaterThan(0);
    expect(err).toContain(enquireData.invalidPhoneText);
  });

  test('Validate invalid phone format - incomplete', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', '123');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    expect((err || '').trim().length).toBeGreaterThan(0);
    expect(err).toContain(enquireData.invalidPhoneText);
  });

    test('Validate invalid phone format - too many digits', async ({ page, pm }) => {
    const length = 20 + Math.floor(Math.random() * 31);
    const longNumber = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', longNumber);

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    expect((err || '').trim().length).toBeGreaterThan(0);
    expect(err).toContain(enquireData.invalidPhoneText);

  });
  
  test('Validate first and last name only accept letters', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('firstName', 'John123');
    await pm.onEnquirePage().fillField('lastName', 'Doe!@#');

    await pm.onEnquirePage().submitEnquiry();

    const fields = ['FirstName', 'LastName'];
    const errors = await Promise.all(fields.map(f => pm.onEnquirePage().getErrorMessageForField(f)));
    errors.forEach(err => {
      expect(err).not.toBeNull();
      expect((err || '').trim().length).toBeGreaterThan(0);
      expect(err).toContain(enquireData.invalidNameText);

    });
  });

  test('Validate mandatory fields reject only spaces', async ({ page, pm }) => {
    await pm.onEnquirePage().fillAllMandatoryFields();
    const spaces = '   ';
    const fieldNamesToFill = ['firstName', 'lastName', 'email', 'phone'];
    for (const name of fieldNamesToFill) {
      await pm.onEnquirePage().fillField(name, spaces);
    }

    await pm.onEnquirePage().submitEnquiry();

    const fieldNames = ['FirstName', 'LastName', 'Email', 'PhoneNumber'];
    const errors = await Promise.all(
      fieldNames.map(field => pm.onEnquirePage().getErrorMessageForField(field))
    );

    expect(errors).not.toBeNull();

  });
});
