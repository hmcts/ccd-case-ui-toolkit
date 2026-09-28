import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Address and document lifecycle', () => {
  test('reports a parsed secure-document upload error', async ({ page }) => {
    await page.goto('/?secure-document-error');
    const upload = page.getByTestId('document-control').locator('#supporting-document');

    await upload.setInputFiles({ name: 'secure.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') });
    await expect(page.getByRole('alert')).toHaveText('Secure upload rejected');
  });
  test('recovers from invalid and empty postcode results with a valid lookup', async ({ page }) => {
    await page.goto('/');
    const uk = page.getByTestId('address-uk-control');
    const postcode = uk.getByRole('textbox', { name: 'Enter a UK postcode' });
    await uk.getByRole('button', { name: 'Find address' }).click();
    await expect(postcode).toHaveClass(/govuk-input--error/);
    await postcode.fill('!invalid!');
    await uk.getByRole('button', { name: 'Find address' }).click();
    await expect(postcode).toHaveClass(/govuk-input--error/);
    await postcode.fill('SW1A 2AA');
    await uk.getByRole('button', { name: 'Find address' }).click();
    await expect(uk.getByRole('combobox', { name: 'Select an address' })).toHaveText('No address found');
    await postcode.fill('SW1A 1AA');
    await uk.getByRole('button', { name: 'Find address' }).click();
    await uk.getByRole('combobox', { name: 'Select an address' }).selectOption({ label: '1 Test Street, London' });
    await expect(postcode).not.toHaveClass(/govuk-input--error/);
    await expect.poll(async () => JSON.parse(await page.getByTestId('address-document-values').innerText())['address-uk']).toMatchObject({ AddressLine1: '1 Test Street', PostCode: 'SW1A 1AA' });
  });
});
