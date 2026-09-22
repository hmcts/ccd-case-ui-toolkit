import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['junit', { outputFile: './test-results/junit.xml' }],
    ['./reporters/odhin-progress.reporter.cjs', {
      enabled: Boolean(process.env.CI),
      intervalMs: 5000
    }],
    ['perfetto', { outputFile: './test-results/perfetto.json' }],
    ['./reporters/odhin-feature-reporter.cjs', {
      outputFolder: resolve(__dirname, 'odhin-report'),
      testResultsFolder: resolve(__dirname, 'test-results'),
      indexFilename: 'toolkit-playwright.html',
      title: 'CCD Case UI Toolkit Playwright',
      project: 'CCD Case UI Toolkit',
      testFolder: 'playwright_tests',
      release: process.env.GIT_COMMIT ?? 'local',
      testEnvironment: `${process.env.CI ? 'CI' : 'local'} | Chromium | source host`,
      startServer: false,
      consoleLog: false,
      consoleError: true,
      testOutput: 'only-on-failure'
    }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4300',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn serve:playwright',
    url: 'http://127.0.0.1:4300',
    reuseExistingServer: false
  }
});
