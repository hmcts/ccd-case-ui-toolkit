#!/bin/bash

yarn lint
lint_status=$?

if [ "$lint_status" -ne 0 ]; then
  printf "=============================================================\n" >&2
  printf "The following command failed: yarn lint\n" >&2
  printf "run yarn lint command to find the lint errors and fix them, then push again.\n" >&2
  printf "=============================================================\n" >&2
  exit "$lint_status"
fi

yarn test:audit
audit_status=$?

yarn npm audit --recursive --environment production --json > yarn-audit-known-issues
cve_suppress_status=$?

if [ "$cve_suppress_status" -ne 0 ] && [ ! -s yarn-audit-known-issues ]; then
  printf "=============================================================\n" >&2
  printf "Unable to refresh yarn-audit-known-issues\n" >&2
  printf "=============================================================\n" >&2
  exit "$cve_suppress_status"
fi

if ! git diff --quiet -- yarn-audit-known-issues; then
  printf "=============================================================\n" >&2
  printf "yarn-audit-known-issues was refreshed with the latest CVE audit output.\n" >&2
  printf "Commit yarn-audit-known-issues and push again.\n" >&2
  printf "=============================================================\n" >&2
  exit 1
fi

if [ "$audit_status" -ne 0 ]; then
  printf "=============================================================\n" >&2
  printf "The following command failed: test:audit\n" >&2
  printf "\n" >&2
  printf "There are unsuppressed vulnerabilities, update yarn-audit-known-issues and commit it.\n" >&2
  printf "\n" >&2
  printf "=============================================================\n" >&2
  exit 1
fi
