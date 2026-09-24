import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('viewer and payment components', () => {
  test('renders order summary values and payment warning', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.getByText('Application fee')).toBeVisible();
    await expect(page.getByText('£100.00')).toBeVisible();
    await expect(page.getByText('Recent payments may take a few minutes to reflect here.')).toBeVisible();
  });
});
