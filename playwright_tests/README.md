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

The suite covers field bindings and validation, collection permissions, component dispatch and service-faked mini-app interactions. Run `yarn test:playwright --list` for the current scenario inventory. Assertions prove only their named synthetic component contracts, not deployed services. Browser contexts are isolated, with seven fully parallel workers and zero retries. Unexpected page errors, console errors and unmocked requests fail the test, including popup activity. Negative scenarios must declare and observe each expected console error explicitly. Use feature-oriented `test.describe` names so Odhín groups features rather than filenames.

`yarn serve:playwright` serves the host at http://127.0.0.1:4300. The runner starts its own host and rejects an occupied port. Tests use a fresh browser context, en-GB locale and Europe/London timezone.

JUnit: `playwright_tests/test-results/junit.xml`. Perfetto timeline: `playwright_tests/test-results/perfetto.json`. Failure screenshots and traces are retained under `playwright_tests/test-results/`. These generated files are ignored by Git.

Odhín: `playwright_tests/odhin-report/toolkit-playwright.html`. The toolkit uses the same adaptive progress and fallback-report pattern as the XUI managed-organisations suite. The report adds a Feature Overview derived from `test.describe` areas and a **Perfetto Results** tab linking the generated timeline, while retaining native status-by-file and status-by-project sections. The dashboard uses the available browser width. Drag a card’s bottom-right handle to resize it; neighbouring cards reflow. Arrow keys resize a focused handle and Home restores that card. **Reset layout** restores every card, and **Compact view** switches spacing. Feature and status labels open the corresponding filtered tests. The Tests tab combines status, feature, file, project, tags, attempt and duration filters with text search. **Clear filters** resets them together. Layout changes last until the report is reloaded. Jenkins archives the Odhín, JUnit, Perfetto and failure evidence; it does not publish the standard Playwright HTML report. If a run is interrupted before Odhín writes its HTML, `scripts/ensure-odhin-report.js` creates an explicit unavailable-report artifact; it does not change the build result.

Source-host checks do not establish installed-package compatibility. The separate packaged-consumer gate installs the built tarball; its HTML, JUnit, trace and screenshot evidence is retained in `packaged-consumer-results/`, including on browser failure.

Yarn disables the unused Puppeteer install hook brought in by Odhín; Playwright installs the only browser this suite needs.

## CI ownership

GitHub Actions retains product lint, the library build, Karma/Jasmine coverage and package publishing. Jenkins adds the scoped Playwright lint and typecheck, Chromium source-host tests, and Odhín/JUnit/failure artifacts. The source host builds directly from source; it does not require a prior library build or `dist` output. CI installs only Chromium's headless shell rather than unused headed browsers. Seven workers, full parallelism and zero retries exercise isolated browser contexts. Videos are disabled.

`Jenkinsfile_CNP` is the PR/master entrypoint. `Jenkinsfile_nightly` remains available for manual execution, with scheduling deferred and existing triggers cleared when it runs. Both use the same Playwright-only validation pipeline and XUI agent selection. Jenkins registration is managed separately through infrastructure configuration; committing these files does not prove that a job is active. Neither entrypoint deploys or publishes the library.

Jenkins rejects empty suites, skipped or failed tests, and missing reports. The suite size may grow without a pipeline edit. Review test selection when changing coverage: a non-empty result does not prove that every intended contract was selected.

### Report UI checks

Run `node playwright_tests/reporters/presentation/report.test.cjs` for generation/metadata checks. Open a freshly generated report through a local HTTP server in Playwright CLI, then run:

```sh
playwright-cli run-code --filename=playwright_tests/reporters/presentation/verify-report.js
```

The browser check covers desktop/mobile layout, pointer and keyboard resizing, colour themes, filters, feature/status drill-down, test details and the Perfetto artifact link. It uses temporary chart states to verify status colours and leaves the saved report unchanged.

Test details include **Back to tests**, **Previous test**, and **Next test**. Navigation follows the current filters and sort order across pages; returning restores the current test in the list. Escape also closes details.

The Tests tab defaults to **100 results per page**; use the page-size selector to change it.

Expand a feature name in Feature Overview to inspect its tests, statuses and timings. Select a test to open details, or select the feature test count to filter the Tests tab. This replaces the separate Status by test file panel.

Expanded tests remain compact: test name, status, duration and a direct View steps link. Full metadata remains in test details.

Perfetto Results provides **Download JSON** and **Open in Perfetto**. The latter opens ui.perfetto.dev in a new tab and passes the trace using its documented browser messaging API. Allow pop-ups; if local-file access, network restrictions or Jenkins CSP prevent it, download the JSON and open it manually in Perfetto.

Each retained test trace keeps **Download Trace** and adds **Open in Playwright Trace Viewer** in a new tab. HTTP(S) reports pass the trace URL to trace.playwright.dev; the artifact host must permit CORS and access without the report’s login session. If loading fails, download the trace and select it in the viewer. Local-file and embedded reports open the viewer for manual file selection. Tests without a retained trace do not gain a viewer link. Run `node playwright_tests/reporters/presentation/trace.test.cjs` to check these link contracts.

For a browser check, generate the synthetic suite with `--trace on`, serve the report over HTTP, then run `playwright-cli run-code --filename=playwright_tests/reporters/presentation/verify-trace.js`. The check downloads the real generated trace and verifies new-tab navigation and mobile layout; it intercepts the external viewer page, so it does not claim remote CORS or authentication compatibility.

Perfetto JSON files are copied into the report’s `perfetto/` directory before publication. Download and Open in Perfetto use relative URLs so Jenkins resource-domain reports can fetch them without cross-origin access; the original test-result artifacts are retained.
