import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';
import { paymentApiResponses } from '../mocks/payment-api.mock';

test.describe('Payment consumer responses', () => {
  test('shows WaysToPay empty-state guidance after an empty service-request response', async ({ page }) => {
    const response = page.waitForResponse('**/cases/1111222233334444/paymentgroups');
    await page.goto('/?host=miniapps');
    expect(await (await response).json()).toEqual(paymentApiResponses['/cases/1111222233334444/paymentgroups']);
    const payment = page.locator('ccd-ways-to-pay-field');

    await expect(payment.getByRole('heading', { name: 'If you are expecting to pay and are not able to see a service request,' })).toBeVisible();
    await expect(payment.getByText('please refresh and try in some time.', { exact: true })).toBeVisible();
    await expect(payment.getByRole('link', { name: 'Review', exact: true })).toHaveCount(0);
    await expect(payment.getByRole('link', { name: 'Pay now', exact: true })).toHaveCount(0);
  });

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
