import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Money fields', () => {
  test('accepts a pounds-and-pence value through the currency control', async ({ page }) => {
    await page.goto('/');
    const input = page.getByRole('textbox', { name: 'Money amount' });
    await input.fill('1250.50');
    await input.blur();

    await expect(input).toHaveValue('1250.50');
    await expect(page.getByTestId('money-value')).toHaveText('125050');
    await expect(input.locator('..').locator('..')).not.toHaveClass(/form-group-error/);
  });
});
