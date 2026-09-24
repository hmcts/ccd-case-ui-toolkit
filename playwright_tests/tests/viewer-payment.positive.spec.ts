import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('viewer and payment components', () => {
  test('renders order summary values and payment warning', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.locator('table[aria-describedby="order summary table"]')).toBeVisible();
    await expect(page.getByText('Application fee')).toBeVisible();
    const orderSummary = page.locator('table[aria-describedby="order summary table"]');
    await expect(orderSummary.getByText('£100.00')).toHaveCount(2);
    await expect(page.locator('ccpay-payment-lib')).toHaveCount(1);
    await expect(page.getByText('Recent payments may take a few minutes to reflect here.')).toBeVisible();
  });
});
