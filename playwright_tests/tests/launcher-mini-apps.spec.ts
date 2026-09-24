import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('launcher and mini-application components', () => {
  test('loads a service-faked case file for the routed case and opens a document', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(page.getByRole('tree', { name: 'Case documents' })).toBeVisible();
    await page.getByRole('treeitem', { name: 'Beers folder, 3 documents' }).click();
    await page.getByRole('treeitem', { name: 'Lager encyclopedia' }).click();
    await expect(page.locator('mv-media-viewer')).toHaveCount(1);
  });

  test('renders launcher data and supports history interaction', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Case flags' })).toBeVisible();
    await expect(page.getByText('Reasonable adjustment')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Evidence request' })).toBeVisible();
    await page.getByRole('button', { name: 'Evidence request' }).click();
    await expect(page.getByRole('heading', { name: 'Query details' })).toBeVisible();
    await expect(page.getByText('Please provide evidence')).toBeVisible();
    await page.getByText('Case created', { exact: true }).click();
    await expect(page.locator('.EventLog-DetailsPanel')).toContainText('Case created');
  });

  test('passes the authenticated consumer contract to payments and keeps bad launchers explicit', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('userDetails', JSON.stringify({ roles: ['caseworker-test'] })));
    await page.goto('/');

    const payment = page.locator('ccpay-payment-lib');
    await expect(payment).toHaveCount(1);
    await expect(payment.evaluate((element) => (element as unknown as { CCD_CASE_NUMBER: string }).CCD_CASE_NUMBER)).resolves.toBe('1111222233334444');
    await expect(payment.evaluate((element) => (element as unknown as { LOGGEDINUSERROLES: string[] }).LOGGEDINUSERROLES)).resolves.toEqual(['caseworker-test']);
    await expect(page.getByText('Field type not supported')).toHaveCount(1);
  });
});
