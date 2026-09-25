import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

const hostPresentationAssets = [
  '/assets/fonts/bold-affa96571d-v2.woff',
  '/assets/fonts/bold-b542beb274-v2.woff2',
  '/assets/fonts/light-94a07e06a1-v2.woff',
  '/assets/fonts/light-f591b13f7d-v2.woff',
  '/assets/images/folder-open.png',
  '/assets/images/folder.png',
  '/assets/images/icon-search-black.svg',
  '/assets/img/case-file-view/case-file-view-document.svg',
  '/assets/img/case-file-view/document-menu/more_vert.svg',
  '/assets/img/sort/sort-arrows.svg'
];

test.describe('Case File Viewer document actions', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    if (!baseURL) {
      throw new Error('The toolkit host baseURL must be configured');
    }
    await Promise.all(hostPresentationAssets.map((assetPath) => page.route(new URL(assetPath, baseURL).href, (route) => route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" />'
    }))));
  });

  test('downloads and opens a document for printing from its action menu', async ({ page }) => {
    await page.goto('/?case-file=actions');
    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Download', { exact: true }).click();
    await expect((await downloadPromise).suggestedFilename()).toBe('Lager encyclopedia.html');

    await documentActions.getByRole('button', { name: 'More document options' }).click();
    const printPopupPromise = page.waitForEvent('popup');
    await page.getByText('Print', { exact: true }).click();
    await expect(await printPopupPromise).toHaveURL(/\/test\/binary$/);
  });

  test('refreshes the document tree after a successful category update', async ({ page }) => {
    await page.goto('/?case-file-edit&case-file-move-success');
    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();
    await page.getByText('Change folder', { exact: true }).click();
    await page.getByRole('radio', { name: 'Folder icon Wines' }).last().check();
    const reload = page.waitForEvent('framenavigated');
    await page.getByRole('button', { name: 'Save' }).click();
    await reload;

    await expect(page.getByText('We couldn\'t move the document. Please try again.', { exact: true })).toHaveCount(0);
    await expect(launcherControls.getByRole('tree', { name: 'Case documents' })).toBeVisible();
  });
});
