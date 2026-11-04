import { test, expect } from '@playwright/test';

test.describe('Collection permissions', () => {
  test('disables add and remove controls when collection permissions are absent', async ({ page }) => {
    await page.goto('/');

    const restricted = page.getByTestId('restricted-collection');
    await expect(restricted.getByRole('button', { name: 'Add new' }).first()).toBeDisabled();
    await expect(restricted.getByRole('button', { name: 'Remove Restricted names' })).toBeDisabled();
  });
  test('allows insertion while denying deletion independently', async ({ page }) => {
    await page.goto('/?collection-permissions=create');
    const restricted = page.getByTestId('restricted-collection');
    await restricted.getByRole('button', { name: 'Add new' }).first().click();
    await expect(restricted.getByRole('button', { name: 'Remove Restricted names' })).toHaveCount(2);
    await expect(restricted.getByRole('button', { name: 'Remove Restricted names' }).first()).toBeDisabled();
    await expect(restricted.getByRole('button', { name: 'Remove Restricted names' }).nth(1)).toBeEnabled();
    await expect(page.getByTestId('collection-values')).toContainText('name-1');
  });

  test('allows deletion while denying insertion independently', async ({ page }) => {
    await page.goto('/?collection-permissions=delete');
    const restricted = page.getByTestId('restricted-collection');
    await expect(restricted.getByRole('button', { name: 'Add new' }).first()).toBeDisabled();
    await restricted.getByRole('button', { name: 'Remove Restricted names' }).click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await expect.poll(async () => JSON.parse(await page.getByTestId('collection-values').innerText()).restrictedNames).toEqual([]);
  });
});
