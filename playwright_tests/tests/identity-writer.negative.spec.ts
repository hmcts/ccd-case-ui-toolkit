import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Identity writers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?identity-write=true');
  });

  for (const reference of ['123456781234567', '12345678123456789', '1234/5678/1234/5678', 'abcd567812345678']) {
    test(`rejects malformed case reference ${reference} and recovers`, async ({ page }) => {
      const input = page.getByLabel('Related case reference');
      await input.fill(reference);
      await expect(page.getByText('Please use a valid 16 Digit Case Reference', { exact: true })).toBeVisible();
      await expect(page.getByTestId('identity-link-valid')).toHaveText('false');
      await input.fill('1234567812345678');
      await expect(page.getByText('Please use a valid 16 Digit Case Reference', { exact: true })).toBeHidden();
      await expect(page.getByTestId('identity-link-valid')).toHaveText('true');
    });
  }

  test('typing an unmatched organisation preserves an empty payload and recovers', async ({ page }) => {
    const host = page.getByTestId('identity-writer-controls');
    await host.locator('#search-org-text').pressSequentially('missing organisation');
    await expect(host.getByText('No results found.', { exact: true })).toBeVisible();
    await expect(host.getByRole('link', { name: 'Select', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: null, OrganisationName: null } }, null, 2));
    await host.locator('#search-org-text').fill('Alpha');
    await host.getByRole('link', { name: 'Select', exact: true }).click();
    await expect(page.getByTestId('identity-org-payload')).toContainText('ORG-A');
  });

  test('pasting an unmatched organisation shows no results and keeps an empty payload', async ({ page }) => {
    const host = page.getByTestId('identity-writer-controls');
    await host.locator('#search-org-text').fill('pasted missing organisation');
    await expect(host.getByText('No results found.', { exact: true })).toBeVisible();
    await expect(host.getByRole('link', { name: 'Select', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: null, OrganisationName: null } }, null, 2));
  });

  test('reports unavailable organisation data without allowing a selection', async ({ page }) => {
    await page.goto('/?identity-write=true&identity-org=unavailable');
    const host = page.getByTestId('identity-writer-controls');
    await expect(host.getByText('Organisation search is currently unavailable.', { exact: true })).toBeVisible();
    await expect(host.locator('#search-org-text')).toHaveCount(0);
    await expect(host.getByRole('link', { name: 'Select', exact: true })).toHaveCount(0);
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: null, OrganisationName: null } }, null, 2));
  });

  for (const identity of ['judge', 'staff']) {
    const label = identity === 'judge' ? 'Judicial assignee' : 'Staff assignee';
    test(`${label} rejects unmatched free text and recovers after a service failure`, async ({ page }) => {
      const input = page.getByLabel(label);
      await input.fill('Nobody');
      await expect(page.getByRole('option', { name: 'No results found', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Leave identity field' }).click();
      await expect(input).toHaveValue('');
      await expect(page.getByTestId(`identity-${identity}-valid`)).toHaveText('false');
      await expect(page.getByTestId(`identity-${identity}-payload`)).toHaveText(JSON.stringify(identity === 'judge' ? { idamId: null, personalCode: null } : { idamId: null }, null, 2));
      await input.fill('failure');
      await expect(page.getByRole('option', { name: 'Invalid search term', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Invalid search term', exact: true })).toHaveAttribute('aria-disabled', 'true');
      await input.fill('Alex');
      await page.getByRole('option', { name: 'Alex Judge (alex.judge@example.test)', exact: true }).click();
      await expect(page.getByTestId(`identity-${identity}-payload`)).toHaveText(JSON.stringify(identity === 'judge' ? { idamId: 'judge-user', personalCode: 'J002' } : { idamId: 'judge-user' }, null, 2));
      await expect(page.getByTestId(`identity-${identity}-valid`)).toHaveText('true');
    });
  }
});
