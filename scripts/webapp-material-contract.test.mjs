import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// WebApp master 97b0e48 uses Material 16 legacy entrypoints and CDK 17.
// Update this contract only with a coordinated consumer migration.
test('published toolkit preserves the WebApp Material and datetime peer contract', () => {
  const { peerDependencies: peers } = JSON.parse(readFileSync(
    new URL('../projects/ccd-case-ui-toolkit/package.json', import.meta.url), 'utf8'));
  assert.equal(peers['@angular/material'], '^16.2.0');
  assert.equal(peers['@angular/cdk'], '17.3.5');
  assert.equal(peers['@angular-material-components/datetime-picker'], '16.0.1');
  assert.equal(peers['@angular-material-components/moment-adapter'], '16.0.1');
  assert.equal(peers['@ngxmc/datetime-picker'], undefined);
  assert.equal(peers['@angular/material-moment-adapter'], undefined);
});
