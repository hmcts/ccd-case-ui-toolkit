/* global require */

const odhinModule = require('odhin-reports-playwright');
const { createEmptyFeatureStat, deriveFeatureName, enhanceGeneratedReport } = require('./odhin-report-enhancer.cjs');

const OdhinReporter = odhinModule.default ?? odhinModule;

// Group by the tested domain, not by a positive/negative suite's description.
const featureNames = {
  'address-document-lifecycle': 'Address and document lifecycle',
  'address-lookup': 'Address and document lifecycle',
  'advanced-fields': 'Advanced fields',
  'callback-error': 'Callback handling',
  'case-edit-form': 'Case edit form',
  'case-file-media': 'Case File Viewer',
  'case-file-search': 'Case File Viewer',
  'case-file-states': 'Case File Viewer',
  'case-file-viewer': 'Case File Viewer',
  'case-flags-workflow': 'Case Flags',
  'flag-writer': 'Case Flags',
  'case-notifier': 'Case notifier',
  'collection-field': 'Collection fields',
  'date-input': 'Date fields',
  'date-time-input': 'Date and time fields',
  'field-form': 'Field form controls',
  'identity-controls': 'Identity controls',
  'reference-identity': 'Identity controls',
  'launcher-mini-apps': 'Component launchers',
  'linked-case-writer': 'Linked Cases',
  'linked-cases-workflow': 'Linked Cases',
  'mandatory-fields': 'Mandatory fields',
  'money-field': 'Money fields',
  'palette-dispatch': 'Field dispatch',
  'public-field-routing': 'Field dispatch',
  'payment-contract': 'Payment components',
  'viewer-payment': 'Payment components',
  'query-management-workflow': 'Query Management',
  'query-writer': 'Query Management',
  'structured-fields': 'Structured fields'
};

function featureFor(test) {
  const stem = deriveFeatureName(test.location?.file);
  return featureNames[stem] ?? stem.replace(/[-_]/g, ' ').replace(/^./, letter => letter.toUpperCase());
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
