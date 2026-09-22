import { expect, test as base } from '@playwright/test';

export const test = base.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error('The toolkit host baseURL must be configured');
    }
    const origin = new URL(baseURL).origin;
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    await page.route('**/*', async (route) => {
      const request = route.request();
      const hostResource = ['document', 'script', 'stylesheet', 'image', 'font'].includes(request.resourceType());
      if (new URL(request.url()).origin !== origin || !hostResource) {
        errors.push(`Unexpected request: ${route.request().url()}`);
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await use();
    expect(errors, 'Browser errors and unexpected requests').toEqual([]);
  }, { auto: true }]
});
