import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Iglu Ski Homepage - 10 Test Cases', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.navigateToHome();
    });

    /**
     * TC-001: Verificar carregamento correto da página home e elementos visuais
     */
    test('TC-001: Should load homepage correctly with all main elements', async ({
        page,
    }) => {
        // Verificar URL
        expect(page.url()).toContain(homePage.HOME_URL);

        // Verificar logo
        const logoVisible = await homePage.verifyElementVisible(homePage.logoLink);
        expect(logoVisible).toBeTruthy();

        // Verificar menu de navegação
        const searchMenuVisible = await homePage.verifyElementVisible(
            homePage.searchMenu
        );
        expect(searchMenuVisible).toBeTruthy();

        // Verificar página carregada completamente
        await expect(page.locator('text=WELCOME TO THE HOME OF SKI HOLIDAYS')).toBeVisible();
    });

    /**
     * TC-002: Testar navegação do menu principal (7 menus)
     */
    test('TC-002: Should navigate through all main menu items', async () => {
        // Test SEARCH menu
        await homePage.clickSearchMenu();
        expect(await homePage.verifyPageLoaded(homePage.SKI_HOLIDAYS_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test SKI HOLIDAYS menu
        await homePage.clickSkiHolidaysMenu();
        expect(await homePage.verifyPageLoaded(homePage.SKI_HOLIDAYS_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test SKI DESTINATIONS menu
        await homePage.clickSkiDestinationsMenu();
        expect(await homePage.verifyPageLoaded(homePage.SKI_DESTINATIONS_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test SKI DEALS menu
        await homePage.clickSkiDealsMenu();
        expect(await homePage.verifyPageLoaded(homePage.SKI_DEALS_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test SNOW REPORTS menu
        await homePage.clickSnowReportsMenu();
        expect(await homePage.verifyPageLoaded(homePage.SNOW_REPORTS_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test SKI BLOG & GUIDES menu
        await homePage.clickSkiBlogMenu();
        expect(await homePage.verifyPageLoaded(homePage.SKI_BLOG_URL)).toBeTruthy();
        await homePage.navigateToHome();

        // Test ENQUIRE menu
        await homePage.clickEnquireMenu();
        expect(await homePage.verifyPageLoaded(homePage.ENQUIRE_URL)).toBeTruthy();
    });

     /**
   * TC-003: Testar carrossel de promoções (Previous/Next buttons)
   */
  test('TC-003: Should navigate carousel correctly with Next button', async ({
    page,
  }) => {
    // Verificar que carrossel existe
    const carouselIndicators = await homePage.getCarouselIndicatorCount();
    expect(carouselIndicators).toBeGreaterThan(0);

    // Obter texto inicial do carrossel
    const initialText = await page.locator('[class*="carousel"] text').first().textContent();
    expect(initialText).toBeTruthy();

    // Clicar no botão Next
    await homePage.clickCarouselNext();

    // Verificar que o conteúdo mudou
    const updatedText = await page.locator('[class*="carousel"] text').first().textContent();
    expect(updatedText).not.toEqual(initialText);
  });

  /**
   * TC-004: Testar formulário de busca com filtros completos
   */
  test('TC-004: Should search ski holidays with multiple filters', async ({ page }) => {
    // Preencher formulário de busca
    await homePage.fillSearchForm(
      'France',
      'FR', // France option value
      '1602', // Alpe d'Huez resort code
      '3', // 3 Adults
      '2' // 2 Children
    );

    // Clicar no botão Search
    await homePage.clickSearchButton();

    // Verificar que fomos redirecionados para página de resultados
    expect(page.url()).toContain('/ski-holidays?');
    expect(page.url()).toContain('country=FR');
    expect(page.url()).toContain('ad=3');
    expect(page.url()).toContain('ch=2');

    // Verificar que resultados foram encontrados
    const resultsText = await homePage.getSearchResults();
    expect(resultsText).toContain('properties found');

    // Verificar que há pelo menos 1 resultado
    await expect(page.locator('text=properties found')).toBeVisible();
  });

  /**
   * TC-005: Testar botões CTA (Call To Action)
   */
  test('TC-005: Should navigate to correct pages with CTA buttons', async ({
    page,
  }) => {
    // Test GET IN TOUCH button
    await homePage.clickGetInTouch();
    expect(await homePage.verifyPageLoaded(homePage.ENQUIRE_URL)).toBeTruthy();
    expect(await homePage.verifyPageTitle('Enquire')).toBeTruthy();
    await homePage.navigateToHome();

    // Test FIND OUT MORE button
    await homePage.clickFindOutMore();
    expect(page.url()).toContain('/about');
    await homePage.navigateToHome();

    // Test SIGN ME UP button
    await homePage.clickSignMeUp();
    expect(page.url()).toContain('signup.igluski.com');
  });

  /**
   * TC-006: Testar links de cards de destinos
   */
  test('TC-006: Should navigate to destination pages with destination cards', async ({
    page,
  }) => {
    // Test FRANCE card
    await homePage.clickFranceCard();
    expect(await homePage.verifyPageLoaded(homePage.FRANCE_RESORTS_URL)).toBeTruthy();
    await expect(page.locator('text=FRANCE SKI HOLIDAYS')).toBeVisible();
    await homePage.navigateToHome();

    // Test AUSTRIA card
    await homePage.clickAustriaCard();
    expect(await homePage.verifyPageLoaded(homePage.AUSTRIA_RESORTS_URL)).toBeTruthy();
    await expect(page.locator('text=AUSTRIA SKI')).toBeVisible();
    await homePage.navigateToHome();

    // Test ITALY card
    await homePage.clickItalyCard();
    expect(page.url()).toContain('/ski-resorts/italy');
    await homePage.navigateToHome();

    // Test ANDORRA card
    await homePage.clickAndorraCard();
    expect(page.url()).toContain('/ski-resorts/andorra');
  });

  /**
   * TC-007: Testar responsividade da página e elementos visuais
   */
  test('TC-007: Should display responsive layout with all elements visible', async ({
    page,
  }) => {
    // Verificar que elementos principais estão visíveis
    const mainElements = [
      homePage.logoLink,
      homePage.searchMenu,
      homePage.skiHolidaysMenu,
      homePage.carouselNextButton,
      homePage.getInTouchButton,
      homePage.signMeUpButton,
    ];

    for (const element of mainElements) {
      const isVisible = await homePage.verifyElementVisible(element);
      expect(isVisible).toBeTruthy();
    }

    // Verificar viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(0);
    expect(viewport?.height).toBeGreaterThan(0);
  });

  /**
   * TC-008: Testar links do footer
   */
  test('TC-008: Should navigate correctly with footer links', async ({
    page,
  }) => {
    // Scroll para o footer
    await homePage.scrollToElement(homePage.footerFranceLink);

    // Test FRANCE footer link
    await homePage.clickFooterFranceLink();
    expect(await homePage.verifyPageLoaded(homePage.FRANCE_RESORTS_URL)).toBeTruthy();
    await homePage.navigateToHome();

    // Scroll para o footer novamente
    await homePage.scrollToElement(homePage.skiChaletsLink);

    // Test SKI CHALETS link
    await homePage.clickSkiChaletsLink();
    expect(await homePage.verifyPageLoaded(homePage.SKI_CHALETS_URL)).toBeTruthy();
  });

  /**
   * TC-009: Testar validação dos campos de entrada
   */
  test('TC-009: Should validate search form input fields correctly', async ({
    page,
  }) => {
    // Verificar que dropdowns têm múltiplas opções
    const adultsOptions = await homePage.adultsSelect.locator('option').count();
    expect(adultsOptions).toBeGreaterThan(5); // Pelo menos 5+ opções

    const childrenOptions = await homePage.childrenSelect.locator('option').count();
    expect(childrenOptions).toBeGreaterThan(3); // Pelo menos 3+ opções

    // Selecionar diferentes valores
    await homePage.adultsSelect.selectOption('4');
    const adultsValue = await homePage.adultsSelect.inputValue();
    expect(adultsValue).toContain('4');

    await homePage.childrenSelect.selectOption('2');
    const childrenValue = await homePage.childrenSelect.inputValue();
    expect(childrenValue).toContain('2');

    // Verificar input de propriedades aceita texto
    await homePage.searchPropertiesInput.fill('Test Property');
    const inputValue = await homePage.searchPropertiesInput.inputValue();
    expect(inputValue).toBe('Test Property');
  });

  /**
   * TC-010: Testar links internos (categorias de holidays)
   */
  test('TC-010: Should navigate to internal category pages correctly', async ({
    page,
  }) => {
    // Test SKI CHALETS link
    await homePage.clickSkiChaletsLink();
    expect(await homePage.verifyPageLoaded(homePage.SKI_CHALETS_URL)).toBeTruthy();
    await expect(page.locator('text=SKI CHALET HOLIDAYS')).toBeVisible();

    // Verificar que resultados foram encontrados
    await expect(page.locator('text=results')).toBeVisible();
  });

  /**
   * TC-001.1: Teste adicional - Verificar que página tem título correto
   */
  test('TC-001.1: Should have correct page title', async ({ page }) => {
    expect(await homePage.verifyPageTitle('Home of Ski Holidays')).toBeTruthy();
  });

  /**
   * TC-002.1: Teste adicional - Verificar que logo leva à home
   */
  test('TC-002.1: Should navigate to home when clicking logo', async ({ page }) => {
    // Navegar para outra página
    await homePage.clickSearchMenu();
    expect(page.url()).not.toContain(homePage.HOME_URL);

    // Clicar no logo para voltar
    await homePage.logoLink.click();
    await page.waitForURL(homePage.HOME_URL);
    expect(await homePage.verifyPageLoaded(homePage.HOME_URL)).toBeTruthy();
  });
});