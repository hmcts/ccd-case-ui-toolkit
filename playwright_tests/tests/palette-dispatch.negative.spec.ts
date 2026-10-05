import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Palette dispatch', () => {
  test('shows the unsupported fallback for unknown field types and launcher arguments in both modes', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('palette-unsupported-read')).toContainText('Field type not supported');
    await expect(page.getByTestId('palette-unsupported-write')).toContainText('Field type not supported');
    await expect(page.getByTestId('palette-unknown-launcher-read')).toContainText('Field type not supported');
    await expect(page.getByTestId('palette-unknown-launcher-write')).toContainText('Field type not supported');
  });
});
