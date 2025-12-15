import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';


// home.page.ts - Página principal

export class HomePage extends HelperBase {
  // Instância de Actions para utilitários genéricos
  private actions: Actions;

  // LOCATORS: Cabeçalho e navegação principal
  readonly logoLink: Locator = this.page.locator('a[title="Iglu Ski logo"]');
  readonly skiHolidaysLink: Locator = this.page.locator('(//a[@href="/ski-holidays"])[2]');
  readonly skiDestinationsLink: Locator = this.page.locator('a[href="/ski-resorts"]').first();
  readonly skiDealsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
  readonly snowReportsLink: Locator = this.page.locator('(//a[@href="/snow-reports"])[1]');
  readonly skiblogguidesLink: Locator = this.page.locator('(//a[@href="/blog"])[1]');
  readonly enquireLink: Locator = this.page.locator('(//a[contains(@href, "/enquire")])[1]');
  readonly contactusLink: Locator = this.page.locator('(//a[@href="/contact-us"])[1]');
  readonly skiChaletsLink: Locator = this.page.locator('(//a[contains(@href, "/ski-chalet")])[4]');
  readonly aboutUsLink: Locator = this.page.locator('a[href="/about"]').first();

  // LOCATORS: Modal de cookies
  readonly acceptCookiesButton: Locator = this.page.locator('button:has-text("Accept Cookies & Close")').first();
  readonly cookiesBanner: Locator = this.page.locator('//div[@aria-label="Cookie banner"]');

  // LOCATORS: Componentes de busca
  readonly propertiesSearchInput: Locator = this.page.locator('input[aria-label*="Search properties"]');
  readonly countriesSearchInput: Locator = this.page.locator('input[aria-label*="Search countries"], #where');
  readonly resortsSearchInput: Locator = this.page.locator('input[aria-label*="Search resorts"]');
  readonly searchButton: Locator = this.page.locator('button.search-item__cta');

  // LOCATORS: Links do rodapé
  readonly footerFranceLink: Locator = this.page.locator('footer a[href*="/france"]').first();
  readonly footerSkiChaletsLink: Locator = this.page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();

  // Construtor da página
  constructor(page: Page) {
    super(page);
    this.actions = new Actions(page);
  }

  // Utilitário privado: toSlug usado internamente pela HomePage
  // NAVEGAÇÃO E COOKIES: Navega para a home e aceita cookies

