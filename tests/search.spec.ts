import { test, expect } from '../support/baseTest';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page, pm }) => {
    await pm.onHomePage().navigateAndAcceptCookies(); 
  });


  test('End-2-end test: Search and book holiday', async ({ page, pm }) => {
    await pm.onHomePage().searchForCountry('France');
    const resultsText = await pm.onSearchPage().hasSearchResults();
    expect(resultsText).toBeTruthy();
  });

  test('should book first ski holiday package and reach payment page', async ({ page, pm }) => {
    await pm.onHomePage().searchForCountry('France');
    await pm.onHomePage().clickOnSearchButton()
    const resultsText = await pm.onSearchPage().hasSearchResults();
    expect(resultsText).toBeTruthy();

    const resultsCount = await pm.onSearchPage().getResultsCount();
    console.log(`✓ Found ${resultsCount} ski holiday packages`);

    await pm.onSearchPage().clickFirstBookOnline();
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Clicked Book Online on first result');

    await page.waitForURL(/book|booking|details/i, { timeout: 10000 });

    await test.step('✓ Clicked Accomodation - Confirm Number of People', async () => {
      await pm.onAccommodationPage().clickConfirmNumberOfPeople()
    });
    
    await test.step('✓ ✓ Clicked Accomodation - Add Room', async () => {
      await pm.onAccommodationPage().clickAddRoom()
    });
    await pm.onAccommodationPage().allocateRoomOccupancy()

    await pm.onAccommodationPage().continueToTravelOptions()

    console.log('✓ Clicked Accomodation - Continue to Travel page');

    await pm.onTravelOptionsPage().isTravelPageLoaded();

    await pm.onTravelOptionsPage().continueToExtras();

    console.log('✓ Clicked Travel - Continue to Extras page');

    await pm.onExtrasPage().isExtrasPageLoaded()
    await pm.onExtrasPage().continueToSummary();

    console.log('✓ Clicked Extras - Continue to Summary page');


    await pm.onSummaryPage().isSummaryPageLoaded()
    await pm.onSummaryPage().clickBookOnline()

    console.log('✓ Clicked Summary - Continue to People page');


    await pm.onPeopleAndContactDetailsPage().fillMultiplePassengers();
    console.log('✓ Filled People - Mandatory fields');

    await pm.onPeopleAndContactDetailsPage().clickContinueToBooking()
    console.log('✓ Clicked People - Continue to Book page');


    // 6. Accept terms and conditions
    await test.step('6. Accept terms and conditions - Click People - Continue to Book page', async () => {
      pm.onBookingDetailsPage().acceptTermsAndConditions();
    // console.log('✓ Accepted terms and conditions');
    });
    // 7. Proceed to payment
    await pm.onBookingDetailsPage().proceedToPayment();

    console.log('✓ Clicked proceed to payment');

    // 8. Validate that we reached the payment page
    const isOnPaymentPage = await pm.onPaymentPage().isPaymentPageDisplayed();
    expect(isOnPaymentPage).toBe(true);

    console.log('✓ Successfully reached payment page');

  });
});
