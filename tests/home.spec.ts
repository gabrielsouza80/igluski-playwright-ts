import { test, expect } from '@playwright/test';
import { PageManager } from '../pages/utils/PageManager';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH: executado antes de cada teste — navega e aceita cookies
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().navigate(); // Navega e aceita cookies via PageManager
  });


  // TESTE 1 — Validar Logo da Iglu Ski: verifica redirecionamento ao clicar na logo
  test('Validar Logo da Iglu Ski', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateLogo();
  });

  // TESTE 2 — Validar Menu + Submenus: valida menus, sublinks e <h1>; resume duplicados
  test('Validar Menu e SubMenu da Navegação Principal', async ({ page }) => {
    // ✅ Aumenta timeout global para este teste (5 minutos)
    test.setTimeout(300000);

    const pm = new PageManager(page);

    // ✅ Valida todos os sublinks (ilimitado)
    await pm.onHomePage().validateMenuAndSubMenuNavigation();

  });

  test('Clicar no menu e opcionalmente no submenu', async ({ page }) => {
    const pm = new PageManager(page);

    // ✅ Apenas clicar no menu principal:
    await pm.onHomePage().clickMenu("Ski Holidays");

    // ✅ Clicar no menu e depois num submenu:
    await pm.onHomePage().clickMenu("Ski Holidays", "Family Ski Holidays");
  });

});
