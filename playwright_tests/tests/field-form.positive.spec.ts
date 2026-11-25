import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Field form controls', () => {
  test('binds editable fields while rendering a read-only value', async ({ page }) => {
    await page.goto('/');
    const fields = page.getByTestId('field-form-fields');

    await page.getByRole('textbox', { name: 'Field form required' }).fill('Required value');
    await page.getByRole('textbox', { name: 'Field form optional' }).fill('Optional value');

    await expect(page.getByTestId('field-form-status')).toHaveText('VALID');
    await expect(page.getByTestId('field-form-values')).toContainText('"field-form-required": "Required value"');
    await expect(page.getByTestId('field-form-values')).toContainText('"field-form-optional": "Optional value"');
    await expect(fields.getByText('Read-only value', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Field form read-only' })).toHaveCount(0);
  });
});
