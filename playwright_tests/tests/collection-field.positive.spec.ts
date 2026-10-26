import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

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
  test('edits and removes a new item without changing the retained or restricted collection', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Add new', exact: true }).first().click();
    await page.getByTestId('editable-collection').getByRole('textbox').nth(1).fill('Bob');
    await expect.poll(async () => JSON.parse(await page.getByTestId('names-value').innerText()).map((item: { value: string }) => item.value)).toEqual(['Alice', 'Bob']);
    await page.getByTestId('editable-collection').getByRole('button', { name: 'Remove Names 2', exact: true }).click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();

    await expect.poll(async () => JSON.parse(await page.getByTestId('collection-values').innerText())).toEqual({
      names: [{ id: 'name-1', value: 'Alice' }],
      restrictedNames: [{ id: 'name-1', value: 'Alice' }]
    });
  });
});
