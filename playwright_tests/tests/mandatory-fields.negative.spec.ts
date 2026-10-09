import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';
import { completeMandatoryFields } from '../utils/mandatory-fields';

test.describe('Mandatory fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Mandatory field controls' })).toBeVisible();
  });

  test('exposes a mandatory text error until corrected', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Text field' });
    await input.fill('value');
    await input.fill('');
    await input.blur();
    await expect(input.locator('..')).toHaveClass(/form-group-error/);
    await input.fill('corrected');
    await expect(input.locator('..')).not.toHaveClass(/form-group-error/);
  });

  test('keeps the mandatory form invalid until every required control has a value', async ({ page }) => {
    await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');

    await completeMandatoryFields(page);

    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
  });

  test('returns to invalid when a previously completed mandatory control is cleared', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Text field' });
    await completeMandatoryFields(page);

    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');

    await input.fill('');
    await input.blur();
    await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
    await expect(input.locator('..')).toHaveClass(/form-group-error/);
  });
  for (const [name, value] of [['Number field', '12'], ['Email field', 'alice@example.test'], ['Phone field', '020 7946 0000'], ['Text area field', 'Explanation']]) {
    test(`requires ${name} independently and accepts correction`, async ({ page }) => {
      await completeMandatoryFields(page);
      await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
      const input = page.getByRole('textbox', { name });
      await input.fill('');
      await input.blur();
      await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
      await input.fill(value);
      await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
    });
  }

  test('requires a multiselect choice independently and accepts reselection', async ({ page }) => {
    await completeMandatoryFields(page);
    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
    await page.getByRole('checkbox', { name: 'Red' }).uncheck();
    await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
    await page.getByRole('checkbox', { name: 'Blue' }).check();
    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
    await expect.poll(async () => JSON.parse(await page.getByTestId('mandatory-values').innerText())['mandatory-multi-select']).toEqual(['blue']);
  });
  test('requires a fixed-list choice independently and accepts correction', async ({ page }) => {
    await completeMandatoryFields(page);
    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
    const list = page.getByRole('combobox', { name: 'Fixed list field' });
    await list.selectOption({ label: '--Select a value--' });
    await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
    await list.selectOption({ label: 'Two' });
    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
  });
  for (const control of ['yesNo', 'fixedRadio'] as const) {
    test(`requires ${control} independently before accepting a choice`, async ({ page }) => {
      await completeMandatoryFields(page, control);
      await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
      if (control === 'yesNo') {
        await page.getByRole('group', { name: 'Yes or no field' }).getByRole('radio', { name: 'No', exact: true }).check();
      } else {
        await page.getByRole('radio', { name: 'Beta' }).check();
      }
      await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
    });
  }
});
