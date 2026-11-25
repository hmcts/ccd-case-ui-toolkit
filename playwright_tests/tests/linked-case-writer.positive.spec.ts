import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Linked Cases proposed changes', () => {
  test('proposes a case with an exact reference and reason, then removes it', async ({ page }) => {
    await page.goto('/?linked-write');
    const writer = page.getByTestId('linked-case-writer');
    await writer.locator('#width-20').fill('2222-3333-4444-5555');
    await writer.getByLabel('Case consolidated', { exact: true }).check();
    await writer.getByRole('button', { name: 'Propose case link' }).click();
    await expect(writer.getByRole('row', { name: /Related evidence case/ })).toContainText('Case consolidated');
    await expect.poll(async () => JSON.parse(await writer.getByTestId('linked-case-payload').innerText())).toEqual([
      { id: '2222333344445555', value: { CaseReference: '2222333344445555', CaseType: 'TestCase',
        CreatedDateTime: expect.any(String), ReasonForLink: [{ value: { Reason: 'CLRC015', OtherDescription: '' } }] } }
    ]);
    await writer.getByText('Remove', { exact: true }).click();
    await expect(writer.getByTestId('linked-case-payload')).toHaveText('[]');
    await expect(writer.getByRole('row', { name: /Related evidence case/ })).toHaveCount(0);
  });
});
