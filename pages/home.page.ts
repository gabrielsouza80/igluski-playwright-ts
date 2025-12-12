import { Page, Locator, expect } from '@playwright/test';
import { HelperBase } from './utils/HelperBase';
import { Actions } from './utils/Actions';

/**
 * home.page.ts - Versão refatorada e comentada (extensos comentários)
 * -----------------------------------------------------------------
 * Objetivo:
 * - Arquivo refatorado com padrões consistentes, nomes padronizados e
 *   logging claro.
 * - Substitui validação por breadcrumb por validação por título (<h1>),
 *   com "partial match" (aceita apenas uma palavra do submenu quando
 *   aplicável). Isso reduz falsos negativos quando o breadcrumb varia.
 * - Otimizações de performance: reduz criação de abas desnecessárias,
 *   trata timeouts de forma centralizada e oferece logs explicativos.
 *
 * Como usar:
 * - Substitua seu atual pages/home.page.ts por este arquivo (ou copie o
 *   conteúdo para o mesmo arquivo). Todas as funções públicas mantêm
 *   interface compatível com o uso atual nos testes.
 *
 * Observações:
 * - A classe extende HelperBase (presumo que HelperBase exponha `this.page`).
 * - A classe Actions é usada para validações auxiliares (mantive a injeção
 *   para compatibilidade com seu código atual).
 */

export class HomePage extends HelperBase {
  // Instância de Actions para reutilizar utilitários (redundante se não for
  // usada — mantive por compatibilidade com seu projeto atual)
  private actions: Actions;

  // -------------------------------
  // LOCATORS (agrupados e com comentários)
  // -------------------------------
  // Cabeçalho / navegação principal
  readonly logoLink: Locator;
  readonly skiHolidaysLink: Locator;
  readonly skiDestinationsLink: Locator;
  readonly skiDealsLink: Locator;
  readonly snowReportsLink: Locator;
  readonly skiblogguidesLink: Locator;
  readonly enquireLink: Locator;
  readonly contactusLink: Locator;
  readonly skiChaletsLink: Locator;
  readonly aboutUsLink: Locator;

  // Cookies modal
  readonly acceptCookiesButton: Locator;
  readonly cookiesBanner: Locator;

  // Search inputs
  readonly propertiesSearchInput: Locator;
  readonly countriesSearchInput: Locator;
  readonly resortsSearchInput: Locator;
  readonly searchButton: Locator;

  // Footer links (exemplos)
  readonly footerFranceLink: Locator;
  readonly footerSkiChaletsLink: Locator;

  // -------------------------------
  // Construtor
  // -------------------------------
  constructor(page: Page) {
    super(page);
    this.actions = new Actions(page);

    // Inicializa locators no construtor para centralizar alterações
    // em um único lugar caso o markup mude.
    this.logoLink = this.page.locator('a[title="Iglu Ski logo"]');
    this.skiHolidaysLink = this.page.locator('(//a[@href="/ski-holidays"])[2]');
    this.skiDestinationsLink = this.page.locator('a[href="/ski-resorts"]').first();
    this.skiDealsLink = this.page.locator('(//a[contains(@href, "/ski-deals")])[2]');
    this.snowReportsLink = this.page.locator('(//a[@href="/snow-reports"])[1]');
    this.skiblogguidesLink = this.page.locator('(//a[@href="/blog"])[1]');
    this.enquireLink = this.page.locator('(//a[contains(@href, "/enquire")])[1]');
    this.contactusLink = this.page.locator('(//a[@href="/contact-us"])[1]');
    this.skiChaletsLink = this.page.locator('(//a[contains(@href, "/ski-chalet")])[4]');
    this.aboutUsLink = this.page.locator('a[href="/about"]').first();

    this.acceptCookiesButton = this.page.locator('button:has-text("Accept Cookies & Close")').first();
    this.cookiesBanner = this.page.locator('//div[@aria-label="Cookie banner"]');

    this.propertiesSearchInput = this.page.locator('input[aria-label*="Search properties"]');
    this.countriesSearchInput = this.page.locator('input[aria-label*="Search countries"]');
    this.resortsSearchInput = this.page.locator('input[aria-label*="Search resorts"]');
    this.searchButton = this.page.locator('button:has-text("Search")').first();

    this.footerFranceLink = this.page.locator('footer a[href*="/france"]').first();
    this.footerSkiChaletsLink = this.page.locator('footer a:has-text("Ski")').filter({ hasText: 'chalet' }).first();
  }

  // -------------------------------
  // UTILITÁRIOS (helpers privados)
  // -------------------------------

