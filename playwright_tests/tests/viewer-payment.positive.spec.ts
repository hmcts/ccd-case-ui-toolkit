import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('viewer and payment components', () => {
  test('renders order summary values and payment warning', async ({ page }) => {
    await page.goto('/?payment-history');
    const viewerPayment = page.getByTestId('viewer-payment-controls');
    await expect(viewerPayment.getByText('Order Summary')).toBeVisible();
    await expect(viewerPayment.locator('table[aria-describedby="order summary table"]')).toBeVisible();
    await expect(viewerPayment.getByText('Application fee')).toBeVisible();
    const orderSummary = viewerPayment.locator('table[aria-describedby="order summary table"]');
    await expect(orderSummary.getByText('£100.00')).toHaveCount(2);
    await expect(viewerPayment.getByText('Recent payments may take a few minutes to reflect here.')).toBeVisible();
    await expect(viewerPayment.getByText('Payments', { exact: true })).toBeVisible();
    await expect(viewerPayment.getByText('No payments recorded')).toBeVisible();
  });
});
