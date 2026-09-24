import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('keeps the mandatory dynamic list invalid until selected', async ({ page }) => {
  await page.goto('/');
  const list = page.getByRole('combobox', { name: 'Dynamic list' });
  await expect(list).toHaveClass(/ng-invalid/);
  await list.selectOption({ label: 'One' });
  await expect(list).toHaveClass(/ng-valid/);
});
