import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  outputDir: './test-results',
  reporter: [['list'], ['junit', { outputFile: 'test-results/junit.xml' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  fullyParallel: true,
  workers: 7,
  use: { baseURL: 'http://127.0.0.1:4301', video: 'off', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4301', reuseExistingServer: false }
});