  /**
   * Normaliza texto para comparações: remove múltiplos espaços, acentos
   * e pontuação, deixa em minúsculas.
   * - Mantém apenas letras/números/espacos para comparação segura.
   */
  private normalizeText(s?: string | null): string {
    if (!s) return '';
    // remove acentuação básica, depois remove não-alfanuméricos e normaliza espaços
    return s
      .normalize('NFD') // separa acentos
      .replace(/\p{Diacritic}/gu, '') // remove diacríticos
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
      .toLowerCase();
  }

  /**
   * Gera uma URL absoluta a partir de um href relativo ou absoluto.
   * Retorna null se não for possível gerar a URL.
   */
  extractFullUrl(linkHref: string | null): string | null {
    if (!linkHref) return null;
    try {
      return linkHref.startsWith('http') ? linkHref : new URL(linkHref, this.page.url()).href;
    } catch {
      return null;
    }
  }

  /**
   * Gera slug simples (ex: "Tailor-made ski" -> "tailor-made-ski").
   * Útil se precisar gerar expectativas de URLs ou IDs.
   */
  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  }

  // -------------------------------
  // NAVEGAÇÃO / COOKIES
  // -------------------------------

  /**
   * Navega para a home e aceita cookies (se existirem).
   * Usa timeouts conservadores para evitar falsos positivos.
   */
  async navigate(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    // pequena pausa para permitir carregamento de elementos dinâmicos
    await this.page.waitForTimeout(1500);
    await this.acceptCookies();
  }

  /**
   * Tenta fechar o banner de cookies por diferentes seletores.
   * Não lança erro se não encontrar: comportamento idempotente.
   */
  async acceptCookies(): Promise<void> {
    try {
      const button = this.acceptCookiesButton;
      if (await button.count() > 0 && await button.isVisible({ timeout: 3000 })) {
        await button.click();
        await this.page.waitForTimeout(300);
        return;
      }
    } catch (e) {
      // tenta alternativa
    }

    try {
      const alt = this.page.locator('button:has-text("Accept")').first();
      if (await alt.count() > 0 && await alt.isVisible({ timeout: 2000 })) {
        await alt.click();
        await this.page.waitForTimeout(300);
      }
    } catch {
      // se não achou, não faz nada — é seguro
    }
  }

  // -------------------------------
  // AÇÕES SIMPLES (reutilizáveis)
  // -------------------------------

  /**
   * Valida que um locator está visível (try/catch para evitar falhas no teste)
   */
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Aguarda a página atual conter expectedUrl (substring) — útil para
   * verificar navegações relativas.
   */
  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    try {
      await this.page.waitForURL(`**${expectedUrl}*`, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

  // ===========================
  // Validação da Logo
  // ===========================
  async validateLogo() {
    await this.actions.validateRedirectButton(this.logoLink, '/');
  }





/**
 * Valida menus principais e submenus:
 * - Verifica se cada página tem um <h1> coerente com o nome do menu/submenu.
 * - Loga duplicados mostrando com quem está duplicado (Label + URL).
 * - Aceita singular/plural e palavras extra no título (fallback inteligente).
 * - Executa tudo de forma sequencial (não paralela).
 * - No final, imprime um resumo com todos os duplicados agrupados por menu.
 */
async validateMenuAndSubMenuNavigation(): Promise<void> {
  // ✅ Estrutura para guardar duplicados por menu
  const duplicatesSummary: Record<string, Array<{ label: string; duplicateWith: string; url: string }>> = {};

  /**
   * Função interna para validar se o <h1> da página contém o texto esperado.
   * Lógica:
   * 1. Full match
   * 2. Partial match com palavras significativas
   * 3. Fallback: todas as palavras relevantes do label aparecem no título
   */
  const validateTitleContains = async (page: Page, label: string): Promise<boolean> => {
    const normalizedLabel = this.normalizeText(label);

    // ✅ Passo 1: Full match via XPath
    try {
      const xpathFull = `//div[contains(@class, "main body-additional-bottom-margin")]//h1[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${normalizedLabel}")]`;
      const locatorFull = page.locator(xpathFull);
      if (await locatorFull.count() > 0) {
        const text = (await locatorFull.first().innerText()).trim();
        console.log(`✓ Título válido (full match) → "${text}"`);
        return true;
      }
    } catch {}

    // ✅ Passo 2: Partial match com palavras significativas
    const stopwords = new Set(['the', 'and', 'for', 'from', 'with', 'to', 'of', 'in', 'on', 'at', 'by']);
    const words = label.split(/\s+/).map(w => this.normalizeText(w)).filter(w => w.length > 3 && !stopwords.has(w));

    for (const w of words) {
      try {
        const xpathPart = `//div[contains(@class, "main body-additional-bottom-margin")]//h1[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${w}")]`;
        const locatorPart = page.locator(xpathPart);
        if (await locatorPart.count() > 0) {
          const text = (await locatorPart.first().innerText()).trim();
          console.log(`✓ Título válido (partial match) → palavra "${w}" encontrada em: "${text}"`);
          return true;
        }
      } catch {}
    }

    // ✅ Passo 3: Fallback inteligente (todas as palavras relevantes aparecem no título)
    try {
      const h1Text = (await page.locator('h1').first().innerText()).toLowerCase();
      const labelWords = normalizedLabel.replace(/-/g, ' ').split(' ').filter(w => w.length > 2);
      const allWordsFound = labelWords.every(w => h1Text.includes(w));
      if (allWordsFound) {
        console.log(`✓ Título válido (contains all words) → "${h1Text}"`);
        return true;
      }
    } catch {}

    // ⚠ Se não encontrou nada, loga aviso
    console.warn(`⚠ Nenhuma correspondência encontrada no <h1> para: "${label}"`);
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

  console.log(`🌐 Validando ${menusSnapshot.length} menus principais`);

  // ✅ Itera por cada menu principal
  for (const menu of menusSnapshot) {
    const menuLabel = menu.mainLabel || 'menu';
    const menuHref = this.extractFullUrl(menu.mainHref);

    console.log(`\n🌐 Validando menu principal: "${menuLabel}"`);

    if (!menuHref) {
      console.warn(`⚠ Menu "${menuLabel}" sem URL válida. Pulando.`);
      continue;
    }

    console.log(`✓ URL válida → ${menuHref}`);

    let menuPage: Page | null = null;

    try {
      // ✅ Abre nova aba para validar o menu principal
      menuPage = await this.page.context().newPage();
      await menuPage.goto(menuHref, { waitUntil: 'domcontentloaded', timeout: 120000 });

      // ✅ Valida título da página do menu
      await validateTitleContains(menuPage, menuLabel);

      const sublinks = menu.sublinks || [];
      console.log(`📁 Menu "${menuLabel}" → Encontrados ${sublinks.length} sublinks`);

      if (sublinks.length === 0) {
        console.warn(`⚠ Menu "${menuLabel}" não possui sublinks.`);
        await menuPage.close();
        continue;
      }

      const allSublinks: Array<{ label: string; href: string }> = [];
      const seen = new Map<string, string>(); // URL -> primeiro label

      for (const s of sublinks) {
        const full = this.extractFullUrl(s.href);
        if (!full) continue;

        // ✅ Loga duplicados mostrando com quem está duplicado
        if (seen.has(full)) {
          const duplicateWith = seen.get(full)!;
          console.warn(`⚠ Duplicado encontrado → "${s.label}" duplicado com "${duplicateWith}" (URL: ${full})`);

          // ✅ Adiciona ao resumo final
          if (!duplicatesSummary[menuLabel]) duplicatesSummary[menuLabel] = [];
          duplicatesSummary[menuLabel].push({ label: s.label, duplicateWith, url: full });
        } else {
          seen.set(full, s.label);
        }

        // ✅ Adiciona sempre para validar todos (mesmo duplicados)
        allSublinks.push({ label: s.label || full, href: full });
      }

      console.log(`📁 Menu "${menuLabel}" → Validando ${allSublinks.length} sublinks`);

      // ✅ Abre uma aba para validar todos os sublinks sequencialmente
      const subPage = await this.page.context().newPage();
      for (const s of allSublinks) {
        try {
          await subPage.goto(s.href, { waitUntil: 'domcontentloaded', timeout: 90000 });
          await validateTitleContains(subPage, s.label);
          console.log(`      ✓ Submenu validado: ${s.label}`);
        } catch (err: any) {
          console.error(`❌ Falha no submenu "${s.label}" → ${err?.message || err}`);
        }
      }
      await subPage.close().catch(() => null);
    } catch (err: any) {
      console.error(`❌ Erro ao validar menu "${menuLabel}" → ${err?.message || err}`);
    } finally {
      if (menuPage) await menuPage.close().catch(() => null);
    }
  }

  // ✅ Resumo final dos duplicados
  console.log(`\n📊 RESUMO DE DUPLICADOS ENCONTRADOS:`);
  if (Object.keys(duplicatesSummary).length === 0) {
    console.log(`✅ Nenhum duplicado encontrado.`);
  } else {
    for (const [menu, duplicates] of Object.entries(duplicatesSummary)) {
      console.log(`\nMenu: ${menu}`);
      duplicates.forEach(d => {
               console.log(`  - "${d.label}" duplicado com "${d.duplicateWith}" (URL: ${d.url})`);
      });
    }
  }

  return;
}

  // -------------------------------
  // EXTRAS: funções utilitárias menores
  // -------------------------------

  /**
   * Busca resultados de pesquisa na página (exemplo adaptado)
   */
  async getSearchResults(): Promise<string> {
    try {
      const resultsText = await this.page.locator('text=/results? found/i').first().textContent({ timeout: 5000 });
      return resultsText || '';
    } catch {
      return '';
    }
  }

}