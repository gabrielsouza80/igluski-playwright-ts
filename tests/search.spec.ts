import { test, expect } from '../support/baseTest';

test.describe('Search Page', () => {
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies(); 
  });


  test('End-2-end test: Search and book holiday', async ({ page, pm }) => {
    await pm.onSearchPage().searchForCountry('France');
    const resultsText = await pm.onSearchPage().hasSearchResults();
    expect(resultsText).toBeTruthy();
  });

  test('should book first ski holiday package and reach payment page', async ({ page, pm }) => {
    await test.step('Home Page - Searching for Country', async () => {
      await pm.onSearchPage().searchForCountry('France');
      await pm.onSearchPage().clickOnSearchButton()
    });
    
    await test.step('Search Page - Search Results Validated', async () => {
      const resultsText = await pm.onSearchPage().hasSearchResults();
      expect(resultsText).toBeTruthy();
      
    });

    await test.step('Search Page - Checking the amount of results', async () => {
      const resultsCount = await pm.onSearchPage().getResultsCount();
      console.log(`Found ${resultsCount} ski holiday packages`);
      
    });

    await test.step('Search Page - Clicked Book Online on first result', async () => {
      await pm.onSearchPage().clickFirstBookOnline();
      await page.waitForLoadState('networkidle');
      console.log('Clicked Book Online on first result');
      
    });

    await test.step('Accomodation page loaded', async () => {
      await page.waitForURL(/book|booking|details/i, { timeout: 10000 });
    });

    await test.step('Accomodation Page - Confirm Number of People', async () => {
      await pm.onAccommodationPage().clickConfirmNumberOfPeople()
    });
    
    await test.step('Accomodation Page - Add Room', async () => {
      await pm.onAccommodationPage().clickAddRoom()
    });

    await test.step('Accomodation Page - Set Room Occupancy', async () => {
      await pm.onAccommodationPage().allocateRoomOccupancy()
    });

    await test.step('Accomodation Page - Continue to Travel Options', async () => {
      await pm.onAccommodationPage().continueToTravelOptions()
    });

    await test.step('Travel Page - Continue to Extras page', async () => {
      await pm.onTravelOptionsPage().isTravelPageLoaded();
      await pm.onTravelOptionsPage().continueToExtras();
    });

    await test.step('Extra Page - Continue to Summary page', async () => {
      await pm.onExtrasPage().isExtrasPageLoaded()
      await pm.onExtrasPage().continueToSummary();
    });

    await test.step('Summary Page - Continue to People page', async () => {
      await pm.onSummaryPage().isSummaryPageLoaded()
      await pm.onSummaryPage().clickBookOnline()
    });

    await test.step('Filled People Page - Mandatory fields', async () => {
      await pm.onPeopleAndContactDetailsPage().fillMultiplePassengers();
    });

    await test.step('People Page - Continue to Book page', async () => {
      await pm.onPeopleAndContactDetailsPage().clickContinueToBooking()
    });

    
    // 6. Accept terms and conditions
    await test.step('Booking Page - Accept terms and conditions - Continue to Payment page', async () => {
      pm.onBookingDetailsPage().acceptTermsAndConditions();
      await pm.onBookingDetailsPage().proceedToPayment();
    });

    await test.step('Payment Page - Successfully reached payment page', async () => {
      const isOnPaymentPage = await pm.onPaymentPage().isPaymentPageDisplayed();
      expect(isOnPaymentPage).toBe(true);
    });


  });
});
