import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

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

    const text = page.getByRole('textbox', { name: 'Text field' });
    const number = page.getByRole('textbox', { name: 'Number field' });
    const email = page.getByRole('textbox', { name: 'Email field' });
    const phone = page.getByRole('textbox', { name: 'Phone field' });
    const textArea = page.getByRole('textbox', { name: 'Text area field' });
    const fixedList = page.getByRole('combobox', { name: 'Fixed list field' });

    await text.fill('Alice');
    await number.fill('12');
    await email.fill('alice@example.test');
    await phone.fill('020 7946 0000');
    await textArea.fill('Explanation');
    await page.getByRole('group', { name: 'Yes or no field' }).getByRole('radio', { name: 'Yes', exact: true }).check();
    await fixedList.selectOption({ label: 'One' });
    await page.getByRole('radio', { name: 'Alpha' }).check();
    await page.getByRole('checkbox', { name: 'Red' }).check();
    await page.getByRole('checkbox', { name: 'Blue' }).check();

    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');
  });

  test('returns to invalid when a previously completed mandatory control is cleared', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Text field' });
    await input.fill('Alice');
    await page.getByRole('textbox', { name: 'Number field' }).fill('12');
    await page.getByRole('textbox', { name: 'Email field' }).fill('alice@example.test');
    await page.getByRole('textbox', { name: 'Phone field' }).fill('020 7946 0000');
    await page.getByRole('textbox', { name: 'Text area field' }).fill('Explanation');
    await page.getByRole('group', { name: 'Yes or no field' }).getByRole('radio', { name: 'Yes', exact: true }).check();
    await page.getByRole('combobox', { name: 'Fixed list field' }).selectOption({ label: 'One' });
    await page.getByRole('radio', { name: 'Alpha' }).check();
    await page.getByRole('checkbox', { name: 'Red' }).check();
    await page.getByRole('checkbox', { name: 'Blue' }).check();

    await expect(page.getByTestId('mandatory-status')).toHaveText('VALID');

    await input.fill('');
    await input.blur();
    await expect(page.getByTestId('mandatory-status')).toHaveText('INVALID');
    await expect(input.locator('..')).toHaveClass(/form-group-error/);
  });
});
