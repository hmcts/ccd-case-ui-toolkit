import assert from 'node:assert/strict';
import test from 'node:test';
import { isPeerResolutionError } from './packaged-consumer-smoke.mjs';

test('recognises npm peer-resolution failures only', () => {
  assert.equal(isPeerResolutionError({ stderr: 'npm error code ERESOLVE\nnpm error ERESOLVE unable to resolve dependency tree' }), true);
  assert.equal(isPeerResolutionError({ stderr: 'npm error code ENETUNREACH' }), false);
});
