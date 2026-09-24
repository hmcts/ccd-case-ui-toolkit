const assert = require('node:assert/strict');
const { parse } = require('node-html-parser');
const { enhanceDashboardHtml, createEmptyFeatureStat } = require('../odhin-report-enhancer.cjs');

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
