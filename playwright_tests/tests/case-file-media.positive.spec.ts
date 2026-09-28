import { resolve } from 'node:path';
import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

// Playwright 1.63 DOM snapshot Streamer throws attributesCached for the PDF canvas.
// Retain other trace evidence; restore DOM snapshots when fixed upstream.
test.use({ trace: { mode: 'retain-on-failure', snapshots: false, screenshots: true, sources: true } });

test.describe('PDF document rendering', () => {
  test('opens a document in the media viewer and exposes document actions', async ({ page }) => {
    await page.route('**/em-anno/annotation-sets/filter?documentId=lager', (route) => route.fulfill({ status: 204 }));
    await page.route('**/api/markups/lager', (route) => route.fulfill({ json: [] }));
    await page.route('**/em-anno/lager/bookmarks', (route) => route.fulfill({ json: [] }));
    await page.route('**/em-anno/metadata/lager', (route) => route.fulfill({ json: {} }));
    await page.route('https://document.example/documents/lager/binary', (route) => route.fulfill({
      status: 200,
      contentType: 'application/pdf',
      path: resolve(__dirname, '../mocks/documents/toolkit.pdf')
    }));
    await page.goto('/');

    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await launcherControls.getByLabel('Beers folder, 3 documents').click();
    await launcherControls.getByLabel('Lager encyclopedia').click();
    await expect(launcherControls.locator('mv-media-viewer')).toHaveCount(1);
    await expect(launcherControls.locator('mv-media-viewer canvas').first()).toBeVisible();

    const documentActions = launcherControls.locator('ccd-case-file-view-folder-document-actions').first();
    await documentActions.getByRole('button', { name: 'More document options' }).click();
    const documentMenu = page.locator('.overlay-menu');
    await expect(documentMenu.getByText('Open in a new tab', { exact: true })).toBeVisible();
    await expect(documentMenu.getByText('Download', { exact: true })).toBeVisible();
    await expect(documentMenu.getByText('Print', { exact: true })).toBeVisible();
  });
});
