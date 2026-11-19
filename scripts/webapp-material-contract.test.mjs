import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// CME-1008 migrates the toolkit to the Material 22 stack; the datetime picker still declares Angular 20 peers.
test('published toolkit preserves the WebApp Material and datetime peer contract', () => {
  const { peerDependencies: peers } = JSON.parse(readFileSync(
    new URL('../projects/ccd-case-ui-toolkit/package.json', import.meta.url), 'utf8'));
  assert.equal(peers['@angular/material'], '^22.3.0');
  assert.equal(peers['@angular/cdk'], '^22.3.0');
  assert.equal(peers['@angular-material-components/datetime-picker'], undefined);
  assert.equal(peers['@angular-material-components/moment-adapter'], undefined);
  assert.equal(peers['@ngxmc/datetime-picker'], '20.1.0');
  assert.equal(peers['@angular/material-moment-adapter'], '^22.3.0');
});
