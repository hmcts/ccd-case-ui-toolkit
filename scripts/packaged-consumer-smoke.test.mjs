import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { retainConsumerEvidence } from './packaged-consumer-smoke.mjs';

const root = mkdtempSync(join(tmpdir(), 'consumer-evidence-contract-'));
try {
  const consumer = join(root, 'consumer');
  const evidence = join(root, 'retained');
  mkdirSync(join(consumer, 'test-results', 'failed-case'), { recursive: true });
  mkdirSync(join(consumer, 'playwright-report'), { recursive: true });
  for (const file of ['failed-case/trace.zip', 'failed-case/test-failed-1.png', 'junit.xml', 'failed-case/video.webm']) {
    writeFileSync(join(consumer, 'test-results', file), file);
  }
  writeFileSync(join(consumer, 'playwright-report/index.html'), 'failed report');
  retainConsumerEvidence(consumer, evidence);
  rmSync(consumer, { recursive: true });
  assert.equal(readFileSync(join(evidence, 'test-results/failed-case/trace.zip'), 'utf8'), 'failed-case/trace.zip');
  assert.ok(existsSync(join(evidence, 'test-results/failed-case/test-failed-1.png')));
  assert.ok(existsSync(join(evidence, 'test-results/junit.xml')));
  assert.equal(readFileSync(join(evidence, 'playwright-report/index.html'), 'utf8'), 'failed report');
  assert.equal(existsSync(join(evidence, 'test-results/failed-case/video.webm')), false);
  retainConsumerEvidence(consumer, evidence); // A pre-browser failure has no directories to copy.
} finally {
  rmSync(root, { recursive: true, force: true });
}
