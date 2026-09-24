import { expect, Locator } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Public field routing', () => {
  test('renders the supported field categories through public read and write wrappers', async ({ page }) => {
    await page.goto('/');

    const routes: Array<[string, Locator]> = [
      ['text write', page.getByRole('textbox', { name: 'Field form optional' })],
      ['text read', page.getByText('Read-only value', { exact: true })],
      ['date write', page.getByRole('textbox', { name: 'Day' })],
      ['fixed list write', page.getByRole('combobox', { name: 'Fixed list field' })],
      ['dynamic list write', page.getByRole('combobox', { name: 'Dynamic list' })],
      ['complex write', page.getByTestId('structured-fields').getByRole('textbox', { name: 'Complex line (Optional)' })],
      ['collection write', page.getByTestId('restricted-collection').getByRole('textbox')],
      ['document write', page.getByTestId('document-control').locator('#supporting-document')],
      ['label read', page.getByText('Read-only label', { exact: true })],
      ['case link read', page.getByRole('link', { name: '1234-5678-9012-3456' })],
      ['order summary read', page.getByRole('heading', { name: 'Order Summary' })],
      ['payment viewer read', page.getByText('Recent payments may take a few minutes to reflect here.')]
    ];

    for (const [category, contract] of routes) {
      await expect(contract, `${category} must expose its user-visible contract`).toBeVisible();
    }
  });
});
