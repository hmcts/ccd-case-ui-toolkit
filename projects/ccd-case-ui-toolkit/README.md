CCD CASE UI TOOLKIT
===================

Overview
--------

@hmcts/ccd-case-ui-toolkit is an Angular component library for CCD and XUI
case-management applications. It provides reusable case-form components,
directives, services, models, fixtures and supporting utilities.

The repository also contains:

- A library build using Angular and ng-packagr.
- A demo application and synthetic browser-test host.
- Karma/Jasmine unit tests.
- Playwright source-host tests.
- A packaged-consumer smoke test for the built package.
- Documentation generation with Compodoc.
- CI and publishing configuration.

The published package name is:

    @hmcts/ccd-case-ui-toolkit


Prerequisites
-------------

- Node.js 24.18.0 or a later version accepted by package.json.
- Yarn 4.5.0, managed through the repository's Yarn configuration.
- A Git checkout with the repository files available.
- Chromium if you are running the Playwright browser tests.

Check the required Node.js version in .nvmrc and package.json before changing
your local runtime. On Windows, Git Bash or WSL is recommended for shell
commands that use Unix-style syntax.

Install dependencies from the repository root:

    corepack enable
    yarn install --immutable

The repository uses a node-modules linker. Do not commit node_modules, build
output, coverage or browser-test results.


Repository layout
-----------------

    projects/ccd-case-ui-toolkit/
        src/                       Library source and public API
        ng-package.json            ng-packagr configuration
        package.json               Library metadata and peer dependencies

    demo/                          Example application and stubs
    packaged-consumer/             Application that consumes the built package
    playwright_tests/              Source-host browser tests and test host
    scripts/                       Build synchronisation and smoke checks
    angular.json                   Angular workspace configuration
    package.json                   Workspace scripts
    dist/                          Generated package output
    docs/                          Generated Compodoc output

The library entry point is projects/ccd-case-ui-toolkit/src/public-api.ts.


Build the library
-----------------

Build the package once:

    yarn build

This runs the condition-parser generation step, builds the
ccd-case-ui-toolkit-lib Angular library and synchronises the package output
into dist/.

The explicit library build command is:

    yarn build:library

Build the library continuously while editing source files:

    yarn build:library:watch

The generated package is written to:

    dist/ccd-case-ui-toolkit/

Generated parser files are created by the condition-parser task. Do not edit
the generated condition-parser.generated.ts file by hand; change the source
condition grammar and regenerate it instead.


Use the library in a consumer application
------------------------------------------

The preferred verification path is the repository's packaged-consumer gate:

    yarn test:packaged-consumer

This checks the webapp material contract, builds the library and runs the
packaged-consumer smoke test against the generated package.

For stricter peer-dependency validation, run:

    yarn test:packaged-consumer:strict

The packaged consumer is configured to run on port 4301:

    cd packaged-consumer
    yarn start

Use the packaged-consumer workflow to validate the installed package rather
than relying only on source imports. Source-host tests and installed-package
tests prove different compatibility boundaries.

Legacy linking

The older README described yarn link and manual copying of dist/. Linking can
be useful for local investigation, but it is more fragile with modern Yarn,
Angular and peer dependencies. Prefer the packaged-consumer smoke test or the
consumer application's normal package workflow. If linking is unavoidable,
build the library first and verify that the consumer resolves the intended
package version and peer dependencies.


Run the Playwright source host
------------------------------

Install the Chromium browser used by the suite:

    yarn playwright install chromium --only-shell

Run Playwright support checks:

    yarn lint:playwright
    yarn test:playwright:typecheck

List available scenarios:

    yarn test:playwright --list

Run the full source-host browser suite:

    yarn test:playwright

Start the synthetic Angular host when inspecting it manually:

    yarn serve:playwright

The host is served at:

    http://127.0.0.1:4300

The Playwright runner starts the host as required by its configuration. Keep
ports 4300 and 4301 available when running browser or packaged-consumer tests.

Run a focused feature where appropriate:

    yarn test:playwright payment-contract
    yarn test:playwright advanced-fields

The source-host suite uses synthetic data, isolated browser contexts, an
en-GB locale and the Europe/London time zone. It validates named component
contracts; it does not prove that deployed services or every consuming
application are compatible.


Playwright evidence
-------------------

Generated browser evidence is written below playwright_tests/test-results/.
It can include:

- JUnit results.
- Perfetto timeline data.
- Failure screenshots and traces.
- Odhín HTML reports.

