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
    await pm.onEnquirePage().validateMandatoryFieldsErrorMessage();
  });

  test('Validate enquire intro text', async ({ page, pm }) => {
    const expected = enquireData.introText;

    // Use the page body to look for the text, allowing for spacing/formatting differences
    await expect(page.locator('body')).toContainText(expected, { timeout: 5000 });
  });

  test('Validate invalid email format shows error', async ({ page, pm }) => {
    // Fill everything with valid data, then replace email with an invalid value
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('email', 'invalid-email');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('Email');
    expect(err).not.toBeNull();
    // Ensure the error message contains some text
    expect((err || '').trim().length).toBeGreaterThan(0);
  });

  test('Validate invalid phone format shows error', async ({ page, pm }) => {
    // Fill everything with valid data, then replace phone with an invalid value
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', 'abc-not-a-phone');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    // Ensure the error message contains some text
    expect((err || '').trim().length).toBeGreaterThan(0);
  });

  test('Validate invalid phone format - incomplete', async ({ page, pm }) => {
    // Fill everything with valid data, then replace phone with an invalid value
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', '123');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    // Ensure the error message contains some text
    expect((err || '').trim().length).toBeGreaterThan(0);
  });

    test('Validate invalid phone format - too many digits', async ({ page, pm }) => {
    // Fill everything with valid data, then replace phone with an invalid value
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('phone', '987987987987897987897987897897897987987987');

    await pm.onEnquirePage().submitEnquiry();

    const err = await pm.onEnquirePage().getErrorMessageForField('PhoneNumber');
    expect(err).not.toBeNull();
    // Ensure the error message contains some text
    expect((err || '').trim().length).toBeGreaterThan(0);
  });
  
  test('Validate first and last name only accept letters', async ({ page, pm }) => {
    // Fill with valid data then inject invalid characters into names
    await pm.onEnquirePage().fillAllMandatoryFields();
    await pm.onEnquirePage().fillField('firstName', 'John123');
    await pm.onEnquirePage().fillField('lastName', 'Doe!@#');

    await pm.onEnquirePage().submitEnquiry();

    const errFirst = await pm.onEnquirePage().getErrorMessageForField('FirstName');
    const errLast = await pm.onEnquirePage().getErrorMessageForField('LastName');

    expect(errFirst).not.toBeNull();
    expect(errLast).not.toBeNull();
    expect((errFirst || '').trim().length).toBeGreaterThan(0);
    expect((errLast || '').trim().length).toBeGreaterThan(0);
  });
});
