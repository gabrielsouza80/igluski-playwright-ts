import { test, expect } from '@playwright/test';
import { PageManager } from '../pages/utils/PageManager';

// ================================================================
// Test Suite: Home Page
// ================================================================

test.describe('Home Page', () => {

  // BEFORE EACH: Executed before each test — browse and accept cookies
  test.beforeEach(async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().navigate(); // Navega e aceita cookies via PageManager
  });


// TC 1 — Validate Iglu Ski Logo: checks for redirection when clicking on the logo
  test('Validar Logo da Iglu Ski', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateLogo();
  });

// TC 2 — Validate Menu + Submenus: validates menus, sublinks, and <h1>; resumes duplicates
  test('Validar Menu de Navegação Principal', async ({ page }) => {
    // ✅ Aumenta timeout global para este teste (5 minutos)
    test.setTimeout(300000);

    const pm = new PageManager(page);

    // ✅ Valida todos os sublinks (ilimitado)
    await pm.onHomePage().validateMenuAndSubMenuNavigation();

  });

  test('Clicar no menu e opcionalmente no submenu', async ({ page }) => {
    const pm = new PageManager(page);

    // ✅ Just click on the main menu:
    await pm.onHomePage().clickMenu("Ski Holidays");

    // ✅ Click on the menu and then on a submenu:
    await pm.onHomePage().clickMenu("Ski Holidays", "Family Ski Holidays");
  });

// TC 3 — Validate Contact Information in Header: checks phone number and email address
  test('Validar Informações de Contato no Header', async ({ page }) => {
    const pm = new PageManager(page);

    await pm.onHomePage().validateHeaderContactInfo();

  });

//TC 4 — Validate "Recently Viewed" Button
  test('Validar Botão "Recently Viewed"', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateRecentlyViewedButton();
  });

//TC 16 — Validate carousel of promotions and country banners on the homepage"
  test.skip('Validar Carrossel de Banners (Países)"', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.onHomePage().validateRecentlyViewedButton();
  });

//TC 20 — Validate Footer Links
  test('Validar Links do Footer"', async ({ page }) => {
// ✅ Increase the global timeout for this test (5 minutes)
    test.setTimeout(300000);
    const pm = new PageManager(page);
    await pm.onHomePage().validateFooterItems();
  });

});
