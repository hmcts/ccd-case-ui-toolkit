import { test, expect } from '@playwright/test';

test.describe('Collection fields', () => {
  test('adds a new item and preserves collection identity', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(1);
    await page.getByRole('button', { name: 'Add new' }).first().click();

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(2);
    await expect(page.getByTestId('restricted-collection').getByRole('button', { name: 'Remove Restricted names' })).toHaveCount(1);
    await expect(page.getByTestId('collection-values')).toContainText('name-1');
    await expect(page.getByTestId('collection-values')).toContainText('Alice');
  });

  test('keeps the item when removal is cancelled', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Remove Names' }).click();
    await expect(page.getByText('Are you sure you want to remove the item?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(1);
    await expect(page.getByTestId('collection-values')).toContainText('name-1');
  });

  test('removes the item after confirmation and updates the form value', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Remove Names' }).click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Remove Names' })).toHaveCount(0);
    await expect(page.getByTestId('names-value')).toHaveText('[]');
  });
});
