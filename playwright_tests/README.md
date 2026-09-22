# Toolkit source browser tests

Use Node >=24.18.0 and repository Yarn 4.5.0.

```sh
yarn install --immutable
yarn playwright install chromium
yarn lint:playwright
yarn test:playwright:typecheck
yarn test:playwright --list
yarn test:playwright
```

The test-only Angular host imports PaletteModule and CaseField from the source public entry. It renders the real date container, validators, Angular form and translation dependencies with synthetic data. This lane proves source-component integration; it does not install or validate an npm tarball. Existing Karma/Jasmine and library build commands remain unchanged.

The two date tests cover initial rendering, edited ISO values, partial/cleared mandatory input and correction to valid input. Unexpected browser errors and non-host requests fail the test. There are no backend services, credentials or retries.

`yarn serve:playwright` serves the host at http://127.0.0.1:4300. The runner starts its own host and rejects an occupied port. Tests use a fresh browser context, en-GB locale and Europe/London timezone.

HTML: `playwright_tests/playwright-report/index.html`. JUnit: `playwright_tests/test-results/junit.xml`. Failure screenshots, video and traces are retained under `playwright_tests/test-results/`. These generated files are ignored by Git.

Calendar validation and programmatic reset are not covered or modified by this slice. It provides no package-consumer guarantee.

## CI ownership

GitHub Actions retains product lint, the library build, Karma/Jasmine coverage and package publishing. Jenkins adds the scoped Playwright lint and typecheck, Chromium source-host tests, and HTML/JUnit/failure artifacts. The source host builds directly from source; it does not require a prior library build or `dist` output.

`Jenkinsfile_CNP` is the PR/master entrypoint. `Jenkinsfile_nightly` remains available for manual execution, with scheduling deferred and existing triggers cleared when it runs. Both use the same Playwright-only validation pipeline and XUI agent selection. Jenkins registration is managed separately through infrastructure configuration; committing these files does not prove that a job is active. Neither entrypoint deploys or publishes the library.

Jenkins rejects empty suites, skipped or failed tests, and missing reports. The suite size may grow without a pipeline edit. Review test selection when changing coverage: a non-empty result does not prove that every intended contract was selected.
