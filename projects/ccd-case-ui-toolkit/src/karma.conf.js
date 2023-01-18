// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage'),
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      client: {
        jasmine:{
          random: false,
        },
        clearContext: false, // leave Jasmine Spec Runner output visible in browser
      },
      jasmineHtmlReporter: {
        suppressAll: true // removes the duplicated traces
      },
      coverageReporter: {
        dir: require('path').join(__dirname, '../../../coverage/ccd-case-ui-toolkit'),
        subdir: '.',
        reporters: [
          { type: 'html', subdir: 'html-report' },
          { type: 'lcov', subdir: 'lcov-report' }
        ],
        fixWebpackSourcePaths: true
      },
      defaultTimeoutInterval: 60000,
      browserNoActivityTimeout: 60000,
      browserDisconnectTimeout: 60000,
      reporters: ['progress', 'coverage'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['ChromeHeadless'],
      customLaunchers: {
        ChromeHeadlessCI: {
          base: 'ChromeHeadless',
          flags: ['--no-sandbox']
        }
      },
      singleRun: true,
      restartOnFileChange: true
    });
  };
  