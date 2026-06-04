#!/bin/bash

yarn test:audit & pid1=$!
yarn lint & pid2=$!

wait $pid1; status1=$?
wait $pid2; status2=$?

failed=""
if [ $status1 -ne 0 ]; then
  failed="$failed test:audit"
fi
if [ $status2 -ne 0 ]; then
  failed="$failed lint"
fi

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

if [ -n "$failed" ]; then
  printf "=============================================================\n" >&2
  printf "The following commands failed:$failed\n" >&2
  if [ $status1 -ne 0 ]; then
    printf "\n" >&2
    printf "There are unsuppressed vulnerabilities, update yarn-audit-known-issues and commit it.\n" >&2
    printf "\n" >&2
  fi
  printf "=============================================================\n" >&2
  exit 1
fi
