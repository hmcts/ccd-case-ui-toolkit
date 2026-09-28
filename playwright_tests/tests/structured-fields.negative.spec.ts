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
});
