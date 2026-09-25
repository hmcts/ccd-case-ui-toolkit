import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('binds postcode and dynamic list controls', async ({ page }) => {
  await page.goto('/');
  const advancedFields = page.getByTestId('advanced-fields');
  await advancedFields.getByRole('textbox', { name: 'Postcode' }).fill('SW1A 1AA');
  await advancedFields.getByRole('combobox', { name: 'Dynamic list' }).selectOption({ label: 'Two' });
  await advancedFields.getByRole('radio', { name: 'Two', exact: true }).check();
  await advancedFields.getByRole('checkbox', { name: 'One', exact: true }).check();
  const values = page.getByTestId('advanced-values');
  await expect(values).toContainText('"advanced-postcode": "SW1A 1AA"');
  await expect(values).toContainText('"Dynamic list": "two"');
  await expect(values).toContainText('"Dynamic radio": "two"');
  await expect(values).toContainText('"code": "one"');
});

test('enters rich text content', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('.NgxEditor__Content[contenteditable="true"]');
  await editor.fill('Rich text value');
  await expect(page.getByTestId('advanced-values')).toContainText('Rich text value');
});
