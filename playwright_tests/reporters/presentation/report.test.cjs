const assert = require('node:assert/strict');
const { parse } = require('node-html-parser');
const { deriveFeatureName, enhanceDashboardHtml, createEmptyFeatureStat } = require('../odhin-report-enhancer.cjs');

assert.equal(deriveFeatureName('/repo/playwright_tests/tests/advanced-fields.positive.spec.ts'), 'advanced-fields');
assert.equal(deriveFeatureName('/repo/playwright_tests/tests/advanced-fields.negative.spec.ts'), 'advanced-fields');

const html = `<html><head><meta name="viewport" content="user-scalable=no"></head><body>
<div class="tab"></div><div id="TabDashboard"><div><div class="row">
<div><div class="odhin-thin-border dashboard-block"><div class="info-box-header">Files Summary</div></div></div>
</div></div></div>
<table id="test-list-table"><thead><tr><th>Title</th></tr></thead><tbody>
<tr data-bs-target="#same-title-a-0"><td>Repeated title</td></tr>
<tr data-bs-target="#same-title-b-1"><td>Repeated title</td></tr>
</tbody><tfoot><tr><th>Title</th></tr></tfoot></table>
</body></html>`;
const features = [{ ...createEmptyFeatureStat('Feature <A>'), totalTests: 1, passed: 1 }];
const metadata = [
  { target: '#same-title-a-0', feature: 'Feature <A>', tags: ['@smoke'], durationMs: 500, retry: 0 },
  { target: '#same-title-b-1', feature: 'Feature B', tags: ['<img src=x onerror=alert(1)>'], durationMs: 1500, retry: 1 }
];
const report = parse(enhanceDashboardHtml(html, features, ['perfetto.json'], '../test-results', metadata));
assert.ok(report.querySelector('#odhin-feature-summary'), 'Feature Overview must survive');
assert.ok(report.querySelector('#TabPerfetto'), 'Perfetto must survive');
assert.equal(report.querySelector('#TabPerfetto a').getAttribute('download'), 'perfetto.json');
assert.ok(report.querySelector('#TabPerfetto .perfetto-open'));
assert.ok(report.querySelector('#toolkit-report-theme'));
assert.ok(report.querySelector('#toolkit-report-ui'));
assert.equal(report.querySelector('meta[name="viewport"]').getAttribute('content'), 'width=device-width, initial-scale=1');
const rows = report.querySelectorAll('#test-list-table tbody tr');
assert.equal(rows[0].querySelectorAll('td')[1].text, 'Feature <A>');
assert.equal(rows[1].querySelectorAll('td')[1].text, 'Feature B', 'Duplicate titles must not merge metadata');
assert.equal(rows[1].querySelectorAll('td')[3].text, '2');
assert.equal(rows[1].getAttribute('data-duration-ms'), '1500');
assert.equal(report.querySelectorAll('img').length, 0, 'Metadata must be escaped');
assert.equal(report.querySelectorAll('#test-list-table thead th').length, report.querySelectorAll('#test-list-table tfoot th').length);
const empty = parse(enhanceDashboardHtml(html, []));
assert.ok(empty.querySelector('#toolkit-report-ui'), 'Empty runs retain the presentation');
console.log('Report generation checks passed: features, Perfetto, duplicate titles, retry metadata, escaping and empty runs.');

// Jenkins serves published HTML on its resource domain, separate from BUILD_URL.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { enhanceGeneratedReport } = require('../odhin-report-enhancer.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-perfetto-publication-'));
const previousBuildUrl = process.env.BUILD_URL;
process.env.BUILD_URL = 'https://build.example/job/toolkit/2/';
try {
  for (const nested of [false, true]) {
    const base = path.join(root, nested ? 'nested' : 'sibling');
    const output = path.join(base, 'odhin-report');
    const results = path.join(nested ? output : base, 'test-results');
    fs.mkdirSync(output, { recursive: true });
    fs.mkdirSync(results, { recursive: true });
    fs.writeFileSync(path.join(output, 'index.html'), html);
    const files = ['perfetto.json', 'perfetto-worker 1.json'];
    const bytes = Buffer.from('{"traceEvents":[{"name":"synthetic","ph":"X","ts":0,"dur":1,"pid":1,"tid":1}]}');
    files.forEach(name => fs.writeFileSync(path.join(results, name), bytes));
    enhanceGeneratedReport(output, features);
    enhanceGeneratedReport(output, features);
    const published = parse(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
    const links = published.querySelectorAll('#TabPerfetto a[download]');
    assert.equal(links.length, files.length);
    links.forEach(link => {
      const name = link.getAttribute('download');
      assert.equal(link.getAttribute('href'), `perfetto/${encodeURIComponent(name)}`);
      assert.deepEqual(fs.readFileSync(path.join(output, 'perfetto', name)), bytes);
      assert.deepEqual(fs.readFileSync(path.join(results, name)), bytes, 'Original artifact remains available');
      const resolved = new URL(link.getAttribute('href'), 'https://static-build.example/static-files/scoped-report/index.html');
      assert.equal(resolved.origin, 'https://static-build.example');
      assert.ok(resolved.pathname.startsWith('/static-files/scoped-report/perfetto/'));
    });
  }
} finally {
  if (previousBuildUrl === undefined) delete process.env.BUILD_URL;
  else process.env.BUILD_URL = previousBuildUrl;
  fs.rmSync(root, { recursive: true, force: true });
}
console.log('Perfetto publication checks passed: report-local bytes, resource-domain URLs, nested output and repeat generation.');
