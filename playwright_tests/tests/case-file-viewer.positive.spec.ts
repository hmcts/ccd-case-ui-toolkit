import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
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

  test('downloads the selected PDF contents from its action menu', async ({ page }) => {
    const pdf = await readFile(resolve(__dirname, '../mocks/documents/toolkit.pdf'));
    await page.goto('/?host=miniapps&case-file=actions');
    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Download', { exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Lager encyclopedia.pdf');
    const downloadPath = await download.path();
    expect(downloadPath).not.toBeNull();
    expect(await readFile(downloadPath!)).toEqual(pdf);
  });

  test('opens printable document content from its action menu', async ({ page }) => {
    await page.goto('/?host=miniapps&case-file=print');
    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();
    const printPopupPromise = page.waitForEvent('popup');
    await page.getByText('Print', { exact: true }).click();
    const popup = await printPopupPromise;
    await expect(popup).toHaveURL(/\/test\/printable\.html$/);
    await expect(popup.getByRole('heading', { name: 'Toolkit printable document' })).toBeVisible();
  });

  test('refreshes the document tree after a successful category update', async ({ page }) => {
    await page.goto('/?host=miniapps&case-file-edit&case-file-move-success');
    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();
    await page.getByText('Change folder', { exact: true }).click();
    await page.getByRole('radio', { name: 'Folder icon Wines' }).last().check();
    const reload = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame());
    await page.getByRole('button', { name: 'Save' }).click();
    await reload;
    await page.waitForLoadState('load');

    await expect(page.getByText('We couldn\'t move the document. Please try again.', { exact: true })).toHaveCount(0);
    await expect(launcherControls.getByRole('tree', { name: 'Case documents' })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('case-file-update')!))).toEqual({
      caseId: '1111222233334444', version: 1, attributePath: 'caseDocuments.0.document', category: 'Wines'
    });
    await launcherControls.getByLabel('Beers folder, 2 documents').click();
    await expect(launcherControls.getByLabel('Lager encyclopedia', { exact: true })).not.toBeVisible();
    await launcherControls.getByLabel('Wines folder, 5 documents').click();
    await expect(launcherControls.getByLabel('Lager encyclopedia', { exact: true })).toBeVisible();
  });
});
