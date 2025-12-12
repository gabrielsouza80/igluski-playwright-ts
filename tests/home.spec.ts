import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { Actions } from '../pages/utils/Actions';

/**
 * ================================================================
 *  Test Suite: Home Page
 * ================================================================
 */

test.describe('Home Page', () => {

  /**
   * ================================================================
   *  BEFORE EACH
   *  - Executado antes de cada teste
   *  - Navega para a Home
   *  - Aceita cookies automaticamente (função já implementada na Page)
   * ================================================================
   */
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate(); // Navega e aceita cookies
  });


  /**
   * ================================================================
   * TESTE 1 — Validar Logo da Iglu Ski
   * ================================================================
   * Este teste verifica se o clique na logo redireciona para a página inicial.
   */
  test('Validar Logo da Iglu Ski', async ({ page }) => {
    const home = new HomePage(page);
    await home.validateLogo();
  });

  /**
   * ================================================================
   * TESTE 2 — Validar Menu + Submenus com navegação
   * ================================================================
   * Este teste:
   * - Valida todos os menus principais e seus sublinks.
   * - Verifica se cada página tem um <h1> coerente com o nome do menu/submenu.
   * - Loga duplicados mostrando com quem está duplicado (Label + URL).
   * - Aceita singular/plural e palavras extra no título.
   * - No final, imprime um resumo com todos os duplicados agrupados por menu.
   *
   * Ajustes importantes:
   * - Timeout aumentado para evitar falhas em menus com muitos sublinks.
   * - Durante debug, pode limitar sublinks por menu (ex.: 10) para acelerar.
   */
  test('Validar Menu e SubMenu da Navegação Principal', async ({ page }) => {
    // ✅ Aumenta timeout global para este teste (5 minutos)
    test.setTimeout(300000);

    const home = new HomePage(page);

    // ✅ Valida todos os sublinks (ilimitado)
    await home.validateMenuAndSubMenuNavigation();

  });

  test('Clicar no menu e opcionalmente no submenu', async ({ page }) => {
    const actions = new Actions(page);

    // ✅ Apenas clicar no menu principal:
    await actions.clickMenu("Ski Holidays");

    // ✅ Clicar no menu e depois num submenu:
    await actions.clickMenu("Ski Holidays", "Family Ski Holidays");
  });


  /**
   * ================================================================
   *  TESTE 3 — Validar Footer
   *  - Apenas verifica se links principais aparecem
   * ================================================================
   */
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

