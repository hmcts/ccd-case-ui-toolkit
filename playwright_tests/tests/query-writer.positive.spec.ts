import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Query Management emitted data', () => {
  test('raises a query with trimmed content and the current user identity', async ({ page }) => {
    await page.goto('/?query-write=raise');
    const writer = page.getByTestId('query-writer');
    await writer.getByLabel('Query subject', { exact: true }).fill('  New evidence  ');
    await writer.getByLabel('Query detail', { exact: true }).fill('  Please review the evidence  ');
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('query-writer-payload').innerText())).toMatchObject({
      CaseQueriesCollection: { caseMessages: [{ value: { subject: 'New evidence', body: 'Please review the evidence',
        createdBy: 'writer-user', name: 'Test Writer', isHearingRelated: 'No', isHmctsStaff: 'Yes', attachments: [] } }, {}] }
    });
  });

  test('responds and closes the existing query without replacing its original message', async ({ page }) => {
    await page.goto('/?query-write=respond');
    const writer = page.getByTestId('query-writer');
    await writer.getByLabel('Response detail', { exact: true }).fill('  Evidence accepted  ');
    await writer.getByLabel('I want to close this query').check();
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('query-writer-payload').innerText())).toMatchObject({
      CaseQueriesCollection: { caseMessages: [
        { value: { id: 'writer-query', body: 'Please explain the evidence' } },
        { value: { body: 'Evidence accepted', parentId: 'writer-query', messageType: 'Respond', isClosed: 'Yes', createdBy: 'writer-user' } }
      ] }
    });
  });

  test('emits an external follow-up with its parent and no close action', async ({ page }) => {
    await page.goto('/?query-write=followup&external-user');
    const writer = page.getByTestId('query-writer');
    await expect(writer.getByLabel('I want to close this query')).toHaveCount(0);
    await writer.getByLabel('Query Body', { exact: true }).fill('Please clarify the deadline');
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('query-writer-payload').innerText())).toMatchObject({
      CaseQueriesCollection: { caseMessages: [
        { value: { id: 'writer-query' } },
        { value: { id: 'writer-response' } },
        { value: { body: 'Please clarify the deadline', parentId: 'writer-query', messageType: 'Followup', isClosed: 'No' } }
      ] }
    });
  });
});
