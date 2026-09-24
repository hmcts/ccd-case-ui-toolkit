import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('keeps the mandatory dynamic list invalid until selected', async ({ page }) => {
  await page.goto('/');
  const list = page.getByRole('combobox', { name: 'Dynamic list' });
  await expect(page.getByTestId('advanced-status')).toHaveText('INVALID');
  await list.selectOption('one');
  await expect(page.getByTestId('advanced-status')).toHaveText('VALID');
});
