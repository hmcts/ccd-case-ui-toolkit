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
    const globalInputs = global.locator('input');
    await globalInputs.nth(1).fill('42 Global Road');
    await globalInputs.nth(4).fill('Paris');
    await globalInputs.nth(7).fill('France');
    await expect(globalInputs.nth(1)).toHaveValue('42 Global Road');
    await expect(globalInputs.nth(4)).toHaveValue('Paris');
    await expect(globalInputs.nth(7)).toHaveValue('France');
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

  test('reports a parsed secure-document upload error', async ({ page }) => {
    await page.goto('/?secure-document-error');
    const upload = page.getByTestId('document-control').locator('#supporting-document');

    await upload.setInputFiles({ name: 'secure.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('alert')).toHaveText('Secure upload rejected');
  });
});
