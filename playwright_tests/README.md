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

The current browser slice has 12 scenarios grouped by coverage area: `Date fields` and `Mandatory fields`. It covers initial and edited ISO dates, partial/cleared date input, text, number, email, phone, textarea, yes/no, fixed-list, fixed-radio and multi-select binding, plus mandatory error recovery. Unexpected browser errors and non-host requests fail the test. There are no backend services, credentials or retries. New specs should use the same `test.describe` area names so Odhín and JUnit reports remain filterable.

`yarn serve:playwright` serves the host at http://127.0.0.1:4300. The runner starts its own host and rejects an occupied port. Tests use a fresh browser context, en-GB locale and Europe/London timezone.

JUnit: `playwright_tests/test-results/junit.xml`. Perfetto timeline: `playwright_tests/test-results/perfetto.json`. Failure screenshots, video and traces are retained under `playwright_tests/test-results/`. These generated files are ignored by Git.

Odhín: `playwright_tests/odhin-report/toolkit-playwright.html`. The toolkit uses the same adaptive progress and fallback-report pattern as the XUI managed-organisations suite. The report adds a Feature Overview derived from `test.describe` areas and a **Perfetto Results** tab linking the generated timeline, while retaining native status-by-file and status-by-project sections. Jenkins archives the Odhín, JUnit, Perfetto and failure evidence; it does not publish the standard Playwright HTML report. If a run is interrupted before Odhín writes its HTML, `scripts/ensure-odhin-report.js` creates an explicit unavailable-report artifact; it does not change the build result.

Calendar validation and programmatic reset are not covered or modified by this slice. It provides no package-consumer guarantee.

Yarn disables the unused Puppeteer install hook brought in by Odhín; Playwright installs the only browser this suite needs.

## CI ownership

GitHub Actions retains product lint, the library build, Karma/Jasmine coverage and package publishing. Jenkins adds the scoped Playwright lint and typecheck, Chromium source-host tests, and Odhín/HTML/JUnit/failure artifacts. The source host builds directly from source; it does not require a prior library build or `dist` output. CI installs only Chromium's headless shell rather than unused headed browsers. One worker and zero retries keep this small suite deterministic; no extra scheduling or sharding is needed.

`Jenkinsfile_CNP` is the PR/master entrypoint. `Jenkinsfile_nightly` remains available for manual execution, with scheduling deferred and existing triggers cleared when it runs. Both use the same Playwright-only validation pipeline and XUI agent selection. Jenkins registration is managed separately through infrastructure configuration; committing these files does not prove that a job is active. Neither entrypoint deploys or publishes the library.

Jenkins rejects empty suites, skipped or failed tests, and missing reports. The suite size may grow without a pipeline edit. Review test selection when changing coverage: a non-empty result does not prove that every intended contract was selected.
