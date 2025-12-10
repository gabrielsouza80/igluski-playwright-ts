import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { SearchPage } from '../pages/search.page';
import { BookingDetailsPage } from '../pages/bookingDetails.page';
import { PaymentPage } from '../pages/payment.page';

test.describe('Home Page', () => {
  // ===========================
  // Antes de cada teste: Navegar e aceitar cookies
  // ===========================
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate(); // Isso também vai aceitar os cookies
  });


  test('End-2-end test: Search and book holiday', async ({ page }) => {
    const home = new HomePage(page);
    const search = new SearchPage(page);
    await home.searchForCountry('France');
    await home.clickOnSearchButton()
    const resultsText = await search.hasSearchResults();
    expect(resultsText).toBeTruthy();
  });

  test('should book first ski holiday package and reach payment page', async ({ page }) => {
    // 1. Navigate to search page
    const home = new HomePage(page);
    const search = new SearchPage(page);
    await home.searchForCountry('France');
    await home.clickOnSearchButton()
    const resultsText = await search.hasSearchResults();
    expect(resultsText).toBeTruthy();

    // 2. Validate that there is at least one result

    const resultsCount = await search.getResultsCount();
    console.log(`✓ Found ${resultsCount} ski holiday packages`);

    // 3. Click on the "Book Online" button of the first result
    await search.clickFirstBookOnline();
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Clicked Book Online on first result');

    // 4. Wait for the booking details page
    await page.waitForURL(/book|booking|details/i, { timeout: 10000 });

    const bookingPage = new BookingDetailsPage(page);

    // 5. Fill guest details
    await bookingPage.fillGuestDetails(
      'João',
      'Silva',
      'joao.silva@example.com',
      '919999999'
    );
    console.log('✓ Filled guest details');

    // 6. Accept terms and conditions
    await bookingPage.acceptTermsAndConditions();
    console.log('✓ Accepted terms and conditions');

    // 7. Proceed to payment
    await bookingPage.proceedToPayment();
    await page.waitForLoadState('networkidle');

    console.log('✓ Clicked proceed to payment');

    // 8. Validate that we reached the payment page
    const paymentPage = new PaymentPage(page);
    const isOnPaymentPage = await paymentPage.isPaymentPageDisplayed();
    expect(isOnPaymentPage).toBe(true);

    console.log('✓ Successfully reached payment page');

    // 9. Extract order summary
    const orderSummary = await paymentPage.getOrderSummary();
    console.log(`Order Summary: ${orderSummary}`);
  });
});
