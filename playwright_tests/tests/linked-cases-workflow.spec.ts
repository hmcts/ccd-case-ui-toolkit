import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Linked Cases workflow', () => {
  test('renders linked-to cases and reveals linked-from cases on request', async ({ page }) => {
    await page.goto('/?linked-cases');
    const linkedCases = page.getByTestId('linked-cases-control');

    await expect(linkedCases.getByText('Linked test case')).toBeVisible();
    await expect(linkedCases.getByRole('button', { name: 'Show' })).toBeVisible();
    await linkedCases.getByRole('button', { name: 'Show' }).click();
    await expect(linkedCases.getByText('Incoming linked case')).toBeVisible();
  });
});
