import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('renders read-only identity controls and keeps mixed form editable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('ccd-read-case-link-field a')).toHaveAttribute('href', '/v2/case/1234567890123456');
  await expect(page.getByText('Read-only label', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Editable note' }).fill('Updated note');
  await expect(page.getByTestId('identity-mixed-value')).toContainText('Updated note');
});

