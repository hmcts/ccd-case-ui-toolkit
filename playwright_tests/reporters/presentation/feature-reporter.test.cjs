const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const enhancer = require('../odhin-report-enhancer.cjs');

test('reporter aggregates polarities by feature without losing statuses or test metadata', async () => {
  let generated;
  const sandbox = {
    module: { exports: {} },
    require(name) {
      if (name === 'odhin-reports-playwright') return class {};
      if (name === './odhin-report-enhancer.cjs') return {
        ...enhancer,
        enhanceGeneratedReport: (folder, features, metadata) => { generated = { folder, features, metadata }; }
      };
      throw new Error(`Unexpected module: ${name}`);
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../odhin-feature-reporter.cjs'), 'utf8'), sandbox);
  const reporter = new sandbox.module.exports({ outputFolder: 'report' });
  const cases = [
    ['flag-writer.positive.spec.ts', 'Case Flags write steps', 'passed', 0, 'Case Flags'],
    ['flag-writer.negative.spec.ts', 'Case Flags write restrictions', 'failed', 0, 'Case Flags'],
    ['query-writer.positive.spec.ts', 'Query Management emitted data', 'passed', 1, 'Query Management'],
    ['query-writer.negative.spec.ts', 'Query Management input errors', 'timedOut', 0, 'Query Management'],
    ['new-control.positive.spec.ts', 'Happy journey', 'skipped', 0, 'New control'],
    ['new-control.negative.spec.ts', 'Validation journey', 'interrupted', 0, 'New control']
  ];
  for (const [id, suite, status, retry] of cases) {
    await reporter.onTestEnd({ id, title: 'Scenario', location: { file: `/repo/playwright_tests/tests/${id}` },
      titlePath: () => ['', 'chromium', id, suite, 'Scenario'], tags: ['@contract'] },
    { status, retry, duration: 100 });
  }
  await reporter.onEnd({ status: 'failed' });
  assert.equal(generated.folder, 'report');
  assert.equal(generated.features.length, 3);
  for (const feature of generated.features) {
    assert.equal(feature.totalTests, 2);
    assert.equal(feature.durationMs, 200);
  }
  const byName = Object.fromEntries(generated.features.map(feature => [feature.name, feature]));
  assert.equal(byName['Case Flags'].passed, 1);
  assert.equal(byName['Case Flags'].failed, 1);
  assert.equal(byName['Query Management'].flaky, 1);
  assert.equal(byName['Query Management'].timedOut, 1);
  assert.equal(byName['New control'].skipped, 1);
  assert.equal(byName['New control'].interrupted, 1);
  cases.forEach(([id, , , retry, feature], index) => {
    assert.equal(generated.metadata[index].target, `#${id}-${retry}`);
    assert.equal(generated.metadata[index].feature, feature);
    assert.equal(generated.metadata[index].tags[0], '@contract');
  });
});
