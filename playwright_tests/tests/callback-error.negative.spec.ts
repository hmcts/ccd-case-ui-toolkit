import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('renders a callback error through the alert service seam', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('callback-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'Simulate callback error' }).click();

  const error = page.getByTestId('callback-error');
  await expect(error).toBeVisible();
  await expect(error).toContainText('The callback failed. Please try again.');
  await expect(error.locator('.hmcts-banner')).toHaveClass(/hmcts-banner--warning/);
});
