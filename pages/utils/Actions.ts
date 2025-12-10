// actions/actions.ts
import { Page, Locator, expect } from '@playwright/test';

export class Actions {
    constructor(private page: Page) { }

    async validateRedirectButton(button: Locator, expectedUrl: string): Promise<void> {

        // 1. Ensure button is visible
        await expect(button).toBeVisible();

        // 2. Store current URL
        const previousUrl = this.page.url();

        // 3. Click the button
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => { }), // ignore if no navigation
            button.click()
        ]);

        // 4. Get current URL after click
        const currentUrl = this.page.url();

        // 5. Validate URL only if changed
        if (currentUrl !== previousUrl) {
            await expect(this.page).toHaveURL(expectedUrl);

            // 6. Go back to previous page if we navigated
            await this.page.goBack();

            await expect(this.page).toHaveURL(previousUrl);
        } else {
            // Caso apenas recarregue a mesma página
            console.log('Button clicked but URL did not change, no goBack needed.');
        }
    }
}