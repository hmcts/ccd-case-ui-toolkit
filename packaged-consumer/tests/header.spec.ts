import { expect, test } from '@playwright/test';

test('renders a component from the packed toolkit', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('cut-header-bar')).toContainText('Packaged toolkit consumer');
});
