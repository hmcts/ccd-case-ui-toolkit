import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';

const root = new URL('..', import.meta.url);
const coverage = readFileSync(new URL('playwright_tests/COVERAGE.md', root), 'utf8');
const testDir = new URL('playwright_tests/tests', root);
const specFiles = readdirSync(testDir).filter(file => file.endsWith('.spec.ts')).sort();
const matrixSpecs = [...coverage.matchAll(/`(?:playwright_tests\/tests\/)?([^`]+\.spec\.ts)`/g)].map(match => match[1]).sort();
const classifications = ['Covered:', 'Partial:', 'Consumer-owned:', 'Excluded:'];

for (const file of specFiles) {
  assert.ok(matrixSpecs.includes(file), `${file} is missing from playwright_tests/COVERAGE.md`);
}

for (const file of matrixSpecs) {
  assert.ok(specFiles.includes(file), `playwright_tests/COVERAGE.md references missing spec ${file}`);
}

const rows = coverage.split('\n').filter(line => line.startsWith('| ') && !line.startsWith('| ---'));
for (const row of rows) {
  if (!row.includes('`playwright_tests/tests/')) {
    continue;
  }
  assert.ok(
    classifications.some(classification => row.includes(classification)),
    `${basename('COVERAGE.md')} row lacks coverage classification: ${row}`
  );
}
