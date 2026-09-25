import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Structured fields', () => {
  test('renders and binds a complex field control', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('structured-fields')).toBeVisible();
    await page.getByRole('textbox', { name: 'Complex line' }).fill('Complex value');
    await page.getByRole('textbox', { name: 'City' }).fill('London');
    await page.getByRole('textbox', { name: 'Country' }).fill('UK');
    const values = page.getByTestId('structured-values');
    await expect(values).toContainText('"complex-line": "Complex value"');
    await expect(values).toContainText('"complex-address": {');
    await expect(values).toContainText('"complex-city": "London"');
    await expect(values).toContainText('"complex-country": "UK"');
  });

  test('validates a mandatory nested complex field', async ({ page }) => {
    await page.goto('/');
    const required = page.getByRole('textbox', { name: 'Required line' });
    await expect(page.getByTestId('structured-status')).toHaveText('INVALID');
    await required.fill('Required value');
    await expect(page.getByTestId('structured-status')).toHaveText('VALID');
    await expect(page.getByTestId('structured-values')).toContainText('Required value');
    await required.fill('');
    await required.blur();
    await expect(page.getByTestId('structured-status')).toHaveText('INVALID');
    await required.fill('Corrected value');
    await expect(page.getByTestId('structured-status')).toHaveText('VALID');
    await expect(page.getByTestId('structured-values')).toContainText('Corrected value');
  });
});
