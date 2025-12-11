import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Home Page', () => {
  // ===========================
  // Antes de cada teste: Navegar e aceitar cookies
  // ===========================
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate(); // Isso também vai aceitar os cookies
  });

  // ===========================
  // 1️⃣ Teste: Validar header
  // ===========================
  test('Validar elementos principais do header', async ({ page }) => {
    const home = new HomePage(page);

    await expect(home.logoLink).toBeVisible();
    await expect(home.skiHolidaysLink).toBeVisible();
    await expect(home.skiDestinationsLink).toBeVisible();
    await expect(home.skiDealsLink).toBeVisible();
  });

  // ===========================
  // 2️⃣ Teste: Validar footer
  // ===========================
  test('Validar links do footer', async ({ page }) => {
    const home = new HomePage(page);

    await expect(home.footerFranceLink).toBeVisible();
    await expect(home.footerSkiChaletsLink).toBeVisible();
  });

  // ===========================
  // 3️⃣ Teste: Pesquisa simples
  // ===========================
  test('Pesquisar por resort e validar resultados', async ({ page }) => {
    const home = new HomePage(page);

    await home.searchFor('Val Thorens');

    const resultsText = await home.getSearchResults();
    expect(resultsText).toBeTruthy();
  });

  // ===========================
  // 4️⃣ Teste: Validar campo de pesquisa
  // ===========================
  test('Validar que o input de pesquisa está visível', async ({ page }) => {
    const home = new HomePage(page);
    
    await expect(home.resortsSearchInput).toBeVisible();
  });

  // ===========================
  // 5️⃣ Teste: Digitação no campo de busca
  // ===========================
  test('Escrever no campo de busca e verificar que preencheu', async ({ page }) => {
    const home = new HomePage(page);

    await home.resortsSearchInput.fill('Porto');

    await expect(home.resortsSearchInput).toHaveValue('Porto');
  });

  // ===========================
  // 6️⃣ Teste: Navegar para Ski Holidays
  // ===========================
  test('Clicar no link Ski Holidays e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.skiHolidaysLink.click();

    const result = await home.verifyPageLoaded('/ski-holidays');
    expect(result).toBe(true);
  });

  // ===========================
  // 7️⃣ Teste: Navegar para Ski Resorts
  // ===========================
  test('Clicar no link Ski Resorts e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.skiDestinationsLink.click();

    const result = await home.verifyPageLoaded('/ski-resorts');
    expect(result).toBe(true);
  });

  // ===========================
  // 8️⃣ Teste: Navegar para About
  // ===========================
  test('Clicar em About e validar URL', async ({ page }) => {
    const home = new HomePage(page);

    await home.aboutUsLink.click();

    const result = await home.verifyPageLoaded('/about');
    expect(result).toBe(true);
  });

});
