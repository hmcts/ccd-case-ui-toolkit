import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = new URL('..', import.meta.url);
const coverage = readFileSync(new URL('playwright_tests/COVERAGE.md', root), 'utf8');
const testsDir = new URL('playwright_tests/tests', root);

const specFiles = readdirSync(testsDir)
  .filter((file) => file.endsWith('.spec.ts'))
  .sort();

test('every Playwright spec is classified in the browser coverage inventory', () => {
  const missing = specFiles.filter((file) =>
    !coverage.includes(`playwright_tests/tests/${file}`) && !coverage.includes(`\`${file}\``));
  assert.deepEqual(missing, []);
});

test('coverage inventory keeps unresolved external boundaries explicit', () => {
  for (const expected of [
    'Known organisation-search limitation',
    'Known payment dependency failure boundary',
    'yarn test:packaged-consumer',
    'Consumer-owned: DM Store persistence, authorization and scanning'
  ]) {
    assert.match(coverage, new RegExp(escapeRegExp(expected)));
  }
});

test('coverage inventory does not expose spec-file suffixes as feature labels', () => {
  const mainTable = coverage.split('## Additional browser contracts')[0];
  const featureRows = mainTable
    .split('\n')
    .filter((line) => line.startsWith('| ') && !line.includes('Executable specs') && !line.includes('---'));
  const badLabels = featureRows.filter((line) => line.split('|')[1]?.includes('.spec'));
  assert.deepEqual(badLabels, []);
});

test('new source-host specs keep positive and negative coverage visible where practical', () => {
  const deliberateOneSidedSpecs = new Set([
    'address-lookup',
    'callback-error',
    'case-file-media',
    'case-file-search',
    'case-file-viewer',
    'identity-controls',
    'viewer-payment'
  ]);
  const stems = new Map();
  for (const file of specFiles) {
    const match = file.match(/^(.*)\.(positive|negative)\.spec\.ts$/);
    if (!match) {
      continue;
    }
    const [, stem, polarity] = match;
    stems.set(stem, new Set([...(stems.get(stem) ?? []), polarity]));
  }
  const oneSided = [...stems]
    .filter(([stem, polarities]) => polarities.size === 1 && !deliberateOneSidedSpecs.has(stem))
    .map(([stem]) => stem);
  assert.deepEqual(oneSided, []);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
