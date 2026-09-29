import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Identity writers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?identity-write=true');
  });

  for (const reference of ['1234567812345678', '1234-5678-1234-5678', '1234 5678 1234 5678']) {
    test(`accepts case reference ${reference}`, async ({ page }) => {
      await page.getByLabel('Related case reference').fill(reference);
      await expect(page.getByTestId('identity-link-valid')).toHaveText('true');
      await expect(page.getByTestId('identity-link-payload')).toHaveText(JSON.stringify({ 'writer-link': { CaseReference: reference } }, null, 2));
    });
  }

  test('selects, clears and replaces an organisation with exact ID and name', async ({ page }) => {
    const host = page.getByTestId('identity-writer-controls');
    const search = host.locator('#search-org-text');
    await search.fill('sw1a1aa');
    await host.getByRole('link', { name: 'Select', exact: true }).click();
    await expect(search).toBeDisabled();
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: 'ORG-A', OrganisationName: 'Alpha Legal' } }, null, 2));
    await host.getByRole('link', { name: 'Clear', exact: true }).click();
    await expect(search).toBeEnabled();
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: null, OrganisationName: null } }, null, 2));
    await search.fill('Beta');
    await host.getByRole('link', { name: 'Select', exact: true }).click();
    await expect(page.getByTestId('identity-org-payload')).toHaveText(JSON.stringify({ 'writer-org': { OrganisationID: 'ORG-B', OrganisationName: 'Beta Legal' } }, null, 2));
  });

  test('serializes a judicial selection and clears both identity keys on deletion', async ({ page }) => {
    const input = page.getByLabel('Judicial assignee');
    await input.fill('Alex');
    await page.getByRole('option', { name: 'Alex Judge (alex.judge@example.test)', exact: true }).click();
    await expect(input).toHaveValue('Alex Judge (alex.judge@example.test)');
    await expect(page.getByTestId('identity-judge-payload')).toHaveText(JSON.stringify({ idamId: 'judge-user', personalCode: 'J002' }, null, 2));
    await expect(page.getByTestId('identity-judge-valid')).toHaveText('true');
    await input.fill('');
    await page.getByRole('button', { name: 'Leave identity field' }).click();
    await expect(page.getByTestId('identity-judge-payload')).toHaveText(JSON.stringify({ idamId: null, personalCode: null }, null, 2));
    await expect(page.getByTestId('identity-judge-valid')).toHaveText('false');
  });

  test('deduplicates mixed staff and judicial identities with staff precedence', async ({ page }) => {
    const input = page.getByLabel('Staff assignee');
    await input.fill('Alex');
    await expect(page.getByRole('option')).toHaveText(['Alex Staff (alex.staff@example.test)', 'Alex Judge (alex.judge@example.test)']);
    await page.getByRole('option', { name: 'Alex Staff (alex.staff@example.test)', exact: true }).click();
    await expect(input).toHaveValue('Alex Staff');
    await expect(page.getByTestId('identity-staff-payload')).toHaveText(JSON.stringify({ idamId: 'shared-user' }, null, 2));
    await expect(page.getByTestId('identity-staff-valid')).toHaveText('true');
    await input.fill('');
    await page.getByRole('button', { name: 'Leave identity field' }).click();
    await expect(page.getByTestId('identity-staff-payload')).toHaveText(JSON.stringify({ idamId: null }, null, 2));
    await expect(page.getByTestId('identity-staff-valid')).toHaveText('false');
  });
});
