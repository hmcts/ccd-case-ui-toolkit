import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'node:child_process';
import { cpus, totalmem } from 'node:os';
import { resolve } from 'node:path';
import { version as packageVersion } from '../package.json';

const resolveBranchName = (): string => {
  const branch = process.env.CHANGE_BRANCH ?? process.env.GIT_BRANCH ?? process.env.BRANCH_NAME;
  if (branch) {
    return branch.replace(/^(?:refs\/heads\/|origin\/)/, '').trim();
  }
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim() || 'local';
  } catch {
    return 'local';
  }
};

const resolveTestEnvironment = (): string => {
  const runContext = process.env.CI ? 'ci' : 'local-run';
  const cpuCores = cpus().length;
  const totalRamGiB = Math.round((totalmem() / 1024 ** 3) * 10) / 10;
  return `local | ${runContext} | workers=1 | agent_cpu_cores=${cpuCores} | agent_ram_gib=${totalRamGiB}`;
};

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
      release: process.env.PLAYWRIGHT_REPORT_RELEASE ?? `${packageVersion} | branch=${resolveBranchName()}`,
      testEnvironment: process.env.PLAYWRIGHT_REPORT_TEST_ENVIRONMENT ?? resolveTestEnvironment(),
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
