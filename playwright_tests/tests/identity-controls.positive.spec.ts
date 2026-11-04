import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Identity controls', () => {
  test('renders read-only identity controls and keeps mixed form editable', async ({ page }) => {
    await page.goto('/');
    const caseLink = page.locator('ccd-read-case-link-field a');
    await expect(caseLink).toHaveText('1234-5678-9012-3456');
    await expect(caseLink).toHaveAttribute('href', '/v2/case/1234567890123456');
    await expect(page.getByText('A read-only label', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'A read-only label' })).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Editable note' }).fill('Updated note');
    await expect.poll(async () => JSON.parse(await page.getByTestId('identity-mixed-value').innerText()))
      .toEqual({ 'identity-mixed': 'Updated note' });
  });

  test('clears an optional editable value without changing the read-only case link', async ({ page }) => {
    await page.goto('/');
    const note = page.getByRole('textbox', { name: 'Editable note' });
    await note.fill('Temporary note');
    await expect.poll(async () => JSON.parse(await page.getByTestId('identity-mixed-value').innerText()))
      .toEqual({ 'identity-mixed': 'Temporary note' });
    await note.clear();
    await note.blur();

    await expect(note).toHaveValue('');
    await expect(note).toHaveClass(/ng-valid/);
    await expect.poll(async () => JSON.parse(await page.getByTestId('identity-mixed-value').innerText()))
      .toEqual({ 'identity-mixed': '' });
    await expect(page.locator('ccd-read-case-link-field a')).toHaveAttribute('href', '/v2/case/1234567890123456');
    await expect(page.getByText('A read-only label', { exact: true })).toBeVisible();
  });
});
