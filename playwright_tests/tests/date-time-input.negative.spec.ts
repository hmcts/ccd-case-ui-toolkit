import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('rejects an empty mandatory date-time and accepts correction', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#test-date-time input');
  await input.fill('');
  await input.blur();
  await expect(page.getByTestId('date-time-status')).toHaveText('INVALID');
  await input.fill('29-02-2024 09:15');
  await input.blur();
  await expect(page.getByTestId('date-time-value')).toHaveText('2024-02-29T09:15:00.000');
  await expect(page.getByTestId('date-time-status')).toHaveText('VALID');
});
