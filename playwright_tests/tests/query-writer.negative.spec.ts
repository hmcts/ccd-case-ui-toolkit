import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Query Management input errors', () => {
  test('shows required subject and detail errors before correction emits query data', async ({ page }) => {
    await page.goto('/?query-write=raise');
    const writer = page.getByTestId('query-writer');
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect(writer.locator('#subject-error')).toBeVisible();
    await expect(writer.locator('#body-error')).toBeVisible();
    await expect(writer.getByTestId('query-writer-payload')).toHaveText('null');
    await writer.getByLabel('Query subject', { exact: true }).fill('Evidence');
    await writer.getByLabel('Query detail', { exact: true }).fill('Evidence details');
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect(writer.locator('#subject-error')).toHaveCount(0);
    await expect(writer.locator('#body-error')).toHaveCount(0);
    await expect.poll(async () => JSON.parse(await writer.getByTestId('query-writer-payload').innerText())).toMatchObject({
      CaseQueriesCollection: { caseMessages: [{ value: { subject: 'Evidence', body: 'Evidence details' } }, {}] }
    });
  });

  test('rejects an empty response while retaining the original query detail', async ({ page }) => {
    await page.goto('/?query-write=respond');
    const writer = page.getByTestId('query-writer');
    await writer.getByRole('button', { name: 'Emit query data' }).click();
    await expect(writer.locator('#body-error')).toBeVisible();
    await expect(writer.getByText('Please explain the evidence', { exact: true })).toBeVisible();
    await expect(writer.getByTestId('query-writer-payload')).toHaveText('null');
  });
});
