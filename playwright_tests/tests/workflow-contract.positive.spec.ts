import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Workflow contracts', () => {
  test('query list sorts both directions and restores the list after hearing details', async ({ page }) => {
    await page.goto('/?workflow-contract');
    const query = page.getByTestId('workflow-query');
    const subjects = query.locator('tbody tr td:first-child button');
    await query.getByRole('button', { name: 'Query subject' }).click();
    await expect(subjects).toHaveText(['Awaiting hearing answer', 'Closed evidence request', 'Evidence request']);
    await expect(query.getByRole('columnheader', { name: 'Query subject' })).toHaveAttribute('aria-sort', 'ascending');
    await query.getByRole('button', { name: 'Query subject' }).click();
    await expect(subjects).toHaveText(['Evidence request', 'Closed evidence request', 'Awaiting hearing answer']);
    await expect(query.getByRole('columnheader', { name: 'Query subject' })).toHaveAttribute('aria-sort', 'descending');
    await query.getByRole('button', { name: 'Awaiting hearing answer', exact: true }).click();
    await expect(query.getByRole('row', { name: 'What is the date of the hearing? 12 May 2025' })).toBeVisible();
    await expect(query.getByRole('button', { name: 'hearing-notice.pdf', exact: true })).toBeVisible();
    await query.getByRole('button', { name: 'Back to query list' }).click();
    await expect(subjects).toHaveCount(3);
    await expect(query.getByRole('button', { name: 'hearing-notice.pdf', exact: true })).toHaveCount(0);
  });

  test('configured service permits another follow-up while the previous follow-up awaits a response', async ({ page }) => {
    await page.goto('/?workflow-contract&multi-followup');
    const query = page.getByTestId('workflow-query');
    await query.getByRole('button', { name: 'Evidence request', exact: true }).click();
    await expect(query.getByText('Please confirm receipt date', { exact: true })).toBeVisible();
    await expect(query.getByRole('button', { name: 'Ask a follow-up question' })).toBeVisible();
    await expect(query.getByText('Your query is under review', { exact: true })).toHaveCount(0);
  });

  test('incoming links can be hidden and reopened without losing their case destination', async ({ page }) => {
    await page.goto('/?linked-cases');
    const linked = page.getByTestId('linked-cases-control');
    const incoming = linked.getByRole('link', { name: /Incoming linked case/ });
    await expect(incoming).toHaveCount(0);
    await linked.getByRole('button', { name: 'Show', exact: true }).click();
    await expect(incoming).toBeVisible();
    await expect(incoming).toHaveAttribute('href', 'cases/case-details/Test service/TestCase/3333444455556666');
    await expect(incoming).toHaveAttribute('rel', 'noopener');
    await linked.getByRole('button', { name: 'Hide', exact: true }).click();
    await expect(incoming).toHaveCount(0);
    await linked.getByRole('button', { name: 'Show', exact: true }).click();
    await expect(incoming).toBeVisible();
  });
});
