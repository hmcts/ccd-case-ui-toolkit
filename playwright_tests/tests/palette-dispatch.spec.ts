import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Palette dispatch', () => {
  test('uses ComponentLauncher arguments for read and write dispatch and safely falls back for unsupported fields', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('palette-component-launcher-read')).toHaveText(/CaseFileViewFieldComponent$/);
    await expect(page.getByTestId('palette-component-launcher-write')).toHaveText(/CaseFileViewFieldComponent$/);
    await expect(page.getByTestId('palette-unsupported')).toHaveText(/UnsupportedFieldComponent$/);
  });
});
