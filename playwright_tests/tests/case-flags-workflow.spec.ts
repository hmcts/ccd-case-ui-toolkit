import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('case flags workflow', () => {
  test('renders internal grouped party flags and case-level flags', async ({ page }) => {
    await page.goto('/?case-flags=internal');

    const caseFlags = page.getByTestId('case-flags-workflow');
    await expect(caseFlags.getByRole('heading', { name: 'Case flags', exact: true })).toBeVisible();
    await expect(caseFlags.getByRole('table', { name: 'Witness One' })).toContainText('POTENTIALLY VIOLENT PERSON');
    await expect(caseFlags.getByRole('table', { name: 'Witness One' })).toContainText('Reasonable adjustment');
    await expect(caseFlags.getByRole('table', { name: 'Case level flags' })).toContainText('Judge review required');
  });

  test('renders external support view without case-level flags', async ({ page }) => {
    await page.goto('/?case-flags=external');

    const caseFlags = page.getByTestId('case-flags-workflow');
    await expect(caseFlags.getByRole('heading', { name: 'Support requested' })).toBeVisible();
    await expect(caseFlags.getByText('Reasonable adjustment')).toBeVisible();
    await expect(caseFlags.getByText('Needs step-free access')).toBeVisible();
    await expect(caseFlags.getByText('Case-level flag')).toHaveCount(0);
    await expect(caseFlags.getByText('Judge review required')).toHaveCount(0);
  });
});
