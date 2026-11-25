import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('renders and binds a mandatory date and time field', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Toolkit date input' })).toBeVisible();
  const dateTime = page.locator('#test-date-time input');
  await expect(dateTime).toHaveValue(/10:30/);
  await expect(page.getByTestId('date-time-status')).toHaveText('VALID');
  await expect(page.getByTestId('date-time-value')).toHaveText('2021-04-09T10:30:00.000');
  await dateTime.fill('12-06-2024 14:45');
  await dateTime.blur();
  await expect(page.getByTestId('date-time-value')).toHaveText('2024-06-12T14:45:00.000');
  await expect(page.getByTestId('date-time-status')).toHaveText('VALID');
});

test('exposes the configured date-time entry format', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#test-date-time input')).toHaveAttribute('aria-label', /DD-MM-YYYY HH:mm/);
});
