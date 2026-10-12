import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Date fields', () => {
  test('rejects partial and cleared input then accepts correction', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Day', exact: true }).fill('');
    await page.getByRole('textbox', { name: 'Day', exact: true }).press('Tab');
    await expect(page.getByTestId('date-value')).toHaveText('2021-04-');
    await expect(page.getByTestId('date-status')).toHaveText('INVALID');
    await expect(page.getByTestId('date-errors')).toHaveText('{ "pattern": "Date is not valid" }');

    await page.getByRole('textbox', { name: 'Month', exact: true }).fill('');
    await page.getByRole('textbox', { name: 'Year', exact: true }).fill('');
    await page.getByRole('textbox', { name: 'Year', exact: true }).press('Tab');
    await expect(page.getByTestId('date-value')).toHaveText('');
    await expect(page.getByTestId('date-status')).toHaveText('INVALID');
    await expect(page.getByTestId('date-errors')).toHaveText('{ "required": "This field is required" }');

    await page.getByRole('textbox', { name: 'Day', exact: true }).fill('3');
    await page.getByRole('textbox', { name: 'Month', exact: true }).fill('2');
    await page.getByRole('textbox', { name: 'Year', exact: true }).fill('2026');
    await page.getByRole('textbox', { name: 'Year', exact: true }).press('Tab');
    await expect(page.getByTestId('date-value')).toHaveText('2026-02-03');
    await expect(page.getByTestId('date-status')).toHaveText('VALID');
    await expect(page.getByTestId('date-errors')).toHaveText('null');
  });
});
