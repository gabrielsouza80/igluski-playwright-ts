import {test as base, expect} from '@playwright/test';
import { PageManager } from '../pages/utils/PageManager';
import testdata from '../tests/fixtures/testdata.json';

type Fixtures = {
  pm: PageManager;
};

export const test = base.extend<Fixtures>({
  pm: async ({ page }, use, testInfo) => {
    const pm = new PageManager(page);

    // Reset soft issues for this test, print a clean header.
    pm.resetSoftIssues();
    console.log(`\n=== TEST: ${testInfo.title} ===`);

    await use(pm);

    const { errors, warnings } = pm.collectSoftIssues();
    const strictWarningsFromEnv = (process.env.STRICT_WARNINGS || '').toLowerCase() === '1' || (process.env.STRICT_WARNINGS || '').toLowerCase() === 'true';
    const strictWarningsFromJson = Boolean((testdata as any)?.framework?.strictness?.failOnWarnings);
    const strictWarnings = strictWarningsFromEnv || strictWarningsFromJson;

    if (errors.length > 0) {
      console.log(`=== END: FAIL (soft errors: ${errors.length}) ===`);
      throw new Error(`Soft validation errors detected:\n- ${errors.join('\n- ')}`);
    }

    if (strictWarnings && warnings.length > 0) {
      console.log(`=== END: FAIL (warnings: ${warnings.length}) ===`);
      throw new Error(`Warnings treated as failures (STRICT_WARNINGS=1):\n- ${warnings.join('\n- ')}`);
    }

    if (warnings.length > 0) {
      console.log(`=== END: PASS (warnings: ${warnings.length}) ===`);
      console.log(`Warnings summary:`);
      for (const w of warnings) console.log(`- ${w}`);
    } else {
      console.log(`=== END: PASS ===`);
    }
  },
});
export { expect };

// Extending the base test to include a page manager or other utilities can be done here