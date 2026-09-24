import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Palette dispatch', () => {
  test('uses ComponentLauncher arguments for read and write dispatch and safely falls back for unsupported fields', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('palette-component-launcher-read').getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(page.getByTestId('palette-component-launcher-write').getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(page.getByTestId('palette-unsupported-read')).toContainText('Field type not supported');
    await expect(page.getByTestId('palette-unsupported-write')).toContainText('Field type not supported');
  });
});
