import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('launcher and mini-application components', () => {
  test('loads a service-faked case file through ComponentLauncher and opens a document', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(page.getByRole('tree', { name: 'Case documents' })).toBeVisible();
    await page.getByRole('treeitem', { name: 'Beers folder, 3 documents' }).click();
    await page.getByRole('treeitem', { name: 'Lager encyclopedia' }).click();
    await expect(page.locator('mv-media-viewer')).toHaveCount(1);
  });

  test('keeps payment integration and unsupported launcher fallback explicit', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('ccd-ways-to-pay-field')).toHaveCount(1);
    await expect(page.getByText('Field type not supported')).toHaveCount(1);
  });
});
