import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Structured fields', () => {
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
  test('clears a nested value without losing its sibling or parent values', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('structured-fields').getByRole('textbox', { name: 'Complex line' }).fill('Retained parent');
    const city = page.getByTestId('structured-fields').getByRole('textbox', { name: 'City' });
    await city.fill('London');
    await page.getByTestId('structured-fields').getByRole('textbox', { name: 'Country' }).fill('UK');
    await city.fill('');
    await city.blur();

    await expect.poll(async () => JSON.parse(await page.getByTestId('structured-values').innerText())['structured-complex']).toEqual({
      'complex-line': 'Retained parent',
      'complex-address': { 'complex-city': '', 'complex-country': 'UK' }
    });
  });
});
