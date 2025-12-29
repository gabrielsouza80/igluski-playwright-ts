import { log } from 'console';
import { test, expect } from '../support/baseTest';
import enquireData from './fixtures/enquire.json';

test.describe('Enquire Page', () => {
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies();
    await pm.onEnquirePage().navigateAndAcceptCookies();
    await pm.onEnquirePage().isPageLoaded();

  });


});
