# Toolkit source browser tests

Use Node >=24.18.0 and repository Yarn 4.5.0. Playwright is pinned to 1.63.0.

```sh
yarn install --immutable
yarn playwright install chromium --only-shell
yarn lint:playwright
yarn test:playwright:typecheck
yarn test:playwright --list
yarn test:playwright
```

The test-only Angular host imports PaletteModule and CaseField from the source public entry. It renders the real date container, validators, Angular form and translation dependencies with synthetic data. This lane proves source-component integration; it does not install or validate an npm tarball. Existing Karma/Jasmine and library build commands remain unchanged.

The two date tests cover initial rendering, edited ISO values, partial/cleared mandatory input and correction to valid input. Unexpected browser errors and non-host requests fail the test. There are no backend services, credentials or retries.

`yarn serve:playwright` serves the host at http://127.0.0.1:4300. The runner starts its own host and rejects an occupied port. Tests use a fresh browser context, en-GB locale and Europe/London timezone.

HTML: `playwright_tests/playwright-report/index.html`. JUnit: `playwright_tests/test-results/junit.xml`. Failure screenshots, video and traces are retained under `playwright_tests/test-results/`. These generated files are ignored by Git.

Odhín: `playwright_tests/odhin-report/toolkit-playwright.html`. The native Odhín 1.1.8 reporter matches the XUI reporter baseline, with no background report server. It includes source-host environment and commit metadata, test results and failure details. Its separate output folder prevents reporter cleanup from removing HTML/JUnit evidence. Jenkins archives the entire folder and publishes it as **CCD Case UI Toolkit Odhín report**, alongside native HTML and JUnit.

Calendar validation and programmatic reset are not covered or modified by this slice. It provides no package-consumer guarantee.

Yarn disables the unused Puppeteer install hook brought in by Odhín; Playwright installs the only browser this suite needs.

## CI ownership

GitHub Actions retains product lint, the library build, Karma/Jasmine coverage and package publishing. Jenkins adds the scoped Playwright lint and typecheck, Chromium source-host tests, and Odhín/HTML/JUnit/failure artifacts. The source host builds directly from source; it does not require a prior library build or `dist` output. CI installs only Chromium's headless shell rather than unused headed browsers. One worker and zero retries keep this small suite deterministic; no extra scheduling or sharding is needed.

`Jenkinsfile_CNP` is the PR/master entrypoint. `Jenkinsfile_nightly` remains available for manual execution, with scheduling deferred and existing triggers cleared when it runs. Both use the same Playwright-only validation pipeline and XUI agent selection. Jenkins registration is managed separately through infrastructure configuration; committing these files does not prove that a job is active. Neither entrypoint deploys or publishes the library.

Jenkins rejects empty suites, skipped or failed tests, and missing reports. The suite size may grow without a pipeline edit. Review test selection when changing coverage: a non-empty result does not prove that every intended contract was selected.
