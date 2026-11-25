import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Workflow contracts', () => {
  for (const subject of ['Awaiting hearing answer', 'Evidence request']) {
    test(`withholds duplicate follow-up for ${subject} while awaiting a response`, async ({ page }) => {
      await page.goto('/?workflow-contract');
      const query = page.getByTestId('workflow-query');
      await query.getByRole('button', { name: subject, exact: true }).click();
      await expect(query.getByText('Your query is under review', { exact: true })).toBeVisible();
      await expect(query.getByRole('button', { name: 'Ask a follow-up question' })).toHaveCount(0);
      await expect(query.getByRole('row', { name: /Caseworker name/ })).toHaveCount(0);
    });
  }

  test('empty linked case collections show None without a disclosure action', async ({ page }) => {
    await page.goto('/?workflow-contract&workflow-linked');
    const linked = page.getByTestId('workflow-query');
    await expect(linked.getByText('None', { exact: true })).toHaveCount(2);
    await expect(linked.getByRole('button', { name: 'Show', exact: true })).toHaveCount(0);
    await expect(linked.getByText('Some case information is not available at the moment')).toHaveCount(0);
  });

  test('linked-from service failure reports unavailable information instead of an empty result', async ({ page }) => {
    await page.goto('/?workflow-contract&workflow-linked&linked-error');
    const linked = page.getByTestId('workflow-query');
    await expect(linked.getByText('Some case information is not available at the moment', { exact: true })).toBeVisible();
    await expect(linked.getByRole('link', { name: 'Reload the Linked cases tab' })).toBeVisible();
    await expect(linked.locator('table[aria-describedby="table to display cases linked from"]').getByText('None', { exact: true })).toHaveCount(0);
    await expect(linked.getByRole('button', { name: 'Show', exact: true })).toHaveCount(0);
  });
});
