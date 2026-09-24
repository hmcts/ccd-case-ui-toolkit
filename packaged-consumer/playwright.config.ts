import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  fullyParallel: true,
  workers: 7,
  use: { baseURL: 'http://127.0.0.1:4301', video: 'off' },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:4301', reuseExistingServer: false }
});
