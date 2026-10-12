import type { BrowserContext, Page } from '@playwright/test';

export function observeBrowserErrors(context: BrowserContext, errors: string[], consoleErrors: string[]): void {
  const observe = (page: Page) => {
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
  };
  context.pages().forEach(observe);
  context.on('page', observe);
}
