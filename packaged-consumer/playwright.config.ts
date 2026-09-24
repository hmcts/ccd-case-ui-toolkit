import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  expect: { timeout: 30_000 },
  retries: 0,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4301', video: 'off' },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4301', reuseExistingServer: false }
});
