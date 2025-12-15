// Actions.ts - Métodos genéricos reutilizáveis em múltiplos testes
// Contém funções de utilidade que não são específicas de nenhum website

import { Page, Locator } from '@playwright/test';

export class Actions {

  constructor(private page: Page) { }

  // Normaliza texto removendo acentos e caracteres especiais (genérico)
  normalizeText(s?: string | null): string {
    if (!s) return '';
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
      .toLowerCase();
  }

  // Gera URL absoluta a partir de um href (genérico)
  extractFullUrlFromString(linkHref: string | null): string | null {
    if (!linkHref) return null;
    try {
      return linkHref.startsWith('http') ? linkHref : new URL(linkHref, this.page.url()).href;
    } catch {
      return null;
    }
  }

  // Verifica se um elemento está visível (genérico)
  async verifyElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  // Aguarda a página carregar com a URL esperada (genérico)
  async verifyPageLoaded(expectedUrl: string): Promise<boolean> {
    try {
      await this.page.waitForURL(`**${expectedUrl}*`, { timeout: 15000 });
      return this.page.url().includes(expectedUrl);
    } catch {
      return false;
    }
  }

}
