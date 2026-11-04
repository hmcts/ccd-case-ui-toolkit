import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Field read boundaries', () => {
  test('omits unrenderable money, absent dates and unknown dynamic codes', async ({ page }) => {
    await page.goto('/?host=field-boundaries');
    for (const [id, component] of [
      ['money-invalid', 'ccd-read-money-gbp-field'],
      ['money-empty', 'ccd-read-money-gbp-field'],
      ['date-empty', 'ccd-read-date-field'],
      ['dynamic-unknown', 'ccd-read-dynamic-list-field']
    ]) {
      const field = page.getByTestId(id).locator(component);
      await expect(field).toBeAttached();
      await expect(field).toHaveText('');
    }
  });

  test('removes executable rich markup and unsafe attributes while retaining readable text', async ({ page }) => {
    await page.goto('/?host=field-boundaries');
    const rich = page.getByTestId('rich-unsafe');
    await expect(rich).toHaveText('Safe remainderLink text');
    await expect(rich.locator('script, iframe, a, [onclick], [style], [data-indent], [class*="indent"]')).toHaveCount(0);
    await expect(rich.locator('p')).toHaveText('Safe remainder');
    expect(await page.evaluate(() => 'richTextExecuted' in window)).toBe(false);
  });
});
