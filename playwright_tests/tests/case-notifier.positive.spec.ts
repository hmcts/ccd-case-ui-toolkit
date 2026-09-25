import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case notifier refresh', () => {
  test('publishes and replaces rendered state from the cases service', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('case-notifier-state')).toHaveText('No case selected');
    await page.getByRole('button', { name: 'Refresh challenged case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('2222-3333-4444-5555: CHALLENGED');
    await page.getByRole('button', { name: 'Refresh standard case' }).click();
    await expect(page.getByTestId('case-notifier-state')).toHaveText('4444-3333-2222-1111: STANDARD');
  });
});
