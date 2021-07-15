const reporter = require('cucumberjs-allure-reporter');
const fs = require('fs');
const mkdirp = require('mkdirp');

const xmlReports = `${process.cwd()}/reports/xml`;

reporter.config({ targetDir: xmlReports });

module.exports = reporter;
