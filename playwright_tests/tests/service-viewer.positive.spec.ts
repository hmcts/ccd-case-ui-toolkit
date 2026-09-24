import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Service-backed viewer state', () => {
  test('replaces the viewer case when the notifier publishes a new case', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('service-viewer-case')).toHaveText('No case selected');
    await page.getByRole('button', { name: 'Publish challenged case' }).click();
    await expect(page.getByTestId('service-viewer-case')).toHaveText('1111-2222-3333-4444: CHALLENGED');
    await page.getByRole('button', { name: 'Publish standard case' }).click();
    await expect(page.getByTestId('service-viewer-case')).toHaveText('4444-3333-2222-1111: STANDARD');
  });
});
