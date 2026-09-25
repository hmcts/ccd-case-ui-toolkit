import { expect, test as base } from '@playwright/test';
import { paymentApiResponses, paymentUser } from '../mocks/payment-api.mock';

export const test = base.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error('The toolkit host baseURL must be configured');
    }
    const origin = new URL(baseURL).origin;
    await page.addInitScript((user) => {
      sessionStorage.setItem('userDetails', JSON.stringify(user));
    }, paymentUser);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const paymentResponse = paymentApiResponses[url.pathname + url.search];
      if (url.origin === origin && request.method() === 'GET' && paymentResponse) {
        await route.fulfill({ json: paymentResponse });
        return;
      }
      if (url.origin === origin && url.pathname.startsWith('/assets/')) {
        await route.fulfill({ status: 204 });
        return;
      }
      const hostResource = ['document', 'script', 'stylesheet', 'image', 'font'].includes(request.resourceType());
      if (url.origin !== origin || !hostResource) {
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
