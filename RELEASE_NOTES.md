# Release Notes

## Dependency Usage Review - 2026-03-12

### Background
Reviewed package usage across the repo to align dependencies with actual runtime/test usage.

### Changes
- Removed unused dependencies:
  - `@angular/localize`
  - `@angular/upgrade`
  - `braces`
  - `mem`
- Restored runtime dependencies required by toolchain:
  - `file-saver` (required by `@hmcts/ccpay-web-component`)
  - `ngx-chips` (required by `@hmcts/media-viewer`)
- Kept in `dependencies` (runtime usage or consumer expectation):
  - `@ngrx/effects`
  - `@ngrx/store`
  - `moment-timezone`
  - `govuk-elements-sass`
  - `govuk-frontend`
  - `prism` (storybook styling)

## Dependency Usage Review - 2026-03-03

### Background
Reviewed package usage across the repo to identify dependencies no longer referenced, to reduce maintenance overhead.

### Scope
- `package.json`
- `projects/ccd-case-ui-toolkit/package.json`

### Findings
Removed unused direct dependencies from `package.json`.

### Packages Removed
- enhanced-resolve
- minimist
- prismjs
- yargs
- yargs-parser
