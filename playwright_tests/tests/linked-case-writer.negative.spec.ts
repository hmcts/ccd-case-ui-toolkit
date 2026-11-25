import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Linked Cases validation', () => {
  test('requires a persisted link selection, allows correction and reverses deselection', async ({ page }) => {
    await page.goto('/?linked-write=unlink');
    const writer = page.getByTestId('linked-case-writer');
    await writer.getByRole('button', { name: 'Continue unlink' }).click();
    await expect(writer.locator('#unlink-cases-error')).toBeVisible();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('unlink-event').innerText())).toMatchObject({ navigateToNextPage: false });
    await writer.locator('#case-reference-2222333344445555').check();
    await writer.getByRole('button', { name: 'Continue unlink' }).click();
    await expect(writer.locator('#unlink-cases-error')).toHaveCount(0);
    await expect.poll(async () => JSON.parse(await writer.getByTestId('unlink-event').innerText())).toMatchObject({ navigateToNextPage: true, errorMessages: [] });
    await expect.poll(async () => JSON.parse(await writer.getByTestId('unlink-references').innerText())).toEqual(['2222333344445555']);
    await writer.locator('#case-reference-2222333344445555').uncheck();
    await writer.getByRole('button', { name: 'Continue unlink' }).click();
    await expect(writer.locator('#unlink-cases-error')).toBeVisible();
    await expect(writer.getByTestId('unlink-references')).toHaveText('[]');
  });

  test('rejects invalid references and missing reasons, then accepts correction', async ({ page }) => {
    await page.goto('/?linked-write');
    const writer = page.getByTestId('linked-case-writer');
    await writer.locator('#width-20').fill('123');
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.locator('.govuk-error-message')).toHaveCount(2);
    await expect(writer.getByTestId('linked-case-payload')).toHaveText('[]');
    await writer.locator('#width-20').fill('2222333344445555');
    await writer.getByLabel('Other', { exact: true }).check();
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.locator('#other-description-char-limit-error .govuk-error-message')).toBeVisible();
    await writer.locator('#otherDescription').fill('Shared evidence');
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('linked-case-payload').innerText())).toMatchObject([
      { value: { CaseReference: '2222333344445555', ReasonForLink: [{ value: { Reason: 'CLRC099', OtherDescription: 'Shared evidence' } }] } }
    ]);
  });

  test('reports an unavailable case lookup and accepts a corrected reference', async ({ page }) => {
    await page.goto('/?linked-write');
    const writer = page.getByTestId('linked-case-writer');
    await writer.locator('#width-20').fill('9999888877776666');
    await writer.getByLabel('Case consolidated', { exact: true }).check();
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('linked-case-event').innerText())).toMatchObject({
      navigateToNextPage: false, errorMessages: [{ fieldId: 'caseNumber' }]
    });
    await expect(writer.getByTestId('linked-case-payload')).toHaveText('[]');
    await writer.locator('#width-20').fill('2222333344445555');
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.getByRole('row', { name: /Related evidence case/ })).toBeVisible();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('linked-case-event').innerText())).toMatchObject({ errorMessages: [] });
  });

  test('rejects self and duplicate links without changing the proposed payload', async ({ page }) => {
    await page.goto('/?linked-write');
    const writer = page.getByTestId('linked-case-writer');
    await writer.locator('#width-20').fill('1111222233334444');
    await writer.getByLabel('Case consolidated', { exact: true }).check();
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect.poll(async () => JSON.parse(await writer.getByTestId('linked-case-event').innerText())).toMatchObject({
      navigateToNextPage: false, errorMessages: [{ fieldId: 'caseNumber' }]
    });
    await expect(writer.getByTestId('linked-case-payload')).toHaveText('[]');
    await writer.locator('#width-20').fill('2222333344445555');
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.getByRole('row', { name: /Related evidence case/ })).toBeVisible();
    const payload = await writer.getByTestId('linked-case-payload').innerText();
    await writer.locator('#width-20').fill('2222333344445555');
    await writer.getByLabel('Case consolidated', { exact: true }).check();
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.locator('.govuk-error-message')).toBeVisible();
    await expect(writer.getByTestId('linked-case-payload')).toHaveText(payload);
    await expect(writer.getByRole('row', { name: /Related evidence case/ })).toHaveCount(1);
  });
});
