const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const minimist = require('minimist');

var screenShotUtils = require("protractor-screenshot-utils").ProtractorScreenShotUtils;
const MockApp = require('../nodeMock/app');
const customReporter = require('../support/reportLogger'); 
// const BrowserUtil = require('.././../ngIntegration/util/browserUtil');
chai.use(chaiAsPromised);

const argv = minimist(process.argv.slice(2));
const isParallelExecution = argv.parallel ? argv.parallel === "true" : true;

const jenkinsConfig = [

    {
        browserName: 'chrome',
        acceptInsecureCerts: true,
        nogui: true,
        chromeOptions: { args: [argv.head && argv.head === 'true' ? '--head' : '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-zygote ', '--disableChecks'] }
    }
];

const localConfig = [
    {

        browserName: 'chrome',
        acceptInsecureCerts: true,
        chromeOptions: { args: [argv.head && argv.head === 'true' ? '--head' : '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-zygote '] },
        proxy: {
            proxyType: 'manual',
            httpProxy: 'proxyout.reform.hmcts.net:8080',
            sslProxy: 'proxyout.reform.hmcts.net:8080',
            noProxy: 'localhost:3000'
        }
    }
];


if (isParallelExecution) {
    jenkinsConfig[0].shardTestFiles = true;
    jenkinsConfig[0].maxInstances = 4;
}
const cap = (argv.local) ? localConfig : jenkinsConfig;

const config = {
    SELENIUM_PROMISE_MANAGER: false,
    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),
    specs: ['../features/**/*.feature'],
    baseUrl: process.env.TEST_URL || 'http://localhost:4200/',
    params: {
        serverUrls: process.env.TEST_URL || 'http://localhost:4200/',
        targetEnv: argv.env || 'local',
        

    },
    directConnect: true,
    // seleniumAddress: 'http://localhost:4444/wd/hub',
    getPageTimeout: 120000,
    allScriptsTimeout: 500000,
    multiCapabilities: cap,

    beforeLaunch() {
        if (isParallelExecution) {
            MockApp.setServerPort(8080);
            MockApp.init();
            MockApp.startServer();
        }
    },
    onPrepare() {
        browser.waitForAngularEnabled(false);
        global.expect = chai.expect;
        global.assert = chai.assert;
        global.should = chai.should;

        if (isParallelExecution) {
            MockApp.getNextAvailableClientPort().then(res => {
                MockApp.setServerPort(res.data.port);
                MockApp.init();

            });
        } else {
            MockApp.setServerPort(8080);
            MockApp.setLogMessageCallback(customReporter.AddMessage);
        }
        MockApp.setLogMessageCallback(customReporter.AddJson);

        global.screenShotUtils = new screenShotUtils({
            browserInstance: browser
        });
        browser.get(config.baseUrl);
    },

    cucumberOpts: {
        strict: true,
        // format: ['node_modules/cucumber-pretty'],
        format: ['node_modules/cucumber-pretty', 'json:reports/tests/json/results.json'],
        tags: argv.tags ? argv.tags.split(',') : ['@all'],
        require: [
            '../support/timeout.js',
            '../support/hooks.js',
            '../support/world.js',
            '../support/*.js',
            '../step_definitions/*.steps.js'
        ]
    },

    plugins: [
        {
            package: 'protractor-multiple-cucumber-html-reporter-plugin',
            options: {
                automaticallyGenerateReport: true,
                removeExistingJsonReportFile: true,
                reportName: 'XUI Manage Cases Functional Tests',
                // openReportInBrowser: true,
                jsonDir: 'reports/tests/functional',
                reportPath: 'reports/tests/functional',
                displayDuration: true,
                durationInMS: false
            }
        }
    ]


};


exports.config = config;
