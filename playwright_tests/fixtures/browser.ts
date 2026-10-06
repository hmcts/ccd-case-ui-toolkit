import { expect, test as base } from '@playwright/test';
import { observeBrowserErrors } from './browser-diagnostics';
import { paymentApiResponses, paymentUser } from '../mocks/payment-api.mock';

export const test = base.extend<{ browserDiagnostics: void; expectedConsoleErrors: string[] }>({
  expectedConsoleErrors: [[], { option: true }],
  browserDiagnostics: [async ({ context, baseURL, expectedConsoleErrors }, use) => {
    if (!baseURL) {
      throw new Error('The toolkit host baseURL must be configured');
    }
    const origin = new URL(baseURL).origin;
    await context.addInitScript(({ user, hostOrigin }) => {
      if (window.location.origin === hostOrigin) {
        sessionStorage.setItem('userDetails', JSON.stringify(user));
      }
    }, { user: paymentUser, hostOrigin: origin });
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    observeBrowserErrors(context, errors, consoleErrors);
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const paymentResponse = paymentApiResponses[url.pathname + url.search];
      if (url.origin === origin && request.method() === 'GET' && paymentResponse) {
        await route.fulfill({ json: paymentResponse });
        return;
      }
      if (url.origin === origin && url.pathname.startsWith('/assets/') && url.pathname !== '/assets/build/pdf.worker.min.mjs') {
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
    for (const expected of expectedConsoleErrors) {
      const matches = consoleErrors.filter((message) => message.includes(expected));
      expect(matches, `Expected one console error containing: ${expected}`).toHaveLength(1);
      consoleErrors.splice(consoleErrors.indexOf(matches[0]), 1);
    }
    expect(consoleErrors, 'Unexpected console errors').toEqual([]);
    expect(errors, 'Browser errors and unexpected requests').toEqual([]);
  }, { auto: true }]
});
