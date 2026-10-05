import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Money fields', () => {
  test('rejects malformed pounds-and-pence input and recovers after correction', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Money amount' });
    const field = input.locator('xpath=ancestor::div[contains(@class, "form-group")][1]');

    await input.fill('12.345');
    await input.blur();
    await expect(page.getByTestId('money-status')).toHaveText('INVALID');
    await expect(field).toHaveClass(/form-group-error/);

    await input.fill('12.34');
    await input.blur();
    await expect(page.getByTestId('money-status')).toHaveText('VALID');
    await expect(page.getByTestId('money-value')).toHaveText('1234');
    await expect(field).not.toHaveClass(/form-group-error/);
  });

  test('rejects an empty mandatory value after it has been touched', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Money amount' });
    const field = input.locator('xpath=ancestor::div[contains(@class, "form-group")][1]');

    await input.fill('1.00');
    await input.fill('');
    await input.blur();

    await expect(page.getByTestId('money-status')).toHaveText('INVALID');
    await expect(field).toHaveClass(/form-group-error/);
  });
});
