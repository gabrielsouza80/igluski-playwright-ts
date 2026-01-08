const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.igluski.com/ski-holidays', { waitUntil: 'domcontentloaded' });

  // Best-effort cookie/banner accept
  const accept = page.getByRole('button', { name: /Accept|I Agree|Accept all/i }).first();
  if (await accept.count()) await accept.click({ timeout: 3000 }).catch(() => {});

  await page.waitForTimeout(1500);

  const selectors = [
    '.search-results',
    '.search-result',
    '.search-results__item',
    '.faceted-search__result',
    '.search-result__nights',
    'span.search-result__nights',
    '.faceted-search__details__stats',
  ];

  for (const sel of selectors) {
    const count = await page.locator(sel).count().catch(() => -1);
    console.log(`${sel} -> ${count}`);
  }

  if (await page.locator('span.search-result__nights').count()) {
    const text = await page.locator('span.search-result__nights').first().innerText().catch(() => '');
    console.log('first nights text:', JSON.stringify(text));
  }

  // Try applying the 2 nights filter and re-check nights texts
  const nightsButton = page.locator('#holiday-collapse button.dropdown-toggle').filter({ hasText: /nights|Any/i }).first();
  if (await nightsButton.count()) {
    await nightsButton.click().catch(() => nightsButton.click({ force: true }));
    const openItems = await page.locator('.dropdown-menu.show a.dropdown-item').allInnerTexts().catch(() => []);
    if (openItems.length) console.log('visible dropdown items:', openItems.map(t => t.trim()).slice(0, 30));
    const option2 = page.locator('a.dropdown-item', { hasText: /^2\b/ }).first();
    if (await option2.count()) {
      await option2.click().catch(() => option2.click({ force: true }));
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(1500);
      const nights = await page.locator('span.search-result__nights').allInnerTexts().catch(() => []);
      console.log('after selecting 2 nights:', nights.slice(0, 10).map(t => t.trim()));
    } else {
      console.log('2 nights option not found in dropdown');
    }
  } else {
    console.log('nights dropdown button not found');
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
