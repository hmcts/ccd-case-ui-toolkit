import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case notifier state', () => {
  test('replaces rendered notifier state when it publishes a new case', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('case-notifier-state')).toHaveText('No case selected');
    await page.getByRole('button', { name: 'Publish challenged case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('1111-2222-3333-4444: CHALLENGED');
    await page.getByRole('button', { name: 'Publish standard case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('4444-3333-2222-1111: STANDARD');
  });
});
