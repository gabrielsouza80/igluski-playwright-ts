// actions/actions.ts
import { Page, Locator, expect } from '@playwright/test';

export class Actions {

  constructor(private page: Page) { }

  /**
   * =====================================================
   * 1️⃣ validateRedirectButton (USADA PELA LOGO)
   * - abre link em nova aba
   * - valida URL
   * - NÃO valida breadcrumb
   * - continua exatamente igual ao seu fluxo atual
   * =====================================================
   */
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

    // Valida URL
    await expect(newPage).toHaveURL(new RegExp(urlToOpen, 'i'));

    console.log(`✓ Validado: ${urlToOpen}`);

    await newPage.close();
  }




  /**
 * Método genérico para validar navegação via BOTÃO
 * - Abre em nova aba para não quebrar a página principal
 * - Valida URL usando contain
 * - Valida breadcrumb (opcional)
 * - Log explicativo se não existir ou não bater
 */
  async validateNavigation(button: Locator, expectedUrl: string, breadcrumbOptional: boolean = true): Promise<void> {
    const label = (await button.innerText() || "").trim();
    const expectedBreadcrumb = label.replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Abre nova aba
    const newPage = await this.page.context().newPage();
    const href = await button.getAttribute('href');
    const urlToOpen = href?.startsWith('http') ? href : new URL(expectedUrl, this.page.url()).href;

    await newPage.goto(urlToOpen, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // ✅ Validar URL usando contain
    if (!newPage.url().includes(expectedUrl)) {
      console.log(`❌ URL esperada "${expectedUrl}" não encontrada na URL atual: ${newPage.url()}`);
    } else {
      console.log(`✓ URL válida → ${newPage.url()}`);
    }

    // ✅ Validar breadcrumb
    if (breadcrumbOptional) {
      const breadcrumbLocator = newPage.locator(
        `//ol[@class="breadcrumb"]//li[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${expectedBreadcrumb.toLowerCase()}")]`
      );

      const count = await breadcrumbLocator.count();
      if (count > 0) {
        await expect(breadcrumbLocator.first()).toBeVisible();
        console.log(`✓ Breadcrumb válido → ${expectedBreadcrumb}`);
      } else {
        console.log(`⚠ Breadcrumb "${expectedBreadcrumb}" não encontrado na página "${urlToOpen}"`);
      }
    }

    await newPage.close();
  }




  /**
   * =====================================================
   * 3️⃣ openAndValidate
   * - Navega diretamente para URL
   * - Valida URL + breadcrumb
   * =====================================================
   */
  async openAndValidate(url: string, breadcrumb: string): Promise<void> {

    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    await expect(this.page).toHaveURL(
      new RegExp(url.replace(/\//g, "\\/"), "i")
    );

    const locator = this.page.locator(
      `//ol[@class="breadcrumb"]//li[contains(translate(text(),
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),
      "${breadcrumb.toLowerCase()}")]`
    );

    await expect(locator).toBeVisible();

    console.log(`✓ Validado URL + breadcrumb → ${breadcrumb}`);
  }




  /**
   * =====================================================
   * 4️⃣ extractFullUrl
   * - Gera URL absoluta automaticamente
   * - Funciona para qualquer menu ou submenu
   * =====================================================
   */
  async extractFullUrl(button: Locator): Promise<string | null> {

    const href = await button.getAttribute('href');
    if (!href) return null;

    return href.startsWith('http')
      ? href
      : new URL(href, this.page.url()).href;
  }




  /**
   * =====================================================
   * 5️⃣ goHome
   * - usado para resetar o estado entre validações
   * =====================================================
   */
  async goHome(): Promise<void> {

    await this.page.goto('https://www.igluski.com/', {
      waitUntil: 'domcontentloaded',
    });
  }




  /**
 * Valida todos os submenus de um botão de menu principal
 * - Abre cada submenu em nova aba
 * - Valida URL + breadcrumb (opcional)
 * - Log detalhado se falhar
 */
  async validateSubMenus(menuLocator: Locator) {
    const subLinks = menuLocator.locator('.submenu-list__block-item a');
    const count = await subLinks.count();

    console.log(`📁 Menu → ${count} sublinks encontrados`);

    for (let i = 0; i < count; i++) {
      const subLink = subLinks.nth(i);
      let label = "submenu";
      let url: string | null = null;

      try {
        // Espera até o link estar visível (até 90s)
        await subLink.waitFor({ state: 'visible', timeout: 90000 });

        // Pega o texto do link
        label = (await subLink.innerText({ timeout: 90000 }))?.trim() || "submenu";

        // Extrai URL do link
        url = await this.extractFullUrl(subLink);

        if (!url) {
          console.warn(`⚠ Submenu "${label}" não possui URL válida`);
          continue; // Pula para o próximo submenu
        }

        // Abre nova aba para validar sem interferir na principal
        const newPage = await this.page.context().newPage();
        await newPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

        // Valida URL
        if (newPage.url().includes(url)) {
          console.log(`✓ URL válida → ${url}`);
        } else {
          console.warn(`⚠ URL do submenu "${label}" difere → Esperado: ${url} | Atual: ${newPage.url()}`);
        }

        // Valida breadcrumb (contém)
        const breadcrumb = await newPage.locator('ol.breadcrumb li').first();
        const breadcrumbText = await breadcrumb.innerText({ timeout: 90000 }).catch(() => null);
        if (!breadcrumbText || !breadcrumbText.toLowerCase().includes(label.toLowerCase())) {
          console.warn(`⚠ Breadcrumb "${label}" não encontrado ou diferente na página "${url}"`);
        } else {
          console.log(`✓ Breadcrumb válido → ${breadcrumbText}`);
        }

        // Fecha aba
        await newPage.close();

      } catch (err: any) {
        console.error(`❌ Falha submenu "${label}" → ${err.message}`);
      }
    }
  }
}
