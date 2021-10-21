'use strict';
const Cucumber = require('cucumber');
const { defineSupportCode } = require('cucumber');
const fs = require('fs');

const CucumberReportLog = require("./reportLogger");
const MockApp = require('../nodeMock/app');
const browserWaits = require('./customWaits');
const minimist = require('minimist');


defineSupportCode(({ Before,After }) => {
    Before( async function (scenario) {
        global.scenarioData = {};
        const world = this;

        const scenarioServerPort = MockApp.serverPort;
        MockApp.init();
        await MockApp.startServer();
        CucumberReportLog.setScenarioWorld(this);

        await browser.driver.get('http://localhost:4200');
        await browser.manage().addCookie({ name: 'scenarioMockPort', value: scenarioServerPort + "", domain: 'localhost:4200' });

    });

    After(async function(scenario) {
        
        const argv = minimist(process.argv.slice(2));
        if (argv.dev){
            await browserWaits.waitForSeconds(30*60);
        }
        await MockApp.stopServer();
        
        CucumberReportLog.AddMessage("scenario completed with status : " + scenario.result.status);
        const world = this;
        try{
            await CucumberReportLog.AddScreenshot(global.screenShotUtils);
            if (scenario.result.status === 'failed') {
                let browserLog = await browser.manage().logs().get('browser');
                let browserErrorLogs = []
                for (let browserLogCounter = 0; browserLogCounter < browserLog.length; browserLogCounter++) {
                    if (browserLog[browserLogCounter].level.value > 900) {
                        browserErrorLogs.push(browserLog[browserLogCounter]);
                    }
                }
                CucumberReportLog.AddJson(browserErrorLogs);
            } else {
                await browser.manage().logs().get('browser');
                await CucumberReportLog.AddMessage("Cleared browser logs after successful scenario.");
                await CucumberReportLog.AddScreenshot(global.screenShotUtils);

            }
        }catch(err) {
            CucumberReportLog.AddMessage("Error in hooks with browserlogs or screenshots. See error details : " + err);
        }
        
    });
});
