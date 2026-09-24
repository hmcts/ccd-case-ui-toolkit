import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('renders and binds a complex field control', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('structured-fields')).toBeVisible();
  await page.getByRole('textbox', { name: 'Complex line' }).fill('Complex value');
  await expect(page.getByTestId('structured-values')).toContainText('Complex value');
});

test('validates a mandatory nested complex field', async ({ page }) => {
  await page.goto('/');
  const required = page.getByRole('textbox', { name: 'Required line' });
  await expect(page.getByTestId('structured-status')).toHaveText('INVALID');
  await required.fill('Required value');
  await expect(page.getByTestId('structured-status')).toHaveText('VALID');
  await expect(page.getByTestId('structured-values')).toContainText('Required value');
});
