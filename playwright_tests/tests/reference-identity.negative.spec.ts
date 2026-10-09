import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Reference identity controls', () => {
  test('recovers a missing staff record using the judicial identity', async ({ page }) => {
    await page.goto('/');
    const controls = page.getByTestId('reference-identity-controls');
    const fallback = controls.locator('ccd-read-staff-user-field').filter({ hasText: 'Judicial Fallback' });

    await expect(fallback).toHaveText('Judicial Fallback');
    await expect(fallback).not.toContainText('Staff Member');
    await expect(controls.getByText('Staff Member', { exact: true })).toBeVisible();
  });
});
