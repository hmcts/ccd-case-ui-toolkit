import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Field form controls', () => {
  test('returns to invalid when a completed required field is cleared and recovers', async ({ page }) => {
    await page.goto('/');
    const required = page.getByRole('textbox', { name: 'Field form required' });

    await expect(page.getByTestId('field-form-status')).toHaveText('INVALID');
    await required.fill('Temporary value');
    await expect(page.getByTestId('field-form-status')).toHaveText('VALID');
    await required.fill('');
    await required.blur();
    await expect(page.getByTestId('field-form-status')).toHaveText('INVALID');
    await expect(required.locator('..')).toHaveClass(/form-group-error/);

    await required.fill('Corrected value');
    await expect(page.getByTestId('field-form-status')).toHaveText('VALID');
    await expect(required.locator('..')).not.toHaveClass(/form-group-error/);
    await expect(page.getByTestId('field-form-values')).toContainText('"field-form-required": "Corrected value"');
  });
});
