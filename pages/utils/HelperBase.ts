import { Page } from '@playwright/test';

export class HelperBase {
    protected readonly page: Page;

  constructor(protected page: Page) {
    this.page = page;
  }

  
}