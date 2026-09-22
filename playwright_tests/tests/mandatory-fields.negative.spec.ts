import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Mandatory fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Mandatory field controls' })).toBeVisible();
  });

  test('exposes a mandatory text error until corrected', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Text field' });
    await input.fill('value');
    await input.fill('');
    await input.blur();
    await expect(input.locator('..')).toHaveClass(/form-group-error/);
    await input.fill('corrected');
    await expect(input.locator('..')).not.toHaveClass(/form-group-error/);
  });
});
