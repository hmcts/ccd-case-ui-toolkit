import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('binds postcode and dynamic list controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Postcode' }).fill('SW1A 1AA');
  await page.getByRole('combobox', { name: 'Dynamic list' }).selectOption('two');
  await page.getByRole('radio', { name: 'Two', exact: true }).check();
  await page.getByRole('checkbox', { name: 'One', exact: true }).check();
  const values = page.getByTestId('advanced-values');
  await expect(values).toContainText('"advanced-postcode":"SW1A 1AA"');
  await expect(values).toContainText('"Dynamic list":"two"');
  await expect(values).toContainText('"Dynamic radio":"two"');
  await expect(values).toContainText('"Dynamic multi":["one"]');
});

test('enters rich text content', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('.ccd-rich-text-area__editor [contenteditable="true"]');
  await editor.fill('Rich text value');
  await expect(page.getByTestId('advanced-values')).toContainText('Rich text value');
});
