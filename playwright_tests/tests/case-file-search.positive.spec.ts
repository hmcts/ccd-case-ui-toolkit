import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case File Viewer search and ordering', () => {
  test('finds a named document and restores the category tree when cleared', async ({ page }) => {
    await page.goto('/');
    const viewer = page.getByTestId('launcher-mini-app-controls');
    await viewer.getByRole('searchbox', { name: 'Search by document name' }).fill('Lager');
    await expect(viewer.getByRole('treeitem', { name: 'Lager encyclopedia', exact: true })).toBeVisible();
    await expect(viewer.getByRole('treeitem', { name: 'Ale encyclopedia', exact: true })).toHaveCount(0);
    await viewer.getByRole('searchbox', { name: 'Search by document name' }).fill('No matching document');
    await expect(viewer.getByText('No results found', { exact: true })).toBeVisible();
    await expect(viewer.getByRole('treeitem')).toHaveCount(0);
    await viewer.getByRole('searchbox', { name: 'Search by document name' }).clear();
    await expect(viewer.locator('button[aria-label="Beers folder, 3 documents"]')).toBeVisible();
    await viewer.locator('button[aria-label="Beers folder, 3 documents"]').click();
    await expect(viewer.getByRole('treeitem', { name: 'Ale encyclopedia', exact: true })).toBeVisible();
  });

  test('orders the same filtered documents in both directions without losing matches', async ({ page }) => {
    await page.goto('/');
    const viewer = page.getByTestId('launcher-mini-app-controls');
    await viewer.getByRole('searchbox', { name: 'Search by document name' }).fill('encyclopedia');
    await viewer.locator('ccd-case-file-view-folder-sort button').click();
    await page.getByText('A to Z ascending', { exact: true }).click();
    const documents = viewer.locator('button.case-file__node');
    await expect.poll(() => documents.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))).toEqual([
      'Ale encyclopedia', 'Beers encyclopedia', 'Lager encyclopedia'
    ]);
    await viewer.locator('ccd-case-file-view-folder-sort button').click();
    await page.getByText('Z to A descending', { exact: true }).click();
    await expect.poll(() => documents.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))).toEqual([
      'Lager encyclopedia', 'Beers encyclopedia', 'Ale encyclopedia'
    ]);
  });
});
