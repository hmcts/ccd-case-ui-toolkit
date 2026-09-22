/* global process, require */

const fs = require('node:fs');
const path = require('node:path');
const odhinModule = require('odhin-reports-playwright');

const OdhinReporter = odhinModule.default ?? odhinModule;

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const percentage = (value, total) => (total ? ((value / total) * 100).toFixed(2) : '0.00');

const duration = (milliseconds) => {
  const safe = Math.max(0, Math.round(Number(milliseconds) || 0));
  const hours = Math.floor(safe / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s ${safe % 1000}ms`;
};

const featureFor = (test) => {
  const titles = typeof test.titlePath === 'function' ? test.titlePath() : [];
  return titles.length > 1 ? titles[titles.length - 2] : test.title || 'Uncategorised';
};

const finalStatus = (result, test) => result.status === 'passed' && result.retry > 0 && result.retry === test.retries
  ? 'flaky'
  : result.status;

const row = (feature, total) => `<tr>
  <td class="text-start text-secondary-emphasis" style="border-left: 8px solid ${feature.color};">${escapeHtml(feature.name)}</td>
  <td class="text-secondary-emphasis">${feature.tests}</td>
  <td class="text-secondary-emphasis">${duration(feature.durationMs)}</td>
  <td class="result-status-passed">${feature.passed} (<i>${percentage(feature.passed, feature.tests)}%</i>)</td>
  <td class="result-status-failed">${feature.failed} (<i>${percentage(feature.failed, feature.tests)}%</i>)</td>
  <td class="result-status-timedOut">${feature.timedOut} (<i>${percentage(feature.timedOut, feature.tests)}%</i>)</td>
  <td class="result-status-skipped">${feature.skipped} (<i>${percentage(feature.skipped, feature.tests)}%</i>)</td>
  <td class="result-status-interrupted">${feature.interrupted} (<i>${percentage(feature.interrupted, feature.tests)}%</i>)</td>
  <td class="result-status-flaky">${feature.flaky} (<i>${percentage(feature.flaky, feature.tests)}%</i>)</td>
  <td class="text-secondary-emphasis">${percentage(feature.tests, total)}%</td>
</tr>`;

const featureOverview = (features) => {
  const total = features.reduce((sum, feature) => sum + feature.tests, 0);
  const largest = features[0];
  const rows = features.map((feature) => row(feature, total)).join('');

  return `<div class="mt-3 mb-3 odhin-thin-border dashboard-block" id="odhin-feature-summary">
  <div class="info-box-header">Feature Overview</div>
  <div class="odhin-table"><div style="overflow-x:auto">
    <table class="table table-sm mb-0">
      <thead><tr>
        <th class="odhin-text-2">Feature</th><th class="odhin-text-2">Tests</th><th class="odhin-text-2">Execution Time</th>
        <th class="odhin-text-2">Passed</th><th class="odhin-text-2">Failed</th><th class="odhin-text-2">Timed Out</th>
        <th class="odhin-text-2">Skipped</th><th class="odhin-text-2">Interrupted</th><th class="odhin-text-2">Flaky</th><th class="odhin-text-2">Percentage</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div></div>
  <div class="p-3 text-secondary-emphasis">${total} tests across ${features.length} features. Largest feature: <strong>${escapeHtml(largest.name)}</strong> (${largest.tests}, ${percentage(largest.tests, total)}%).</div>
</div>`;
};

class OdhinFeatureReporter {
  constructor(options = {}) {
    this.options = options;
    this.inner = new OdhinReporter(options);
    this.results = new Map();
  }

  async onBegin(config, suite) {
    return this.inner.onBegin?.(config, suite);
  }

  async onTestEnd(test, result) {
    this.results.set(test.id, { test, result: { ...result } });
    return this.inner.onTestEnd?.(test, result);
  }

  async onEnd(result) {
    await this.inner.onEnd?.(result);
    this.enhanceReport();
  }

  onStdOut(chunk, test, result) {
    return this.inner.onStdOut?.(chunk, test, result);
  }

  onStdErr(chunk, test, result) {
    return this.inner.onStdErr?.(chunk, test, result);
  }

  enhanceReport() {
    const features = new Map();
    for (const { test, result } of this.results.values()) {
      const name = featureFor(test);
      const current = features.get(name) ?? {
        name, tests: 0, durationMs: 0, passed: 0, failed: 0, timedOut: 0, skipped: 0, interrupted: 0, flaky: 0,
        color: `hsl(${[...name].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0) % 360} 68% 52%)`
      };
      const status = finalStatus(result, test);
      current.tests += 1;
      current.durationMs += result.duration || 0;
      if (Object.prototype.hasOwnProperty.call(current, status)) current[status] += 1;
      features.set(name, current);
    }

    const ordered = [...features.values()].sort((left, right) => right.tests - left.tests || left.name.localeCompare(right.name));
    if (!ordered.length || !this.options.outputFolder || !fs.existsSync(this.options.outputFolder)) return;

    for (const filename of fs.readdirSync(this.options.outputFolder).filter((name) => name.endsWith('.html'))) {
      const file = path.join(this.options.outputFolder, filename);
      const html = fs.readFileSync(file, 'utf8');
      if (html.includes('id="odhin-feature-summary"')) continue;
      const marker = /(<div class="col-12[^>]*>\s*<div class="mt-3 mb-3 odhin-thin-border dashboard-block">\s*<div class="info-box-header">\s*Files Summary)/;
      if (marker.test(html)) fs.writeFileSync(file, html.replace(marker, `${featureOverview(ordered)}\n$1`), 'utf8');
    }
  }
}

module.exports = OdhinFeatureReporter;
