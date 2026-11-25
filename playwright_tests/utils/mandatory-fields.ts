import { Page } from '@playwright/test';

export async function completeMandatoryFields(page: Page, omit?: 'yesNo' | 'fixedRadio'): Promise<void> {
  await page.getByRole('textbox', { name: 'Text field' }).fill('Alice');
  await page.getByRole('textbox', { name: 'Number field' }).fill('12');
  await page.getByRole('textbox', { name: 'Email field' }).fill('alice@example.test');
  await page.getByRole('textbox', { name: 'Phone field' }).fill('020 7946 0000');
  await page.getByRole('textbox', { name: 'Text area field' }).fill('Explanation');
  if (omit !== 'yesNo') {
    await page.getByRole('group', { name: 'Yes or no field' }).getByRole('radio', { name: 'Yes', exact: true }).check();
  }
  await page.getByRole('combobox', { name: 'Fixed list field' }).selectOption({ label: 'One' });
  if (omit !== 'fixedRadio') {
    await page.getByRole('radio', { name: 'Alpha' }).check();
  }
  await page.getByRole('checkbox', { name: 'Red' }).check();
}
