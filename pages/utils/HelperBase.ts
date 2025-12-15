// HelperBase: classe base para Pages e Helpers.
// Fornece o objeto `page` do Playwright e utilitários comuns (logs, waits, cliques seguros).
// Contém ações e validações customizadas para a plataforma

import { Page, Locator, expect } from '@playwright/test';

export class HelperBase {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Log simples padronizado
  protected log(message: string): void {
    console.log(message);
  }

  // Aguarda até que um seletor ou Locator esteja visível
  protected async waitForVisible(target: string | Locator, timeout = 5000): Promise<boolean> {
    const locator = typeof target === 'string' ? this.page.locator(target) : target;
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Clique seguro em seletor ou Locator (aguarda visibilidade antes)
  protected async safeClick(target: string | Locator, timeout = 5000): Promise<void> {
    const locator = typeof target === 'string' ? this.page.locator(target) : target;
    await this.waitForVisible(locator, timeout).catch(() => null);
    await locator.click({ timeout }).catch(() => null);
  }

  // Tenta fechar o banner de cookies por diferentes seletores (específico do site)
  async acceptCookies() {
    try {
      // Tenta múltiplas formas de encontrar e clicar o botão
      const button = await this.page.locator('button:has-text("Accept Cookies & Close")').first();

      if (await button.isVisible({ timeout: 5000 })) {
        await button.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // Se não encontrou de uma forma, tenta de outras
      try {
        const altButton = await this.page.locator('button:has-text("Accept")').first();
        if (await altButton.isVisible({ timeout: 3000 })) {
          await altButton.click();
          await this.page.waitForTimeout(500);
        }
      } catch (e2) {
        // Cookie banner pode não existir ou já foi fechado
        console.log('Cookie banner não encontrado ou já foi fechado');
      }
    }
  }

  // validateRedirectButton: abre link em nova aba e valida URL (específico do site)
  async validateRedirectButton(button: Locator | null, expectedUrl: string): Promise<void> {

    // Se tiver locator, tenta extrair href
    let urlToOpen = expectedUrl;

    if (button) {
      const href = await button.getAttribute('href');
      urlToOpen = href && !href.startsWith("http")
        ? new URL(href, this.page.url()).toString()
        : (href || expectedUrl);
    }

    // Abre nova aba
    const newPage = await this.page.context().newPage();

    await newPage.goto(urlToOpen, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Validate URL
    await expect(newPage).toHaveURL(new RegExp(urlToOpen, 'i'));

    console.log(`✓ Validated: ${urlToOpen}`);

    await newPage.close();
  }

  // extractFullUrl: gera URL absoluta automaticamente (específico do site)
  async extractFullUrl(button: Locator): Promise<string | null> {

    const href = await button.getAttribute('href');
    if (!href) return null;

    return href.startsWith('http')
      ? href
      : new URL(href, this.page.url()).href;
  }

  // clickMenu: clica em menu principal e opcionalmente em submenu (específico da estrutura HTML do site)
  async clickMenu(menuName: string, subMenuName?: string): Promise<void> {
    console.log(`🔍 Iniciando processo para clicar no menu: "${menuName}"${subMenuName ? ` e submenu: "${subMenuName}"` : ''}`);

    console.log(`➡️ Localizando menu principal com texto: "${menuName}"`);
    const menuButton = this.page.locator(`li.menu-list__item > a.menu-list__item-link:has-text("${menuName}")`);

    const menuCount = await menuButton.count();
    console.log(`📊 Found ${menuCount} elements for menu "${menuName}"`);
    if (menuCount === 0) {
      console.error(`❌ Menu "${menuName}" not found.`);
      return;
    }

    if (!subMenuName) {
      console.log(`✅ Nenhum submenu informado. Clicando diretamente no menu "${menuName}"`);
      await menuButton.click();
      console.log(`✓ Clicou no menu: ${menuName}`);
    } else {
      console.log(`➡️ Submenu informado: "${subMenuName}". Preparando para abrir submenu...`);
      await menuButton.hover();
      console.log(`⏳ Waiting 500ms to ensure submenu loads`);
      await this.page.waitForTimeout(500);

      console.log(`➡️ Localizando submenu com texto: "${subMenuName}"`);
      const subMenuLink = this.page.locator(`.submenu-list__block-item a:has-text("${subMenuName}")`);

      const subMenuCount = await subMenuLink.count();
      console.log(`📊 Found ${subMenuCount} elements for submenu "${subMenuName}"`);
      if (subMenuCount === 0) {
        console.error(`❌ Submenu "${subMenuName}" not found inside "${menuName}".`);
        return;
      }

      console.log(`✅ Submenu encontrado. Clicando no submenu "${subMenuName}"`);
      await subMenuLink.click();
      console.log(`✓ Clicou no submenu: ${subMenuName} dentro do menu: ${menuName}`);
    }

    console.log(`🏁 Processo concluído para menu "${menuName}"${subMenuName ? ` e submenu "${subMenuName}"` : ''}`);
  }

  /**
 * Faz scroll para baixo na página
 * @param pixels - Número de pixels para scrollar (padrão: 500)
 */
  async scrollDown(pixels: number = 500): Promise<void> {
    await this.page.evaluate((scrollAmount) => {
      window.scrollBy(0, scrollAmount);
    }, pixels);
  }

  /**
   * Faz scroll até o final da página
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Faz scroll até o topo da página
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }
}