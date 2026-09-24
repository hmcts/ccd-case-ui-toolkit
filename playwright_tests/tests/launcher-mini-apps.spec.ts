import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

const hostPresentationAssets = [
  '/assets/fonts/bold-affa96571d-v2.woff',
  '/assets/fonts/bold-b542beb274-v2.woff2',
  '/assets/fonts/light-94a07e06a1-v2.woff2',
  '/assets/fonts/light-f591b13f7d-v2.woff',
  '/assets/images/folder-open.png',
  '/assets/images/folder.png',
  '/assets/images/icon-search-black.svg',
  '/assets/img/case-file-view/case-file-view-document.svg',
  '/assets/img/case-file-view/document-menu/more_vert.svg',
  '/assets/img/sort/sort-arrows.svg'
];

test.describe('launcher and mini-application components', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    if (!baseURL) {
      throw new Error('The toolkit host baseURL must be configured');
    }
    await Promise.all(hostPresentationAssets.map((assetPath) => page.route(new URL(assetPath, baseURL).href, (route) => route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" />'
    }))));
  });

  test('loads a service-faked case file for the routed case and expands its document tree', async ({ page }) => {
    await page.goto('/');

    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await expect(launcherControls.getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(launcherControls.getByRole('tree', { name: 'Case documents' })).toBeVisible();
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    await expect(launcherControls.getByLabel('Lager encyclopedia')).toBeVisible();
  });

  test('renders launcher data and supports history interaction', async ({ page }) => {
    await page.goto('/');

    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await expect(launcherControls.getByRole('heading', { name: 'Case flags' })).toBeVisible();
    await expect(page.getByText('Reasonable adjustment')).toBeVisible();
    await expect(launcherControls.getByRole('button', { name: 'Evidence request' })).toBeVisible();
    await launcherControls.getByRole('button', { name: 'Evidence request' }).click();
    await expect(launcherControls.locator('table[aria-describedby="Details of the query"]')).toBeVisible();
    await expect(page.getByText('Please provide evidence')).toBeVisible();
    await page.getByRole('row', { name: /you are on event Case created row/ }).click();
    await expect(page.locator('.EventLog-DetailsPanel')).toContainText('Case created');
  });

  test('passes the authenticated consumer contract to payments and keeps bad launchers explicit', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('userDetails', JSON.stringify({ roles: ['caseworker-test'] })));
    await page.goto('/');

    const payment = page.locator('ccd-ways-to-pay-field ccpay-payment-lib');
    await expect(payment).toHaveCount(1);
    await expect(payment.getByRole('heading', { name: 'If you are expecting to pay and are not able to see a service request,' })).toBeVisible();
    await expect(payment.getByText('No refunds recorded')).toBeVisible();
    await expect(page.getByTestId('launcher-mini-app-controls').getByText('Field type not supported')).toHaveCount(1);
  });
});
