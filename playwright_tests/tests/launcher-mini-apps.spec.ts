import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

type AngularDebugApi = {
  getComponent: (element: Element) => { CCD_CASE_NUMBER?: string, LOGGEDINUSERROLES?: string[] } | null;
};

test.describe('launcher and mini-application components', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      '**/assets/fonts/**',
      '**/assets/images/folder*.png',
      '**/assets/images/icon-search-black.svg',
      '**/assets/img/case-file-view/**',
      '**/assets/img/sort/sort-arrows.svg'
    ].map((url) => page.route(url, (route) => route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" />'
    }))));
  });

  test('loads a service-faked case file for the routed case and expands its document tree', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(page.getByRole('tree', { name: 'Case documents' })).toBeVisible();
    await page.getByLabel('Beers folder, 3 documents').click();
    await expect(page.getByLabel('Lager encyclopedia')).toBeVisible();
  });

  test('renders launcher data and supports history interaction', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Case flags' })).toBeVisible();
    await expect(page.getByText('Reasonable adjustment')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Evidence request' })).toBeVisible();
    await page.getByRole('button', { name: 'Evidence request' }).click();
    await expect(page.locator('table[aria-describedby="Details of the query"]')).toBeVisible();
    await expect(page.getByText('Please provide evidence')).toBeVisible();
    await page.getByRole('row', { name: /you are on event Case created row/ }).click();
    await expect(page.locator('.EventLog-DetailsPanel')).toContainText('Case created');
  });

  test('passes the authenticated consumer contract to payments and keeps bad launchers explicit', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('userDetails', JSON.stringify({ roles: ['caseworker-test'] })));
    await page.goto('/');

    const payment = page.locator('ccd-ways-to-pay-field ccpay-payment-lib');
    await expect(payment).toHaveCount(1);
    await expect.poll(() => payment.evaluate((element) => {
      const component = (window as Window & { ng?: AngularDebugApi }).ng?.getComponent(element);
      return component?.CCD_CASE_NUMBER;
    })).toBe('1111222233334444');
    await expect.poll(() => payment.evaluate((element) => {
      const component = (window as Window & { ng?: AngularDebugApi }).ng?.getComponent(element);
      return component?.LOGGEDINUSERROLES;
    })).toEqual(['caseworker-test']);
    await expect(payment.getByRole('heading', { name: 'If you are expecting to pay and are not able to see a service request,' })).toBeVisible();
    await expect(payment.getByText('No refunds recorded')).toBeVisible();
    await expect(page.getByText('Field type not supported')).toHaveCount(1);
  });
});
