import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('renders and updates a mandatory date and time field', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Toolkit date input' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Hour', exact: true })).toHaveValue('10');
  await expect(page.getByRole('textbox', { name: 'Minute', exact: true })).toHaveValue('30');
  await expect(page.getByTestId('date-time-status')).toHaveText('VALID');

  await page.getByRole('textbox', { name: 'Hour', exact: true }).fill('11');
  await page.getByRole('textbox', { name: 'Minute', exact: true }).fill('45');
  await page.getByRole('textbox', { name: 'Minute', exact: true }).press('Tab');
  await expect(page.getByTestId('date-time-value')).toContainText('11:45');
});
