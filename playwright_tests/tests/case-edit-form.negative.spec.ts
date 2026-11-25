import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('keeps the form invalid while the required field is empty', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Case edit form validation and state' })).toBeVisible();

  const required = page.getByRole('textbox', { name: 'Required field' });
  await required.fill('temporary value');
  await required.fill('');
  await required.blur();

  await expect(page.locator('ccd-case-edit-form').getByText('Required field is required', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  await expect(page.getByTestId('editor-page')).toHaveText('1');
});
