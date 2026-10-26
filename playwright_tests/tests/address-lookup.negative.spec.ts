import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.use({ expectedConsoleErrors: ['An error occurred retrieving addresses for postcode.'] });

test('recovers from an unavailable address service with a successful lookup', async ({ page }) => {
  await page.goto('/');
  const uk = page.getByTestId('address-uk-control');
  const postcode = uk.getByRole('textbox', { name: 'Enter a UK postcode' });
  await postcode.fill('SW1A 3AA');
  await uk.getByRole('button', { name: 'Find address' }).click();
  await expect(uk.getByRole('combobox', { name: 'Select an address' })).toHaveText('No address found');
  await expect(uk.getByRole('button', { name: 'Find address' })).toBeEnabled();
  await postcode.fill('SW1A 1AA');
  await uk.getByRole('button', { name: 'Find address' }).click();
  await uk.getByRole('combobox', { name: 'Select an address' }).selectOption({ label: '1 Test Street, London' });
  await expect.poll(async () => JSON.parse(await page.getByTestId('address-document-values').innerText())['address-uk']).toMatchObject({ AddressLine1: '1 Test Street', PostCode: 'SW1A 1AA' });
});
