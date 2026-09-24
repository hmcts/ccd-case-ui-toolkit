import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Address and document lifecycle', () => {
  test('dispatches UK and global addresses through the field writer', async ({ page }) => {
    await page.goto('/');
    const uk = page.getByTestId('address-uk-control');
    const global = page.getByTestId('address-global-control');

    await uk.getByRole('textbox', { name: 'Enter a UK postcode' }).fill('SW1A 1AA');
    await uk.getByRole('button', { name: 'Find address' }).click();
    await uk.getByRole('combobox', { name: 'Select an address' }).selectOption({ label: '1 Test Street, London' });
    await expect(uk.getByRole('textbox', { name: 'Address line 1' })).toHaveValue('1 Test Street');
    await expect(uk.getByRole('textbox', { name: 'Town or city' })).toHaveValue('London');
    await expect(uk.getByRole('textbox', { name: 'Country' })).toHaveValue('United Kingdom');

    await global.getByRole('link', { name: 'I can\'t enter a UK postcode' }).click();
    await global.getByRole('textbox', { name: 'Address line 1' }).fill('42 Global Road');
    await global.getByRole('textbox', { name: 'Town or city' }).fill('Paris');
    await global.getByRole('textbox', { name: 'Country' }).fill('France');
    await expect(global.getByRole('textbox', { name: 'Address line 1' })).toHaveValue('42 Global Road');
    await expect(global.getByRole('textbox', { name: 'Town or city' })).toHaveValue('Paris');
    await expect(global.getByRole('textbox', { name: 'Country' })).toHaveValue('France');
  });

  test('shows an existing document, replaces it through the writer and reports upload failure', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'initial.pdf' })).toBeVisible();
    const upload = page.getByTestId('document-control').locator('#supporting-document');

    await upload.setInputFiles({ name: 'uploaded.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('button', { name: 'uploaded.pdf' })).toBeVisible();

    await upload.setInputFiles({ name: 'fail.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('alert')).toHaveText('Document upload facility is not available at the moment');
  });
});