The main report locations are:

    playwright_tests/test-results/junit.xml
    playwright_tests/test-results/perfetto.json
    playwright_tests/odhin-report/toolkit-playwright.html

The packaged-consumer gate writes its evidence below
packaged-consumer-results/.

These outputs may contain test data and should be treated as generated,
potentially sensitive artefacts. They are ignored by Git and should not be
committed.


Unit tests and coverage
-----------------------

Run the Angular unit tests with coverage:

    yarn test

Run the unit tests in watch mode:

    yarn test:watch

Coverage output is written under coverage/.

Create a coverage report when coverage data already exists:

    yarn coverage


Linting, audits and documentation
---------------------------------

Run the library lint checks:

    yarn lint

Run the Playwright-specific lint checks:

    yarn lint:playwright

Run reporting and reporter checks:

    yarn lint:playwright:reporting

Run the dependency audit against the repository's known-audit baseline:

    yarn test:audit

Generate Compodoc documentation:

    yarn docs

The generated documentation is written to docs/.

Run the main CI-style local checks:

    yarn ci

The CI command runs lint, unit tests, the library build and documentation
generation. It may take longer than targeted checks.


Development workflow
--------------------

1. Create a focused branch.
2. Install dependencies with yarn install --immutable.
3. Make the source change under projects/ccd-case-ui-toolkit/src/.
4. Run yarn build:library:watch while developing a consumer integration.
5. Run targeted unit tests and Playwright scenarios.
6. Run yarn lint and yarn test.
7. Run yarn test:packaged-consumer for package-boundary changes.
8. Run yarn ci before a release or when broad changes affect the library.
9. Review generated output and confirm that no sensitive artefacts are staged.

When a public component, directive, service, model or pipe is added, update
the public API exports and add or update focused tests. Keep assertions close
to the component or service contract they verify.


Release and publishing notes
-----------------------------

The package is published as an npm package with public access configured in
package.json. Use the repository's approved release and CI process.

Before publishing:

- Confirm the package version and release notes.
- Run yarn ci.
- Run yarn test:packaged-consumer and, where required,
  yarn test:packaged-consumer:strict.
- Confirm peer dependency ranges for supported Angular consumers.
- Review the generated dist/ package contents.
- Confirm that credentials, local configuration and test results are excluded.

Prerelease versions from a pull request should follow the repository's agreed
format, for example x.y.z-RDM-xxx-prerelease.


Troubleshooting
---------------

Dependencies do not install

- Check the Node.js version against .nvmrc and package.json.
- Run corepack enable.
- Use yarn install --immutable in a regular checkout.
- If a Git worktree prevents an install hook from running, use
  yarn install --immutable --mode=skip-build as a temporary dependency-linking
  workaround, then run the explicit lint, typecheck, browser and package
  checks. This workaround does not prove that install hooks work normally.

The library build fails

- Run yarn generate:condition-parser.
- Check the generated parser file is not being edited manually.
- Remove generated temporary output with yarn clean:tmp and rebuild.
- Check Angular, TypeScript and peer dependency versions.

Consumer cannot resolve the package

- Rebuild the library with yarn build.
- Confirm that the consumer is resolving the intended dist/ or package
  version.
- Check Angular and peer dependency compatibility.
- Prefer the packaged-consumer smoke test over manual copying of dist/.

Playwright cannot start

- Install Chromium with yarn playwright install chromium --only-shell.
- Check that ports 4300 and 4301 are free.
- Run yarn test:playwright:typecheck.
- Run the scenario with --list to confirm that it is selected.
- Retain the failing trace and screenshot before starting another run, because
  subsequent commands may overwrite the test-results directory.

Reports are missing

- Check playwright_tests/test-results/ and playwright_tests/odhin-report/.
- Run the explicit reporter checks.
- If a run is interrupted before Odhín creates its report, use the repository
  report helper and record that the report was generated as unavailable.


UK English and user-facing text
--------------------------------

Use UK English in documentation, test descriptions and user-facing examples.
Preferred spellings include:

    organisation / organisations
    authorise / authorisation
    behaviour
    centre
    colour
    customise / customisation
    licence (noun) / license (verb)
    analyse / analysed
    catalogue
    prioritise

Keep API names, package names, TypeScript identifiers, test tags and external
service names unchanged where their spelling is part of a technical contract.


Licence
-------

This project is licensed under the MIT Licence. See LICENSE.md for the full
licence text.
