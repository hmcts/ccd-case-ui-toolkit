/* global require */

const odhinModule = require('odhin-reports-playwright');
const { createEmptyFeatureStat, deriveFeatureName, enhanceGeneratedReport } = require('./odhin-report-enhancer.cjs');

const OdhinReporter = odhinModule.default ?? odhinModule;

function featureFor(test) {
  const titles = typeof test.titlePath === 'function' ? test.titlePath() : [];
  const feature = titles.length > 1 ? titles[titles.length - 2] : test.title || 'Uncategorised';
  return /\.(?:positive|negative)\.spec\.ts$/i.test(feature)
    ? deriveFeatureName(test.location?.file ?? feature)
    : feature;
}

function statusFor(result) {
  return result.status === 'passed' && result.retry > 0
    ? 'flaky'
    : result.status;
}

class OdhinFeatureReporter {
  constructor(options = {}) {
    options = { ...options, testListColumns: ['PROJECT', 'FILE'] };
    this.options = options;
    this.inner = new OdhinReporter(options);
    this.results = new Map();
    this.testMetadata = [];
  }

  async onBegin(config, suite) {
    return this.inner.onBegin?.(config, suite);
  }

  async onTestEnd(test, result) {
    this.testMetadata.push({
      target: `#${test.id}-${result.retry}`,
      feature: featureFor(test),
      tags: test.tags ?? [],
      durationMs: result.duration || 0,
      retry: result.retry
    });
    this.results.set(test.id, { test, result: { ...result } });
    return this.inner.onTestEnd?.(test, result);
  }

  async onEnd(result) {
    await this.inner.onEnd?.(result);
    const features = new Map();
    for (const { test, result: testResult } of this.results.values()) {
      const name = featureFor(test);
      const feature = features.get(name) ?? createEmptyFeatureStat(name);
      feature.totalTests += 1;
      feature.durationMs += testResult.duration || 0;
      const status = statusFor(testResult);
      if (Object.prototype.hasOwnProperty.call(feature, status)) feature[status] += 1;
      features.set(name, feature);
    }
    enhanceGeneratedReport(this.options.outputFolder, [...features.values()], this.testMetadata);
  }

  async onExit() {
    return this.inner.onExit?.();
  }

  onStdOut(chunk, test, result) {
    return this.inner.onStdOut?.(chunk, test, result);
  }

  onStdErr(chunk, test, result) {
    return this.inner.onStdErr?.(chunk, test, result);
  }
}

module.exports = OdhinFeatureReporter;
