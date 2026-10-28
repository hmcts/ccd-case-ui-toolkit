import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case file states', () => {
  test('renders the service error page when categories cannot be loaded', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/?case-file=unavailable');

    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await expect(launcherControls.getByRole('heading', { name: 'Sorry, there is a problem with the service' })).toBeVisible();
    await expect(launcherControls.getByText('Try again later.')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('renders the case-file shell without documents when there are no categories', async ({ page }) => {
    await page.goto('/?case-file=empty');

    const launcherControls = page.getByTestId('launcher-mini-app-controls');
    await expect(launcherControls.getByRole('heading', { name: 'Case file' })).toBeVisible();
    await expect(launcherControls.getByRole('treeitem')).toHaveCount(0);
  });
});
