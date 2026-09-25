import { test, expect } from '@playwright/test';

test.describe('Collection permissions', () => {
  test('disables add and remove controls when collection permissions are absent', async ({ page }) => {
    await page.goto('/');

    const restricted = page.getByTestId('restricted-collection');
    await expect(restricted.getByRole('button', { name: 'Add new' }).first()).toBeDisabled();
    await expect(restricted.getByRole('button', { name: 'Remove Restricted names' })).toBeDisabled();
  });
});
