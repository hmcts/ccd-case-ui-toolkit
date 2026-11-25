import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test('binds postcode and dynamic list controls', async ({ page }) => {
  await page.goto('/');
  const advancedFields = page.getByTestId('advanced-fields');
  await advancedFields.getByRole('textbox', { name: 'Postcode' }).fill('SW1A 1AA');
  await advancedFields.getByRole('combobox', { name: 'Dynamic list' }).selectOption({ label: 'Two' });
  await advancedFields.getByRole('radio', { name: 'Two', exact: true }).check();
  await advancedFields.getByRole('checkbox', { name: 'One', exact: true }).check();
  const values = page.getByTestId('advanced-values');
  await expect(values).toContainText('"advanced-postcode": "SW1A 1AA"');
  await expect(values).toContainText('"Dynamic list": "two"');
  await expect(values).toContainText('"Dynamic radio": "two"');
  await expect(values).toContainText('"code": "one"');
  await advancedFields.getByRole('checkbox', { name: 'Two', exact: true }).check();
  await advancedFields.getByRole('checkbox', { name: 'One', exact: true }).uncheck();
  await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic multi']).toEqual([{ code: 'two', label: 'Two' }]);
  await advancedFields.getByRole('checkbox', { name: 'Two', exact: true }).uncheck();
  await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic multi']).toEqual([]);
  await advancedFields.getByRole('radio', { name: 'One', exact: true }).check();
  await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic radio']).toBe('one');
});

test('enters rich text content', async ({ page }) => {
  await page.goto('/');
  const editor = page.locator('.NgxEditor__Content[contenteditable="true"]');
  await editor.fill('Rich text value');
  await expect(page.getByTestId('advanced-values')).toContainText('Rich text value');
});

for (const source of ['formatted', 'explicit']) {
  test(`preserves ${source} dynamic multi-select values through editing`, async ({ page }) => {
    await page.goto(`/?dynamic-multi=${source}`);
    const controls = page.getByTestId('advanced-fields');
    const values = page.getByTestId('advanced-values');
    const one = controls.getByRole('checkbox', { name: 'One', exact: true });
    const two = controls.getByRole('checkbox', { name: 'Two', exact: true });
    const initialCode = source === 'formatted' ? 'one' : 'two';
    const initialLabel = source === 'formatted' ? 'One' : 'Two';
    await expect(controls.getByRole('checkbox', { name: initialLabel, exact: true })).toBeChecked();
    await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic multi']).toEqual([{ code: initialCode, label: initialLabel }]);
    await one.setChecked(false);
    await two.setChecked(false);
    await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic multi']).toEqual([]);
    await one.check();
    await expect.poll(async () => JSON.parse(await values.innerText())['Dynamic multi']).toEqual([{ code: 'one', label: 'One' }]);
    await expect(two).not.toBeChecked();
  });
}
