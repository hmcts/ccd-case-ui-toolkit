import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Query Management workflow', () => {
  test('shows a response to internal users and identifies a closed query', async ({ page }) => {
    await page.goto('/');

    const launchers = page.getByTestId('launcher-mini-app-controls');
    await launchers.getByRole('button', { name: 'Evidence request', exact: true }).click();
    await expect(launchers.locator('table[aria-describedby="Response of the query"]')).toBeVisible();
    await expect(launchers.getByRole('row', { name: /Caseworker name HMCTS responder/ })).toBeVisible();
    await expect(launchers.getByText('Evidence received', { exact: true })).toBeVisible();

    await launchers.getByRole('button', { name: 'Back to query list' }).click();
    await launchers.getByRole('button', { name: 'Closed evidence request' }).click();
    await expect(launchers.getByText('This query has been closed by HMCTS staff.', { exact: true })).toBeVisible();
  });

  test('withholds the responder identity from external users', async ({ page }) => {
    await page.goto('/?external-user');

    const launchers = page.getByTestId('launcher-mini-app-controls');
    await launchers.getByRole('button', { name: 'Evidence request', exact: true }).click();
    await expect(launchers.locator('table[aria-describedby="Response of the query"]')).toBeVisible();
    await expect(launchers.getByRole('row', { name: /Caseworker name/ })).toHaveCount(0);
    await expect(launchers.getByText('Evidence received', { exact: true })).toBeVisible();
    await expect(launchers.getByRole('button', { name: 'Ask a follow-up question' })).toBeVisible();
  });

  test('does not offer follow-up actions to internal users for a closed query', async ({ page }) => {
    await page.goto('/');

    const launchers = page.getByTestId('launcher-mini-app-controls');
    await launchers.getByRole('button', { name: 'Closed evidence request' }).click();
    await expect(launchers.getByText('This query has been closed by HMCTS staff.', { exact: true })).toBeVisible();
    await expect(launchers.getByRole('button', { name: 'Ask a follow-up question' })).toHaveCount(0);
  });

  test('does not offer follow-up actions to judiciary users', async ({ page }) => {
    await page.goto('/?judiciary-user');

    const launchers = page.getByTestId('launcher-mini-app-controls');
    await launchers.getByRole('button', { name: 'Evidence request', exact: true }).click();
    await expect(launchers.getByText('Evidence received', { exact: true })).toBeVisible();
    await expect(launchers.getByRole('button', { name: 'Ask a follow-up question' })).toHaveCount(0);
  });
});
