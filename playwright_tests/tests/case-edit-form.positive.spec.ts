import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('accepts a corrected required value and preserves the optional value', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Case edit form validation and state' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Optional field' }).fill('Keep this value');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  await expect(page.getByTestId('editor-page')).toHaveText('1');

  await page.getByRole('textbox', { name: 'Required field' }).fill('Complete this field');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByTestId('editor-page')).toHaveText('2');
  await expect(page.getByTestId('editor-optional-value')).toHaveText('Keep this value');
  await expect(page.getByTestId('editor-values')).toContainText('"editor-required": "Complete this field"');
});
