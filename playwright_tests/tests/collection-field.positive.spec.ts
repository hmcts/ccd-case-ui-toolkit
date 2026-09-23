import { test, expect } from '@playwright/test';

test.describe('Collection fields', () => {
  test('adds a new item and preserves collection identity', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Add new' }).first().click();

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(2);
    await expect(page.getByTestId('collection-values')).toContainText('name-1');
    await expect(page.getByTestId('collection-values')).toContainText('Alice');
  });
});
