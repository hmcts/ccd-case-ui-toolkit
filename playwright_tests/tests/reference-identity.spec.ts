import { expect } from '@playwright/test';
import { test } from '../fixtures/browser';

test.describe('Reference identity controls', () => {
  test('renders organisation and resolved staff and judicial identities', async ({ page }) => {
    await page.goto('/');
    const controls = page.getByTestId('reference-identity-controls');

    await expect(controls).toContainText('Reference Organisation');
    await expect(controls).toContainText('1 Test Street');
    await expect(controls).toContainText('Judicial Reader (judicial@example.test)');
    await expect(controls).toContainText('Staff Member');
    await expect(controls).toContainText('Judicial Fallback');
  });
});
