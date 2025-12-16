import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchPage } from '../pages/search.page';
import { BookingDetailsPage } from '../pages/bookingDetails.page';
import { PeopleAndContactDetailsPage } from '../pages/people.page';
import { PaymentPage } from '../pages/payment.page';
import { AccommodationPage } from '../pages/accomodation.page';
import { ExtrasPage } from '../pages/extras.page';
import { TravelOptionsPage } from '../pages/travelOption.page';
import { SummaryPage } from '../pages/summary.page';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.navigateAndAcceptCookies(); 
  });


  test('End-2-end test: Search and book holiday', async ({ page }) => {
    const home = new HomePage(page);
    const search = new SearchPage(page);
    await home.searchForCountry('France');
    const resultsText = await search.hasSearchResults();
    expect(resultsText).toBeTruthy();
  });

  test('should book first ski holiday package and reach payment page', async ({ page }) => {
    const home = new HomePage(page);
    const search = new SearchPage(page);
    await home.searchForCountry('France');
    await home.clickOnSearchButton()
    const resultsText = await search.hasSearchResults();
    expect(resultsText).toBeTruthy();

    const resultsCount = await search.getResultsCount();
    console.log(`✓ Found ${resultsCount} ski holiday packages`);

    await search.clickFirstBookOnline();
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Clicked Book Online on first result');

    await page.waitForURL(/book|booking|details/i, { timeout: 10000 });

    const accomodation = new AccommodationPage(page);

    await accomodation.clickConfirmNumberOfPeople()
    console.log('✓ Clicked Accomodation - Confirm Number of People');
    
    await accomodation.clickAddRoom()
    console.log('✓ Clicked Accomodation - Add Room');
    
    await accomodation.allocateRoomOccupancy()

    await accomodation.continueToTravelOptions()

    console.log('✓ Clicked Accomodation - Continue to Travel page');

    const travelPage = new TravelOptionsPage(page);

    await travelPage.continueToExtras();

    console.log('✓ Clicked Travel - Continue to Extras page');

    const extrasPage = new ExtrasPage(page);
    await extrasPage.isExtrasPageLoaded()
    await extrasPage.continueToSummary();

    console.log('✓ Clicked Extras - Continue to Summary page');

    const summaryPage = new SummaryPage(page);

    await summaryPage.isSummaryPageLoaded()
    await summaryPage.clickBookOnline()

    console.log('✓ Clicked Summary - Continue to People page');

    const peoplePage = new PeopleAndContactDetailsPage(page);

    await peoplePage.fillMultiplePassengers();
    console.log('✓ Filled People - Mandatory fields');

    await peoplePage.clickContinueToBooking()
    console.log('✓ Clicked People - Continue to Book page');


    const bookingPage = new BookingDetailsPage(page);

    // 6. Accept terms and conditions
    await bookingPage.acceptErratas();
    await bookingPage.acceptTermsAndConditions();
    console.log('✓ Accepted terms and conditions');

    // 7. Proceed to payment
    await bookingPage.proceedToPayment();

    console.log('✓ Clicked proceed to payment');

    // 8. Validate that we reached the payment page
    const paymentPage = new PaymentPage(page);
    const isOnPaymentPage = await paymentPage.isPaymentPageDisplayed();
    expect(isOnPaymentPage).toBe(true);

    console.log('✓ Successfully reached payment page');

  });
});
