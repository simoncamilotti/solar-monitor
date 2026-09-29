import { uniqueUser } from '@repo/e2e-support';

import { expect, test } from './fixtures.js';

test.describe('Language switcher', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn(uniqueUser());
  });

  test('should default to French locale', async ({ page }) => {
    await page.goto('/');
    // In French, sidebar title should show "Monitoring solaire"
    await expect(page.locator('aside')).toContainText('Monitoring solaire');
  });

  test('should switch to English when clicking the language button', async ({ page }) => {
    await page.goto('/');
    // The language button shows "En" when in French mode
    const langButton = page.locator('aside button').filter({ hasText: /^En$/i });
    await langButton.click();

    // After switching, sidebar title should show "Solar monitoring"
    await expect(page.locator('aside')).toContainText('Solar monitoring');
  });
});
