import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Case Flags write steps', () => {
  test('selects a flag type and emits a valid selection event', async ({ page }) => {
    await page.goto('/?flags-write=create');
    const writer = page.getByTestId('flag-writer');
    await writer.getByLabel('Step-free access', { exact: true }).check();
    await writer.getByRole('button', { name: 'Continue flag selection' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-value').innerText())).toMatchObject({
      flagType: { flagCode: 'RA0001', name: 'Step-free access' }
    });
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({ errorMessages: [] });
  });

  test('updates a requested flag to active with an explanation', async ({ page }) => {
    await page.goto('/?flags-write=update');
    const writer = page.getByTestId('flag-writer');
    await writer.getByLabel('Active', { exact: true }).check();
    await writer.locator('#flagStatusReasonChange').fill('Access arranged');
    await writer.getByRole('button', { name: 'Validate flag update' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-value').innerText())).toMatchObject({
      status: 'ACTIVE', flagStatusReasonChange: 'Access arranged', flagComment: 'Needs step-free access'
    });
    await expect.poll(async () => JSON.parse(await writer.getByTestId('flag-writer-event').innerText())).toMatchObject({ errorMessages: [] });
  });
});
