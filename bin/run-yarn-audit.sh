#!/bin/bash

upToDateVulnerabilities=$(mktemp)
vulnerabilitiesInRepo="./yarn-audit-known-issues"

yarn npm audit --recursive --environment production --json > "$upToDateVulnerabilities"

# Ensure both files exist
if [[ ! -f "$upToDateVulnerabilities" || ! -f "$vulnerabilitiesInRepo" ]]; then
  echo "Error: One or both required files do not exist."
  rm -f "$upToDateVulnerabilities" 
  exit 1
fi

# Compare the files and act based on the result
if diff_output=$(diff "$upToDateVulnerabilities" "$vulnerabilitiesInRepo"); then
  echo "No differences found in vulnerabilities."
else
  echo
  echo "Security vulnerability differences were found"
  echo
  echo "To ignore these vulnerabilities, run:"
  echo 'yarn npm audit --recursive --environment production --json > yarn-audit-known-issues'
  echo
  exit 1
fi

rm -f "$upToDateVulnerabilities"
