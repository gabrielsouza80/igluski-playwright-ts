import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Home Page', () => {

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();
    await home.closePromoIfVisible();
  });

  // ===========================
  // 1️⃣ Teste: Validar header
  // ===========================
  test('Validar elementos principais do header', async ({ page }) => {
    const home = new HomePage(page);

    await page.waitForTimeout(50000000);
    await expect(home.logoLink).toBeVisible();
    await expect(home.buyLink).toBeVisible();
    await expect(home.rentLink).toBeVisible();
    await expect(home.servicesLink).toBeVisible();
  });

  // ===========================
  // 2️⃣ Teste: Validar footer
  // ===========================
  test('Validar links do footer', async ({ page }) => {
    const home = new HomePage(page);

    await expect(home.footerFranceLink).toBeVisible();
    await expect(home.skiChaletsLink).toBeVisible();
  });

  // ===========================
  // 3️⃣ Teste: Pesquisa simples
  // ===========================
  test('Pesquisar por "Lisbon" e validar resultados', async ({ page }) => {
    const home = new HomePage(page);

    await home.searchFor('Lisbon');

    const resultsText = await home.getSearchResults();
    expect(resultsText).toContain('properties found');
  });

  // ===========================
  // 4️⃣ Teste: Fechar mensagem promo
  // ===========================
  test('Fechar mensagem promocional se visível', async ({ page }) => {
    const home = new HomePage(page);

    await home.closePromoIfVisible();

    const visible = await home.promoMessage.isVisible().catch(() => false);
    expect(visible).toBeFalsy();
  });

  // ===========================
  // 5️⃣ Teste: Navegar para BUY
  // ===========================
  test('Clicar no link Buy e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.buyLink.click();

    const result = await home.verifyPageLoaded('/buy');
    expect(result).toBe(true);
  });

  // ===========================
  // 6️⃣ Teste: Navegar para Rent
  // ===========================
  test('Clicar no link Rent e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.rentLink.click();

    const result = await home.verifyPageLoaded('/rent');
    expect(result).toBe(true);
  });

  // ===========================
  // 7️⃣ Teste: Navegar About Us
  // ===========================
  test('Clicar em About Us e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.aboutUsLink.click();

    const result = await home.verifyPageLoaded('/about-us');
    expect(result).toBe(true);
  });

  // ===========================
  // 8️⃣ Teste: Validar campo de pesquisa
  // ===========================
  test('Validar que o input de pesquisa está visível', async ({ page }) => {
    const home = new HomePage(page);

    await expect(home.searchInput).toBeVisible();
  });

  // ===========================
  // 9️⃣ Teste: Digitação no campo de busca
  // ===========================
  test('Escrever no campo de busca e verificar que preencheu', async ({ page }) => {
    const home = new HomePage(page);

    await home.searchInput.fill('Porto');

    await expect(home.searchInput).toHaveValue('Porto');
  });

  // ===========================
  // 🔟 Teste: Validar se resultados aparecem após pesquisa
  // ===========================
  test('Pesquisar e validar que os resultados aparecem', async ({ page }) => {
    const home = new HomePage(page);

    await home.searchFor('Coimbra');

    const results = await home.getSearchResults();

    expect(results.length).toBeGreaterThan(0);
  });

});
