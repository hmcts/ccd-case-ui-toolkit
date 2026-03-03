# Release Notes

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