  async navigate(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    // small pause for dynamic elements
    await this.page.waitForTimeout(1500);
    await this.acceptCookies();
    // Garantir que o campo de busca de resorts esteja visível.
    // Se não estiver, tenta abrir painéis/seletores que geralmente exibem o campo.
    try {
      await this.resortsSearchInput.waitFor({ state: 'visible', timeout: 2000 });
      return;
    } catch {
      const toggles = [
        'button:has-text("Search")',
        'a:has-text("Search")',
        'button[aria-label*="Search"]',
        '.search-toggle',
        '.site-search-toggle',
        '.search-open'
      ];

      for (const sel of toggles) {
        try {
          const t = this.page.locator(sel).first();
          if (await t.count() > 0 && await t.isVisible({ timeout: 1000 }).catch(() => false)) {
            await t.click();
            await this.page.waitForTimeout(300);
            try {
              await this.resortsSearchInput.waitFor({ state: 'visible', timeout: 2000 });
              break;
            } catch {
              // tenta próximo toggle
            }
          }
        } catch {
          // ignora erros e continua
        }
      }
    }
    // Remove overlays persistentes que interceptam cliques

    try {
      await this.page.evaluate(() => {
        try {
          const ids = ['onetrust-consent-sdk', 'onetrust-pc-wrapper', 'onetrust-banner-sdk'];
          ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
          });
          document.querySelectorAll('.onetrust-pc-dark-filter, .onetrust-pc-sdk, #onetrust-pc').forEach(e => e.remove());
        } catch { /* ignore */ }
      });
      await this.page.waitForTimeout(200);
    } catch {
      // ignore erros
    }
  }

  // Ação: busca por país preenchendo input e enviando Enter
  async searchForCountry(text: string) {
    await this.countriesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.countriesSearchInput.press('Enter');
  }

  // Ação: busca por propriedade preenchendo input e enviando Enter

  async searchForProperty(text: string) {
    await this.propertiesSearchInput.fill(text, { timeout: 5000 });
    await this.page.waitForTimeout(1000);
    await this.propertiesSearchInput.press('Enter');
  }

  // Ação: clica no botão de busca
  async clickOnSearchButton() {
    await this.searchButton.click();
  }
  // --------------------------
  // Assertions & Validations
  // --------------------------

  // ASSERTIONS: Verifica se um locator está visível usando Actions
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    return await this.actions.verifyElementVisible(locator);
  }

  // ASSERTIONS: Aguarda URL esperada usando Actions
  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    return await this.actions.verifyPageLoaded(expectedUrl);
  }

  // VALIDAÇÕES: Valida redirecionamento do logo
  async validateLogo() {
    await this.validateRedirectButton(this.logoLink, '/');
  }

  // VALIDAÇÕES: Coleta informações de contato no cabeçalho
  async validateHeaderContactInfo() {
    const phoneLocator = this.page.locator('header a[href^="tel:"]').first();
    const emailLocator = this.page.locator('header a[href^="mailto:"]').first();
  }



  // VALIDAÇÕES: Valida menus principais e submenus, títulos e duplicados
  async validateMenuAndSubMenuNavigation(): Promise<void> {
    // armazena resumo de duplicados por menu
    const duplicatesSummary: Record<string, Array<{ label: string; duplicateWith: string; url: string }>> = {};

    // função interna: valida se o <h1> contém o texto esperado
    const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
      const normalizedLabel = this.actions.normalizeText(label);

      // tentativa 1: match completo via XPath
      try {
        const xpathFull = `//div[contains(@class, "main body-additional-bottom-margin")]//h1[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${normalizedLabel}")]`;
        const locatorFull = page.locator(xpathFull);
        if (await locatorFull.count() > 0) {
          const text = (await locatorFull.first().innerText()).trim();
          console.log(`✓ Valid title (full match) → "${text}"`);
          return true;
        }
      } catch { }

      // tentativa 2: match parcial por palavras significativas

      const stopwords = new Set(['the', 'and', 'for', 'from', 'with', 'to', 'of', 'in', 'on', 'at', 'by']);
      const words = label.split(/\s+/).map(w => this.actions.normalizeText(w)).filter(w => w.length > 3 && !stopwords.has(w));

      for (const w of words) {
        try {
          const xpathPart = `//div[contains(@class, "main body-additional-bottom-margin")]//h1[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${w}")]`;
          const locatorPart = page.locator(xpathPart);
          if (await locatorPart.count() > 0) {
            const text = (await locatorPart.first().innerText()).trim();
            console.log(`✓ Valid title (partial match) → word "${w}" found in: "${text}"`);
            return true;
          }
        } catch { }
      }

      // tentativa 3: fallback verificando se todas as palavras relevantes aparecem no título

      try {
        const h1Text = (await page.locator('h1').first().innerText()).toLowerCase();
        const labelWords = normalizedLabel.replace(/-/g, ' ').split(' ').filter(w => w.length > 2);
        const allWordsFound = labelWords.every(w => h1Text.includes(w));
        if (allWordsFound) {
          console.log(`✓ Valid title (contains all words) → "${h1Text}"`);
          return true;
        }
      } catch { }

      // ⚠ Se não encontrou nada, loga aviso
      console.warn(`⚠ No match found in <h1> for: "${label}"`);
      return false;
    };

    // ✅ Captura menus e submenus do DOM principal
    const menusSnapshot = await this.page.$$eval('li.menu-list__item', (items) => {
      return items.map((li) => {
        const mainLink = li.querySelector('a');
        const mainHref = mainLink ? mainLink.getAttribute('href') : null;
        const mainLabel = mainLink ? (mainLink.textContent?.trim() || '') : (li.textContent?.trim() || '');
        const subAnchors = Array.from(li.querySelectorAll('.submenu-list__block-item a'));
        const sublinks = subAnchors.map((a) => ({
          label: a.textContent?.trim() || '',
          href: a.getAttribute('href')
        }));
        return { mainLabel, mainHref, sublinks };
      });
    });

    console.log(`🌐 Validating ${menusSnapshot.length} main menus`);

    // ✅ Itera por cada menu principal
    for (const menu of menusSnapshot) {
      const menuLabel = menu.mainLabel || 'menu';
      const menuHref = this.actions.extractFullUrlFromString(menu.mainHref);

      console.log(`\n🌐 Validating menu: "${menuLabel}"`);

      if (!menuHref) {
        console.warn(`⚠ Menu "${menuLabel}" has no valid URL. Skipping.`);
        continue;
      }

      console.log(`✓ Valid URL → ${menuHref}`);

      let menuPage: Page | null = null;

      try {
        // ✅ Abre nova aba para validar o menu principal
        menuPage = await this.page.context().newPage();
        await menuPage.goto(menuHref, { waitUntil: 'domcontentloaded', timeout: 120000 });

        // ✅ Valida título da página do menu
        await validateTitleContains(menuPage, menuLabel);

        const sublinks = menu.sublinks || [];
        console.log(`📁 Menu "${menuLabel}" → Found ${sublinks.length} sublinks`);

        if (sublinks.length === 0) {
          console.warn(`⚠ Menu "${menuLabel}" não possui sublinks.`);
          await menuPage.close();
          continue;
        }

        const allSublinks: Array<{ label: string; href: string }> = [];
        const seen = new Map<string, string>(); // URL -> primeiro label

        for (const s of sublinks) {
          const full = this.actions.extractFullUrlFromString(s.href);
          if (!full) continue;

          // marca duplicados se a URL já foi vista
          if (seen.has(full)) {
            const duplicateWith = seen.get(full)!;
            console.warn(`⚠ Duplicate found → "${s.label}" duplicate with "${duplicateWith}" (URL: ${full})`);

            if (!duplicatesSummary[menuLabel]) duplicatesSummary[menuLabel] = [];
            duplicatesSummary[menuLabel].push({ label: s.label, duplicateWith, url: full });
          } else {
            seen.set(full, s.label);
          }

          // ✅ Adiciona sempre para validar todos (mesmo duplicados)
          allSublinks.push({ label: s.label || full, href: full });
        }

        console.log(`📁 Menu "${menuLabel}" → Validating ${allSublinks.length} sublinks`);

        // ✅ Abre uma aba para validar todos os sublinks sequencialmente
        const subPage = await this.page.context().newPage();
        for (const s of allSublinks) {
          try {
            await subPage.goto(s.href, { waitUntil: 'domcontentloaded', timeout: 90000 });
            await validateTitleContains(subPage, s.label);
            console.log(`      ✓ Submenu validated: ${s.label}`);
          } catch (err: any) {
            console.error(`❌ Submenu "${s.label}" failed → ${err?.message || err}`);
          }
        }
        await subPage.close().catch(() => null);
      } catch (err: any) {
        console.error(`❌ Erro ao validar menu "${menuLabel}" → ${err?.message || err}`);
      } finally {
        if (menuPage) await menuPage.close().catch(() => null);
      }
    }

    // Final duplicates summary
    console.log(`\n📊 DUPLICATES SUMMARY:`);
    if (Object.keys(duplicatesSummary).length === 0) {
      console.log(`✅ No duplicates found.`);
    } else {
      for (const [menu, duplicates] of Object.entries(duplicatesSummary)) {
        console.log(`\nMenu: ${menu}`);
        duplicates.forEach(d => {
          console.log(`  - "${d.label}" duplicate with "${d.duplicateWith}" (URL: ${d.url})`);
        });
      }
    }

    return;
  }

  // EXTRAS: realiza busca simples pelo campo de resorts e aguarda resultados

  async searchFor(query: string): Promise<void> {
    // Clicar e preencher o input de resorts
    await this.resortsSearchInput.click();
    await this.resortsSearchInput.fill(query);

    // Envia a busca
    await this.page.keyboard.press('Enter');

    // Tenta detectar um painel de resultados/sugestões comum
    const possibleSelectors = [
      'ul[role="listbox"]',
      '.search-results',
      '.search-autocomplete',
      '.results-list',
      '.searchResults',
      '.autosuggest'
    ];

    for (const sel of possibleSelectors) {
      try {
        const locator = this.page.locator(sel).first();
        if (await locator.count() > 0) {
          await locator.waitFor({ state: 'visible', timeout: 5000 });
          return;
        }
      } catch {
        // ignore and try next selector
      }
    }

    // Fallback: aguarda um pequeno tempo para o resultado AJAX carregar
    await this.page.waitForTimeout(1000);
  }

  // Recupera texto representativo dos resultados de busca
  async getSearchResults(): Promise<string> {
    const candidates = [
      'ul[role="listbox"] li',
      '.search-results .result, .search-results li',
      '.search-autocomplete li',
      '.results-list li',
      '.autosuggest li'
    ];

    for (const sel of candidates) {
      try {
        const locator = this.page.locator(sel).first();
        if (await locator.count() > 0) {
          const txt = (await locator.textContent({ timeout: 3000 })) || '';
          if (txt.trim().length > 0) return txt.trim();
        }
      } catch {
        // ignore
      }
    }

    // Último recurso: retornar o valor atual do input de busca
    try {
      const val = await this.resortsSearchInput.inputValue();
      return val || '';
    } catch {
      return '';
    }
  }

}
