import {test as base, expect} from '@playwright/test';
import { PageManager } from '../pages/utils/PageManager';

type Fixtures = {
  pm: PageManager;
};

export const test = base.extend<Fixtures>({
  pm: async ({ page }, use) => {
    const pm = new PageManager(page);
    await use(pm);
  },
});
export { expect };

// Extending the base test to include a page manager or other utilities can be done here