import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('EXUI-5224-01 renders the form value and propagates an edited ISO date', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Toolkit date input' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Day', exact: true })).toHaveValue('09');
  await expect(page.getByRole('textbox', { name: 'Month', exact: true })).toHaveValue('04');
  await expect(page.getByRole('textbox', { name: 'Year', exact: true })).toHaveValue('2021');
  await expect(page.getByTestId('date-status')).toHaveText('VALID');

  await page.getByRole('textbox', { name: 'Day', exact: true }).fill('3');
  await page.getByRole('textbox', { name: 'Month', exact: true }).fill('2');
  await page.getByRole('textbox', { name: 'Year', exact: true }).fill('2026');
  await page.getByRole('textbox', { name: 'Year', exact: true }).press('Tab');
  await expect(page.getByTestId('date-value')).toHaveText('2026-02-03');
  await expect(page.getByTestId('date-status')).toHaveText('VALID');
  await expect(page.getByTestId('date-errors')).toHaveText('null');
});
