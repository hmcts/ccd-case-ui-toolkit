import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case notifier refresh', () => {
  test('preserves the selected case after a failed refresh and accepts the next successful refresh', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Refresh challenged case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('2222-3333-4444-5555: CHALLENGED');

    await page.getByRole('button', { name: 'Refresh unavailable case' }).click();
    await expect(page.getByTestId('case-notifier-error')).toHaveText('503');
    await expect(page.getByTestId('case-notifier-state')).toHaveText('2222-3333-4444-5555: CHALLENGED');

    await page.getByRole('button', { name: 'Refresh standard case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('4444-3333-2222-1111: STANDARD');
  });
});
