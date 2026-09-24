import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Address and document lifecycle', () => {
  test('dispatches UK and global addresses through the field writer and retains their form values', async ({ page }) => {
    await page.goto('/');
    const controls = page.getByTestId('address-document-fields');

    await page.getByRole('textbox', { name: 'Enter a UK postcode' }).first().fill('SW1A 1AA');
    await page.getByRole('button', { name: 'Find address' }).first().click();
    await page.getByRole('combobox', { name: 'Select an address' }).first().selectOption({ label: '1 Test Street, London' });
    await expect(controls).toContainText('Global address');
    await page.getByRole('link', { name: 'I can\'t enter a UK postcode' }).nth(1).click();
    await page.getByRole('textbox', { name: 'Address line 1' }).nth(1).fill('42 Global Road');
    await page.getByRole('textbox', { name: 'Town or city' }).nth(1).fill('Paris');
    await page.getByRole('textbox', { name: 'Country' }).nth(1).fill('France');

    await expect(page.getByTestId('address-document-values')).toContainText('1 Test Street');
    await expect(page.getByTestId('address-document-values')).toContainText('42 Global Road');
    await expect(page.getByTestId('address-document-values')).toContainText('France');
  });

  test('shows an existing document, replaces it through the writer and reports upload failure', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'initial.pdf' })).toBeVisible();
    const upload = page.getByLabel('Supporting document');

    await upload.setInputFiles({ name: 'uploaded.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('button', { name: 'uploaded.pdf' })).toBeVisible();
    await expect(page.getByTestId('address-document-values')).toContainText('uploaded.pdf');

    await upload.setInputFiles({ name: 'fail.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('alert')).toHaveText('Document upload facility is not available at the moment');
  });
});
