import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Mandatory field controls' })).toBeVisible();
});

test('EXUI-5222-01 binds a mandatory text field on blur', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Text field' });
  await input.fill('  Alice  ');
  await input.blur();
  await expect(page.getByTestId('mandatory-values')).toContainText('"mandatory-text": "  Alice  "');
});

test('EXUI-5222-02 exposes a mandatory text error until corrected', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Text field' });
  await input.fill('value');
  await input.fill('');
  await input.blur();
  await expect(input.locator('..')).toHaveClass(/form-group-error/);
  await input.fill('corrected');
  await expect(input.locator('..')).not.toHaveClass(/form-group-error/);
});

test('EXUI-5222-03 accepts a decimal number through the number control', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Number field' });
  await input.fill('12.50');
  await expect(page.getByTestId('mandatory-values')).toContainText('"mandatory-number": "12.50"');
});

test('EXUI-5222-04 renders an email input and binds its value', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Email field' });
  await input.fill('alice@example.test');
  await expect(input).toHaveAttribute('type', 'email');
  await expect(page.getByTestId('mandatory-values')).toContainText('"mandatory-email": "alice@example.test"');
});

test('EXUI-5222-05 accepts a UK phone number', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Phone field' });
  await input.fill('020 7946 0000');
  await expect(input.locator('..')).not.toHaveClass(/form-group-error/);
});

test('EXUI-5222-06 binds text area input', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Text area field' });
  await input.fill('A longer explanation');
  await expect(page.getByTestId('mandatory-values')).toContainText('"mandatory-text-area": "A longer explanation"');
});

test('EXUI-5222-07 selects both Yes and No radio values', async ({ page }) => {
  const yes = page.getByRole('radio', { name: 'Yes', exact: true });
  const no = page.getByRole('radio', { name: 'No', exact: true });
  await yes.check();
  await expect(yes).toBeChecked();
  await no.check();
  await expect(no).toBeChecked();
  await expect(yes).not.toBeChecked();
});

test('EXUI-5222-08 selects a fixed-list option', async ({ page }) => {
  const select = page.getByRole('combobox', { name: 'Fixed list field' });
  await select.selectOption({ label: 'Two' });
  await expect(select.locator('option:checked')).toHaveText('Two');
});

test('EXUI-5222-09 selects a fixed-radio option', async ({ page }) => {
  const radio = page.getByRole('radio', { name: 'Alpha' });
  await radio.check();
  await expect(radio).toBeChecked();
});

test('EXUI-5222-10 keeps multiple selected values in the form array', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Red' }).check();
  await page.getByRole('checkbox', { name: 'Blue' }).check();
  await expect(page.getByTestId('mandatory-values')).toContainText('"mandatory-multi-select": [\n    "red",\n    "blue"\n  ]');
});
