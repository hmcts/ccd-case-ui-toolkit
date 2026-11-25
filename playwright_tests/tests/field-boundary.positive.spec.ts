import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Field read boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?host=field-boundaries');
  });

  test('formats pence including zero and negative amounts and preserves date/time values', async ({ page }) => {
    await expect(page.getByTestId('money-positive')).toHaveText('£1,234.56');
    await expect(page.getByTestId('money-zero')).toHaveText('£0.00');
    await expect(page.getByTestId('money-negative')).toHaveText('-£1.23');
    await expect(page.getByTestId('date-read')).toHaveText('29 Feb 2024');
    await expect(page.getByTestId('date-time-read')).toHaveText('15 Jun 2024, 1:05:09 PM');
  });

  test('resolves explicit and persisted dynamic codes and formatted multi-selection', async ({ page }) => {
    await expect(page.getByTestId('dynamic-read')).toHaveText('Second choice');
    await expect(page.getByTestId('dynamic-persisted')).toHaveText('First choice');
    await expect(page.getByTestId('dynamic-multi-read')).toHaveText('Second choice');
    await expect(page.getByTestId('dynamic-multi-formatted')).toHaveText('First choice');
  });

  test('retains supported rich text structure, indentation and ordered-list numbering', async ({ page }) => {
    const rich = page.getByTestId('rich-read');
    await expect(rich.getByRole('heading', { name: 'Formatted heading', level: 2 })).toBeVisible();
    await expect(rich.locator('strong')).toHaveText('Important');
    await expect(rich.locator('em')).toHaveText('detail');
    await expect(rich.locator('p')).toHaveClass('ccd-rich-text-indent-2');
    await expect(rich.getByRole('list')).toHaveAttribute('start', '3');
    await expect(rich.getByRole('list')).toHaveAttribute('type', 'a');
    await expect(rich.getByRole('listitem')).toHaveText('Third item');
  });

  test('renders plain text literally and preserves text-area line breaks', async ({ page }) => {
    await expect(page.getByTestId('text-escaped')).toHaveText('<strong>Literal content</strong>');
    await expect(page.getByTestId('text-escaped').locator('strong')).toHaveCount(0);
    const lines = page.getByTestId('textarea-lines').locator('span');
    await expect(lines).toHaveText('First line\nSecond line', { useInnerText: true });
    await expect(lines).toHaveCSS('white-space', 'pre-wrap');
  });
});
