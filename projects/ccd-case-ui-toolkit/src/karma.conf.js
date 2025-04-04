/* eslint-disable */
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    browserConsoleLogOptions: {
      terminal: true,
      level: ""
    },
    client: {
      jasmine:{
        random: false,
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: false // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../../coverage/ccd-case-ui-toolkit'),
      subdir: '.',
      reporters: [
        { type: 'html', subdir: 'html-report' },
        { type: 'lcov', subdir: 'lcov-report' },
        { type: 'lcov' }
      ],
      fixWebpackSourcePaths: true
    },
    defaultTimeoutInterval: 60000,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 60000,
    reporters: ['spec', 'progress'],
    specReporter: {
      maxLogLines: 5,             // limit number of lines logged per test
      suppressSummary: false,      // do not print summary
      suppressErrorSummary: false, // do not print error summary
      suppressFailed: false,      // do not print information about failed tests
      suppressPassed: false,      // do not print information about passed tests
      suppressSkipped: true,      // do not print information about skipped tests
      showBrowser: true,         // print the browser for each spec
      showSpecTiming: true,      // print the time elapsed for each spec
      failFast: true,             // test would finish with error when a first fail occurs
      prefixes: {
        success: '    OK: ',      // override prefix for passed tests, default is '✓ '
        failure: 'FAILED: ',      // override prefix for failed tests, default is '✗ '
        skipped: 'SKIPPED: '      // override prefix for skipped tests, default is '- '
      }
    },
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      'karma-spec-reporter',
      'karma-coverage',
      '@angular-devkit/build-angular/plugins/karma'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    restartOnFileChange: false
  });
};
