import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';
import { populatedPaymentGroups } from '../mocks/payment-api.mock';

test.describe('Payment consumer responses', () => {
  test('renders a populated payment response with reference, amount and status', async ({ page }) => {
    await page.route('**/cases/1111222233334444/paymentgroups', (route) => route.fulfill({ json: populatedPaymentGroups }));
    await page.goto('/?payment-history');
    const history = page.getByTestId('viewer-payment-controls');
    const row = history.getByRole('row', { name: /PAY-001/ });
    await expect(row).toContainText('£125.50');
    await expect(row).toContainText('Success');
    await expect(row).toContainText('02 Jan 2025');
    await expect(history.getByText('No payments recorded', { exact: true })).toHaveCount(0);
  });
});
