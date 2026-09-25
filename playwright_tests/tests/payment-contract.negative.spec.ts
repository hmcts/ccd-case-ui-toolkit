import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';
import { paymentApiResponses } from '../mocks/payment-api.mock';

test.describe('Payment consumer responses', () => {
  test('shows an empty payment history without a populated payment row', async ({ page }) => {
    await page.route('**/cases/1111222233334444/paymentgroups', (route) => route.fulfill({
      json: paymentApiResponses['/cases/1111222233334444/paymentgroups']
    }));
    await page.goto('/?payment-history');
    const history = page.getByTestId('viewer-payment-controls');

    await expect(history.getByText('No payments recorded', { exact: true })).toBeVisible();
    await expect(history.getByRole('row', { name: /PAY-001/ })).toHaveCount(0);
    await expect(history.getByText('Recent payments may take a few minutes to reflect here.')).toBeVisible();
  });
});
