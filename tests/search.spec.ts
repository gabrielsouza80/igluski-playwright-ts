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
    // 1. Navegar para a página de resultados
    const home = new HomePage(page);
    const search = new SearchPage(page);
    await home.searchForCountry('France');
    await home.clickOnSearchButton()
    const resultsText = await search.hasSearchResults();
    expect(resultsText).toBeTruthy();
    // 2. Validar que há pelo menos um resultado

    const resultsCount = await search.getResultsCount();
    console.log(`✓ Found ${resultsCount} ski holiday packages`);

    // 3. Clicar no botão "Book Online" do primeiro resultado
    await search.clickFirstBookOnline();
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Clicked Book Online on first result');

    // 4. Esperar pela página de detalhes/booking
    await page.waitForURL(/book|booking|details/i, { timeout: 10000 });

    const bookingPage = new BookingDetailsPage(page);

    // 5. Preencher dados do hóspede
    await bookingPage.fillGuestDetails(
      'João',
      'Silva',
      'joao.silva@example.com',
      '919999999'
    );
    console.log('✓ Filled guest details');

    // 6. Aceitar termos e condições
    await bookingPage.acceptTermsAndConditions();
    console.log('✓ Accepted terms and conditions');

    // 7. Proceder para pagamento
    await bookingPage.proceedToPayment();
    await page.waitForLoadState('networkidle');

    console.log('✓ Clicked proceed to payment');

    // 8. Validar que chegámos à página de pagamento
    const paymentPage = new PaymentPage(page);
    const isOnPaymentPage = await paymentPage.isPaymentPageDisplayed();
    expect(isOnPaymentPage).toBe(true);

    console.log('✓ Successfully reached payment page');

    // 9. Extrair resumo do pedido
    const orderSummary = await paymentPage.getOrderSummary();
    console.log(`Order Summary: ${orderSummary}`);
  });
});
