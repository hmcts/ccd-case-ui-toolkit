#!/bin/bash

# Define the file paths
upToDateVulnerabilities=$(mktemp)
vulnerabilitiesInRepo="./yarn-audit-known-issues"

# Run yarn npm audit and save the output to upToDateVulnerabilities
yarn npm audit --recursive --environment production --json > "$upToDateVulnerabilities"

# Check if both files exist
if [[ ! -f "$upToDateVulnerabilities" ]]; then
  echo "File $upToDateVulnerabilities does not exist."
  exit 1
fi

if [[ ! -f "$vulnerabilitiesInRepo" ]]; then
  echo "File $vulnerabilitiesInRepo does not exist."
  exit 1
fi

# Compare the files and output the differences
diff_output=$(diff "$upToDateVulnerabilities" "$vulnerabilitiesInRepo")

if [[ -n "$diff_output" ]]; then
  echo
  echo "Security vulnerabilities were found that were not ignored"
  echo
  echo "Check to see if these vulnerabilities apply to production"
  echo "and/or if they have fixes available. If they do not have"
  echo "fixes and they do not apply to production, you may ignore them"
  echo
  echo "To ignore these vulnerabilities, run:"
  echo 'yarn npm audit --recursive --environment production --json > yarn-audit-known-issues'
  echo
  echo "$diff_output"
  
  exit 1
else
  echo "All vulnerabilities are suppressed."
fi

# Clean up the temporary file
rm "$upToDateVulnerabilities"
