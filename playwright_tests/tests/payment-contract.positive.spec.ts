import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';
import { populatedPaymentGroups, unpaidServiceRequest } from '../mocks/payment-api.mock';

test.describe('Payment consumer responses', () => {
  test('renders an unpaid WaysToPay service request with its amount and review action', async ({ page }) => {
    await page.route('**/cases/1111222233334444/paymentgroups', (route) => route.fulfill({ json: unpaidServiceRequest }));
    await page.goto('/?host=miniapps');
    const payment = page.locator('ccd-ways-to-pay-field');
    const row = payment.getByRole('row', { name: /SR-001/ });

    await expect(row).toContainText('Not paid');
    await expect(row).toContainText('£125.50');
    await expect(row.getByRole('link', { name: 'Review', exact: true })).toBeVisible();
    await expect(payment.getByRole('heading', { name: 'If you are expecting to pay and are not able to see a service request,' })).toHaveCount(0);
  });

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
