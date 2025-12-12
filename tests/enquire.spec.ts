import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchPage } from '../pages/search.page';
import { EnquirePage } from '../pages/enquire.page';

test.describe('Enquire Page', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();    
    const enquirePage = new EnquirePage(page);
    await enquirePage.navigate(); 
  });


  test('Submit enquire', async ({ page }) => {
    const enquirePage = new EnquirePage(page);
    await enquirePage.fillAllMandatoryFields()
    await enquirePage.scrollDown()
    // await enquirePage.submitEnquiry() #TODO: leave this commented for now
  });

  test('Validate blank Mandatory fields error', async ({ page }) => {
    const enquirePage = new EnquirePage(page);
    await enquirePage.submitEnquiry();
    await enquirePage.validateMandatoryFieldsErrorMessage();
  });

});
