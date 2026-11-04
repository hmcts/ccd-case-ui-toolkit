import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case Flags write restrictions', () => {
  test('requires a flag type and clears the error after a selection', async ({ page }) => {
    await page.goto('/?flags-write=create');
    const writer = page.getByTestId('flag-writer');
    await writer.getByRole('button', { name: 'Continue flag selection' }).click();
    await expect(writer.locator('#flag-type-not-selected-error-message')).toBeVisible();
    await writer.getByLabel('Step-free access', { exact: true }).check();
    await writer.getByRole('button', { name: 'Continue flag selection' }).click();
    await expect(writer.locator('#flag-type-not-selected-error-message')).toHaveCount(0);
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({ errorMessages: [] });
  });

  test('reports unavailable flag reference data and prevents selection progression', async ({ page }) => {
    await page.goto('/?flags-write=create&flags-unavailable');
    const writer = page.getByTestId('flag-writer');
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({
      errorMessages: [{ description: 'Flag reference data unavailable', fieldId: 'conditional-radios-list' }]
    });
    await expect(writer.getByRole('button', { name: 'Continue flag selection' })).toHaveCount(0);
    await expect(writer.getByRole('radio')).toHaveCount(0);
  });

  test('requires a reason before rejecting a requested flag', async ({ page }) => {
    await page.goto('/?flags-write=update');
    const writer = page.getByTestId('flag-writer');
    await writer.getByLabel('Not approved', { exact: true }).check();
    await writer.getByRole('button', { name: 'Validate flag update' }).click();
    await expect(writer.locator('#update-flag-status-reason-not-entered-error-message')).toBeVisible();
    await writer.locator('#flagStatusReasonChange').fill('Request withdrawn');
    await writer.getByRole('button', { name: 'Validate flag update' }).click();
    await expect(writer.locator('#update-flag-status-reason-not-entered-error-message')).toHaveCount(0);
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({ errorMessages: [] });
  });

  test('external users cannot choose an internal flag or arbitrary update status', async ({ page }) => {
    await page.goto('/?flags-write=create&external-user');
    const writer = page.getByTestId('flag-writer');
    await expect(writer.getByLabel('Step-free access', { exact: true })).toBeVisible();
    await expect(writer.getByLabel('Other', { exact: true })).toHaveCount(0);
    await page.goto('/?flags-write=update&external-user');
    await expect(writer.getByRole('radio')).toHaveCount(0);
    await writer.getByRole('button', { name: 'Validate flag update' }).click();
    await expect(writer.locator('#update-flag-status-reason-not-entered-error-message')).toBeVisible();
    await writer.locator('#flagStatusReasonChange').fill('Support no longer needed');
    await writer.getByRole('button', { name: 'Validate flag update' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-value').innerText())).toMatchObject({
      status: 'INACTIVE', flagStatusReasonChange: 'Support no longer needed'
    });
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({ errorMessages: [] });
  });
});
